import type { Result } from "neverthrow";

export interface Storage<T> {
	read(): Promise<Result<T, Error>>;
	write(content: T): Promise<Result<boolean, Error>>;
}
