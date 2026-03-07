export const commandResultType = Symbol("commandResultType");

export abstract class Command<TResult> {
	abstract readonly type: string;
	readonly [commandResultType]!: TResult;
}

export type CommandResult<C extends Command<unknown>> = C[typeof commandResultType];
