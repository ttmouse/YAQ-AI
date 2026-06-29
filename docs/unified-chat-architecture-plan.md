# 统一对话架构重构设计方案

> **目标**：将现有的多场景（12 个独立 scene）架构，逐步重构为单一对话流 + 技能触发模式  
> **状态**：规划设计阶段  
> **日期**：2026-06-29

---

## 一、现状分析

### 当前架构

```
用户输入
  │
  ├─ 侧边栏 / 底部导航 / 启动器 ──→ switchScene(sceneId)
  │                                    │
  │                                    └─→ renderScene(sceneId)
  │                                          │
  │                                          ├─ renderDashboard()    ← 替换 sceneContent.innerHTML
  │                                          ├─ renderHazardReport()
  │                                          ├─ renderMonthlyReport()
  │                                          └─ ...（共 12 个场景）
  │
  └─ 全局输入栏 ──→ globalChatSend(text)
                       │
                       ├─ /月报|月度报告/     ──→ switchScene('monthly-report')
                       ├─ /日报|隐患清单|隐患/ ──→ switchScene('hazard-report')
                       ├─ /履职|督导|统计/     ──→ switchScene('responsibility')
                       └─ 其他 ──→ generateFakeReply(text)   ← 关键词匹配，返回假回复
                                      │
                                      └─ sceneAppend(html) → 追加到 #sceneContent
```

### 关键问题

| 问题 | 影响 |
|---|---|
| **场景切换 = 全量替换内容** | 每次 `switchScene` 都会清空 `#sceneContent.innerHTML`，对话历史丢失，无法形成连贯对话 |
| **对话与场景分离** | 右侧浮窗 `#chatPanel` 几乎未使用（DOM 中不存在 `chatBody`/`chatPanel` 元素），存在两条并行路线 |
| **场景路由硬编码** | 关键词→场景映射写死在 `globalChatSend()` 第 1407-1424 行，新增场景需改代码 |
| **renderXxx 函数过大** | 每个场景的 render 函数内部包含大量 HTML 字符串拼接，与对话系统完全隔离 |
| **agent-init 特殊处理** | 初始化引导是独立的全屏浮层，概念上是"对话"但实现上与主场景隔离 |

---

## 二、核心设计理念

### 核心理念

> **日常工作台是对话的基座。所有技能都在这个基座上触发和呈现。**

```
┌──────────────────────────────────────────────────┐
│  站长每日监管闭环工作台              🔔 🔍  ⋮    │
├──────────────────────────────────────────────────┤
│  ┌─ 日常工作台（对话基座） ───────────────────┐ │
│  │                                              │ │
│  │  [打开应用]                                  │ │
│  │    ↓                                         │ │
│  │  日常工作台初始化（显示今日概览）              │ │
│  │    ↓                                         │ │
│  │  用户发消息 → 技能路由匹配                    │ │
│  │    ├─ 匹配到 "隐患分析" → 在对话流中显示结果   │ │
│  │    ├─ 匹配到 "月报生成" → 在对话流中显示结果   │ │
│  │    ├─ 匹配到 "履职效能" → 在对话流中显示结果   │ │
│  │    └─ 未匹配 → 自由对话                       │ │
│  │    ↓                                         │ │
│  │  用户继续追问 → 上下文保留，对话持续            │ │
│  │                                              │ │
│  └──────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│  [快速芯片: 隐患分析] [履职效能] [月报]           │
├──────────────────────────────────────────────────┤
│  📎 ➤ 发消息或按住说话                  🎤 ↑    │
└──────────────────────────────────────────────────┘
```

### 关键决策

1. **日常工作台 = 统一对话界面** — 不再是 12 个场景之一，而是唯一的界面基座
2. **初始化引导是"入职培训"** — 低频、一次性，完成后回到日常工作台
3. **技能是"对话中的回复模板"** — 不是独立页面，而是匹配到关键词后在对话流中生成的结构化内容
4. **"切换场景"概念消失** — 取而代之的是"在当前对话中触发了某个技能"

### 旧 vs 新 思维对比

| 旧思维 | 新思维 |
|--------|--------|
| 有 12 个独立场景，用户在场景间切换 | 有 1 个日常工作台，技能在对话中触发 |
| 点击"月报"→ 切换到月报场景（清空页面） | 输入"月报"→ 日常工作台对话流中生成月报内容 |
| 每个场景有自己的 render 函数 | 每个技能有自己的 generate 函数 |
| 场景切换丢失对话历史 | 对话持续追加，历史保留 |
| agent-init 是独立全屏浮层 | 初始引导是日常工作台的前几条消息 |

### Demo 展示定位

> 这是一个**高保真 Demo**，不是真实 AI Agent。目标是：
> 1. 让**产品**看得清每个技能的能力边界和交互细节
> 2. 让**研发**知道每个技能需要调哪些接口、返回什么数据结构
> 3. 让**演示**时能流畅模拟"AI 在后台工作"的效果

#### 模拟 vs 真实对照表

| 环节 | Demo 做法（模拟） | 未来真实做法 |
|------|------------------|-------------|
| 技能触发 | 关键词匹配 → 执行预设的 `generate()` | NLP 意图识别 → 调用 LLM/API |
| 思考过程 | 逐条显示预设的"步骤文案" + 延时 | 显示 LLM 的思考链/工具调用日志 |
| 数据查询 | 从 `mock-data.js` 读取 | 从后端 API 实时获取 |
| 工具调用 | 显示"正在查询…"动画，然后展示假数据 | 真实调用搜索/数据库/规则引擎 |
| **过程展示** | 逐条显示预设步骤 → 完成后折叠/消失，只保留结果 | 显示 LLM 思考链 / 工具调用日志 |
| 定时任务 | 模拟定时触发 → 在工作台展示结果 | 后端定时任务推送/轮询 |

> **关键原则**：Demo 模拟的是"效果"和"流程"，而不是"数据真实性"。每个步骤的展示方式应该与真实系统保持一致，方便后续平滑替换。

### 阶段一：日常工作台 → 统一对话基座（不影响现有场景）

**目标**：将日常工作台（dashboard）改造为统一对话引擎，建立技能注册体系。  
**核心变化**：`#sceneContent` 不再被全量替换，而是作为对话流容器持续追加。

#### 1.1 新增 `js/skill-engine.js`

核心模块，包含：

- **`UnifiedChat` 类**：对话引擎，管理消息列表、渲染对话流
  - `initialize()`：初始化对话界面（在 dashboard 基础上）
  - `appendMessage(role, content, type)`：追加消息到对话流
  - `renderThinking()`：显示"思考中..."动画
  - `renderStructuredReply(sections)`：逐段渲染结构化回复
  - `appendQuickChips(chips)`：添加上下文快捷芯片
  - `getConversationHistory()`：获取对话上下文

- **`SkillRouter` 类**：技能路由
  - `register(skillId, config)`：注册技能（匹配器 + 处理器）
  - `route(text)`：匹配输入文本，返回匹配的技能
  - 支持正则、关键词、语义匹配

- **技能注册 API**
  ```javascript
  // 示例
  SkillRouter.register('hazard-analysis', {
    keywords: ['隐患', '风险', '安全', '闭环', '超期'],
    priority: 10,
    handler: function(text, chat) {
      return generateHazardReply(text, chat);
    }
  });
  ```

#### 1.2 改造日常工作台渲染

当前 `renderDashboard()` 渲染的概览内容将成为**对话流的第一条消息**（系统/Agent 消息）：

```javascript
// 改造后：打开应用时
// 1. 不再调用 renderScene('dashboard')
// 2. 改为 UnifiedChat.initialize()
// 3. 在对话流中插入第一条消息——今日概览
UnifiedChat.initialize({
  welcomeMessage: '早上好，杨站长。以下是今日监管概览：',
  initialContent: generateDashboardOverview(), // 从 renderDashboard 提取的概览数据
  quickChips: [
    { label: '查看隐患详情', text: '帮我看看今天的重大隐患情况' },
    { label: '履职效能分析', text: '分析一下团队履职效能' },
  ]
});
```

#### 1.3 统一消息格式

```javascript
// 对话流中的消息结构
{
  id: 'msg_1719600000_001',
  role: 'user' | 'agent' | 'system',
  type: 'text' | 'card-row' | 'table' | 'chart' | 'skill-trigger',
  content: '...',        // 文本内容
  sections: [...],        // 结构化段落
  timestamp: 1719600000,
  skillId: 'hazard-analysis'  // 触发的技能（如有）
}
```

### 阶段二：技能注册系统 — 将现有 renderXxx 拆解为技能

**目标**：逐个将场景内容迁移为可触发的技能，场景代码逐步退役

#### 2.1 技能定义模板

```javascript
// js/skills/hazard-analysis.js
window.YAQ.registerSkill({
  id: 'hazard-analysis',
  name: '隐患分析',
  description: '查看重大隐患、超期情况、整改跟踪',
  keywords: ['隐患', '风险', '安全', '闭环', '超期', '整改'],
  // 场景兼容：如果这是用户主动切换到的"焦点"，保留 sceneId 向后兼容
  sceneId: 'hazard-report',

  // 回复生成器：返回结构化段落数组
  generate: function(text, context) {
    return [
      { type: 'section-head', text: '🔍 当前安全态势概览' },
      { type: 'stat-row', data: [
        { label: '待处理隐患', value: '47', trend: 'up' },
        { label: '重大隐患', value: '3', trend: 'up' },
        { label: '整改完成率', value: '68.2%', trend: 'down' },
      ]},
      { type: 'table', headers: ['企业', '隐患', '状态', '逾期'],
        rows: [ ... ] },
      { type: 'action-buttons', buttons: [
        { label: '查看超期隐患详情', action: 'drill:hazard-overdue' },
        { label: '督办未整改企业', action: 'supervise:unrectified' },
      ]},
    ];
  }
});
```

#### 2.2 迁移路线图（按优先级）

> **起点：日常工作台 dashboard 即是对话基座，不作为一个"技能"迁移**  
> 初始化引导是低频一次性体验，排在最后

| 阶段 | 技能 | 对应旧场景 | 说明 | 复杂度 |
|------|------|-----------|------|--------|
| **二-A** | **隐患分析** | `hazard-report` | 最高频场景，最先迁移 | ⭐⭐ |
| **二-B** | **履职效能** | `efficiency` | 高频分析场景 | ⭐⭐ |
| **二-C** | **月报生成** | `monthly-report` | 周期性高频 | ⭐⭐⭐ |
| **二-D** | 分级处置 | `disposal` | 处置闭环查询 | ⭐⭐ |
| **二-E** | 重点跟进 | `followup` | 跟进追踪 | ⭐ |
| **二-F** | 主体责任 | `responsibility` | 主体评估 | ⭐⭐ |
| **二-G** | 专项检查 | `special-inspection` | 检查报告 | ⭐⭐⭐ |
| **二-H** | 待确认行动 | `pending-actions` | 待办确认 | ⭐⭐ |
| **二-I** | 督办跟踪 | `supervision-track` | 督办操作 | ⭐ |
| **最后** | 初始化引导 | `agent-init` | 低频，排最后迁移 | ⭐⭐⭐ |

> **注意**：日常工作台（dashboard）本身不迁移为技能，它是所有技能运行的基座。初始化完成后，用户看到的就是日常工作台对话界面。

#### 2.3 快速芯片联动

每个技能注册时同时声明其推荐的上下文芯片：

```javascript
SkillRouter.register({
  id: 'hazard-analysis',
  // ...
  quickChips: function(context) {
    return [
      { label: '查看超期隐患详情', text: '查看超期隐患详情' },
      { label: '督办未整改企业', text: '督办未整改企业' },
    ];
  }
});
```

对话引擎在每次技能回复完成后，自动调用 `quickChips()` 显示上下文芯片。

### 阶段三：淘汰场景切换机制

**目标**：`switchScene()`、`renderScene()` 及相关导航元素退役。  
**前提**：此时所有高频技能（隐患分析、履职效能、月报等）已完成迁移。

#### 3.1 过渡方案

在阶段二中，每个技能保留 `sceneId` 字段实现向后兼容：

```javascript
// 当用户通过旧导航点击场景时（如底部 tab）
function legacySceneRedirect(sceneId) {
  // 日常工作台本身不切换，直接返回
  if (sceneId === 'dashboard') return;

  // 查找是否有技能注册了该 sceneId
  var skill = SkillRouter.findBySceneId(sceneId);
  if (skill) {
    // 在对话流中触发技能（不切换场景）
    UnifiedChat.triggerSkill(skill.id);
    return;
  }
  // 尚未迁移的场景：暂时保留旧渲染
  renderScene(sceneId);
}
```

#### 3.2 最终移除项

| 待移除 | 说明 |
|--------|------|
| `switchScene()` | 由 `UnifiedChat.triggerSkill()` 替代 |
| `renderScene()` 中的 switch-case | 每个 case 对应一个技能 |
| `.nav-item[data-scene]` 导航 | 改为技能面板/快速入口 |
| `.mb-nav-item[data-scene]` 底部导航 | 改为技能面板/底部快捷入口 |
| `sceneLabels` 映射表 | 由技能注册信息的 `name` 字段替代 |
| `globalChatSend()` 中的硬编码路由 | 由 `SkillRouter` 替代 |

### 阶段四：初始化引导迁移

**目标**：将 `agent-init` 场景（全屏浮层）融入统一对话流

- 首次打开时，对话引擎自动触发 `onboarding` 技能
- 引导步骤作为对话流的前几条消息呈现
- 用户偏好设置以交互式卡片形式在对话中完成
- 原有 `agent-init.js` 中的 `startConversation()`、`convChatSend()` 逻辑可逐步迁移到技能系统中

---

## 四、技术要点

### 4.1 对话流渲染引擎

`#sceneContent` 作为对话容器，不再被全量替换。

```javascript
// 核心渲染逻辑
function appendToChat(html) {
  var container = document.getElementById('sceneContent');
  container.insertAdjacentHTML('beforeend', html);
  // 滚动到底部
  requestAnimationFrame(function() {
    container.scrollTop = container.scrollHeight;
  });
}
```

现有的 `sceneAppend()` 函数（`agent-init.js:1712`）已经是这个模式，可以直接复用/提升到全局。

### 4.2 技能触发流程可视化（Demo 核心体验）

这是 Demo 展示的关键——让用户看到"AI 在后台工作"的过程。  
但要注意：**过程步骤是瞬时状态，最终结果才是对话的组成部分。**

#### 触发流程

```
用户输入 "帮我分析一下今天的重大隐患情况"
  │
  ├─ ① 技能匹配（瞬间）
  │     └─ 匹配到 "hazard-analysis"
  │
  ├─ ② 展示思考过程（瞬时状态，逐条弹出，每条 400-800ms）
  │     ├─ 🧠 思考过程
  │     ├─ 📌 调用技能：隐患分析
  │     ├─ 🔧 使用工具：查询隐患数据库
  │     ├─ 📊 查询数据：今日隐患清单、整改进度、超期情况
  │     └─ ✅ 分析完成  ───→ 思考过程收起/消失
  │
  └─ ③ 展示结果（永久内容，追加到对话流）
        ├─ 🔍 当前安全态势概览（stat-row）
        ├─ 重大隐患清单（table）
        └─ 操作建议（action-buttons）
```

#### 关键原则

> **过程步骤展示的是"系统正在工作"，不是对话的一部分。结果出来后，过程应当折叠或消失。**

| 阶段 | 性质 | 是否留在对话流 |
|------|------|--------------|
| 思考链（🧠 📌 🔧 📊） | 瞬时状态 | ❌ 完成后消失 |
| 后台步骤（正在读取…） | 瞬时状态 | ❌ 完成后消失 |
| 最终结果（卡片/表格） | 永久内容 | ✅ 追加到对话流 |

#### 两种实现方案

<details>
<summary><b>方案 A：折叠式</b>（推荐）</summary>

过程步骤展示在一个可折叠的气泡中，结果出来后自动折叠。

```
┌─────────────────────────────────┐
│ 🧠 思考过程  ────  (点击展开)   │ ← 折叠状态，只留一行摘要
├─────────────────────────────────┤
│ 🔍 当前安全态势概览              │ ← 下面是永久结果
│ ┌──────┬──────┬────────┐       │
│ │待处理 │重大   │整改率  │       │
│ └──────┴──────┴────────┘       │
└─────────────────────────────────┘
```

展开后：

```
┌─────────────────────────────────┐
│ 🧠 思考过程  ────  (点击收起)   │
│ ├ 📌 调用技能：隐患分析          │
│ ├ 🔧 使用工具：查询隐患数据库     │
│ ├ 📊 查询数据：今日隐患清单       │
│ └ ✅ 分析完成                    │
├─────────────────────────────────┤
│ 🔍 当前安全态势概览              │
│ ...                             │
└─────────────────────────────────┘
```

</details>

<details>
<summary><b>方案 B：瞬时替换式</b>（更简洁）</summary>

过程步骤在一个临时容器中逐条展示，结果出来后临时容器被替换为最终结果。

```
步骤进行中：
┌─────────────────────────────────┐
│ 🧠 思考过程                      │
│ 📌 调用技能：隐患分析             │
│ 🔧 使用工具：查询隐患数据库  ← 当前 │
│ 📊 查询数据：今日隐患清单          │
│ ✅ 分析完成                      │
└─────────────────────────────────┘

结果出来后（临时容器被替换）：
┌─────────────────────────────────┐
│ 🔍 当前安全态势概览              │
│ ┌──────┬──────┬────────┐       │
│ │待处理 │重大   │整改率  │       │
│ └──────┴──────┴────────┘       │
└─────────────────────────────────┘
```

优点：更干净，对话流中只有结果  
缺点：用户错过就看不到过程了（但过程本就不需要保留）

</details>

#### 步骤配置

每个技能在注册时可以声明其"模拟流程步骤"：

```javascript
SkillRouter.register({
  id: 'hazard-analysis',
  // ...
  demoSteps: {
    // 思考链（简短标签，逐条展示）
    thinkChain: [
      { icon: '🧠', text: '思考过程' },
      { icon: '📌', text: '调用技能：隐患分析' },
      { icon: '🔧', text: '使用工具：查询隐患数据库' },
      { icon: '📊', text: '查询数据：今日隐患清单、整改进度' },
      { icon: '✅', text: '分析完成' },
    ],
    // 后台步骤（详细描述，带进度感）
    detailSteps: [
      '正在读取辖区基础数据…',
      '正在分析隐患信息和整改进展…',
      '正在加载规则引擎和异常判定模型…',
      '正在加载历史监管记录和专项任务数据…',
      '正在关联分析主体责任和履职情况…',
      '正在生成全局诊断报告…',
    ],
    // 每个步骤的显示时长（ms）
    stepInterval: 600,
    detailInterval: 400,
    // 过程展示方式：'collapse'（折叠） 或 'replace'（替换）
    processDisplay: 'collapse',
  }
});
```

#### 效果目标

- **产品看到**：知道每个技能会拆解成哪些子步骤，每个步骤需要什么数据
- **研发看到**：知道需要提供哪些接口（读取辖区基础数据、查询隐患清单、加载规则引擎…）
- **演示看到**：感觉 AI 真的在后台逐步工作，且界面干净不杂乱

从 `card-primitives.js`（`C.statCardRow`、`C.sectionHead` 等）和 `generateFakeReply()` 中的段落模式来看，现有的"分段数组"概念已经非常接近目标。只需标准化段落的类型体系：

```
段落类型:
  - section-head   : 章节标题
  - stat-row       : 统计卡片行
  - table          : 数据表格
  - text-block     : 文本段落
  - list           : 列表
  - action-buttons : 操作按钮组
  - chart          : 图表（未来）
  - card           : 详细卡片
  - divider        : 分隔线
```

### 4.3 技能优先级与冲突

```
技能匹配优先级:
  1. 精确匹配（如 "月报"）
  2. 多关键词匹配（匹配词越多，优先级越高）
  3. 单关键词匹配
  4. 默认对话（兜底）
```

当多个技能匹配时，选优先级最高的。同时可设计"确认"机制：当置信度不高时，对话引擎反问"你是想看隐患分析还是履职效能？"

### 4.4 状态管理

```javascript
// 对话状态
var chatState = {
  messages: [],           // 消息历史
  currentSkill: null,     // 当前活跃技能
  context: {},            // 跨轮上下文（如 drillContext）
  skills: {},             // 已注册技能
};
```

### 4.5 向后兼容策略

- 保留 `window.YAQ.switchScene()` 作为内部兼容 API，内部重定向到技能系统
- 现有场景的 `renderXxx()` 函数在完全迁移前保持不变
- 技能可以有 `sceneId` 标识，当通过旧导航点击时，触发对应技能而非切换场景
- Demo 菜单中的 `data-cmd="switchScene"` 改为调用 `YAQ.triggerSkill()`

### 4.6 定时任务（Scheduled Tasks）

> ⚠️ **当前阶段**：仅记录概念和展示设计，具体实现放后续版本

#### 概念说明

系统中有两类触发方式：

| 触发方式 | 说明 | 示例 |
|---------|------|------|
| **主动触发** | 用户输入关键词，技能立即响应 | 输入"隐患分析"→ 展示隐患数据 |
| **定时触发** | 系统在预设时间自动执行技能，结果缓存在工作台 | 每天早 8:00 自动执行"每日概览"技能 |

#### 定时任务的场景

- **每日工作台**：站长早上打开应用时，看到的已经是定时任务执行后的结果
  - 凌晨自动执行"每日概览"技能
  - 生成今日待办、隐患动态、效能变化
  - 站长打开时看到的是"已就绪"的状态，而非等待加载
  
- **周期性报告**：月报 / 周报在固定时间自动生成
- **异常预警**：规则引擎检测到异常时自动触发对应的处置技能

#### Demo 展示方式

```html
<!-- 定时任务触发的提示 -->
<div class="c-row agent scheduled">
  <div class="c-bubble scheduled-bubble">
    <div class="scheduled-head">
      <span class="scheduled-icon">⏰</span>
      <span class="scheduled-label">定时任务 · 每日概览</span>
      <span class="scheduled-time">今日 06:00 自动执行</span>
    </div>
    <div class="process-steps">
      <div class="proc-line active">🕐 正在读取辖区基础数据…</div>
      <div class="proc-line active">🕐 正在分析隐患信息和整改进展…</div>
      <div class="proc-line active">🕐 正在加载规则引擎和异常判定模型…</div>
      <div class="proc-line active">✅ 报告已生成</div>
    </div>
  </div>
</div>
```

#### 后续需要深入的问题

- [ ] 定时任务的配置界面（时间、频率、关联技能）
- [ ] 定时任务的结果如何缓存和展示
- [ ] 站长看到的是"最新快照"还是"实时数据"
- [ ] 多个定时任务的结果如何聚合在工作台上
- [ ] 定时任务与手动触发的冲突处理

- 保留 `window.YAQ.switchScene()` 作为内部兼容 API，内部重定向到技能系统
- 现有场景的 `renderXxx()` 函数在完全迁移前保持不变
- 技能可以有 `sceneId` 标识，当通过旧导航点击时，触发对应技能而非切换场景
- Demo 菜单中的 `data-cmd="switchScene"` 改为调用 `YAQ.triggerSkill()`

---

## 五、文件结构变化

```
js/
├── app.js                 # 核心：移除 switchScene/renderScene 的场景路由
│                           保留：DOM 缓存、事件委托、工具函数
│                           改造：日常工作台渲染 → UnifiedChat 初始化
├── agent-init.js           # 逐步迁移：对话逻辑 → skill-engine
│                            保留：初始引导数据、生成假回复的 mock 数据
│                            最终：迁移到 skills/onboarding.js 后移除
├── skill-engine.js         # ★ 新增：统一对话引擎 + 技能路由
│                           包含：UnifiedChat 类 + SkillRouter 类
├── skills/                 # ★ 新增：各技能的独立文件
│   ├── hazard-analysis.js   # 隐患分析技能（最高优先迁移）
│   ├── efficiency.js        # 履职效能技能
│   ├── monthly-report.js    # 月报生成技能
│   ├── disposal.js          # 分级处置技能
│   ├── followup.js          # 重点跟进技能
│   ├── responsibility.js    # 主体责任技能
│   ├── special-inspection.js # 专项检查技能
│   ├── pending-actions.js   # 待确认行动技能
│   ├── supervision-track.js # 督办跟踪技能
│   └── onboarding.js        # 初始化引导技能（从 agent-init 迁移，最后）
│
│   ★ 注意：没有 dashboard.js
│     日常工作台是对话基座，不是一个技能。
│     它的内容由 UnifiedChat.initialize() 直接渲染。
│
├── rules.js                # 不变：规则引擎独立
├── track-store.js          # 不变：跟踪存储独立
├── components/             # 不变：组件库
│   ├── bottom-input-bar.js
│   ├── quick-chip.js
│   └── card-primitives.js
└── data/
    └── mock-data.js        # 不变：Mock 数据
```

---

## 六、实施步骤总结

```
阶段一：日常工作台 → 统一对话基座
  ├── 新增 js/skill-engine.js（UnifiedChat + SkillRouter）
  ├── 改造 renderDashboard() → UnifiedChat.initialize()
  ├── #sceneContent 变为对话流容器（不再是全量替换）
  ├── 定义消息格式标准
  └── 建立技能注册 API

阶段二：技能迁移（逐个场景 → 技能）
  ├── 从最高频开始：隐患分析 → 履职效能 → 月报
  ├── 每个技能独立文件，注册到 SkillRouter
  ├── 旧场景代码与新技能并存（向后兼容）
  └── 更新快速芯片联动

阶段三：淘汰场景切换
  ├── switchScene() 重定向为 triggerSkill()
  ├── 底部导航 / 启动器改造
  ├── Demo 菜单迁移
  └── 清理旧的 scene 路由代码

阶段四：初始化引导迁移
  ├── agent-init → onboarding 技能
  ├── 全屏浮层 → 对话流中的前几条消息
  ├── 日常化后：初始化完成自动回到日常工作台
  └── agent-init.js 逐步退役
```

---

## 七、风险与注意事项

| 风险 | 缓解措施 |
|------|---------|
| 现有场景代码量大（每个 renderXxx 含大量 HTML） | 阶段二逐步迁移，每个技能独立，不阻塞整体 |
| 对话历史累积导致性能问题 | 虚拟滚动 / 分页加载，限制消息保留条数 |
| 技能匹配可能不准确 | 优先级机制 + 反问确认 + 兜底对话 |
| 移动端适配 | 对话流本身就是移动友好的滚动容器 |
| 现有测试需要更新 | 阶段二每个技能迁移时同步更新测试 |
| 定时任务的设计尚未细化 | 已在 4.6 中记录需要深入的问题清单，后续迭代处理 |

---

## 八、与现有设计的兼容性

现有 `CardPrimitives`（`card-primitives.js`）中已经定义了：

- `C.statCardRow()` — 统计卡片行 ✅ 可直接复用
- `C.sectionHead()` — 章节标题 ✅ 可直接复用
- `C.statusBadge()` — 状态标签 ✅ 可直接复用
- `C.table()` — 表格 ✅ 可直接复用

现有 `generateFakeReply()`（`agent-init.js:1441`）中分段数组的"段落"概念，就是新架构中结构化回复的直接原型。

现有 `sceneAppend()` / `sceneTypeResponse()` 模式（向 `#sceneContent` 逐段追加），即是新对话引擎的核心渲染方式。

> **结论：新架构不是推倒重来，而是在现有模式基础上的标准化和扩展。**
