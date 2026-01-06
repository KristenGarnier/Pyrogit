import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer } from "@opentui/react";
import { useEffect, useState } from "react";
import type { ChangeRequestService } from "../../../application/usecases/change-request.service";
import { HelpModal } from "./components/molecules/help-modal";
import { ThemeChooser } from "./components/molecules/theme-chooser";
import { GhLogin } from "./components/molecules/gh-login";
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

	const renderer = useRenderer();
	const [instanceCRService, setCRServiceInstance] = useState<
		ChangeRequestService | undefined
	>();

	useEffect(() => {
		renderer.console.show();
	}, [renderer.console.show]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: I do not need launch dependency it changes every render
	useEffect(() => {
		async function run() {
			loadingStore.start("Loading the app");
			const [error, instance] = await Pyro.init();
			if (error) {
				if (error.message.includes("No stored OAuth token")) {
					tabFocusStore.focusCustom("ask-login");
				} else {
					toast.error("Failed to initialize app");
				}

				return;
			}

			await launch(instance!);
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
			launch(instanceCRService);
		}
	});

	const handleTokenSuccess = (instance: ChangeRequestService) => {
		(async () => {
			tabFocusStore.stopCustom();
			await launch(instance);
		})();
	};

	async function launch(instance: ChangeRequestService) {
		try {
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
				<box flexDirection="row">
					<PullRequestManager />
				</box>
			</box>
			{tabFocusStore.current === "ask-login" && (
				<GhLogin onSuccess={handleTokenSuccess} />
			)}
			{tabFocusStore.current === "choose-theme" && <ThemeChooser />}
			{tabFocusStore.current === "help" && <HelpModal />}
		</Layout>
	);
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
