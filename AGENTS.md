# 应擎 · 安全监管工作台

单页 HTML 原型 v4 —— SaaS 安全监管工作台，基于"目标驱动的动态工作台"（AI 编排器 + 模块积木 + 场景配置）。

核心理念：底层是稳定的业务模块和组件，AI 根据当前目标、角色、数据上下文，把最相关的模块组合出来。

## Project

- **Stack**: 纯 HTML5 + CSS3 (oklch 色域) + Vanilla JS (IIFE, 无框架) + [Lucide](https://lucide.dev) 图标 (CDN)
- **Entry point**: `index.html` — 自包含单文件，无构建工具、无包管理器、无服务端
- **Version**: 当前代码标记为 v4（`index.html` 注释 + topbar badge）
- **Design doc**: `product-context.md` — 产品方向决策、v4 目标驱动架构、四层闭环模型、异常维度框架

## Commands

此项目为纯静态 HTML，无构建/测试/运行命令。直接在浏览器打开即可：

```sh
open index.html
```

## Architecture

单 HTML 文件，v4 核心结构：

```
aside.sidebar              — 左侧导航（核心 / 分析 / 系统 分组）
div.main
  header.topbar            — 顶部栏（标题 + v4 badge + 通知 + 用户信息）
  div.workspace            — 动态渲染容器（JS 根据目标配置生成）
    div.goal-bar            — 目标栏（场景切换按钮 + 调整模块按钮）
    div.orchestrate-notice  — AI 编排说明（当前目标 + 模块组合描述）
    div.module-wrapper      — 模块容器（根据场景配置动态选择/排序/布局）
      metrics              — 今日概览（5 个指标卡，基线对照）
      diagnosis            — 异常诊断 + 责任主体履职（AI 驱动）
      tips                 — 工作提示（可复制文案 + 复制全部）
      shortcuts + tracking — 快捷入口 + 跟踪任务（底部并排）
      progress / overdue / major-hazard / expert / action — 专项场景模块
    div.bottom-grid         — shortcuts + tracking 并排布局
```

JS 逻辑在文件末尾单一 `<script>` IIFE 中：
- **MODULE_DEFS** — 模块注册表（11 种模块类型）
- **SCENARIOS** — 场景配置（综合监管/专项检查/隐患闭环/履职监督）
- **renderWorkspace()** — 根据当前目标动态渲染工作台
- **renderMetrics/Diagnosis/Tips/Tracking/...** — 各模块渲染函数
- **openAdjustPanel()** — 模块调整面板（增删排序 + localStorage 记忆）
- **drillConfigs + openDrillPanel()** — 钻取面板（保留自 v3）
- 目标切换、单条复制、全部复制、Toast 提示
- 导航切换高亮、顶栏通知/帮助弹窗
- 调用 `lucide.createIcons()` 渲染 SVG 图标

设计系统用 `:root` CSS 自定义属性定义，包含语义化状态色（green/orange/red/blue）、`color-mix()` 软色版本和字号比例尺。

## Conventions

- **命名**: CSS class 用 kebab-case（`.nav-item`, `.sidebar-brand`）；语义化 ID 用 kebab-case
- **图标**: 全部使用 Lucide SVG 图标，通过 `<i data-lucide="...">` 标签 + `lucide.createIcons()` 渲染，禁止使用 emoji 作为 UI 图标
- **颜色**: 使用 oklch 色域，主题色通过 CSS 变量引用；状态标识（绿色/橙色/红色/蓝色）用语义化变量
- **布局**: Flexbox 为主；sidebar 固定宽度 232px；`body` 使用 `overflow: hidden`
- **JS**: 纯 ES5 风格（`var`, `function` 声明），兼容无 Babel 环境；无模块系统；IIFE 包裹避免全局污染
- **无服务端依赖**: 所有数据为静态示例，无 API 请求
- **product-context.md** 记录产品决策（v4 目标驱动方向 + 三层架构 + 六对象模型 + 异常维度框架），开发前应先阅读
- **v4 核心概念**: 目标驱动（用户告诉系统关注什么）→ AI 编排（选择模块、排序、配置下钻）→ 受控动态（模块库中选择，不自由生成）

## Notes

- v4 新增 localStorage 偏好记忆（模块排序/显隐），key 为 `yaq_v4_prefs`
- 场景切换时 AI 编排说明会显示选择了哪些模块及原因
- 钻取面板（drill-down）保留自 v3，不受模块编排影响
- shortcuts + tracking 在综合监管场景下自动并排显示（bottom-grid）
- 模块调整面板支持点击交换排序 + 开关显隐
