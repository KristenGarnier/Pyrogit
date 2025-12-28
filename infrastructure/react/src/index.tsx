import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { useEffect } from "react";
import type { ChangeRequestService } from "../../../application/usecases/change-request.service";
import { TokenInput } from "./components/molecules/token-input";
import { HelpModal } from "./components/molecules/help-modal";
import { Layout } from "./components/organisms/layout";
import { PullRequestManager } from "./components/organisms/pull-request-manager";
import { Pyrogit } from "./services/pyrogit";
import { useChangeRequestStore } from "./stores/changeRequest.store";
import { useLoadingStore } from "./stores/loading";
import { useTabFocus } from "./stores/tab.focus.store";
import { useToastActions } from "./stores/toast.store";
import { isAction } from "./utils/key-mapper";
import { ThemeChooser } from "./components/molecules/theme-chooser";
import { useUserStore } from "./stores/user.store";

const Pyro = new Pyrogit();

function App() {
	const loadingStore = useLoadingStore();
	const prStore = useChangeRequestStore();
	const tabFocusStore = useTabFocus();
	const toast = useToastActions();
	const userStore = useUserStore();

	// const renderer = useRenderer();
	//
	// useEffect(() => {
	// 	renderer.console.show();
	// }, [renderer.console.show]);

	useEffect(() => {
		async function run() {
			loadingStore.start("Loading the app");
			const [error, instance] = await Pyro.init();
			if (error) {
				if (error.message === "No token available") {
					tabFocusStore.focusCustom("ask-token");
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
		if (isAction(key.name, "tab")) {
			tabFocusStore.cycle();
		}

		if (key.name === "?") {
			tabFocusStore.focusCustom("help");
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
			{tabFocusStore.current === "ask-token" && (
				<TokenInput onSuccess={handleTokenSuccess} />
			)}
			{tabFocusStore.current === "choose-theme" && <ThemeChooser />}
			{tabFocusStore.current === "help" && <HelpModal />}
		</Layout>
	);
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
