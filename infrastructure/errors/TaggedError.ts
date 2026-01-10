export type Tag = string | symbol | null;
export abstract class TaggedError extends Error {
	public _tag: Tag = null;
	public get tag(): Tag {
		return this._tag;
	}
	public set tag(tag: Tag) {
		this._tag = tag;
	}

	constructor(...args: ConstructorParameters<typeof Error>) {
		super(...args);
		this.name = this.constructor.name;
	}

	public isTag(tag: Tag) {
		return tag === this.tag;
	}
}

export function isTaggedError(error: Error | TaggedError) {
	return error instanceof TaggedError;
}
