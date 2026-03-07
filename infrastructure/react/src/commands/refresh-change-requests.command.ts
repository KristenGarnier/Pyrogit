import { err, ok, Result, ResultAsync, type Result as NeverthrowResult } from "neverthrow";
import { Command } from "../../../../application/commands/command";
import type { CommandHandler } from "../../../../application/commands/command-handler";
import type {
	CommandNotice,
	CommandOutcome,
} from "../../../../application/commands/command-result";
import type { ChangeRequestService } from "../../../../application/usecases/change-request.service";
import type { ChangeRequest, UserRef } from "../../../../domain/change-request";

type ChangeRequestStoreDeps = {
	getPRs: () => ChangeRequest[];
	upsertPRs: (prs: ChangeRequest[]) => void;
	deletePRs: (prs: ChangeRequest[]) => void;
};

type UserStoreDeps = {
	getUser: () => UserRef | null;
	setUser: (user: UserRef) => void;
};

type Deps = {
	changeRequestStore: ChangeRequestStoreDeps;
	userStore: UserStoreDeps;
};

export const REFRESH_CHANGE_REQUESTS_COMMAND = "change-requests.refresh" as const;

export type RefreshChangeRequestsData = {
	updatedCount: number;
	closedCount: number;
	userLoaded: boolean;
};

export type RefreshChangeRequestsResult = CommandOutcome<RefreshChangeRequestsData>;

export class RefreshChangeRequestsCommand extends Command<RefreshChangeRequestsResult> {
	readonly type = REFRESH_CHANGE_REQUESTS_COMMAND;

	constructor(readonly service: ChangeRequestService) {
		super();
	}
}

export class RefreshChangeRequestsCommandHandler
	implements CommandHandler<RefreshChangeRequestsCommand>
{
	constructor(private readonly deps: Deps) {}

	async execute(
		command: RefreshChangeRequestsCommand,
	): Promise<NeverthrowResult<RefreshChangeRequestsResult, Error>> {
		const toError = (error: unknown) =>
			error instanceof Error ? error : new Error(String(error));

		const hasCachedPRsResult = Result.fromThrowable(
			() => this.deps.changeRequestStore.getPRs().length > 0,
			toError,
		)();
		if (hasCachedPRsResult.isErr()) return err(hasCachedPRsResult.error);

		const prsResult = await ResultAsync.fromPromise(
			Promise.all([
				command.service.list({}),
				hasCachedPRsResult.value ? command.service.listClosed({}) : Promise.resolve([]),
			]),
			toError,
		);
		if (prsResult.isErr()) return err(prsResult.error);

		const [updated, closed] = prsResult.value;

		const storeUpdateResult = Result.fromThrowable(() => {
			this.deps.changeRequestStore.upsertPRs(updated);
			this.deps.changeRequestStore.deletePRs(closed);
		}, toError)();
		if (storeUpdateResult.isErr()) return err(storeUpdateResult.error);

		const notices: CommandNotice[] = [];
		if (updated.length === 0) {
			notices.push({
				level: "info",
				message: "There are no pull requests to load",
			});
		} else {
			notices.push({
				level: "success",
				message: "Pull requests loaded successfully",
			});
		}

		let userLoaded = false;
		const userResult = await ResultAsync.fromPromise(command.service.getUser(), toError);
		if (userResult.isErr()) return err(userResult.error);

		const user = userResult.value;
		if (!user) {
			notices.push({
				level: "error",
				message: "Could not load user",
			});
		} else if (!this.deps.userStore.getUser()) {
			this.deps.userStore.setUser(user);
			userLoaded = true;
			notices.push({
				level: "success",
				message: "User loaded successfully",
			});
		}

		return ok({
			data: {
				updatedCount: updated.length,
				closedCount: closed.length,
				userLoaded,
			},
			notices,
		});
	}
}
