import { describe, expect, it, beforeEach } from "bun:test";
import { useUserStore } from "../infrastructure/react/src/stores/user.store";

describe("useUserStore", () => {
	beforeEach(() => {
		// Reset store state before each test
		useUserStore.setState({ user: null });
	});

	it("should have initial state with user null", () => {
		const state = useUserStore.getState();

		expect(state.user).toBeNull();
	});

	it("should set user", () => {
		const mockUser = { login: "testuser", id: 123, type: "User" as const };

		useUserStore.getState().set(mockUser);

		const state = useUserStore.getState();
		expect(state.user).toEqual(mockUser);
	});

	it("should reset user to null", () => {
		const mockUser = { login: "testuser", id: 123, type: "User" as const };

		useUserStore.getState().set(mockUser);
		expect(useUserStore.getState().user).toEqual(mockUser);

		useUserStore.getState().reset();

		const state = useUserStore.getState();
		expect(state.user).toBeNull();
	});

	it("should handle multiple set/reset cycles", () => {
		const user1 = { login: "user1", id: 1, type: "User" as const };
		const user2 = { login: "user2", id: 2, type: "User" as const };

		useUserStore.getState().set(user1);
		expect(useUserStore.getState().user).toEqual(user1);

		useUserStore.getState().set(user2);
		expect(useUserStore.getState().user).toEqual(user2);

		useUserStore.getState().reset();
		expect(useUserStore.getState().user).toBeNull();
	});
});
