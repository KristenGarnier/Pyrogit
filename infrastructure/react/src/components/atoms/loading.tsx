import { useEffect, useState } from "react";
import { useTheme } from "../../hooks/use-theme";

const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;

export function LoadingSpinner() {
  const [frameIndex, setFrameIndex] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    const t = setInterval(() => setFrameIndex((x) => (x + 1) % frames.length), 80);
    return () => clearInterval(t);
  }, []);

  const frame = frames[frameIndex];

  return <text fg={theme.primary}>{frame}</text>;
}
