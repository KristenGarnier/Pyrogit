import { err, ok, type Result } from "neverthrow";
import { Command } from "../../../../application/commands/command";
import type { CommandHandler } from "../../../../application/commands/command-handler";
import type { CommandOutcome } from "../../../../application/commands/command-result";
import type { ChangeRequestService } from "../../../../application/usecases/change-request.service";
import type { GHTokenRetrievalError } from "../../../errors/GHTokenRetrievalError";

type HydratableStore = {
  hydrate: () => Promise<void>;
};

type InitDeps = {
  themeStore: HydratableStore;
  changeRequestStore: HydratableStore;
  userStore: HydratableStore;
  pyrogit: {
    init: () => Promise<Result<ChangeRequestService, GHTokenRetrievalError | Error>>;
  };
};

export const INIT_APP_COMMAND = "app.init" as const;

export type InitAppData = {
  service: ChangeRequestService;
};

export type InitAppResult = CommandOutcome<InitAppData>;

export class InitAppCommand extends Command<InitAppResult> {
  readonly type = INIT_APP_COMMAND;
}

export class InitAppCommandHandler implements CommandHandler<InitAppCommand> {
  constructor(private readonly deps: InitDeps) { }

  async execute(_command: InitAppCommand): Promise<Result<InitAppResult, Error>> {
    const [initResult] = await Promise.all([
      this.deps.pyrogit.init(),
      this.deps.themeStore.hydrate(),
      this.deps.changeRequestStore.hydrate(),
      this.deps.userStore.hydrate(),
    ]);

    if (initResult.isErr()) return err(initResult.error);

    return ok({
      data: { service: initResult.value },
      notices: [],
    });
  }
}
