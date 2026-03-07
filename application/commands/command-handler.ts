import type { Result } from "neverthrow";
import type { Command, CommandResult } from "./command";

export interface CommandHandler<C extends Command<unknown>> {
	execute(command: C): Promise<Result<CommandResult<C>, Error>>;
}
