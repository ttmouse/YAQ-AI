// 模块注册表 —— 系统底层 UI 模块抽象
// 每个模块只需 id + 中文一句话描述，供 AI 编排层选择

export const modules = [
  // ─── 综合监管场景 ────────────────────────────────────
  { id: 'metrics',        desc: '今日概览指标卡组（含基线对照）' },
  { id: 'diagnosis',      desc: '异常诊断 AI 分析卡片列表' },
  { id: 'responsibility', desc: '责任主体履职进度卡片行' },
  { id: 'tips',           desc: '工作提示可复制文案列表' },
  { id: 'tracking',       desc: '持续跟踪任务看板' },
  { id: 'shortcuts',      desc: '快捷入口卡片' },

  // ─── 隐患闭环场景 ────────────────────────────────────
  { id: 'major-hazard',   desc: '重大隐患横向卡片列表' },

  // ─── 专项检查场景 ────────────────────────────────────
  { id: 'progress',       desc: '专项检查进度指标卡' },
  { id: 'overdue',        desc: '逾期任务预警列表' },
  { id: 'expert',         desc: '专家复核任务列表' },
  { id: 'action',         desc: '推荐动作卡片' },

  // ─── 通用模块 ────────────────────────────────────────
  { id: 'priority-queue', desc: '优先处理队列（超期/滞后事项）' },
  { id: 'efficiency',     desc: '工作效能分组指标卡片' },
  { id: 'work-items',     desc: '当前重点事项纵向列表' },
  { id: 'detail-panel',   desc: '事项详情面板（判断/动作/链路）' },
  { id: 'ai-assistant',   desc: 'AI 安全助手对话侧栏' },
];
