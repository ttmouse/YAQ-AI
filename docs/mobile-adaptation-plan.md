# 移动端适配补全方案

> 审计日期：2026-06-26
> 基于 `mobile.css` 已有适配，补充遗漏的 6 个组件 + 4 个待增强场景

---

## 一、断点体系

沿用 `mobile.css` 已有的三级断点：

| 断点 | 目标设备 | 现有适配 |
|------|---------|---------|
| `≤1024px` | 平板 | 间距/字号缩小 |
| `≤768px` | 手机横屏/小平板 | 弹窗全屏化、面板全宽化 |
| `≤480px` | 手机竖屏 | 字号进一步缩小、按钮堆叠 |

**原则：** 所有弹窗/面板在 ≤768px 下全屏，≤480px 下优化内部布局。

---

## 二、逐个场景方案

### 场景 1：记忆面板 `.memory-panel`

**当前状态：** 宽 520px，居中定位，桌面端 80vh 限高。移动端无任何适配。

**打开方式：** 右上角菜单 → "记忆" → `YAQ.openMemoryPanel()`

**问题：** 520px 在小屏手机上会超出视口，居中定位导致顶部/底部被裁剪。

**方案：** ≤768px 全屏覆盖

```css
/* mobile.css — 追加到 ≤768px 断点内 */

/* 记忆面板 — 移动端全屏 */
.memory-panel {
  left: 0 !important;
  top: 0 !important;
  width: 100% !important;
  height: 100% !important;
  max-height: 100% !important;
  border-radius: 0 !important;
  transform: none !important;
}
.memory-panel-body {
  -webkit-overflow-scrolling: touch;
}
```

**涉及文件：** `css/mobile.css` — 在 `≤768px` 断点内新增上述规则。

---

### 场景 2：行动项确认弹窗 `.action-modal-panel`

**当前状态：** 宽 640px，`top:50%;left:50%;transform:translate(-50%,-50%)` 居中定位，`max-width:90vw`，`max-height:85vh`。移动端无适配。

**打开方式：** 批量推送行动项时自动弹出、单条推送级别选择时弹出。

**问题：** 640px 在手机上太宽（`max-width:90vw` 仅限宽度，不限制高度行为），居中弹窗内容可能溢出。

**方案：** ≤768px 全屏底部抽屉式（从底部滑出），更适合单手操作。

```css
/* mobile.css — 追加到 ≤768px 断点内 */

/* 行动项确认弹窗 — 移动端底部抽屉式 */
.action-modal-panel {
  top: auto !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  max-height: 85vh !important;
  border-radius: 16px 16px 0 0 !important;
  transform: translateY(100%) !important;
}
.action-modal-panel.open {
  transform: translateY(0) !important;
}
.action-modal-body {
  -webkit-overflow-scrolling: touch;
}
```

```css
/* mobile.css — 追加到 ≤480px 断点内 */

.action-modal-header {
  padding: 12px 16px;
}
.action-modal-header h3 {
  font-size: 14px;
}
.action-modal-body {
  padding: 12px 16px;
}
.action-modal-footer {
  padding: 10px 16px;
}
```

**注意：** 由于 `action-modal-panel` 原生使用 `transform` 做动画（scale + translate），移动端要改为底部滑出动画，需要覆盖 `transform` 值。需确认 JS 中 `closeActionModal()` 移除 `.open` 后是否仍能正常回退。

**涉及文件：** `css/mobile.css`

---

### 场景 3：站点地图启动台 `.launcher-panel`

**当前状态：** `position:fixed; top:0;left:0;right:0;bottom:0` 全屏 overlay，但内部 padding `40px 24px 60px`，搜索框 `max-width:800px`，搜索结果 `max-width:680px`。移动端无专门适配。

**打开方式：** 顶栏搜索图标 → `openLauncher()` / `Cmd+K`

**问题：** 虽然是全屏 overlay，但桌面端的大内边距在手机上浪费空间。启动台是高频入口，需要更紧凑的布局。

**方案：** ≤768px 压缩内边距和搜索栏高度，≤480px 进一步优化。

```css
/* mobile.css — 追加到 ≤768px 断点内 */

.launcher-panel {
  padding: 12px 12px 24px;
}
.launcher-header {
  margin-bottom: 16px;
  margin-top: 8px;
}
.launcher-search {
  height: 40px;
  font-size: 14px;
  border-radius: 10px;
  padding: 0 12px 0 40px;
}
.launcher-search-icon {
  left: 12px;
}
.launcher-body {
  padding: 0 2px;
}
```

```css
/* mobile.css — 追加到 ≤480px 断点内 */

.launcher-panel {
  padding: 8px 8px 16px;
}
.launcher-header {
  margin-bottom: 12px;
}
.launcher-search {
  height: 36px;
  font-size: 13px;
  padding: 0 10px 0 36px;
}
.launcher-chips {
  gap: 6px;
}
.launcher-item {
  padding: 10px 12px;
}
```

**涉及文件：** `css/mobile.css`

---

### 场景 4：指标说明浮层 `.metric-tip`

**当前状态：** `position:fixed`，`max-width:300px`，`z-index:999`，JS 动态计算 top/left 定位。移动端无适配。

**打开方式：** 鼠标悬停/点击指标卡片名称时触发 tooltip。

**问题：** 移动端没有 hover，依赖 click 触发。fixed 定位的 tooltip 在移动端可能溢出屏幕边界（特别是右边缘或底部）。

**方案：** ≤768px 改为底部居中弹出，使用 `bottom` 定位而非动态 top/left。

```css
/* mobile.css — 追加到 ≤768px 断点内 */

.metric-tip {
  top: auto !important;
  bottom: calc(80px + env(safe-area-inset-bottom, 0)) !important;
  left: 50% !important;
  right: auto !important;
  transform: translateX(-50%) !important;
  max-width: calc(100vw - 32px) !important;
  width: max-content;
  font-size: 12px;
  border-radius: 12px;
  padding: 12px 16px;
}
```

**注意：** JS 中动态计算 `top`/`left` 的逻辑需要保持不变（桌面端仍用动态定位），仅通过 CSS `!important` 覆盖移动端的定位值。

**涉及文件：** `css/mobile.css`

---

### 场景 5：专项检查任务编辑弹窗 `.si-modal`

**当前状态：** 定义在 `inspection.css`，宽 `420px`，`max-width:90vw`，`max-height:80vh`，居中。无移动端规则。

**打开方式：** 专项检查场景下编辑/新建检查任务时弹出。

**问题：** 420px 宽度 + 居中定位，移动端无专门适配。

**方案：** ≤768px 全屏。

```css
/* mobile.css — 追加到 ≤768px 断点内 */

.si-modal-overlay.active {
  align-items: stretch;
}
.si-modal {
  width: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  height: 100% !important;
  border-radius: 0 !important;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
}
.si-modal-actions {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}
```

**涉及文件：** `css/mobile.css`

---

### 场景 6：指标钻取浮层内部布局增强 `.drill-body`

**当前状态：** `mobile.css` 已把 `.drill-float` 设为全屏，但 `.drill-body` 内部仍是 `grid-template-columns: 1fr 1fr`（左侧列表 + 右侧 AI 分析）。

**问题：** 双列布局在手机上太窄，每列只有 ~180px，内容显示效果差。

**方案：** ≤768px 改为纵向布局，列表在上、AI 分析在下，中间加分隔。

```css
/* mobile.css — 追加到 ≤768px 断点内（在现有 drill-float 规则之后）*/

.drill-body {
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
}
.drill-list {
  border-right: none;
  border-bottom: 1px solid var(--line);
  max-height: 45vh;
  padding: 12px 14px;
}
.drill-chat {
  padding: 12px 14px;
}
```

**涉及文件：** `css/mobile.css`

---

### 场景 7：月报侧边栏 z-index 冲突修复 `#mrSidebar`

**当前状态：** `mobile.css` 已设为 `width:100%;top:46px`，但使用 `position:absolute` + `z-index:100`。其他弹窗（modal-overlay）也是 z-index:100，可能互相覆盖。

**问题：** 当隐患弹窗打开时，月报侧边栏如果在背后可能被遮挡或产生交互混乱。

**方案：** 降低 mrSidebar 的 z-index 到 90，确保其他 modal overlay (100+) 能正确覆盖它。

```css
/* mobile.css — 追加到 ≤768px 断点内 */

#mrSidebar {
  z-index: 90 !important;
}
```

**涉及文件：** `css/mobile.css`

---

### 场景 8：独立页面 — 404 页面

**当前状态：** `404.html` 使用内联 `<style>`，h1 字号 64px，无移动端适配。

**问题：** 64px 标题在 375px 屏幕上过大。按钮在极小屏可能溢出。

**方案：** 添加 `@media` 规则到页面内联样式。

```css
/* 404.html — 追加到 </style> 之前 */

@media (max-width: 480px) {
  h1 {
    font-size: 40px;
  }
  p {
    font-size: 14px;
  }
  a {
    padding: 10px 24px;
    font-size: 14px;
  }
}
```

**涉及文件：** `404.html`

---

### 场景 9：独立页面 — AI vs 传统流程对照页

**当前状态：** `ai-vs-traditional-comparison.html` 仅有 `min-width:768px` 的宽屏规则，无 max-width 移动端适配规则。包含大量卡片、表格、对比网格。

**问题：** 复杂的多列布局在手机端会严重挤压。

**方案：** 添加完整的移动端响应式规则到页面内联样式。

```css
/* ai-vs-traditional-comparison.html — 追加到 </style> 之前 */

@media (max-width: 768px) {
  .page-header {
    padding: 24px 16px 32px;
  }
  .page-header h1 {
    font-size: 20px;
  }
  .header-inner {
    max-width: 100%;
  }
  .page {
    padding: 16px;
  }
  .report-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .stats {
    grid-template-columns: 1fr 1fr;
  }
  .comparison-table {
    font-size: 12px;
  }
  .comparison-table th,
  .comparison-table td {
    padding: 8px 6px;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 18px;
  }
  .page-header p {
    font-size: 13px;
  }
  .stats {
    grid-template-columns: 1fr;
  }
  .back-link {
    font-size: 12px;
  }
  /* 表格横向滚动 */
  .comparison-table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
```

**涉及文件：** `ai-vs-traditional-comparison.html`

---

### 场景 10：独立页面 — 智能专项检查原型页

**当前状态：** `special-inspection-prototype.html` 有 `@media (max-width:640px)` 基础规则（grid 1fr、msg 95%、modal 100vw），但不够全面。

**问题：** 缺少对顶部栏、聊天区域、按钮组的移动端优化。

**方案：** 扩展已有的 640px 断点。

```css
/* special-inspection-prototype.html — 扩展已有 @media (max-width:640px) */

@media (max-width: 640px) {
  /* ... 保留现有规则 ... */

  /* 补充：工作区内边距 */
  .workspace {
    padding: 12px 8px 80px;
  }

  /* 补充：场景标题 */
  .scene-header h1 {
    font-size: 17px;
  }
  .scene-header p {
    font-size: 12px;
  }

  /* 补充：消息区域 */
  .msg {
    max-width: 95%;
  }
  .msg-avatar {
    width: 26px;
    height: 26px;
    font-size: 11px;
  }

  /* 补充：操作按钮组 */
  .actions {
    flex-wrap: wrap;
    gap: 6px;
  }
  .actions button {
    flex: 1 1 auto;
    font-size: 12px;
    padding: 8px 12px;
  }

  /* 补充：任务卡片 */
  .task-card {
    padding: 12px;
  }
  .task-card h4 {
    font-size: 14px;
  }
}
```

**涉及文件：** `special-inspection-prototype.html`

---

## 三、全局性问题（不限于某个场景）

### 问题 A：Modal overlay z-index 层级冲突

多个 overlay 共用 `z-index:100`：
- `.modal-overlay` (隐患/任务/指标弹窗)
- `.drawer-overlay` (抽屉)
- `.action-modal-overlay` (行动项弹窗)
- `#mrSidebar` (月报侧边栏，HTML 内联 z-index:100)

**方案：** 统一 z-index 层级体系（建议后续单独处理，本方案暂不涉及，仅修复 mrSidebar）。

### 问题 B：全局聊天栏遮挡全屏弹窗底部

当弹窗全屏时，`global-chat-bar`（z-index 隐含在文档流之上）可能遮挡弹窗底部按钮（如隐患弹窗的"督办/核查/跟踪"按钮）。

**方案：** 当任何全屏弹窗打开时，全局聊天栏应隐藏或降低层级。

```css
/* mobile.css — 追加到 ≤768px 断点内 */

/* 当全屏弹窗打开时，隐藏底部聊天栏 */
body:has(.hmodal-panel[style*="display: block"]) .global-chat-bar,
body:has(.tmodal-panel[style*="display: block"]) .global-chat-bar,
body:has(.modal-panel[style*="display: block"]) .global-chat-bar,
body:has(.drill-float.open) .global-chat-bar,
body:has(.action-modal-panel.open) .global-chat-bar,
body:has(.memory-panel.open) .global-chat-bar {
  display: none;
}
```

**注意：** `:has()` 选择器兼容性：Safari 15.4+、Chrome 105+、Firefox 121+。考虑到项目已使用 oklch 等现代 CSS 特性，`:has()` 选择器兼容性可接受。如果担心兼容性，可以用 JS 方案替代（在打开弹窗时显式隐藏聊天栏）。

**涉及文件：** `css/mobile.css`（或 JS 侧在 `openXxx` 函数中处理）

---

## 四、实施清单

| # | 场景 | 文件 | 改动量 | 优先级 |
|---|------|------|--------|--------|
| 1 | 记忆面板 | `css/mobile.css` | ~12 行 | P0 |
| 2 | 行动项确认弹窗 | `css/mobile.css` | ~30 行 | P0 |
| 3 | 站点地图启动台 | `css/mobile.css` | ~40 行 | P1 |
| 4 | 指标说明浮层 | `css/mobile.css` | ~10 行 | P1 |
| 5 | 专项检查任务编辑弹窗 | `css/mobile.css` | ~15 行 | P1 |
| 6 | 指标钻取浮层内部布局 | `css/mobile.css` | ~10 行 | P2 |
| 7 | 月报侧边栏 z-index | `css/mobile.css` | ~4 行 | P2 |
| 8 | 全局聊天栏遮挡 | `css/mobile.css` | ~10 行 | P1 |
| 9 | 404 页面 | `404.html` | ~12 行 | P2 |
| 10 | AI 对比页 | `ai-vs-traditional-comparison.html` | ~35 行 | P2 |
| 11 | 专项检查原型页 | `special-inspection-prototype.html` | ~25 行 | P2 |

**总计：** ~200 行 CSS，分散在 4 个文件中。

---

## 五、建议实施顺序

1. **第一轮（P0）**：核心高频弹窗 — 记忆面板 + 行动项弹窗
2. **第二轮（P1）**：次高频入口 — 启动台 + 指标浮层 + 专项检查弹窗 + 聊天栏遮挡修复
3. **第三轮（P2）**：增强优化 — 钻取布局 + 月报 z-index + 独立页面
