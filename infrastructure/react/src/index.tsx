import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer } from "@opentui/react";
import { useEffect, useState } from "react";
import type { ChangeRequestService } from "../../../application/usecases/change-request.service";
import { GH_TOKEN_ERROR } from "../../errors/GHTokenRetrievalError";
import { isTaggedError } from "../../errors/TaggedError";
import { GhLogin } from "./components/molecules/gh-login";
import { HelpModal } from "./components/molecules/help-modal";
import { ThemeChooser } from "./components/molecules/theme-chooser";
import { Layout } from "./components/organisms/layout";
import { PullRequestManager } from "./components/organisms/pull-request-manager";
import { Pyrogit } from "./services/pyrogit";
import { useChangeRequestStore } from "./stores/changeRequest.store";
import { useLoadingStore } from "./stores/loading";
import { useTabFocus } from "./stores/tab.focus.store";
import { useToastActions } from "./stores/toast.store";
import { useUserStore } from "./stores/user.store";
import { isAction } from "./utils/key-mapper";

const Pyro = new Pyrogit();

function App() {
	const loadingStore = useLoadingStore();
	const prStore = useChangeRequestStore();
	const tabFocusStore = useTabFocus();
	const toast = useToastActions();
	const userStore = useUserStore();

	const [instanceCRService, setCRServiceInstance] = useState<
		ChangeRequestService | undefined
	>();
	//
	const renderer = useRenderer();
	useEffect(() => {
		if (process.env.CONSOLE_DISPLAY) renderer.console.show();
	}, [renderer.console.show]);

	// 	// biome-ignore lint/correctness/useExhaustiveDependencies: I do not need launch dependency it changes every render
	useEffect(() => {
		async function run() {
			loadingStore.start("Loading the app");
			const initResult = await Pyro.init();
			if (initResult.isErr()) {
				const error = initResult.error;
				if (isTaggedError(error) && error._tag === GH_TOKEN_ERROR) {
					tabFocusStore.focusCustom("ask-login");
					toast.error("Failed to log the user");
				} else {
					toast.error("Failed to initialize app");
				}

				return;
			}

			const instance = initResult.value;
			launch(instance);
		}
		run().finally(loadingStore.stop);
	}, [
		loadingStore.stop,
		loadingStore.start,
		toast.error,
		tabFocusStore.focusCustom,
	]);

	useKeyboard((key) => {
		if (tabFocusStore.disabled) return;

		if (isAction(key.name, "tab")) {
			tabFocusStore.cycle();
		}

		if (isAction(key.name, "help")) {
			tabFocusStore.focusCustom("help");
		}

		if (isAction(key.name, "refresh")) {
			if (!instanceCRService)
				return toast.warning(
					"Instance not yet initialized, retry in few seconds",
				);

			loadingStore.start("Updating prs");
			toast.info("Fetching updated prs");
			launch(instanceCRService, true);
		}
	});

	async function launch(instance: ChangeRequestService, force = false) {
		try {
			if (prStore.prs.length > 0 && !force) return;

			const requests = await instance.list({});
			prStore.setPRs(requests);

			if (!requests) {
				toast.info("There are no pull requests to load");
				return;
			}
			toast.success("Pull requests loaded successfully");

			const user = await instance.getUser();
			if (!user) {
				toast.error("Could not load user");
				return;
			}

			if (userStore.user) return;

			userStore.set(user);
			toast.success("User loaded successfully");
		} finally {
			if (!instanceCRService) setCRServiceInstance(instance);
			loadingStore.stop();
		}
	}

	return (
		<Layout>
			<box flexDirection="column">
				<box flexDirection="row">{<PullRequestManager />}</box>
			</box>
			{tabFocusStore.current === "ask-login" && <GhLogin />}
			{tabFocusStore.current === "choose-theme" && <ThemeChooser />}
			{tabFocusStore.current === "help" && <HelpModal />}
		</Layout>
	);
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
