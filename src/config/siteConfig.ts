import type { SiteConfig } from "../types/config";

// 定义站点语言
const SITE_LANG = "zh_CN"; // 语言代码，例如：'en', 'zh_CN', 'ja' 等。

export const siteConfig: SiteConfig = {
	title: "Ziddzide Blog",
	subtitle: "网络安全 · 渗透测试 · 网络工程 · 运维实践",
	siteURL: "https://ziddzide.github.io/ziddzide-blog/", // 请替换为你的站点URL，以斜杠结尾
	siteStartDate: "2026-07-11", // 站点开始运行日期

	lang: SITE_LANG,

	themeColor: {
		hue: 200, // 主题色的默认色相：青色系，符合网络安全主题
		fixed: false, // 允许访问者切换主题色
	},

	// 特色页面开关配置
	featurePages: {
		anime: false, // 番剧页面 — 不需要
		diary: false, // 日记页面 — 不需要
		friends: true, // 友链页面
		projects: true, // 项目页面
		skills: true, // 技能页面
		timeline: false, // 时间线页面 — 不需要
		albums: false, // 相册页面 — 不需要
		devices: false, // 设备页面 — 不需要
		aiTools: false, // AI 工具页面 — 不需要
	},

	// 顶栏标题配置
	navbarTitle: {
		mode: "text-icon",
		text: "Ziddzide",
		icon: "assets/home/home.webp",
		logo: "assets/home/default-logo.webp",
	},

	// 页面自动缩放配置
	pageScaling: {
		enable: true, // 是否开启自动缩放
		targetWidth: 2000, // 目标宽度，低于此宽度时开始缩放
	},

	bangumi: {
		userId: "", // 不使用 Bangumi
		fetchOnDev: false,
	},

	bilibili: {
		vmid: "", // 不使用 Bilibili
		fetchOnDev: false,
		coverMirror: "",
		useWebp: true,
	},

	anime: {
		mode: "local",
	},

	// 日记页面 Memos API 地址，留空则使用静态数据
	diaryApiUrl: "",

	// 文章列表布局配置
	postListLayout: {
		// 默认布局模式："list" 列表模式（单列布局），"grid" 网格模式（双列布局）
		// 注意：如果侧边栏配置启用了"both"双侧边栏，则无法使用文章列表"grid"网格（双列）布局
		defaultMode: "list",
		// 是否启用布局切换功能
		enable: true,
		// 是否允许用户切换布局
		allowSwitch: true,
		// 文章列表页分类导航条配置
		categoryBar: {
			enable: true, // 是否在文章列表页显示分类导航条
		},
	},

	// 标签样式配置
	tagStyle: {
		// 是否使用新样式（悬停高亮样式）还是旧样式（外框常亮样式）
		useNewStyle: false,
	},

	// 壁纸模式配置
	wallpaperMode: {
		// 默认壁纸模式：banner=顶部横幅，fullscreen=全屏壁纸，none=无壁纸
		defaultMode: "banner",
		// 整体布局方案切换按钮显示设置（默认："desktop"）
		// "off" = 不显示
		// "mobile" = 仅在移动端显示
		// "desktop" = 仅在桌面端显示
		// "both" = 在所有设备上显示
		showModeSwitchOnMobile: "both",
	},

	banner: {
		// 支持单张图片或图片数组，当数组长度 > 1 时自动启用轮播
		src: {
			desktop: [
				"/assets/desktop-banner/1.webp",
				"/assets/desktop-banner/2.webp",
				"/assets/desktop-banner/3.webp",
				"/assets/desktop-banner/4.webp",
			], // 桌面横幅图片
			mobile: [
				"/assets/mobile-banner/1.webp",
				"/assets/mobile-banner/2.webp",
				"/assets/mobile-banner/3.webp",
				"/assets/mobile-banner/4.webp",
			], // 移动横幅图片
		}, // 使用本地横幅图片

		position: "center", // 等同于 object-position，仅支持 'top', 'center', 'bottom'。默认为 'center'

		carousel: {
			enable: true,
			interval: 3,
			switchable: true,
		},

		waves: {
			enable: true,
			performanceMode: false,
			mobileDisable: false,
			switchable: true,
		},

		// PicFlow API支持(智能图片API)
		imageApi: {
			enable: false, // 启用图片API
			url: "http://domain.com/api_v2.php?format=text&count=4", // API地址，返回每行一个图片链接的文本
		},
		// 这里需要使用PicFlow API的Text返回类型,所以我们需要format=text参数
		// 项目地址:https://github.com/matsuzaka-yuki/PicFlow-API
		// 请自行搭建API

		homeText: {
			enable: true,
			title: "Ziddzide Blog",
			switchable: true,

			subtitle: [
				"网络安全 · 渗透测试 · 网络工程 · 运维实践",
				"Stay curious, stay secure.",
				"攻防之道，存乎一心",
			],
			typewriter: {
				enable: true, // 启用副标题打字机效果

				speed: 100, // 打字速度（毫秒）
				deleteSpeed: 50, // 删除速度（毫秒）
				pauseTime: 2000, // 完全显示后的暂停时间（毫秒）
			},
		},

		credit: {
			enable: false, // 显示横幅图片来源文本

			text: "Describe", // 要显示的来源文本
			url: "", // （可选）原始艺术品或艺术家页面的 URL 链接
		},

		navbar: {
			transparentMode: "semifull", // 导航栏透明模式："semi" 半透明加圆角，"full" 完全透明，"semifull" 动态透明
		},
	},
	toc: {
		enable: true, // 总开关，启用目录功能
		mobileTop: true, // 手机端顶部 TOC 按钮
		desktopSidebar: true, // 电脑端右侧边栏 TOC
		floating: true, // 悬浮 TOC 按钮
		depth: 2, // 目录深度，1-6，1 表示只显示 h1 标题，2 表示显示 h1 和 h2 标题，依此类推
		useJapaneseBadge: false, // 使用数字标记而不是日语假名
	},
	showCoverInContent: true, // 在文章内容页显示文章封面
	generateOgImages: false, // 启用生成OpenGraph图片功能,注意开启后要渲染很长时间，不建议本地调试的时候开启
	favicon: [
		// 留空以使用默认 favicon
		// {
		//   src: '/favicon/icon.png',    // 图标文件路径
		//   theme: 'light',              // 可选，指定主题 'light' | 'dark'
		//   sizes: '32x32',              // 可选，图标大小
		// }
	],

	// 字体现在通过 astro.config.mjs 的 fonts 选项配置（Astro Font API）
	showLastModified: true, // 控制"上次编辑"卡片显示的开关
	pageProgressBar: {
		enable: true, // 启用页面顶部进度条
		height: 3, // 进度条高度 3px
		duration: 6000, // 动画时长 6s
	},

	thirdPartyAnalytics: {
		enable: false, // 是否启用第三方统计（Microsoft Clarity），默认关闭，启用可能影响 Lighthouse 评分
		clarityId: "", // Clarity 项目 ID
	},
	// 卡片样式配置
	card: {
		border: true, // 开启卡片边框和微阴影，让卡片更有立体感
		followTheme: false, // 卡片背景跟随主题色相
	},
	// 图片优化配置
	imageOptimization: {
		formats: "webp", // 图片输出格式："avif"、"webp" 或 "both"（avif+webp，最优质量但构建更慢）
		quality: 85, // 图片质量，推荐 70-85
		noReferrerDomains: [
			// 需要添加 referrerpolicy="no-referrer" 的域名（支持通配符）
			"*.hdslb.com", // Bilibili CDN
		],
	},
};

export { SITE_LANG };
