import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer } from "@opentui/react";
import { useEffect, useState } from "react";
import type { CommandNotice } from "../../../application/commands/command-result";
import type { ChangeRequestService } from "../../../application/usecases/change-request.service";
import { GH_TOKEN_ERROR } from "../../errors/GHTokenRetrievalError";
import { isTaggedError } from "../../errors/TaggedError";
import { InitAppCommand } from "./commands/init-app.command";
import { RefreshChangeRequestsCommand } from "./commands/refresh-change-requests.command";
import { GhLogin } from "./components/molecules/gh-login";
import { HelpModal } from "./components/molecules/help-modal";
import { ThemeChooser } from "./components/molecules/theme-chooser";
import { Layout } from "./components/organisms/layout";
import { PullRequestManager } from "./components/organisms/pull-request-manager";
import { useCommandBus } from "./services/command-bus";
import { useLoadingStore } from "./stores/loading";
import { useTabFocus } from "./stores/tab.focus.store";
import { useToastActions } from "./stores/toast.store";
import { abortAll } from "./utils/abort-request.utils";
import { isAction } from "./utils/key-mapper";

function dispatchNotices(
  notices: CommandNotice[],
  toast: ReturnType<typeof useToastActions>,
) {
  for (const notice of notices) {
    if (notice.level === "success") toast.success(notice.message);
    if (notice.level === "info") toast.info(notice.message);
    if (notice.level === "warning") toast.warning(notice.message);
    if (notice.level === "error") toast.error(notice.message);
  }
}

function App() {
  const loadingStore = useLoadingStore();
  const tabFocusStore = useTabFocus();
  const toast = useToastActions();
  const commandBus = useCommandBus();

  const [instanceCRService, setCRServiceInstance] = useState<ChangeRequestService | undefined>();
  //
  const renderer = useRenderer();
  useEffect(() => {
    if (process.env.CONSOLE_DISPLAY) renderer.console.show();
  }, [renderer.console.show]);

  // 	// biome-ignore lint/correctness/useExhaustiveDependencies: I do not need launch dependency it changes every render
  useEffect(() => {
    async function run() {
      loadingStore.start("Loading the app");

      const initResult = await commandBus.execute(new InitAppCommand());
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

      dispatchNotices(initResult.value.notices, toast);
      const instance = initResult.value.data.service;
      await refresh(instance);
    }
    run().finally(loadingStore.stop);
  }, [
    commandBus,
    loadingStore.stop,
    loadingStore.start,
    toast,
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
        return toast.warning("Instance not yet initialized, retry in few seconds");

      loadingStore.start("Updating prs");
      toast.info("Fetching updated prs");
      refresh(instanceCRService);
    }
  });

  async function refresh(instance: ChangeRequestService) {
    try {
      const result = await commandBus.execute(
        new RefreshChangeRequestsCommand(instance),
      );

      if (result.isErr()) {
        toast.error("Failed to refresh pull requests");
        return;
      }

      dispatchNotices(result.value.notices, toast);
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

process.on("SIGINT", () => {
  abortAll("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  abortAll("SIGTERM");
  process.exit(0);
});
