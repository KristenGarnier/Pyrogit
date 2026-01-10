import { describe, expect, it, mock, beforeEach } from "bun:test";
import { GitHubChangeRequestRepository } from "../infrastructure/services/repos/github/github.adapter";
import type { Octokit } from "@octokit/rest";
import type { ChangeRequestQuery } from "../domain/change-request-query";
import { GHPullListError } from "../infrastructure/errors/GHPullListError";
import { GHPullError } from "../infrastructure/errors/GHPullError";
import { GHPullReviewsError } from "../infrastructure/errors/GHPullReviewsError";
import { NoUserError } from "../infrastructure/errors/NoUserError";

// Mock data
const mockUser = { login: "testuser" };
const mockPR = {
	number: 1,
	title: "Test PR",
	user: { login: "author" },
	base: { ref: "main" },
	head: { ref: "feature" },
	merged_at: null,
	state: "open",
	draft: false,
	updated_at: "2023-01-01T00:00:00Z",
	html_url: "https://github.com/test/repo/pull/1",
	requested_reviewers: [{ login: "testuser" }],
};
const mockReviews = [
	{
		user: { login: "reviewer1" },
		state: "APPROVED",
		submitted_at: "2023-01-01T00:00:00Z",
	},
	{
		user: { login: "testuser" },
		state: "COMMENTED",
		submitted_at: "2023-01-01T00:00:00Z",
	},
];

describe("GitHubChangeRequestRepository", () => {
	let mockOctokit: Octokit;
	let repo: GitHubChangeRequestRepository;

	beforeEach(() => {
		mockOctokit = {
			pulls: {
				list: mock(() => Promise.resolve({ data: [mockPR] })),
				get: mock(() => Promise.resolve({ data: mockPR })),
				listReviews: mock(() => Promise.resolve({ data: mockReviews })),
			},
		} as any;
		const meProvider = mock(() => Promise.resolve(mockUser));
		repo = new GitHubChangeRequestRepository(mockOctokit, meProvider);
	});

	describe("list", () => {
		it("should return change requests for open PRs", async () => {
			const query: ChangeRequestQuery = {};
			const result = await repo.list({ owner: "test", repo: "repo" }, query);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toHaveLength(1);
				expect(result.value[0]).toMatchSnapshot();
			}
		});

		it("should return error when user is not found", async () => {
			const meProvider = mock(() => Promise.resolve(null));
			repo = new GitHubChangeRequestRepository(mockOctokit, meProvider);

			const query: ChangeRequestQuery = {};
			const result = await repo.list({ owner: "test", repo: "repo" }, query);

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(NoUserError);
			}
		});

		it("should handle pulls list API errors", async () => {
			(mockOctokit as any).pulls.list = mock(() =>
				Promise.reject(new Error("API Error")),
			);

			const query: ChangeRequestQuery = {};
			const result = await repo.list({ owner: "test", repo: "repo" }, query);

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(GHPullListError);
			}
		});

		it("should handle reviews API errors", async () => {
			(mockOctokit as any).pulls.listReviews = mock(() =>
				Promise.reject(new Error("Reviews API Error")),
			);

			const query: ChangeRequestQuery = {};
			const result = await repo.list({ owner: "test", repo: "repo" }, query);

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(GHPullReviewsError);
			}
		});
	});

	describe("getById", () => {
		it("should return change request by ID", async () => {
			const result = await repo.getById({
				owner: "test",
				repo: "repo",
				number: 1,
			});

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value.id.number).toBe(1);
				expect(result.value).toMatchSnapshot();
			}
		});

		it("should return error when user is not found", async () => {
			const meProvider = mock(() => Promise.resolve(null));
			repo = new GitHubChangeRequestRepository(mockOctokit, meProvider);

			const result = await repo.getById({
				owner: "test",
				repo: "repo",
				number: 1,
			});

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(NoUserError);
			}
		});

		it("should handle pull get API errors", async () => {
			(mockOctokit as any).pulls.get = mock(() =>
				Promise.reject(new Error("API Error")),
			);

			const result = await repo.getById({
				owner: "test",
				repo: "repo",
				number: 1,
			});

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(GHPullError);
			}
		});

		it("should handle reviews API errors", async () => {
			(mockOctokit as any).pulls.listReviews = mock(() =>
				Promise.reject(new Error("Reviews API Error")),
			);

			const result = await repo.getById({
				owner: "test",
				repo: "repo",
				number: 1,
			});

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(GHPullReviewsError);
			}
		});
	});
});
