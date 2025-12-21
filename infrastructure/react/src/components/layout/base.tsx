import { type InputRenderable, TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useRef, useState } from "react";
import { useTheme } from "../../hooks/use-theme";

export function App() {
	const { theme } = useTheme();
	const inputRef = useRef<InputRenderable>(null);
	const [value, setValue] = useState("");

	useKeyboard((key) => {
		if (key.name === "return") {
			console.log(inputRef.current?.value);
		}
	});

	return (
		<box flexDirection="row" flexGrow={1}>
			<scrollbox
				title="Views"
				style={{
					border: true,
					flexGrow: 1,
					width: "30%",
					flexDirection: "column",
					gap: 1,
				}}
			>
				<box style={{ border: true, height: 3 }}>
					<input placeholder="Enter username..." onInput={setValue} focused />
				</box>

				<box flexDirection="row">
					<text fg={theme.error}>{"*"}</text>
					<text attributes={TextAttributes.DIM}>{value}</text>
				</box>
			</scrollbox>
			<scrollbox
				title="Details"
				style={{ border: true, flexGrow: 1, width: "70%" }}
			></scrollbox>
		</box>
	);
}
