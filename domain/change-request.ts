export type UserRef = {
	login: string;
	displayName?: string;
};

export type ChangeRequestId = {
	owner: string;
	repo: string;
	number: number;
};

export type CRState = "open" | "closed" | "merged";

export type MyReviewStatus =
	| { kind: "not_needed" }
	| { kind: "needed" }
	| { kind: "done"; decision: "approved" | "changes_requested" | "commented" }
	| { kind: "unknown" };

export type ChangeRequest = {
	id: ChangeRequestId;

	title: string;
	author: UserRef;

	state: CRState;
	isDraft: boolean;

	updatedAt: Date;
	webUrl: string;

	review: {
		hasAnyReviewActivity: boolean; // au moins une review (GitHub)
		myStatus: MyReviewStatus; // needed / done / not_needed
	};
};
