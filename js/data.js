// ═══════════════════════════════════════════════════════════
// Data — mock data + scenario configurations
// ═══════════════════════════════════════════════════════════

// ── Goals ──
export const goals = [
  { id: 'comprehensive', label: '综合监管', default: true },
  { id: 'chemical',      label: '危化专项' },
  { id: 'hazard',        label: '隐患闭环' },
  { id: 'duty',          label: '履职监督' },
]

// ── Responsibility Blocks ──
export const blocks = [
  {
    id: 'production',
    name: '生产企业',
    status: '需关注',
    statusClass: 'need-attention',
    mainIssue: '62 户隐患整改逾期',
    responsibleLine: '生产企业条线负责人',
    metrics: { total: 1046, monthly: 128, overdue: 62, selfOverdue: 696, noSelf: 221, weekCheck: 44, rate: '4.21%' }
  },
  {
    id: 'fire-key',
    name: '消防重点单位',
    status: '正常偏紧',
    statusClass: 'tight',
    mainIssue: '164 户自查逾期，7 户未开展',
    responsibleLine: '消防安全组负责人',
    metrics: { total: 207, monthly: 114, overdue: 5, selfOverdue: 164, noSelf: 7, weekCheck: 104, rate: '50.24%' }
  },
  {
    id: 'small-place',
    name: '一般/九小场所',
    status: '重点关注',
    statusClass: 'focus',
    mainIssue: '6760 户未开展自查',
    responsibleLine: '村社消防责任线',
    metrics: { total: 10785, monthly: 2801, overdue: 198, selfOverdue: 262, noSelf: 6760, weekCheck: 3084, rate: '28.6%' }
  },
]

// ── Work Items by Goal ──
export const workItems = {
  comprehensive: [
    {
      id: 'item-001',
      title: '生产企业隐患整改逾期偏多',
      type: 'follow_up',
      riskLevel: 'high',
      status: '需督办',
      responsibleLine: '生产企业条线负责人',
      currentBlocker: '62 户逾期，其中 6 户为重大/较大风险主体',
      nextAction: '要求今日反馈处置计划',
      diagnosisStatus: 'located',
      evidence: [
        '生产企业总数 1046 户',
        '隐患单整改逾期 62 户，占比 5.93%',
        '本周期监管检查完成率 4.21%',
      ],
      actions: [
        '督办生产企业条线负责人',
        '要求今日反馈逾期处置计划',
        '安排专家优先复核高风险主体',
        '加入本周周会重点',
      ],
      chain: {
        lead: '生产企业条线负责人',
        groupLeader: '组长负责拆解清单',
        expert: '专家负责复核高风险主体',
        enterprise: '企业负责整改反馈',
      },
      notification: '请生产企业条线今日 17:00 前反馈隐患整改逾期处置计划。重点说明 6 户重大/较大风险主体整改进展、专家复核安排及预计闭环时间。',
    },
    {
      id: 'item-002',
      title: '一般/九小场所自查推进不足',
      type: 'follow_up',
      riskLevel: 'high',
      status: '需关注',
      responsibleLine: '村社消防责任线',
      currentBlocker: '6760 户尚未开展自查，需按村社拆解',
      nextAction: '要求村社提交推进安排',
      diagnosisStatus: 'located',
      evidence: [
        '一般/九小场所总数 10785 户',
        '未开展自查 6760 户',
        '本周监管检查完成率 28.6%',
      ],
      actions: [
        '督办村社消防责任线',
        '要求各村社提交自查推进安排',
        '按村社拆解未自查清单',
      ],
      chain: {
        lead: '村社消防责任线',
        groupLeader: '各村社负责人',
        enterprise: '场所业主配合自查',
      },
      notification: '请各村社消防责任线本周内提交自查推进安排。当前 6760 户尚未开展自查，需按村社逐户拆解并明确完成时限。',
    },
    {
      id: 'item-003',
      title: '消防重点单位自查逾期需跟进',
      type: 'follow_up',
      riskLevel: 'medium',
      status: '跟进中',
      responsibleLine: '消防安全组负责人',
      currentBlocker: '164 户自查逾期，7 户未开展',
      nextAction: '今日完成未开展单位提醒',
      diagnosisStatus: 'located',
      evidence: [
        '消防重点单位 207 户',
        '自查逾期 164 户',
        '未开展自查 7 户',
      ],
      actions: [
        '要求消防安全组跟进逾期单位',
        '对 7 户未开展单位发送提醒',
      ],
      chain: {
        lead: '消防安全组负责人',
        enterprise: '消防重点单位安全负责人',
      },
      notification: '请消防安全组今日完成 7 户未开展自查单位的提醒工作，并跟进 164 户逾期单位自查进展。',
    },
    {
      id: 'item-004',
      title: '专家复核任务超期集中出现',
      type: 'verification_task',
      riskLevel: 'medium',
      status: '待核实原因',
      responsibleLine: '生产企业条线',
      currentBlocker: '4 个复核任务超期，原因未确认',
      nextAction: '请组长今日反馈原因',
      diagnosisStatus: 'need_verify',
      evidence: [
        '4 个专家复核任务超期',
        '涉及 3 家企业',
        '可能影响隐患闭环',
      ],
      actions: [
        '发起原因核实',
        '生成核实问题',
        '指定核实人',
      ],
      chain: {
        lead: '生产企业条线',
        groupLeader: '组长核实原因',
      },
      verifyQuestions: [
        '是否因企业负责人无法约到导致未复核？',
        '是否因专家任务冲突导致积压？',
        '是否现场已复核但系统未回填？',
        '是否需要重新分派专家？',
        '是否涉及重大隐患闭环风险？',
      ],
      notification: '请生产企业条线组长今日反馈 4 个专家复核任务超期原因。当前无法判断是专家原因、企业不配合还是线下已处理未回填。',
    },
  ],

  chemical: [
    {
      id: 'chem-001',
      title: '勾庄片区危化专项进度落后',
      type: 'follow_up',
      riskLevel: 'high',
      status: '需督办',
      responsibleLine: '生产企业条线负责人',
      currentBlocker: '应查 24 家，已查 11 家',
      nextAction: '要求今日反馈补查安排',
      diagnosisStatus: 'located',
      evidence: [
        '专项覆盖企业 112 家',
        '已检查 57 家，完成率 50.9%',
        '勾庄片区进度低于计划',
      ],
      actions: [
        '督办生产企业条线负责人',
        '要求今日反馈勾庄片区补查安排',
        '关注剩余 55 家检查进度',
      ],
      chain: {
        lead: '生产企业条线负责人',
        groupLeader: '勾庄片区组长',
      },
      notification: '请生产企业条线今日反馈勾庄片区危化专项补查安排。当前应查 24 家仅查 11 家，进度明显落后。',
    },
    {
      id: 'chem-002',
      title: '3 家危化企业整改临期',
      type: 'follow_up',
      riskLevel: 'high',
      status: '待复核',
      responsibleLine: '对应专家 / 企业负责人',
      currentBlocker: '整改照片未提交',
      nextAction: '安排专家明日复核',
      diagnosisStatus: 'action_generated',
      evidence: [
        '3 家企业整改临近期限',
        '整改材料未上传',
        '涉及储存不规范、警示标识缺失',
      ],
      actions: [
        '安排专家明日现场复核',
        '通知企业尽快提交整改材料',
      ],
      chain: {
        lead: '对应专家',
        enterprise: '企业安全负责人',
      },
      notification: '请安排专家明日对 3 家危化企业进行现场复核。当前整改照片未提交，涉及储存不规范、警示标识缺失等问题。',
    },
    {
      id: 'chem-003',
      title: '专家复核任务积压',
      type: 'verification_task',
      riskLevel: 'medium',
      status: '待核实原因',
      responsibleLine: '专家组负责人',
      currentBlocker: '2 个复核任务超过计划时间',
      nextAction: '发起原因核实',
      diagnosisStatus: 'need_verify',
      evidence: [
        '2 个专家复核任务超期',
        '无法判断是专家原因、企业不配合还是数据未回填',
      ],
      actions: [
        '发起原因核实',
        '生成核实问题',
        '指定核实人',
      ],
      chain: {
        lead: '专家组负责人',
        groupLeader: '组长核实原因',
      },
      verifyQuestions: [
        '是否因企业负责人无法约到导致未复核？',
        '是否因专家任务冲突导致积压？',
        '是否现场已复核但系统未回填？',
        '是否需要重新分派专家？',
        '是否涉及重大隐患闭环风险？',
      ],
      notification: '请专家组负责人今日反馈 2 个复核任务超期原因。当前无法确认具体原因，需核实后决定是否重新分派。',
    },
  ],

  hazard: [
    {
      id: 'hz-001',
      title: '6 户重大风险主体隐患未闭环',
      type: 'follow_up',
      riskLevel: 'high',
      status: '需督办',
      responsibleLine: '生产企业条线负责人',
      currentBlocker: '重大隐患整改期限已到，部分企业未完成整改',
      nextAction: '要求今日反馈闭环进展',
      diagnosisStatus: 'located',
      evidence: [
        '6 户为重大/较大风险主体',
        '隐患整改逾期',
        '部分企业未提交整改材料',
      ],
      actions: [
        '督办生产企业条线负责人',
        '要求今日反馈 6 户闭环进展',
        '安排专家优先复核',
      ],
      chain: {
        lead: '生产企业条线负责人',
        expert: '专家优先复核高风险主体',
      },
      notification: '请生产企业条线今日反馈 6 户重大风险主体隐患闭环进展。整改期限已到，需确认是否完成或需延期。',
    },
    {
      id: 'hz-002',
      title: '整改临期企业需提前跟进',
      type: 'follow_up',
      riskLevel: 'medium',
      status: '跟进中',
      responsibleLine: '对应条线负责人',
      currentBlocker: '多家企业整改期限即将到达',
      nextAction: '提前确认整改进展',
      diagnosisStatus: 'located',
      evidence: [
        '多户企业整改期限在本周内到期',
        '部分企业尚未提交整改材料',
      ],
      actions: [
        '提前联系企业确认整改进展',
        '对可能逾期企业预警',
      ],
      chain: {
        lead: '对应条线负责人',
        enterprise: '企业安全负责人',
      },
    },
  ],

  duty: [
    {
      id: 'dt-001',
      title: '生产企业条线检查完成率偏低',
      type: 'follow_up',
      riskLevel: 'high',
      status: '需督办',
      responsibleLine: '生产企业条线负责人',
      currentBlocker: '本周期检查完成率 4.21%，远低于目标',
      nextAction: '要求条线负责人反馈推进计划',
      diagnosisStatus: 'located',
      evidence: [
        '生产企业 1046 户',
        '本周期监管检查完成 44 户',
        '完成率 4.21%',
      ],
      actions: [
        '督办生产企业条线负责人',
        '要求反馈本周检查推进计划',
      ],
      chain: {
        lead: '生产企业条线负责人',
        groupLeader: '各组组长',
      },
    },
    {
      id: 'dt-002',
      title: '自查自纠推进率不均衡',
      type: 'follow_up',
      riskLevel: 'medium',
      status: '需关注',
      responsibleLine: '各责任线',
      currentBlocker: '不同条线自查率差异大',
      nextAction: '对比分析各条线履职情况',
      diagnosisStatus: 'located',
      evidence: [
        '消防重点单位自查率 50.24%',
        '一般/九小场所自查率 28.6%',
        '差异显著',
      ],
      actions: [
        '要求低自查率条线提交推进计划',
        '对比各条线履职数据',
      ],
      chain: {
        lead: '各责任线负责人',
      },
    },
  ],
}

// ── AI assistant suggested questions ──
export const suggestedQuestions = {
  comprehensive: [
    '为什么生产企业逾期排第一？',
    '这件事需要我亲自介入吗？',
    '应该压给哪条责任线？',
    '帮我生成督办话术',
    '把专家执行情况加到首页',
  ],
  chemical: [
    '勾庄片区为什么进度落后？',
    '3 家临期企业的具体隐患是什么？',
    '需要专家介入吗？',
    '帮我生成督办话术',
    '把这个放到首页前三',
  ],
  hazard: [
    '6 户重大风险主体是哪些？',
    '这些隐患预计什么时候能闭环？',
    '帮我生成督办话术',
  ],
  duty: [
    '哪个条线履职最差？',
    '自查率低的原因是什么？',
    '帮我生成督办话术',
  ],
}

// ── Goal meta (for goal bar display) ──
export const goalMeta = {
  comprehensive: {
    label: '综合监管',
    description: '系统正在关注各责任板块的异常、逾期、重大隐患和待复核事项。',
    aiNote: null,
  },
  chemical: {
    label: '危化使用企业专项检查',
    description: '本周重点：覆盖进度、重大隐患、整改闭环、专家复核',
    aiNote: 'AI 已将专项进度、整改闭环、专家复核、需督办事项置顶',
  },
  hazard: {
    label: '重大隐患闭环',
    description: '重点关注：逾期未闭环、临期预警、专家复核',
    aiNote: 'AI 已将重大隐患进度、逾期整改、复核任务置顶',
  },
  duty: {
    label: '履职监督',
    description: '关注各条线检查完成率、自查推进率、任务执行情况',
    aiNote: 'AI 已将条线履职对比、任务完成率、异常行为置顶',
  },
}
