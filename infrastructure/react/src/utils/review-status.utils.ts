import type { MyReviewStatus } from "../../../../domain/change-request";

export type ReviewStateConfig = {
	icon: string;
	color: string;
	text: string;
};

export function getReviewStatusConfig(
	status: MyReviewStatus,
): ReviewStateConfig {
	switch (status.kind) {
		case "not_needed":
			return {
				icon: "󰍷",
				color: "muted",
				text: "Optional",
			};
		case "needed":
			return {
				icon: "",
				color: "warning",
				text: "Review needed",
			};
		case "done":
			switch (status.decision) {
				case "approved":
					return {
						icon: "",
						color: "success",
						text: "Approved",
					};
				case "changes_requested":
					return {
						icon: "",
						color: "error",
						text: "Changes requested",
					};
				case "commented":
					return {
						icon: "󰻞",
						color: "info",
						text: "Commented",
					};
			}
			break;
		default:
			return {
				icon: "",
				color: "muted",
				text: "Unknown",
			};
	}
}
