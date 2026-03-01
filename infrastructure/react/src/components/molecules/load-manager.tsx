import { useLoadingStore } from "../../stores/loading";
import { LoadingScreen } from "../atoms/loading";

export function LoadManager() {
  const loadingStore = useLoadingStore();

  if (!loadingStore.isLoading) return null;

  return <LoadingScreen />;
}
