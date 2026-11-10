// The app bridge: the script in root.tsx puts `flicksell` on the page. These
// are the parts this app uses; the bridge has more.

type FlicksellAction = {
	label: string;
	onAction(): void;
	disabled?: boolean;
	loading?: boolean;
	tone?: "critical";
};

interface FlicksellBridge {
	embedded: boolean;
	idToken(): Promise<string>;
	nav: { set(items: { label: string; path: string }[]): void };
	titleBar: {
		set(bar: {
			title?: string;
			primaryAction?: FlicksellAction;
			secondaryActions?: FlicksellAction[];
			menuActions?: FlicksellAction[];
		}): void;
	};
	saveBar: {
		show(bar: {
			onSave(): void | { success: boolean; message?: string } | Promise<void | { success: boolean; message?: string }>;
			onDiscard(): void | Promise<void>;
		}): void;
		hide(): void;
	};
	loading(active: boolean): void;
	toast(message: string, options?: { tone?: "success" | "critical"; duration?: number }): void;
	navigate(to: string): void;
	picker(options: {
		heading: string;
		items: { id: string; label: string; description?: string }[];
		multiple?: boolean;
		selected?: string[];
	}): Promise<string[] | null>;
}

declare const flicksell: FlicksellBridge;
