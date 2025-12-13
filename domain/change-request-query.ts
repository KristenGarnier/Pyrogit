export type ChangeRequestFilter = {
	state?: ("open" | "closed" | "merged")[];
	needsMyReview?: boolean;
};

export type ChangeRequestSort = "updated_desc" | "updated_asc";

export type ChangeRequestQuery = {
	filter?: ChangeRequestFilter;
	sort?: ChangeRequestSort;
	limit?: number;
};
