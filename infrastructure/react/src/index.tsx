import { createCliRenderer, TextAttributes } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { useEffect, useState } from "react";
import { Pyrogit } from "./services/pyrogit";
import { LoadingScreen } from "./components/atoms/loading";

const Pyro = new Pyrogit();

function App() {
	const [value, setValue] = useState("");
	const [loading, setLoading] = useState(false);
	const [needToken, setNeedToken] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		setLoading(true);
		Pyro.init().then(([_, error]) => {
			if (error) {
				setLoading(false);
				setNeedToken(true);
				return;
			}

			setLoading(false);
		});
	}, []);

	async function submitToken() {
		setLoading(true);
		setError(null);
		const [instance, error] = await Pyro.init(value);
		if (error) {
			setLoading(false);
			return setError(error.message);
		}

		setSuccess(true);
		setLoading(false);
		setNeedToken(false);
	}

	return (
		<>
			{loading && <LoadingScreen title="Loading infos" />}
			<box flexGrow={1}>
				<box
					style={{
						flexGrow: 1,
					}}
				>
					{needToken && (
						<box style={{ border: true, height: 3 }} title="Github token">
							<input
								placeholder="Enter token..."
								value={value}
								onInput={setValue}
								onSubmit={submitToken}
								onPaste={(event) => setValue(event.text)}
								focused
							/>
						</box>
					)}

					<box flexDirection="row">
						{loading && (
							<text attributes={TextAttributes.DIM}>Verifying token...</text>
						)}
						{error && <text fg={"red"}>{error}</text>}
						{success && <text fg={"green"}>Token valide !</text>}
					</box>
				</box>
			</box>
		</>
	);
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
