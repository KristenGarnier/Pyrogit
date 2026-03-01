import { format } from "timeago.js";
import type { ChangeRequest } from "../../../../domain/change-request";
import { getReviewStatusConfig } from "./review-status.utils";

export const COLUMN_CONFIG = {
  ID: { minWidth: 2, maxWidth: 10 },
  Status: { minWidth: 1, maxWidth: 1 },
  Title: { minWidth: 10, maxWidth: 30 },
  Author: { minWidth: 15, maxWidth: 25 },
  Target: { minWidth: 6, maxWidth: 18 },
  MR: { minWidth: 1, maxWidth: 1 },
  Review: { minWidth: 12, maxWidth: 25 },
  Update: { minWidth: 10, maxWidth: 20 },
};

export type ColumnKey = keyof typeof COLUMN_CONFIG;

export function calculateColumnWidths(items: ChangeRequest[]): Record<ColumnKey, number> {
  const widths: Record<string, number> = {};

  for (const key of Object.keys(COLUMN_CONFIG) as ColumnKey[]) {
    const config = COLUMN_CONFIG[key];
    let maxLength = config.minWidth;

    for (const item of items) {
      let contentLength = 0;

      switch (key) {
        case "ID":
          contentLength = `#${item.id.number}`.length;
          break;
        case "Status":
          contentLength = 1;
          break;
        case "Title":
          contentLength = item.title.length;
          break;
        case "Author":
          contentLength = item.author.login.length;
          break;
        case "Target":
          contentLength = item.taget?.length || 0;
          break;
        case "MR":
          contentLength = 1;
          break;
        case "Review": {
          const status = getReviewStatusConfig(item.review.overallStatus, item.review.myStatus);
          // account for space between icon and text
          contentLength = String(status.text + status.icon).length + 1;
          break;
        }
        case "Update":
          contentLength = format(item.updatedAt).length;
          break;
      }

      maxLength = Math.max(maxLength, contentLength);
    }

    (widths as Record<ColumnKey, number>)[key] = Math.min(
      config.maxWidth,
      Math.max(config.minWidth, maxLength),
    );
  }

  return widths;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}
