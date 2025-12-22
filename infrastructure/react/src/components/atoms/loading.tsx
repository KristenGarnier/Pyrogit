import { TextAttributes } from "@opentui/core";
import { useEffect, useState } from "react";
import { useTheme } from "../../hooks/use-theme";

const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;

export function LoadingScreen(props: { title?: string; subtitle?: string }) {
	const { title = "Loading", subtitle } = props;
	const [i, setI] = useState(0);
	const { theme } = useTheme();

	useEffect(() => {
		const t = setInterval(() => setI((x) => (x + 1) % frames.length), 80);
		return () => clearInterval(t);
	}, []);

	const frame = frames[i];

	return (
		<box
			width="100%"
			height="100%"
			alignItems="center"
			justifyContent="center"
			position="absolute"
			top={0}
			left={0}
		>
			<box border padding={2} width={40} flexDirection="column" gap={1}>
				<text fg={theme.foreground}>{`${frame} ${title}...`}</text>
				{subtitle ? (
					<text fg={theme.muted} attributes={TextAttributes.DIM}>
						{subtitle}
					</text>
				) : null}
			</box>
		</box>
	);
}

function progressBar(p: number, width = 24) {
	const clamped = Math.max(0, Math.min(1, p));
	const filled = Math.round(clamped * width);
	return `[${"█".repeat(filled)}${" ".repeat(width - filled)}]`;
}

export function LoadingScreenProgress(props: {
	title?: string;
	progress: number; // 0..1
}) {
	const { title = "Loading", progress } = props;
	const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
	const { theme } = useTheme();

	return (
		<box width="100%" height="100%" alignItems="center" justifyContent="center">
			<box border padding={2} width={48} flexDirection="column" gap={1}>
				<text fg={theme.foreground}>{title}</text>
				<text fg={theme.foreground}>{`${progressBar(progress)} ${pct}%`}</text>
			</box>
		</box>
	);
}
