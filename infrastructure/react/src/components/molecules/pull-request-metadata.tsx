import { useTheme } from "../../hooks/use-theme";

type PullRequestMetadataProps = {
	number: number;
	author: string;
	target: string;
};

export function PullRequestMetadata({
	number,
	author,
	target,
}: PullRequestMetadataProps) {
	const { theme } = useTheme();

	return (
		<>
			<box flexDirection="row">
				<text fg={theme.error}>*</text>
				<text>{number}</text>
			</box>
			<text>{author}</text>
			<text>{target}</text>
		</>
	);
}
