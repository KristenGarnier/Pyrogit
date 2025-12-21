import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer } from "@opentui/react";
import { useEffect } from "react";
import { Layout } from "./components/organisms/layout";
import { PullRequestManager } from "./components/organisms/pull-request-manager";
import { ViewRequestManager } from "./components/organisms/view-request-manager";
import { Pyrogit } from "./services/pyrogit";
import { useChangeRequestStore } from "./stores/changeRequest.store";
import { useLoadingStore } from "./stores/loading";
import { useTabFocus } from "./stores/tab.focus.store";
import { useToastStore } from "./stores/toast.store";
import { isAction } from "./utils/key-mapper";

const Pyro = new Pyrogit();

function App() {
	const loadingStore = useLoadingStore();
	const prStore = useChangeRequestStore();
	const tabFocusStore = useTabFocus();
	const toastStore = useToastStore();

	const renderer = useRenderer();

	useEffect(() => {
		renderer.console.show();
	}, [renderer.console.show]);

	useEffect(() => {
		loadingStore.start("Loading the app");
		Pyro.init()
			.then(([instance, error]) => {
				if (error) {
					loadingStore.stop();
					toastStore.addToast("Failed to initialize app", "error");
					return;
				}
				loadingStore.stop();

				return instance?.list({});
			})
			.then((requests) => {
				if (!requests) return;
				prStore.setPRs(requests);
				toastStore.addToast("Pull requests loaded successfully", "success");
			})
			.finally(loadingStore.stop);
	}, [
		loadingStore.stop,
		loadingStore.start,
		prStore.setPRs,
		toastStore.addToast,
	]);

	useKeyboard((key) => {
		if (isAction(key.name, "tab")) {
			tabFocusStore.cycle();
		}
	});

	return (
		<Layout>
			<box flexDirection="column">
				<box flexDirection="row">
					<ViewRequestManager />
					<PullRequestManager />
				</box>
			</box>
		</Layout>
	);
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
