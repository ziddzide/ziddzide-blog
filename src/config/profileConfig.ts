import type { ProfileConfig } from "../types/config";

// 个人资料配置
export const profileConfig: ProfileConfig = {
	avatar: "https://ziddzide-blog-pirture-1406647554.cos.ap-beijing.myqcloud.com/index/%E5%A4%B4%E5%83%8F.png", // 腾讯 COS 图床(远程地址)
	name: "Ziddzide",
	bio: "网络安全学习者 · 渗透测试 · 网络工程 · 运维实践",
	typewriter: {
		enable: true, // 启用个人简介打字机效果
		speed: 80, // 打字速度（毫秒）
	},
	links: [
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/ziddzide",
		},
		{
			name: "Email",
			icon: "material-symbols:mail",
			url: "mailto:luxin_websec@163.com",
		},
	],
};
