import { TextAttributes } from "@opentui/core";
import { useEffect, useState } from "react";

const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;

export function LoadingScreen(props: { title?: string; subtitle?: string }) {
	const { title = "Loading", subtitle } = props;
	const [i, setI] = useState(0);

	useEffect(() => {
		const t = setInterval(() => setI((x) => (x + 1) % frames.length), 80);
		return () => clearInterval(t);
	}, []);

	const frame = frames[i];

	return (
		<box width="100%" height="100%" alignItems="center" justifyContent="center">
			<box border padding={2} width={40} flexDirection="column" gap={1}>
				<text>{`${frame} ${title}...`}</text>
				{subtitle ? (
					<text attributes={TextAttributes.DIM}>{subtitle}</text>
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

	return (
		<box width="100%" height="100%" alignItems="center" justifyContent="center">
			<box border padding={2} width={48} flexDirection="column" gap={1}>
				<text>{title}</text>
				<text>{`${progressBar(progress)} ${pct}%`}</text>
			</box>
		</box>
	);
}
