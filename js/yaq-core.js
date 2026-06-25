  (function() {
    'use strict';

    // ════════════════════════════════════════════════════════════════
    // 全局错误处理 — 防止白屏
    // ════════════════════════════════════════════════════════════════
    window.addEventListener('error', function(e) {
      console.error('[YAQ] 未捕获错误:', e.error || e.message);
      var el = document.getElementById('toast');
      if (el) { el.textContent = '发生异常，请刷新页面重试'; el.className = 'toast show'; setTimeout(function() { el.classList.remove('show'); }, 2500); }
    });

    window.addEventListener('unhandledrejection', function(e) {
      console.error('[YAQ] 未处理的 Promise 拒绝:', e.reason);
    });

    // 安全渲染包装 — 捕获任意渲染函数中的异常，避免白屏
    function safeRender(fn, fallbackMsg) {
      try { return fn(); }
      catch(e) {
        console.error('[YAQ] 渲染异常:', e);
        return '<div class="error-state"><i data-lucide="alert-triangle" width="32" height="32" style="color:var(--red)"></i><h3>' + (fallbackMsg || '渲染异常') + '</h3><p>请刷新页面重试。' + (e.message ? ' (' + e.message + ')' : '') + '</p></div>';
      }
    }

    // ─── 安全的 localStorage 封装（防隐私模式/配额超限崩溃） ──
    var ls = {
      get: function(key, fallback) {
        try { var v = localStorage.getItem(key); return v !== null ? v : fallback; }
        catch(e) { return fallback !== undefined ? fallback : null; }
      },
      set: function(key, val) {
        try { localStorage.setItem(key, val); return true; }
        catch(e) { console.warn('[YAQ] localStorage 写入失败:', key); return false; }
      },
      remove: function(key) {
        try { localStorage.removeItem(key); } catch(e) {}
      }
    };

    // ─── 功能占位 — 防止内联 onclick 在依赖文件加载前触发 ReferenceError ──
    window.toggleDemoMenu = function() {};
    // YAQ 命名空间提前初始化，供 YAQ.xxx = function() 赋值前声明
    window.YAQ = {};

    // ─── 存储版本号 ────────────────────────────────────────────
    var STORAGE_VERSION = 4;

    // ════════════════════════════════════════════════════════════════
    // DOM CACHE — 缓存常用 DOM 引用，避免重复查询
    // ════════════════════════════════════════════════════════════════

    var $dom = {
    agentCronPreview: document.getElementById('agentCronPreview'),
    agentPromptEditable: document.getElementById('agentPromptEditable'),
    agentScheduleSelect: document.getElementById('agentScheduleSelect'),
    aiActionBatchCount: document.getElementById('aiActionBatchCount'),
    aiActionSelectAll: document.getElementById('aiActionSelectAll'),
    chatBody: document.getElementById('chatBody'),
    chatFab: document.getElementById('chatFab'),
    chatInput: document.getElementById('chatInput'),
    chatPanel: document.getElementById('chatPanel'),
    dmsgInput: document.getElementById('dmsgInput'),
    drawerBody: document.getElementById('drawerBody'),
    drawerCancel: document.getElementById('drawerCancel'),
    drawerClose: document.getElementById('drawerClose'),
    drawerConfirm: document.getElementById('drawerConfirm'),
    drawerOverlay: document.getElementById('drawerOverlay'),
    drawerPanel: document.getElementById('drawerPanel'),
    drawerTitle: document.getElementById('drawerTitle'),
    drillAiConv: document.getElementById('drillAiConv'),
    drillBody: document.getElementById('drillBody'),
    drillFilter: document.getElementById('drillFilter'),
    drillFloat: document.getElementById('drillFloat'),
    drillOverlay: document.getElementById('drillOverlay'),
    drillTitle: document.getElementById('drillTitle'),
    epFixedTop: document.getElementById('epFixedTop'),
    epName: document.getElementById('epName'),
    epPanel: document.getElementById('epPanel'),
    epTabContent: document.getElementById('epTabContent'),
    hazardModal: document.getElementById('hazardModal'),
    hazardModalBody: document.getElementById('hazardModalBody'),
    hazardModalDot: document.getElementById('hazardModalDot'),
    hazardModalName: document.getElementById('hazardModalName'),
    hazardModalOverlay: document.getElementById('hazardModalOverlay'),
    launcherBody: document.getElementById('launcherBody'),
    launcherOverlay: document.getElementById('launcherOverlay'),
    launcherPanel: document.getElementById('launcherPanel'),
    launcherSearch: document.getElementById('launcherSearch'),
    metricCheckboxes: document.getElementById('metricCheckboxes'),
    metricFilterTabs: document.getElementById('metricFilterTabs'),
    metricModal: document.getElementById('metricModal'),
    metricModalOverlay: document.getElementById('metricModalOverlay'),
    metricSearchInput: document.getElementById('metricSearchInput'),
    metricTip: document.getElementById('metricTip'),
    mfootCount: document.getElementById('mfootCount'),
    paBatchBar: document.getElementById('paBatchBar'),
    paBatchConfirmN: document.getElementById('paBatchConfirmN'),
    paBatchCount: document.getElementById('paBatchCount'),
    paSelectAll: document.getElementById('paSelectAll'),
    regArrow: document.getElementById('regArrow'),
    regulationBody: document.getElementById('regulationBody'),
    sceneContent: document.getElementById('sceneContent'),
    sceneList: document.getElementById('sceneList'),
    selectedMetricsList: document.getElementById('selectedMetricsList'),
    taskModal: document.getElementById('taskModal'),
    taskModalLeft: document.getElementById('taskModalLeft'),
    taskModalName: document.getElementById('taskModalName'),
    taskModalOverlay: document.getElementById('taskModalOverlay'),
    taskModalRight: document.getElementById('taskModalRight'),
    toast: document.getElementById('toast'),
    topbarDate: document.getElementById('topbarDate'),
    launchChips: document.getElementById('launchChips'),
    workspace: document.getElementById('workspace'),
    };



    // ════════════════════════════════════════════════════════════════
    // MOCK DATA
    // ════════════════════════════════════════════════════════════════

    var MOCK = {
      // 优先处理队列
      priority: [
        {
          id: 0, level: 'high', index: 1, tag: '超期',
          title: '北苑商业综合体 · 消防通道堵塞',
          detail: '超期 3 天 · 责任人：王志安 · 临时管控待确认',
          actions: ['督办', '现场核查', '会议议题', '跟踪']
        },
        {
          id: 1, level: 'high', index: 2, tag: '超期',
          title: '云栖高层住宅 · 自动消防设施失效',
          detail: '超期 1 天 · 责任人：李明 · 整改证据不足',
          actions: ['督办', '现场核查', '跟踪']
        },
        {
          id: 2, level: 'mid', index: 3, tag: '滞后',
          title: '高层小区消防设施专项 · 完成率 42%',
          detail: '时间进度 61% · 滞后 19pp · 张毅条线为主',
          actions: ['提醒履职', '会议议题', '跟踪']
        },
        {
          id: 3, level: 'mid', index: 4, tag: '异常',
          title: '新城沿街商铺群 · 电动自行车违规停放反复',
          detail: '本月已发生 5 次 · 反复出现 · 需系统性整改',
          actions: ['督办', '现场核查', '跟踪']
        }
      ],

      // 重大隐患完整数据（含状态变化）
      hazards: [
        {
          object: '囿泽果蔬店', hazard: '1、视频中焊接作业区未见灭火器材\n2、堆放的金属型材存在堆叠过高距离作业人员过近',
          level: '重大事故隐患', source: '现场看', status: '已完成',
          foundDate: '2026-06-22', deadline: '2026-06-29', overdue: 0,
          statusCls: 'done', person: '王志安', days: 0,
          discoverer: '刘强', region: '东湖街道',
          regulation: '《消防法》《焊接作业安全规范》',
          suggestion: '1、按作业区单元配置灭火器\n2、将金属型材堆垛高度控制在安全范围内（建议不超过1.5米）并与作业人员保持安全距离',
          hasPhoto: true, resultPhoto: true,
          resultText: '灭火器已配置到位，金属型材重新码放至安全高度',
          measures: '已配置灭火器，金属型材重新码放', plan: '已完成整改'
        },
        {
          object: '杭州余杭李航电动车商行（爱玛）', hazard: '室内设置床铺，存在违规住人现象',
          level: '重大事故隐患', source: '现场看', status: '已完成',
          foundDate: '2026-06-19', deadline: '2026-06-26', overdue: 0,
          statusCls: 'done', person: '陈芳', days: 0,
          discoverer: '李华', region: '五常街道',
          regulation: '《消防法》',
          suggestion: '拆除床铺，清空住人设施',
          hasPhoto: true, resultPhoto: true,
          resultText: '床铺已拆除，违规住人已清空',
          measures: '已清退住宿人员', plan: '已完成整改'
        },
        {
          object: '北苑商业综合体', hazard: '消防通道堵塞',
          level: '重大事故隐患', source: '日常巡查', status: '超期未整改',
          foundDate: '2026-06-10', deadline: '2026-06-22', overdue: 3,
          statusCls: 'danger', person: '王志安', days: 3,
          discoverer: '周新', region: '良渚街道',
          regulation: '《消防法》第二十八条',
          suggestion: '立即清理消防通道，确保畅通；设置临时管控措施',
          hasPhoto: true, resultPhoto: false,
          resultText: '',
          measures: '已设置警示带，但无专人值守',
          plan: '未提交正式整改方案'
        },
        {
          object: '云栖高层住宅', hazard: '自动消防设施失效',
          level: '重大事故隐患', source: '专项检查', status: '超期未整改',
          foundDate: '2026-06-15', deadline: '2026-06-24', overdue: 1,
          statusCls: 'danger', person: '李明', days: 1,
          discoverer: '区消防大队', region: '五常街道',
          regulation: '《消防法》第十六条',
          suggestion: '修复自动消防设施，采取临时管控措施',
          hasPhoto: true, resultPhoto: false,
          resultText: '',
          measures: '未采取临时管控措施',
          plan: '整改方案已提交审核中'
        },
        {
          object: '恒源化工', hazard: '危化品存储区警示标识缺失',
          level: '一般隐患', source: '监督检查', status: '整改中',
          foundDate: '2026-06-20', deadline: '2026-07-26', overdue: 0,
          statusCls: 'neutral', person: '李安全', days: 0,
          discoverer: '专项检查组', region: '仓前街道',
          regulation: '《危险化学品安全管理条例》',
          suggestion: '完善危化品存储区警示标识，设置临时围挡',
          hasPhoto: true, resultPhoto: false,
          resultText: '',
          measures: '临时围挡已设置', plan: '采购中，预计本周到位'
        },
        {
          object: '杭州余杭区良渚街道张春国小吃店', hazard: '人员在室内睡觉，存在违规住人迹象',
          level: '重大事故隐患', source: '现场看', status: '已完成',
          foundDate: '2026-06-22', deadline: '2026-06-29', overdue: 0,
          statusCls: 'done', person: '李明', days: 0,
          discoverer: '张伟', region: '良渚街道',
          regulation: '《消防法》',
          suggestion: '清退住宿人员',
          hasPhoto: true, resultPhoto: true,
          resultText: '已清退住宿人员',
          measures: '已清退住宿人员', plan: '已完成整改'
        },
        // ─── 北苑商业综合体 历史隐患 ───
        {
          object: '北苑商业综合体', hazard: '地下室疏散指示标志损坏多处',
          level: '一般隐患', source: '日常巡查', status: '已完成',
          foundDate: '2026-05-10', deadline: '2026-05-24', overdue: 0,
          statusCls: 'done', person: '王志安', days: 0,
          discoverer: '周新', region: '良渚街道',
          regulation: '《消防法》',
          suggestion: '更换损坏的疏散指示标志',
          hasPhoto: true, resultPhoto: true,
          resultText: '全部损坏标志已更换',
          measures: '已更换', plan: '已完成整改'
        },
        {
          object: '北苑商业综合体', hazard: '3 层餐饮区灭火器压力不足',
          level: '一般隐患', source: '监督检查', status: '已完成',
          foundDate: '2026-04-02', deadline: '2026-04-16', overdue: 0,
          statusCls: 'done', person: '王志安', days: 0,
          discoverer: '区消防大队', region: '良渚街道',
          regulation: '《消防法》',
          suggestion: '更换压力不足的灭火器',
          hasPhoto: true, resultPhoto: true,
          resultText: '已全部更换',
          measures: '已更换', plan: '已完成整改'
        },
        {
          object: '北苑商业综合体', hazard: '中庭顶棚电气线路敷设不符合消防要求',
          level: '一般隐患', source: '专项检查', status: '已完成',
          foundDate: '2026-02-18', deadline: '2026-03-18', overdue: 0,
          statusCls: 'done', person: '王志安', days: 0,
          discoverer: '专项检查组', region: '良渚街道',
          regulation: '《建筑防火设计规范》',
          suggestion: '对中庭顶棚电气线路进行穿管保护',
          hasPhoto: true, resultPhoto: true,
          resultText: '已穿管保护完毕',
          measures: '已穿管保护', plan: '已完成整改'
        },
        {
          object: '北苑商业综合体', hazard: '消防控制室值班人员未持证上岗',
          level: '一般隐患', source: '专项检查', status: '已完成',
          foundDate: '2025-12-01', deadline: '2025-12-31', overdue: 0,
          statusCls: 'done', person: '王志安', days: 0,
          discoverer: '区消防大队', region: '良渚街道',
          regulation: '《消防控制室通用要求》',
          suggestion: '安排值班人员参加消防培训并取得上岗证',
          hasPhoto: false, resultPhoto: true,
          resultText: '2 名值班人员已取得上岗证',
          measures: '已持证上岗', plan: '已完成整改'
        },
        {
          object: '北苑商业综合体', hazard: '地下室堆放杂物',
          level: '一般隐患', source: '企业自查', foundBy: '自查', status: '已完成',
          foundDate: '2026-02-15', deadline: '2026-02-22', overdue: 0,
          statusCls: 'done', person: '王志安', days: 0,
          discoverer: '企业安全员', region: '良渚街道',
          regulation: '',
          suggestion: '及时清理地下室堆放的可燃杂物',
          hasPhoto: true, resultPhoto: true,
          resultText: '杂物已清理',
          measures: '已清理', plan: '已完成整改'
        },
        {
          object: '北苑商业综合体', hazard: '3 层东侧安全出口被货架遮挡',
          level: '一般隐患', source: '企业自查', foundBy: '自查', status: '已完成',
          foundDate: '2026-03-05', deadline: '2026-03-08', overdue: 0,
          statusCls: 'done', person: '王志安', days: 0,
          discoverer: '企业安全员', region: '良渚街道',
          regulation: '',
          suggestion: '立即移除遮挡安全出口的货架',
          hasPhoto: true, resultPhoto: true,
          resultText: '货架已移走，安全出口畅通',
          measures: '已移走货架', plan: '已完成整改'
        }
      ],

      // 工作效能
      efficiency: {
        groups: [
          {
            name: '企业安全组', icon: 'building-2',
            status: 'warning',
            metrics: [
              { label: '任务完成率', value: '78%', cls: 'warning' },
              { label: '隐患发现数', value: '34 项', cls: 'stable' },
              { label: '重大隐患发现', value: '1 项', cls: 'danger' },
              { label: '整改通知书下发', value: '22 份', cls: 'stable' },
              { label: '复查闭环率', value: '74%', cls: 'warning' }
            ]
          },
          {
            name: '消防安全组', icon: 'flame',
            status: 'danger',
            metrics: [
              { label: '任务完成率', value: '65%', cls: 'danger' },
              { label: '隐患发现数', value: '28 项', cls: 'warning' },
              { label: '重大隐患发现', value: '0 项', cls: 'danger' },
              { label: '复查闭环率', value: '68%', cls: 'danger' }
            ]
          },
          {
            name: '专家履职', icon: 'user-check',
            status: 'warning',
            metrics: [
              { label: '已复核任务', value: '8 项', cls: 'stable' },
              { label: '超期未复核', value: '3 项', cls: 'danger' },
              { label: '重大隐患发现', value: '2 项', cls: 'stable' }
            ]
          },
          {
            name: '区域站 / 村社履职', icon: 'map',
            status: 'warning',
            metrics: [
              { label: '村社履职率', value: '76%', cls: 'warning' },
              { label: '任务完成率（站级）', value: '82%', cls: 'stable' },
              { label: '复查闭环率', value: '71%', cls: 'warning' }
            ]
          }
        ],
        alerts: [
          '消防安全组复查闭环率 68%，低于站均值 6pp，建议核查是否存在拖延。',
          '专家超期未复核 3 项，其中恒源化工超期 5 天，需安排重新排期。'
        ]
      },

      // 主体责任异常对象
      subjects: [
        { name: '杭州恒源化工有限公司', selfCheck: 0, govCheck: '12 项', training: '32%', drill: '1 次', risk: 'high', suggest: '纳入 C 类重点监管' },
        { name: '杭州鑫盛机械制造有限公司', selfCheck: 0, govCheck: '8 项', training: '45%', drill: '0 次', risk: 'high', suggest: '纳入 C 类重点监管' },
        { name: '余杭宏达建材经营部', selfCheck: '1 次', govCheck: '6 项', training: '58%', drill: '1 次', risk: 'mid', suggest: '村社提醒，持续观察' },
        { name: '余杭东兴精密机械厂', selfCheck: 0, govCheck: '5 项', training: '28%', drill: '0 次', risk: 'high', suggest: '建议约谈负责人' },
        { name: '杭州华阳包装材料有限公司', selfCheck: 0, govCheck: '4 项', training: '20%', drill: '0 次', risk: 'high', suggest: '建议约谈负责人' },
        { name: '杭州永固建材有限公司', selfCheck: '2 次', govCheck: '4 项', training: '60%', drill: '1 次', risk: 'low', suggest: '持续观察' },
        { name: '余杭天元纺织厂', selfCheck: 0, govCheck: '6 项', training: '15%', drill: '0 次', risk: 'high', suggest: '建议约谈负责人' },
        { name: '杭州辰光物流有限公司', selfCheck: '1 次', govCheck: '3 项', training: '50%', drill: '1 次', risk: 'mid', suggest: '村社提醒，持续观察' }
      ],

      // 专项检查任务
      tasks: [
        // 日常任务
        { name: '企业消防通道专项检查', line: '消防安全组', startDate: '2026-06-01', endDate: '2026-06-30', covered: 28, rate: '67%', progress: '78%', hazards: 3, majorHazards: 0, creator: '李明', region: '全片区', risk: '-', lag: false, type: '日常', priority: 1,
          desc: '消防通道专项检查 28 家，完成率 67%，存在 3 项堵塞隐患已通知整改。',
          person: '李明', status: '正常推进', statusCls: 'stable', relatedItems: [] },
        { name: '危化品企业日常巡查', line: '企业安全组', startDate: '2026-06-10', endDate: '2026-06-30', covered: 12, rate: '91%', progress: '95%', hazards: 2, majorHazards: 0, creator: '李安全', region: '全片区', risk: '-', lag: false, type: '日常', priority: 2,
          desc: '危化品企业巡查 12 家，完成率 91%，2 项一般隐患已现场整改。',
          person: '李安全', status: '正常推进', statusCls: 'stable', relatedItems: [] },
        { name: '片区隐患排查复查', line: '消防安全组', startDate: '2026-06-15', endDate: '2026-06-30', covered: 24, rate: '55%', progress: '62%', hazards: 6, majorHazards: 1, creator: '张毅', region: '全片区', risk: '-', lag: false, type: '日常', priority: 3,
          desc: '片区隐患排查复查 24 家，完成率 55%，6 项隐患中 1 项重大。',
          person: '张毅', status: '正常推进', statusCls: 'stable', relatedItems: [] },
        { name: '月度安全培训督查', line: '企业安全组', startDate: '2026-06-01', endDate: '2026-06-30', covered: 18, rate: '83%', progress: '80%', hazards: '-', majorHazards: '-', creator: '陈芳', region: '全片区', risk: '-', lag: false, type: '日常', priority: 4,
          desc: '月度安全培训督查 18 家，完成率 83%，培训档案基本完整。',
          person: '陈芳', status: '正常推进', statusCls: 'stable', relatedItems: [] },
        // 专项任务
        { name: '2026年第二季度良渚片重大风险检查任务', line: '企业安全组', startDate: '2026-04-01', endDate: '2026-06-30', covered: 141, rate: '42%', progress: '91%', hazards: '-', majorHazards: '-', creator: '范嘉杰', region: '良渚片', risk: '重大风险', lag: true, type: '专项',
          desc: '二季度重大风险检查覆盖 141 家，完成率 42%，时间进度 91%，严重滞后。',
          person: '范嘉杰', status: '滞后', statusCls: 'danger', relatedItems: [] },
        { name: '2026年01月-2026年06月物流片较大风险检查任务', line: '企业安全组', startDate: '2026-01-01', endDate: '2026-06-30', covered: 31, rate: '96%', progress: '97%', hazards: '-', majorHazards: '-', creator: '范嘉杰', region: '物流片', risk: '较大风险', lag: false, type: '专项',
          desc: '物流片较大风险检查覆盖 31 家，完成率 96%，接近尾声。',
          person: '范嘉杰', status: '正常推进', statusCls: 'stable', relatedItems: [] }
      ],

      // 分级处置事项（内部管理 + 外部管理双线）
      disposalInternal: [
        {
          level: 1, levelName: '轻微 · 微信/浙政钉/电话了解', tag: 'level-1', icon: 'message-circle',
          items: [
            { title: '余杭宏达建材经营部 · 自查缺失', desc: '近 30 天自查 0 次，通过浙政钉提醒进一步落实', action: '' },
            { title: '杭州永固建材有限公司 · 培训即将到期', desc: '年度培训完成率 60%，电话了解原因', action: '' }
          ]
        },
        {
          level: 2, levelName: '中等 · 叫到办公室谈话', tag: 'level-2', icon: 'users',
          items: [
            { title: '消防安全组 · 复查闭环率 68%', desc: '低于站均值 6pp，叫组长和相关人员到办公室谈话', action: '' },
            { title: '杭州华阳包装材料有限公司辖区村社 · 自查持续为 0', desc: '已电话提醒一次仍未改善，叫村社负责人谈话', action: '' }
          ]
        },
        {
          level: 3, levelName: '较重 · 一键提醒应消站/区域站/专家/村社', tag: 'level-3', icon: 'bell',
          items: [
            { title: '余杭东兴精密机械厂 · 自查缺失+培训不足', desc: '一键提醒应消站、区域站、第三方专家、村社相关人员履职', action: 'remind-all' },
            { title: '云栖高层住宅 · 消防设施失效', desc: '一键提醒相关责任人员现场核查隐患整改进展', action: 'remind-all' }
          ]
        },
        {
          level: 4, levelName: '严重 · 约谈/考核', tag: 'level-4', icon: 'alert-triangle',
          items: [
            { title: '专家超期未复核 3 项', desc: '其中恒源化工超期 5 天，对第三方服务单位进行考核', action: '' },
            { title: '安全组任务持续滞后', desc: '长期低于时间进度，约谈组长及组员', action: '' }
          ]
        }
      ],
      disposalExternal: [
        {
          level: 1, levelName: '第 1 级 · 组长带队现场督促', tag: 'level-1', icon: 'users',
          items: [
            { title: '杭州鑫盛机械制造有限公司 · 自查 0+隐患 8 项', desc: '组长带队（带上专家；低风险单位则叫上村社和区域站）到现场督促指导', action: '' },
            { title: '杭州永固建材有限公司 · 安全管理能力不足', desc: '安排组长带队了解具体原因，帮助解决实际问题', action: '' }
          ]
        },
        {
          level: 2, levelName: '第 2 级 · 站长约谈企业负责人', tag: 'level-2', icon: 'message-square',
          items: [
            { title: '恒源化工 · 危化品隐患持续超期', desc: '站长及张义、国生出面对企业负责人进行约谈，施加压力、强调责任', action: '' },
            { title: '余杭天元纺织厂 · 多项异常叠加', desc: '约谈企业负责人，明确整改时限和责任人', action: '' }
          ]
        },
        {
          level: 3, levelName: '第 3 级 · 隐患区域停业整顿', tag: 'level-3', icon: 'ban',
          items: [
            { title: '北苑商业综合体 · 消防通道反复堵塞', desc: '要求存在隐患的区域停业整顿，直至整改验收合格', action: '' },
            { title: '云栖高层住宅 · 消防设施全面失效', desc: '对失效设施所在区域采取停用措施，挂牌督办', action: '' }
          ]
        },
        {
          level: 4, levelName: '第 4 级 · 联合多部门执法', tag: 'level-4', icon: 'shield',
          items: [
            { title: '恒源化工 · 危化品管理严重违规', desc: '应消站联合综合执法、市场监管等部门开展联合检查', action: '' },
            { title: '沿街商铺群 · 电动自行车违规顽固反复', desc: '联合派出所、城管等开展集中整治', action: '' }
          ]
        },
        {
          level: 5, levelName: '第 5 级 · 上报立案处罚', tag: 'level-5', icon: 'gavel',
          items: [
            { title: '恒源化工 · 多项严重隐患屡教不改', desc: '上报应急局或消防大队建议立案处罚，处罚情况通报企业', action: '' },
            { title: '北苑商业综合体 · 拒不整改', desc: '上报相关部门立案处理，纳入重点监管黑名单', action: '' }
          ]
        }
      ],
      // 系统性改进
      disposalSystemic: [
        { title: '电动自行车违规停放反复出现', desc: '在全街道范围内开展一次专项整治行动', icon: 'refresh-cw' },
        { title: '高层小区消防设施专项滞后', desc: '复盘分析工作流程和责任分工是否存在漏洞，优化工作标准', icon: 'search' },
        { title: '企业自查敷衍问题普遍存在', desc: '加强过程管控和培训指导，完善主体责任考核机制', icon: 'trending-up' }
      ],

      // AI 研判行动项
      actionItems: [
        {
          type: '发起督办', typeCls: 'danger',
          title: '物流片区仓储整改超期集中',
          basis: '7 家主体对象整改超期，其中 2 家为较大风险。',
          requirement: '今日反馈超期原因及处置计划。',
          primaryAction: '确认发起', primaryCallback: 'doSupervise',
          secondaryActions: ['编辑', '忽略']
        },
        {
          type: '加入重点跟进', typeCls: 'warning',
          title: '勾庄小微园电气线路隐患连续上升',
          basis: '近 3 日同类隐患持续增加。',
          requirement: '本周形成专项排查清单。',
          primaryAction: '加入跟进', primaryCallback: 'doTrack',
          secondaryActions: ['改为督办', '忽略']
        },
        {
          type: '要求说明', typeCls: 'info',
          title: '企业安全组专项检查进度滞后',
          basis: '计划完成率低于时间进度 18%。',
          requirement: '今日提交滞后原因和补充检查安排。',
          primaryAction: '发送要求', primaryCallback: 'doRequestExplain',
          secondaryActions: ['编辑', '忽略']
        }
      ],

      // ═══ AI 处置建议 ═══════════════════════════════════════
      // 基于诊断结果自动推荐处置动作
      disposalRecommendations: [
        {
          sourceDiagnosisId: 'beiyuan-fire-channel',
          sourceHazard: '北苑商业综合体 · 消防通道堵塞（超期 3 天）',
          suggestedLevel: 'external-3',
          suggestedLevelLabel: '外部第 3 级 · 隐患区域停业整顿',
          suggestedAction: 'enforce',
          suggestedActionLabel: '停业整顿 + 督办',
          rationale: '该主体消防通道堵塞为反复出现项（本月已发生 3 次），且已超期 3 天未整改。仅靠电话提醒已无效，建议直接升级为第 3 级处置——要求存在隐患的区域停业整顿，同时发起专项督办，责任人王志安。',
          generatedText: '【处置决定】北苑商业综合体消防通道堵塞（超期 3 天，反复出现）。依据《消防法》第二十八条，责令消防通道占用区域立即停业整顿，直至整改验收合格。由消防安全组组长带队现场核查，责任人王志安今日提交整改方案。超期 7 天未完成将联合综合执法部门强制执行。',
          riskLevel: 'danger',
          recommendedPerson: '王志安'
        },
        {
          sourceDiagnosisId: 'yunqi-fire-facility',
          sourceHazard: '云栖高层住宅 · 自动消防设施失效（超期 1 天）',
          suggestedLevel: 'external-3',
          suggestedLevelLabel: '外部第 3 级 · 隐患区域停业整顿',
          suggestedAction: 'enforce',
          suggestedActionLabel: '停业整顿 + 挂牌督办',
          rationale: '云栖高层住宅消防设施大面积失效（18-25层），涉及高层建筑公共安全，超期 1 天。建议按第 3 级处置，对失效设施所在区域采取停用措施并挂牌督办。',
          generatedText: '【处置决定】云栖高层住宅自动消防设施失效（18-25层大面积失效，超期 1 天）。责令失效设施所在区域立即停用，由区域站设置临时管控措施。消防安全组组长牵头修复，责任人李明 2 日内提交修复方案。纳入街道挂牌督办事项。',
          riskLevel: 'danger',
          recommendedPerson: '李明'
        },
        {
          sourceDiagnosisId: 'heng-yuan-chemical',
          sourceHazard: '恒源化工 · 危化品隐患持续超期 + 自查 0 次',
          suggestedLevel: 'external-4',
          suggestedLevelLabel: '外部第 4 级 · 联合多部门执法',
          suggestedAction: 'inspect',
          suggestedActionLabel: '联合执法 + 约谈',
          rationale: '恒源化工存在危化品标识缺失隐患超期，同时企业自查持续为 0（近 30 天 0 次登录），政府检查发现 12 项隐患。自查与检查严重不匹配，属于主体责任虚化。建议按第 4 级联合综合执法、市场监管等部门开展联合检查，同时站长约谈企业负责人。',
          generatedText: '【处置决定】恒源化工危化品隐患超期 + 主体责任虚化（自查 0 次 / 政府检查 12 项隐患）。由应消站牵头，联合综合执法、市场监管等部门于本周五前开展联合执法检查。站长张义约谈企业负责人，明确整改时限和责任人。检查结果通报全片区同类企业。',
          riskLevel: 'danger',
          recommendedPerson: '张义'
        },
        {
          sourceDiagnosisId: 'xin-sheng-machinery',
          sourceHazard: '杭州鑫盛机械制造有限公司 · 自查缺失 + 隐患 8 项',
          suggestedLevel: 'external-1',
          suggestedLevelLabel: '外部第 1 级 · 组长带队现场督促',
          suggestedAction: 'supervise',
          suggestedActionLabel: '现场督促指导',
          rationale: '企业自查 0 次但政府发现 8 项隐患，说明企业安全管理人员能力不足。建议先按第 1 级处置——组长带队到现场督促指导，带上专家帮助解决实际问题。',
          generatedText: '【处置决定】杭州鑫盛机械制造有限公司自查缺失（0 次/近 30 天）+ 政府检查发现隐患 8 项。由企业安全组组长带队（带上安全专家），今日到现场督促指导，帮助企业建立自查机制。3 日内复查自查情况。',
          riskLevel: 'warning',
          recommendedPerson: '企业安全组组长'
        },
        {
          sourceDiagnosisId: 'dong-xing-precision',
          sourceHazard: '余杭东兴精密机械厂 · 自查缺失 + 培训不足',
          suggestedLevel: 'internal-3',
          suggestedLevelLabel: '内部第 3 级 · 一键提醒履职',
          suggestedAction: 'remind',
          suggestedActionLabel: '一键提醒履职',
          rationale: '该企业自查缺失且培训完成率仅 28%，涉及应消站、区域站、第三方专家、村社等多角色。建议按内部第 3 级——一键提醒所有相关责任人员现场核查隐患整改进展。',
          generatedText: '【处置决定】余杭东兴精密机械厂自查缺失 + 培训完成率仅 28%。系统已自动通过浙政钉通知应消站值班人员、区域站负责人、第三方安全专家、属地村社负责人，要求 2 个工作日内反馈现场核查结果。若本周内无反馈，自动升级为站长督办事项。',
          riskLevel: 'warning',
          recommendedPerson: '应消站值班人员'
        },
        {
          sourceDiagnosisId: 'tian-yuan-textile',
          sourceHazard: '余杭天元纺织厂 · 多项异常叠加（自查 0 + 隐患 6 项 + 培训 15%）',
          suggestedLevel: 'external-2',
          suggestedLevelLabel: '外部第 2 级 · 站长约谈企业负责人',
          suggestedAction: 'meeting',
          suggestedActionLabel: '约谈企业负责人',
          rationale: '该企业自查 0 次、隐患 6 项、培训完成率仅 15%，且多项异常叠加（疏散通道堵塞、灭火器过期、电气线路私拉乱接），属于系统性安全管理缺失。建议按第 2 级——站长约谈企业负责人，施加压力、明确整改要求。',
          generatedText: '【处置决定】余杭天元纺织厂系统性安全管理缺失（自查 0 次 / 隐患 6 项 / 培训 15% / 多项异常叠加）。由站长约谈企业负责人，本周内完成约谈。要求企业提交整改方案和时间表，安排安全专家对企业进行全面安全诊断。',
          riskLevel: 'warning',
          recommendedPerson: '站长'
        }
      ]
    };

    // ═══ 重点跟进事项（共享数据） ════════════════════════════
    var FOLLOWUPS = [
      {
        title: '北苑商业综合体重大火灾隐患逾期未闭环',
        status: '已督办 / 待复查', statusCls: 'danger',
        responsibility: '消防线负责人王志安 / 对应组长 / 专家',
        latestProgress: '主体对象已提交整改材料，专家今日待复查',
        nextStep: '今日 17:00 前反馈复查结果',
        deadline: '逾期 3 天',
        overdue: 3,
        needIntervention: true,
        actions: ['继续督办', '要求反馈', '升级处置']
      },
      {
        title: '物流片区仓储场所整改超期',
        status: '跟进中', statusCls: 'warning',
        responsibility: '物流片区组长陈芳',
        latestProgress: '7 家中 3 家已反馈，2 家待现场核查，2 家未响应',
        nextStep: '未响应主体需再次提醒或升级',
        deadline: '2 家今日到期',
        overdue: 0,
        needIntervention: true,
        actions: ['提醒责任人', '要求现场核查', '发起约谈']
      },
      {
        title: '企业安全组专项检查进度滞后',
        status: '已要求说明', statusCls: 'neutral',
        responsibility: '生产企业线负责人张毅',
        latestProgress: '等待条线负责人反馈调整计划',
        nextStep: '今日内提交补充检查安排',
        deadline: '已滞后 19 天',
        overdue: 19,
        needIntervention: false,
        actions: ['提醒履职', '要求反馈']
      },
      {
        title: '云栖高层住宅自动消防设施失效',
        status: '已督办 / 未启动', statusCls: 'danger',
        responsibility: '消防线负责人李明',
        latestProgress: '自动喷淋系统18-25层大面积失效，整改未启动',
        nextStep: '需确认整改方案和启动时间',
        deadline: '逾期 1 天',
        overdue: 1,
        needIntervention: false,
        actions: ['继续督办', '发起约谈']
      }
    ];

    // ════════════════════════════════════════════════════════════════
    // 🆕 持续跟踪引擎（第4层闭环）— 诊断即创建，跟踪至闭环
    // ════════════════════════════════════════════════════════════════
    var TrackStore = {
      _key: 'yaq_tracks',
      _tracks: null,

      // 获取所有跟踪记录（惰性加载，支持外部同步更新）
      getAll: function() {
        if (!this._tracks) { this._load(); }
        return this._tracks;
      },

      // 按状态筛选
      getByStatus: function(status) {
        return this.getAll().filter(function(t) { return t.status === status; });
      },

      // 获取活跃跟踪（未关闭）
      getActive: function() {
        return this.getAll().filter(function(t) { return t.status !== 'closed'; });
      },

      // 创建一个跟踪记录
      add: function(opts) {
        var tracks = this.getAll();
        var now = new Date();
        var track = {
          id: 'trk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          title: opts.title || '未命名跟踪项',
          source: opts.source || '',
          sourceId: opts.sourceId || '',
          responsibility: opts.responsibility || '',
          status: 'tracking',           // tracking → progressing → resolved → closed
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          daysTracked: 0,
          progress: 0,                  // 0-100
          updates: [{                    // 第一条更新 = 创建记录
            at: now.toISOString(),
            text: '已加入持续跟踪' + (opts.initNote ? '：' + opts.initNote : '')
          }],
          deadline: opts.deadline || '',
          needIntervention: opts.needIntervention || false,
          tags: opts.tags || []
        };
        tracks.unshift(track);
        this._save();
        return track;
      },

      // 更新进展
      update: function(id, opts) {
        var tracks = this.getAll();
        for (var i = 0; i < tracks.length; i++) {
          if (tracks[i].id === id) {
            var t = tracks[i];
            if (opts.progress !== undefined) t.progress = Math.min(100, Math.max(0, opts.progress));
            if (opts.status) t.status = opts.status;
            if (opts.note) {
              t.updates.push({ at: new Date().toISOString(), text: opts.note });
            }
            if (opts.responsibility) t.responsibility = opts.responsibility;
            t.updatedAt = new Date().toISOString();
            // 自动推进：progress=100 → resolved
            if (t.progress >= 100 && t.status === 'progressing') t.status = 'resolved';
            this._save();
            return t;
          }
        }
        return null;
      },

      // 标记为已解决
      resolve: function(id, note) {
        return this.update(id, { status: 'resolved', progress: 100, note: note || '已闭环确认' });
      },

      // 关闭（归档）
      close: function(id, note) {
        return this.update(id, { status: 'closed', progress: 100, note: note || '已归档' });
      },

      // 删除跟踪
      remove: function(id) {
        var tracks = this.getAll();
        for (var i = 0; i < tracks.length; i++) {
          if (tracks[i].id === id) {
            tracks.splice(i, 1);
            this._save();
            return true;
          }
        }
        return false;
      },

      // 从诊断/处置上下文自动创建跟踪
      autoCreateFromContext: function(title, source, responsibility, deadline) {
        return this.add({
          title: title,
          source: source,
          sourceId: '',
          responsibility: responsibility || '',
          deadline: deadline || '',
          initNote: '来自「' + source + '」自动创建'
        });
      },

      // 计算各状态数量
      stats: function() {
        var tracks = this.getAll();
        var s = { total: tracks.length, tracking: 0, progressing: 0, resolved: 0, closed: 0 };
        for (var i = 0; i < tracks.length; i++) {
          if (s[tracks[i].status] !== undefined) s[tracks[i].status]++;
        }
        return s;
      },

      // 重新计算所有活跃跟踪的天数
      recalcDays: function() {
        var tracks = this.getAll();
        var now = new Date();
        for (var i = 0; i < tracks.length; i++) {
          if (tracks[i].status !== 'closed') {
            var created = new Date(tracks[i].createdAt);
            tracks[i].daysTracked = Math.floor((now - created) / (86400000));
          }
        }
        this._save();
      },

      _load: function() {
        var raw = ls.get(this._key);
        if (raw) {
          try { this._tracks = JSON.parse(raw); } catch(e) { this._tracks = []; }
        } else {
          this._tracks = [];
        }
      },

      _save: function() {
        ls.set(this._key, JSON.stringify(this._tracks));
      }
    };

    // 启动时填充示例跟踪数据（首次使用的用户能看到演示）
    (function() {
      var t = TrackStore.getAll();
      if (t.length === 0) {
        // 从 FOLLOWUPS 静态数据迁移为动态跟踪
        var staticFu = FOLLOWUPS;
        for (var si = 0; si < staticFu.length; si++) {
          var sf = staticFu[si];
          var days = sf.overdue > 0 ? 7 + sf.overdue : 7;
          var progress = sf.statusCls === 'danger' ? 25 : sf.statusCls === 'warning' ? 50 : 75;
          var track = TrackStore.add({
            title: sf.title,
            source: '系统初始化',
            responsibility: sf.responsibility,
            deadline: sf.deadline,
            needIntervention: sf.needIntervention,
            initNote: sf.latestProgress
          });
          // 模拟几天前的创建时间
          var oldDate = new Date();
          oldDate.setDate(oldDate.getDate() - days);
          track.createdAt = oldDate.toISOString();
          track.daysTracked = days;
          track.progress = progress;
          if (progress >= 100) track.status = 'resolved';
          else if (progress >= 50) track.status = 'progressing';
          // 添加模拟更新记录
          if (days > 3) {
            var midDate = new Date(oldDate);
            midDate.setDate(midDate.getDate() + Math.floor(days / 2));
            track.updates.push({ at: midDate.toISOString(), text: '责任方已反馈初步整改方案' });
          }
          TrackStore._save();
        }
      }
      // 每天首次加载时重算天数
      TrackStore.recalcDays();
    })();

    // 提前初始化 YAQ 命名空间，供后续代码注册
    var YAQ = window.YAQ = window.YAQ || {};

    // ─── 导出核心数据/工具到 YAQ 命名空间 ────────────────
    YAQ.ls = ls;
    YAQ.safeRender = safeRender;
    YAQ.$dom = $dom;
    YAQ.MOCK = MOCK;
    YAQ.FOLLOWUPS = FOLLOWUPS;
    YAQ.TrackStore = TrackStore;
    YAQ.STORAGE_VERSION = STORAGE_VERSION;

    // 对外暴露给 inline onclick 使用
    YAQ.addTrack = function(opts) {
      if (typeof opts === 'string') opts = { title: opts };
      var t = TrackStore.add(opts || {});
      YAQ.showToast('✅ 已加入持续跟踪');
      return t;
    };
    // 更新进展（弹窗输入进展描述）
    YAQ.updateTrackProgress = function(id) {
      var note = prompt('请输入最新进展描述：');
      if (note && note.trim()) {
        var t = TrackStore.getActive().filter(function(x) { return x.id === id; })[0];
        var currentProgress = t ? t.progress : 50;
        var pct = prompt('当前完成进度（0-100%）：', Math.min(100, currentProgress + 15));
        var progress = parseInt(pct, 10);
        if (isNaN(progress)) progress = Math.min(100, currentProgress + 15);
        TrackStore.update(id, { note: note.trim(), progress: progress });
        YAQ.showToast('✅ 进展已更新');
        YAQ.switchScene('followup');
      }
    };
    // 标记闭环
    YAQ.resolveTrack = function(id) {
      if (confirm('确认该事项已闭环？')) {
        var note = prompt('闭环说明（可选）：');
        TrackStore.resolve(id, note || '已闭环');
        YAQ.showToast('✅ 已标记为闭环');
        YAQ.switchScene('followup');
      }
    };
    // 归档
    YAQ.closeTrack = function(id) {
      TrackStore.close(id);
      YAQ.showToast('已归档');
      YAQ.switchScene('followup');
    };
    // 便捷入口：从当前上下文快速创建跟踪
    YAQ.quickTrack = function(title, source, responsibility) {
      return YAQ.addTrack({ title: title, source: source || '手动添加', responsibility: responsibility || '' });
    };
    YAQ.trackStore = TrackStore;

  })();