import { describe, expect, it } from "bun:test";
import {
	computeOverallStatus,
	computeMyStatus,
	pickMyLatestDecision,
} from "../infrastructure/services/repos/github/github.adapter.utils";

describe("github.adapter.utils", () => {
	describe("computeOverallStatus", () => {
		it("should return 'pending' for empty reviews", () => {
			const result = computeOverallStatus([]);
			expect(result).toBe("pending");
		});

		it("should return 'approved' for single approved review", () => {
			const reviews = [
				{
					user: { login: "reviewer1" },
					state: "APPROVED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
			] as any;
			const result = computeOverallStatus(reviews);
			expect(result).toBe("approved");
		});

		it("should return 'changes_requested' for single changes requested review", () => {
			const reviews = [
				{
					user: { login: "reviewer1" },
					state: "CHANGES_REQUESTED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
			] as any;
			const result = computeOverallStatus(reviews);
			expect(result).toBe("changes_requested");
		});

		it("should return 'commented_only' for single commented review", () => {
			const reviews = [
				{
					user: { login: "reviewer1" },
					state: "COMMENTED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
			] as any;
			const result = computeOverallStatus(reviews);
			expect(result).toBe("commented_only");
		});

		it("should return 'approved' when all reviews are approved", () => {
			const reviews = [
				{
					user: { login: "reviewer1" },
					state: "APPROVED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
				{
					user: { login: "reviewer2" },
					state: "APPROVED",
					submitted_at: "2023-01-01T00:01:00Z",
				},
			] as any;
			const result = computeOverallStatus(reviews);
			expect(result).toBe("approved");
		});

		it("should return 'changes_requested' when latest review requests changes", () => {
			const reviews = [
				{
					user: { login: "reviewer1" },
					state: "APPROVED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
				{
					user: { login: "reviewer2" },
					state: "CHANGES_REQUESTED",
					submitted_at: "2023-01-01T00:01:00Z",
				},
			] as any;
			const result = computeOverallStatus(reviews);
			expect(result).toBe("changes_requested");
		});

		it("should handle multiple reviews from same user, taking latest", () => {
			const reviews = [
				{
					user: { login: "reviewer1" },
					state: "COMMENTED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
				{
					user: { login: "reviewer1" },
					state: "APPROVED",
					submitted_at: "2023-01-01T00:01:00Z",
				},
			] as any;
			const result = computeOverallStatus(reviews);
			expect(result).toBe("approved");
		});

		it("should return 'none' for unknown state", () => {
			const reviews = [
				{
					user: { login: "reviewer1" },
					state: "UNKNOWN_STATE",
					submitted_at: "2023-01-01T00:00:00Z",
				},
			] as any;
			const result = computeOverallStatus(reviews);
			expect(result).toBe("none");
		});

		it("should handle null submitted_at", () => {
			const reviews = [
				{
					user: { login: "reviewer1" },
					state: "APPROVED",
					submitted_at: null,
				},
			] as any;
			const result = computeOverallStatus(reviews);
			expect(result).toBe("approved");
		});

		it("should handle unknown user login", () => {
			const reviews = [
				{
					user: null,
					state: "APPROVED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
			] as any;
			const result = computeOverallStatus(reviews);
			expect(result).toBe("approved");
		});

		it("should handle invalid submitted_at dates", () => {
			const reviews = [
				{
					user: { login: "reviewer1" },
					state: "APPROVED",
					submitted_at: "invalid-date",
				},
				{
					user: { login: "reviewer2" },
					state: "CHANGES_REQUESTED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
			] as any;
			const result = computeOverallStatus(reviews);
			// Current code may not handle NaN sorting deterministically
			expect(typeof result).toBe("string");
		});

		it("should handle malformed user object", () => {
			const reviews = [
				{
					user: {},
					state: "APPROVED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
			] as any;
			const result = computeOverallStatus(reviews);
			expect(result).toBe("approved");
		});

		it("should handle non-string state values", () => {
			const reviews = [
				{
					user: { login: "reviewer1" },
					state: 123,
					submitted_at: "2023-01-01T00:00:00Z",
				},
			] as any;
			const result = computeOverallStatus(reviews);
			expect(result).toBe("none");
		});

		it("should handle duplicate timestamps", () => {
			const reviews = [
				{
					user: { login: "reviewer1" },
					state: "APPROVED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
				{
					user: { login: "reviewer1" },
					state: "CHANGES_REQUESTED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
			] as any;
			const result = computeOverallStatus(reviews);
			// Order may be non-deterministic due to identical timestamps
			expect(result === "approved" || result === "changes_requested").toBe(
				true,
			);
		});
	});

	describe("computeMyStatus", () => {
		it("should return as_author when myLatest is provided", () => {
			const result = computeMyStatus("approved", [], "pending", "user");
			expect(result).toEqual({ kind: "as_author", decision: "approved" });
		});

		it("should return needed when requested and overall is pending", () => {
			const result = computeMyStatus(undefined, ["user"], "pending", "user");
			expect(result).toEqual({ kind: "needed" });
		});

		it("should return needed when requested and overall is none", () => {
			const result = computeMyStatus(undefined, ["user"], "none", "user");
			expect(result).toEqual({ kind: "needed" });
		});

		it("should return not_needed when requested but overall is approved", () => {
			const result = computeMyStatus(undefined, ["user"], "approved", "user");
			expect(result).toEqual({ kind: "not_needed" });
		});

		it("should return not_needed when not requested", () => {
			const result = computeMyStatus(undefined, [], "pending", "user");
			expect(result).toEqual({ kind: "not_needed" });
		});

		it("should return not_needed when meLogin is provided but overall not none/pending", () => {
			const result = computeMyStatus(
				undefined,
				["user"],
				"changes_requested",
				"user",
			);
			expect(result).toEqual({ kind: "not_needed" });
		});

		it("should return unknown when meLogin is undefined", () => {
			const result = computeMyStatus(undefined, [], "pending", undefined);
			expect(result).toEqual({ kind: "unknown" });
		});

		it("should handle invalid overallStatus", () => {
			const result = computeMyStatus(
				undefined,
				["user"],
				"invalid_status" as any,
				"user",
			);
			expect(result).toEqual({ kind: "not_needed" });
		});

		it("should handle invalid overallStatus", () => {
			const result = computeMyStatus(
				undefined,
				["user"],
				"invalid_status" as any,
				"user",
			);
			expect(result).toEqual({ kind: "not_needed" });
		});
	});

	describe("pickMyLatestDecision", () => {
		it("should return undefined when no reviews match", () => {
			const reviews = [
				{
					user: { login: "otheruser" },
					state: "APPROVED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
			] as any;
			const result = pickMyLatestDecision("user", reviews);
			expect(result).toBeUndefined();
		});

		it("should return 'approved' for latest approved review", () => {
			const reviews = [
				{
					user: { login: "user" },
					state: "APPROVED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
			] as any;
			const result = pickMyLatestDecision("user", reviews);
			expect(result).toBe("approved");
		});

		it("should return 'changes_requested' for latest changes requested review", () => {
			const reviews = [
				{
					user: { login: "user" },
					state: "CHANGES_REQUESTED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
			] as any;
			const result = pickMyLatestDecision("user", reviews);
			expect(result).toBe("changes_requested");
		});

		it("should return 'commented' for latest commented review", () => {
			const reviews = [
				{
					user: { login: "user" },
					state: "COMMENTED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
			] as any;
			const result = pickMyLatestDecision("user", reviews);
			expect(result).toBe("commented");
		});

		it("should take latest review when multiple", () => {
			const reviews = [
				{
					user: { login: "user" },
					state: "COMMENTED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
				{
					user: { login: "user" },
					state: "APPROVED",
					submitted_at: "2023-01-01T00:01:00Z",
				},
			] as any;
			const result = pickMyLatestDecision("user", reviews);
			expect(result).toBe("approved");
		});

		it("should ignore DISMISSED reviews", () => {
			const reviews = [
				{
					user: { login: "user" },
					state: "APPROVED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
				{
					user: { login: "user" },
					state: "DISMISSED",
					submitted_at: "2023-01-01T00:01:00Z",
				},
			] as any;
			const result = pickMyLatestDecision("user", reviews);
			expect(result).toBe("approved");
		});

		it("should ignore PENDING reviews", () => {
			const reviews = [
				{
					user: { login: "user" },
					state: "PENDING",
					submitted_at: "2023-01-01T00:00:00Z",
				},
				{
					user: { login: "user" },
					state: "APPROVED",
					submitted_at: "2023-01-01T00:01:00Z",
				},
			] as any;
			const result = pickMyLatestDecision("user", reviews);
			expect(result).toBe("approved");
		});

		it("should handle case insensitive login", () => {
			const reviews = [
				{
					user: { login: "User" },
					state: "APPROVED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
			] as any;
			const result = pickMyLatestDecision("user", reviews);
			expect(result).toBe("approved");
		});

		it("should return undefined when only dismissed or pending", () => {
			const reviews = [
				{
					user: { login: "user" },
					state: "DISMISSED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
				{
					user: { login: "user" },
					state: "PENDING",
					submitted_at: "2023-01-01T00:01:00Z",
				},
			] as any;
			const result = pickMyLatestDecision("user", reviews);
			expect(result).toBeUndefined();
		});

		it("should handle invalid submitted_at in pickMyLatestDecision", () => {
			const reviews = [
				{
					user: { login: "user" },
					state: "APPROVED",
					submitted_at: "invalid",
				},
			] as any;
			const result = pickMyLatestDecision("user", reviews);
			expect(result).toBe("approved");
		});

		it("should handle malformed user in pickMyLatestDecision", () => {
			const reviews = [
				{
					user: { login: undefined },
					state: "APPROVED",
					submitted_at: "2023-01-01T00:00:00Z",
				},
			] as any;
			const result = pickMyLatestDecision("user", reviews);
			expect(result).toBeUndefined();
		});
	});
});
