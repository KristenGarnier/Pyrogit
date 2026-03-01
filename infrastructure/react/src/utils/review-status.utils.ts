import type { MyReviewStatus, OverallStatus } from "../../../../domain/change-request";

export type ReviewStateConfig = {
  icon: string;
  color: string;
  text: string;
};
export function getReviewStatusConfigMe(status: MyReviewStatus): ReviewStateConfig {
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
            icon: "",
            color: "success",
            text: "Approved",
          };
        case "changes_requested":
          return {
            icon: "",
            color: "error",
            text: "Req. changes",
          };
        case "commented":
          return {
            icon: "󰻞",
            color: "info",
            text: "Commented",
          };
      }
      break;
    case "as_author":
      switch (status.decision) {
        case "approved":
          return {
            icon: "",
            color: "success",
            text: "Approved",
          };
        case "changes_requested":
          return {
            icon: "",
            color: "error",
            text: "Changes Requested",
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
export function getReviewStatusConfig(
  statusOverall: OverallStatus,
  statusMe: MyReviewStatus,
): ReviewStateConfig {
  const review = getReviewStatusConfigMe(statusMe);
  if (review.text === "Optional" || review.text === "Review needed") return review;

  switch (statusOverall) {
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
        text: "Changes",
      };
    case "commented_only":
      return {
        icon: "󰻞",
        color: "info",
        text: "Commented",
      };
    case "pending":
      return {
        icon: "",
        color: "muted",
        text: "No user",
      };
    default:
      return {
        icon: "",
        color: "muted",
        text: "Unknown",
      };
  }
}
