import path from "node:path";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserRef } from "../../../../domain/change-request";
import { FileStorage } from "../../../services/storage/file.storage";
import { AppDirectories } from "../../../services/storage/locator.storage";
import { zustandFileStorage } from "../utils/zustand-file-storage.utils";

const directory = new AppDirectories("pyrogit");
const storage = new FileStorage(path.join(directory.getPath("cache"), "user.enc"));

type UserState = {
  user: UserRef | null;

  set: (user: UserRef) => void;
  reset: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,

      set: (user: UserRef) =>
        set({
          user: user,
        }),

      reset: () =>
        set({
          user: null,
        }),
    }),
    {
      name: "user-persistor",
      storage: createJSONStorage(zustandFileStorage(storage)),
    },
  ),
);
