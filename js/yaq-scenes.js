(function() {
'use strict';
// 从 YAQ 命名空间拉取依赖
var YAQ = window.YAQ;
var MOCK = YAQ.MOCK;
var $dom = YAQ.$dom;
var FOLLOWUPS = YAQ.FOLLOWUPS;
var TrackStore = YAQ.TrackStore;
var ls = YAQ.ls;
var safeRender = YAQ.safeRender;
// 以下函数在 yaq-ui.js 中定义，通过 YAQ 访问
var showToast = function(m) { if (YAQ.showToast) YAQ.showToast(m); };
var escapeHtml = function(s) { if (YAQ.escapeHtml) return YAQ.escapeHtml(s); return s; };
var getActionIcon = function(k) { if (YAQ.getActionIcon) return YAQ.getActionIcon(k); return 'chevron-right'; };

// ════════════════════════════════════════════════════════════════
// 企业主体责任 AI 评估数据（mock）
// ════════════════════════════════════════════════════════════════

var ENTERPRISE_DB = {
      '北苑商业综合体': {
        region: '良渚街道',
        person: '王志安',
        type: '商业综合体',
        area: '28,000 m²',
        riskLevel: '重大风险',
        score: 'B',
        scorePct: 72,
        summary: '该企业安全管理基础较好，隐患排查机制基本建立，但近期出现重大隐患超期未整改情况，需重点关注整改闭环。应急演练频次不足，设备维护记录有断档。',
        dimensions: [
          { id: 'responsibility', label: '安全责任体系', score: 'A', icon: 'shield',
            text: '已建立三级安全责任制（企业负责人→部门负责人→岗位责任人），责任书签订率 100%。有专职安全管理人员 2 名。',
            bar: 'a' },
          { id: 'regulation', label: '规章制度执行', score: 'B', icon: 'file-text',
            text: '安全生产制度 12 项，覆盖消防、用电、特种设备等。但制度更新不及时（最近一次更新为 8 个月前），班组级执行力偏弱。',
            bar: 'b' },
          { id: 'inspection', label: '隐患排查治理', score: 'C', icon: 'search',
            text: '近半年发现隐患 6 项，其中重大隐患 1 项（当前超期未整改）。一般隐患闭环率 80%，整改质量参差不齐，存在反复整改现象。',
            bar: 'c' },
          { id: 'training', label: '教育培训', score: 'B', icon: 'graduation-cap',
            text: '员工安全培训覆盖率 92%，新员工三级教育落实到位。但专项培训（消防/急救）频次偏低，2026 年仅开展 1 次全员消防演练。',
            bar: 'b' },
          { id: 'emergency', label: '应急管理能力', score: 'C', icon: 'alert-triangle',
            text: '应急预案 3 项（火灾/停电/踩踏），最近一次演练为 2025 年 12 月。应急物资配备基本齐全，但无定期检查记录，部分灭火器已过检验期。',
            bar: 'c' },
          { id: 'facility', label: '设备设施安全', score: 'B', icon: 'settings',
            text: '消防设施维保合同在约，维保记录每月 1 次。自动消防设施 2026 年 5 月年检合格。特种设备（电梯/扶梯）年检均在有效期内。',
            bar: 'b' },
          { id: 'history', label: '历史表现评价', score: 'B', icon: 'clock',
            text: '近 2 年无一般及以上生产安全事故。2025 年因消防通道堵塞被行政处罚 1 次（已整改）。日常检查配合度较好，但整改时效性有待提高。',
            bar: 'b' }
        ],
        hazards: [], // 运行时填充
        selfInspections: [
          { date: '2026-06-20', type: '月度自查', items: 12, issues: 1, status: '整改中', statusCls: 'neutral',
            detail: '3层餐饮区灭火器检查记录缺失' },
          { date: '2026-05-25', type: '月度自查', items: 12, issues: 0, status: '无异常', statusCls: 'done',
            detail: '' },
          { date: '2026-04-22', type: '月度自查', items: 12, issues: 2, status: '已完成', statusCls: 'done',
            detail: '疏散指示标志损坏 2 处 → 已更换' },
          { date: '2026-03-28', type: '季度全面检查', items: 28, issues: 3, status: '已完成', statusCls: 'done',
            detail: '电气线路穿管保护不全 → 已整改；灭火器压力不足 1 具 → 已更换；应急灯损坏 1 盏 → 已更换' },
          { date: '2026-02-15', type: '月度自查', items: 12, issues: 1, status: '已完成', statusCls: 'done',
            detail: '地下室堆放杂物 → 已清理' }
        ],
        expertRecords: [
          { date: '2026-06-18', expert: '张工', org: '第三方安全机构', type: '日常巡查', result: '发现消防通道堵塞，当场下发整改通知', status: '已处理', statusCls: 'done' },
          { date: '2026-06-10', expert: '张工', org: '第三方安全机构', type: '日常巡查', result: '检查消防设施运行情况，未见异常', status: '已处理', statusCls: 'done' },
          { date: '2026-06-05', expert: '王磊', org: '消防安全专家组', type: '复查', result: '上次电气线路整改已通过，建议加强日常巡查', status: '已处理', statusCls: 'done' },
          { date: '2026-05-20', expert: '张工', org: '第三方安全机构', type: '监督检查', result: '灭火器检查记录缺失，要求限期补充', status: '已处理', statusCls: 'done' },
          { date: '2026-05-08', expert: '王磊', org: '消防安全专家组', type: '专项检查', result: '中庭电气线路穿管保护基本合格', status: '已处理', statusCls: 'done' },
          { date: '2026-04-10', expert: '张工', org: '第三方安全机构', type: '复查', result: '疏散指示标志已更换，问题已闭环', status: '已处理', statusCls: 'done' }
        ],
        trainingRecords: [
          { date: '2026-06-15', type: '全员消防演练', instructor: '区消防大队', attendees: 86, status: '已完成', detail: '消防疏散演练 + 灭火器实操' },
          { date: '2026-04-20', type: '新员工安全培训', instructor: '王志安', attendees: 12, status: '已完成', detail: '三级安全教育，考试合格率 100%' },
          { date: '2026-03-10', type: '专项培训', instructor: '张工（第三方）', attendees: 24, status: '已完成', detail: '电气安全与消防设施操作培训' },
          { date: '2026-01-08', type: '年度安全会议', instructor: '企业负责人', attendees: 45, status: '已完成', detail: '年度安全目标分解、责任书签订' }
        ]
      },
      '云栖高层住宅': {
        region: '五常街道',
        person: '李明',
        type: '住宅小区',
        area: '65,000 m²',
        riskLevel: '较大风险',
        score: 'C',
        scorePct: 45,
        summary: '该小区物业管理能力偏弱，自动消防设施失效已超期未整改，存在较大安全风险。日常巡查记录不完整，业主消防安全意识普遍偏低。',
        dimensions: [
          { id: 'responsibility', label: '安全责任体系', score: 'C', icon: 'shield',
            text: '物业管理处设安全员 1 名（兼），未建立明确的安全责任制层级。与业委会的安全管理职责界定不清。',
            bar: 'c' },
          { id: 'regulation', label: '规章制度执行', score: 'C', icon: 'file-text',
            text: '基本安全制度存在但不健全，消防控制室制度未上墙，值班记录缺失 2026 年 4-5 月记录。',
            bar: 'c' },
          { id: 'inspection', label: '隐患排查治理', score: 'C', icon: 'search',
            text: '巡查频次不足（合同约定每周 1 次，实际每 2 周 1 次）。2026 年发现隐患 4 项，闭环 2 项，自动消防设施失效长期未修复。',
            bar: 'c' },
          { id: 'training', label: '教育培训', score: 'C', icon: 'graduation-cap',
            text: '员工安全培训覆盖率约 60%，新员工三级教育记录不全。2026 年未开展消防演练。',
            bar: 'c' },
          { id: 'emergency', label: '应急管理能力', score: 'D', icon: 'alert-triangle',
            text: '应急预案 2 项，最近一次更新为 2024 年。未开展过应急演练，应急物资配备严重不足。',
            bar: 'c' },
          { id: 'facility', label: '设备设施安全', score: 'C', icon: 'settings',
            text: '消防设施维保记录断档（2026 年 3 月至今），自动消防设施失效未修复。电梯年检已过期 2 个月。',
            bar: 'c' },
          { id: 'history', label: '历史表现评价', score: 'C', icon: 'clock',
            text: '2025 年因消防设施未保持完好有效被行政处罚 2 次。多次下发整改通知但执行不到位，物业配合度较差。',
            bar: 'c' }
        ],
        hazards: [],
        selfInspections: [
          { date: '2026-06-18', type: '月度自查', items: 8, issues: 3, status: '未整改', statusCls: 'danger',
            detail: '自动消防设施失效（消防主机故障）、灭火器缺失 2 具、消防通道堆放杂物' },
          { date: '2026-05-20', type: '月度自查', items: 8, issues: 2, status: '已完成', statusCls: 'done',
            detail: '应急灯损坏 3 盏 → 已更换；疏散指示标志模糊 1 处 → 已更换' },
          { date: '2026-04-15', type: '季度全面检查', items: 20, issues: 5, status: '已完成', statusCls: 'done',
            detail: '消防泵房控制柜积灰严重 → 已清洁；灭火器压力不足 2 具 → 已更换；防火门闭门器损坏 1 处 → 已修复' },
          { date: '2026-03-10', type: '月度自查', items: 8, issues: 1, status: '已完成', statusCls: 'done',
            detail: '楼道堆物 → 已清理' },
          { date: '2026-02-08', type: '月度自查', items: 8, issues: 0, status: '无异常', statusCls: 'done',
            detail: '' }
        ],
        expertRecords: [
          { date: '2026-06-20', expert: '李明辉', org: '消防安全专家组', type: '专项检查', result: '自动消防设施大面积失效，建议立即维修并报区消防大队备案', status: '已处理', statusCls: 'done' },
          { date: '2026-06-15', expert: '李明辉', org: '消防安全专家组', type: '专项检查', result: '18-25层消防设施失效严重，建议立即采取临时措施', status: '已处理', statusCls: 'done' },
          { date: '2026-06-01', expert: '陈工', org: '第三方安全机构', type: '日常巡查', result: '灭火器过期2具，楼道堆物严重', status: '已处理', statusCls: 'done' },
          { date: '2026-05-15', expert: '陈工', org: '第三方安全机构', type: '复查', result: '应急灯更换已通过，但消防设施年检仍未提供', status: '已处理', statusCls: 'done' },
          { date: '2026-04-20', expert: '李明辉', org: '消防安全专家组', type: '监督检查', result: '消防泵房积灰严重、防火门损坏多处', status: '已处理', statusCls: 'done' },
          { date: '2026-04-01', expert: '陈工', org: '第三方安全机构', type: '复查', result: '灭火器已更换，但消防控制室值班记录缺失', status: '超期复查', statusCls: 'danger' }
        ],
        trainingRecords: [
          { date: '2026-05-25', type: '全员消防演练', instructor: '第三方安全机构', attendees: 32, status: '已完成', detail: '消防疏散演练' },
          { date: '2026-03-15', type: '安全培训', instructor: '李明辉', attendees: 15, status: '已完成', detail: '消防安全基础知识、灭火器使用方法' },
          { date: '2025-12-10', type: '年度安全会议', instructor: '物业经理', attendees: 20, status: '已完成', detail: '年度安全总结、设施维保计划' },
          { date: '2025-09-20', type: '专项培训', instructor: '区消防大队', attendees: 28, status: '已完成', detail: '高层住宅防火、逃生自救知识' }
        ]
      }
    };

    // ════════════════════════════════════════════════════════════════
    // 待确认行动 / 督办包 MOCK DATA
    // ════════════════════════════════════════════════════════════════

    // Agent 识别出的标准化异常
    MOCK.abnormalEvents = [
      {
        id: 'ae-001',
        anomalyType: '整改超期',
        sourceType: '隐患', sourceId: 'HZ001',
        subjectName: '北苑商业综合体', subjectType: '消防重点单位',
        region: '良渚街道', line: '消防安全线',
        riskLevel: '重大风险',
        currentStatus: '超期 3 天，临时管控待确认',
        chain: { responsible: '王志安', executor: '对应专家', coordinator: '良渚街道办', reviewer: '消防安全线负责人', observer: '站长', escalator: '站长' },
        suggestedAction: 'supervise',
        closureStandard: '整改反馈 + 专家复查通过'
      },
      {
        id: 'ae-002',
        anomalyType: '整改超期',
        sourceType: '隐患', sourceId: 'HZ002',
        subjectName: '云栖高层住宅', subjectType: '高层住宅',
        region: '五常街道', line: '消防安全线',
        riskLevel: '较大风险',
        currentStatus: '超期 1 天，整改证据不足',
        chain: { responsible: '李明', executor: '对应专家', coordinator: '五常街道办', reviewer: '消防安全线负责人', observer: '站长', escalator: '站长' },
        suggestedAction: 'supervise',
        closureStandard: '整改反馈 + 专家复查通过'
      },
      {
        id: 'ae-003',
        anomalyType: '整改超期',
        sourceType: '隐患', sourceId: 'HZ004',
        subjectName: '杭州华阳包装材料有限公司', subjectType: '生产企业',
        region: '物流片区', line: '企业安全线',
        riskLevel: '较大风险',
        currentStatus: '自查持续为 0，隐患整改逾期',
        chain: { responsible: '陈芳', executor: '对应专家', coordinator: '物流片区村社', reviewer: '企业安全线负责人', observer: '站长', escalator: '站长' },
        suggestedAction: 'supervise',
        closureStandard: '整改反馈 + 专家复查通过'
      },
      {
        id: 'ae-004',
        anomalyType: '整改超期',
        sourceType: '隐患', sourceId: 'HZ005',
        subjectName: '杭州鑫盛机械制造有限公司', subjectType: '生产企业',
        region: '良渚街道', line: '企业安全线',
        riskLevel: '较大风险',
        currentStatus: '自查 0 次 + 隐患 8 项未整改',
        chain: { responsible: '张毅', executor: '对应专家', coordinator: '良渚街道办', reviewer: '企业安全线负责人', observer: '站长', escalator: '站长' },
        suggestedAction: 'supervise',
        closureStandard: '整改反馈 + 专家复查通过'
      },
      {
        id: 'ae-005',
        anomalyType: '复查失败',
        sourceType: '隐患', sourceId: 'HZ003',
        subjectName: '恒源化工', subjectType: '危化企业',
        region: '仓前街道', line: '企业安全线',
        riskLevel: '较大风险',
        currentStatus: '整改材料未提交，复查超期 5 天',
        chain: { responsible: '李安全', executor: '对应专家', coordinator: '仓前街道办', reviewer: '企业安全线负责人', observer: '站长', escalator: '站长' },
        suggestedAction: 'supervise',
        closureStandard: '整改材料提交 + 专家复核通过'
      },
      {
        id: 'ae-006',
        anomalyType: '进度滞后',
        sourceType: '专项任务', sourceId: 'ZX001',
        subjectName: '高层小区消防设施专项检查', subjectType: '专项任务',
        region: '全片区', line: '消防安全线',
        riskLevel: '一般风险',
        currentStatus: '完成率 42%，时间进度 61%，滞后 19pp',
        chain: { responsible: '张毅', executor: '对应执行组', coordinator: '-', reviewer: '消防安全线负责人', observer: '站长', escalator: '站长' },
        suggestedAction: 'track',
        closureStandard: '专项任务按期完成'
      },
      {
        id: 'ae-007',
        anomalyType: '同类问题集中上升',
        sourceType: '趋势', sourceId: 'TR001',
        subjectName: '物流片区仓储场所', subjectType: '区域趋势',
        region: '物流片区', line: '企业安全线',
        riskLevel: '较大风险',
        currentStatus: '7 家仓储场所整改超期，连续 3 日上升',
        chain: { responsible: '物流片区组长', executor: '对应专家', coordinator: '相关村社', reviewer: '企业安全线负责人', observer: '站长', escalator: '站长' },
        suggestedAction: 'supervise',
        closureStandard: '整改反馈 + 专家复查通过'
      },
      {
        id: 'ae-008',
        anomalyType: '主体履职异常',
        sourceType: '主体对象', sourceId: 'SB001',
        subjectName: '余杭天元纺织厂', subjectType: '生产企业',
        region: '良渚街道', line: '企业安全线',
        riskLevel: '较大风险',
        currentStatus: '多项异常叠加：自查 0 次、培训 15%、检查隐患 6 项',
        chain: { responsible: '陈芳', executor: '对应专家', coordinator: '良渚街道办', reviewer: '企业安全线负责人', observer: '站长', escalator: '站长' },
        suggestedAction: 'track',
        closureStandard: '主体责任评估达标'
      },
      {
        id: 'ae-009',
        anomalyType: '风险等级上调',
        sourceType: '风险预警', sourceId: 'RW001',
        subjectName: '杭州永固建材有限公司', subjectType: '生产企业',
        region: '物流片区', line: '企业安全线',
        riskLevel: '一般风险',
        currentStatus: '风险等级由低风险上调为一般风险',
        chain: { responsible: '物流片区组长', executor: '-', coordinator: '-', reviewer: '企业安全线负责人', observer: '站长', escalator: '站长' },
        suggestedAction: 'observe',
        closureStandard: '持续观察，下一周期评估'
      },
      {
        id: 'ae-010',
        anomalyType: '复查失败',
        sourceType: '隐患', sourceId: 'HZ007',
        subjectName: '余杭东兴精密机械厂', subjectType: '生产企业',
        region: '良渚街道', line: '企业安全线',
        riskLevel: '较大风险',
        currentStatus: '复查未通过，培训不足+自查缺失',
        chain: { responsible: '张毅', executor: '对应专家', coordinator: '良渚街道办', reviewer: '企业安全线负责人', observer: '站长', escalator: '站长' },
        suggestedAction: 'explain',
        closureStandard: '原因说明 + 整改计划提交'
      }
    ];

    // Agent 生成的待确认行动（合并去重后的建议）
    MOCK.pendingActions = [
      {
        id: 'pa-001',
        actionType: 'supervise',
        title: '物流片区仓储场所整改超期集中督办',
        basis: '物流片区 7 家仓储场所整改超期，其中 2 家为较大风险主体，同类问题连续 3 日上升，涉及企业安全线。存在区域性风险蔓延态势，需集中督办。',
        mergedFrom: ['ae-007', 'ae-003', 'ae-004'],
        affectedSubjects: ['杭州华阳包装材料有限公司', '杭州鑫盛机械制造有限公司', '余杭天元纺织厂'],
        affectedAnomalies: 7,
        chain: {
          responsible: { label: '责任人', person: '物流片区组长', task: '提交超期原因和处置计划' },
          executor: { label: '执行人', person: '对应专家', task: '完成 2 家较大风险主体复查安排' },
          coordinator: { label: '协同人', person: '相关村社、主体对象负责人', task: '补交整改反馈材料' },
          reviewer: { label: '复核人', person: '企业安全线负责人', task: '审核处置计划，确认是否需要调整检查安排' },
          observer: { label: '关注人', person: '站长', task: '关注督办进展，超期后确认是否升级' }
        },
        draftItems: [
          { role: '责任人', person: '物流片区组长', task: '提交 7 家主体对象整改超期原因和处置计划', deadline: '今日 17:00', status: 'pending' },
          { role: '执行人', person: '对应专家', task: '完成 2 家较大风险主体复查安排', deadline: '明日 12:00', status: 'pending' },
          { role: '复核人', person: '企业安全线负责人', task: '审核处置计划，确认是否需要调整检查安排', deadline: '明日 17:00', status: 'pending' },
          { role: '协同人', person: '主体对象负责人', task: '补交整改反馈材料', deadline: '3 日内', status: 'pending' },
          { role: '关注人', person: '站长', task: '关注督办进展，超期后确认是否升级', deadline: '持续关注', status: 'pending' }
        ],
        status: 'pending',
        created_at: null
      },
      {
        id: 'pa-002',
        actionType: 'supervise',
        title: '良渚街道消防重点单位隐患超期集中督办',
        basis: '良渚街道 2 家消防重点单位（北苑商业综合体、云栖高层住宅）隐患整改超期，涉及消防安全线。北苑商业综合体消防通道堵塞超期 3 天且反复出现，云栖高层住宅消防设施全面失效超期 1 天。',
        mergedFrom: ['ae-001', 'ae-002'],
        affectedSubjects: ['北苑商业综合体', '云栖高层住宅'],
        affectedAnomalies: 2,
        chain: {
          responsible: { label: '责任人', person: '王志安（北苑）/ 李明（云栖）', task: '分别提交整改进展报告' },
          executor: { label: '执行人', person: '消防安全组', task: '现场核查整改进展并拍照归档' },
          coordinator: { label: '协同人', person: '良渚/五常街道办', task: '协助推进整改' },
          reviewer: { label: '复核人', person: '消防安全线负责人', task: '审核整改方案有效性' },
          observer: { label: '关注人', person: '站长', task: '关注 2 项重大隐患闭环进展' }
        },
        draftItems: [
          { role: '责任人', person: '王志安', task: '提交北苑商业综合体消防通道堵塞整改进展', deadline: '今日 17:00', status: 'pending' },
          { role: '责任人', person: '李明', task: '提交云栖高层住宅消防设施修复进展', deadline: '今日 17:00', status: 'pending' },
          { role: '执行人', person: '消防安全组', task: '现场核查整改情况，拍照归档', deadline: '明日 12:00', status: 'pending' },
          { role: '复核人', person: '消防安全线负责人', task: '审核整改方案', deadline: '明日 17:00', status: 'pending' }
        ],
        status: 'pending',
        created_at: null
      },
      {
        id: 'pa-003',
        actionType: 'track',
        title: '高层小区消防专项进度持续跟进',
        basis: '高层小区消防设施专项检查完成率 42%，时间进度 61%，滞后 19pp。当前不足需要督办级别，但需持续跟进确保不进一步恶化。',
        mergedFrom: ['ae-006'],
        affectedSubjects: ['高层小区消防设施专项'],
        affectedAnomalies: 1,
        chain: {
          responsible: { label: '责任人', person: '张毅（消防安全线）', task: '按周反馈专项进度' },
          executor: { label: '执行人', person: '对应执行组', task: '按计划推进检查' },
          reviewer: { label: '复核人', person: '消防安全线负责人', task: '审核专项完成质量' },
          observer: { label: '关注人', person: '站长', task: '每周关注专项进度' }
        },
        draftItems: [
          { role: '责任人', person: '张毅', task: '每周五提交专项进度报告', deadline: '每周五', status: 'pending' },
          { role: '执行人', person: '对应执行组', task: '按计划推进余下检查', deadline: '月底前', status: 'pending' }
        ],
        status: 'pending',
        created_at: null
      },
      {
        id: 'pa-004',
        actionType: 'explain',
        title: '余杭东兴精密机械厂复查失败原因说明',
        basis: '余杭东兴精密机械厂复查未通过，培训不足+自查缺失。需要先了解具体原因再决定下一步动作。',
        mergedFrom: ['ae-010'],
        affectedSubjects: ['余杭东兴精密机械厂'],
        affectedAnomalies: 1,
        chain: {
          responsible: { label: '责任人', person: '张毅', task: '反馈复查失败具体原因' },
          reviewer: { label: '复核人', person: '企业安全线负责人', task: '判断是否需要调整整改方案' }
        },
        draftItems: [
          { role: '责任人', person: '张毅', task: '反馈复查失败具体原因', deadline: '明日 12:00', status: 'pending' },
          { role: '复核人', person: '企业安全线负责人', task: '判断后续处理方式', deadline: '明日 17:00', status: 'pending' }
        ],
        status: 'pending',
        created_at: null
      }
    ];

    // 确认后的督办包（初始为空，确认后动态填充）
    MOCK.supervisionPackages = [];
    MOCK.supervisionItems = [];

    // 已确认的督办包（用于展示历史已确认过的，初始有一些示例）
    MOCK.confirmedPackages = [
      {
        id: 'sp-001',
        title: '生产企业隐患整改逾期集中督办',
        actionType: 'supervise',
        status: '推进中',
        chain: { responsible: '生产企业条线负责人', executor: '对应专家', coordinator: '相关企业', reviewer: '条线负责人', observer: '站长' },
        draftItems: [
          { role: '责任人', person: '生产企业条线负责人', task: '提交逾期处置计划', deadline: '已完成', status: 'done' },
          { role: '执行人', person: '对应专家', task: '复核高风险主体', deadline: '进行中', status: 'in_progress' },
          { role: '协同人', person: '相关企业', task: '补交整改材料', deadline: '超期', status: 'overdue' }
        ],
        createdAt: '2026-06-22',
        itemCount: 3,
        feedbackCount: 1,
        doneCount: 1,
        overdueCount: 1
      },
      {
        id: 'sp-002',
        title: '物流片区仓储场所整改超期集中督办',
        actionType: 'supervise',
        status: '推进中',
        chain: { responsible: '物流片区组长', executor: '对应专家', coordinator: '村社、主体对象负责人', reviewer: '企业安全线负责人', observer: '站长' },
        draftItems: [
          { role: '责任人', person: '物流片区组长', task: '提交7家主体整改超期原因和处置计划', deadline: '今日 17:00', status: 'pending' },
          { role: '执行人', person: '对应专家', task: '完成2家较大风险主体复查安排', deadline: '明日 12:00', status: 'pending' },
          { role: '复核人', person: '企业安全线负责人', task: '审核处置计划，确认是否需要调整检查安排', deadline: '明日 17:00', status: 'pending' },
          { role: '协同人', person: '主体对象负责人', task: '补交整改反馈材料', deadline: '3日内', status: 'pending' },
          { role: '关注人', person: '站长', task: '关注督办进展，超期后确认是否升级', deadline: '持续关注', status: 'pending' }
        ],
        createdAt: '2026-06-24',
        itemCount: 5,
        feedbackCount: 0,
        doneCount: 0,
        overdueCount: 0
      },
      {
        id: 'sp-003',
        title: '良渚街道消防重点单位隐患超期督办',
        actionType: 'supervise',
        status: '推进中',
        chain: { responsible: '王志安/李明', executor: '消防安全组', coordinator: '良渚/五常街道办', reviewer: '消防安全线负责人', observer: '站长' },
        draftItems: [
          { role: '责任人', person: '王志安', task: '提交北苑商业综合体消防通道堵塞整改进展', deadline: '已完成', status: 'done' },
          { role: '责任人', person: '李明', task: '提交云栖高层住宅消防设施修复进展', deadline: '已完成', status: 'done' },
          { role: '执行人', person: '消防安全组', task: '现场核查整改情况，拍照归档', deadline: '进行中', status: 'in_progress' },
          { role: '复核人', person: '消防安全线负责人', task: '审核整改方案有效性', deadline: '明日 17:00', status: 'pending' }
        ],
        createdAt: '2026-06-23',
        itemCount: 4,
        feedbackCount: 2,
        doneCount: 2,
        overdueCount: 0
      },
      {
        id: 'sp-004',
        title: '余杭东兴精密机械厂复查失败整改',
        actionType: 'explain',
        status: '已完成',
        chain: { responsible: '张毅', reviewer: '企业安全线负责人' },
        draftItems: [
          { role: '责任人', person: '张毅', task: '反馈复查失败具体原因', deadline: '已完成', status: 'done' },
          { role: '复核人', person: '企业安全线负责人', task: '判断后续处理方式', deadline: '已完成', status: 'done' }
        ],
        createdAt: '2026-06-20',
        itemCount: 2,
        feedbackCount: 2,
        doneCount: 2,
        overdueCount: 0
      },
      {
        id: 'sp-005',
        title: '高层小区消防专项进度跟进',
        actionType: 'track',
        status: '需升级',
        chain: { responsible: '张毅（消防安全线）', executor: '对应执行组', reviewer: '消防安全线负责人', observer: '站长' },
        draftItems: [
          { role: '责任人', person: '张毅', task: '每周五提交专项进度报告', deadline: '超期3日', status: 'overdue' },
          { role: '执行人', person: '对应执行组', task: '按计划推进余下检查（完成率42%）', deadline: '超期', status: 'overdue' },
          { role: '复核人', person: '消防安全线负责人', task: '审核专项完成质量', deadline: '超期1日', status: 'overdue' }
        ],
        createdAt: '2026-06-18',
        itemCount: 3,
        feedbackCount: 0,
        doneCount: 0,
        overdueCount: 3
      }
    ];

    // ════════════════════════════════════════════════════════════════
    // STATE
    // ════════════════════════════════════════════════════════════════

    var state = {
      activeScene: 'dashboard',
      selectedPAIds: {}  // { paId: true } — 批量选中的待确认行动
    };

    // ════════════════════════════════════════════════════════════════
    // SCENE RENDERERS
    // ════════════════════════════════════════════════════════════════

    // ─── 状态渲染辅助 ────────────────────────────────────────────
    function renderLoading(msg) {
      return '<div class="state-loading"><div class="spinner"></div><div class="state-text">' + (msg || '加载中…') + '</div></div>';
    }
    function renderEmpty(msg, desc) {
      return '<div class="state-empty"><div class="state-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7"/><path d="M21 3H3v4h18V3Z"/></svg></div><div class="state-title">' + (msg || '暂无数据') + '</div>' + (desc ? '<div class="state-desc">' + desc + '</div>' : '') + '</div>';
    }
    function renderError(msg, desc) {
      return '<div class="state-error"><div class="state-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><div class="state-title">' + (msg || '加载失败') + '</div>' + (desc ? '<div class="state-desc">' + desc + '</div>' : '') + '</div>';
    }

    function renderScene(sceneId) {
      var container = $dom.sceneContent;

      // ─── Loading 状态 ────────────────────────────────────────────
      container.innerHTML = renderLoading();

      // 用 setTimeout 让 loading 先渲染，再生成实际内容
      setTimeout(function() {
        var html = '';
        try {
          switch (sceneId) {
            case 'dashboard': html = renderDashboard(); break;
            case 'hazard-report': html = renderHazardReport(); break;
            case 'efficiency': html = renderEfficiency(); break;
            case 'responsibility': html = renderResponsibility(); break;
            case 'disposal': html = renderDisposal(); break;
            case 'followup': html = renderFollowup(); break;
            case 'pending-actions': html = renderPendingActions(); break;
            case 'supervision-track': html = renderSupervisionTrack(); break;
            case 'monthly-report': html = renderMonthlyReport(); break;
            default: html = renderDashboard();
          }
          // ─── Empty 状态（内容为空时） ──────────────────────────
          if (!html || html.trim().length === 0) {
            html = renderEmpty('暂无内容', '当前场景暂无数据显示');
          }
        } catch(e) {
          // ─── Error 状态 ──────────────────────────────────────────
          html = renderError('渲染异常', '请尝试刷新页面或切换场景。' + (e.message ? ' (' + e.message + ')' : ''));
        }
        container.innerHTML = html;
        lucide.createIcons();
        // 同步批量操作栏状态
        if (sceneId === 'pending-actions') { updateBatchBar(); }
      }, 80); // 80ms 模拟加载延迟
    }

    // ─── 主控 Agent 扩展内容（初始化后总控台顶部显示） ──────────
    function renderDashboardAgentExtras() {
      if (typeof YAQ.renderAgentEnabledHTML === 'function') {
        return YAQ.renderAgentEnabledHTML();
      }
      return '';
    }

    // ─── Dashboard ───────────────────────────────────────────────────

    function renderDashboard() {
      var p = MOCK.priority;

      var html = '';

      // ─── 首次诊断后跳过 Agent 扩展内容和问候 ──────────────
      if (ls.get('yaq_agent_initialized') === 'true') {
        // 初始化后直接显示日报，不展示扩展条和问候
      }

      // ─── 问候 ──────────────────────────────────────────────────
      var hour = new Date().getHours();
      var greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
      html += '<div class="ai-briefing">' +
        '<div class="ai-briefing-left">' +
          '<div class="ai-avatar"><i data-lucide="bot" width="16" height="16"></i></div>' +
        '</div>' +
        '<div class="ai-briefing-body">' +
          '<div class="ai-briefing-head"><span>' + greeting + '，站长。今天 4 个方向需要关注：安全态势 1 项、风险闭环 1 项、任务进展 1 项、待确认行动 ' + (MOCK.actionItems ? MOCK.actionItems.length : 0) + ' 项。</span><button class="agent-config-btn" onclick="openAgentConfig(\'dashboard\')" title="查看 Agent 配置"><i data-lucide="settings-2" width="14" height="14"></i></button></div>' +
        '</div>' +
      '</div>';

      // ─── 整体安全态势（指标卡两排） ────────────────────────────
      // 四级风险统计
      var majorRisk = 2, significantRisk = 2, generalRisk = 8, lowRisk = 72;

      // ═══ 指标定义：按周期展开 ═══════════════════════════════════
      var metricPrefs = JSON.parse(ls.get('yaq_metric_prefs', 'null'));
      var baseMetrics = [
        // 运营概览
        { id: 'subjectTotal', label: '安全责任主体总数', value: '2028', group: '监管概况', type: '时点', desc: '当前纳入监管范围的责任主体对象总量' },
        { id: 'coverageCum', label: '覆盖户数', value: '2028', group: '监管概况', type: '累计', desc: '从年初到当前累计被检查或监管触达的主体户数' },
        { id: 'coveragePeriod', label: '覆盖户数', value: '368', group: '监管概况', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内被检查或监管触达过的主体对象数量' },
        { id: 'coverageRate', label: '主体覆盖率', value: '100%', group: '监管概况', type: '闭环率', periods: ['本月','本季','本年'], desc: '已覆盖主体占全部责任主体的比例' },
        // 新增指标
        { id: 'riskLevelUp', label: '风险等级上调', value: '3', group: '监管概况', type: '期间', periods: ['本周'], alert: 'warning',
          desc: '统计周期内风险等级较基准上调的责任主体数量',
          compare: { baselineLabel: '上周', baselineValue: '2', delta: '+1', isBad: true } },
        { id: 'newMajorSignificant', label: '新增重大/较大风险主体', value: '2', group: '监管概况', type: '期间', periods: ['本周'], alert: 'warning',
          desc: '统计周期内新认定的重大或较大风险责任主体数量',
          compare: { baselineLabel: '上周', baselineValue: '2', delta: '持平', isBad: false } },
        // 检查执法
        { id: 'inspectTotal', label: '检查次数', value: '86', group: '监管执法', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内完成的检查总次数（日常监管+监督检查）',
          compare: { baselineLabel: '昨日', baselineValue: '72', delta: '▲ 19%', isBad: false } },
        { id: 'dailyInspect', label: '日常监管次数', value: '54', group: '监管执法', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内完成的日常监管检查次数' },
        { id: 'superviseInspect', label: '监督检查次数', value: '32', group: '监管执法', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内完成的监督检查次数' },
        { id: 'pushHousehold', label: '检查单推送户数', value: '186', group: '监管执法', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内被推送检查单的主体户数' },
        { id: 'pushCount', label: '检查单推送次数', value: '245', group: '监管执法', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内推送检查单的总次数' },
        { id: 'closeCount', label: '检查单办结数量', value: '198', group: '监管执法', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内完成办结的检查单数量' },
        { id: 'closeRate', label: '检查单办结率', value: '80.8%', group: '监管执法', type: '闭环率', periods: ['本月','本季','本年'], desc: '统计周期内办结检查单占应办结检查单的比例',
          compare: { baselineLabel: '目标', baselineValue: '95%', delta: '▼ 14.2pp', isBad: true } },
        { id: 'unclosedCount', label: '检查单未办结数', value: '47', group: '监管执法', type: '时点', alert: 'warning', desc: '已推送但截至统计时间仍未办结的检查单数量' },
        // 隐患闭环
        { id: 'newHazardPeriod', label: '新增隐患', value: '24', group: '隐患闭环', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内新发现的隐患数量',
          compare: { baselineLabel: '昨日', baselineValue: '18', delta: '▲ 33%', isBad: true } },
        { id: 'hazardCum', label: '累计隐患数', value: '2454', group: '隐患闭环', type: '累计', desc: '从年初到当前累计发现的隐患总数' },
        { id: 'openHazard', label: '未闭环隐患', value: '548', group: '隐患闭环', type: '时点', alert: 'warning', desc: '截至统计时间仍未完成整改闭环的全部隐患数量',
          compare: { baselineLabel: '昨日', baselineValue: '532', delta: '▲ 3%', isBad: true } },
        { id: 'fixedPeriod', label: '整改完成', value: '36', group: '隐患闭环', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内完成整改闭环的隐患数量' },
        { id: 'fixedCum', label: '累计整改完成', value: '1906', group: '隐患闭环', type: '累计', desc: '从年初到当前累计完成整改闭环的隐患数量' },
        { id: 'rectifyRate', label: '隐患整改率', value: '77.7%', group: '隐患闭环', type: '闭环率', periods: ['本月','本季','本年'], desc: '统计周期内隐患整改闭环的比例',
          compare: { baselineLabel: '目标', baselineValue: '90%', delta: '▼ 12.3pp', isBad: true } },
        // 重大隐患
        { id: 'majorNew', label: '新增重大隐患', value: '2', group: '重大隐患', type: '期间', periods: ['今日','本周','本月','本季','本年'], alert: 'danger',
          desc: '统计周期内新发现的重大隐患数量',
          compare: { baselineLabel: '昨日', baselineValue: '0', delta: '▲ 2', isBad: true },
          drilldown: [
            { name: '北苑商业综合体', line: '消防安全组', type: '消防通道堵塞', status: '新增', statusText: '新发现', statusCls: 'danger', detail: '消防通道被货物大面积占用，存在严重安全隐患', person: '王志安', foundDate: '2026-06-29', deadline: '2026-07-06', overdue: 0, source: '日常巡查', region: '良渚街道' },
            { name: '云栖高层住宅', line: '消防安全组', type: '消防设施失效', status: '新增', statusText: '新发现', statusCls: 'danger', detail: '自动喷淋系统故障导致18-25层消防设施大面积失效', person: '李明', foundDate: '2026-06-29', deadline: '2026-07-06', overdue: 0, source: '专项检查', region: '五常街道' }
          ],
          aiAnalysis: [
            { label: '趋势分析', text: '昨日新增0项→今日新增2项，环比上升200%。均为消防安全组管辖的公共聚集场所，涉及人员密集场所安全。' },
            { label: '风险推演', text: '若今日新增项未在48小时内启动整改，将与现有超期项叠加（消防安全组超期2项→4项），影响本月闭环率目标（当前77.7%→可能跌破70%）。' }
          ] },
        { id: 'majorCum', label: '累计重大隐患', value: '12', group: '重大隐患', type: '累计' },
        { id: 'majorOpen', label: '未闭环重大隐患', value: '5', group: '重大隐患', type: '时点', alert: 'danger', desc: '截至当前仍未完成整改闭环的重大隐患数量',
          compare: { baselineLabel: '上周', baselineValue: '4', delta: '+1', isBad: true }, drilldown: [
            { name: '北苑商业综合体', line: '消防安全组', type: '消防通道堵塞', status: '超期', statusText: '超期未整改', statusCls: 'danger', detail: '消防通道被货架和杂物严重堵塞，宽度不足1.2米', person: '王志安', foundDate: '2026-06-10', deadline: '2026-06-22', overdue: 3, source: '日常巡查', region: '良渚街道' },
            { name: '云栖高层住宅', line: '消防安全组', type: '消防设施失效', status: '超期', statusText: '超期未整改', statusCls: 'danger', detail: '自动喷淋系统、烟感探测器大面积失效，覆盖18-25层', person: '李明', foundDate: '2026-06-15', deadline: '2026-06-24', overdue: 1, source: '专项检查', region: '五常街道' },
            { name: '恒源化工', line: '企业安全组', type: '危化品标识缺失', status: '整改中', statusText: '整改推进中', statusCls: 'warning', detail: '危化品存储区警示标识缺失，未设置临时围挡和出入登记', person: '李安全', foundDate: '2026-06-20', deadline: '2026-07-26', overdue: 0, source: '监督检查', region: '仓前街道' },
            { name: '杭州鑫盛机械制造有限公司', line: '企业安全组', type: '自查缺失', status: '整改中', statusText: '整改推进中', statusCls: 'warning', detail: '近30天企业自查0次，政府检查发现隐患8项未整改', person: '张毅', foundDate: '2026-06-18', deadline: '2026-07-10', overdue: 0, source: '系统预警', region: '良渚街道' },
            { name: '余杭天元纺织厂', line: '企业安全组', type: '异常叠加', status: '未启动', statusText: '尚未启动整改', statusCls: 'neutral', detail: '多项隐患叠加：疏散通道堵塞、灭火器过期、电气线路私拉乱接', person: '陈芳', foundDate: '2026-06-22', deadline: '2026-07-15', overdue: 0, source: '现场检查', region: '良渚街道' }
          ],
          aiAnalysis: [
            { label: '关联分析', text: '消防安全组2项超期（北苑商业综合体逾期3天、云栖高层住宅逾期1天），与该组"复查闭环率68%（↓6pp）"数据关联——复查环节效率不足。该组人均日处理量估算为4.2项，当前日均新增+待复查量约6.8项/人，人力已超饱和约62%。建议排查复查人力配置或抽查任务排序。' },
            { label: '交叉验证', text: '北苑商业综合体消防通道堵塞为反复出现项（本月已发生第3次），与"重点监管主体异常"中该主体的记录吻合。单一主体的反复问题需从管理机制入手，建议约谈物业管理方而非仅单次整改。' },
            { label: '特征分析', text: '企业安全组3项（杭州恒源化工有限公司、杭州鑫盛机械制造有限公司、余杭天元纺织厂）均位于良渚片区，与"良渚片重大风险检查任务覆盖141家、完成率0%"数据吻合。同片区多家企业同时出问题，存在区域性风险集中特征。良渚片整体自查率仅43%，企业端配合度偏低。' }
          ] },
        { id: 'majorFixed', label: '重大隐患整改完成', value: '1', group: '重大隐患', type: '期间', periods: ['今日','本周','本月','本季','本年'] },
        { id: 'majorRectifyRate', label: '重大隐患整改率', value: '58.3%', group: '重大隐患', type: '闭环率', periods: ['本月','本季','本年'] },
        // 风险分类
        { id: 'majorRisk', label: '重大风险', value: '' + majorRisk, group: '风险分类', type: '期间', periods: ['本周', '本月', '本季', '本年'], alert: 'warning', desc: '对公共安全构成直接重大威胁，需每月检查', valueColor: 'var(--red)',
          compare: { baselineLabel: '上周', baselineValue: '1', delta: '+1', isBad: true } },
        { id: 'significantRisk', label: '较大风险', value: '' + significantRisk, group: '风险分类', type: '期间', periods: ['本周', '本月', '本季', '本年'], desc: '风险较高需要重点管控，需每季度检查', valueColor: '#d97706',
          compare: { baselineLabel: '上周', baselineValue: '3', delta: '-1', isBad: false } },
        { id: 'generalRisk', label: '一般风险', value: '' + generalRisk, group: '风险分类', type: '期间', periods: ['本周', '本月', '本季', '本年'], desc: '常规风险正常管控，需每半年检查', valueColor: '#ca8a04',
          compare: { baselineLabel: '上周', baselineValue: '7', delta: '+1', isBad: true } },
        { id: 'lowRisk', label: '低风险', value: '' + lowRisk, group: '风险分类', type: '期间', periods: ['本周', '本月', '本季', '本年'], desc: '风险较低维持日常巡查，抽样检查', valueColor: 'var(--blue)',
          compare: { baselineLabel: '上周', baselineValue: '74', delta: '-2', isBad: true } },
        { id: 'areaRiskAbnormal', label: '风险上升片区', value: '2', group: '区域风险', type: '期间', periods: ['今日','本周','本月'], alert: 'warning', desc: '隐患、逾期项环比上升或重大隐患集中复发的片区数量',
          compare: { baselineLabel: '上周', baselineValue: '1', delta: '+1', isBad: true },
          drilldown: [
            { name: '物流片区', line: '企业安全组', type: '风险上升', status: '上升', statusText: '▲ 风险上升', statusCls: 'danger', detail: '新增隐患12项（环比+3），逾期未整改从1项增至4项，重大隐患2项均为本周新认定。杭州华阳包装材料有限公司自查持续为0，为新增重点监管主体。', person: '陈芳', region: '物流片', foundDate: '2026-06-24', deadline: '持续跟进' },
            { name: '良渚街道', line: '企业安全组 & 消防安全组', type: '风险集中', status: '上升', statusText: '▲ 风险上升', statusCls: 'danger', detail: '新增隐患16项（环比+5），逾期未整改累积5项。企业安全组（杭州鑫盛机械制造有限公司、余杭天元纺织厂）和消防安全组（北苑商业综合体）同区多主体异常叠加。辖区自查率仅43%，企业端配合度偏低。', person: '王志安 / 张毅', region: '良渚街道', foundDate: '2026-06-22', deadline: '持续跟进' }
          ],
          aiAnalysis: [
            { label: '特征分析', text: '2个风险上升片区类型不同：物流片为"自查缺失→检查漏出→逾期蔓延"的单线恶化；良渚为多主体、跨条线异常叠加，且自查率系统性偏低（43%），属于区域性管理缺失。' },
            { label: '关联分析', text: '物流片区组长陈芳同时出现在重大隐患列表（余杭天元纺织厂），该片区逾期从1项飙升至4项，且同期新增重大隐患，符合"风险上升片区"判定。良渚街道与"重点监管主体异常"的8家中4家重合，异常密度最高。' }
          ] },
        // 今日聚焦（站长每日必看）
        { id: 'dueToday', label: '到期整改事项', value: '3', group: '今日聚焦', type: '期间', periods: ['今日','本周','本月'], alert: 'warning', desc: '整改期限为今日且需要今日跟进的隐患或整改事项数量',
          compare: { baselineLabel: '昨日', baselineValue: '2', delta: '▲ 1', isBad: true },
          drilldown: [
            { name: '北苑商业综合体', line: '消防安全组', type: '整改确认', status: '今日到期', detail: '消防通道堵塞整改确认', region: '良渚街道' },
            { name: '恒源化工', line: '企业安全组', type: '整改验收', status: '今日到期', detail: '危化品标识整改验收', region: '仓前街道' },
            { name: '杭州永固建材有限公司', line: '企业安全组', type: '培训整改', status: '今日到期', detail: '培训到期整改', region: '物流片' }
          ],
          aiAnalysis: [
            { label: '优先级建议', text: '3项均为今日到期，涉及3个责任主体。建议优先处理北苑商业综合体（消防通道堵塞）——该主体已有超期记录，若今日未完成将转为第2项超期，进一步拉低消防安全组指标。其次处理恒源化工（危化品标识验收），已有整改方案，验收通过概率较高。' },
            { label: '资源评估', text: '杭州永固建材有限公司为培训到期整改，可由企业自行完成线上培训后提交凭证，无需现场核查，建议作为"自行整改"处理以减轻一线人力压力。' }
          ] },
        { id: 'abnormalSubject', label: '重点监管主体异常', value: '8', group: '今日聚焦', type: '时点', alert: 'danger', desc: '重点监管主体中存在风险上升、长期未登录、自查异常、隐患反复等异常的数量',
          drilldown: [
            { name: '恒源化工', line: '企业安全组', type: '风险上升', status: '超期', detail: '危化品隐患超期', region: '仓前街道' },
            { name: '杭州鑫盛机械制造有限公司', line: '企业安全组', type: '自查缺失', status: '异常', detail: '自查0次+隐患8项', region: '良渚街道' },
            { name: '余杭天元纺织厂', line: '企业安全组', type: '异常叠加', status: '异常', detail: '多项异常叠加', region: '良渚街道' },
            { name: '杭州华阳包装材料有限公司', line: '企业安全组', type: '自查缺失', status: '异常', detail: '自查持续为0', region: '物流片' },
            { name: '余杭东兴精密机械厂', line: '安全生产组', type: '培训缺失', status: '异常', detail: '培训不足+自查缺失', region: '良渚街道' },
            { name: '北苑商业综合体', line: '消防安全组', type: '隐患反复', status: '超期', detail: '消防通道反复堵塞', region: '良渚街道' },
            { name: '云栖高层住宅', line: '消防安全组', type: '设施失效', status: '超期', detail: '消防设施全面失效', region: '五常街道' },
            { name: '高层小区消防专项', line: '消防安全组', type: '进度滞后', status: '滞后', detail: '完成率仅42%', region: '全片区' }
          ],
          aiAnalysis: [
            { label: '特征分析', text: '8家异常主体中，5家属于企业安全组管辖的工贸企业（杭州恒源化工有限公司、杭州鑫盛机械制造有限公司、余杭天元纺织厂、杭州华阳包装材料有限公司、余杭东兴精密机械厂），共性特征为"自查持续为0"。其中4家自查为0的同时培训完成率低于40%，企业安全主体责任落实存在系统性缺失。' },
            { label: '关联分析', text: '自查缺失的企业——杭州鑫盛机械制造有限公司、余杭东兴精密机械厂、杭州华阳包装材料有限公司——同期政府检查隐患数分别为8项、5项、4项。自查0 vs 政府查出一大堆，"自查与检查差异"显著，企业可能是在敷衍自查或根本未开展。建议安排专项抽查核实。' },
            { label: '风险推演', text: '消防安全组3项异常（北苑、云栖、高层专项）均与高层建筑消防相关。考虑到当前消防安全组复查闭环率仅68%，若不增加该组支援力量，本月闭环率可能跌破65%的警戒线，触发上级督办。' }
          ] },
        { id: 'taskCompleteRate', label: '检查任务完成率', value: '82%', group: '今日聚焦', type: '闭环率', periods: ['今日','本周','本月'], desc: '今日已完成检查任务占今日应完成检查任务的比例',
          compare: { baselineLabel: '目标', baselineValue: '95%', delta: '▼ 13pp', isBad: true } },
        // 主体责任
        { id: 'riskUpSubjects', label: '风险上升主体数', value: '3', group: '主体责任', type: '期间', periods: ['今日','本周','本月'], alert: 'warning', desc: '统计周期内风险等级上升或风险指标明显变差的主体对象数量' },
        { id: 'selfCheckAbnormal', label: '自查异常主体数', value: '5', group: '主体责任', type: '时点', alert: 'warning', desc: '未按要求自查、长期不上报或自查质量异常的主体数量' },
        { id: 'selfCheckDiff', label: '自查与检查差异主体数', value: '8', group: '主体责任', type: '期间', periods: ['本周','本月','本季','本年'], desc: '企业自查隐患明显少于政府检查隐患的主体数量' },
        { id: 'repeatSubjects', label: '隐患反复主体数', value: '4', group: '主体责任', type: '期间', periods: ['本月','本季','本年','近30天'], alert: 'warning', desc: '反复出现同类隐患或整改后复发的主体对象数量' },
        // 履职效能
        { id: 'staffAbnormal', label: '一线履职异常数', value: '3', group: '履职效能', type: '期间', periods: ['今日','本周','本月'], alert: 'warning', desc: '任务完成率低、隐患发现率异常低、复查闭环慢的人员或小组数量' },
        { id: 'expertAbnormal', label: '专家履职异常数', value: '1', group: '履职效能', type: '期间', periods: ['本周','本月','本季','本年'], alert: 'warning', desc: '检查、重大隐患发现、复核销号等低于要求的专家数量' },
        // 区域风险
        // 风险结构
        { id: 'topHazardTypes', label: '高频隐患类型TOP', value: '3', group: '风险结构', type: '期间', periods: ['近7天','今日','本周','本月','本季','本年'], desc: '统计周期内出现频次最高的隐患类型排行' },
        // 专项任务
        { id: 'taskCompletionRate', label: '专项任务完成率', value: '63%', group: '专项任务', type: '闭环率', periods: ['本月','本季','本年'], desc: '某专项任务已完成量占计划量的比例' },
        { id: 'taskLagging', label: '专项任务滞后数', value: '2', group: '专项任务', type: '期间', periods: ['截至目前','本周','本月'], alert: 'warning', desc: '进度低于计划节奏的专项任务数量' },
        // 执法处置
        { id: 'penaltyCount', label: '立案处罚数', value: '3', group: '执法处置', type: '期间', periods: ['今日','本周','本月','本季','本年','累计'], desc: '统计周期内立案处罚的主体对象数量' },
        { id: 'rectifyOrderCount', label: '整改指令书下发数', value: '18', group: '执法处置', type: '期间', periods: ['今日','本周','本月','本季','本年','累计'], desc: '统计周期内下发整改指令书数量' }
      ];

      // 展开：每个期间指标按周期拆成独立卡片
      // 站长每日工作台默认 9 个指标
      var dailyDefaults = {
        majorOpen:1, 'majorNew_今日':1,
        'taskCompleteRate_今日':1,
        'majorRisk_本周':1, 'significantRisk_本周':1, 'generalRisk_本周':1, 'lowRisk_本周':1,
        'areaRiskAbnormal_本周':1,
        'riskLevelUp_本周':1, 'newMajorSignificant_本周':1
      };
      var allMetrics = [];
      for (var bi = 0; bi < baseMetrics.length; bi++) {
        var bm = baseMetrics[bi];
        if (bm.periods) {
          for (var pi = 0; pi < bm.periods.length; pi++) {
            var period = bm.periods[pi];
            allMetrics.push({
              id: bm.id + '_' + period,
              label: bm.label,
              value: bm.value,
              group: bm.group,
              type: bm.type,
              period: period,
              valueColor: bm.valueColor || '',
              alert: bm.alert || '',
              desc: bm.desc || '',
              compare: bm.compare || null,
              drilldown: bm.drilldown || null,
              aiAnalysis: bm.aiAnalysis || null
            });
          }
        } else {
          allMetrics.push({
            id: bm.id,
            label: bm.label,
            value: bm.value,
            group: bm.group,
            type: bm.type,
            period: '',
            valueColor: bm.valueColor || '',
            alert: bm.alert || '',
            desc: bm.desc || '',
            compare: bm.compare || null,
            drilldown: bm.drilldown || null,
            aiAnalysis: bm.aiAnalysis || null
          });
        }
      }

      // 检测存储版本，不匹配则重置（指标结构变了）
      if (ls.get('yaq_metric_ver') != YAQ.STORAGE_VERSION) {
        ls.remove('yaq_metric_prefs');
        ls.remove('yaq_metric_order');
        ls.remove('yaq_metric_ver');
        metricPrefs = null;
      }
      for (var mi = 0; mi < allMetrics.length; mi++) {
        var m = allMetrics[mi];
        m.checked = metricPrefs ? (metricPrefs[m.id] !== false) : !!dailyDefaults[m.id];
      }
      window.__allMetrics = allMetrics;
      // 加载排序
      var savedOrder = JSON.parse(ls.get('yaq_metric_order', 'null'));
      window.__metricOrder = savedOrder || allMetrics.filter(function(m) { return m.checked; }).map(function(m) { return m.id; });
      // 写入版本号
      if (!metricPrefs) ls.set('yaq_metric_ver', YAQ.STORAGE_VERSION);

      // 态势摘要
      var summaryText = '整体可控，重点监管池稳定；物流等 2 个片区出现风险上升信号。';

      html += '<div class="info-card" id="situationCard">' +
        '<div class="info-card-head" style="flex-wrap:wrap;gap:0">' +
          '<h3><i data-lucide="activity" aria-hidden="true" style="color:var(--accent)"></i> 整体安全态势</h3>' +
          '<div style="position:relative;margin-left:auto">' +
            '<button class="metric-config-btn" onclick="openMetricConfig()" title="配置指标"><i data-lucide="sliders-horizontal" width="15" height="15"></i></button>' +
          '</div>' +
          '<div style="width:100%;font-size:13px;font-weight:500;color:var(--text);line-height:1.5;margin-top:3px">' + summaryText + '</div>' +
        '</div>' +
        '<div class="metric-row" id="metricRow">' +
          renderSelectedMetrics(allMetrics) +
        '</div>' +
      '</div>';

      // ─── 重大隐患数据预计算 ──────────────────────────────
      // 只展示重大隐患，未闭环/未完成排前面
      var majorHazards = [];
      for (var ti = 0; ti < MOCK.hazards.length; ti++) {
        if (MOCK.hazards[ti].level === '重大事故隐患') majorHazards.push(MOCK.hazards[ti]);
      }
      majorHazards.sort(function(a,b) {
        var aDone = a.status === '已完成' ? 1 : 0;
        var bDone = b.status === '已完成' ? 1 : 0;
        return aDone - bDone;
      });
      window.__majorHazards = majorHazards;

      // 统计
      var totalMajor = majorHazards.length;
      var overdueCount = 0, doneCount = 0;
      var overdueNames = [];
      for (var si = 0; si < majorHazards.length; si++) {
        if (majorHazards[si].status === '超期未整改') {
          overdueCount++;
          overdueNames.push(majorHazards[si].object + '（逾期 ' + majorHazards[si].overdue + ' 天）');
        } else if (majorHazards[si].status === '已完成') doneCount++;
      }

      // 风险闭环 AI 解读
      var riskSummary = '';
      if (totalMajor > 0) {
        if (overdueCount > 0) {
          riskSummary = '本月共 ' + totalMajor + ' 个重大隐患，其中 ' + overdueCount + ' 个已超期未整改';
        } else if (doneCount === totalMajor) {
          riskSummary = '本月 ' + totalMajor + ' 个重大隐患已全部完成整改闭环。';
        } else {
          riskSummary = '本月共 ' + totalMajor + ' 个重大隐患，已完成 ' + doneCount + ' 个，其余整改推进中。';
        }
      } else {
        riskSummary = '本月暂无重大隐患记录。';
      }
      // ─── 板块二：关键风险闭环 ──────────────────────────────────
      html +=
      '<div class="info-card">' +
        '<div class="info-card-head" style="flex-wrap:wrap;gap:0">' +
          '<h3><i data-lucide="shield-alert" aria-hidden="true" style="color:var(--red)"></i> 关键风险闭环</h3>' +
          '<div style="width:100%;font-size:13px;font-weight:500;color:var(--text);line-height:1.5;margin-top:3px">' + riskSummary + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;overflow-x:auto;padding:2px 0">';
      var shownCount = 0;
      // 第一轮：未闭环
      for (var hi = 0; hi < majorHazards.length && shownCount < 3; hi++) {
        var h = majorHazards[hi];
        if (h.status === '已完成') continue;
        shownCount++;
        html += '<div class="hazard-card" style="flex:0 0 240px;min-width:220px;cursor:pointer" onclick="openHazardDetail(\'' + h.object + '\')" title="点击查看详情">' +
          '<div class="hc-head">' +
            '<span class="hc-name">' + escapeHtml(h.object) + '</span>' +
          '</div>' +
          '<div class="hc-desc">' + h.hazard.split('\n')[0] + '</div>' +
          '<div class="hc-meta">' +
            '<span>来源 ' + h.source + '</span>' +
            '<span class="hc-status ' + h.statusCls + '">' + h.status + '</span>' +
            '<span>逾期 ' + (h.overdue > 0 ? h.overdue + '天' : '—') + '</span>' +
          '</div>' +
          '<div class="hc-time">' + h.foundDate + ' → ' + h.deadline + '</div>' +
        '</div>';
      }
      // 第二轮：已完成
      var doneShown = 0;
      for (var hi2 = 0; hi2 < majorHazards.length && doneShown < 2; hi2++) {
        var h2 = majorHazards[hi2];
        if (h2.status !== '已完成') continue;
        doneShown++;
        html += '<div class="hazard-card" style="flex:0 0 240px;min-width:220px;cursor:pointer;opacity:0.75" onclick="openHazardDetail(\'' + h2.object + '\')" title="点击查看详情">' +
          '<div class="hc-head">' +
            '<span class="hc-name">' + escapeHtml(h2.object) + '</span>' +
          '</div>' +
          '<div class="hc-desc">' + h2.hazard.split('\n')[0] + '</div>' +
          '<div class="hc-meta">' +
            '<span>来源 ' + h2.source + '</span>' +
            '<span class="hc-status done">已闭环</span>' +
            '<span>—</span>' +
          '</div>' +
          '<div class="hc-time">' + h2.foundDate + ' → ' + h2.deadline + '</div>' +
        '</div>';
      }
      html += '</div></div>';

      // ─── 板块三：核心任务进展 ────────────────────────────────
      var tasks = MOCK.tasks;
      var lagCount = 0;
      for (var ti = 0; ti < tasks.length; ti++) { if (tasks[ti].lag) lagCount++; }
      html +=
      '<div class="info-card">' +
        '<div class="info-card-head">' +
          '<h3><i data-lucide="target" aria-hidden="true" style="color:var(--accent)"></i> 核心任务进展</h3>' +
          '<span class="info-card-badge danger">' + lagCount + ' 项异常</span>' +
        '</div>' +
        '<div style="display:flex;gap:8px;overflow-x:auto;flex-wrap:nowrap;padding:2px 0;scrollbar-width:none;-ms-overflow-style:none">';
      // 异常任务排前面
      var sortedTasks = tasks.slice().sort(function(a,b){ return (a.lag === b.lag ? 0 : a.lag ? -1 : 1); });
      for (var tci = 0; tci < sortedTasks.length; tci++) {
        var tc = sortedTasks[tci];
        var tcRate = parseInt(tc.rate) || 0;
        var tcBar = tc.lag ? (tc.risk === '重大风险' ? 'var(--red)' : '#d97706') : (tcRate >= 90 ? 'var(--green)' : tcRate >= 70 ? '#d97706' : 'var(--muted)');
        var tcAlert = tc.lag ? (tc.risk === '重大风险' ? '异常' : '警告') : '';
        var tcAlertCls = tc.lag ? (tc.risk === '重大风险' ? 'danger' : 'warning') : '';
        html += '<div class="hazard-card" style="flex:0 0 240px;min-width:220px;cursor:pointer" onclick="openTaskDetail(\'' + tc.name.replace(/'/g, "\\'") + '\')">' +
          (tc.lag ? '<div style="position:absolute;top:-1px;right:-1px;font-size:9px;font-weight:700;padding:1px 5px;border-radius:0 10px 0 10px;color:#fff;background:' + (tc.risk === '重大风险' ? 'var(--red)' : '#d97706') + ';line-height:1.5;z-index:1">' + tcAlert + '</div>' : '') +
          '<div style="display:flex;align-items:center;gap:8px;margin:0 0 4px">' +
            '<svg width="50" height="50" viewBox="0 0 54 54" style="flex-shrink:0">' +
              '<circle cx="27" cy="27" r="19" fill="none" stroke="#e5e7eb" stroke-width="5"/>' +
              '<circle cx="27" cy="27" r="19" fill="none" stroke="#98a2b3" stroke-width="5" stroke-dasharray="119" stroke-dashoffset="' + (119 - 119 * (parseInt(tc.progress) || 0) / 100) + '" transform="rotate(-90 27 27)" stroke-linecap="round"/>' +
              '<circle cx="27" cy="27" r="12" fill="none" stroke="#e5e7eb" stroke-width="5"/>' +
              '<circle cx="27" cy="27" r="12" fill="none" stroke="' + tcBar + '" stroke-width="5" stroke-dasharray="75" stroke-dashoffset="' + (75 - 75 * tcRate / 100) + '" transform="rotate(-90 27 27)" stroke-linecap="round"/>' +
            '</svg>' +
            '<div style="display:flex;flex-direction:column;gap:2px">' +
              '<div style="font-size:10.5px;color:var(--text)">覆盖 <strong>' + tc.covered + '</strong> 家</div>' +
              '<div style="font-size:10.5px;color:var(--text);display:flex;gap:12px">' +
                '<span>隐患 <strong>' + (tc.hazards && tc.hazards !== '-' ? tc.hazards : '—') + '</strong> 个</span>' +
                '<span>未闭环 <strong>' + (tc.majorHazards && tc.majorHazards !== '-' ? tc.majorHazards : '—') + '</strong></span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="hc-head">' +
            '<div style="display:flex;align-items:center;gap:4px;min-width:0">' +
            (tc.type === '专项' ? '<span style="color:var(--blue);font-weight:500;flex-shrink:0;font-size:13px">专项</span>' : '') +
            '<span class="hc-name" style="flex:1;min-width:0">' + escapeHtml(tc.name) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="hc-time" style="margin-top:2px">' + tc.startDate + ' → ' + tc.endDate + '</div>' +
        '</div>';
      }
      html += '</div></div>';

      // ─── 待确认行动项 ────────────────────────────────────────
      html += renderActionItems();

      return html;
    }

    // ─── 重点跟进操作函数 ──────────────────────────────────────
    function doFollowupAction(action, itemName) {
      var map = {
        '继续督办': function(){ openSuperviseDrawer(); },
        '发起督办': function(){ openSuperviseDrawer(); },
        '提醒责任人': function(){ showToast('已提醒 ' + itemName + ' 责任人'); },
        '提醒履职': function(){ showToast('已提醒 ' + itemName + ' 责任人履职'); },
        '要求反馈': function(){ showToast('已通知 ' + itemName + ' 需反馈进展'); },
        '要求现场核查': function(){ showToast('已通知 ' + itemName + ' 需现场核查'); },
        '发起约谈': function(){ openDrawer('meeting'); },
        '升级处置': function(){ showToast('已升级处置：' + itemName); }
      };
      var fn = map[action];
      if (fn) fn(); else showToast('执行动作：' + action);
    }

    // ─── 今日关注操作函数 ──────────────────────────────────────
    function handleTodayFocusAction(actionType, itemName) {
      switch (actionType) {
        case 'supervise': openSuperviseDrawer(); break;
        case 'remind': showToast('已通知「' + itemName + '」责任人反馈'); break;
        case 'track': showToast('已将「' + itemName + '」加入重点跟进'); break;
        default: showToast('执行动作：' + itemName);
      }
    }

    // ─── 重点跟进操作函数 ──────────────────────────────────────
    function handleFollowupAction(action, itemName) {
      switch (action) {
        case '继续督办': case '发起督办': openSuperviseDrawer(); break;
        case '提醒责任人': case '提醒履职': showToast('已提醒「' + itemName + '」责任人'); break;
        case '要求反馈': case '要求现场核查': showToast('已通知「' + itemName + '」需反馈进展'); break;
        case '发起约谈': openDrawer('meeting'); break;
        case '升级处置': showToast('已升级处置：「' + itemName + '」'); break;
        default: showToast('执行动作：' + action);
      }
    }

    // ─── AI 研判行动项渲染 ────────────────────────────────────
    function renderActionItems() {
      var items = MOCK.actionItems || [];
      if (items.length === 0) return '';
      return '<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;margin-bottom:8px;border:1px solid var(--line);border-radius:14px;background:var(--card);cursor:pointer;position:relative;overflow:hidden;transition:box-shadow .15s,transform .15s" onclick="switchScene(\'pending-actions\')" onmouseover="this.style.boxShadow=\'0 4px 14px rgba(23,105,224,0.12)\';this.style.transform=\'translateY(-1px)\'" onmouseout="this.style.boxShadow=\'\';this.style.transform=\'\'">' +
        '<div style="position:absolute;left:0;top:6px;bottom:6px;width:3px;background:var(--blue);border-radius:0 3px 3px 0"></div>' +
        '<div style="flex-shrink:0;width:34px;height:34px;border-radius:10px;background:var(--blue-bg);color:var(--blue);display:flex;align-items:center;justify-content:center"><i data-lucide="zap" width="18" height="18"></i></div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13px;font-weight:600;color:var(--text)">待确认行动 <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:var(--blue);color:#fff;margin-left:6px">' + items.length + ' 项</span></div>' +
          '<div style="font-size:12px;color:var(--muted);margin-top:1px">AI 建议的行动项，点击进入审核确认</div>' +
        '</div>' +
        '<i data-lucide="chevron-right" width="18" height="18" style="flex-shrink:0;color:var(--weak)"></i>' +
      '</div>';
    }

    // ─── AI 行动项操作函数 ────────────────────────────────────
    function handleActionItemPrimary(callback, itemTitle) {
      switch (callback) {
        case 'doSupervise': openSuperviseDrawer(); break;
        case 'doTrack': showToast('已将「' + itemTitle + '」加入重点跟进'); break;
        case 'doRequestExplain': showToast('已发送要求说明通知至「' + itemTitle + '」责任人'); break;
        default: showToast('执行：' + itemTitle);
      }
    }

    function handleActionItemSecondary(action, itemTitle) {
      switch (action) {
        case '忽略': showToast('已忽略「' + itemTitle + '」'); break;
        case '编辑': showToast('编辑「' + itemTitle + '」'); break;
        case '改为督办': openSuperviseDrawer(); break;
        default: showToast('执行：' + action);
      }
    }

    // ─── 行动项选择管理 ──────────────────────────────────────────

    var selectedActionItemIdx = {};  // { idx: true }

    function initActionItemSelection() {
      var items = MOCK.actionItems || [];
      selectedActionItemIdx = {};
      for (var i = 0; i < items.length; i++) {
        selectedActionItemIdx[i] = true;
      }
    }
    initActionItemSelection();

    function toggleActionItemCheck(idx, checked) {
      if (checked) { selectedActionItemIdx[idx] = true; }
      else { delete selectedActionItemIdx[idx]; }
      updateActionItemBatchBar();
    }

    function toggleActionItemSelectAll(checked) {
      var items = MOCK.actionItems || [];
      selectedActionItemIdx = {};
      if (checked) {
        for (var i = 0; i < items.length; i++) { selectedActionItemIdx[i] = true; }
      }
      // 更新所有 checkbox
      var cards = document.querySelectorAll('.ai-action-item');
      for (var c = 0; c < cards.length; c++) {
        var cb = cards[c].querySelector('input[type="checkbox"]');
        if (cb) cb.checked = checked;
      }
      updateActionItemBatchBar();
    }

    function updateActionItemBatchBar() {
      var countEl = $dom.aiActionBatchCount;
      var selectAllCb = $dom.aiActionSelectAll;
      if (!countEl) return;
      var items = MOCK.actionItems || [];
      var n = 0;
      for (var k in selectedActionItemIdx) { if (selectedActionItemIdx.hasOwnProperty(k)) n++; }
      countEl.textContent = '已选 ' + n + '/' + items.length;
      if (selectAllCb) {
        selectAllCb.checked = (n === items.length);
        selectAllCb.indeterminate = (n > 0 && n < items.length);
      }
    }

    YAQ.toggleActionItemCheck = toggleActionItemCheck;
    YAQ.toggleActionItemSelectAll = toggleActionItemSelectAll;

    // ─── 全局上下文督办生成 ──────────────────────────────────────

    function generateGlobalSupervisionItems() {
      var items = [];

      // 1. 从 actionItems 中提取督办类型
      var actionItems = MOCK.actionItems || [];
      for (var i = 0; i < actionItems.length; i++) {
        var ai = actionItems[i];
        if (ai.type === '发起督办') {
          items.push({
            title: ai.title,
            reason: ai.basis,
            requirement: ai.requirement,
            deadline: '3 日内',
            escalation: '超期后升级为站长约谈',
            source: 'AI 研判行动项',
            subjects: [ai.title.split('（')[0]]
          });
        }
      }

      // 2. 从 pendingActions 中提取待确认的督办
      var pas = MOCK.pendingActions || [];
      for (var j = 0; j < pas.length; j++) {
        var pa = pas[j];
        if (pa.status === 'pending' && pa.actionType === 'supervise') {
          var subjects = pa.affectedSubjects || [];
          items.push({
            title: pa.title,
            reason: pa.basis,
            requirement: pa.draftItems && pa.draftItems.length > 0 ? pa.draftItems[0].task : '按要求整改',
            deadline: pa.draftItems && pa.draftItems.length > 0 ? pa.draftItems[0].deadline : '3 日内',
            escalation: '超期后升级为站长约谈',
            source: '待确认行动',
            subjects: subjects
          });
        }
      }

      // 3. 从重大隐患中提取超期未整改的
      var hazards = MOCK.hazards || [];
      for (var k = 0; k < hazards.length; k++) {
        var h = hazards[k];
        if (h.level === '重大事故隐患' && h.status === '超期未整改') {
          var exists = false;
          for (var e = 0; e < items.length; e++) {
            if (items[e].title.indexOf(h.object) >= 0) { exists = true; break; }
          }
          if (!exists) {
            items.push({
              title: h.object + ' · ' + (h.hazard.length > 20 ? h.hazard.substring(0, 20) + '…' : h.hazard),
              reason: '重大隐患超期 ' + h.overdue + ' 天未整改，责任人：' + h.person,
              requirement: h.suggestion || '立即整改',
              deadline: h.deadline || '3 日内',
              escalation: '超期 7 天联合综合执法部门检查',
              source: '重大隐患',
              subjects: [h.object]
            });
          }
        }
      }

      return items;
    }

    function openSuperviseDrawer() {
      var items = generateGlobalSupervisionItems();
      if (items.length === 0) {
        showToast('当前无待督办事项', 'mock');
        return;
      }

      currentDrawerAction = 'supervise';
      $dom.drawerConfirm.textContent = '确认发起全部（' + items.length + ' 条）';
      $dom.drawerTitle.innerHTML = '<i data-lucide="megaphone" aria-hidden="true"></i> 全局督办预览';

      var bodyHtml = '<div class="drawer-supervise-intro">' +
        '<div class="dr-ai-icon"><i data-lucide="bot" width="16" height="16"></i></div>' +
        '<div style="font-size:13px;color:var(--text);line-height:1.5">基于今日全量监管上下文，系统识别出 <strong>' + items.length + ' 项</strong>需督办事项。请逐条确认后批量发起。</div>' +
      '</div>';

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        bodyHtml += '<div class="drawer-supervise-item" data-si-idx="' + i + '">' +
          '<div class="dsi-head">' +
            '<span class="dsi-num">#' + (i + 1) + '</span>' +
            '<span class="dsi-source">' + item.source + '</span>' +
            '<h4 class="dsi-title">' + escapeHtml(item.title) + '</h4>' +
          '</div>' +
          '<div class="dsi-section"><span class="dsi-label">督办原因</span><span class="dsi-value">' + item.reason + '</span></div>' +
          '<div class="dsi-section"><span class="dsi-label">整改要求</span><span class="dsi-value">' + item.requirement + '</span></div>' +
          '<div class="dsi-section"><span class="dsi-label">截止时间</span><span class="dsi-value">' + item.deadline + '</span></div>' +
          '<div class="dsi-section"><span class="dsi-label">升级规则</span><span class="dsi-value">' + item.escalation + '</span></div>' +
          (item.subjects.length > 0 ? '<div class="dsi-section"><span class="dsi-label">关联主体</span><span class="dsi-value">' + item.subjects.join('、') + '</span></div>' : '') +
        '</div>';
      }

      $dom.drawerBody.innerHTML = bodyHtml;
      lucide.createIcons();
      $dom.drawerPanel.classList.add('open');
      $dom.drawerOverlay.classList.add('open');
    }

    function renderPriorityItem(item) {
      var actionsHtml = '';
      for (var ai = 0; ai < item.actions.length; ai++) {
        var cls = ai === 0 ? 'primary' : '';
        actionsHtml += '<button class="pi-action-btn ' + cls + '" data-pi-action="' + item.actions[ai] + '" data-pi-id="' + item.id + '"><i data-lucide="' + getActionIcon(item.actions[ai]) + '" aria-hidden="true"></i> ' + item.actions[ai] + '</button>';
      }
      return '<div class="priority-item level-' + item.level + '" data-pi-id="' + item.id + '">' +
        '<div class="pi-left"><span class="pi-index">#' + item.index + '</span><span class="pi-tag ' + item.level + '">' + item.tag + '</span></div>' +
        '<div class="pi-body"><div class="pi-title">' + escapeHtml(item.title) + '</div>' +
        '<div class="pi-detail"><span><i data-lucide="clock" aria-hidden="true"></i>' + item.detail.split('·').join('</span><span><i data-lucide="user" aria-hidden="true"></i>') + '</span></div>' +
        '<div class="pi-actions">' + actionsHtml + '</div></div></div>';
    }

    function countByLevel(arr, level) {
      var c = 0;
      for (var i = 0; i < arr.length; i++) { if (arr[i].level === level) c++; }
      return c;
    }

    // ─── Hazard Report ───────────────────────────────────────────────

    function renderHazardReport() {
      var h = MOCK.hazards;
      if (!h || h.length === 0) return renderEmpty('暂无隐患数据', '当前没有登记的隐患记录。');

      // Status change indicator
      function statusChange(prev, cur, prevCls, curCls) {
        if (prev === cur) return '<span style="color:var(--muted);font-size:11px">→ 无变化</span>';
        var improved = (prevCls === 'danger' && curCls !== 'danger') || (prevCls === 'warning' && curCls === 'stable');
        return improved
          ? '<span style="color:var(--green);font-size:11px"><i data-lucide="trending-up" width="12" height="12"></i> 改善</span>'
          : '<span style="color:var(--red);font-size:11px"><i data-lucide="trending-down" width="12" height="12"></i> 恶化</span>';
      }

      var rows = '';
      for (var i = 0; i < h.length; i++) {
        rows += '<tr><td>' + escapeHtml(h[i].object) + '</td><td>' + escapeHtml(h[i].hazard) + '</td><td>' + h[i].region + '</td>' +
          '<td><span class="ht-status ' + h[i].prevStatusCls + '" style="font-size:10px">' + h[i].prevStatus + '</span></td>' +
          '<td><span class="ht-status ' + h[i].statusCls + '">' + h[i].status + '</span>' +
            '<div style="margin-top:2px">' + statusChange(h[i].prevStatus, h[i].status, h[i].prevStatusCls, h[i].statusCls) + '</div></td>' +
          '<td>' + h[i].person + '</td>' +
          '<td><div class="ht-actions"><button class="ht-action-btn primary" title="督办" onclick="openDrawer(\'supervise\')"><i data-lucide="megaphone" aria-hidden="true"></i></button><button class="ht-action-btn" title="现场核查" onclick="openDrawer(\'inspect\')"><i data-lucide="search" aria-hidden="true"></i></button><button class="ht-action-btn" title="会议议题" onclick="openDrawer(\'meeting\')"><i data-lucide="calendar" aria-hidden="true"></i></button><button class="ht-action-btn" title="持续跟踪" data-yaq-track="ht"><i data-lucide="pin" aria-hidden="true"></i></button></div></td></tr>';
      }

      // 隐患回头看
      var reviewItems = '';
      for (var ri = 0; ri < h.length; ri++) {
        if (h[ri].statusCls === 'danger' || h[ri].statusCls === 'warning') {
          reviewItems += '<div class="info-list-item"><div class="il-left"><i data-lucide="alert-circle" aria-hidden="true" style="color:' + (h[ri].statusCls === 'danger' ? 'var(--red)' : 'var(--orange)') + '"></i>' +
            '<span class="il-label"><strong>' + escapeHtml(h[ri].object) + '</strong> · ' + escapeHtml(h[ri].hazard) + '</span></div></div>' +
            '<div style="padding:2px 0 6px 24px;font-size:11.5px;color:var(--muted);border-bottom:1px solid var(--border)">' +
            '临时管控：' + h[ri].measures + '<br>整改方案：' + h[ri].plan + '<br>时间表：' + h[ri].timeline +
            ' · 责任人：' + h[ri].person +
            '</div>';
        }
      }

      return '' +
        '<div class="hazard-stats-row">' +
          '<div class="hazard-stat"><div class="hazard-stat-value danger">' + countByStatus(h, '超期未整改') + '</div><div class="hazard-stat-label">超期未整改</div><div class="hazard-stat-sub">较昨日 <span class="delta-up">+0</span> ⚠ 一周前也是这 2 项</div></div>' +
          '<div class="hazard-stat"><div class="hazard-stat-value warning">' + countByStatus(h, '即将到期') + '</div><div class="hazard-stat-label">即将到期</div><div class="hazard-stat-sub">3 天内到期</div></div>' +
          '<div class="hazard-stat"><div class="hazard-stat-value">' + countByStatus(h, '整改中') + '</div><div class="hazard-stat-label">整改推进中</div><div class="hazard-stat-sub"><span class="delta-down">较昨日改善 +1</span></div></div>' +
          '<div class="hazard-stat"><div class="hazard-stat-value warning">' + countByStatus(h, '反复出现') + '</div><div class="hazard-stat-label">反复出现</div><div class="hazard-stat-sub">已持续 2 周</div></div>' +
        '</div>' +

        // 隐患回头看
        '<div class="info-card">' +
          '<div class="info-card-head"><h3><i data-lucide="eye" aria-hidden="true" style="color:var(--red)"></i> 重大隐患回头看</h3><span class="info-card-badge danger">需确认 ' + countByStatus(h, '超期未整改') + '</span></div>' +
          '<div class="info-list">' + reviewItems + '</div>' +
        '</div>' +

        // 表格（含状态变化列）
        '<div class="hazard-table-wrap">' +
        '<table class="hazard-table">' +
        '<thead><tr><th>对象</th><th>隐患</th><th>区域/条线</th><th>昨日状态</th><th>当前状态</th><th>责任</th><th style="width:140px">站长动作</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>';
    }

    function countByStatus(arr, status) {
      var c = 0;
      for (var i = 0; i < arr.length; i++) { if (arr[i].status.indexOf(status) > -1 || (status === arr[i].status)) c++; }
      return c;
    }

    // ─── Efficiency ──────────────────────────────────────────────────

    function renderEfficiency() {
      var e = MOCK.efficiency;
      if (!e || !e.groups || e.groups.length === 0) return renderEmpty('暂无履职数据', '当前没有履职效能分析数据。');
      var cardsHtml = '';
      for (var gi = 0; gi < e.groups.length; gi++) {
        var g = e.groups[gi];
        var metricsHtml = '';
        var iconKeys = ['clipboard-check', 'search', 'alert-triangle', 'file-text', 'refresh-cw'];
        for (var mi = 0; mi < g.metrics.length; mi++) {
          metricsHtml += '<div class="eff-metric"><span class="eff-metric-label"><i data-lucide="' + (iconKeys[mi] || 'chevron-right') + '" aria-hidden="true"></i> ' + g.metrics[mi].label + '</span><span class="eff-metric-value ' + g.metrics[mi].cls + '">' + g.metrics[mi].value + '</span></div>';
        }
        cardsHtml += '<div class="eff-card">' +
          '<div class="eff-head"><h3><i data-lucide="' + g.icon + '" aria-hidden="true"></i> ' + escapeHtml(g.name) + '</h3><span class="eff-status ' + g.status + '">' + (g.status === 'danger' ? '需关注' : '异常') + '</span></div>' +
          '<div class="eff-metrics">' + metricsHtml + '</div></div>';
      }

      // Alerts
      var alertsHtml = '';
      for (var ai = 0; ai < e.alerts.length; ai++) {
        alertsHtml += '<div class="eff-alert"><i data-lucide="alert-triangle" aria-hidden="true"></i><div class="eff-alert-text"><strong>效能异常提示</strong> ' + e.alerts[ai] + ' <span class="eff-alert-action" onclick="showToast(\'已记录，将通知相关负责人核查原因\')">核查原因 →</span></div></div>';
      }

      return '' +
        '<div class="section-head" style="margin-bottom:0"><h2><i data-lucide="bar-chart-3" aria-hidden="true" style="color:var(--accent)"></i> 履职效能分析</h2></div>' +
        '<div class="efficiency-grid">' + cardsHtml +
        '<div class="eff-card full-width"><div class="eff-head"><h3><i data-lucide="alert-triangle" aria-hidden="true" style="color:var(--orange)"></i> 异常偏低提示</h3></div>' + alertsHtml + '</div>' +
        '</div>';
    }

    // ─── Responsibility ──────────────────────────────────────────────

    function renderResponsibility() {
      if (!MOCK.subjects || MOCK.subjects.length === 0) return renderEmpty('暂无主体数据', '当前没有责任主体评估数据。');
      var rows = '';
      for (var i = 0; i < MOCK.subjects.length; i++) {
        var s = MOCK.subjects[i];
        var riskLabel = s.risk === 'high' ? '高度关注' : s.risk === 'mid' ? '需关注' : '观察';
        rows += '<tr><td><a href="javascript:void(0)" onclick="openEnterprisePanel(\'' + s.name.replace(/'/g,"\\'") + '\');return false" style="color:var(--blue);text-decoration:none;border-bottom:1px dashed var(--blue);cursor:pointer">' + escapeHtml(s.name) + '</a></td><td>' + escapeHtml(s.selfCheck) + '</td><td>' + escapeHtml(s.govCheck) + '</td><td>' + escapeHtml(s.training) + '</td><td>' + escapeHtml(s.drill) + '</td><td><span class="st-risk ' + s.risk + '">' + riskLabel + '</span></td><td style="font-size:12px;color:var(--accent);font-weight:500;cursor:pointer" onclick="showToast(\'已记录建议：' + s.suggest + '\')">' + s.suggest + '</td></tr>';
      }

      return '' +
        '<div class="section-head" style="margin-bottom:0"><h2><i data-lucide="users" aria-hidden="true" style="color:var(--accent)"></i> 主体责任判断矩阵</h2></div>' +
        '<div class="matrix-grid">' +
          '<div class="matrix-card"><div class="matrix-card-icon green"><i data-lucide="check-circle-2" aria-hidden="true"></i></div><div class="matrix-card-title">主体责任较主动</div><div class="matrix-card-desc">自查多，政府检查少，安全管理较到位</div></div>' +
          '<div class="matrix-card"><div class="matrix-card-icon red"><i data-lucide="alert-triangle" aria-hidden="true"></i></div><div class="matrix-card-title">疑似敷衍自查</div><div class="matrix-card-desc">自查为 0，政府检查发现多项隐患</div></div>' +
          '<div class="matrix-card"><div class="matrix-card-icon orange"><i data-lucide="trending-down" aria-hidden="true"></i></div><div class="matrix-card-title">管理能力不足</div><div class="matrix-card-desc">培训低，隐患反复，安全投入不足</div></div>' +
          '<div class="matrix-card"><div class="matrix-card-icon neutral"><i data-lucide="log-out" aria-hidden="true"></i></div><div class="matrix-card-title">触达失败</div><div class="matrix-card-desc">平台长期不登录，需要培训或依法督促</div></div>' +
        '</div>' +

        // ─── 企业主体责任落实情况（从首页移入） ──────────────────
        (function() {
          var subs = MOCK.subjects;
          var total = subs.length;
          var noSelfCheck = 0, trainingLow = 0, highRisk = 0, noDrill = 0, selfChecked = 0;
          var trainWarnList = [];
          for (var si = 0; si < total; si++) {
            var s = subs[si];
            if (s.selfCheck === 0 || s.selfCheck === '0 次') {
              noSelfCheck++;
            } else {
              selfChecked++;
            }
            var tr = parseInt(s.training);
            if (!isNaN(tr) && tr < 40) trainingLow++;
            if (tr < 20) trainWarnList.push(s);
            if (s.risk === 'high') highRisk++;
            if (s.drill === '0 次' || s.drill === 0) noDrill++;
          }
          var selfCheckRate = total > 0 ? Math.round((total - noSelfCheck) / total * 100) : 0;
          var trainingRate = total > 0 ? Math.round((total - trainingLow) / total * 100) : 0;
          var drillOk = total - noDrill;
          var drillRate = total > 0 ? Math.round(drillOk / total * 100) : 0;
          var gapSorted = [];
          for (var si = 0; si < total; si++) {
            var s = subs[si];
            var sc = typeof s.selfCheck === 'number' ? s.selfCheck : (parseInt(s.selfCheck) || 0);
            var gc = parseInt(s.govCheck) || 0;
            var gap = gc - sc;
            if (gap > 0) gapSorted.push({ data: s, gap: gap });
          }
          gapSorted.sort(function(a,b){ return b.gap - a.gap; });
          var sectionHtml =
          '<div class="info-card">' +
            '<div class="info-card-head">' +
              '<h3><i data-lucide="building" aria-hidden="true" style="color:var(--accent)"></i> 企业主体责任落实情况</h3>' +
              '<span class="info-card-badge danger">' + gapSorted.length + ' 家需督办</span>' +
            '</div>' +
            '<div style="display:flex;gap:0">' +
              '<div style="flex:1;text-align:center;padding:12px 0;border-right:1px solid var(--line)"><div style="font-size:22px;font-weight:800;color:' + (selfCheckRate < 60 ? 'var(--red)' : 'var(--green)') + '">' + selfCheckRate + '%</div><div style="font-size:10.5px;color:var(--weak);margin-top:2px">隐患自查上报率</div><div style="font-size:9px;color:var(--muted);margin-top:1px">' + noSelfCheck + '/' + total + ' 企业未自查</div></div>' +
              '<div style="flex:1;text-align:center;padding:12px 0;border-right:1px solid var(--line)"><div style="font-size:22px;font-weight:800;color:' + (trainingRate < 60 ? 'var(--red)' : 'var(--green)') + '">' + trainingRate + '%</div><div style="font-size:10.5px;color:var(--weak);margin-top:2px">员工培训完成率</div><div style="font-size:9px;color:var(--muted);margin-top:1px">' + trainingLow + '/' + total + ' 企业不达标</div></div>' +
              '<div style="flex:1;text-align:center;padding:12px 0"><div style="font-size:22px;font-weight:800;color:' + (drillRate < 60 ? 'var(--red)' : 'var(--green)') + '">' + drillRate + '%</div><div style="font-size:10.5px;color:var(--weak);margin-top:2px">应急逃生演练完成率</div><div style="font-size:9px;color:var(--muted);margin-top:1px">' + noDrill + '/' + total + ' 企业未开展</div></div>' +
            '</div>';
          if (gapSorted.length > 0) {
            sectionHtml +=
            '<div style="padding:6px 14px 10px">' +
              '<div style="font-size:10px;font-weight:600;color:var(--weak);margin-bottom:4px;letter-spacing:0.03em">自查与政府检查差异较大的企业（按差异从大到小）</div>' +
              '<table style="width:100%;border-collapse:collapse;font-size:11px">' +
              '<thead><tr style="border-bottom:1px solid var(--border);background:var(--fg-soft)">' +
                '<th style="padding:4px 6px;text-align:left;font-weight:500;color:var(--weak);font-size:9px">企业</th>' +
                '<th style="padding:4px 6px;text-align:center;font-weight:500;color:var(--weak);font-size:9px">自查</th>' +
                '<th style="padding:4px 6px;text-align:center;font-weight:500;color:var(--weak);font-size:9px">政府检查</th>' +
                '<th style="padding:4px 6px;text-align:center;font-weight:500;color:var(--weak);font-size:9px">差异</th>' +
                '<th style="padding:4px 6px;text-align:center;font-weight:500;color:var(--weak);font-size:9px">培训</th>' +
                '<th style="padding:4px 6px;text-align:center;font-weight:500;color:var(--weak);font-size:9px">演练</th>' +
              '</tr></thead><tbody>';
            for (var gi = 0; gi < gapSorted.length; gi++) {
              var g = gapSorted[gi].data;
              var gapVal = gapSorted[gi].gap;
              var gRisk = g.risk === 'high' ? 'var(--red)' : '#d97706';
              sectionHtml += '<tr style="border-bottom:1px solid var(--line)">' +
                '<td style="padding:4px 6px;font-weight:500"><span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:' + gRisk + ';margin-right:4px;vertical-align:middle"></span><a href="javascript:void(0)" onclick="openEnterprisePanel(\'' + g.name.replace(/'/g,"\\'") + '\');return false" style="color:var(--blue);text-decoration:none;border-bottom:1px dashed var(--blue);cursor:pointer">' + escapeHtml(g.name) + '</a></td>' +
                '<td style="padding:4px 6px;text-align:center;color:' + (g.selfCheck === 0 || g.selfCheck === '0 次' ? 'var(--red)' : 'var(--muted)') + '">' + (g.selfCheck || '0 次') + '</td>' +
                '<td style="padding:4px 6px;text-align:center;color:var(--muted)">' + g.govCheck + '</td>' +
                '<td style="padding:4px 6px;text-align:center;font-weight:700;color:' + (gapVal > 5 ? 'var(--red)' : '#d97706') + '">' + gapVal + '</td>' +
                '<td style="padding:4px 6px;text-align:center;color:' + (parseInt(g.training) < 30 ? 'var(--red)' : 'var(--muted)') + '">' + g.training + '</td>' +
                '<td style="padding:4px 6px;text-align:center;color:' + (g.drill === '0 次' || g.drill === 0 ? 'var(--red)' : 'var(--green)') + '">' + (g.drill || '0 次') + '</td>' +
              '</tr>';
            }
            sectionHtml += '</tbody></table></div>';
          }
          sectionHtml += '</div>';
          return sectionHtml;
        })() +
        '<div class="section-head" style="margin-bottom:8px;margin-top:4px"><h2 style="font-size:14px"><i data-lucide="list" aria-hidden="true" style="color:var(--accent)"></i> 疑似主体责任异常对象</h2></div>' +
        '<div class="subject-table-wrap">' +
        '<table class="subject-table">' +
        '<thead><tr><th>主体对象</th><th>自查</th><th>政府检查</th><th>培训</th><th>演练</th><th>风险提示</th><th>建议动作</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>';
    }

    // ─── Disposal ────────────────────────────────────────────────────

    function renderDisposal() {
      var dInt = MOCK.disposalInternal;
      var dExt = MOCK.disposalExternal;
      var dSys = MOCK.disposalSystemic;

      function renderLevels(arr, tagPrefix) {
        var h = '';
        for (var li = 0; li < arr.length; li++) {
          var lv = arr[li];
          var itemsHtml = '';
          for (var ii = 0; ii < lv.items.length; ii++) {
            var btnAction = lv.items[ii].action || 'record';
            var btnLabel = btnAction === 'remind-all' ? '一键提醒' : '执行';
            var btnIcon = btnAction === 'remind-all' ? 'bell' : 'chevron-right';
            itemsHtml += '<div class="dl-item">' +
              '<div class="dl-item-icon ' + lv.tag + '"><i data-lucide="' + lv.icon + '" aria-hidden="true"></i></div>' +
              '<div class="dl-item-body"><div class="dl-item-title">' + lv.items[ii].title + '</div><div class="dl-item-desc">' + lv.items[ii].desc + '</div></div>' +
              '<button class="dl-item-action" onclick="' + (btnAction === 'remind-all' ? 'openDrawer(\'remind\')' : 'showToast(\'动作已记录，将跟踪闭环\')') + '"><i data-lucide="' + btnIcon + '" aria-hidden="true"></i> ' + btnLabel + '</button>' +
            '</div>';
          }
          h += '<div class="disposal-level">' +
            '<div class="dl-head"><span class="dl-tag ' + lv.tag + '">L' + lv.level + '</span><span class="dl-title">' + lv.levelName + '</span></div>' +
            '<div class="dl-list">' + itemsHtml + '</div></div>';
        }
        return h;
      }

      var html = renderDisposalRecommendations();

      html += '<div class="section-head" style="margin-bottom:0;margin-top:32px"><h2><i data-lucide="git-branch" aria-hidden="true" style="color:var(--accent)"></i> 分级处置闭环</h2></div>';

      // Two-column layout: internal + external
      html += '<div class="two-col-grid">' +

        // Internal management
        '<div class="info-card">' +
          '<div class="info-card-head"><h3><i data-lucide="user-cog" aria-hidden="true" style="color:var(--accent)"></i> 内部管理 · 街道/村社人员</h3></div>' +
          renderLevels(dInt, 'int') +
        '</div>' +

        // External management
        '<div class="info-card">' +
          '<div class="info-card-head"><h3><i data-lucide="building-2" aria-hidden="true" style="color:var(--orange)"></i> 外部管理 · 经营主体</h3></div>' +
          renderLevels(dExt, 'ext') +
        '</div>' +

      '</div>';

      // Systemic improvement section
      html += '<div class="info-card">' +
        '<div class="info-card-head"><h3><i data-lucide="refresh-cw" aria-hidden="true" style="color:var(--accent)"></i> 系统性改进 · 复盘与优化</h3></div>' +
        '<div class="dl-list">';
      for (var si = 0; si < dSys.length; si++) {
        html += '<div class="dl-item">' +
          '<div class="dl-item-icon level-5"><i data-lucide="' + dSys[si].icon + '" aria-hidden="true"></i></div>' +
          '<div class="dl-item-body"><div class="dl-item-title">' + dSys[si].title + '</div><div class="dl-item-desc">' + dSys[si].desc + '</div></div>' +
          '<button class="dl-item-action" onclick="showToast(\'已记录复盘建议\')"><i data-lucide="chevron-right" aria-hidden="true"></i> 查看</button>' +
        '</div>';
      }
      html += '</div></div>';

      return html;
    }

    // ─── AI 处置建议模块 ──────────────────────────────────────
    function renderDisposalRecommendations() {
      var recs = MOCK.disposalRecommendations || [];
      if (recs.length === 0) return '';

      function getLevelDot(level) {
        if (level.indexOf('external') >= 0) return 'building-2';
        return 'user-cog';
      }
      function getLevelColor(level) {
        if (level === 'external-3' || level === 'external-4' || level === 'external-5') return 'var(--red)';
        if (level === 'external-2' || level === 'internal-4') return 'var(--orange)';
        if (level === 'external-1' || level === 'internal-3') return 'var(--accent)';
        return 'var(--green)';
      }
      function getLevelBg(level) {
        if (level === 'external-3' || level === 'external-4' || level === 'external-5') return 'var(--red-soft)';
        if (level === 'external-2' || level === 'internal-4') return 'var(--orange-soft)';
        if (level === 'external-1' || level === 'internal-3') return 'var(--accent-soft)';
        return 'var(--green-soft)';
      }

      var html = '<div class="section-head" style="margin-bottom:0;margin-top:24px"><h2><i data-lucide="sparkles" aria-hidden="true" style="color:var(--accent)"></i> AI 处置建议</h2><span class="info-card-badge" style="background:var(--accent);color:#fff">' + recs.length + ' 条待确认</span></div>';
      html += '<div class="info-card"><div class="info-card-head"><h3><i data-lucide="bot" aria-hidden="true" style="color:var(--accent)"></i> 基于异常诊断自动生成</h3><button class="dl-item-action" onclick="YAQ.regenerateDisposalRecs()" style="padding:4px 10px;font-size:11px"><i data-lucide="refresh-cw" width="12" height="12"></i> 重新生成</button></div>';

      for (var ri = 0; ri < recs.length; ri++) {
        var r = recs[ri];
        var levelColor = getLevelColor(r.suggestedLevel);
        var levelBg = getLevelBg(r.suggestedLevel);
        var actionIcon = getActionIcon(r.suggestedAction);
        var riskBadgeCls = r.riskLevel === 'danger' ? 'danger' : 'warning';

        html += '<div class="dr-card">' +
          '<div class="dr-card-head">' +
            '<div class="dr-card-head-left">' +
              '<span class="dr-hazard-name">' + r.sourceHazard + '</span>' +
              '<span class="badge ' + riskBadgeCls + '" style="font-size:9px;padding:1px 6px">' + (r.riskLevel === 'danger' ? '危险' : '预警') + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="dr-card-body">' +
            '<div class="dr-body-row">' +
              '<span class="dr-label">建议级别</span>' +
              '<span class="dr-level-badge" style="background:' + levelBg + ';color:' + levelColor + '"><i data-lucide="' + getLevelDot(r.suggestedLevel) + '" width="11" height="11" style="vertical-align:middle;margin-right:3px"></i>' + r.suggestedLevelLabel + '</span>' +
            '</div>' +
            '<div class="dr-body-row">' +
              '<span class="dr-label">推荐动作</span>' +
              '<span class="dr-action-badge"><i data-lucide="' + actionIcon + '" width="11" height="11" style="vertical-align:middle;margin-right:3px"></i>' + r.suggestedActionLabel + '</span>' +
            '</div>' +
            '<div class="dr-body-row">' +
              '<span class="dr-label">推荐理由</span>' +
              '<span class="dr-rationale">' + r.rationale + '</span>' +
            '</div>' +
            '<div class="dr-body-row">' +
              '<span class="dr-label">处置文案</span>' +
              '<div class="dr-generated-text" id="drText_' + ri + '">' + r.generatedText + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="dr-card-actions">' +
            '<button class="dr-action-btn primary" onclick="YAQ.copyDisposalRec(' + ri + ')" title="复制文案"><i data-lucide="copy" width="13" height="13"></i> 复制文案</button>' +
            '<button class="dr-action-btn" data-yaq-track="dr" title="加入跟踪"><i data-lucide="pin" width="13" height="13"></i> 加入跟踪</button>' +
            '<button class="dr-action-btn" onclick="showToast(\'督办已发起\')" title="一键督办"><i data-lucide="megaphone" width="13" height="13"></i> 一键督办</button>' +
          '</div>' +
        '</div>';
      }

      // ─── 规则引擎触发提示 ──────────────────────────────────
      var ruleResults = (typeof window.getRuleEngineResults === 'function') ? window.getRuleEngineResults() : [];
      var dangerRules = [];
      for (var rri = 0; rri < ruleResults.length; rri++) {
        if (ruleResults[rri].rule && ruleResults[rri].rule.severity === 'danger') {
          dangerRules.push(ruleResults[rri]);
        }
      }
      if (dangerRules.length > 0) {
        var ruleDimToLevel = {
          'timeout': { level: 'external-3', label: '外部第 3 级 · 隐患区域停业整顿', action: 'enforce' },
          'behavior': { level: 'external-2', label: '外部第 2 级 · 站长约谈企业负责人', action: 'meeting' },
          'composite': { level: 'external-4', label: '外部第 4 级 · 联合多部门执法', action: 'inspect' },
          'metric': { level: 'internal-3', label: '内部第 3 级 · 一键提醒履职', action: 'remind' },
        };
        html += '<div class="dr-rule-section"><div class="dr-rule-head"><i data-lucide="settings-2" width="15" height="15" style="color:var(--orange)"></i> 规则引擎触发 · ' + dangerRules.length + ' 条危险规则匹配</div>';
        for (var dri = 0; dri < dangerRules.length; dri++) {
          var dr = dangerRules[dri];
          var ruleName = dr.rule.name || dr.rule.dimension || '未知规则';
          var ruleDim = dr.rule.dimension || '';
          var levelMap = ruleDimToLevel[ruleDim] || { level: 'internal-3', label: '内部第 3 级 · 一键提醒履职', action: 'remind' };
          var lvlHtml = '<span class="dr-level-badge" style="background:var(--red-soft);color:var(--red)"><i data-lucide="alert-triangle" width="11" height="11" style="vertical-align:middle;margin-right:3px"></i>' + levelMap.label + '</span>';
          html += '<div class="dr-rule-item">' +
            '<div class="dr-rule-item-left"><i data-lucide="zap" width="14" height="14" style="color:var(--red)"></i></div>' +
            '<div class="dr-rule-item-body">' +
              '<div class="dr-rule-item-name">' + ruleName + '</div>' +
              '<div class="dr-rule-item-detail">' + (dr.detail || '') + '</div>' +
              '<div class="dr-rule-item-level">' + lvlHtml + '</div>' +
            '</div>' +
            '<button class="dr-action-btn" onclick="showToast(\'已根据规则发起处置\')" style="flex-shrink:0"><i data-lucide="chevron-right" width="13" height="13"></i> 处置</button>' +
          '</div>';
        }
        html += '</div>';
      }

      // 底部：生成全部
      html += '<div class="dr-generate-all">' +
        '<button class="primary" onclick="YAQ.generateAllDisposalText()" style="display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:8px;border:none;background:var(--accent);color:#fff;font-size:13px;font-weight:500;cursor:pointer"><i data-lucide="file-text" width="15" height="15"></i> 生成全部处置建议</button>' +
        '<span class="dr-generate-hint">将生成可复制下发的总览处置文案，包含所有 6 项建议</span>' +
      '</div>';

      html += '</div>';
      return html;
    }

    // ─── AI 处置建议：复制单条文案 ──────────────────────────
    YAQ.copyDisposalRec = function(idx) {
      var recs = MOCK.disposalRecommendations || [];
      var r = recs[idx];
      if (!r) return;
      var text = r.generatedText;
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showToast('已复制处置文案'); }
      catch(e) { showToast('复制失败，请手动选择文案复制'); }
      document.body.removeChild(ta);
    };

    // ─── AI 处置建议：生成全部 ──────────────────────────────
    YAQ.generateAllDisposalText = function() {
      var recs = MOCK.disposalRecommendations || [];
      if (recs.length === 0) { showToast('暂无处置建议'); return; }
      var allText = '╔══ 站长处置建议总览（' + new Date().toLocaleDateString('zh-CN') + '）══╗\n\n';
      for (var i = 0; i < recs.length; i++) {
        allText += '【建议 ' + (i+1) + '】' + recs[i].sourceHazard + '\n';
        allText += '级别：' + recs[i].suggestedLevelLabel + '\n';
        allText += '动作：' + recs[i].suggestedActionLabel + '\n';
        allText += '文案：' + recs[i].generatedText + '\n\n';
      }
      allText += '╚══ 共 ' + recs.length + ' 项处置建议 ══╝';
      var ta = document.createElement('textarea');
      ta.value = allText;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showToast('已复制全部 ' + recs.length + ' 条处置建议'); }
      catch(e) { showToast('复制失败'); }
      document.body.removeChild(ta);
    };

    // ─── AI 处置建议：重新生成（模拟） ──────────────────────
    YAQ.regenerateDisposalRecs = function() {
      showToast('AI 正在基于最新异常数据重新分析…', 'mock');
      setTimeout(function() {
        // 重新渲染处置场景
        var container = $dom.sceneContent;
        if (container && state.activeScene === 'disposal') {
          container.innerHTML = renderDisposal();
          lucide.createIcons();
        }
        showToast('处置建议已更新（模拟）', 'mock');
      }, 800);
    };

    // ─── Drawer 生成处置文案 ────────────────────────────────
    function generateDisposalText(action) {
      var now = new Date();
      var dateStr = now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日';
      var hour = now.getHours();
      var greeting = hour < 12 ? '上午' : hour < 18 ? '下午' : '晚上';

      // 基于 Drawer 内容 + 当前上下文动态拼接
      var content = drawerContent[action];
      if (!content) return '';

      var lines = [];
      lines.push('╔══ ' + content.title + ' · ' + dateStr + ' ' + greeting + ' ══╗\n');

      for (var si = 0; si < content.sections.length; si++) {
        var sec = content.sections[si];
        lines.push('【' + sec.label + '】');
        lines.push(sec.value);
        lines.push('');
      }

      // 追加 AI 建议
      var recs = MOCK.disposalRecommendations || [];
      if (recs.length > 0) {
        lines.push('【AI 关联建议】');
        for (var ri = 0; ri < Math.min(recs.length, 3); ri++) {
          lines.push('• ' + recs[ri].sourceHazard + ' → ' + recs[ri].suggestedActionLabel);
        }
        lines.push('');
      }

      lines.push('╚══ 由 AI 工作助手自动生成 ══╝');
      return lines.join('\n');
    }

    YAQ.copyDrawerGenerated = function() {
      var text = window.__lastGeneratedText || '';
      if (!text) { showToast('暂无生成的文案'); return; }
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showToast('已复制处置文案'); }
      catch(e) { showToast('复制失败'); }
      document.body.removeChild(ta);
    };
    function renderFollowup() {
      // 使用动态跟踪数据而非静态 FOLLOWUPS
      var tracks = TrackStore.getActive();
      var stats = TrackStore.stats();
      var html = '<div class="section-head" style="margin-bottom:0"><h2><i data-lucide="list-checks" aria-hidden="true" style="color:var(--accent)"></i> 重点跟进</h2></div>' +

        // ── 跟踪统计概览 ──────────────────────────────
        '<div style="display:flex;gap:8px;margin-bottom:12px">' +
          '<div class="info-card-badge" style="flex:1;text-align:center;background:var(--accent);color:#fff;font-size:12px;padding:6px 4px">跟踪中 ' + stats.tracking + '</div>' +
          '<div class="info-card-badge" style="flex:1;text-align:center;background:var(--orange);color:#fff;font-size:12px;padding:6px 4px">推进中 ' + stats.progressing + '</div>' +
          '<div class="info-card-badge" style="flex:1;text-align:center;background:var(--green);color:#fff;font-size:12px;padding:6px 4px">已闭环 ' + stats.resolved + '</div>' +
        '</div>' +

        '<div class="info-card">' +
        '<div class="info-card-head">' +
          '<h3>跟踪事项</h3>' +
          '<span class="info-card-badge" style="background:var(--accent);color:#fff">' + tracks.length + ' 项进行中</span>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px;padding:2px 0">';
      if (tracks.length === 0) {
        html += '<div style="text-align:center;padding:24px 0;color:var(--muted);font-size:13px">暂无跟踪事项。<br>在诊断或处置页面点击「加入跟踪」即可开始跟踪。</div>';
      } else {
        for (var fui = 0; fui < tracks.length; fui++) {
          var fu = tracks[fui];
          // 进度条颜色
          var barColor = fu.progress < 30 ? 'var(--red)' : fu.progress < 70 ? 'var(--orange)' : 'var(--green)';
          // 状态标签
          var statusLabels = { tracking: '跟踪中', progressing: '推进中', resolved: '已闭环', closed: '已归档' };
          var statusColors = { tracking: 'var(--accent)', progressing: 'var(--orange)', resolved: 'var(--green)', closed: 'var(--weak)' };
          var statusLabel = statusLabels[fu.status] || fu.status;

          html += '<div style="border:1px solid var(--line);border-radius:8px;padding:12px 14px;background:var(--fg-soft);display:flex;flex-direction:column;gap:6px' + (fu.needIntervention ? ';border-left:3px solid var(--red)' : '') + '">' +

            // 标题行
            '<div style="display:flex;align-items:center;justify-content:space-between">' +
              '<span style="font-size:13px;font-weight:600;color:var(--text)">' + escapeHtml(fu.title) + '</span>' +
              '<span style="font-size:10px;padding:1px 6px;border-radius:3px;white-space:nowrap;background:' + statusColors[fu.status] + '15;color:' + statusColors[fu.status] + ';font-weight:500">' + statusLabel + '</span>' +
            '</div>' +

            // 进度条
            '<div style="display:flex;align-items:center;gap:6px">' +
              '<div style="flex:1;height:5px;background:var(--border);border-radius:3px;overflow:hidden">' +
                '<div style="height:100%;width:' + fu.progress + '%;background:' + barColor + ';border-radius:3px;transition:width .3s"></div>' +
              '</div>' +
              '<span style="font-size:10px;color:var(--weak);min-width:32px;text-align:right">' + fu.progress + '%</span>' +
            '</div>' +

            // 元信息
            '<div style="font-size:11px;color:var(--muted);line-height:1.5">' +
              '<span style="color:var(--weak)">跟踪天数：</span>' + (fu.daysTracked || 0) + ' 天' +
              (fu.responsibility ? ' · <span style="color:var(--weak)">责任：</span>' + escapeHtml(fu.responsibility) : '') +
              (fu.deadline ? ' · <span style="color:var(--weak)">截止：</span>' + escapeHtml(fu.deadline) : '') +
            '</div>' +

            // 最新进展
            (fu.updates && fu.updates.length > 0 ?
              '<div style="font-size:11px;color:var(--muted);line-height:1.5;background:var(--bg);padding:6px 8px;border-radius:4px">' +
                '<span style="color:var(--weak)">最新：</span>' + escapeHtml(fu.updates[fu.updates.length - 1].text) +
              '</div>'
            : '') +

            // 时间线（最近2条）
            (fu.updates && fu.updates.length > 1 ?
              '<div style="font-size:10px;color:var(--weak);line-height:1.4;padding-left:4px">' +
                (fu.updates.slice(-2).map(function(u) {
                  var d = new Date(u.at);
                  return '<div style="display:flex;gap:4px">' +
                    '<span style="color:var(--muted)">' + (d.getMonth()+1) + '/' + d.getDate() + '</span>' +
                    '<span>' + escapeHtml(u.text) + '</span></div>';
                }).join('')) +
              '</div>'
            : '') +

            // 操作按钮
            '<div style="display:flex;gap:4px;margin-top:2px;flex-wrap:wrap">' +
              (fu.status === 'tracking' ?
                '<button onclick="event.stopPropagation();YAQ.updateTrackProgress(\'' + fu.id + '\')" style="font-size:10px;padding:3px 8px;border-radius:4px;cursor:pointer;background:var(--accent);color:#fff;border:none">更新进展</button>' +
                '<button onclick="event.stopPropagation();YAQ.resolveTrack(\'' + fu.id + '\')" style="font-size:10px;padding:3px 8px;border-radius:4px;cursor:pointer;background:var(--green);color:#fff;border:none">标记闭环</button>'
              : fu.status === 'progressing' ?
                '<button onclick="event.stopPropagation();YAQ.updateTrackProgress(\'' + fu.id + '\')" style="font-size:10px;padding:3px 8px;border-radius:4px;cursor:pointer;background:var(--accent);color:#fff;border:none">更新进展</button>' +
                '<button onclick="event.stopPropagation();YAQ.resolveTrack(\'' + fu.id + '\')" style="font-size:10px;padding:3px 8px;border-radius:4px;cursor:pointer;background:var(--green);color:#fff;border:none">确认闭环</button>'
              : fu.status === 'resolved' ?
                '<button onclick="event.stopPropagation();YAQ.closeTrack(\'' + fu.id + '\')" style="font-size:10px;padding:3px 8px;border-radius:4px;cursor:pointer;background:var(--weak);color:#fff;border:none">归档</button>'
              : ''
            ) +
            (fu.needIntervention ? '<span style="font-size:10px;color:var(--red);font-weight:600;margin-left:auto">⚠ 需介入</span>' : '') +
            '</div>' +

          '</div>';
        }
      }
      html += '</div></div>';
      return html;
    }

    // ════════════════════════════════════════════════════════════════
    // DRAWER
    // ════════════════════════════════════════════════════════════════

    var drawerContent = {
      briefing: {
        title: '生成站长简报',
        sections: [
          { label: '今日判断', value: '总体平稳可控，但重大隐患闭环压力上升。今日需优先处理 2 项已超期重大隐患，随后核查高层小区专项任务滞后原因，并关注 8 家主体对象自查与政府检查不匹配。' },
          { label: '主要依据', value: '新增隐患 12 项（较日均+20%）；村社履职率 76%（目标 80%）；主体责任异常 8 家；重大未闭环 5 项，其中超期 2 项。' },
          { label: '优先动作', value: '1. 确认北苑商业综合体、云栖高层住宅整改方案\n2. 核查高层小区消防专项滞后原因\n3. 安排杭州恒源化工有限公司、杭州鑫盛机械制造有限公司主体责任约谈' },
          { label: '数据限制', value: '履职率口径尚未统一定义；风险预测数据不足 6 个月，暂不适合强预测。以上判断基于当前可用数据，建议结合实际情况综合研判。' }
        ]
      },
      supervise: {
        title: '一键督办',
        sections: [
          { label: '督办对象', value: '北苑商业综合体（责任人：王志安）' },
          { label: '督办原因', value: '消防通道堵塞，已超期 3 天未整改，临时管控措施待确认。' },
          { label: '整改要求', value: '1. 立即清理消防通道，恢复畅通\n2. 确认临时管控措施有效性\n3. 制定长期整改方案并提交时间表' },
          { label: '截止时间', value: '2025-07-24（3 天内）' },
          { label: '后续升级规则', value: '若超期未完成，自动升级为站长约谈企业负责人；超期 7 天联合综合执法部门检查。' }
        ]
      },
      meeting: {
        title: '加入会议议题',
        sections: [
          { label: '议题标题', value: '近期重大隐患整改推进及主体责任约谈计划' },
          { label: '问题背景', value: '当前重大未闭环 5 项，其中 2 项已超期；8 家主体对象自查为 0 但政府检查发现多项隐患，存在敷衍自查迹象。' },
          { label: '需会议确认', value: '1. 北苑商业综合体、云栖高层住宅整改方案\n2. 高层小区消防专项推进计划\n3. 主体责任约谈名单及时间安排' },
          { label: '建议决策', value: '1. 明确重大隐患整改责任人和完成时限\n2. 同意将杭州恒源化工有限公司、杭州鑫盛机械制造有限公司等纳入 C 类重点监管\n3. 启动电动自行车违规停放专项整治' },
          { label: '会后任务', value: '各责任人认领整改任务，下周三前提交整改方案。' }
        ]
      },
      inspect: {
        title: '现场核查',
        sections: [
          { label: '核查对象', value: '北苑商业综合体 · 消防通道' },
          { label: '核查重点', value: '1. 消防通道实际占用情况\n2. 临时管控措施是否到位\n3. 企业整改进度和计划' },
          { label: '建议参与人员', value: '消防安全组组长、属地村社负责人、商业综合体管理方' },
          { label: '建议时间', value: '今日或明日上午，预计用时 1.5 小时' }
        ]
      },
      remind: {
        title: '一键提醒履职',
        sections: [
          { label: '提醒对象', value: '应消站、区域站、第三方专家、村社相关人员' },
          { label: '提醒事由', value: '余杭东兴精密机械厂自查缺失+培训不足、云栖高层住宅消防设施失效，需相关责任人员现场核查隐患整改进展。' },
          { label: '提醒方式', value: '系统自动发送浙政钉通知 + 短信提醒至以下角色：\n• 应消站值班人员\n• 区域站负责人\n• 第三方安全专家\n• 属地村社负责人' },
          { label: '跟踪要求', value: '请于 2 个工作日内反馈现场核查结果。若本周内无反馈，将升级为站长督办事项。' }
        ]
      },
    };

    // ════════════════════════════════════════════════════════════════
    // PENDING ACTIONS — 待确认行动面板
    // ════════════════════════════════════════════════════════════════

    function renderPendingActions() {
      var pas = MOCK.pendingActions || [];
      var confirmed = MOCK.confirmedPackages || [];
      if (pas.length === 0 && confirmed.length === 0) return renderEmpty('暂无待确认行动', '所有行动已处理完毕。');

      // 待确认的（status === 'pending'）
      var pendingPas = [];
      // 已处理（ignored/changed）
      var donePas = [];
      for (var pi = 0; pi < pas.length; pi++) {
        if (pas[pi].status === 'pending') {
          pendingPas.push(pas[pi]);
        } else {
          donePas.push(pas[pi]);
        }
      }

      var html = '';

      // ─── 页面头 ──────────────────────────────────────────────
      html += '<div class="section-head" style="margin-bottom:12px">' +
        '<h2><i data-lucide="clipboard-check" aria-hidden="true" style="color:var(--accent)"></i> 待确认行动</h2>' +
        '<span class="info-card-badge" style="background:var(--orange);color:#fff">' + pendingPas.length + ' 项待确认</span>' +
      '</div>';

      // ─── 流程指示条 ──────────────────────────────────────────
      html += '<div class="pa-flow-bar">' +
        '<div class="pa-flow-step active"><div class="pa-flow-dot"></div><span>异常识别</span></div>' +
        '<div class="pa-flow-step active"><div class="pa-flow-dot"></div><span>问题聚合</span></div>' +
        '<div class="pa-flow-step active"><div class="pa-flow-dot"></div><span>生成待确认</span></div>' +
        '<div class="pa-flow-step"><div class="pa-flow-dot"></div><span>确认发起</span></div>' +
        '<div class="pa-flow-step"><div class="pa-flow-dot"></div><span>跟踪闭环</span></div>' +
      '</div>';

      // ─── AI 简报 ──────────────────────────────────────────────
      html += '<div class="pa-ai-brief">' +
        '<div class="pa-ai-icon"><i data-lucide="bot" width="18" height="18"></i></div>' +
        '<div class="pa-ai-text">' +
          '<strong>Agent 发现 ' + pas.length + ' 个待确认行动建议</strong>，基于今日全局监管上下文分析：' +
          '物流片区仓储场所整改超期集中、良渚街道消防重点单位隐患超期、高层小区消防专项进度滞后、生产企业复查失败等异常信号。' +
          '请对以下行动建议进行确认或调整。' +
        '</div>' +
      '</div>';

      // ─── 批量操作栏 ──────────────────────────────────────────
      html += '<div class="pa-batch-bar" id="paBatchBar">' +
        '<div class="pa-batch-left">' +
          '<label class="pa-batch-check-all"><input type="checkbox" id="paSelectAll" onchange="toggleSelectAllPA(this.checked)"> 全选</label>' +
          '<span class="pa-batch-count" id="paBatchCount">已选 0 项</span>' +
        '</div>' +
        '<div class="pa-batch-actions">' +
          '<button class="pa-btn pa-btn-primary" onclick="batchConfirmPAs()"><i data-lucide="check" width="14" height="14"></i> 批量确认发起 <span id="paBatchConfirmN"></span></button>' +
          '<button class="pa-btn" onclick="batchChangePAs(\'track\')"><i data-lucide="eye" width="14" height="14"></i> 批量改为跟进</button>' +
          '<button class="pa-btn" onclick="batchChangePAs(\'explain\')"><i data-lucide="help-circle" width="14" height="14"></i> 批量要求说明</button>' +
          '<button class="pa-btn pa-btn-muted" onclick="batchIgnorePAs()"><i data-lucide="x" width="14" height="14"></i> 批量忽略</button>' +
          '<button class="pa-btn pa-btn-muted" onclick="clearPASelection()"><i data-lucide="rotate-ccw" width="14" height="14"></i> 取消选择</button>' +
        '</div>' +
      '</div>';

      // ─── 待确认行动列表 ──────────────────────────────────────
      if (pendingPas.length === 0) {
        html += '<div class="pa-empty">所有待确认行动已处理</div>';
      } else {
        html += '<div class="pa-section-label"><i data-lucide="clock" width="15" height="15"></i> 待确认行动 <span class="pa-section-hint">（点击卡片左侧复选框可多选批量操作）</span></div>';
        for (var pi = 0; pi < pendingPas.length; pi++) {
          html += renderPendingActionCard(pendingPas[pi]);
        }
      }

      // ─── 已确认的督办包 ──────────────────────────────────────
      if (confirmed.length > 0) {
        html += '<div class="pa-section-divider"></div>';
        html += '<div class="pa-section-label" style="margin-top:4px"><i data-lucide="check-circle" width="15" height="15"></i> 已确认的督办包</div>';
        for (var ci = 0; ci < confirmed.length; ci++) {
          html += renderConfirmedPackageCard(confirmed[ci]);
        }
      }

      // ─── 已忽略/已处理的 ──────────────────────────────────────
      if (donePas.length > 0) {
        html += '<div class="pa-section-divider"></div>';
        html += '<div class="pa-section-label" style="margin-top:4px"><i data-lucide="archive" width="15" height="15"></i> 其他处理记录</div>';
        for (var di = 0; di < donePas.length; di++) {
          var d = donePas[di];
          var dLabel = d.actionType === 'track' ? '已加入跟进' : d.actionType === 'explain' ? '已改为要求说明' : d.actionType === 'observe' ? '暂不处理' : '已忽略';
          html += '<div class="pa-done-card">' +
            '<div style="display:flex;align-items:center;gap:8px">' +
              '<span style="font-size:11px;color:var(--weak)">' + dLabel + '</span>' +
              '<span style="font-size:13px;font-weight:600;color:var(--muted);text-decoration:line-through">' + d.title + '</span>' +
            '</div>' +
          '</div>';
        }
      }

      return html;
    }

    function renderPendingActionCard(pa) {
      // actionType 对应的样式和 label
      var actionConfig = {
        supervise: { label: '建议发起督办', cls: 'pa-type-supervise', icon: 'alert-triangle' },
        explain: { label: '建议要求说明', cls: 'pa-type-explain', icon: 'help-circle' },
        track: { label: '建议加入跟进', cls: 'pa-type-track', icon: 'eye' },
        special: { label: '建议转专项', cls: 'pa-type-special', icon: 'git-merge' },
        observe: { label: '建议暂不处理', cls: 'pa-type-observe', icon: 'pause-circle' }
      };
      var cfg = actionConfig[pa.actionType] || actionConfig.supervise;

      // 合并来源数量
      var mergedCount = pa.affectedAnomalies || (pa.mergedFrom ? pa.mergedFrom.length : 0);
      var subjectCount = pa.affectedSubjects ? pa.affectedSubjects.length : 0;

      var chainHtml = '';
      for (var key in pa.chain) {
        if (pa.chain.hasOwnProperty(key)) {
          var role = pa.chain[key];
          chainHtml += '<span class="pa-chain-badge"><span class="pa-chain-role">' + role.label + '</span>' + role.person + '</span>';
        }
      }

      // 处理项 HTML
      var itemsHtml = '';
      for (var ii = 0; ii < pa.draftItems.length; ii++) {
        var di = pa.draftItems[ii];
        itemsHtml += '<div class="pa-draft-item">' +
          '<div class="pa-di-left">' +
            '<span class="pa-di-role">' + di.role + '</span>' +
            '<span class="pa-di-task">' + di.task + '</span>' +
          '</div>' +
          '<span class="pa-di-deadline">' + di.deadline + '</span>' +
        '</div>';
      }

      var isSelected = !!state.selectedPAIds[pa.id];
      var html = '<div class="pa-card ' + cfg.cls + (isSelected ? ' pa-card-selected' : '') + '" id="pa-card-' + pa.id + '">' +
        // 复选框
        '<label class="pa-card-checkbox" onclick="event.stopPropagation()">' +
          '<input type="checkbox" ' + (isSelected ? 'checked' : '') + ' onchange="togglePASelection(\'' + pa.id + '\', this.checked)">' +
        '</label>' +
        // 头部：类型标签 + 标题
        '<div class="pa-card-top">' +
          '<div class="pa-card-left">' +
            '<span class="pa-type-tag"><i data-lucide="' + cfg.icon + '" width="13" height="13"></i> ' + cfg.label + '</span>' +
            '<h3 class="pa-card-title">' + pa.title + '</h3>' +
          '</div>' +
        '</div>' +

        // 依据
        '<div class="pa-card-basis"><i data-lucide="file-text" width="13" height="13"></i> ' + pa.basis + '</div>' +

        // 统计
        '<div class="pa-card-stats">' +
          '<span class="pa-stat"><i data-lucide="alert-circle" width="13" height="13"></i> 关联异常 ' + mergedCount + ' 条</span>' +
          (subjectCount > 0 ? '<span class="pa-stat"><i data-lucide="building-2" width="13" height="13"></i> 关联主体 ' + subjectCount + ' 家</span>' : '') +
        '</div>' +

        // 关联主体列表
        (pa.affectedSubjects && pa.affectedSubjects.length > 0
          ? '<div class="pa-card-subjects"><span class="pa-sub-label">关联主体：</span>' + pa.affectedSubjects.join('、') + '</div>'
          : '') +

        // 责任链
        '<div class="pa-card-chain">' +
          '<div class="pa-chain-label">责任链</div>' +
          '<div class="pa-chain-badges">' + chainHtml + '</div>' +
        '</div>' +

        // 预生成处理项（可展开）
        '<div class="pa-card-items">' +
          '<div class="pa-items-label">预生成处理项 <span class="pa-items-count">' + pa.draftItems.length + ' 项</span></div>' +
          '<div class="pa-items-list">' + itemsHtml + '</div>' +
        '</div>' +

        // 操作按钮
        '<div class="pa-card-actions">' +
          '<button class="pa-btn pa-btn-primary" onclick="confirmPendingAction(\'' + pa.id + '\')"><i data-lucide="check" width="14" height="14"></i> 确认发起</button>' +
          '<button class="pa-btn" onclick="showToast(\'编辑功能（建设中）\')"><i data-lucide="pencil" width="14" height="14"></i> 编辑</button>' +
          '<button class="pa-btn" onclick="changePendingAction(\'' + pa.id + '\', \'explain\')"><i data-lucide="help-circle" width="14" height="14"></i> 改为要求说明</button>' +
          '<button class="pa-btn" onclick="changePendingAction(\'' + pa.id + '\', \'track\')"><i data-lucide="eye" width="14" height="14"></i> 改为跟进</button>' +
          '<button class="pa-btn pa-btn-muted" onclick="ignorePendingAction(\'' + pa.id + '\')"><i data-lucide="x" width="14" height="14"></i> 忽略</button>' +
        '</div>' +
      '</div>';

      return html;
    }

    function renderConfirmedPackageCard(sp) {
      var statusMap = { '推进中': { cls: 'orange', icon: 'loader' }, '已完成': { cls: 'green', icon: 'check-circle' }, '需升级': { cls: 'red', icon: 'alert-triangle' } };
      var st = statusMap[sp.status] || { cls: 'gray', icon: 'circle' };

      var itemsHtml = '';
      for (var ii = 0; ii < sp.draftItems.length; ii++) {
        var di = sp.draftItems[ii];
        var diCls = di.status === 'done' ? 'pa-cfi-done' : di.status === 'in_progress' ? 'pa-cfi-progress' : di.status === 'overdue' ? 'pa-cfi-overdue' : '';
        var diIcon = di.status === 'done' ? 'check-circle' : di.status === 'in_progress' ? 'loader' : di.status === 'overdue' ? 'alert-circle' : 'circle';
        itemsHtml += '<div class="pa-cfi-item ' + diCls + '">' +
          '<i data-lucide="' + diIcon + '" width="13" height="13"></i>' +
          '<span class="pa-cfi-role">' + di.role + '</span>' +
          '<span class="pa-cfi-task">' + di.task + '</span>' +
          '<span class="pa-cfi-deadline">' + di.deadline + '</span>' +
        '</div>';
      }

      var html = '<div class="pa-confirmed-card">' +
        '<div class="pa-cc-top">' +
          '<div class="pa-cc-left">' +
            '<h4>' + sp.title + '</h4>' +
            '<span class="hc-status ' + st.cls + '">' + sp.status + '</span>' +
          '</div>' +
          '<span class="pa-cc-date">' + sp.createdAt + '</span>' +
        '</div>' +
        '<div class="pa-cc-stats">' +
          '<span>处理项 ' + sp.itemCount + ' 项</span>' +
          '<span class="pa-stat-done">已反馈 ' + sp.doneCount + '</span>' +
          '<span class="pa-stat-overdue">逾期 ' + sp.overdueCount + '</span>' +
        '</div>' +
        '<div class="pa-cc-items">' + itemsHtml + '</div>' +
      '</div>';

      return html;
    }

    // ════════════════════════════════════════════════════════════════
    // 督办跟踪 — 所有已发起督办的执行情况
    // ════════════════════════════════════════════════════════════════

    function renderSupervisionTrack() {
      // 合并所有督办包：已确认的历史包 + 当前发起的包
      var allPackages = (MOCK.confirmedPackages || []).concat(MOCK.supervisionPackages || []);
      // 去重
      var seen = {};
      var packages = [];
      for (var pi = 0; pi < allPackages.length; pi++) {
        var p = allPackages[pi];
        if (!seen[p.id]) {
          seen[p.id] = true;
          packages.push(p);
        }
      }

      // 按创建时间倒序
      packages.sort(function(a, b) { return (b.createdAt || '') > (a.createdAt || '') ? 1 : -1; });

      var totalCount = packages.length;
      var progressingCount = 0, doneCount = 0, overdueCount = 0, totalItems = 0;
      for (var pi2 = 0; pi2 < packages.length; pi2++) {
        var pk = packages[pi2];
        totalItems += pk.draftItems ? pk.draftItems.length : 0;
        if (pk.status === '已完成') doneCount++;
        else if (pk.status === '推进中') progressingCount++;
        else overdueCount++;
      }

      var html = '';

      // ─── 页面头 ──────────────────────────────────────────────
      html += '<div class="section-head" style="margin-bottom:12px">' +
        '<h2><i data-lucide="alert-circle" aria-hidden="true" style="color:var(--accent)"></i> 督办跟踪</h2>' +
        '<span class="info-card-badge" style="background:var(--accent);color:#fff">' + totalCount + ' 个督办包</span>' +
      '</div>';

      // ─── 概览统计 ──────────────────────────────────────────────
      html += '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">' +
        '<div class="st-summary-card" style="flex:1;min-width:120px;padding:14px 16px;border-radius:12px;background:#f8fafc">' +
          '<div style="font-size:11px;color:var(--weak);margin-bottom:4px">督办总数</div>' +
          '<div style="font-size:24px;font-weight:700;color:var(--text)">' + totalCount + '</div>' +
        '</div>' +
        '<div class="st-summary-card" style="flex:1;min-width:120px;padding:14px 16px;border-radius:12px;background:#fffbeb">' +
          '<div style="font-size:11px;color:#92400e;margin-bottom:4px">推进中</div>' +
          '<div style="font-size:24px;font-weight:700;color:#d97706">' + progressingCount + '</div>' +
        '</div>' +
        '<div class="st-summary-card" style="flex:1;min-width:120px;padding:14px 16px;border-radius:12px;background:#ecfdf5">' +
          '<div style="font-size:11px;color:#065f46;margin-bottom:4px">已完成</div>' +
          '<div style="font-size:24px;font-weight:700;color:var(--green)">' + doneCount + '</div>' +
        '</div>' +
        '<div class="st-summary-card" style="flex:1;min-width:120px;padding:14px 16px;border-radius:12px;background:#fef2f2">' +
          '<div style="font-size:11px;color:#991b1b;margin-bottom:4px">需升级/逾期</div>' +
          '<div style="font-size:24px;font-weight:700;color:var(--red)">' + overdueCount + '</div>' +
        '</div>' +
        '<div class="st-summary-card" style="flex:1;min-width:120px;padding:14px 16px;border-radius:12px;background:#f8fafc">' +
          '<div style="font-size:11px;color:var(--weak);margin-bottom:4px">处理项总计</div>' +
          '<div style="font-size:24px;font-weight:700;color:var(--text)">' + totalItems + '</div>' +
        '</div>' +
      '</div>';

      if (packages.length === 0) {
        html += '<div style="padding:40px 0;text-align:center;color:var(--weak);font-size:13px">暂无已发起的督办包<br>请在「待确认行动」中确认发起督办</div>';
        return html;
      }

      // ─── 督办包列表 ──────────────────────────────────────────
      for (var pi3 = 0; pi3 < packages.length; pi3++) {
        html += renderConfirmedPackageCard(packages[pi3]);
      }

      return html;
    }

    // ════════════════════════════════════════════════════════════════
    // 月报场景
    // ════════════════════════════════════════════════════════════════

    var MONTHLY_REPORT_DATA = {
      title: '小安AI安全报告',
      org: '良渚应急消防管理站',
      date: '2026年06月01日',
      period: '2026年05月1日—05月31日',
      summary: {
        totalSubjects: 14491,
        enterprises: 951,
        venues: 13540,
        collectionRate: '61.08%',
        enterpriseCollection: '93.48%',
        venueCollection: '57.36%'
      },
      sections: [
        {
          id: 'overview',
          icon: 'layout-dashboard',
          title: '一、总体情况',
          content: '本月，良渚街道应急消防管理站共纳入监管的责任主体14491家，其中企业951家、各类场所13540家，场所类责任主体占总数的93.44%，场所类责任主体仍是当前安全监管的重点与难点。',
          details: [
            '同比分析：与2025年05月相比，监管主体总数同比增长100%，增加14491家；环比增长18.59%，增加2272家。同比增量全部来源于新增监管主体，其中场所数量为13540家，企业数量为951家，表明新增主体以场所为主，占比达93.4%。当前监管覆盖面持续扩大，主体结构仍以场所类为主导，整体呈稳步扩张态势。',
            '趋势研判：信息采集总体覆盖率为61.08%，企业采集率93.48%显著高于场所57.36%，需重点提升场所信息采集工作。'
          ]
        },
        {
          id: 'collection',
          icon: 'database',
          title: '二、核心数据分析 — 信息采集完成情况',
          table: {
            headers: ['类别', '应采集数', '已采集数', '采集率', '同比采集率', '环比采集率'],
            rows: [
              ['企业', '951', '889', '93.48%', '↑100%', '↓2.16%'],
              ['场所', '8286', '4753', '57.36%', '↑100%', '↑23.04%'],
              ['合计', '9237', '5642', '61.08%', '↑100%', '↑21.43%']
            ]
          },
          analysis: '信息采集分析：企业采集完成情况良好，采集率达93.48%；场所采集率57.36%，明显偏低。环比分别提升2.16%和23.04%，整体采集率稳步上升。'
        },
        {
          id: 'supervision',
          icon: 'clipboard-check',
          title: '二、核心数据分析 — 监管执行情况对比',
          table: {
            headers: ['指标', '2026年05月', '同比', '环比', '趋势'],
            rows: [
              ['企业待办推送覆盖率', '58.57%', '↑100%', '↓36.97%', '上升'],
              ['企业整改完成率', '11.13%', '↑100%', '↓85.08%', '上升'],
              ['场所待办推送覆盖率', '17.05%', '↑100%', '↑81.77%', '上升'],
              ['场所整改完成率（已推送）', '59.46%', '↑100%', '↑182.34%', '上升']
            ]
          },
          analysis: '监管执行分析：企业待办推送覆盖率（58.57%）显著高于场所（17.05%），但整改完成率（11.13%）远低于场所（59.46%）。环比显示，场所两端指标增速均明显快于企业。'
        },
        {
          id: 'hazard',
          icon: 'alert-triangle',
          title: '二、核心数据分析 — 隐患检查与整改情况',
          table: {
            headers: ['指标', '2026年05月', '同比', '环比', '趋势'],
            rows: [
              ['专家检查任务数', '11', '↑100%', '↓99.14%', '上升'],
              ['检出隐患总数', '24', '↑100%', '↓99.28%', '上升'],
              ['隐患整改完成率', '100%', '↑100%', '↑3.1%', '上升']
            ]
          },
          analysis: '情况分析：检查任务量与隐患发现数同比持平，环比微降；隐患整改完成率达100%，整改成效显著。'
        },
        {
          id: 'five-dim',
          icon: 'grid-3x3',
          title: '二、核心数据分析 — 五维安全管理体系建设情况',
          table: {
            headers: ['维度', '已落实主体数', '占比', '同比', '环比'],
            rows: [
              ['安全制度建立', '1137', '7.85%', '↑100%', '↓30.12%'],
              ['风险点识别', '6270', '43.27%', '↑100%', '↓9.31%'],
              ['检查计划制定', '1159', '8%', '↑100%', '↓3.26%'],
              ['日常自查开展', '1140', '7.87%', '↑100%', '↓4.28%'],
              ['隐患整改优化到位', '3860', '26.64%', '↑100%', '↓10.94%']
            ]
          },
          analysis: '突出问题：风险点识别（43.27%）与隐患整改优化到位（26.64%）占比较低，且环比增速分别仅为9.31%和10.94%，需强化动态风险辨识与闭环整改机制。'
        },
        {
          id: 'village',
          icon: 'map-pin',
          title: '二、核心数据分析 — 村社安全管理动态',
          content: '本月村社巡查活跃度：整体呈现局部下滑态势，10个村社日常检查量下降，31个村社整改率偏低，存在履职风险。',
          details: [
            '• 良渚街道纤石村：日常检查次数同比下降96.3%，隐患数减少2项但整改率为0；',
            '• 良渚街道玉泽社区：日常检查量下降75.0%，登记采集规模居前但整改率持续为0；',
            '• 良渚街道东莲村：日常检查量下降17.8%，隐患数减少2项且整改率未提升；'
          ]
        },
        {
          id: 'fire',
          icon: 'flame',
          title: '三、街道内部火灾事故情况',
          content: '良渚街道对照：近期火情以杂草起火、锅烧焦和杂物起火为主，三者合计占比约19.2%。与往年相比，室外可燃物（如杂草、垃圾）起火频次上升，厨房用火及电气类火情仍属常见类型。当前正值干燥季节，需重点防范野外及房前屋后可燃物自燃或引燃风险。',
          details: ['季节性规律：火情呈季节性集中，秋冬季（10月至次年2月）发生频次较高。主要诱因类型为杂草起火、锅烧焦及杂物起火，合计占比约19.5%。']
        },
        {
          id: 'risk-predict',
          icon: 'trending-up',
          title: '四、下月度安全风险预判',
          items: [
            '1. 企业整改滞后风险突出：企业整改完成率仅为11.13%，远低于场所的59.46%，叠加企业待办推送覆盖率不足60%，存在隐患闭环管理失效风险。',
            '2. 村社日常巡查弱化趋势明显：31个村社处于低整改状态，10个村社日常巡查量下降，部分区域风险评分偏高，基层动态监管能力需加强。',
            '3. 季节性火情风险持续高位：杂草、杂物及厨房类起火占比较高，结合历史数据，春季干燥气候易诱发同类火情，需强化源头清理与用火用电管理。',
            '4. 场所监管覆盖严重不足：场所待办推送覆盖率仅17.05%，大量场所未纳入有效监管视线，存在风险盲区扩大可能。',
            '5. 专家检查频次偏低：本月仅开展11项专家检查任务，检出隐患虽已全部整改，但覆盖面有限，专业支撑力度有待提升。'
          ]
        },
        {
          id: 'problems',
          icon: 'alert-circle',
          title: '五、当前存在的主要问题',
          items: [
            '1. 场所类主体监管覆盖严重不足：场所采集率仅为57.36%，待办推送覆盖率低至17.05%，监管触达能力薄弱。',
            '2. 企业整改闭环严重滞后：企业整改完成率仅11.13%，远低于场所整改完成率，风险隐患处置效率低下。',
            '3. 基层村社整改普遍缺位：31个村社整改率为0%，占比超七成，整改执行流于形式。',
            '4. 日常监督检查明显弱化：10个村社日检任务量下降，部分社区专项检查缺失，动态监管机制运转不畅。',
            '5. 数据异常与风险积聚并存：多个村社存在隐患数归零但风险评分偏高现象，数据真实性与风险识别精准性存疑。'
          ]
        },
        {
          id: 'suggestions',
          icon: 'lightbulb',
          title: '六、下阶段重点工作建议',
          items: [
            '（一）开展场所信息采集与待办推送双提升行动：6月30日前完成场所采集率和待办推送覆盖率低值村社专项督导，聚焦57.36的场所采集率短板，组织网格力量逐户核实补录，同步优化系统自动推送机制，确保信息应采尽采、任务应达尽达。',
            '（二）实施企业整改闭环攻坚计划：针对企业整改完成率仅为11.13的问题，7月15日前建立未整改企业清单，由街道安监中队联合村社开展"一对一"帮扶指导，明确整改时限，逾期未完成的纳入重点监管名单并启动执法程序。',
            '（三）强化高风险村社动态巡查与隐患清零：对风险评分高于1.0且日常检查量下降的村社（如纤石村、玉泽社区等），6月起实行每周不少于2次的加密巡查，重点核查登记主体活跃度与隐患发现能力，杜绝"零隐患"异常现象。',
            '（四）部署夏季易燃物火灾防控专项行动：针对"杂草起火""杂物起火"等高频火情类型，6月20日前组织村社开展公共区域可燃物清理，加强露天堆放点、绿化带枯草等部位巡查，同步开展居民防火宣传入户。',
            '（五）优化专家检查任务精准投放机制：自6月起，将有限的专家资源优先配置至整改率低、风险评分高或日常检查薄弱的村社，每项检查任务须形成问题清单并跟踪整改，确保11项专家任务发挥最大风险干预效能。'
          ]
        }
      ]
    };

    // ─── 历史月报列表 ──────────────────────────────────────────
    var MR_HISTORY = [
      { id: '202605', label: '2026年5月', period: '2026.05.01 - 05.31', active: true },
      { id: '202604', label: '2026年4月', period: '2026.04.01 - 04.30', active: false },
      { id: '202603', label: '2026年3月', period: '2026.03.01 - 03.31', active: false },
      { id: '202602', label: '2026年2月', period: '2026.02.01 - 02.28', active: false },
      { id: '202601', label: '2026年1月', period: '2026.01.01 - 01.31', active: false }
    ];

    // ─── 月报模块可见性状态 ────────────────────────────────────
    var MR_SECTION_VISIBLE = {};
    // 默认全部可见
    (function() {
      var ids = ['overview','collection','supervision','hazard','five-dim','village','fire','risk-predict','problems','suggestions'];
      for (var i = 0; i < ids.length; i++) MR_SECTION_VISIBLE[ids[i]] = true;
    })();

    // ─── 月报侧边栏渲染 ────────────────────────────────────────
    function renderMrSidebar() {
      var sidebar = document.getElementById('mrSidebar');
      var content = document.getElementById('mrSidebarContent');
      if (!sidebar || !content) return;

      // 显示浮动侧边栏
      sidebar.style.display = 'block';

      var html = '<div style="padding:14px 12px">' +
        '<div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:10px;display:flex;align-items:center;gap:6px">' +
          '<i data-lucide="calendar" width="14" height="14" style="color:var(--accent)"></i> 历史月报' +
        '</div>';
      for (var hi = 0; hi < MR_HISTORY.length; hi++) {
        var h = MR_HISTORY[hi];
        html += '<div onclick="YAQ.switchMrHistory(\'' + h.id + '\')" style="padding:8px 10px;border-radius:8px;cursor:pointer;font-size:12px;margin-bottom:4px;border:1px solid ' + (h.active ? 'var(--accent)' : 'transparent') + ';background:' + (h.active ? '#eef2ff' : 'transparent') + ';transition:all .15s" onmouseenter="this.style.background=\'#f2f4f7\'" onmouseleave="this.style.background=\'' + (h.active ? '#eef2ff' : 'transparent') + '\'">' +
          '<div style="font-weight:' + (h.active ? '700' : '500') + ';color:var(--text)">' + h.label + '</div>' +
          '<div style="font-size:10px;color:var(--weak);margin-top:2px">' + h.period + '</div>' +
          (h.active ? '<div style="font-size:9px;color:var(--accent);margin-top:3px">● 当前</div>' : '') +
        '</div>';
      }
      html += '</div>';
      content.innerHTML = html;
      lucide.createIcons();
    }

    function hideMrSidebar() {
      var sidebar = document.getElementById('mrSidebar');
      if (sidebar) sidebar.style.display = 'none';
    }

    function renderMonthlyReport() {
      var d = MONTHLY_REPORT_DATA;
      var html = '';

      // 渲染浏览器侧边栏
      renderMrSidebar();

      // ─── 报告头部 ──────────────────────────────────────────
      html += '<div style="padding:0 0 8px">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">' +
          '<h2 style="margin:0;font-size:18px;font-weight:700;color:var(--text)"><i data-lucide="calendar" aria-hidden="true" style="color:var(--accent);margin-right:6px"></i> ' + d.title + '</h2>' +
          '<span style="font-size:11px;color:var(--weak);background:var(--bg);padding:2px 10px;border-radius:20px;border:1px solid var(--line)">' + d.period + '</span>' +
        '</div>' +
        '<div style="font-size:12px;color:var(--weak);margin-top:2px">' + d.org + ' · ' + d.date + '</div>' +
      '</div>';

      // ─── 概览统计卡片 ──────────────────────────────────────
      html += '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">' +
        '<div class="st-summary-card" style="flex:1;min-width:100px;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--card)">' +
          '<div style="font-size:10px;color:var(--weak);margin-bottom:2px">监管主体总数</div>' +
          '<div style="font-size:20px;font-weight:700;color:var(--text)">' + d.summary.totalSubjects.toLocaleString() + '</div>' +
          '<div style="font-size:10px;color:var(--weak);margin-top:2px">企业 ' + d.summary.enterprises + ' · 场所 ' + d.summary.venues.toLocaleString() + '</div>' +
        '</div>' +
        '<div class="st-summary-card" style="flex:1;min-width:100px;padding:12px 14px;border:1px solid var(--blue);border-radius:10px;background:#eff6ff">' +
          '<div style="font-size:10px;color:var(--weak);margin-bottom:2px">总体采集率</div>' +
          '<div style="font-size:20px;font-weight:700;color:#2563eb">' + d.summary.collectionRate + '</div>' +
          '<div style="font-size:10px;color:#64748b;margin-top:2px">企业 ' + d.summary.enterpriseCollection + ' · 场所 ' + d.summary.venueCollection + '</div>' +
        '</div>' +
        '<div class="st-summary-card" style="flex:1;min-width:100px;padding:12px 14px;border:1px solid var(--orange);border-radius:10px;background:#fff8f0">' +
          '<div style="font-size:10px;color:var(--weak);margin-bottom:2px">企业整改完成率</div>' +
          '<div style="font-size:20px;font-weight:700;color:#d97706">11.13%</div>' +
          '<div style="font-size:10px;color:#64748b;margin-top:2px">场所 59.46%</div>' +
        '</div>' +
        '<div class="st-summary-card" style="flex:1;min-width:100px;padding:12px 14px;border:1px solid var(--green);border-radius:10px;background:#f0fdf4">' +
          '<div style="font-size:10px;color:var(--weak);margin-bottom:2px">隐患整改完成率</div>' +
          '<div style="font-size:20px;font-weight:700;color:#16a34a">100%</div>' +
          '<div style="font-size:10px;color:#64748b;margin-top:2px">专家检查隐患</div>' +
        '</div>' +
      '</div>';

      // ─── 报告章节（按可见性过滤） ──────────────────────────
      for (var si = 0; si < d.sections.length; si++) {
        var sec = d.sections[si];
        if (!MR_SECTION_VISIBLE[sec.id]) continue;

        html += '<div class="mr-section" style="margin-bottom:12px;border:1px solid var(--line);border-radius:12px;background:var(--card);overflow:hidden">' +
          '<div class="mr-section-header" onclick="toggleMrSection(this)" style="padding:12px 16px;cursor:pointer;display:flex;align-items:center;gap:8px;user-select:none;transition:background .15s" onmouseenter="this.style.background=\'var(--bg)\'" onmouseleave="this.style.background=\'\'">' +
            '<i data-lucide="' + sec.icon + '" width="16" height="16" style="color:var(--accent);flex-shrink:0"></i>' +
            '<span style="font-size:13px;font-weight:600;color:var(--text);flex:1">' + sec.title + '</span>' +
            '<span class="mr-toggle" style="font-size:12px;color:var(--weak);transition:transform .2s">▼</span>' +
          '</div>' +
          '<div class="mr-section-body" style="padding:0 16px 12px;border-top:1px solid var(--line);font-size:13px;color:var(--text);line-height:1.7">';

        // Section content
        if (sec.content) {
          html += '<p style="margin:10px 0 6px">' + sec.content + '</p>';
        }

        // Details
        if (sec.details) {
          for (var di = 0; di < sec.details.length; di++) {
            html += '<p style="margin:4px 0;color:var(--weak);font-size:12.5px;padding-left:8px;border-left:2px solid var(--line)">' + sec.details[di] + '</p>';
          }
        }

        // Table
        if (sec.table) {
          html += '<div style="overflow-x:auto;margin:8px 0;border-radius:8px;border:1px solid var(--line)">';
          html += '<table style="width:100%;border-collapse:collapse;font-size:12px">';
          html += '<thead><tr style="background:var(--bg)">';
          for (var hi2 = 0; hi2 < sec.table.headers.length; hi2++) {
            html += '<th style="padding:7px 10px;text-align:left;font-weight:600;color:var(--text);border-bottom:1px solid var(--line);white-space:nowrap">' + sec.table.headers[hi2] + '</th>';
          }
          html += '</tr></thead><tbody>';
          for (var ri = 0; ri < sec.table.rows.length; ri++) {
            var row = sec.table.rows[ri];
            html += '<tr' + (ri === sec.table.rows.length - 1 ? '' : ' style="border-bottom:1px solid var(--line)"') + '>';
            for (var ci = 0; ci < row.length; ci++) {
              var cell = row[ci];
              var isPositive = cell.indexOf('↑') === 0;
              var isNegative = cell.indexOf('↓') === 0;
              var cellStyle = 'padding:6px 10px;white-space:nowrap';
              if (ci === 0) cellStyle += ';font-weight:500';
              if (isPositive) cellStyle += ';color:#16a34a';
              else if (isNegative) cellStyle += ';color:#ef4444';
              html += '<td style="' + cellStyle + '">' + cell + '</td>';
            }
            html += '</tr>';
          }
          html += '</tbody></table></div>';
        }

        // Items list
        if (sec.items) {
          for (var ii = 0; ii < sec.items.length; ii++) {
            html += '<p style="margin:5px 0;font-size:12.5px">' + sec.items[ii] + '</p>';
          }
        }

        // Analysis
        if (sec.analysis) {
          html += '<div style="margin-top:8px;padding:8px 12px;background:var(--bg);border-radius:8px;font-size:12.5px;color:var(--weak);border-left:3px solid var(--accent)">' +
            '<span style="font-weight:600;color:var(--text)">📊 分析：</span>' + sec.analysis +
          '</div>';
        }

        html += '</div></div>';
      }

      return html;
    }

    // ─── 月报模块可见性切换 ──────────────────────────────────
    YAQ.mrToggleModule = function(sectionId) {
      MR_SECTION_VISIBLE[sectionId] = !MR_SECTION_VISIBLE[sectionId];
      // 更新按钮文字
      var btn = document.getElementById('mr-btn-' + sectionId);
      if (btn) {
        var sec = null;
        for (var i = 0; i < MONTHLY_REPORT_DATA.sections.length; i++) {
          if (MONTHLY_REPORT_DATA.sections[i].id === sectionId) { sec = MONTHLY_REPORT_DATA.sections[i]; break; }
        }
        var shortName = sec ? sec.title.replace(/^[一二三四五]+[、．]\s*/, '').substring(0, 6) : sectionId;
        btn.innerHTML = MR_SECTION_VISIBLE[sectionId] ? '🙈 隐藏' + shortName : '👁 显示' + shortName;
      }
      // 重新渲染
      var sc = document.getElementById('sceneContent');
      if (sc) {
        sc.innerHTML = renderMonthlyReport();
        lucide.createIcons();
      }
      showToast(MR_SECTION_VISIBLE[sectionId] ? '已显示该模块' : '已隐藏该模块');
    };

    YAQ.mrAddModule = function() {
      // 模拟添加一个"同比分析"模块
      showToast('🤖 小安AI：已收到你的建议，正在生成同比分析模块…');
      // 延迟模拟模块添加
      setTimeout(function() {
        // 检查是否已添加
        var exists = false;
        for (var i = 0; i < MONTHLY_REPORT_DATA.sections.length; i++) {
          if (MONTHLY_REPORT_DATA.sections[i].id === 'yoy-analysis') { exists = true; break; }
        }
        if (!exists) {
          MONTHLY_REPORT_DATA.sections.push({
            id: 'yoy-analysis',
            icon: 'trending-up',
            title: '📈 新增：同比趋势分析（AI生成）',
            table: {
              headers: ['指标', '2026年5月', '2025年5月', '同比变化'],
              rows: [
                ['监管主体总数', '14,491', '0', '新增14,491家'],
                ['企业采集率', '93.48%', '0%', '↑93.48%'],
                ['场所采集率', '57.36%', '0%', '↑57.36%'],
                ['隐患整改完成率', '100%', '0%', '↑100%']
              ]
            },
            analysis: 'AI自动生成的同比分析：与去年同期相比，监管覆盖面大幅提升，各项指标从无到有建立。建议持续关注场所采集率提升空间。'
          });
          MR_SECTION_VISIBLE['yoy-analysis'] = true;
        }
        var sc = document.getElementById('sceneContent');
        if (sc) {
          sc.innerHTML = renderMonthlyReport();
          lucide.createIcons();
        }
        showToast('✅ 同比分析模块已添加至报告底部');
      }, 800);
    };

    YAQ.mrResetModules = function() {
      // 重置所有可见性
      var ids = ['overview','collection','supervision','hazard','five-dim','village','fire','risk-predict','problems','suggestions','yoy-analysis'];
      for (var i = 0; i < ids.length; i++) {
        if (ids[i] === 'yoy-analysis') {
          // 移除yoy-analysis
          for (var j = 0; j < MONTHLY_REPORT_DATA.sections.length; j++) {
            if (MONTHLY_REPORT_DATA.sections[j].id === 'yoy-analysis') {
              MONTHLY_REPORT_DATA.sections.splice(j, 1);
              break;
            }
          }
        }
        MR_SECTION_VISIBLE[ids[i]] = true;
      }
      var sc = document.getElementById('sceneContent');
      if (sc) {
        sc.innerHTML = renderMonthlyReport();
        lucide.createIcons();
      }
      showToast('已恢复月报默认结构');
    };

    YAQ.switchMrHistory = function(historyId) {
      // 更新历史激活状态
      for (var i = 0; i < MR_HISTORY.length; i++) {
        MR_HISTORY[i].active = MR_HISTORY[i].id === historyId;
      }
      // 更新报告头部信息
      for (var i = 0; i < MR_HISTORY.length; i++) {
        if (MR_HISTORY[i].active) {
          MONTHLY_REPORT_DATA.period = MR_HISTORY[i].period;
          MONTHLY_REPORT_DATA.date = MR_HISTORY[i].id.replace('20', '20') + '月01日';
          break;
        }
      }
      var sc = document.getElementById('sceneContent');
      if (sc) {
        sc.innerHTML = renderMonthlyReport();
        lucide.createIcons();
      }
      showToast('已切换至' + (MR_HISTORY.filter(function(h){return h.active})[0] || {}).label);
    };

    // ─── 月报章节折叠切换 ────────────────────────────────────
    YAQ.toggleMrSection = function(header) {
      var body = header.nextElementSibling;
      var toggle = header.querySelector('.mr-toggle');
      if (!body) return;
      if (body.style.display === 'none') {
        body.style.display = '';
        toggle.style.transform = '';
      } else {
        body.style.display = 'none';
        toggle.style.transform = 'rotate(-90deg)';
      }
    };

    // ─── 导出场景渲染函数到 YAQ ────────────────────────────
    YAQ.ENTERPRISE_DB = ENTERPRISE_DB;
    YAQ.state = state;
    YAQ.renderScene = renderScene;
    YAQ.renderDashboard = renderDashboard;
    YAQ.renderHazardReport = renderHazardReport;
    YAQ.renderEfficiency = renderEfficiency;
    YAQ.renderResponsibility = renderResponsibility;
    YAQ.renderDisposal = renderDisposal;
    YAQ.renderDisposalRecommendations = renderDisposalRecommendations;
    YAQ.renderFollowup = renderFollowup;
    YAQ.renderPendingActions = renderPendingActions;
    YAQ.renderSupervisionTrack = renderSupervisionTrack;
    YAQ.renderMonthlyReport = renderMonthlyReport;
    YAQ.renderMrSidebar = renderMrSidebar;
    YAQ.hideMrSidebar = hideMrSidebar;
    YAQ.openSuperviseDrawer = openSuperviseDrawer;
    YAQ.initActionItemSelection = initActionItemSelection;
    YAQ.toggleActionItemCheck = toggleActionItemCheck;
    YAQ.toggleActionItemSelectAll = toggleActionItemSelectAll;
    YAQ.countByLevel = countByLevel;
    YAQ.countByStatus = countByStatus;

  })();
