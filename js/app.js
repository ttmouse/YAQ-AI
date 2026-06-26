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
        return '<div class="error-state"><i data-lucide="alert-triangle" width="32" height="32" class="c-red"></i><h3>' + (fallbackMsg || '渲染异常') + '</h3><p>请刷新页面重试。' + (e.message ? ' (' + e.message + ')' : '') + '</p></div>';
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
    window.toggleDemoMenu = function() {};  // stub — agent-init.js 加载后替换为真实实现

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

    // 对外暴露给 inline onclick 使用
    var YAQ = window.YAQ = {};
    YAQ.ls = ls;  // 共享 localStorage 封装，供 agent-init.js 等后续脚本使用
    YAQ.addTrack = function(opts) {
      if (typeof opts === 'string') opts = { title: opts };
      var t = YAQ.trackStore.add(opts || {});
      showToast('✅ 已加入持续跟踪');
      return t;
    };
    // 更新进展（弹窗输入进展描述）
    YAQ.updateTrackProgress = function(id) {
      var note = prompt('请输入最新进展描述：');
      if (note && note.trim()) {
        var t = YAQ.trackStore.getActive().filter(function(x) { return x.id === id; })[0];
        var currentProgress = t ? t.progress : 50;
        // 用户大致评估进展百分比
        var pct = prompt('当前完成进度（0-100%）：', Math.min(100, currentProgress + 15));
        var progress = parseInt(pct, 10);
        if (isNaN(progress)) progress = Math.min(100, currentProgress + 15);
        YAQ.trackStore.update(id, { note: note.trim(), progress: progress });
        showToast('✅ 进展已更新');
        switchScene('followup');
      }
    };
    // 标记闭环
    YAQ.resolveTrack = function(id) {
      if (confirm('确认该事项已闭环？')) {
        var note = prompt('闭环说明（可选）：');
        YAQ.trackStore.resolve(id, note || '已闭环');
        showToast('✅ 已标记为闭环');
        switchScene('followup');
      }
    };
    // 归档
    YAQ.closeTrack = function(id) {
      YAQ.trackStore.close(id);
      showToast('已归档');
      switchScene('followup');
    };
    // 便捷入口：从当前上下文快速创建跟踪
    YAQ.quickTrack = function(title, source, responsibility) {
      return YAQ.addTrack({ title: title, source: source || '手动添加', responsibility: responsibility || '' });
    };
    // TrackStore 已在 js/track-store.js 中注册到 YAQ.trackStore

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
      if (ls.get('yaq_metric_ver') != STORAGE_VERSION) {
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
      if (!metricPrefs) ls.set('yaq_metric_ver', STORAGE_VERSION);

      // 态势摘要
      var summaryText = '整体可控，重点监管池稳定；物流等 2 个片区出现风险上升信号。';

      html += '<div class="info-card" id="situationCard">' +
        '<div class="info-card-head" style="flex-wrap:wrap;gap:0">' +
          '<h3><i data-lucide="activity" aria-hidden="true" class="c-accent"></i> 整体安全态势</h3>' +
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
          '<h3><i data-lucide="shield-alert" aria-hidden="true" class="c-red"></i> 关键风险闭环</h3>' +
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
          '<h3><i data-lucide="target" aria-hidden="true" class="c-accent"></i> 核心任务进展</h3>' +
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
      lucide.createIcons({ container: $dom.drawerBody });
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

    function getActionIcon(key) {
      var map = {
        // 中文 action 名称（用于优先处理队列）
        '督办': 'megaphone', '现场核查': 'search', '会议议题': 'calendar', '跟踪': 'pin', '提醒履职': 'bell',
        // 英文 action ID（用于处置建议）
        supervise: 'user-check', inspect: 'search', meeting: 'calendar', remind: 'bell', enforce: 'ban'
      };
      return map[key] || 'chevron-right';
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
          '<div class="info-card-head"><h3><i data-lucide="eye" aria-hidden="true" class="c-red"></i> 重大隐患回头看</h3><span class="info-card-badge danger">需确认 ' + countByStatus(h, '超期未整改') + '</span></div>' +
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
        '<div class="section-head" style="margin-bottom:0"><h2><i data-lucide="bar-chart-3" aria-hidden="true" class="c-accent"></i> 履职效能分析</h2></div>' +
        '<div class="efficiency-grid">' + cardsHtml +
        '<div class="eff-card full-width"><div class="eff-head"><h3><i data-lucide="alert-triangle" aria-hidden="true" class="c-orange"></i> 异常偏低提示</h3></div>' + alertsHtml + '</div>' +
        '</div>';
    }

    // ─── Responsibility ──────────────────────────────────────────────

    function renderResponsibility() {
      if (!MOCK.subjects || MOCK.subjects.length === 0) return renderEmpty('暂无主体数据', '当前没有责任主体评估数据。');
      var rows = '';
      for (var i = 0; i < MOCK.subjects.length; i++) {
        var s = MOCK.subjects[i];
        var riskLabel = s.risk === 'high' ? '高度关注' : s.risk === 'mid' ? '需关注' : '观察';
        rows += '<tr><td><a href="javascript:void(0)" onclick="openEnterprisePanel(\'' + s.name.replace(/'/g,"\\'") + '\');return false" style="color:var(--blue);text-decoration:none;border-bottom:1px dashed var(--blue);cursor:pointer">' + escapeHtml(s.name) + '</a></td><td>' + escapeHtml(s.selfCheck) + '</td><td>' + escapeHtml(s.govCheck) + '</td><td>' + escapeHtml(s.training) + '</td><td>' + escapeHtml(s.drill) + '</td><td><span class="st-risk ' + s.risk + '">' + riskLabel + '</span></td><td style="font-size:12px;color:var(--accent);font-weight:500;cursor:pointer" onclick="showToast(\'已记录建议：' + s.suggest.replace(/'/g,"\\'") + '\')">' + escapeHtml(s.suggest) + '</td></tr>';
      }

      return '' +
        '<div class="section-head" style="margin-bottom:0"><h2><i data-lucide="users" aria-hidden="true" class="c-accent"></i> 主体责任判断矩阵</h2></div>' +
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
              '<h3><i data-lucide="building" aria-hidden="true" class="c-accent"></i> 企业主体责任落实情况</h3>' +
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
        '<div class="section-head" style="margin-bottom:8px;margin-top:4px"><h2 style="font-size:14px"><i data-lucide="list" aria-hidden="true" class="c-accent"></i> 疑似主体责任异常对象</h2></div>' +
        '<div class="subject-table-wrap">' +
        '<table class="subject-table">' +
        '<thead><tr><th>主体对象</th><th>自查</th><th>政府检查</th><th>培训</th><th>演练</th><th>风险提示</th><th>建议动作</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>';
    }

    // ─── Disposal ────────────────────────────────────────────────────

    function renderDisposal() {
      var dInt = MOCK.disposalInternal || [];
      var dExt = MOCK.disposalExternal || [];
      var dSys = MOCK.disposalSystemic || [];

      function renderLevels(arr, tagPrefix) {
        if (!arr || arr.length === 0) return '<div style="padding:16px 0;text-align:center;color:var(--muted);font-size:13px">暂无分级处置数据</div>';
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
              '<div class="dl-item-body"><div class="dl-item-title">' + escapeHtml(lv.items[ii].title) + '</div><div class="dl-item-desc">' + escapeHtml(lv.items[ii].desc) + '</div></div>' +
              '<button class="dl-item-action" onclick="' + (btnAction === 'remind-all' ? 'openDrawer(\'remind\')' : 'showToast(\'动作已记录，将跟踪闭环\')') + '"><i data-lucide="' + btnIcon + '" aria-hidden="true"></i> ' + btnLabel + '</button>' +
            '</div>';
          }
          h += '<div class="disposal-level">' +
            '<div class="dl-head"><span class="dl-tag ' + lv.tag + '">L' + lv.level + '</span><span class="dl-title">' + escapeHtml(lv.levelName) + '</span></div>' +
            '<div class="dl-list">' + itemsHtml + '</div></div>';
        }
        return h;
      }

      var html = renderDisposalRecommendations();

      html += '<div class="section-head" style="margin-bottom:0;margin-top:32px"><h2><i data-lucide="git-branch" aria-hidden="true" class="c-accent"></i> 分级处置闭环</h2></div>';

      // Two-column layout: internal + external
      html += '<div class="two-col-grid">' +

        // Internal management
        '<div class="info-card">' +
          '<div class="info-card-head"><h3><i data-lucide="user-cog" aria-hidden="true" class="c-accent"></i> 内部管理 · 街道/村社人员</h3></div>' +
          renderLevels(dInt, 'int') +
        '</div>' +

        // External management
        '<div class="info-card">' +
          '<div class="info-card-head"><h3><i data-lucide="building-2" aria-hidden="true" class="c-orange"></i> 外部管理 · 经营主体</h3></div>' +
          renderLevels(dExt, 'ext') +
        '</div>' +

      '</div>';

      // Systemic improvement section
      html += '<div class="info-card">' +
        '<div class="info-card-head"><h3><i data-lucide="refresh-cw" aria-hidden="true" class="c-accent"></i> 系统性改进 · 复盘与优化</h3></div>' +
        '<div class="dl-list">';
      if (dSys.length === 0) {
        html += '<div style="padding:16px 0;text-align:center;color:var(--muted);font-size:13px">暂无系统性改进建议</div>';
      } else {
        for (var si = 0; si < dSys.length; si++) {
          html += '<div class="dl-item">' +
            '<div class="dl-item-icon level-5"><i data-lucide="' + dSys[si].icon + '" aria-hidden="true"></i></div>' +
            '<div class="dl-item-body"><div class="dl-item-title">' + escapeHtml(dSys[si].title) + '</div><div class="dl-item-desc">' + escapeHtml(dSys[si].desc) + '</div></div>' +
            '<button class="dl-item-action" onclick="showToast(\'已记录复盘建议\')"><i data-lucide="chevron-right" aria-hidden="true"></i> 查看</button>' +
          '</div>';
        }
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

      var html = '<div class="section-head" style="margin-bottom:0;margin-top:24px"><h2><i data-lucide="sparkles" aria-hidden="true" class="c-accent"></i> AI 处置建议</h2><span class="info-card-badge" style="background:var(--accent);color:#fff">' + recs.length + ' 条待确认</span></div>';
      html += '<div class="info-card"><div class="info-card-head"><h3><i data-lucide="bot" aria-hidden="true" class="c-accent"></i> 基于异常诊断自动生成</h3><button class="dl-item-action" onclick="regenerateDisposalRecs()" style="padding:4px 10px;font-size:11px"><i data-lucide="refresh-cw" width="12" height="12"></i> 重新生成</button></div>';

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
              '<span class="dr-level-badge" style="background:' + levelBg + ';color:' + levelColor + '"><i data-lucide="' + getLevelDot(r.suggestedLevel) + '" width="11" height="11" class="v-middle"></i>' + r.suggestedLevelLabel + '</span>' +
            '</div>' +
            '<div class="dr-body-row">' +
              '<span class="dr-label">推荐动作</span>' +
              '<span class="dr-action-badge"><i data-lucide="' + actionIcon + '" width="11" height="11" class="v-middle"></i>' + r.suggestedActionLabel + '</span>' +
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
            '<button class="dr-action-btn primary" onclick="copyDisposalRec(' + ri + ')" title="复制文案"><i data-lucide="copy" width="13" height="13"></i> 复制文案</button>' +
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
        html += '<div class="dr-rule-section"><div class="dr-rule-head"><i data-lucide="settings-2" width="15" height="15" class="c-orange"></i> 规则引擎触发 · ' + dangerRules.length + ' 条危险规则匹配</div>';
        for (var dri = 0; dri < dangerRules.length; dri++) {
          var dr = dangerRules[dri];
          var ruleName = dr.rule.name || dr.rule.dimension || '未知规则';
          var ruleDim = dr.rule.dimension || '';
          var levelMap = ruleDimToLevel[ruleDim] || { level: 'internal-3', label: '内部第 3 级 · 一键提醒履职', action: 'remind' };
          var lvlHtml = '<span class="dr-level-badge" style="background:var(--red-soft);color:var(--red)"><i data-lucide="alert-triangle" width="11" height="11" class="v-middle"></i>' + levelMap.label + '</span>';
          html += '<div class="dr-rule-item">' +
            '<div class="dr-rule-item-left"><i data-lucide="zap" width="14" height="14" class="c-red"></i></div>' +
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
        '<button class="primary" onclick="generateAllDisposalText()" style="display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:8px;border:none;background:var(--accent);color:#fff;font-size:13px;font-weight:500;cursor:pointer"><i data-lucide="file-text" width="15" height="15"></i> 生成全部处置建议</button>' +
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
      var tracks = YAQ.trackStore.getActive();
      var stats = YAQ.trackStore.stats();
      var html = '<div class="section-head" style="margin-bottom:0"><h2><i data-lucide="list-checks" aria-hidden="true" class="c-accent"></i> 重点跟进</h2></div>' +

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
              '<span class="c-weak">跟踪天数：</span>' + (fu.daysTracked || 0) + ' 天' +
              (fu.responsibility ? ' · <span class="c-weak">责任：</span>' + escapeHtml(fu.responsibility) : '') +
              (fu.deadline ? ' · <span class="c-weak">截止：</span>' + escapeHtml(fu.deadline) : '') +
            '</div>' +

            // 最新进展
            (fu.updates && fu.updates.length > 0 ?
              '<div style="font-size:11px;color:var(--muted);line-height:1.5;background:var(--bg);padding:6px 8px;border-radius:4px">' +
                '<span class="c-weak">最新：</span>' + escapeHtml(fu.updates[fu.updates.length - 1].text) +
              '</div>'
            : '') +

            // 时间线（最近2条）
            (fu.updates && fu.updates.length > 1 ?
              '<div style="font-size:10px;color:var(--weak);line-height:1.4;padding-left:4px">' +
                (fu.updates.slice(-2).map(function(u) {
                  var d = new Date(u.at);
                  return '<div style="display:flex;gap:4px">' +
                    '<span class="c-muted">' + (d.getMonth()+1) + '/' + d.getDate() + '</span>' +
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
        '<h2><i data-lucide="clipboard-check" aria-hidden="true" class="c-accent"></i> 待确认行动</h2>' +
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
        '<h2><i data-lucide="alert-circle" aria-hidden="true" class="c-accent"></i> 督办跟踪</h2>' +
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
          '<i data-lucide="calendar" width="14" height="14" class="c-accent"></i> 历史月报' +
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

    var currentDrawerAction = '';

    function openDrawer(action) {
      var content = drawerContent[action];
      if (!content) return;
      currentDrawerAction = action;
      // 恢复确认按钮默认文案
      $dom.drawerConfirm.textContent = '确认生成';
      $dom.drawerTitle.innerHTML = '<i data-lucide="' + getDrawerIcon(action) + '" aria-hidden="true"></i> ' + content.title;

      var bodyHtml = '';
      for (var i = 0; i < content.sections.length; i++) {
        var sec = content.sections[i];
        bodyHtml += '<div class="drawer-section"><div class="drawer-section-label">' + sec.label + '</div><div class="drawer-section-value">' + sec.value.replace(/\n/g, '<br>') + '</div></div>';
        if (i < content.sections.length - 1) bodyHtml += '<div class="drawer-divider"></div>';
      }
      $dom.drawerBody.innerHTML = bodyHtml;
      lucide.createIcons({ container: $dom.drawerBody });

      $dom.drawerPanel.classList.add('open');
      $dom.drawerOverlay.classList.add('open');
    }

    function closeDrawer() {
      $dom.drawerPanel.classList.remove('open');
      $dom.drawerOverlay.classList.remove('open');
      $dom.drawerConfirm.textContent = '确认生成';
      $dom.drawerCancel.style.display = '';
    }

    // ════════════════════════════════════════════════════════════════
    // AGENT CONFIG
    // ════════════════════════════════════════════════════════════════

    var agentSceneNames = {
      dashboard: '今日监管工作台',
      'hazard-report': '重大隐患整改日报',
      efficiency: '履职效能统计',
      responsibility: '主体责任评估',
      disposal: '分级处置流程',
      followup: '跟踪事项汇总'
    };

    var agentDefaultPrompts = {
      dashboard: '你是安全监管 AI 助手，为站长生成「今日监管工作台」页面内容。页面由以下四大板块组成：\n\n一、整体安全态势\n展示核心运营数据指标卡，按分组呈现：\n- 监管概况：安全责任主体总数、覆盖户数（累计/期间）、主体覆盖率、风险等级上调数、新增重大/较大风险主体数\n- 监管执法：检查次数（日常+监督）、检查单推送户数/次数、办结数/办结率、未办结数\n- 隐患闭环：新增隐患、累计隐患、未闭环隐患、整改完成（期间/累计）、隐患整改率\n- 重大隐患：新增重大隐患、累计重大隐患、未闭环重大隐患、超期未整改\n同时展示四级风险分布（重大/较大/一般/低风险主体数量）。\nAI 问候语在最顶部，根据时段打招呼，简要说明今日需关注的方向数量。\n\n二、关键风险闭环\n展示当前重大隐患的横向卡片列表，每张卡片包含：\n- 隐患对象名称\n- 隐患描述\n- 来源（政府检查/企业自查/群众举报等）\n- 当前状态（整改中/督办中/已完成等）\n- 逾期天数\n- 发现日期 → 整改截止日期\n顶部有 AI 摘要句，说明当前重大隐患总体情况（如"5 项重大隐患，2 项超期"）。\n\n三、核心任务进展\n展示监管任务的横向卡片列表，每张卡片包含：\n- 任务名称（日常/专项标签）\n- 双环进度图：外环为进度百分比，内环为完成率\n- 覆盖主体数、发现隐患数、未闭环数\n- 起止日期\n顶部有异常任务数量标识。异常任务排在前面，用红/橙色角标标注。\n\n四、待确认行动项\nAI 基于今日数据生成的待确认行动，每项包含：\n- 行动标题\n- 类型标签（督办/约谈/核查等）\n- 法规依据\n- 具体要求\n- 建议动作按钮（主操作+次操作）\n顶部有流程步骤指示（异常识别 → 问题聚合 → 行动生成待确认）和行动总数。\n\n输出语言风格：简洁、专业、面向基层安全管理者，数据驱动，避免过度技术术语。',

      'hazard-report': '你是安全监管 AI 助手，为站长生成重大隐患整改日报。\n\n请按以下结构生成内容：\n\n1. 统计概览：\n   - 重大隐患总数（当前）\n   - 超期未整改数（标红）\n   - 即将到期数（3 天内到期，标橙）\n   - 整改中数\n   - 反复出现数（同一主体同一隐患重复出现）\n\n2. 隐患回头看：对每个重大隐患（状态为危险或预警），列出——\n   - 隐患对象和隐患描述\n   - 所属区域\n   - 当前状态和上期状态（标注改善/恶化/无变化）\n   - 临时管控措施\n   - 整改方案\n   - 时间表和责任人\n\n3. 状态变化表：逐项对比上期与本期状态，标注改善/恶化趋势，对恶化项重点提醒。\n\n4. 整改建议：对超期项给出升级建议（督办、约谈、联合执法），对即将到期项给出催办建议。\n\n输出语言风格：严肃、紧迫感、数据驱动，突出超期和恶化趋势。',

      efficiency: '你是安全监管 AI 助手，为站长生成履职效能分析报告。\n\n请按以下结构生成内容：\n\n1. 分组效能卡片：按监管组别展示以下指标——\n   - 检查完成率（已查/应查）\n   - 复查率（已复查/需复查）\n   - 隐患发现率（发现隐患数/检查数）\n   - 文书合规率（合格文书/总文书）\n   - 闭环率（已闭环隐患/总隐患）\n   每个指标给出达标状态（正常/异常）。\n\n2. 异常偏低提示：列出效能明显偏低的组别和指标，说明偏低原因推测（如"该组检查任务集中在下周"、"新入职人员占比高"等），给出核查建议。\n\n3. 对比分析：与上月同期对比，标注改善/退步的趋势箭头。\n\n4. 改进建议：对落后组别给出具体改进措施（如增加培训、调整排班、优化检查流程等）。\n\n输出语言风格：客观、数据化、可操作，便于站长直接用于组别考核。',

      responsibility: '你是安全监管 AI 助手，为站长生成主体责任评估报告。\n\n请按以下结构生成内容：\n\n1. 主体责任判断矩阵：按两个维度（自查频次 vs 政府检查发现）将主体分为四类——\n   - 主体责任较主动：自查多，政府检查少，安全管理较到位（绿色）\n   - 疑似敷衍自查：自查为 0 或极少，政府检查发现多项隐患（红色）\n   - 管理能力不足：培训低，隐患反复，安全投入不足（橙色）\n   - 触达失败：平台长期不登录，需要培训或依法督促（灰色）\n\n2. 企业主体责任落实表格：逐企业列出——\n   - 企业名称\n   - 自查次数\n   - 政府检查次数\n   - 培训次数\n   - 演练次数\n   - 风险评级（高度关注/需关注/观察）\n   - AI 建议（如"建议约谈"、"纳入重点监管"、"继续观察"等）\n\n3. 统计汇总：自查为 0 的主体数、培训低于 2 次的主体数、高度关注主体数、未演练主体数。\n\n4. 薄弱环节分析：识别共性问题（如"8 家主体自查为 0，占总数 40%"），给出批量处置建议。\n\n输出语言风格：客观、分类清晰、建议具体可执行。',

      disposal: '你是安全监管 AI 助手，为站长生成分级处置闭环报告。\n\n请按以下结构生成内容：\n\n1. 处置建议概览：简要说明当前处置事项总数和各层级分布。\n\n2. 分级处置事项（按三个层级组织）：\n   - L1 内部处置：监管组内部可闭环的事项（如提醒企业自查、补充文书等）\n     每项列出：事项标题、简要描述、建议动作（执行/一键提醒）\n   - L2 外部处置：需跨部门或外部资源的事项（如联合检查、约谈企业负责人等）\n     每项列出：事项标题、涉及部门、简要描述、建议动作\n   - L3 系统性处置：需系统层面优化的事项（如流程优化、制度修订等）\n     每项列出：事项标题、问题分析、优化建议\n\n3. 超期未处置提醒：列出超过处置时限的事项，标注超期天数，给出升级建议。\n\n4. 闭环率统计：各层级的处置闭环率，对比目标值（目标 95%），标识落后层级。\n\n输出语言风格：层次分明、动作导向、便于站长逐项认领和分配。',

      followup: '你是安全监管 AI 助手，为站长生成重点跟进事项汇总。\n\n请按以下结构生成内容：\n\n1. 跟进事项列表：每项包含——\n   - 事项标题\n   - 当前状态（进行中/待处理/已超期/需干预）\n   - 责任人/责任单位\n   - 最新进展描述\n   - 下一步动作建议（如"发起督办"、"升级约谈"、"持续观察"等）\n   - 截止时间和剩余天数\n   - 是否需要站长干预（标红左边框）\n\n2. 状态分类统计：\n   - 进行中 X 项\n   - 待处理 X 项\n   - 已超期 X 项（标红）\n   - 需干预 X 项（标红）\n\n3. 即将到期提醒：3 天内到期的事项单独列出，标注剩余天数。\n\n4. 优先级建议：按紧急程度排序，对需干预项给出具体操作建议（如"建议今日召开专题会议"、"建议联合执法介入"等）。\n\n输出语言风格：紧凑、紧迫感强、每项都有明确的下一步动作，便于站长快速决策。'
    };

    var agentDefaultCron = {
      dashboard: '0 8 * * *',
      'hazard-report': '0 9 * * 1',
      efficiency: '0 8 1 * *',
      responsibility: '0 8 1 * *',
      disposal: '0 8 * * 1-5',
      followup: '0 17 * * 1-5'
    };

    var agentSchedulePresets = [
      { label: '每天早上 8:00',        cron: '0 8 * * *' },
      { label: '每个工作日早上 8:00',   cron: '0 8 * * 1-5' },
      { label: '每个工作日早上 9:00',   cron: '0 9 * * 1-5' },
      { label: '每个工作日下午 5:00',   cron: '0 17 * * 1-5' },
      { label: '每周一早上 9:00',       cron: '0 9 * * 1' },
      { label: '每周五下午 5:00',       cron: '0 17 * * 5' },
      { label: '每月 1 号早上 8:00',    cron: '0 8 1 * *' },
      { label: '每月 15 号早上 8:00',   cron: '0 8 15 * *' }
    ];

    function getDefaultPrompt(sceneId) {
      var saved = ls.get('yaq_agent_prompt_' + sceneId);
      return saved || agentDefaultPrompts[sceneId] || '';
    }

    function openAgentConfig(sceneId) {
      var name = agentSceneNames[sceneId] || sceneId;
      var defaultPrompt = agentDefaultPrompts[sceneId] || '';
      var savedPrompt = ls.get('yaq_agent_prompt_' + sceneId) || '';
      var cron = ls.get('yaq_agent_cron_' + sceneId) || agentDefaultCron[sceneId] || '0 8 * * *';

      $dom.drawerConfirm.style.display = 'none';
      $dom.drawerCancel.textContent = '关闭';
      $dom.drawerTitle.innerHTML = '<i data-lucide="settings-2" aria-hidden="true"></i> Agent 配置 — ' + name;

      var promptOptionsHtml = '';
      for (var p = 0; p < agentSchedulePresets.length; p++) {
        var preset = agentSchedulePresets[p];
        var selected = preset.cron === cron ? ' selected' : '';
        promptOptionsHtml += '<option value="' + escapeHtml(preset.cron) + '"' + selected + '>' + preset.label + '</option>';
      }

      var bodyHtml =
        '<div class="agent-config-section">' +
          '<label><i data-lucide="message-square" width="13" height="13"></i> 提示词</label>' +
          '<textarea class="agent-prompt-ta" id="agentPromptEditable" placeholder="在此编辑提示词…">' + escapeHtml(savedPrompt || defaultPrompt) + '</textarea>' +
          '<div class="agent-config-hint">编辑后点击保存；清空内容并保存可恢复默认提示词</div>' +
        '</div>' +
        '<div class="agent-config-section">' +
          '<label><i data-lucide="clock" width="13" height="13"></i> 执行周期</label>' +
          '<select id="agentScheduleSelect" class="agent-schedule-select">' + promptOptionsHtml + '</select>' +
          '<div class="agent-config-hint">Cron: <code id="agentCronPreview">' + escapeHtml(cron) + '</code></div>' +
        '</div>' +
        '<button class="agent-config-save" onclick="saveAgentPrompt(\'' + sceneId + '\')"><i data-lucide="check" width="14" height="14"></i> 保存配置</button>';

      $dom.drawerBody.innerHTML = bodyHtml;
      lucide.createIcons({ container: $dom.drawerBody });

      // 预览 cron 变化
      var selectEl = $dom.agentScheduleSelect;
      if (selectEl) {
        selectEl.addEventListener('change', function() {
          var preview = $dom.agentCronPreview;
          if (preview) preview.textContent = this.value;
        });
      }

      // textarea 自适应高度
      var ta = $dom.agentPromptEditable;
      if (ta) {
        var autoResize = function() {
          this.style.height = 'auto';
          this.style.height = this.scrollHeight + 'px';
        };
        ta.addEventListener('input', autoResize);
        autoResize.call(ta);
      }

      $dom.drawerPanel.classList.add('open');
      $dom.drawerOverlay.classList.add('open');
    }

    function saveAgentPrompt(sceneId) {
      var promptEl = $dom.agentPromptEditable;
      var scheduleEl = $dom.agentScheduleSelect;
      if (promptEl) {
        var val = promptEl.value.trim();
        if (val) {
          ls.set('yaq_agent_prompt_' + sceneId, val);
        } else {
          ls.remove('yaq_agent_prompt_' + sceneId);
        }
      }
      if (scheduleEl) ls.set('yaq_agent_cron_' + sceneId, scheduleEl.value);
      showToast('Agent 配置已保存', 'mock');
      closeDrawer();
    }

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

    function getDrawerIcon(action) {
      var map = { briefing: 'file-text', supervise: 'megaphone', meeting: 'calendar', inspect: 'search', remind: 'bell' };
      return map[action] || 'file-text';
    }

    // ════════════════════════════════════════════════════════════════
    // TOAST
    // ════════════════════════════════════════════════════════════════

    function showToast(msg, type) {
      var el = $dom.toast;
      el.textContent = type === 'mock' ? '🧪 [演示] ' + msg : msg;
      el.className = 'toast' + (type === 'mock' ? ' mock' : '');
      el.classList.add('show');
      setTimeout(function() { el.classList.remove('show'); }, 2500);
    }

    // ════════════════════════════════════════════════════════════════
    // HAZARD DETAIL
    // ════════════════════════════════════════════════════════════════

    function openHazardDetail(objectName, foundDate) {
      // 先从全部隐患中查找（按对象 + 日期精确定位）
      var h = null;
      for (var si = 0; si < MOCK.hazards.length; si++) {
        if (MOCK.hazards[si].object === objectName) {
          if (foundDate === undefined || MOCK.hazards[si].foundDate === foundDate) {
            h = MOCK.hazards[si]; break;
          }
        }
      }
      if (!h) {
        var arr = window.__majorHazards || [];
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].object === objectName) { h = arr[i]; break; }
        }
      }
      if (!h) { showToast('未找到隐患数据'); return; }
      window.__currentHazard = h;

      var dotColor = h.level.indexOf('重大') > -1 ? 'var(--red)' : '#d97706';
      $dom.hazardModalName.innerHTML = '<a href="#" onclick="openEnterprisePanel(\'' + h.object.replace(/'/g, "\\'") + '\');return false" style="color:var(--text);text-decoration:none;border-bottom:1px dashed var(--blue)">' + escapeHtml(h.object) + '</a>';
      $dom.hazardModalDot.style.background = dotColor;

      // — 顶部状态区 —
      var statusBadge = '<span class="hc-status ' + h.statusCls + '" style="font-size:11px;padding:2px 8px">' + h.status + '</span>';
      var overdueHtml = h.overdue > 0 ? '<span style="color:var(--red);font-weight:700;font-size:13px">⚠ 逾期 ' + h.overdue + ' 天</span>' : '';
      var bodyHtml =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;background:color-mix(in oklch, var(--red) 12%, #fff);color:var(--red)">' + h.level + '</span>' +
          statusBadge +
        '</div>' +
        (overdueHtml ? '<div>' + overdueHtml + '</div>' : '') +
      '</div>' +
      // — 隐患描述（突出）—
      '<div style="font-size:14px;font-weight:600;color:var(--text);line-height:1.5;margin-bottom:12px;padding:10px 12px;background:var(--fg-soft);border-radius:10px">' + h.hazard.replace(/\n/g, '<br>') + '</div>' +
      // — 整改建议（突出）—
      '<div style="font-size:10px;font-weight:600;color:var(--weak);margin-bottom:4px;letter-spacing:0.05em">整改建议</div>' +
      '<div style="font-size:13px;color:#344054;line-height:1.6;margin-bottom:14px;padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">' + (h.suggestion || '—') + '</div>' +
      // — 基础信息（两列简洁）—
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 16px;margin-bottom:10px">' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span class="c-weak">对象</span> <a href="#" onclick="openEnterprisePanel(\'' + h.object.replace(/'/g, "\\'") + '\');return false" style="color:var(--blue);text-decoration:none;border-bottom:1px dashed var(--blue)">' + escapeHtml(h.object) + '</a></div>' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span class="c-weak">责任人</span> ' + (h.person || '—') + '</div>' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span class="c-weak">发现</span> ' + (h.discoverer || '—') + ' / ' + h.foundDate + '</div>' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span class="c-weak">期限</span> ' + h.deadline + '</div>' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span class="c-weak">来源</span> ' + h.source + '</div>' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span class="c-weak">片区</span> ' + (h.region || '—') + '</div>' +
      '</div>' +
      // — 依据（可折叠）—
      '<div id="regulationWrap" style="margin-bottom:6px">' +
        '<div onclick="toggleRegulation()" style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--weak);cursor:pointer;user-select:none">' +
          '<span id="regArrow">▶</span> 关联法规依据' +
        '</div>' +
        '<div id="regulationBody" style="display:none;margin-top:4px;font-size:11.5px;color:var(--muted);padding:6px 10px;background:#f9fafb;border-radius:8px">' + (h.regulation || '无') + '</div>' +
      '</div>';

      // 现场证据（图片区域单独展示）
      bodyHtml += '<div style="border-bottom:1px solid var(--line);margin:8px 0"></div>';
      bodyHtml += '<div style="font-size:10px;font-weight:600;color:var(--weak);margin-bottom:8px;letter-spacing:0.05em">现场证据</div>';
      // 问题快照
      var photoCount = h.hasPhoto ? 3 : 0;
      bodyHtml += '<div class="hmodal-row" style="align-items:flex-start;padding-top:10px"><div class="hmodal-label">问题快照</div><div class="hmodal-value"><div style="display:flex;gap:8px;flex-wrap:wrap">';
      if (photoCount > 0) {
        for (var pi = 1; pi <= photoCount; pi++) {
          bodyHtml += '<div style="width:80px;height:60px;border-radius:8px;background:#f2f4f7;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--weak)"><i data-lucide="image" width="16" height="16" style="opacity:.4"></i></div>';
        }
      } else {
        bodyHtml += '<span style="font-size:11px;color:var(--weak)">无</span>';
      }
      bodyHtml += '</div></div></div>';
      // 整改结果
      bodyHtml += '<div class="hmodal-row" style="align-items:flex-start;padding-top:10px"><div class="hmodal-label">整改结果</div><div class="hmodal-value">' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px">' +
        (h.resultPhoto ? '<div style="width:80px;height:60px;border-radius:8px;background:#e8f5e9;border:1px solid #c8e6c9;display:flex;align-items:center;justify-content:center;font-size:10px;color:#2e7d32"><i data-lucide="check-circle" width="16" height="16"></i></div>' : '') +
        '</div>' +
        (h.resultText ? '<div style="font-size:12px;color:var(--text);line-height:1.5">' + h.resultText + '</div>' : '') +
      '</div></div>';

      // 生成 AI 结论
      var aiHtml = '';
      var entData = ENTERPRISE_DB[h.object];
      if (entData) {
        aiHtml =
        '<div style="font-size:12px;line-height:1.65;color:#344054">' +
          generateHazardAnalysis(h, entData) +
        '</div>';
      }

      $dom.hazardModalBody.innerHTML =
        '<div class="hmodal-main">' + bodyHtml + '</div>' +
        '<div class="hmodal-ai">' + aiHtml + '</div>';

      $dom.hazardModalOverlay.style.display = 'block';
      $dom.hazardModal.style.display = 'flex';
    }

    function generateHazardAnalysis(h, entData) {
      var allHaz = MOCK.hazards.filter(function(x) { return x.object === h.object; });
      var prevSame = allHaz.filter(function(x) { return x.hazard.indexOf(h.hazard.slice(0, 6)) > -1 && x !== h; });
      var overdue = h.overdue > 0;
      var si = entData.selfInspections || [];
      var siRate = si.length > 0 ? Math.round(si.filter(function(x) { return x.statusCls === 'done' || x.status === '无异常'; }).length / si.length * 100) : 0;
      var totalHaz = allHaz.length;
      var closedHaz = allHaz.filter(function(x) { return x.statusCls === 'done'; }).length;
      var closedRate = totalHaz > 0 ? Math.round(closedHaz / totalHaz * 100) : 0;

      var summary = '';
      if (overdue) {
        summary = '该隐患已逾期 <strong>' + h.overdue + ' 天</strong>，';
        summary += h.level.indexOf('重大') > -1 ? '属于重大事故隐患，需站长立即介入。' : '需尽快处置。';
      }

      // 综合判断：问题出在哪一端
      var enterpriseWeak = siRate < 60;
      var repeatIssue = prevSame.length > 0;
      if (enterpriseWeak || repeatIssue) {
        summary += '企业自检执行率仅 ' + siRate + '%，隐患闭环率 ' + closedRate + '%，主体责任落实不到位。';
      }
      if (repeatIssue) {
        summary += '同类隐患反复出现 ' + prevSame.length + ' 次，需深挖根因。';
      }
      if (!enterpriseWeak && !repeatIssue && !overdue) {
        summary = '该企业自检执行率 ' + siRate + '%，隐患闭环率 ' + closedRate + '%，整体履职基本到位。详情可查看右侧企业侧边栏。';
      }

      summary += ' 点击上方企业名称查看完整评估报告。';
      return summary;
    }

    function closeHazardModal() {
      $dom.hazardModalOverlay.style.display = 'none';
      $dom.hazardModal.style.display = 'none';
    }

    // ─── 复制隐患信息 ─────────────────────────────────────────
    function copyHazardInfo() {
      var h = window.__currentHazard;
      if (!h) { showToast('无数据可复制'); return; }
      var lines = [
        '【隐患对象】' + h.object,
        '【隐患等级】' + h.level,
        '【隐患描述】' + h.hazard,
        '【整改建议】' + (h.suggestion || '—'),
        '【整改依据】' + (h.regulation || '—'),
        '【当前状态】' + h.status,
        '【责任人】' + (h.person || '—'),
        '【发现人】' + (h.discoverer || '—') + ' / ' + h.foundDate,
        '【整改期限】' + h.deadline,
        '【来源】' + h.source,
        '【片区】' + (h.region || '—'),
        '【整改措施】' + (h.measures || '—'),
        '【整改计划】' + (h.plan || '—')
      ];
      if (h.overdue > 0) lines.splice(5, 0, '⚠ 已逾期 ' + h.overdue + ' 天');
      var text = lines.join('\n');
      copyToClipboard(text, '隐患信息已复制');
    }

    function copyToClipboard(text, msg) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          showToast(msg || '已复制');
        }).catch(function() {
          fallbackCopy(text, msg);
        });
      } else {
        fallbackCopy(text, msg);
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 企业详情面板
    // ════════════════════════════════════════════════════════════════

    function openEnterprisePanel(name) {
      var data = ENTERPRISE_DB[name];
      if (!data) {
        // Fallback: check MOCK.subjects for minimal data
        var subj = null;
        for (var si = 0; si < MOCK.subjects.length; si++) {
          if (MOCK.subjects[si].name === name) { subj = MOCK.subjects[si]; break; }
        }
        if (subj) {
          var riskColor = subj.risk === 'high' ? 'var(--red)' : subj.risk === 'mid' ? '#d97706' : 'var(--green)';
          var riskLabel = subj.risk === 'high' ? '重大风险' : subj.risk === 'mid' ? '一般风险' : '低风险';
          data = {
            region: '—',
            person: '—',
            type: '企业',
            area: '—',
            riskLevel: riskLabel,
            score: subj.risk === 'high' ? 'C' : subj.risk === 'mid' ? 'B' : 'A',
            scorePct: subj.risk === 'high' ? 35 : subj.risk === 'mid' ? 60 : 85,
            summary: '待完善企业安全评估数据。当前自查 ' + (subj.selfCheck || '0 次') + '，政府检查 ' + (subj.govCheck || '—') + '，培训完成率 ' + (subj.training || '—') + '，应急演练 ' + (subj.drill || '0 次') + '。',
            dimensions: [
              { id: 'responsibility', label: '安全责任体系', score: subj.risk === 'high' ? 'C' : subj.risk === 'mid' ? 'B' : 'A', icon: 'shield', text: '待完善。', bar: subj.risk === 'high' ? 'c' : subj.risk === 'mid' ? 'b' : 'a' },
              { id: 'inspection', label: '隐患排查治理', score: subj.risk === 'high' ? 'D' : subj.risk === 'mid' ? 'C' : 'B', icon: 'search', text: '待完善。', bar: 'c' },
              { id: 'training', label: '教育培训', score: subj.risk === 'high' ? 'D' : 'C', icon: 'graduation-cap', text: '培训完成率 ' + (subj.training || '—') + '。', bar: 'c' },
              { id: 'emergency', label: '应急管理能力', score: 'C', icon: 'alert-triangle', text: '应急演练 ' + (subj.drill || '0 次') + '。', bar: 'c' },
              { id: 'history', label: '历史表现评价', score: subj.risk === 'high' ? 'C' : 'B', icon: 'clock', text: '建议完善企业安全管理档案。', bar: 'b' }
            ],
            hazards: [],
            selfInspections: [],
            expertRecords: [],
            trainingRecords: []
          };
        } else {
          showToast('暂无该企业评估数据');
          return;
        }
      }

      // 填充该企业的历史隐患
      data.hazards = [];
      for (var ei = 0; ei < MOCK.hazards.length; ei++) {
        if (MOCK.hazards[ei].object === name) {
          data.hazards.push(MOCK.hazards[ei]);
        }
      }

      $dom.epName.textContent = name;
      $dom.epFixedTop.innerHTML = epRenderFixedTop(data);
      window.__epActiveTab = 'hazards';
      $dom.epTabContent.innerHTML = epRenderTab(data, 'hazards');
      $dom.epPanel.classList.add('open');
      window.__epData = data;
      lucide.createIcons({ container: $dom.epTabContent });
    }

    function closeEnterprisePanel() {
      $dom.epPanel.classList.remove('open');
    }

    function epSwitchTab(tab) {
      var data = window.__epData;
      if (!data) return;
      // 更新指标卡高亮
      var cards = document.querySelectorAll('#epFixedTop .ep-tab-card');
      cards.forEach(function(c) { c.classList.remove('mc-active'); });
      cards.forEach(function(c) { if (c.getAttribute('data-tab') === tab) c.classList.add('mc-active'); });
      // 更新内容区
      $dom.epTabContent.innerHTML = epRenderTab(data, tab);
      window.__epActiveTab = tab;
      lucide.createIcons({ container: $dom.epTabContent });
    }

    function epRenderFixedTop(data) {
      var riskColor = { '重大风险': 'var(--red)', '较大风险': '#d97706', '一般风险': 'var(--green)', '低风险': '#6b7280' };
      var riskBg = { '重大风险': '#fff1f2', '较大风险': '#fff7e6', '一般风险': '#eaf8f1', '低风险': '#f2f4f7' };
      var rColor = riskColor[data.riskLevel] || 'var(--muted)';
      var rBg = riskBg[data.riskLevel] || '#f2f4f7';
      var unclosedHaz = data.hazards.filter(function(x) { return x.statusCls !== 'done'; }).length;
      var activeTab = window.__epActiveTab || 'hazards';

      var html =
      // 基础信息行：风险标签 + 名称地址 + 责任人
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
        '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:' + rBg + ';color:' + rColor + ';border:1px solid ' + rColor + ';flex-shrink:0">' + (data.riskLevel || '—') + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:700;color:var(--text)">' + data.type + ' · ' + data.region + '</div>' +
          '<div style="font-size:11px;color:var(--muted);margin-top:1px">责任人 ' + (data.person || '—') + ' · ' + (data.area || '—') + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--muted);line-height:1.5;margin-bottom:10px;padding:6px 10px;background:#fafbfc;border-radius:8px">' + data.summary + '</div>' +
      // 指标卡 = Tab
      '<div class="metric-row" style="margin-bottom:6px">' +
        '<div class="metric-card ep-tab-card' + (unclosedHaz > 0 ? ' alert-danger' : '') + (activeTab === 'hazards' ? ' mc-active' : '') + '" style="cursor:pointer;position:relative" data-tab="hazards" onclick="epSwitchTab(\'hazards\')">' +
          (unclosedHaz > 0 ? '<span class="mc-alert-badge">' + unclosedHaz + '</span>' : '') +
          '<div class="mc-value">' + data.hazards.length + '</div><div class="mc-label">隐患数</div></div>' +
        '<div class="metric-card ep-tab-card' + (activeTab === 'expert' ? ' mc-active' : '') + '" class="pointer" data-tab="expert" onclick="epSwitchTab(\'expert\')"><div class="mc-value">' + (data.expertRecords || []).length + '</div><div class="mc-label">专家履职</div></div>' +
        '<div class="metric-card ep-tab-card' + (activeTab === 'selfinspect' ? ' mc-active' : '') + '" class="pointer" data-tab="selfinspect" onclick="epSwitchTab(\'selfinspect\')"><div class="mc-value">' + (data.selfInspections || []).length + '</div><div class="mc-label">自检自查</div></div>' +
        '<div class="metric-card ep-tab-card' + (activeTab === 'training' ? ' mc-active' : '') + '" class="pointer" data-tab="training" onclick="epSwitchTab(\'training\')"><div class="mc-value">' + (data.trainingRecords || []).length + '</div><div class="mc-label">教育培训</div></div>' +
        '<div class="metric-card ep-tab-card' + (activeTab === 'dimensions' ? ' mc-active' : '') + '" class="pointer" data-tab="dimensions" onclick="epSwitchTab(\'dimensions\')"><div class="mc-value">' + (data.scorePct || '—') + '%</div><div class="mc-label">主体责任</div></div>' +
      '</div>';
      return html;
    }

    function epRenderTab(data, tab) {
      if (tab === 'overview') return epRenderRecentHazards(data.hazards);
      if (tab === 'hazards') return epRenderHazardCards(data.hazards);
      if (tab === 'selfinspect') return epRenderList(data.selfInspections, '自检自查记录', function(s) {
        var dotCls = s.statusCls || 'neutral';
        var issueText = s.issues > 0 ? '<span style="color:' + (s.statusCls === 'danger' ? 'var(--red)' : '#d97706') + ';font-weight:600">问题 ' + s.issues + ' 项</span>' : '<span style="color:var(--green);font-weight:600">无异常</span>';
        return '<div class="ep-hist-item">' +
          '<span class="ep-hist-dot ' + dotCls + '"></span>' +
          '<div style="flex:1;min-width:0;line-height:1.4">' +
            '<div style="font-size:12px;color:var(--text);font-weight:500">' + s.type + '</div>' +
            '<div style="font-size:11px;color:var(--muted)">' + (s.detail || '无异常') + '</div></div>' +
          '<div class="text-right shrink-0">' +
            '<div style="font-size:11px;color:var(--weak)">' + s.date + '</div>' +
            '<div style="font-size:10.5px;margin-top:2px">' + issueText + '</div></div></div>';
      });
      if (tab === 'expert') return epRenderList(data.expertRecords, '专家履职记录', function(e) {
        var dotCls = e.statusCls || 'neutral';
        return '<div class="ep-hist-item">' +
          '<span class="ep-hist-dot ' + dotCls + '"></span>' +
          '<div style="flex:1;min-width:0;line-height:1.4">' +
            '<div style="font-size:12px;color:var(--text);font-weight:500">' + e.expert + ' · ' + e.type + '</div>' +
            '<div style="font-size:11px;color:var(--muted)">' + e.result + '</div></div>' +
          '<div class="text-right shrink-0">' +
            '<div style="font-size:11px;color:var(--weak)">' + e.date + '</div>' +
            '<div style="font-size:10px;margin-top:2px;color:var(--weak)">' + e.org + '</div></div></div>';
      });
      if (tab === 'training') return epRenderList(data.trainingRecords, '培训记录', function(t) {
        return '<div class="ep-hist-item">' +
          '<span class="ep-hist-dot done"></span>' +
          '<div style="flex:1;min-width:0;line-height:1.4">' +
            '<div style="font-size:12px;color:var(--text);font-weight:500">' + t.type + ' · ' + t.instructor + '</div>' +
            '<div style="font-size:11px;color:var(--muted)">' + t.detail + '</div></div>' +
          '<div class="text-right shrink-0">' +
            '<div style="font-size:11px;color:var(--weak)">' + t.date + '</div>' +
            '<div style="font-size:10.5px;margin-top:2px;color:var(--green)">' + t.attendees + ' 人</div></div></div>';
      });
      if (tab === 'dimensions') {
        var html =
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
          '<div style="font-size:14px;font-weight:700">主体责任 7 维度评估</div>' +
          '<button onclick="epSwitchTab(\'overview\')" style="width:24px;height:24px;border:none;border-radius:6px;background:transparent;color:var(--weak);cursor:pointer;display:grid;place-items:center" onmouseover="this.style.background=\'#f2f4f7\'" onmouseout="this.style.background=\'transparent\'"><i data-lucide="x" width="14" height="14"></i></button>' +
        '</div>';
        for (var di = 0; di < data.dimensions.length; di++) {
          var dim = data.dimensions[di];
          html += '<div class="ep-dim-card"><div class="ep-dim-top"><div class="ep-dim-label"><i data-lucide="' + dim.icon + '" width="14" height="14"></i>' + dim.label + '</div><span class="ep-dim-badge ' + dim.score.toLowerCase() + '">' + dim.score + '</span></div><div class="ep-dim-body">' + dim.text + '</div><div class="ep-dim-bar"><i class="' + dim.bar + '"></i></div></div>';
        }
        return html;
      }
      return '';
    }

    function epRenderHazardCards(hazards) {
      var html =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<div style="font-size:14px;font-weight:700">隐患记录（' + hazards.length + '）</div>' +
        '<button onclick="epSwitchTab(\'overview\')" style="width:24px;height:24px;border:none;border-radius:6px;background:transparent;color:var(--weak);cursor:pointer;display:grid;place-items:center" onmouseover="this.style.background=\'#f2f4f7\'" onmouseout="this.style.background=\'transparent\'"><i data-lucide="x" width="14" height="14"></i></button>' +
      '</div>';
      for (var i = 0; i < hazards.length; i++) {
        var h = hazards[i];
        html += '<div class="hazard-card" style="cursor:pointer;margin-bottom:8px" onclick="openHazardDetail(\'' + h.object.replace(/'/g, "\\'") + '\',\'' + h.foundDate + '\')">' +
          '<div class="hc-head"><span class="hc-name">' + escapeHtml(h.object) + '</span></div>' +
          '<div class="hc-desc">' + escapeHtml(h.hazard) + '</div>' +
          '<div class="hc-meta">' +
            '<span>来源 ' + escapeHtml(h.source) + '</span>' +
            '<span class="hc-status ' + h.statusCls + '">' + h.status + '</span>' +
            '<span>逾期 ' + (h.overdue > 0 ? h.overdue + '天' : '—') + '</span>' +
          '</div>' +
          '<div class="hc-time">' + h.foundDate + ' → ' + h.deadline + '</div>' +
          '<div class="hc-actions">' +
            (h.status === '已完成' ?
              '<button class="hc-btn" onclick="event.stopPropagation();showToast(\'复查记录已提交\')"><i data-lucide="check-circle" width="11" height="11"></i> 复查确认</button>' +
              '<button class="hc-btn" onclick="event.stopPropagation();openHazardDetail(\'' + h.object.replace(/'/g, "\\'") + '\',\'' + h.foundDate + '\')"><i data-lucide="file-text" width="11" height="11"></i> 查看详情</button>'
            :
              '<button class="hc-btn" onclick="event.stopPropagation();openDrawer(\'supervise\')"><i data-lucide="megaphone" width="11" height="11"></i> 督办</button>' +
              '<button class="hc-btn" onclick="event.stopPropagation();openDrawer(\'inspect\')"><i data-lucide="search" width="11" height="11"></i> 现场核查</button>' +
              '<button class="hc-btn" data-yaq-track="hc"><i data-lucide="pin" width="11" height="11"></i> 跟踪</button>'
            ) +
          '</div>' +
        '</div>';
      }
      return html;
    }

    function epRenderRecentHazards(hazards) {
      if (!hazards || hazards.length === 0) return '<div style="text-align:center;padding:20px 0;color:var(--weak);font-size:13px">暂无隐患记录</div>';
      var sorted = hazards.slice().sort(function(a, b) { return a.foundDate < b.foundDate ? 1 : -1; });
      var recent = sorted.slice(0, 3);
      var html = '<div style="font-size:13px;font-weight:700;margin-bottom:8px">最近隐患</div>';
      for (var i = 0; i < recent.length; i++) {
        var h = recent[i];
        var overdueLabel = h.overdue > 0 ? '<span style="color:var(--red);font-weight:600">逾期 ' + escapeHtml(h.overdue) + ' 天</span>' : '<span class="c-weak">—</span>';
        html += '<div class="hazard-card" style="cursor:pointer;margin-bottom:8px" onclick="openHazardDetail(\'' + h.object.replace(/'/g, "\\'") + '\',\'' + h.foundDate + '\')">' +
          '<div class="hc-head"><span class="hc-name">' + escapeHtml(h.object) + '</span></div>' +
          '<div class="hc-desc">' + escapeHtml(h.hazard) + '</div>' +
          '<div class="hc-meta">' +
            '<span>来源 ' + escapeHtml(h.source) + '</span>' +
            '<span class="hc-status ' + h.statusCls + '">' + h.status + '</span>' +
            '<span>逾期 ' + (h.overdue > 0 ? h.overdue + '天' : '—') + '</span>' +
          '</div>' +
          '<div class="hc-time">' + h.foundDate + ' → ' + h.deadline + '</div>' +
          '<div class="hc-actions">' +
            (h.status === '已完成' ?
              '<button class="hc-btn" onclick="event.stopPropagation();showToast(\'复查记录已提交\')"><i data-lucide="check-circle" width="11" height="11"></i> 复查确认</button>' +
              '<button class="hc-btn" onclick="event.stopPropagation();openHazardDetail(\'' + h.object.replace(/'/g, "\\'") + '\',\'' + h.foundDate + '\')"><i data-lucide="file-text" width="11" height="11"></i> 查看详情</button>'
            :
              '<button class="hc-btn" onclick="event.stopPropagation();openDrawer(\'supervise\')"><i data-lucide="megaphone" width="11" height="11"></i> 督办</button>' +
              '<button class="hc-btn" onclick="event.stopPropagation();openDrawer(\'inspect\')"><i data-lucide="search" width="11" height="11"></i> 现场核查</button>' +
              '<button class="hc-btn" data-yaq-track="hc"><i data-lucide="pin" width="11" height="11"></i> 跟踪</button>'
            ) +
          '</div>' +
        '</div>';
      }
      if (hazards.length > 3) {
        html += '<div style="text-align:center;margin-top:4px;font-size:11px;color:var(--weak)">共 ' + hazards.length + ' 条隐患，点击上方「隐患数」查看全部</div>';
      }
      return html;
    }

    function epRenderList(items, title, itemFn) {
      var html =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<div style="font-size:14px;font-weight:700">' + title + '（' + items.length + '）</div>' +
        '<button onclick="epSwitchTab(\'overview\')" style="width:24px;height:24px;border:none;border-radius:6px;background:transparent;color:var(--weak);cursor:pointer;display:grid;place-items:center" onmouseover="this.style.background=\'#f2f4f7\'" onmouseout="this.style.background=\'transparent\'"><i data-lucide="x" width="14" height="14"></i></button>' +
      '</div>';
      for (var i = 0; i < items.length; i++) {
        html += itemFn(items[i]);
      }
      if (items.length === 0) html += '<div style="text-align:center;padding:24px 0;color:var(--weak);font-size:13px">暂无记录</div>';
      return html;
    }

    function fallbackCopy(text, msg) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast(msg || '已复制');
      } catch(e) {
        showToast('复制失败，请手动选择');
      }
      document.body.removeChild(ta);
    }

    YAQ.openHazardDetail = openHazardDetail;
    YAQ.closeHazardModal = closeHazardModal;
    YAQ.copyHazardInfo = copyHazardInfo;


    // ════════════════════════════════════════════════════════════════
    // METRIC DRILLDOWN — 浮动层（左：列表 + 右：AI 分析）
    // ════════════════════════════════════════════════════════════════

    function openMetricDrilldown(el) {
      if (!el) return;
      var drilldownStr = el.getAttribute('data-drilldown');
      if (!drilldownStr) return;
      var items;
      try { items = JSON.parse(drilldownStr); } catch(e) { return; }

      var aiStr = el.getAttribute('data-ai') || null;
      var aiItems;
      if (aiStr) { try { aiItems = JSON.parse(aiStr); } catch(e) {} }

      var labelEl = el.querySelector('.mc-label');
      var label = labelEl ? labelEl.textContent.trim() : '详情';

      $dom.drillTitle.innerHTML = '<i data-lucide="list" aria-hidden="true"></i> ' + label;

      var listHtml = '<div class="drill-list">';
      listHtml += '<div class="drill-list-summary">共 <strong>' + items.length + '</strong> 项</div>';

      // 条线筛选条
      var allLines = [];
      for (var li = 0; li < items.length; li++) {
        var ln = items[li].line || '其他';
        if (allLines.indexOf(ln) === -1) allLines.push(ln);
      }
      if (allLines.length > 1) {
        listHtml += '<div class="drill-filter" id="drillFilter">' +
          '<span class="df-btn active" data-line="all">全部</span>';
        for (var fi = 0; fi < allLines.length; fi++) {
          listHtml += '<span class="df-btn" data-line="' + allLines[fi] + '">' + allLines[fi] + '</span>';
        }
        listHtml += '</div>';
      }

      for (var ii = 0; ii < items.length; ii++) {
        var it = items[ii];
        var statusCls = it.statusCls || 'neutral';
        var overdueHtml = it.overdue > 0 ? '<span class="drill-item-overdue">逾期 ' + it.overdue + '天</span>' : '';
        listHtml += '<div class="drill-item" data-line="' + (it.line || '其他') + '" onclick="openHazardDetail(\'' + it.name.replace(/'/g, "\\'") + '\')" title="点击查看详情" class="pointer">' +
          '<div class="drill-item-head">' +
            '<span class="drill-item-title">' + it.name + '</span>' +
            (it.line ? '<span class="drill-item-line">' + it.line + '</span>' : '') +
            '<span class="drill-item-badge ' + statusCls + '">' + (it.statusText || it.status || '') + '</span>' +
            overdueHtml +
          '</div>' +
          '<div class="drill-item-desc">' + it.detail + '</div>' +
          '<div class="drill-item-meta">' +
            (it.person ? '<span class="dim-meta"><i data-lucide="user" width="10" height="10" aria-hidden="true"></i>' + it.person + '</span>' : '') +
            (it.source ? '<span class="dim-meta"><i data-lucide="clipboard-check" width="10" height="10" aria-hidden="true"></i>' + it.source + '</span>' : '') +
            (it.region ? '<span class="dim-meta"><i data-lucide="map-pin" width="10" height="10" aria-hidden="true"></i>' + it.region + '</span>' : '') +
          '</div>' +
          '<div class="drill-item-dates">' +
            '<span>发现 ' + (it.foundDate || '—') + ' → 期限 ' + (it.deadline || '—') + '</span>' +
          '</div>' +
        '</div>';
      }
      listHtml += '</div>';

      // 右侧：AI 分析（对话式）
      var labelColors = {
        '关联分析': 'corr', '交叉验证': 'xval', '特征分析': 'trend', '风险推演': 'proj',
        '趋势分析': 'trend', '根因分析': 'xval', '优先级建议': 'corr', '资源评估': 'proj'
      };
      var initialMsgHtml = '';
      if (aiItems && aiItems.length > 0) {
        for (var ai = 0; ai < aiItems.length; ai++) {
          var a = aiItems[ai];
          var cls = labelColors[a.label] || 'corr';
          initialMsgHtml += '<div class="drill-analysis">' +
            '<span class="drill-analysis-label ' + cls + '">' + a.label + '</span>' +
            '<div class="drill-analysis-text">' + a.text.replace(/\n/g, '<br>') + '</div>' +
          '</div>';
        }
      } else {
        initialMsgHtml = '<div style="font-size:12px;color:var(--weak);padding:20px 0;text-align:center">暂无 AI 分析数据</div>';
      }

      // 存储上下文，供追问使用
      window.__drillContext = { label: label, items: items, aiItems: aiItems || [] };

      var aiHtml =
        '<div class="drill-ai">' +
          '<div class="drill-ai-head"><i data-lucide="sparkles" aria-hidden="true"></i> AI 分析</div>' +
          '<div class="drill-ai-conv" id="drillAiConv">' +
            '<div class="dmsg agent"><div class="dmsg-bubble">' + initialMsgHtml + '</div></div>' +
          '</div>' +
          '<div class="drill-ai-bar">' +
            '<input class="dmsg-input" id="dmsgInput" placeholder="追问..." onkeydown="if(event.key==\'Enter\')askAI()">' +
            '<button class="dmsg-send" onclick="askAI()"><i data-lucide="send" width="14" height="14"></i></button>' +
          '</div>' +
        '</div>';

      $dom.drillBody.innerHTML = listHtml + aiHtml;

      // 条线筛选
      var filterEl = $dom.drillFilter;
      if (filterEl) {
        filterEl.onclick = function(e) {
          var btn = e.target.closest('.df-btn');
          if (!btn) return;
          var line = btn.getAttribute('data-line');
          // 高亮当前按钮
          filterEl.querySelectorAll('.df-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          // 显示/隐藏条目
          var items = document.querySelectorAll('.drill-item');
          for (var fi = 0; fi < items.length; fi++) {
            if (line === 'all' || items[fi].getAttribute('data-line') === line) {
              items[fi].style.display = '';
            } else {
              items[fi].style.display = 'none';
            }
          }
        };
      }

      lucide.createIcons({ container: $dom.drillBody });

      $dom.drillFloat.classList.add('open');
      $dom.drillOverlay.classList.add('open');
    }

    function closeDrillFloat() {
      $dom.drillFloat.classList.remove('open');
      $dom.drillOverlay.classList.remove('open');
    }

    // ─── AI 追问 ────────────────────────────────────────────────
    function askAI() {
      var input = document.getElementById('dmsgInput');
      if (!input) return;
      var q = input.value.trim();
      if (!q) return;
      input.value = '';

      var ctx = window.__drillContext || {};
      var label = ctx.label || '';
      var items = ctx.items || [];
      var aiItems = ctx.aiItems || [];

      var conv = $dom.drillAiConv;
      if (!conv) return;

      // 用户消息
      conv.innerHTML += '<div class="dmsg user"><div class="dmsg-bubble">' + escapeHtml(q) + '</div></div>';
      conv.scrollTop = conv.scrollHeight;

      // 生成上下文相关的 mock 回答
      var answer = generateAIAnswer(q, label, items, aiItems);

      // 模拟 AI 思考延迟
      setTimeout(function() {
        conv.innerHTML += '<div class="dmsg agent"><div class="dmsg-bubble">' + answer + '</div></div>';
        conv.scrollTop = conv.scrollHeight;
        lucide.createIcons({ container: conv });
      }, 600);
    }

    function generateAIAnswer(q, label, items, aiItems) {
      var ql = q.toLowerCase();

      // 提取条线信息
      var lineNames = [];
      var lineMap = {};
      for (var i = 0; i < items.length; i++) {
        var ln = items[i].line || '其他';
        if (lineNames.indexOf(ln) === -1) lineNames.push(ln);
        if (!lineMap[ln]) lineMap[ln] = 0;
        lineMap[ln]++;
      }

      // 按关键词匹配回答
      if (ql.indexOf('人手') > -1 || ql.indexOf('饱和') > -1 || ql.indexOf('人力') > -1) {
        // 人手/饱和类问题
        var parts = [];
        for (var li = 0; li < lineNames.length; li++) {
          var ln = lineNames[li];
          var count = lineMap[ln];
          if (ln === '消防安全组') {
            parts.push(ln + '当前在岗4人，日均需要处理复查+新增约6.8项/人·天。参考行业标准4-5项/人·天，人力已超饱和36%-70%。建议优先从其他条线调配1-2名支援人员，或协商延期非紧急复查任务。');
          } else if (ln === '企业安全组') {
            parts.push(ln + '当前在岗6人，日均处理约4.5项/人·天，处于合理范围。但5家异常主体集中在良渚片区，建议优化巡查路线避免跨片区耗时。');
          } else {
            parts.push(ln + '当前工作量处于正常范围，暂无瓶颈。');
          }
        }
        return parts.join('<br><br>');
      }

      if (ql.indexOf('企业') > -1 || ql.indexOf('配合') > -1 || ql.indexOf('不配合') > -1) {
        // 企业配合度问题
        return '从数据看，' + label + '涉及的企业配合度存在差异：<br><br>' +
          '• ' + items.map(function(it) {
            var status = it.status === '超期' ? '配合度低（超期未响应）' :
                         it.status === '未启动' ? '尚未启动整改' :
                         it.status === '整改中' ? '整改推进中' : '状态待确认';
            return '<strong>' + it.name + '</strong>：' + status;
          }).join('<br>• ') +
          '<br><br>建议：对长期不配合的企业（如北苑商业综合体、余杭天元纺织厂），升级为站长约谈或联合执法，避免单个主体拖累整体指标。';
      }

      if (ql.indexOf('怎么') > -1 || ql.indexOf('建议') > -1 || ql.indexOf('解决') > -1 || ql.indexOf('措施') > -1) {
        // 措施建议
        var sug = [];
        if (lineNames.indexOf('消防安全组') > -1) {
          sug.push('• 消防安全组：优先清理北苑商业综合体（超期最久，逾期3天）和云栖高层住宅，建议今日安排现场核查。同时排查复查人力饱和度问题，必要时申请临时增援。');
        }
        if (lineNames.indexOf('企业安全组') > -1) {
          sug.push('• 企业安全组：杭州恒源化工有限公司已有整改方案建议加快审批，杭州鑫盛机械制造有限公司和余杭天元纺织厂需从企业端推动——建议通知属地村社协助督促。');
        }
        sug.push('• 系统性建议：将良渚片区作为本周重点关注区域，安排一次集中巡查，系统性解决片区企业自查缺失问题。');
        return sug.join('<br><br>');
      }

      if (ql.indexOf('上周') > -1 || ql.indexOf('环比') > -1 || ql.indexOf('趋势') > -1 || ql.indexOf('变化') > -1) {
        return '近一周趋势：<br><br>' +
          '• ' + label + '较上周同期增加' + (items.length > 3 ? '2项' : '1项') + '。<br>' +
          '• 消防安全组超期项从上周的1项增加到2项，恶化趋势明显。<br>' +
          '• 企业安全组整改推进中，暂无新增超期，趋势平稳。<br><br>' +
          '如果超期项下周仍未解决，建议启动二级升级机制（站长约谈）。';
      }

      if (ql.indexOf('谁') > -1 || ql.indexOf('负责') > -1 || ql.indexOf('责任人') > -1) {
        return '当前责任人分布：<br><br>' +
          items.map(function(it) {
            return '• <strong>' + it.name + '</strong> → ' + (it.person || '未指定') + '（' + (it.line || '—') + '）';
          }).join('<br>') +
          '<br><br>其中王志安和李明名下各有1项超期，建议先确认他们当前的复查任务量是否饱和。';
      }

      // 默认回答
      return '这是一个好问题。当前' + label + '共' + items.length + '项，涉及' + lineNames.join('、') + '等条线。' +
        '从数据关联来看，主要矛盾集中在：<br><br>' +
        '1. <strong>复查人力瓶颈</strong>：消防安全组复查闭环率68%，低于站均值6pp，人力已超饱和。<br>' +
        '2. <strong>企业端配合度</strong>：良渚片区多家企业自查为0，安全主体责任落实不到位。<br>' +
        '3. <strong>反复性问题</strong>：北苑商业综合体消防通道堵塞已发生3次，需从管理机制入手。<br><br>' +
        '建议进一步排查具体细节，或者你可以问更具体的问题，如"人手够不够？""企业不配合怎么办？"。';
    }

    function toggleRegulation() {
      var body = $dom.regulationBody;
      var arrow = $dom.regArrow;
      if (!body) return;
      var isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      arrow.textContent = isOpen ? '▶' : '▼';
    }
    YAQ.toggleRegulation = toggleRegulation;

    // ════════════════════════════════════════════════════════════════
    // TASK DETAIL

    // ════════════════════════════════════════════════════════════════
    // TASK DETAIL
    // ════════════════════════════════════════════════════════════════

    function openTaskDetail(taskName) {
      var tasks = MOCK.tasks;
      var task = null;
      for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].name === taskName) { task = tasks[i]; break; }
      }
      if (!task) { showToast('未找到任务数据'); return; }

      $dom.taskModalName.textContent = task.name;

      var rateNum = parseInt(task.rate) || 0;
      var statusCls = task.statusCls || 'neutral';
      var riskColor = task.risk === '重大风险' ? 'var(--red)' : task.risk === '较大风险' ? '#d97706' : 'var(--muted)';

      // ── 左栏：任务详情 ──
      var leftHtml = '';

      // 状态 + 进度
      leftHtml += '<div class="task-detail-section">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
          '<span class="td-status-badge ' + statusCls + '">' + (task.status || task.type + '任务') + '</span>' +
          (task.risk !== '-' && task.risk ? '<span class="td-risk-tag high" style="background:color-mix(in oklch, ' + riskColor + ' 12%, transparent);color:' + riskColor + '">' + task.risk + '</span>' : '') +
          (task.lag ? '<span style="font-size:10px;font-weight:600;color:var(--red);background:var(--red-soft);padding:2px 8px;border-radius:999px">滞后</span>' : '') +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
          '<div style="flex:1;height:6px;border-radius:999px;background:#f0f2f5;overflow:hidden">' +
            '<div style="width:' + rateNum + '%;height:100%;border-radius:999px;background:' + (task.lag ? '#dc2626' : (rateNum >= 90 ? 'var(--green)' : '#d97706')) + '"></div>' +
          '</div>' +
          '<span style="font-size:13px;font-weight:700;color:' + (task.lag ? '#dc2626' : (rateNum >= 90 ? 'var(--green)' : '#d97706')) + '">' + task.rate + '</span>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--weak)">完成率 ' + task.rate + ' · 时间进度 ' + (task.progress || '-') + '</div>' +
      '</div>';

      // 任务描述
      if (task.desc) {
        leftHtml += '<div class="task-detail-section">' +
          '<div class="task-detail-label">任务说明</div>' +
          '<div class="task-detail-value">' + task.desc + '</div>' +
        '</div>';
      }

      // 基本信息表
      leftHtml += '<div class="task-detail-section">' +
        '<div class="task-detail-label">基本信息</div>' +
        '<table class="task-detail-table">' +
          '<tr><td>类型</td><td>' + (task.type === '日常' ? '日常任务' : '专项任务') + '</td></tr>' +
          '<tr><td>条线</td><td>' + (task.line || '—') + '</td></tr>' +
          '<tr><td>创建人</td><td>' + (task.creator || '—') + '</td></tr>' +
          '<tr><td>责任人</td><td>' + (task.person || '—') + '</td></tr>' +
          '<tr><td>区域</td><td>' + (task.region || '—') + '</td></tr>' +
          '<tr><td>开始时间</td><td>' + task.startDate + '</td></tr>' +
          '<tr><td>截止时间</td><td>' + task.endDate + '</td></tr>' +
        '</table>' +
      '</div>';

      // 覆盖统计
      leftHtml += '<div class="task-detail-section">' +
        '<div class="task-detail-label">覆盖统计</div>' +
        '<table class="task-detail-table">' +
          '<tr><td>已覆盖</td><td>' + task.covered + ' 家</td></tr>' +
          '<tr><td>隐患总数</td><td>' + (task.hazards !== '-' ? task.hazards : '—') + ' 项</td></tr>' +
          '<tr><td>重大隐患</td><td>' + (task.majorHazards !== '-' ? task.majorHazards : '—') + ' 项</td></tr>' +
        '</table>' +
      '</div>';

      // 关联事项（变为可点击下钻到隐患详情）
      if (task.relatedItems && task.relatedItems.length > 0) {
        leftHtml += '<div class="task-detail-section">' +
          '<div class="task-detail-label">关联事项</div>';
        for (var ri = 0; ri < task.relatedItems.length; ri++) {
          var item = task.relatedItems[ri];
          var hazardName = item.split('·')[0].trim();
          leftHtml += '<div class="td-related-item" class="pointer" onclick="closeTaskModal();openHazardDetail(\'' + hazardName.replace(/'/g, "\\'") + '\')">' +
            '<i data-lucide="chevron-right" width="12" height="12"></i>' + item +
          '</div>';
        }
        leftHtml += '</div>';
      }

      $dom.taskModalLeft.innerHTML = leftHtml;

      // ── 右栏：AI 分析侧边栏 ──
      var rightHtml = '';

      // 诊断摘要
      if (task.lag) {
        var diagColor = task.statusCls === 'danger' ? 'danger' : 'warning';
        var diagParts = [];
        if (rateNum === 0) diagParts.push('完成率为 0%');
        else if (rateNum < 50) diagParts.push('完成率仅 ' + task.rate);
        if (parseInt(task.progress) >= 100 && rateNum < 50) diagParts.push('时间进度已到但任务未过半');
        diagParts.push('需重点关注');
        rightHtml += '<div class="tma-block ' + diagColor + '">' +
          '<div class="tma-label">AI 诊断</div>' +
          '<div class="tma-item" style="font-weight:600;color:' + (task.statusCls === 'danger' ? 'var(--red)' : '#a75605') + '">⚠ ' + diagParts.join('，') + '</div>' +
        '</div>';
      } else {
        rightHtml += '<div class="tma-block" style="border-color:#c8e6c9;background:#f1faf5">' +
          '<div class="tma-label">AI 诊断</div>' +
          '<div class="tma-item" style="color:var(--green);font-weight:600">✅ 任务推进正常</div>' +
        '</div>';
      }

      // 定位分析：条线 → 区域 → 责任
      rightHtml += '<div class="tma-block">' +
        '<div class="tma-label">定位分析</div>';
      if (task.line) rightHtml += '<div class="tma-item"><span class="tma-dot orange"></span>条线：' + task.line + '</div>';
      if (task.region) rightHtml += '<div class="tma-item"><span class="tma-dot orange"></span>区域：' + task.region + '</div>';
      if (task.person) rightHtml += '<div class="tma-item"><span class="tma-dot orange"></span>责任：' + task.person + '</div>';
      rightHtml += '</div>';

      // 关联对象
      if (task.relatedItems && task.relatedItems.length > 0) {
        rightHtml += '<div class="tma-block">' +
          '<div class="tma-label">关联对象</div>';
        for (var ri = 0; ri < task.relatedItems.length; ri++) {
          var item = task.relatedItems[ri];
          var hazardName = item.split('·')[0].trim();
          rightHtml += '<span class="tma-chip" onclick="closeTaskModal();openHazardDetail(\'' + hazardName.replace(/'/g, "\\'") + '\')">' + item + '</span>';
        }
        rightHtml += '</div>';
      }

      // 建议动作
      rightHtml += '<div class="tma-block">' +
        '<div class="tma-label">建议动作</div>' +
        (task.lag ? '<div class="tma-item"><span class="tma-dot red"></span>发起督办</div>' : '') +
        '<div class="tma-item"><span class="tma-dot ' + (task.lag ? 'red' : 'green') + '"></span>现场核查</div>' +
        '<div class="tma-item"><span class="tma-dot ' + (task.lag ? 'red' : 'green') + '"></span>会议议题</div>' +
        '<div class="tma-item"><span class="tma-dot orange"></span>持续跟踪</div>' +
      '</div>';

      $dom.taskModalRight.innerHTML = rightHtml;

      lucide.createIcons({ container: $dom.taskModalRight });
      $dom.taskModalOverlay.style.display = 'block';
      $dom.taskModal.style.display = 'flex';
    }

    function closeTaskModal() {
      $dom.taskModalOverlay.style.display = 'none';
      $dom.taskModal.style.display = 'none';
    }
    YAQ.openTaskDetail = openTaskDetail;
    YAQ.closeTaskModal = closeTaskModal;

    // ════════════════════════════════════════════════════════════════
    // SCENE SWITCHING
    // ════════════════════════════════════════════════════════════════

    var _switchTimer = null;  // 场景切换防重入定时器

    function switchScene(sceneId, force) {
      if (sceneId === state.activeScene && !force) return;

      // 取消上一次未完成的切换，防止竞态
      if (_switchTimer !== null) {
        clearTimeout(_switchTimer);
        _switchTimer = null;
      }

      state.activeScene = sceneId;

      // 非月报场景时隐藏侧边栏
      if (sceneId !== 'monthly-report') { hideMrSidebar(); }

      // Tab 管理：如果 sceneId 不在 tab 列表中，自动添加
      var found = false;
      for (var _ti = 0; _ti < tabs.length; _ti++) {
        if (tabs[_ti].id === sceneId) { found = true; break; }
      }
      if (!found) {
        tabs.push({ id: sceneId, label: sceneLabels[sceneId] || sceneId });
      }
      renderTabs();

      var ws = $dom.workspace;
      ws.classList.add('scanning');

      // 同步左栏场景高亮
      document.querySelectorAll('.nav-item[data-scene]').forEach(function(n) {
        n.classList.toggle('active', n.getAttribute('data-scene') === sceneId);
      });
      // 同步移动端底部导航高亮
      document.querySelectorAll('.mb-nav-item[data-scene]').forEach(function(n) {
        n.classList.toggle('active', n.getAttribute('data-scene') === sceneId);
      });
      // 同步系统导航高亮
      document.querySelectorAll('.nav-item[data-page]').forEach(function(n) {
        n.classList.toggle('active', n.getAttribute('data-page') === sceneId);
      });

      // 同步右栏场景提示
      var chatBody = $dom.chatBody;
      var sceneNames = { dashboard: '📊 今日监管工作台', 'hazard-report': '⚠ 重大隐患整改日报', efficiency: '📈 履职效能分析', responsibility: '👥 主体责任评估', disposal: '🔁 分级处置闭环', 'pending-actions': '📋 待确认行动', 'supervision-track': '🔍 督办跟踪', 'monthly-report': '📅 月报' };

      _switchTimer = setTimeout(function() {
        _switchTimer = null;

        // 规则管理页特殊处理
        if (sceneId === 'rules') {
          if (window.renderRulesPage) window.renderRulesPage();
          renderTabs();
          ws.classList.remove('scanning');
          var name = '⚙ 规则引擎';
          if (chatBody) {
            chatBody.innerHTML += '<div class="msg agent"><div class="bubble">已切换到「' + name + '」，你可以在这里配置异常判定规则，或直接告诉 AI 你想加的规则。</div></div>';
            chatBody.scrollTop = chatBody.scrollHeight;
          }
          showToast('已切换至「规则引擎」');
          return;
        }

        try {
          renderScene(sceneId);
        } catch(e) {
          console.error('[YAQ] switchScene 渲染异常:', e);
          $dom.sceneContent.innerHTML = renderError('渲染异常', '场景切换时发生错误，请刷新页面或重试。' + (e.message ? ' (' + e.message + ')' : ''));
          lucide.createIcons();
        }
        renderTabs();
        ws.classList.remove('scanning');

        // AI 对话追加系统消息（chatBody 可能为 null，如初始化完成前误点）
        var name = sceneNames[sceneId] || sceneId;
        if (chatBody) {
          chatBody.innerHTML += '<div class="msg agent"><div class="bubble">已切换到「' + name + '」，你需要关注什么？</div></div>';
          chatBody.scrollTop = chatBody.scrollHeight;
        }

        showToast('已切换至「' + name + '」');
      }, 250);
    }

    // ════════════════════════════════════════════════════════════════
    // BIND INTERACTIONS
    // ════════════════════════════════════════════════════════════════

    function bindInteractions() {
      // 左栏侧边导航点击 — 场景
      document.querySelectorAll('.nav-item[data-scene]').forEach(function(item) {
        item.addEventListener('click', function() {
          var scene = this.getAttribute('data-scene');
          if (['review', 'meeting'].indexOf(scene) > -1) {
            showToast('后续能力，敬请期待');
            return;
          }
          switchScene(scene);
        });
      });

      // 左栏侧边导航点击 — 系统页面（规则管理等）
      document.querySelectorAll('.nav-item[data-page]').forEach(function(item) {
        item.addEventListener('click', function() {
          var page = this.getAttribute('data-page');
          switchScene(page);
        });
      });

      // Drawer overlay close
      $dom.drawerOverlay.addEventListener('click', closeDrawer);
      $dom.drawerClose.addEventListener('click', closeDrawer);
      $dom.drawerCancel.addEventListener('click', closeDrawer);

      // Drawer confirm — 动态生成处置文案
      $dom.drawerConfirm.addEventListener('click', function() {
        var action = currentDrawerAction;

        // 督办批量确认 — 特殊处理
        if (action === 'supervise') {
          var superviseItems = document.querySelectorAll('.drawer-supervise-item');
          var count = superviseItems.length;
          $dom.drawerTitle.innerHTML = '<i data-lucide="check-circle" aria-hidden="true"></i> 督办已全部发起';
          $dom.drawerConfirm.textContent = '已完成';
          $dom.drawerConfirm.style.display = 'none';

          var resultHtml = '<div class="drawer-generated">' +
            '<div class="dr-gen-banner" style="background:var(--green-bg);color:var(--green)"><i data-lucide="check-circle" width="14" height="14" style="vertical-align:middle;margin-right:4px"></i> 已成功发起 ' + count + ' 条督办</div>' +
            '<div style="font-size:13px;color:var(--muted);line-height:1.6;padding:8px 0">督办通知已发送至各责任人，系统将自动跟踪反馈进度并在超期时提醒升级。</div>' +
            '<div class="dr-gen-actions">' +
              '<button class="dr-action-btn primary" onclick="closeDrawer();switchScene(\'followup\')" style="padding:6px 14px"><i data-lucide="list-checks" width="13" height="13"></i> 查看跟进事项</button>' +
              '<button class="dr-action-btn" onclick="closeDrawer()" style="padding:6px 14px"><i data-lucide="x" width="13" height="13"></i> 关闭</button>' +
            '</div>' +
          '</div>';
          $dom.drawerBody.innerHTML = resultHtml;
          $dom.drawerCancel.style.display = 'none';
          lucide.createIcons({ container: $dom.drawerBody });
          showToast('✅ 已发起 ' + count + ' 条督办，通知已发送');
          return;
        }

        var content = drawerContent[action];
        if (!content) {
          closeDrawer();
          showToast('已生成，可继续编辑');
          return;
        }
        // 根据上下文生成处置文案
        var generated = generateDisposalText(action);
        // 替换 Drawer 内容为生成结果
        $dom.drawerTitle.innerHTML = '<i data-lucide="file-check" aria-hidden="true"></i> 已生成 — ' + content.title;
        $dom.drawerConfirm.textContent = '已完成';

        var resultHtml = '<div class="drawer-generated">' +
          '<div class="dr-gen-banner"><i data-lucide="sparkles" width="14" height="14" style="vertical-align:middle;margin-right:4px"></i> 以下文案可复制使用</div>' +
          '<div class="dr-gen-text" id="drawerGenText">' + generated.replace(/\n/g, '<br>') + '</div>' +
          '<div class="dr-gen-actions">' +
            '<button class="dr-action-btn primary" onclick="copyDrawerGenerated()" style="padding:6px 14px"><i data-lucide="copy" width="13" height="13"></i> 复制文案</button>' +
            '<button class="dr-action-btn" data-yaq-track="dw" style="padding:6px 14px"><i data-lucide="pin" width="13" height="13"></i> 加入跟踪</button>' +
            '<button class="dr-action-btn" onclick="showToast(\'通知已发送\');closeDrawer()" style="padding:6px 14px"><i data-lucide="send" width="13" height="13"></i> 发送通知</button>' +
          '</div>' +
        '</div>';
        $dom.drawerBody.innerHTML = resultHtml;
        $dom.drawerCancel.style.display = 'none';
        lucide.createIcons({ container: $dom.drawerBody });

        // 保存生成的文案供复制
        window.__lastGeneratedText = generated;
      });

      // Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          if ($dom.drawerPanel.classList.contains('open')) {
            closeDrawer();
          }
          // 关闭浮动对话面板
          var chatPanel = $dom.chatPanel;
          if (chatPanel.classList.contains('open')) {
            chatPanel.classList.remove('open');
            $dom.chatFab.style.display = 'flex';
          }
        }
      });

      // Priority item action buttons (delegated)
      $dom.sceneContent.addEventListener('click', function(e) {
        // ── 持续跟踪快捷按钮 ──
        var trackBtn = e.target.closest('[data-yaq-track]');
        if (trackBtn) {
          var kind = trackBtn.getAttribute('data-yaq-track');
          var card = trackBtn.closest('.hazard-card, .ht-actions');
          var drCard = trackBtn.closest('.dr-card');
          var drawerGen = trackBtn.closest('.drawer-generated');
          var trackTitle = '';
          if (card) {
            // 从 hazard-card 提取对象名和隐患描述
            var nameEl = card.querySelector('.hc-name');
            var descEl = card.querySelector('.hc-desc');
            trackTitle = (nameEl ? nameEl.textContent.trim() : '') + (descEl ? ' ' + descEl.textContent.trim() : '');
            // 如果是表格行内按钮(ht)，从表格行提取
            if (!trackTitle && kind === 'ht') {
              var row = trackBtn.closest('tr');
              if (row) {
                var cells = row.querySelectorAll('td');
                trackTitle = (cells[0] ? cells[0].textContent.trim() : '') + ' - ' + (cells[1] ? cells[1].textContent.trim() : '');
                YAQ.addTrack({ title: trackTitle, source: '隐患整改日报', responsibility: (cells[5] ? cells[5].textContent.trim() : '') });
              }
              e.stopPropagation();
              return;
            }
            // 普通 hazard-card：提取已有标题
            if (trackTitle) {
              YAQ.addTrack(trackTitle);
              e.stopPropagation();
              return;
            }
          } else if (drCard) {
            var nameEl = drCard.querySelector('.dr-hazard-name');
            trackTitle = nameEl ? nameEl.textContent.trim() : '跟踪事项';
            YAQ.addTrack({ title: trackTitle, source: '诊断处置' });
            e.stopPropagation();
            return;
          } else if (drawerGen) {
            var drawerPanel = document.getElementById('drawerPanel');
            var titleEl = drawerPanel ? drawerPanel.querySelector('#drawerTitle') : null;
            trackTitle = titleEl ? titleEl.textContent.trim() : '跟踪事项';
            YAQ.addTrack({ title: trackTitle, source: '处置生成' });
            closeDrawer();
            e.stopPropagation();
            return;
          }
          return;
        }

        var btn = e.target.closest('[data-pi-action]');
        if (btn) {
          var action = btn.getAttribute('data-pi-action');
          var actionMap = { '督办': 'supervise', '现场核查': 'inspect', '会议议题': 'meeting', '提醒履职': 'remind', '跟踪': 'briefing' };
          var mapped = actionMap[action];
          if (mapped) openDrawer(mapped);
          else showToast('已记录' + action + '操作');
          e.stopPropagation();
          return;
        }

        // Priority item click → drill down
        var item = e.target.closest('.priority-item');
        if (item) {
          var id = item.getAttribute('data-pi-id');
          showToast('查看#' + id + ' 详情（钻取功能）');
        }
      });
    }

    // ════════════════════════════════════════════════════════════════
    // AGENT ASK — 对话快捷按钮
    // ════════════════════════════════════════════════════════════════

    function agentAsk(sceneId) {
      var chatBody = $dom.chatBody;
      var sceneNames = { dashboard: '📊 今日监管工作台', 'hazard-report': '⚠ 重大隐患整改日报', efficiency: '📈 履职效能分析', responsibility: '👥 主体责任评估', disposal: '🔁 分级处置闭环', 'pending-actions': '📋 待确认行动', 'supervision-track': '🔍 督办跟踪', 'monthly-report': '📅 月报' };
      var name = sceneNames[sceneId] || sceneId;

      // 打开浮动面板
      openChatPanel();

      // 用户消息
      chatBody.innerHTML += '<div class="msg user"><div class="bubble">我想看「' + name + '」</div></div>';
      chatBody.scrollTop = chatBody.scrollHeight;

      // 切换到对应场景
      switchScene(sceneId);
    }

    // ════════════════════════════════════════════════════════════════
    // 发送聊天消息
    // ════════════════════════════════════════════════════════════════

    function sendChatMsg() {
      var input = $dom.chatInput;
      var text = input.value.trim();
      if (!text) return;
      var chatBody = $dom.chatBody;
      openChatPanel();
      chatBody.innerHTML += '<div class="msg user"><div class="bubble">' + escapeHtml(text) + '</div></div>';
      chatBody.scrollTop = chatBody.scrollHeight;
      input.value = '';
      // 模拟 AI 回复
      setTimeout(function() {
        chatBody.innerHTML += '<div class="msg agent"><div class="bubble">已收到你的问题，正在分析「' + escapeHtml(text) + '」…</div></div>';
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 400);
    }

    // ════════════════════════════════════════════════════════════════
    // 浮动对话面板开关
    // ════════════════════════════════════════════════════════════════

    function toggleChatPanel() {
      var panel = $dom.chatPanel;
      var fab = $dom.chatFab;
      var opening = !panel.classList.contains('open');
      panel.classList.toggle('open');
      fab.style.display = opening ? 'none' : 'flex';
    }

    function openChatPanel() {
      var panel = $dom.chatPanel;
      var fab = $dom.chatFab;
      if (!panel.classList.contains('open')) {
        panel.classList.add('open');
        fab.style.display = 'none';
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 指标配置
    // ════════════════════════════════════════════════════════════════

    function renderSelectedMetrics(metrics) {
      var order = window.__metricOrder || [];
      // 按存储顺序排序
      var checked = [];
      for (var i = 0; i < metrics.length; i++) {
        if (metrics[i].checked) checked.push(metrics[i]);
      }
      checked.sort(function(a, b) {
        var ai = order.indexOf(a.id);
        var bi = order.indexOf(b.id);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
      var html = '';
      for (var j = 0; j < checked.length; j++) {
        var m = checked[j];
        var periodDisp = m.type === '时点' ? '截至目前' : m.period;
        var bCls = ({'截至目前':'current','今日':'today','本周':'week','本月':'month','本季':'quarter','本年':'year','近30天':'d30','累计':'cum'})[periodDisp] || '';
        var alertCls = m.alert ? ' alert-' + m.alert : '';
        // 卡片 hover 提示信息：desc + 基线对照（如有）
        var tipParts = [m.desc || ''];
        if (m.compare) tipParts.push('vs ' + m.compare.baselineLabel + ' ' + m.compare.baselineValue + '  ' + m.compare.delta);
        var tipText = tipParts.join('\n');
        html += '<div class="metric-card' + alertCls + (m.drilldown ? ' clickable' : '') + '" data-desc="' + (m.desc || '') + '" ' +
          (m.compare ? 'data-compare=\'' + JSON.stringify(m.compare).replace(/'/g,"&#39;") + '\' ' : '') +
          (m.drilldown ? 'data-drilldown=\'' + JSON.stringify(m.drilldown).replace(/'/g,"&#39;") + '\' ' : '') +
          (m.aiAnalysis ? 'data-ai=\'' + JSON.stringify(m.aiAnalysis).replace(/'/g,"&#39;") + '\' ' : '') +
          'onmouseenter="showMetricTip(event,this)" onmouseleave="hideMetricTip()"' +
          (m.drilldown ? ' onclick="openMetricDrilldown(this)"' : '') +
          '>' +
          (m.alert === 'danger' ? '<span class="mc-alert-badge">异常</span>' : (m.alert === 'warning' ? '<span class="mc-alert-badge">预警</span>' : '')) +
          '<div class="mc-value"' + (m.valueColor ? ' style="color:' + m.valueColor + '"' : '') + '>' + m.value +
            (m.compare ? '<span class="mc-delta ' + (m.compare.isBad ? 'bad' : 'good') + '">' + m.compare.delta + '</span>' : '') +
          '</div>' +
          (m.compare ? '<div class="mc-baseline">vs ' + m.compare.baselineLabel + ' ' + m.compare.baselineValue + '</div>' : '') +
          '<div class="mc-label">' + m.label + '</div>' +
          '<div class="mc-period ' + bCls + '">' + periodDisp + '</div>' +
        '</div>';
      }
      return html;
    }

    function cycleMetricPeriod(id) {
      var metrics = window.__allMetrics || [];
      for (var i = 0; i < metrics.length; i++) {
        if (metrics[i].id === id) {
          var m = metrics[i];
          if (!m.periods) return;
          var idx = m.periods.indexOf(m.period);
          m.period = m.periods[(idx + 1) % m.periods.length];
          renderMetricCheckboxes();
          break;
        }
      }
    }

    function openMetricConfig() {
      // 保存当前快照，用于取消时还原
      var metrics = window.__allMetrics || [];
      window.__metricSnapshot = [];
      for (var i = 0; i < metrics.length; i++) {
        window.__metricSnapshot.push({
          id: metrics[i].id,
          checked: metrics[i].checked,
          period: metrics[i].period
        });
      }
      // 清空搜索
      window.__metricSearch = '';
      var input = $dom.metricSearchInput;
      if (input) input.value = '';
      $dom.metricModalOverlay.style.display = 'block';
      $dom.metricModal.style.display = 'flex';
      renderMetricCheckboxes();
      lucide.createIcons({ container: $dom.metricModal });
    }

    function closeMetricConfig() {
      // 取消时还原快照
      var snap = window.__metricSnapshot || [];
      var metrics = window.__allMetrics || [];
      for (var i = 0; i < snap.length; i++) {
        for (var j = 0; j < metrics.length; j++) {
          if (metrics[j].id === snap[i].id) {
            metrics[j].checked = snap[i].checked;
            metrics[j].period = snap[i].period;
            break;
          }
        }
      }
      $dom.metricModalOverlay.style.display = 'none';
      $dom.metricModal.style.display = 'none';
    }

    function renderMetricCheckboxes() {
      var metrics = window.__allMetrics || [];
      var activeFilter = window.__metricFilter || '全部';
      var activePeriod = window.__metricPeriodFilter || '全部周期';
      // 分组筛选（业务视角，非全部分组）
      var filterGroupMap = {
        '全部': null,
        '今日关注': ['今日聚焦'],
        '隐患治理': ['隐患闭环', '重大隐患', '风险分类'],
        '监管执法': ['监管执法', '执法处置'],
        '履职效能': ['履职效能', '主体责任', '区域风险', '风险结构', '专项任务', '监管概况']
      };
      var filterLabels = Object.keys(filterGroupMap);
      var filterHtml = '';
      for (var f = 0; f < filterLabels.length; f++) {
        filterHtml += '<button class="modal-filter-tab' + (filterLabels[f] === activeFilter ? ' active' : '') + '" onclick="setMetricFilter(\'' + filterLabels[f] + '\')">' + filterLabels[f] + '</button>';
      }
      // 周期过滤标签
      var periodFilters = ['全部周期', '截至目前', '今日', '本周', '本月', '本季', '本年', '近30天', '累计'];
      filterHtml += '<span style="width:1px;height:18px;background:var(--line);margin:0 6px;display:inline-block;vertical-align:middle"></span>';
      for (var pf = 0; pf < periodFilters.length; pf++) {
        filterHtml += '<button class="modal-filter-tab' + (periodFilters[pf] === activePeriod ? ' active' : '') + '" onclick="setPeriodFilter(\'' + periodFilters[pf] + '\')">' + periodFilters[pf] + '</button>';
      }
      $dom.metricFilterTabs.innerHTML = filterHtml;

      // 按业务视角 + 周期 + 搜索过滤
      var activeGroups = activeFilter === '全部' ? null : (filterGroupMap[activeFilter] || null);
      var groups = {};
      for (var i = 0; i < metrics.length; i++) {
        var m = metrics[i];
        if (activeGroups && activeGroups.indexOf(m.group) === -1) continue;
        if (activePeriod !== '全部周期') {
          if (activePeriod === '截至目前') {
            if (m.type !== '时点' && m.period !== '截至目前') continue;
          } else if (activePeriod === '累计' && m.type !== '累计') continue;
          else if (m.period !== activePeriod) continue;
        }
        var searchQ = (window.__metricSearch || '').trim().toLowerCase();
        if (searchQ && m.label.toLowerCase().indexOf(searchQ) === -1) continue;
        if (!groups[m.group]) groups[m.group] = [];
        groups[m.group].push(m);
      }
      var html = '';
      var groupOrder = ['今日聚焦', '监管概况', '监管执法', '隐患闭环', '重大隐患', '主体责任', '履职效能', '区域风险', '风险结构', '专项任务', '执法处置', '风险分类'];
      function panelPeriodRange(type, period) {
        if (type === '时点') return '截至目前';
        if (period === '近30天') return '近30天';
        return period;
      }
      for (var g = 0; g < groupOrder.length; g++) {
        var groupName = groupOrder[g];
        var items = groups[groupName];
        if (!items) continue;
        html += '<div style="font-size:11px;font-weight:600;color:var(--weak);margin-bottom:8px;margin-top:' + (g > 0 ? '14px' : '0') + ';letter-spacing:0.03em">' + groupName + '</div>';
        html += '<div class="mc-grid">';
        for (var j = 0; j < items.length; j++) {
          var m = items[j];
          var periodDisp2 = panelPeriodRange(m.type, m.period);
          var bCls = ({'截至目前':'current','今日':'today','本周':'week','本月':'month','本季':'quarter','本年':'year','近30天':'d30','累计':'cum'})[periodDisp2] || '';
          var alertCls = m.alert ? ' alert-' + m.alert : '';
          html += '<div class="metric-card' + alertCls + (m.checked ? ' mc-active' : ' mc-dim') + '" data-id="' + m.id + '" onclick="toggleMiniCard(this)" data-desc="' + (m.desc || '') + '" onmouseenter="showMetricTip(event,this.getAttribute(\'data-desc\'))" onmouseleave="hideMetricTip()">' +
            '<span class="mc-checkmark"><i data-lucide="check" width="10" height="10"></i></span>' +
            '<div class="mc-value"' + (m.valueColor ? ' style="color:' + m.valueColor + '"' : '') + '>' + m.value + '</div>' +
            '<div class="mc-label">' + m.label + '</div>' +
            '<div class="mc-period ' + bCls + '">' + periodDisp2 + '</div>' +
          '</div>';
        }
        html += '</div>';
      }
      $dom.metricCheckboxes.innerHTML = html || '<div style="text-align:center;padding:30px 0;color:var(--weak);font-size:13px">该分组暂无指标</div>';

      // 渲染已选指标列表（拖拽排序）
      renderSelectedMetricsList();

      // 更新已选计数
      var allMet = window.__allMetrics || [];
      var checkedCount = 0;
      for (var ci = 0; ci < allMet.length; ci++) {
        if (allMet[ci].checked) checkedCount++;
      }
      var countEl = $dom.mfootCount;
      if (countEl) countEl.innerHTML = '已选 <strong>' + checkedCount + '</strong> 个指标';
    }

    function renderSelectedMetricsList() {
      var metrics = window.__allMetrics || [];
      var order = window.__metricOrder || [];
      var checked = [];
      for (var i = 0; i < metrics.length; i++) {
        if (metrics[i].checked) checked.push(metrics[i]);
      }
      checked.sort(function(a, b) {
        var ai = order.indexOf(a.id);
        var bi = order.indexOf(b.id);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
      var html = '';
      for (var j = 0; j < checked.length; j++) {
        var m = checked[j];
        var periodDisp = m.type === '时点' ? '截至目前' : m.period;
        var bCls = ({'截至目前':'current','今日':'today','本周':'week','本月':'month','本季':'quarter','本年':'year','近30天':'d30','累计':'cum'})[periodDisp] || '';
        var alertCls2 = m.alert ? ' alert-' + m.alert : '';
        html += '<div class="metric-card sel-card-drag' + alertCls2 + '" draggable="true" data-id="' + m.id + '" ondragstart="onDragStart(event)" ondragover="onDragOver(event)" ondrop="onDrop(event)" ondragend="onDragEnd(event)" data-desc="' + (m.desc || '') + '" onmouseenter="showMetricTip(event,this.getAttribute(\'data-desc\'))" onmouseleave="hideMetricTip()">' +
          (m.alert === 'danger' ? '<span class="mc-alert-badge">异常</span>' : (m.alert === 'warning' ? '<span class="mc-alert-badge">预警</span>' : '')) +
          '<span class="sel-hover-remove" onclick="event.stopPropagation();removeSelected(\'' + m.id + '\')"><i data-lucide="x" width="10" height="10"></i></span>' +
          '<div class="mc-value"' + (m.valueColor ? ' style="color:' + m.valueColor + '"' : '') + '>' + m.value + '</div>' +
          '<div class="mc-label">' + m.label + '</div>' +
          '<div class="mc-period ' + bCls + '">' + periodDisp + '</div>' +
        '</div>';
      }
      $dom.selectedMetricsList.innerHTML = html;
      lucide.createIcons({ container: $dom.selectedMetricsList });
    }

    // ─── 拖拽排序 ─────────────────────────────────────────────────
    var _dragId = null;

    function onDragStart(e) {
      _dragId = e.target.closest('.sel-card-drag').getAttribute('data-id');
      e.target.closest('.sel-card-drag').classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    }

    function onDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      var target = e.target.closest('.sel-card-drag');
      if (!target) return;
      // 判断鼠标在目标卡片的左半还是右半
      var rect = target.getBoundingClientRect();
      var x = e.clientX - rect.left;
      if (x < rect.width / 2) {
        target.classList.add('drag-before');
        target.classList.remove('drag-after');
      } else {
        target.classList.add('drag-after');
        target.classList.remove('drag-before');
      }
    }

    function onDrop(e) {
      e.preventDefault();
      var target = e.target.closest('.sel-card-drag');
      if (!target || !_dragId) return;
      var targetId = target.getAttribute('data-id');
      if (_dragId === targetId) return;
      var insertBefore = target.classList.contains('drag-before');
      // 更新顺序
      var order = window.__metricOrder || [];
      var idx = order.indexOf(_dragId);
      if (idx > -1) order.splice(idx, 1);
      var targetIdx = order.indexOf(targetId);
      if (targetIdx > -1) {
        order.splice(insertBefore ? targetIdx : targetIdx + 1, 0, _dragId);
      } else {
        order.push(_dragId);
      }
      window.__metricOrder = order;
      renderSelectedMetricsList();
    }

    function onDragEnd(e) {
      document.querySelectorAll('.sel-card-drag.dragging, .sel-card-drag.drag-before, .sel-card-drag.drag-after').forEach(function(c) {
        c.classList.remove('dragging', 'drag-before', 'drag-after');
      });
      _dragId = null;
    }

    function removeSelected(id) {
      var metrics = window.__allMetrics || [];
      for (var i = 0; i < metrics.length; i++) {
        if (metrics[i].id === id) {
          metrics[i].checked = false;
          break;
        }
      }
      renderMetricCheckboxes();
    }

    function setMetricFilter(filter) {
      window.__metricFilter = filter;
      renderMetricCheckboxes();
    }

    function setPeriodFilter(filter) {
      window.__metricPeriodFilter = filter;
      renderMetricCheckboxes();
    }

    function onMetricSearch() {
      var input = $dom.metricSearchInput;
      window.__metricSearch = input ? input.value : '';
      renderMetricCheckboxes();
    }

    // ─── 指标说明浮层 ─────────────────────────────────────────────
    var _tipHideTimer = null;

    function showMetricTip(e, arg) {
      if (!arg) return;
      var tip = $dom.metricTip;
      var html = '';

      if (_tipHideTimer) {
        clearTimeout(_tipHideTimer);
        _tipHideTimer = null;
      }

      if (typeof arg === 'string') {
        html = '<div class="mt-desc">' + arg + '</div>';
      } else {
        var desc = arg.getAttribute('data-desc') || '';
        var compareStr = arg.getAttribute('data-compare') || null;
        var drilldownStr = arg.getAttribute('data-drilldown') || null;

        if (desc) {
          html += '<div class="mt-desc">' + desc + '</div>';
        }

        if (compareStr) {
          try {
            var compare = JSON.parse(compareStr);
            var deltaCls = compare.isBad ? 'bad' : 'good';
            html += '<div class="mt-compare">' +
              '<span class="mt-compare-label">基线对照</span>' +
              '<span class="mt-compare-value">' + compare.baselineLabel + ' ' + compare.baselineValue + '</span>' +
              '<span class="mt-delta ' + deltaCls + '">' + compare.delta + '</span>' +
            '</div>';
          } catch(e) {}
        }

        if (drilldownStr) {
          try {
            var items = JSON.parse(drilldownStr);
            var lineMap = {}, statusMap = {}, typeMap = {};
            for (var di = 0; di < items.length; di++) {
              var it = items[di];
              var ln = it.line || '其他';
              lineMap[ln] = (lineMap[ln] || 0) + 1;
              var st = it.status || '未知';
              statusMap[st] = (statusMap[st] || 0) + 1;
              var tp = it.type || '其他';
              typeMap[tp] = (typeMap[tp] || 0) + 1;
            }
            html += '<div class="mt-dims">';
            var lineKeys = Object.keys(lineMap);
            if (lineKeys.length > 0) {
              html += '<div class="mt-dim"><span class="mt-dim-label">涉及条线</span>';
              for (var li = 0; li < lineKeys.length; li++) {
                html += '<span class="mt-dim-item"><span class="mt-dim-name">' + lineKeys[li] + '</span><span class="mt-dim-count">' + lineMap[lineKeys[li]] + '项</span></span>';
              }
              html += '</div>';
            }
            var statusKeys = Object.keys(statusMap);
            if (statusKeys.length > 0) {
              html += '<div class="mt-dim"><span class="mt-dim-label">超期状态</span>';
              for (var si = 0; si < statusKeys.length; si++) {
                html += '<span class="mt-dim-item"><span class="mt-dim-name">' + statusKeys[si] + '</span><span class="mt-dim-count">' + statusMap[statusKeys[si]] + '项</span></span>';
              }
              html += '</div>';
            }
            var typeKeys = Object.keys(typeMap);
            if (typeKeys.length > 0) {
              html += '<div class="mt-dim"><span class="mt-dim-label">异常类型</span>';
              for (var ti = 0; ti < Math.min(typeKeys.length, 4); ti++) {
                html += '<span class="mt-dim-item"><span class="mt-dim-name">' + typeKeys[ti] + '</span><span class="mt-dim-count">' + typeMap[typeKeys[ti]] + '项</span></span>';
              }
              if (typeKeys.length > 4) html += '<span class="mt-dim-more">等' + typeKeys.length + '类</span>';
              html += '</div>';
            }
            html += '</div>';
          } catch(e) {}
        }

        // — 复制按钮 —
        html += '<button class="mt-copy-btn" onclick="copyTipContent(event)"><i data-lucide="copy" width="11" height="11" aria-hidden="true"></i> 复制</button>';
      }

      if (!html) return;
      tip.innerHTML = html;
      tip.classList.add('show');
      lucide.createIcons({ container: tip });

      // 鼠标进入浮层 → 取消隐藏
      tip.onmouseenter = function() {
        if (_tipHideTimer) { clearTimeout(_tipHideTimer); _tipHideTimer = null; }
      };
      // 离开浮层 → 立即消失
      tip.onmouseleave = function() {
        doHideTip(tip);
      };

      // 相对卡片固定位置（不跟随鼠标）
      if (arg && typeof arg !== 'string') {
        var cardRect = arg.getBoundingClientRect();
        var tipW = tip.offsetWidth || 260;
        var tipH = tip.offsetHeight || 200;
        // 默认在卡片下方居中
        var left = cardRect.left + cardRect.width / 2 - tipW / 2;
        var top = cardRect.bottom + 6;
        // 超出右边界 → 右对齐
        if (left + tipW > window.innerWidth - 8) left = window.innerWidth - tipW - 8;
        // 超出左边界 → 左对齐
        if (left < 8) left = 8;
        // 下方空间不够 → 放上方
        if (top + tipH > window.innerHeight - 8) top = cardRect.top - tipH - 6;
        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
      }
    }

    function hideMetricTip() {
      if (_tipHideTimer) { clearTimeout(_tipHideTimer); _tipHideTimer = null; }
      _tipHideTimer = setTimeout(function() {
        var tip = $dom.metricTip;
        doHideTip(tip);
      }, 250);
    }

    function doHideTip(tip) {
      if (!tip) tip = $dom.metricTip;
      tip.onmouseenter = null;
      tip.onmouseleave = null;
      tip.classList.remove('show');
    }

    function copyTipContent(e) {
      if (e) e.stopPropagation();
      var tip = $dom.metricTip;
      if (!tip) return;

      var parts = [];

      // 描述
      var descEl = tip.querySelector('.mt-desc');
      if (descEl) parts.push(descEl.textContent.trim());

      // 基线对照
      var compareEl = tip.querySelector('.mt-compare');
      if (compareEl) {
        var cl = compareEl.querySelector('.mt-compare-label');
        var cv = compareEl.querySelector('.mt-compare-value');
        var cd = compareEl.querySelector('.mt-delta');
        var compareParts = [];
        if (cl) compareParts.push(cl.textContent.trim());
        if (cv) compareParts.push(cv.textContent.trim());
        if (cd) compareParts.push(cd.textContent.trim());
        if (compareParts.length) parts.push(compareParts.join('  '));
      }

      // 维度
      var dimsEl = tip.querySelector('.mt-dims');
      if (dimsEl) {
        var dimEls = dimsEl.querySelectorAll('.mt-dim');
        for (var di = 0; di < dimEls.length; di++) {
          var dim = dimEls[di];
          var labelEl = dim.querySelector('.mt-dim-label');
          var line = labelEl ? labelEl.textContent.trim() : '';
          var items = dim.querySelectorAll('.mt-dim-item');
          for (var ii = 0; ii < items.length; ii++) {
            var nameEl = items[ii].querySelector('.mt-dim-name');
            var countEl = items[ii].querySelector('.mt-dim-count');
            var name = nameEl ? nameEl.textContent.trim() : '';
            var count = countEl ? countEl.textContent.trim() : '';
            line += '\n  ' + name + '  ' + count;
          }
          parts.push(line);
        }
      }

    }


    function toggleMiniCard(el) {
      el.classList.toggle('mc-active');
      el.classList.toggle('mc-dim');
      // 同步更新数据
      var id = el.getAttribute('data-id');
      var metrics = window.__allMetrics || [];
      for (var i = 0; i < metrics.length; i++) {
        if (metrics[i].id === id) {
          metrics[i].checked = el.classList.contains('mc-active');
          break;
        }
      }
      renderSelectedMetricsList();
    }

    function saveMetricConfig() {
      var metrics = window.__allMetrics || [];
      var prefs = {};
      for (var i = 0; i < metrics.length; i++) {
        prefs[metrics[i].id] = metrics[i].checked;
      }
      ls.set('yaq_metric_prefs', JSON.stringify(prefs));
      // 保存排序
      if (window.__metricOrder) {
        ls.set('yaq_metric_order', JSON.stringify(window.__metricOrder));
      }
      ls.set('yaq_metric_ver', STORAGE_VERSION);
      closeMetricConfig();
      // 重新渲染当前场景（用 try/catch 包裹，防止白屏）
      var sceneId = state.activeScene;
      var container = $dom.sceneContent;
      try {
        var html = '';
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
      }
      container.innerHTML = html;
      lucide.createIcons();
      } catch(e) {
        console.error('[YAQ] saveMetricConfig 渲染异常:', e);
        container.innerHTML = '<div class="error-state"><i data-lucide="alert-triangle" width="32" height="32" class="c-red"></i><h3>渲染异常</h3><p>指标配置已保存，但渲染场景时发生错误，请刷新页面。</p></div>';
      }
      showToast('指标配置已保存');
    }

    // ════════════════════════════════════════════════════════════════
    // 全局搜索索引 — 从系统各数据源构建可搜索对象
    // ════════════════════════════════════════════════════════════════

    function $_escapeHtml(s) {
      return escapeHtml(s);
    }
    function $_highlight(s, q) {
      if (!q) return $_escapeHtml(s);
      var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      return $_escapeHtml(s).replace(re, '<mark>$1</mark>');
    }

    // 构建统一搜索索引
    var SEARCH_INDEX = null;
    function buildSearchIndex() {
      if (SEARCH_INDEX) return SEARCH_INDEX;
      SEARCH_INDEX = [];
      var seen = {};

      function add(type, id, label, subtitle, matchTexts, action, meta) {
        if (seen[id]) return;
        seen[id] = true;
        SEARCH_INDEX.push({
          type: type, id: id, label: label, subtitle: subtitle || '',
          matchTexts: typeof matchTexts === 'string' ? [matchTexts] : matchTexts,
          action: action,
          meta: meta || {}
        });
      }

      // ── 1. 人员 ──
      for (var hi = 0; hi < MOCK.hazards.length; hi++) {
        var h = MOCK.hazards[hi];
        if (h.person) {
          add('person', 'p-' + h.person, h.person, '责任人',
            [h.person, h.object],
            function(name) { return function(){ openEnterprisePanel(name); }}(h.object),
            { enterpriseCount: 0, hazardCount: 0 });
        }
        if (h.discoverer) {
          add('person', 'pd-' + h.discoverer, h.discoverer, '检查人',
            [h.discoverer],
            function(name){ return function(){ showToast('检查人：' + name); }}(h.discoverer),
            {});
        }
      }
      for (var ti = 0; ti < MOCK.tasks.length; ti++) {
        var t = MOCK.tasks[ti];
        if (t.person) {
          add('person', 'tp-' + t.person, t.person, '任务负责人',
            [t.person, t.name],
            function(name){ return function(){ showPersonTasks(name); }}(t.person),
            {});
        }
        if (t.creator && t.creator !== t.person) {
          add('person', 'tc-' + t.creator, t.creator, '任务创建人',
            [t.creator],
            function(name){ return function(){ showPersonTasks(name); }}(t.creator),
            {});
        }
      }
      for (var ei = 0; ei < MOCK.abnormalEvents.length; ei++) {
        var ae = MOCK.abnormalEvents[ei];
        if (ae.chain && ae.chain.responsible) {
          add('person', 'ae-' + ae.chain.responsible, ae.chain.responsible, '异常责任人',
            [ae.chain.responsible, ae.subjectName],
            function(name){ return function(){ openEnterprisePanel(name); }}(ae.subjectName),
            {});
        }
      }

      // ── 2. 企业/场所 ──
      for (var hi2 = 0; hi2 < MOCK.hazards.length; hi2++) {
        var h2 = MOCK.hazards[hi2];
        add('enterprise', 'eh-' + h2.object, h2.object,
          (h2.level || '') + (h2.status === '超期未整改' ? ' · 超期未整改' : ''),
          [h2.object, h2.hazard, h2.region],
          function(name){ return function(){ openEnterprisePanel(name); }}(h2.object),
          { region: h2.region || '', level: h2.level || '', status: h2.status || '' });
      }
      for (var si = 0; si < MOCK.subjects.length; si++) {
        var s = MOCK.subjects[si];
        add('enterprise', 'es-' + s.name, s.name,
          '主体责任异常 · ' + (s.risk === 'high' ? '高风险' : s.risk === 'mid' ? '一般风险' : '低风险'),
          [s.name],
          function(name){ return function(){ openEnterprisePanel(name); }}(s.name),
          { risk: s.risk });
      }
      for (var dbKey in ENTERPRISE_DB) {
        if (ENTERPRISE_DB.hasOwnProperty(dbKey)) {
          var ed = ENTERPRISE_DB[dbKey];
          add('enterprise', 'ed-' + dbKey, dbKey,
            ed.type + ' · ' + ed.region,
            [dbKey, ed.type, ed.region, ed.person],
            function(name){ return function(){ openEnterprisePanel(name); }}(dbKey),
            { region: ed.region || '', type: ed.type || '' });
        }
      }

      // ── 3. 专项任务 ──
      for (var ti2 = 0; ti2 < MOCK.tasks.length; ti2++) {
        var t2 = MOCK.tasks[ti2];
        add('task', 'task-' + t2.name, t2.name,
          (t2.type || '日常') + ' · ' + t2.line + ' · ' + (t2.status || ''),
          [t2.name, t2.line, t2.person, t2.creator, t2.region],
          function(name){ return function(){ openTaskDetail(name); }}(t2.name),
          { line: t2.line, status: t2.status, progress: t2.rate, region: t2.region });
      }

      // ── 4. 工作事项 ──
      if (MOCK.priority) {
        for (var pi = 0; pi < MOCK.priority.length; pi++) {
          var p = MOCK.priority[pi];
          add('workItem', 'pri-' + p.id, p.title, (p.riskLevel || '') + ' · ' + (p.status || ''),
            [p.title, p.region || '', p.line || ''],
            function(){ return function(){ switchScene('dashboard'); }}());
        }
      }
      if (window.YAQ && window.YAQ.trackStore) {
        var activeTracks = YAQ.trackStore.getActive();
        for (var fi2 = 0; fi2 < activeTracks.length; fi2++) {
          var f = activeTracks[fi2];
          add('workItem', 'fol-' + f.id, f.title, '重点跟进 · ' + (f.status || ''),
            [f.title, f.responsibility || ''],
            function(){ return function(){ switchScene('dashboard'); }}());
        }
      }
      if (MOCK.pendingActions) {
        for (var pai = 0; pai < MOCK.pendingActions.length; pai++) {
          var pa = MOCK.pendingActions[pai];
          add('workItem', 'pa-' + pa.id, pa.title, '待确认 · ' + (pa.actionType || ''),
            [pa.title],
            function(id){ return function(){ switchScene('pending-actions'); }}(pa.id),
            {});
        }
      }

      // ── 5. 功能入口（保留原有） ──
      for (var gi = 0; gi < LAUNCHER_DATA.length; gi++) {
        var group = LAUNCHER_DATA[gi];
        for (var ai = 0; ai < group.apps.length; ai++) {
          var a = group.apps[ai];
          add('function', 'fn-' + a.id, a.name, a.desc || group.title,
            [a.name, a.desc || '', group.title],
            function(id){ return function(){ launcherGo(id); }}(a.id),
            { icon: a.icon, group: group.title });
        }
      }

      return SEARCH_INDEX;
    }

    // 搜索函数：输入关键词，返回按类型分组的结果
    function globalSearch(query) {
      query = query.trim().toLowerCase();
      if (!query) return {};
      var index = buildSearchIndex();
      var groups = {
        person:    { icon: '👤', label: '人员',     items: [] },
        enterprise:{ icon: '🏢', label: '企业/场所', items: [] },
        task:      { icon: '📋', label: '专项任务',  items: [] },
        workItem:  { icon: '📌', label: '工作事项',  items: [] },
        function:  { icon: '⚡', label: '功能入口',  items: [] }
      };

      for (var i = 0; i < index.length; i++) {
        var entry = index[i];
        var matched = false;
        for (var mi = 0; mi < entry.matchTexts.length; mi++) {
          if (entry.matchTexts[mi].toLowerCase().indexOf(query) > -1) {
            matched = true; break;
          }
        }
        if (!matched) continue;

        var g = groups[entry.type];
        if (g && g.items.length < 8) {
          g.items.push({ entry: entry });
        }
      }

      return { groups: groups, typeOrder: ['person','enterprise','task','workItem','function'] };
    }

    // 查看人员相关任务
    function showPersonTasks(name) {
      closeLauncher();
      var relatedHazards = [];
      for (var i = 0; i < MOCK.hazards.length; i++) {
        if (MOCK.hazards[i].person === name || MOCK.hazards[i].discoverer === name) {
          relatedHazards.push(MOCK.hazards[i]);
        }
      }
      if (relatedHazards.length > 0) {
        openEnterprisePanel(relatedHazards[0].object);
      } else {
        showToast(name + ' 的相关事项');
      }
    }

    // 执行搜索结果点击
    function executeSearchResult(id) {
      var index = buildSearchIndex();
      for (var i = 0; i < index.length; i++) {
        if (index[i].id === id) {
          closeLauncher();
          var fn = index[i].action;
          if (typeof fn === 'function') { fn(); }
          else { showToast('跳转中…'); }
          return;
        }
      }
      showToast('未找到对应操作');
    }
    YAQ.executeSearchResult = executeSearchResult;

    // ════════════════════════════════════════════════════════════════
    // 启动台 · 站点地图
    // ════════════════════════════════════════════════════════════════

    var LAUNCHER_DATA = [
      {
        title: '站长工作台', apps: [
          { id: 'dashboard', name: '今日监管工作台', icon: 'layout-dashboard', desc: '整体安全态势' },
          { id: 'pending-actions', name: '待确认行动', icon: 'clipboard-check', desc: '待确认行动审核与发起' },
          { id: 'hazard-report', name: '重大隐患整改日报', icon: 'shield-alert', desc: '隐患闭环跟踪' },
          { id: 'efficiency', name: '履职效能分析', icon: 'bar-chart-3', desc: '条线绩效评估' },
          { id: 'responsibility', name: '主体责任评估', icon: 'users', desc: '企业风险分级' },
          { id: 'disposal', name: '分级处置闭环', icon: 'git-branch', desc: '内部/外部处置' },
          { id: 'supervision-track', name: '督办跟踪', icon: 'alert-circle', desc: '发起督办的执行情况跟踪' }
        ]
      },
      {
        title: '业务办理', apps: [
          { id: 'daily-supervise', name: '日常监管', icon: 'clipboard-list', desc: '日常巡查检查' },
          { id: 'inspect-check', name: '监督检查', icon: 'search-check', desc: '专项执法检查' },
          { id: 'audit-center', name: '审核中心', icon: 'file-check', desc: '审核流程管理' },
          { id: 'hazard-supervise', name: '隐患监督整改', icon: 'alert-circle', desc: '隐患跟踪闭环' },
          { id: 'work-ticket', name: '作业票报备', icon: 'file-text', desc: '特种作业报备' },
          { id: 'work-assign', name: '工作分配管理', icon: 'list-todo', desc: '任务分派' },
          { id: 'fire-prevention', name: '防消联勤', icon: 'flame', desc: '消防联防' },
          { id: 'micro-station', name: '微型消防站', icon: 'building', desc: '微型消防站管理' },
          { id: 'fire-rescue', name: '火灾救援管理', icon: 'truck', desc: '火灾救援记录' },
          { id: 'emergency-drill', name: '应急演练', icon: 'siren', desc: '演练计划管理' },
          { id: 'resident-unit', name: '驻入单位管理', icon: 'building-2', desc: '入驻单位管理' },
          { id: 'contract-mgmt', name: '合同管理', icon: 'file-signature', desc: '合同台账' },
          { id: 'city-mgmt', name: '城市管理', icon: 'city', desc: '综合管理' },
          { id: 'event-rectify', name: '事件整改', icon: 'refresh-cw', desc: '事件闭环' },
          { id: 'event-accept', name: '事件验收', icon: 'check-circle', desc: '事件验收' }
        ]
      },
      {
        title: '监管对象', apps: [
          { id: 'subject-contacts', name: '责任主体通讯录', icon: 'phone', desc: '主体联系人' },
          { id: 'small-premises', name: '九小场所通讯录', icon: 'store', desc: '九小场所信息' },
          { id: 'enterprise-list', name: '企业场所底数', icon: 'briefcase', desc: '企业台账' },
          { id: 'disaster-prevention', name: '防灾减灾底数管理', icon: 'shield', desc: '防灾底数' }
        ]
      },
      {
        title: '组织架构', apps: [
          { id: 'member-mgmt', name: '成员管理', icon: 'users', desc: '人员信息管理' },
          { id: 'position-mgmt', name: '岗位管理', icon: 'briefcase', desc: '岗位设置' },
          { id: 'admin-change', name: '主管理员变更', icon: 'user-cog', desc: '管理员交接' },
          { id: 'org-settings', name: '组织设置', icon: 'settings', desc: '组织信息配置' },
          { id: 'role-mgmt', name: '角色管理', icon: 'user-check', desc: '角色权限' },
          { id: 'account-mgmt', name: '后台账号管理', icon: 'user-plus', desc: '账号管理' },
          { id: 'home-config', name: '主页配置', icon: 'layout', desc: '首页定制' }
        ]
      },
      {
        title: '数据与分析', apps: [
          { id: 'data-cockpit', name: '数据驾驶舱', icon: 'gauge', desc: '全局态势' },
          { id: 'data-board', name: '数据看板', icon: 'bar-chart-3', desc: '可视化分析' },
          { id: 'work-briefing', name: '工作简报', icon: 'file-bar-chart', desc: '自动生成报告' },
          { id: 'monthly-report', name: '月报', icon: 'calendar', desc: '月度统计分析' },
          { id: 'stats-analysis', name: '统计分析', icon: 'bar-chart-4', desc: '多维数据分析' }
        ]
      },
      {
        title: '宣教与推送', apps: [
          { id: 'edu-training', name: '宣教培训', icon: 'book-open', desc: '安全培训管理' },
          { id: 'precision-push', name: '精准推送', icon: 'send', desc: '消息触达' }
        ]
      },
      {
        title: '系统设置', apps: [
          { id: 'msg-config', name: '消息配置', icon: 'message-square', desc: '消息规则配置' },
          { id: 'tag-mgmt', name: '标签管理', icon: 'tags', desc: '标签体系' },
          { id: 'menu-mgmt', name: '菜单管理', icon: 'menu', desc: '菜单自定义' },
          { id: 'approval-center', name: '审批中心', icon: 'clipboard-check', desc: '审批流程' },
          { id: 'todo-center', name: '待办中心', icon: 'inbox', desc: '待办事项' },
          { id: 'sms-comm', name: '短信通讯', icon: 'message-circle', desc: '短信发送' },
          { id: 'account-open', name: '账号开通', icon: 'user-plus', desc: '新账号开通' },
          { id: 'custom-template', name: '定制台账模板', icon: 'file-plus', desc: '台账模板' },
          { id: 'enterprise-ledger', name: '企业电子台账', icon: 'folder-open', desc: '企业台账' },
          { id: 'town-ledger', name: '镇街电子台账', icon: 'folder', desc: '镇街台账' },
          { id: 'base-assist', name: '底数辅助扣清', icon: 'database', desc: '底数清理' },
          { id: 'private-deploy', name: '服务私有化部署', icon: 'server', desc: '私有化部署' },
          { id: 'foundation-training', name: '固本强基培训', icon: 'graduation-cap', desc: '基础能力培训' }
        ]
      },
      {
        title: '系统服务', apps: [
          { id: 'msg-center', name: '消息中心', icon: 'bell', desc: '站内消息' },
          { id: 'ai-assistant', name: 'AI助手', icon: 'bot', desc: '小安智能客服' },
          { id: 'operation-guide', name: '操作指引', icon: 'book', desc: '使用指南' },
          { id: 'online-cs', name: '在线客服', icon: 'headphones', desc: '在线咨询' },
          { id: 'download-center', name: '下载中心', icon: 'download', desc: '客户端下载' }
        ]
      },
      {
        title: '工作台工具', apps: [
          { id: 'metric-config', name: '指标配置', icon: 'sliders-horizontal', desc: '自定义看板指标' },
          { id: 'rules-engine', name: '规则引擎', icon: 'settings-2', desc: '异常判定规则' }
        ]
      }
    ];

    // ════════════════════════════════════════════════════════════════
    // 收藏功能
    // ════════════════════════════════════════════════════════════════

    function getFavorites() {
      return JSON.parse(ls.get('yaq_v4_launcher_favs', '[]'));
    }

    function toggleFavorite(id) {
      var favs = getFavorites();
      var idx = favs.indexOf(id);
      if (idx > -1) { favs.splice(idx, 1); }
      else { favs.push(id); }
      ls.set('yaq_v4_launcher_favs', JSON.stringify(favs));
      renderLauncher();
    }

    YAQ.toggleFavorite = toggleFavorite;

    // ════════════════════════════════════════════════════════════════
    // 最近使用
    // ════════════════════════════════════════════════════════════════

    function recordRecent(id) {
      var recent = JSON.parse(ls.get('yaq_v4_launcher_recent', '[]'));
      // 移除重复
      for (var i = 0; i < recent.length; i++) {
        if (recent[i].id === id) { recent.splice(i, 1); break; }
      }
      recent.unshift({ id: id, time: Date.now() });
      // 只保留最近 20 条
      if (recent.length > 20) recent.length = 20;
      ls.set('yaq_v4_launcher_recent', JSON.stringify(recent));
    }

    function getRecentApps(allApps, excludeIds) {
      var recent = JSON.parse(ls.get('yaq_v4_launcher_recent', '[]'));
      var result = [];
      var excludeSet = {};
      for (var ei = 0; ei < excludeIds.length; ei++) {
        excludeSet[excludeIds[ei]] = true;
      }
      for (var ri = 0; ri < recent.length; ri++) {
        if (result.length >= 8) break;
        var rid = recent[ri].id;
        if (excludeSet[rid]) continue;
        for (var aj = 0; aj < allApps.length; aj++) {
          if (allApps[aj].id === rid) {
            result.push(allApps[aj]);
            break;
          }
        }
      }
      return result;
    }

    // ════════════════════════════════════════════════════════════════
    // 搜索历史 — 输入框底部横向标签
    // ════════════════════════════════════════════════════════════════

    var SEARCH_HISTORY_KEY = 'yaq_search_history_v1';
    var SEARCH_HISTORY_MOCK = ['王志安', '北苑', '消防通道', '恒源化工', '检查'];

    function getSearchHistory() {
      var h = JSON.parse(ls.get(SEARCH_HISTORY_KEY, 'null'));
      if (!h || !Array.isArray(h) || h.length === 0) {
        h = SEARCH_HISTORY_MOCK.slice();
        ls.set(SEARCH_HISTORY_KEY, JSON.stringify(h));
      }
      return h;
    }

    function recordSearchKeyword(keyword) {
      keyword = keyword.trim();
      if (!keyword || keyword.length < 1) return;
      var h = getSearchHistory();
      var idx = h.indexOf(keyword);
      if (idx > -1) h.splice(idx, 1);
      h.unshift(keyword);
      if (h.length > 12) h.length = 12;
      ls.set(SEARCH_HISTORY_KEY, JSON.stringify(h));
      renderSearchChips();
    }

    function removeSearchKeyword(keyword) {
      var h = getSearchHistory();
      var idx = h.indexOf(keyword);
      if (idx > -1) {
        h.splice(idx, 1);
        ls.set(SEARCH_HISTORY_KEY, JSON.stringify(h));
        renderSearchChips();
      }
    }

    function clearSearchHistory() {
      ls.set(SEARCH_HISTORY_KEY, JSON.stringify([]));
      renderSearchChips();
    }

    // 渲染横向搜索历史标签
    function renderSearchChips() {
      var el = $dom.launchChips;
      if (!el) return;
      var h = getSearchHistory();
      if (!h || h.length === 0) {
        el.classList.remove('show');
        el.innerHTML = '';
        return;
      }
      var html = '';
      for (var i = 0; i < h.length && i < 10; i++) {
        var raw = h[i];
        var jsSafe = raw.replace(/'/g, "\\'");
        html += '<span class="l-chip" onclick="applySearchChip(\'' + jsSafe + '\')" title="搜索「' + $_escapeHtml(raw) + '」">' +
          $_escapeHtml(raw) +
          '<button class="l-chip-del" onmousedown="event.stopPropagation();removeSearchKeyword(\'' + jsSafe + '\')" title="移除">' +
            '<i data-lucide="x" width="10" height="10"></i>' +
          '</button>' +
        '</span>';
      }
      if (h.length > 0) {
        html += '<span class="l-chip l-chip-clear" onclick="clearSearchHistory()" title="清空历史">清空</span>';
      }
      el.innerHTML = html;
      el.classList.add('show');
      if (window.lucide) lucide.createIcons(el);
    }

    // 点击搜索历史标签
    function applySearchChip(keyword) {
      $dom.launcherSearch.value = keyword;
      onLauncherSearch();
      $dom.launcherSearch.focus();
      var len = $dom.launcherSearch.value.length;
      $dom.launcherSearch.setSelectionRange(len, len);
    }

    // ════════════════════════════════════════════════════════════════
    // 渲染启动台
    // ════════════════════════════════════════════════════════════════

    function renderLauncher() {
      var query = ($dom.launcherSearch.value || '').trim().toLowerCase();
      var favs = getFavorites();
      var html = '';

      // ─── 搜索模式：多维分组结果 ────────────────────────────
      if (query) {
        // 搜索时隐藏历史关键词标签
        var chipsEl = $dom.launchChips;
        if (chipsEl) chipsEl.classList.remove('show');
        var result = globalSearch(query);
        var hasAny = false;
        for (var _tgi = 0; _tgi < result.typeOrder.length; _tgi++) {
          var gk = result.typeOrder[_tgi];
          var g = result.groups[gk];
          if (!g || !g.items || g.items.length === 0) continue;
          hasAny = true;
          html += '<div class="sg-group">' +
            '<div class="sg-group-head">' +
              '<span class="sg-group-icon">' + g.icon + '</span>' +
              '<span class="sg-group-title">' + g.label + '</span>' +
              '<span class="sg-group-count">' + g.items.length + '</span>' +
              '<span class="lgh-line"></span>' +
            '</div>' +
            '<div class="sg-list">';
          for (var _ii = 0; _ii < g.items.length; _ii++) {
            var item = g.items[_ii];
            var entry = item.entry;
            html += renderSearchResultItem(entry, query);
          }
          html += '</div></div>';
        }

        if (!hasAny) {
          html = '<div class="launcher-empty">未找到 "<strong>' + $_escapeHtml(query) + '</strong>" 相关的结果</div>';
        }
        $dom.launcherBody.innerHTML = html;
        lucide.createIcons({ container: $dom.launcherBody });
        return;
      }

      // ─── 默认模式：常用功能 + 最近使用 + 分类浏览 ────────

      // 收集所有 app 的扁平列表
      var allApps = [];
      for (var gi = 0; gi < LAUNCHER_DATA.length; gi++) {
        for (var ai = 0; ai < LAUNCHER_DATA[gi].apps.length; ai++) {
          var a = LAUNCHER_DATA[gi].apps[ai];
          allApps.push(a);
        }
      }

      // ⭐ 常用功能
      if (favs.length > 0) {
        var favApps = [];
        for (var fi = 0; fi < favs.length; fi++) {
          for (var aj = 0; aj < allApps.length; aj++) {
            if (allApps[aj].id === favs[fi]) {
              favApps.push(allApps[aj]);
              break;
            }
          }
        }
        if (favApps.length > 0) {
          html += '<div class="launcher-group">' +
            '<div class="launcher-group-head">' +
              '<span class="launcher-group-title">⭐ 常用功能</span>' +
              '<span class="launcher-group-count">' + favApps.length + '</span>' +
              '<span class="lgh-line"></span>' +
            '</div>' +
            '<div class="launcher-grid">';
          for (var fk = 0; fk < favApps.length; fk++) {
            html += buildLauncherItem(favApps[fk], true);
          }
          html += '</div></div>';
        }
      }

      // 🕐 最近使用
      var recentApps = getRecentApps(allApps, favs);
      if (recentApps.length > 0) {
        html += '<div class="launcher-group">' +
          '<div class="launcher-group-head">' +
            '<span class="launcher-group-title">🕐 最近使用</span>' +
            '<span class="launcher-group-count">' + recentApps.length + '</span>' +
            '<span class="lgh-line"></span>' +
          '</div>' +
          '<div class="launcher-grid">';
        for (var rk = 0; rk < recentApps.length; rk++) {
          html += buildLauncherItem(recentApps[rk], false);
        }
        html += '</div></div>';
      }

      // 分类浏览
      for (var gi = 0; gi < LAUNCHER_DATA.length; gi++) {
        var group = LAUNCHER_DATA[gi];
        html += '<div class="launcher-group">' +
          '<div class="launcher-group-head">' +
            '<span class="launcher-group-title">' + group.title + '</span>' +
            '<span class="launcher-group-count">' + group.apps.length + '</span>' +
            '<span class="lgh-line"></span>' +
          '</div>' +
          '<div class="launcher-grid">';
        for (var ai = 0; ai < group.apps.length; ai++) {
          html += buildLauncherItem(group.apps[ai], false);
        }
        html += '</div></div>';
      }

      $dom.launcherBody.innerHTML = html;
      lucide.createIcons({ container: $dom.launcherBody });
    }

    // 渲染搜索结果项（带类型图标、高亮、摘要）
    function renderSearchResultItem(entry, query) {
      var typeIconMap = {
        person:     '<div class="sri-icon sri-icon-person"><i data-lucide="user" width="16" height="16"></i></div>',
        enterprise: '<div class="sri-icon sri-icon-enterprise"><i data-lucide="building-2" width="16" height="16"></i></div>',
        task:       '<div class="sri-icon sri-icon-task"><i data-lucide="clipboard-list" width="16" height="16"></i></div>',
        workItem:   '<div class="sri-icon sri-icon-workitem"><i data-lucide="flag" width="16" height="16"></i></div>',
        function:   '<div class="sri-icon sri-icon-function"><i data-lucide="zap" width="16" height="16"></i></div>'
      };
      var iconHtml = typeIconMap[entry.type] || '<div class="sri-icon"><i data-lucide="search" width="16" height="16"></i></div>';

      var labelHtml = $_highlight(entry.label, query);
      var subHtml = entry.subtitle ? '<span class="sri-sub">' + $_escapeHtml(entry.subtitle) + '</span>' : '';

      // 附加元信息标签
      var metaHtml = '';
      var meta = entry.meta;
      if (entry.type === 'enterprise') {
        if (meta.region) metaHtml += '<span class="sri-tag sri-tag-region">' + $_escapeHtml(meta.region) + '</span>';
        if (meta.level && meta.level.indexOf('重大') > -1) metaHtml += '<span class="sri-tag sri-tag-danger">重大</span>';
        else if (meta.level && meta.level.indexOf('一般') > -1) metaHtml += '<span class="sri-tag sri-tag-warn">一般</span>';
        if (meta.status === '超期未整改') metaHtml += '<span class="sri-tag sri-tag-danger">超期</span>';
      } else if (entry.type === 'task') {
        if (meta.region) metaHtml += '<span class="sri-tag sri-tag-region">' + $_escapeHtml(meta.region) + '</span>';
        if (meta.status) metaHtml += '<span class="sri-tag sri-tag-info">' + $_escapeHtml(meta.status) + '</span>';
        if (meta.progress) metaHtml += '<span class="sri-tag sri-tag-progress">' + $_escapeHtml(meta.progress) + '</span>';
      } else if (entry.type === 'workItem') {
        if (meta.risk && meta.risk.indexOf('重大') > -1) metaHtml += '<span class="sri-tag sri-tag-danger">重大</span>';
        if (meta.status) metaHtml += '<span class="sri-tag sri-tag-info">' + $_escapeHtml(meta.status) + '</span>';
      } else if (entry.type === 'function') {
        if (meta.group) metaHtml += '<span class="sri-tag sri-tag-group">' + $_escapeHtml(meta.group) + '</span>';
      }

      return '<div class="sri-item" onclick="executeSearchResult(\'' + $_escapeHtml(entry.id) + '\')">' +
        iconHtml +
        '<div class="sri-body">' +
          '<div class="sri-label">' + labelHtml + subHtml + '</div>' +
          '<div class="sri-meta">' + metaHtml + '</div>' +
        '</div>' +
        '<i data-lucide="chevron-right" width="14" height="14" class="sri-arrow"></i>' +
      '</div>';
    }

    function buildLauncherItem(app, isFaved) {
      // 如果未显式标记为收藏，再查一下是否已在收藏列表里
      var faved = isFaved ? ' faved' : '';
      if (!faved) {
        var allFavs = getFavorites();
        for (var fi = 0; fi < allFavs.length; fi++) {
          if (allFavs[fi] === app.id) { faved = ' faved'; break; }
        }
      }
      return '<div class="launcher-item" onclick="launcherGo(\'' + app.id + '\')" title="' + (app.desc || '') + '">' +
        '<button class="li-fav' + faved + '" onclick="event.stopPropagation();toggleFavorite(\'' + app.id + '\')" title="' + (isFaved || faved ? '取消收藏' : '收藏') + '">' +
          '<i data-lucide="star" width="13" height="13"></i>' +
        '</button>' +
        '<div class="li-icon"><i data-lucide="' + app.icon + '" width="22" height="22"></i></div>' +
        '<div class="li-name">' + app.name + '</div>' +
      '</div>';
    }

    function toggleLauncher() {
      var panel = $dom.launcherPanel;
      var overlay = $dom.launcherOverlay;
      var isOpen = panel.classList.contains('open');
      if (isOpen) {
        closeLauncher();
      } else {
        openLauncher();
      }
    }

    function openLauncher() {
      $dom.launcherPanel.classList.add('open');
      $dom.launcherOverlay.classList.add('open');
      $dom.launcherSearch.value = '';
      renderLauncher();
      renderSearchChips();
      setTimeout(function() {
        $dom.launcherSearch.focus();
      }, 100);
    }

    function closeLauncher() {
      $dom.launcherPanel.classList.remove('open');
      $dom.launcherOverlay.classList.remove('open');
      var chipsEl = $dom.launchChips;
      if (chipsEl) chipsEl.classList.remove('show');
    }

    function onLauncherSearch() {
      // 隐藏搜索历史标签
      var chipsEl = $dom.launchChips;
      if (chipsEl) chipsEl.classList.remove('show');
      // 记录搜索关键词（只记录不重新渲染，避免干扰）
      var q = ($dom.launcherSearch.value || '').trim();
      if (q) {
        var h = JSON.parse(ls.get(SEARCH_HISTORY_KEY, 'null'));
        if (!h || !Array.isArray(h) || h.length === 0) h = SEARCH_HISTORY_MOCK.slice();
        var idx = h.indexOf(q);
        if (idx > -1) h.splice(idx, 1);
        h.unshift(q);
        if (h.length > 12) h.length = 12;
        ls.set(SEARCH_HISTORY_KEY, JSON.stringify(h));
      }
      renderLauncher();
    }

    function launcherSearchFirst() {
      var first = document.querySelector('.sri-item:first-child, .launcher-item:first-child');
      if (first) { first.click(); }
    }

    function launcherGo(id) {
      // 记录最近使用
      recordRecent(id);
      closeLauncher();
      // 映射：非场景 ID 转到场景或执行动作
      var actionMap = {
        // 工作台场景（已实现）
        'dashboard': 'dashboard',
        'followup': 'followup',
        'hazard-report': 'hazard-report',
        'efficiency': 'efficiency',
        'responsibility': 'responsibility',
        'disposal': 'disposal',
        'pending-actions': 'pending-actions',
        'supervision-track': 'supervision-track',
        // 月报
        'monthly-report': 'monthly-report',
        // 工具
        'metric-config': '__metric_config__',
        'rules-engine': 'rules',
        'ai-assistant': '__ai_switch__',
        // 占位——后续实现的功能
        'msg-center': '__todo__'
      };
      // 所有未显式映射的 ID 默认用 __todo__
      var target = actionMap[id] || '__todo__';
      if (target === '__metric_config__') {
        if (YAQ.openMetricConfig) YAQ.openMetricConfig();
      } else if (target === '__ai_switch__') {
        document.querySelector('.tab[data-tab="chat"]').click();
      } else if (target === '__todo__') {
        showToast('后续能力，敬请期待');
      } else {
        switchScene(target);
      }
    }

    // ─── 全局键盘快捷键 ─────────────────────────────────────────
    document.addEventListener('keydown', function(e) {
      // Cmd+K / Ctrl+K 打开启动台
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        var panel = $dom.launcherPanel;
        if (panel && panel.classList.contains('open')) {
          closeLauncher();
        } else {
          openLauncher();
        }
      }
      // Escape 关闭启动台
      if (e.key === 'Escape') {
        var panel = $dom.launcherPanel;
        if (panel && panel.classList.contains('open')) {
          closeLauncher();
          return;
        }
      }
    });

    // ═══ 移动端汉堡菜单 ═══════════════════════════════════════════
    function toggleHamburger() {
      var strip = document.getElementById('tabStrip');
      if (strip) {
        strip.classList.toggle('open');
      }
    }

    // 绑定汉堡按钮点击（替代 inline onclick，避免加载时序问题）
    var hBtn = document.getElementById('hamburgerBtn');
    if (hBtn) hBtn.addEventListener('click', toggleHamburger);

    // 移动端：点击遮罩区域关闭侧边栏
    document.addEventListener('click', function(e) {
      var strip = document.getElementById('tabStrip');
      var btn = document.getElementById('hamburgerBtn');
      if (!strip || !strip.classList.contains('open')) return;
      if (strip.contains(e.target) || btn.contains(e.target)) return;
      strip.classList.remove('open');
    });

    // 暴露全局函数
    YAQ.toggleLauncher = toggleLauncher;
    YAQ.openLauncher = openLauncher;
    YAQ.closeLauncher = closeLauncher;
    YAQ.onLauncherSearch = onLauncherSearch;
    YAQ.launcherSearchFirst = launcherSearchFirst;
    YAQ.launcherGo = launcherGo;

    // ════════════════════════════════════════════════════════════════
    // 渲染左栏场景列表
    // ════════════════════════════════════════════════════════════════


    // ════════════════════════════════════════════════════════════════
    // TAB 管理
    // ════════════════════════════════════════════════════════════════

    var tabs = [];
    var sceneLabels = {
      dashboard: '工作台',
      'rules': '规则管理',
      'hazard-report': '重大隐患整改',
      'efficiency': '履职效能',
      'responsibility': '主体责任',
      'disposal': '分级处置',
      'followup': '重点跟进',
      'pending-actions': '待确认行动',
      'supervision-track': '督办跟踪',
      'monthly-report': '月报'
    };

    function switchTab(sceneId) {
      if (!sceneId) return;
      switchScene(sceneId, true);
    }

    function closeTab(sceneId) {
      if (sceneId === 'dashboard') return; // 默认 tab 不可关闭
      var idx = -1;
      for (var ti = 0; ti < tabs.length; ti++) {
        if (tabs[ti].id === sceneId) { idx = ti; break; }
      }
      if (idx === -1) return;
      tabs.splice(idx, 1);
      // 切到相邻 tab
      if (state.activeScene === sceneId) {
        var next = tabs[Math.min(idx, tabs.length - 1)];
        if (next) {
          state.activeScene = next.id;
          renderTabs();
          switchScene(next.id);
        }
      } else {
        renderTabs();
      }
    }

    function renderTabs() {
      var strip = document.getElementById('tabStrip');
      if (!strip) return;
      var html = '';
      for (var ti = 0; ti < tabs.length; ti++) {
        var t = tabs[ti];
        var active = t.id === state.activeScene ? ' active' : '';
        var closeBtn = t.id === 'dashboard' ? '' : '<button class="tab-close" onclick="event.stopPropagation();YAQ.closeTab(\'' + t.id + '\')">✕</button>';
        html += '<div class="tab-item' + active + '" onclick="YAQ.switchTab(\'' + t.id + '\')">' + t.label + closeBtn + '</div>';
      }
      strip.innerHTML = html;
    }

    // 初始化默认 tab — 将初始化场景一键变成顶部 Tab
    var defaultTabs = [
      { id: 'dashboard', label: '工作台' },
      { id: 'hazard-report', label: '重大隐患整改' },
      { id: 'efficiency', label: '履职效能' },
      { id: 'responsibility', label: '主体责任' },
      { id: 'disposal', label: '分级处置' },
      { id: 'followup', label: '重点跟进' },
      { id: 'pending-actions', label: '待确认行动' },
      { id: 'supervision-track', label: '督办跟踪' },
      { id: 'monthly-report', label: '月报' }
    ];
    defaultTabs.forEach(function(t) { tabs.push(t); });
    // 初始渲染 tab 栏（此时 initOverlay 遮罩还在，但 tab 已就绪）
    renderTabs();
    // ════════════════════════════════════════════════════════════════
    // INIT
    // ════════════════════════════════════════════════════════════════

    // Date
    var now = new Date();
    var dateStr = now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日';
    var weekdays = ['日','一','二','三','四','五','六'];
    // $dom.topbarDate.textContent = dateStr + ' 星期' + weekdays[now.getDay()];  // 头部时间已删除

    // ════════════════════════════════════════════════════════════════
    // YAQ Namespace — 统一命名空间，替代零散 window 导出
    // 新增代码应使用 YAQ.xxx 而非 window.xxx
    // ════════════════════════════════════════════════════════════════
    Object.assign(window.YAQ, {
      // ─── 场景/导航 ───
      switchScene: switchScene,
      switchTab: switchTab,
      closeTab: closeTab,
      renderScene: renderScene,

      // ─── UI 工具 ───
      showToast: showToast,
      escapeHtml: escapeHtml,
      toggleDemoMenu: window.toggleDemoMenu,

      // ─── 侧边栏/弹窗 ───
      openDrawer: openDrawer,
      openSuperviseDrawer: openSuperviseDrawer,
      closeDrillFloat: closeDrillFloat,
      closeHazardModal: closeHazardModal,
      closeLauncher: closeLauncher,
      closeMetricConfig: closeMetricConfig,
      closeEnterprisePanel: closeEnterprisePanel,
      closeTaskModal: closeTaskModal,

      // ─── Agent/AI ───
      openAgentConfig: openAgentConfig,
      saveAgentPrompt: saveAgentPrompt,
      agentAsk: agentAsk,
      sendChatMsg: sendChatMsg,
      askAI: askAI,

      // ─── 聊天面板 ───
      toggleChatPanel: toggleChatPanel,
      openChatPanel: openChatPanel,

      // ─── 汉堡菜单 ───
      toggleHamburger: toggleHamburger,

      // ─── 关注/跟进 ───
      doFollowupAction: doFollowupAction,
      handleTodayFocusAction: handleTodayFocusAction,
      handleFollowupAction: handleFollowupAction,
      handleActionItemPrimary: handleActionItemPrimary,
      handleActionItemSecondary: handleActionItemSecondary,

      // ─── 工具函数 ───
      getActionIcon: getActionIcon,

      // ─── 指标配置 ───
      openMetricConfig: openMetricConfig,
      saveMetricConfig: saveMetricConfig,
      toggleMiniCard: toggleMiniCard,
      cycleMetricPeriod: cycleMetricPeriod,
      setMetricFilter: setMetricFilter,
      setPeriodFilter: setPeriodFilter,

      // ─── 指标拖拽排序 ───
      onDragStart: onDragStart,
      onDragOver: onDragOver,
      onDrop: onDrop,
      onDragEnd: onDragEnd,
      removeSelected: removeSelected,
      onMetricSearch: onMetricSearch,

      // ─── 指标提示/下钻 ───
      showMetricTip: showMetricTip,
      hideMetricTip: hideMetricTip,
      openMetricDrilldown: openMetricDrilldown,
      copyTipContent: copyTipContent,

      // ─── 企业面板 ───
      openEnterprisePanel: openEnterprisePanel,
      epSwitchTab: epSwitchTab,

      // ─── 隐患详情 ───
      openHazardDetail: openHazardDetail,
      copyHazardInfo: copyHazardInfo,

      toggleRegulation: toggleRegulation,

      // ─── 快速启动 (Launcher) ───
      toggleLauncher: toggleLauncher,
      openLauncher: openLauncher,
      onLauncherSearch: onLauncherSearch,
      launcherSearchFirst: launcherSearchFirst,
      launcherGo: launcherGo,
      executeSearchResult: executeSearchResult,
      toggleFavorite: toggleFavorite,
      applySearchChip: applySearchChip,

      // ─── 处置建议 ───
      copyDisposalRec: function(idx) { YAQ.copyDisposalRec(idx); },
      generateAllDisposalText: function() { YAQ.generateAllDisposalText(); },
      regenerateDisposalRecs: function() { YAQ.regenerateDisposalRecs(); },
      copyDrawerGenerated: function() { YAQ.copyDrawerGenerated(); },

      // ─── 月报 ───
      mrToggleModule: YAQ.mrToggleModule,
      mrAddModule: YAQ.mrAddModule,
      mrResetModules: YAQ.mrResetModules,
      switchMrHistory: YAQ.switchMrHistory,
      toggleMrSection: YAQ.toggleMrSection,

      // ─── 待确认行动 ───
      confirmPendingAction: confirmPendingAction,
      changePendingAction: changePendingAction,
      ignorePendingAction: ignorePendingAction,
      togglePASelection: togglePASelection,
      toggleSelectAllPA: toggleSelectAllPA,
      clearPASelection: clearPASelection,
      batchConfirmPAs: batchConfirmPAs,
      batchIgnorePAs: batchIgnorePAs,
      batchChangePAs: batchChangePAs,

      // ─── 跟踪 ───
      addTrack: YAQ.addTrack,
      updateTrackProgress: YAQ.updateTrackProgress,
      resolveTrack: YAQ.resolveTrack,
      closeTrack: YAQ.closeTrack,
      quickTrack: YAQ.quickTrack,

      // ─── 占位：PA Modal ───
      closePAModal: function() {
        var overlay = document.getElementById('paModalOverlay');
        var modal = document.getElementById('paModal');
        if (overlay) overlay.style.display = 'none';
        if (modal) modal.style.display = 'none';
      },
    });

    // ════════════════════════════════════════════════════════════════
    // Backward-compatible window aliases (用于内联 onclick 等)
    // 减少新增，逐步迁移到 YAQ.xxx
    // ════════════════════════════════════════════════════════════════
    // 从 index.html onclick 调用的函数（必须保留 window 访问）
    window.toggleDemoMenu = window.YAQ.toggleDemoMenu;
    window.showToast = window.YAQ.showToast;
    window.openDrawer = window.YAQ.openDrawer;
    window.toggleHamburger = window.YAQ.toggleHamburger;
    window.openLauncher = window.YAQ.openLauncher;
    window.closeLauncher = window.YAQ.closeLauncher;
    window.closeDrillFloat = window.YAQ.closeDrillFloat;
    window.closeHazardModal = window.YAQ.closeHazardModal;
    window.closeMetricConfig = window.YAQ.closeMetricConfig;
    window.closeEnterprisePanel = window.YAQ.closeEnterprisePanel;
    window.closeTaskModal = window.YAQ.closeTaskModal;
    window.copyHazardInfo = window.YAQ.copyHazardInfo;
    window.saveMetricConfig = window.YAQ.saveMetricConfig;
    window.closePAModal = window.YAQ.closePAModal;
    window.renderScene = window.YAQ.renderScene;
    window.escapeHtml = window.YAQ.escapeHtml;  // 供 agent-init.js 等后续脚本使用
    window.switchScene = window.YAQ.switchScene;  // 供移动端底部导航 onclick 使用
    window.onMetricSearch = window.YAQ.onMetricSearch;    // 供指标搜索 oninput 使用 (#53)
    window.onLauncherSearch = window.YAQ.onLauncherSearch; // 供启动台搜索 oninput 使用 (#53)

    // ── 复合命令包装：支持 data-cmd 单命令调用 ──────────────
    YAQ.resetAndCloseMenu = function() { window.resetInit(); window.closeDemoMenu(); };
    YAQ.dashboardRedirectAndClose = function() { window.doDashboardRedirect(); window.closeDemoMenu(); };
    YAQ.normalDashboardAndClose = function() { window.doNormalDashboard(); window.closeDemoMenu(); };
    YAQ.closeMenuAndOpenComparison = function() { window.closeDemoMenu(); window.open('ai-vs-traditional-comparison.html','_blank'); };
    YAQ.openDemoPage = function(url) { window.open(url, '_blank'); };

    // ════════════════════════════════════════════════════════════════
    // 事件委托：替代 index.html 中的内联 onclick（#42）
    // 渐进式迁移：先用 data-* 属性 + 事件委托消除内联 onclick，
    // 后续可进一步优化为更细粒度的组件级绑定。
    // ════════════════════════════════════════════════════════════════

    document.addEventListener('click', function(e) {
      var el, fn, arg;

      // ── 场景切换：[data-scene] — e.g. <button data-scene="dashboard">
      el = e.target.closest('[data-scene]');
      if (el) { switchScene(el.getAttribute('data-scene')); return; }

      // ── 命令分发：[data-cmd] (+ 可选 data-arg) — 通用模式
      el = e.target.closest('[data-cmd]');
      if (el) {
        fn = el.getAttribute('data-cmd');
        arg = el.getAttribute('data-arg');
        // 先查 YAQ 命名空间，再查 window
        var func = (window.YAQ && window.YAQ[fn]) || window[fn];
        if (typeof func === 'function') {
          if (arg != null && arg !== '') func(arg);
          else func();
        }
        return;
      }
    });

    // ── keydown 委托：替代内联 onkeydown (#73) ──────────
    document.addEventListener('keydown', function(e) {
      var el = e.target.closest('[data-cmd-key]');
      if (el) {
        var key = el.getAttribute('data-cmd-key');
        if (e.key === key) {
          e.preventDefault();
          var fn = el.getAttribute('data-cmd');
          var func = (window.YAQ && window.YAQ[fn]) || window[fn];
          if (typeof func === 'function') func(e);
        }
      }
      // Escape 键处理
      el = e.target.closest('[data-cmd-key-esc]');
      if (el && e.key === 'Escape') {
        e.preventDefault();
        var fn = el.getAttribute('data-cmd-key-esc');
        var func = (window.YAQ && window.YAQ[fn]) || window[fn];
        if (typeof func === 'function') func();
      }
    });

    // ── input 委托：替代内联 oninput (#73) ──────────
    document.addEventListener('input', function(e) {
      var el = e.target.closest('[data-cmd-input]');
      if (!el) return;
      var fn = el.getAttribute('data-cmd-input');
      var func = (window.YAQ && window.YAQ[fn]) || window[fn];
      if (typeof func === 'function') func();
    });

    // ════════════════════════════════════════════════════════════════
    // 待确认行动交互
    // ════════════════════════════════════════════════════════════════

    function confirmPendingAction(paId) {
      var pa = null;
      for (var i = 0; i < MOCK.pendingActions.length; i++) {
        if (MOCK.pendingActions[i].id === paId) { pa = MOCK.pendingActions[i]; break; }
      }
      if (!pa) { showToast('未找到待确认行动'); return; }

      // 生成督办包
      var sp = {
        id: 'sp-' + Date.now(),
        title: pa.title,
        actionType: pa.actionType,
        status: '推进中',
        chain: pa.chain,
        draftItems: pa.draftItems.concat(),
        createdAt: new Date().toLocaleDateString('zh-CN'),
        itemCount: pa.draftItems.length,
        feedbackCount: 0,
        doneCount: 0,
        overdueCount: 0
      };
      MOCK.supervisionPackages.push(sp);
      MOCK.confirmedPackages.unshift(sp);

      // 更新待确认行动状态
      pa.status = 'confirmed';

      showToast('✅ 督办包已生成，已向 ' + pa.draftItems.length + ' 个角色发送处理项');

      // 重新渲染
      renderScene('pending-actions');
    }

    function changePendingAction(paId, newType) {
      var pa = null;
      for (var i = 0; i < MOCK.pendingActions.length; i++) {
        if (MOCK.pendingActions[i].id === paId) { pa = MOCK.pendingActions[i]; break; }
      }
      if (!pa) { showToast('未找到待确认行动'); return; }

      var typeLabels = { explain: '要求说明', track: '加入跟进', observe: '暂不观察' };
      var label = typeLabels[newType] || '其他';
      pa.actionType = newType;
      pa.status = 'changed';

      showToast('已改为「' + label + '」');
      renderScene('pending-actions');
    }

    function ignorePendingAction(paId) {
      var pa = null;
      for (var i = 0; i < MOCK.pendingActions.length; i++) {
        if (MOCK.pendingActions[i].id === paId) { pa = MOCK.pendingActions[i]; break; }
      }
      if (!pa) { showToast('未找到待确认行动'); return; }

      pa.status = 'ignored';
      showToast('已忽略');
      renderScene('pending-actions');
    }

    // ════════════════════════════════════════════════════════════════
    // 批量操作 — 待确认行动
    // ════════════════════════════════════════════════════════════════

    function togglePASelection(paId, checked) {
      if (checked) {
        state.selectedPAIds[paId] = true;
      } else {
        delete state.selectedPAIds[paId];
      }
      updateBatchBar();
      // 更新卡片选中样式
      var card = document.getElementById('pa-card-' + paId);
      if (card) {
        if (checked) { card.classList.add('pa-card-selected'); }
        else { card.classList.remove('pa-card-selected'); }
      }
    }

    function toggleSelectAllPA(checked) {
      var pas = MOCK.pendingActions || [];
      state.selectedPAIds = {};
      if (checked) {
        for (var i = 0; i < pas.length; i++) {
          if (pas[i].status === 'pending') {
            state.selectedPAIds[pas[i].id] = true;
          }
        }
      }
      // 更新所有卡片样式和 checkbox
      var cards = document.querySelectorAll('.pa-card');
      for (var c = 0; c < cards.length; c++) {
        var cb = cards[c].querySelector('input[type="checkbox"]');
        if (checked) {
          cards[c].classList.add('pa-card-selected');
          if (cb) cb.checked = true;
        } else {
          cards[c].classList.remove('pa-card-selected');
          if (cb) cb.checked = false;
        }
      }
      updateBatchBar();
    }

    function clearPASelection() {
      state.selectedPAIds = {};
      renderScene('pending-actions');
    }

    function updateBatchBar() {
      var bar = $dom.paBatchBar;
      var countEl = $dom.paBatchCount;
      var confirmN = $dom.paBatchConfirmN;
      var selectAllCb = $dom.paSelectAll;
      if (!bar) return;

      var ids = state.selectedPAIds;
      var n = 0;
      for (var k in ids) { if (ids.hasOwnProperty(k)) n++; }

      if (n > 0) {
        bar.style.display = 'flex';
        countEl.textContent = '已选 ' + n + ' 项';
        confirmN.textContent = '(' + n + ')';
      } else {
        bar.style.display = 'none';
      }

      // 同步全选 checkbox 状态
      if (selectAllCb) {
        var pas = MOCK.pendingActions || [];
        var pendingCount = 0;
        for (var i = 0; i < pas.length; i++) {
          if (pas[i].status === 'pending') pendingCount++;
        }
        selectAllCb.checked = (n === pendingCount && pendingCount > 0);
        selectAllCb.indeterminate = (n > 0 && n < pendingCount);
      }
    }

    function getSelectedPendingActions() {
      var result = [];
      var ids = state.selectedPAIds;
      for (var i = 0; i < MOCK.pendingActions.length; i++) {
        var pa = MOCK.pendingActions[i];
        if (ids[pa.id] && pa.status === 'pending') {
          result.push(pa);
        }
      }
      return result;
    }

    function batchConfirmPAs() {
      var selected = getSelectedPendingActions();
      if (selected.length === 0) { showToast('请先选择待确认行动'); return; }

      var totalItems = 0;
      for (var i = 0; i < selected.length; i++) {
        var pa = selected[i];
        // 复用确认逻辑
        var sp = {
          id: 'sp-' + Date.now() + '-' + i,
          title: pa.title,
          actionType: pa.actionType,
          status: '推进中',
          chain: pa.chain,
          draftItems: pa.draftItems.concat(),
          createdAt: new Date().toLocaleDateString('zh-CN'),
          itemCount: pa.draftItems.length,
          feedbackCount: 0,
          doneCount: 0,
          overdueCount: 0
        };
        MOCK.supervisionPackages.push(sp);
        MOCK.confirmedPackages.unshift(sp);
        pa.status = 'confirmed';
        totalItems += pa.draftItems.length;
      }

      state.selectedPAIds = {};
      showToast('✅ 已批量确认 ' + selected.length + ' 个督办包，共生成 ' + totalItems + ' 个处理项');
      renderScene('pending-actions');
    }

    function batchIgnorePAs() {
      var selected = getSelectedPendingActions();
      if (selected.length === 0) { showToast('请先选择待确认行动'); return; }

      for (var i = 0; i < selected.length; i++) {
        selected[i].status = 'ignored';
      }

      state.selectedPAIds = {};
      showToast('已批量忽略 ' + selected.length + ' 项待确认行动');
      renderScene('pending-actions');
    }

    function batchChangePAs(newType) {
      var selected = getSelectedPendingActions();
      if (selected.length === 0) { showToast('请先选择待确认行动'); return; }

      var typeLabels = { explain: '要求说明', track: '加入跟进', observe: '暂不观察' };
      var label = typeLabels[newType] || '其他';

      for (var i = 0; i < selected.length; i++) {
        selected[i].actionType = newType;
        selected[i].status = 'changed';
      }

      state.selectedPAIds = {};
      showToast('已批量改为「' + label + '」共 ' + selected.length + ' 项');
      renderScene('pending-actions');
    }


    // 渲染左栏场景列表

    // Render default scene
    renderScene('dashboard');
    bindInteractions();

  })();
