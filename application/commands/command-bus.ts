import { err } from "neverthrow";
import type { Result } from "neverthrow";
import type { Command, CommandResult } from "./command";
import type { CommandHandler } from "./command-handler";

type HandlerMap = Map<string, CommandHandler<Command<unknown>>>;

export class InMemoryCommandBus {
	private readonly handlers: HandlerMap = new Map();

	register<C extends Command<unknown>>(
		commandType: C["type"],
		handler: CommandHandler<C>,
	): void {
		this.handlers.set(commandType, handler as unknown as CommandHandler<Command<unknown>>);
	}

	execute<C extends Command<unknown>>(command: C): Promise<Result<CommandResult<C>, Error>> {
		const handler = this.handlers.get(command.type);
		if (!handler) {
			return Promise.resolve(
				err(new Error(`No command handler registered for '${command.type}'`)),
			);
		}

		return (handler as unknown as CommandHandler<C>).execute(command);
	}
}
