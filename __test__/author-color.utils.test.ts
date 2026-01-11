import { describe, expect, it } from "bun:test";
import { getAuthorColor } from "../infrastructure/react/src/utils/author-color.utils";

describe("author-color.utils", () => {
	describe("getAuthorColor", () => {
		const mockTheme = {
			primary: "#ff0000",
			secondary: "#00ff00",
		} as any;

		it("should return a valid hex color", () => {
			const result = getAuthorColor("testuser", mockTheme);
			expect(result).toMatch(/^#[0-9a-f]{6}$/);
		});

		it("should be consistent for same login and theme", () => {
			const result1 = getAuthorColor("testuser", mockTheme);
			const result2 = getAuthorColor("testuser", mockTheme);
			expect(result1).toBe(result2);
		});

		it("should differ for different logins", () => {
			const result1 = getAuthorColor("user1", mockTheme);
			const result2 = getAuthorColor("user2", mockTheme);
			expect(result1).not.toBe(result2);
		});

		it("should differ for different themes", () => {
			const theme2 = { ...mockTheme, primary: "#808080" } as any; // Grayscale, different s/l
			const result1 = getAuthorColor("testuser", mockTheme);
			const result2 = getAuthorColor("testuser", theme2);
			expect(result1).not.toBe(result2);
		});

		it("should handle empty login", () => {
			const result = getAuthorColor("", mockTheme);
			expect(result).toMatch(/^#[0-9a-f]{6}$/);
		});

		it("should handle long login", () => {
			const longLogin = "a".repeat(100);
			const result = getAuthorColor(longLogin, mockTheme);
			expect(result).toMatch(/^#[0-9a-f]{6}$/);
		});

		it("should handle special characters in login", () => {
			const result = getAuthorColor("user@#$%", mockTheme);
			expect(result).toMatch(/^#[0-9a-f]{6}$/);
		});

		it("should avoid clashes with primary color", () => {
			const result = getAuthorColor("test", mockTheme);
			// Hard to test exactly, but ensure it's not the same as primary
			expect(result).not.toBe(mockTheme.primary);
		});

		it("should cache results", () => {
			const login = "cachetest";
			const result1 = getAuthorColor(login, mockTheme);
			// Simulate by calling again, should use cache
			const result2 = getAuthorColor(login, mockTheme);
			expect(result1).toBe(result2);
		});

		it("should handle invalid theme primary", () => {
			const badTheme = { primary: "invalid", secondary: "#00ff00" } as any;
			const result = getAuthorColor("test", badTheme);
			expect(result).toMatch(/^#[0-9a-f]{6}$/);
		});
	});
});
