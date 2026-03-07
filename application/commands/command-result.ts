export type CommandNoticeLevel = "info" | "success" | "warning" | "error";

export type CommandNotice = {
	level: CommandNoticeLevel;
	message: string;
};

export type CommandOutcome<TData> = {
	data: TData;
	notices: CommandNotice[];
};
