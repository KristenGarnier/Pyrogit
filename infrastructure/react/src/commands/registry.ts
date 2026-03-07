import { InMemoryCommandBus } from "../../../../application/commands/command-bus";
import type { Result } from "neverthrow";
import type { ChangeRequestService } from "../../../../application/usecases/change-request.service";
import type { ChangeRequest, UserRef } from "../../../../domain/change-request";
import type { GHTokenRetrievalError } from "../../../errors/GHTokenRetrievalError";
import {
	InitAppCommandHandler,
	INIT_APP_COMMAND,
} from "./init-app.command";
import {
	RefreshChangeRequestsCommandHandler,
	REFRESH_CHANGE_REQUESTS_COMMAND,
} from "./refresh-change-requests.command";

type HydratableStore = {
	hydrate: () => Promise<void>;
};

type ChangeRequestStore = {
	prs: ChangeRequest[];
	upsertPRs: (prs: ChangeRequest[]) => void;
	deletePRs: (prs: ChangeRequest[]) => void;
};

type UserStore = {
	user: UserRef | null;
	set: (user: UserRef) => void;
};

type Deps = {
	pyrogit: {
		init: () => Promise<Result<ChangeRequestService, GHTokenRetrievalError | Error>>;
	};
	getThemeStore: () => HydratableStore;
	getChangeRequestStore: () => ChangeRequestStore & HydratableStore;
	getUserStore: () => UserStore & HydratableStore;
};

export function createAppCommandBus(deps: Deps) {
	const commandBus = new InMemoryCommandBus();

	commandBus.register(
		INIT_APP_COMMAND,
		new InitAppCommandHandler({
			themeStore: {
				hydrate: () => deps.getThemeStore().hydrate(),
			},
			changeRequestStore: {
				hydrate: () => deps.getChangeRequestStore().hydrate(),
			},
			userStore: {
				hydrate: () => deps.getUserStore().hydrate(),
			},
			pyrogit: deps.pyrogit,
		}),
	);

	commandBus.register(
		REFRESH_CHANGE_REQUESTS_COMMAND,
		new RefreshChangeRequestsCommandHandler({
			changeRequestStore: {
				getPRs: () => deps.getChangeRequestStore().prs,
				upsertPRs: (prs) => deps.getChangeRequestStore().upsertPRs(prs),
				deletePRs: (prs) => deps.getChangeRequestStore().deletePRs(prs),
			},
			userStore: {
				getUser: () => deps.getUserStore().user,
				setUser: (user) => deps.getUserStore().set(user),
			},
		}),
	);

	return commandBus;
}
