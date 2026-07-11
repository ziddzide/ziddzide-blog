import type { NavBarConfig } from "../types/config";
import { LinkPreset } from "../types/config";

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.Friends,
		{
			name: "GitHub",
			url: "https://github.com/ziddzide",
			external: true,
			icon: "fa7-brands:github",
		},
		LinkPreset.About,
	],
};
