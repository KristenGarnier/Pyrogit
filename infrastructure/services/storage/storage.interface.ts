import type { ErrorValue } from "../../react/src/services/pyrogit";

export interface Storage<T> {
	read(): Promise<ErrorValue<T>>;
	write(content: T): Promise<ErrorValue<boolean>>;
}
