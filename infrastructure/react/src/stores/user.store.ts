import { create } from "zustand";
import type { UserRef } from "../../../../domain/change-request";
import { currentUserService } from "../services/current-user.service";

type UserState = {
	user: UserRef | null;

	hydrate: () => Promise<void>;
	set: (user: UserRef) => void;
	reset: () => void;
};

const currentUserResult = currentUserService.get();

export const useUserStore = create<UserState>((set) => ({
	user: currentUserResult.isOk() ? currentUserResult.value : null,

	hydrate: async () => {
		const result = await currentUserService.hydrate();
		if (result.isErr()) {
			set({ user: null });
			return;
		}

		set({ user: result.value });
	},

	set: (user: UserRef) => {
		void currentUserService.set(user);
		set({ user });
	},

	reset: () => {
		void currentUserService.reset();
		set({ user: null });
	},
}));
