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

export type OverallStatus =
	| "approved"
	| "changes_requested"
	| "commented_only"
	| "pending"
	| "none";

export type MyReviewStatus =
	| { kind: "not_needed" }
	| { kind: "needed" }
	| { kind: "done"; decision: "approved" | "changes_requested" | "commented" }
	| { kind: "as_author"; overallStatus: OverallStatus }
	| { kind: "unknown" };

export type ChangeRequest = {
	id: ChangeRequestId;

	title: string;
	taget: string;
	branch: string;
	author: UserRef;

	state: CRState;
	isDraft: boolean;

	updatedAt: Date;
	webUrl: string;

	review: {
		hasAnyReviewActivity: boolean; // au moins une review (GitHub)
		myStatus: MyReviewStatus; // needed / done / not_needed / as_author
		overallStatus: OverallStatus; // aggregated review state
		hasComments: boolean; // if there are comments on the PR
		isMyPR: boolean; // if the current user is the PR author
	};
};
