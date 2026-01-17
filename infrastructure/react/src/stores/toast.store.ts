import { setTimeout } from "node:timers/promises";
import { create } from "zustand";

export type ToastType = "info" | "success" | "warning" | "error";

export type Toast = {
	id: string;
	message: string;
	type: ToastType;
	timestamp: number;
	duration?: number;
};

type ToastStoreState = {
	toasts: Toast[];
	addToast: (message: string, type?: ToastType, duration?: number) => void;
	removeToast: (id: string) => void;
	clearAll: () => void;
};

const TOAST_DEFAULT_DURATION = 3000;

export const useToastStore = create<ToastStoreState>((set, get) => ({
	toasts: [],

	addToast: (message: string, type: ToastType = "info", duration?: number) => {
		const id =
			Date.now().toString() + Math.random().toString(36).substring(2, 9);
		const toast: Toast = {
			id,
			message,
			type,
			timestamp: Date.now(),
			duration: duration ?? TOAST_DEFAULT_DURATION,
		};

		set((state) => ({
			toasts: [...state.toasts, toast],
		}));

		// Auto-remove after duration
		setTimeout(
			toast.duration,
			() => {
				get().removeToast(id);
			},
			{
				ref: false,
			},
		);
	},

	removeToast: (id: string) => {
		set((state) => ({
			toasts: state.toasts.filter((toast) => toast.id !== id),
		}));
	},

	clearAll: () => {
		set({ toasts: [] });
	},
}));

// Stable reference to prevent infinite loops
const toastActions = {
	info: (message: string, duration?: number) =>
		useToastStore.getState().addToast(message, "info", duration),
	success: (message: string, duration?: number) =>
		useToastStore.getState().addToast(message, "success", duration),
	warning: (message: string, duration?: number) =>
		useToastStore.getState().addToast(message, "warning", duration),
	error: (message: string, duration?: number) =>
		useToastStore.getState().addToast(message, "error", duration),
	clear: () => useToastStore.getState().clearAll(),
};

// Helper functions for convenience
export const useToastActions = () => toastActions;
