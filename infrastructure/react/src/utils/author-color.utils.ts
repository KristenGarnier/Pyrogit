import type { Theme } from "../stores/theme.store";

const CACHE = new WeakMap<Theme, Map<string, string>>();

const HUE_CLASH_THRESHOLD = 30;
const MAX_ADJUSTMENT_ATTEMPTS = 10;
const HUE_ADJUSTMENT_STEP = 37;

function hexToHsl(hex: string): [number, number, number] {
	if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return [0, 50, 50];

	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;

	if (max === min) return [0, 0, l * 100];

	const d = max - min;
	const s = (l > 0.5 ? d / (2 - max - min) : d / (max + min)) * 100;

	let h =
		max === r
			? (g - b) / d + (g < b ? 6 : 0)
			: max === g
				? (b - r) / d + 2
				: (r - g) / d + 4;

	h = (h / 6) * 360;

	return [h, s, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
	h /= 360;
	s /= 100;
	l /= 100;

	const hue2rgb = (p: number, q: number, t: number) => {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	};

	let r: number, g: number, b: number;
	if (s === 0) {
		r = g = b = l;
	} else {
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	const toHex = (c: number) =>
		Math.round(c * 255)
			.toString(16)
			.padStart(2, "0");

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getThemeCache(theme: Theme): Map<string, string> {
	let m = CACHE.get(theme);
	if (!m) {
		m = new Map();
		CACHE.set(theme, m);
	}
	return m;
}

function hashLogin(login: string): number {
	let hash = 5381;
	for (let i = 0; i < login.length; i++) {
		hash = (hash * 33) ^ login.charCodeAt(i);
	}
	return hash;
}

function pickHue(baseHue: number, forbidden: number[]): number {
	let hue = baseHue;

	for (let attempts = 0; attempts < MAX_ADJUSTMENT_ATTEMPTS; attempts++) {
		const clashes = forbidden.some(
			(fh) => Math.abs(((hue - fh + 180) % 360) - 180) < HUE_CLASH_THRESHOLD,
		);
		if (!clashes) break;
		hue = (hue + HUE_ADJUSTMENT_STEP) % 360;
	}

	return hue;
}

export function getAuthorColor(login: string, theme: Theme): string {
	const themeCache = getThemeCache(theme);

	const cached = themeCache.get(login);
	if (cached) return cached;

	const baseHue = Math.abs(hashLogin(login)) % 360;

	const [primaryH, s, l] = hexToHsl(theme.primary);
	const [secondaryH] = hexToHsl(theme.secondary);

	const hue = pickHue(baseHue, [primaryH, secondaryH]);
	const color = hslToHex(hue, s, l);

	themeCache.set(login, color);
	return color;
}
