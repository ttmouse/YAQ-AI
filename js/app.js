  (function() {
    'use strict';

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
        { name: '恒源化工', selfCheck: 0, govCheck: '12 项', training: '32%', drill: '1 次', risk: 'high', suggest: '纳入 C 类重点监管' },
        { name: '鑫盛机械', selfCheck: 0, govCheck: '8 项', training: '45%', drill: '0 次', risk: 'high', suggest: '纳入 C 类重点监管' },
        { name: '宏达建材', selfCheck: '1 次', govCheck: '6 项', training: '58%', drill: '1 次', risk: 'mid', suggest: '村社提醒，持续观察' },
        { name: '东兴机械', selfCheck: 0, govCheck: '5 项', training: '28%', drill: '0 次', risk: 'high', suggest: '建议约谈负责人' },
        { name: '华阳包装', selfCheck: 0, govCheck: '4 项', training: '20%', drill: '0 次', risk: 'high', suggest: '建议约谈负责人' },
        { name: '永固建材', selfCheck: '2 次', govCheck: '4 项', training: '60%', drill: '1 次', risk: 'low', suggest: '持续观察' },
        { name: '天元纺织', selfCheck: 0, govCheck: '6 项', training: '15%', drill: '0 次', risk: 'high', suggest: '建议约谈负责人' },
        { name: '辰光物流', selfCheck: '1 次', govCheck: '3 项', training: '50%', drill: '1 次', risk: 'mid', suggest: '村社提醒，持续观察' }
      ],

      // 专项检查任务
      tasks: [
        // 日常任务（优先级最高）
        { name: '今日到期整改事项跟进', startDate: '2026-06-29', endDate: '2026-06-29', covered: 3, rate: '33%', progress: '100%', hazards: '-', majorHazards: '-', creator: '系统', region: '全片区', risk: '-', lag: true, type: '日常', priority: 1 },
        { name: '超期未整改对象督办', startDate: '2026-06-22', endDate: '2026-06-29', covered: 2, rate: '0%', progress: '100%', hazards: 2, majorHazards: 2, creator: '系统', region: '良渚/五常', risk: '-', lag: true, type: '日常', priority: 2 },
        { name: '高层小区消防专项核查', startDate: '2026-06-01', endDate: '2026-06-30', covered: 8, rate: '42%', progress: '100%', hazards: 3, majorHazards: 1, creator: '张毅', region: '全片区', risk: '-', lag: true, type: '日常', priority: 3 },
        // 专项任务
        { name: '2026年01月-2026年06月物流片较大风险检查任务', startDate: '2026-01-01', endDate: '2026-06-30', covered: 31, rate: '96%', progress: '100%', hazards: '-', majorHazards: '-', creator: '范嘉杰', region: '物流片', risk: '较大风险', lag: false, type: '专项' },
        { name: '2026年第二季度物流片重大风险检查任务', startDate: '2026-04-01', endDate: '2026-06-30', covered: 30, rate: '91%', progress: '98%', hazards: '-', majorHazards: '-', creator: '范嘉杰', region: '物流片', risk: '重大风险', lag: true, type: '专项' },
        { name: '2026年01月-2026年06月良渚片较大风险检查任务', startDate: '2026-01-01', endDate: '2026-06-30', covered: 140, rate: '96%', progress: '100%', hazards: 1, majorHazards: 0, creator: '范嘉杰', region: '良渚片', risk: '较大风险', lag: false, type: '专项' },
        { name: '2026年第二季度良渚片重大风险检查任务', startDate: '2026-04-01', endDate: '2026-06-30', covered: 141, rate: '0%', progress: '91%', hazards: '-', majorHazards: '-', creator: '范嘉杰', region: '良渚片', risk: '重大风险', lag: true, type: '专项' },
        { name: '2026年01月-2026年06月勾庄片较大风险检查任务', startDate: '2026-01-01', endDate: '2026-06-30', covered: 110, rate: '96%', progress: '100%', hazards: '-', majorHazards: '-', creator: '范嘉杰', region: '勾庄片', risk: '较大风险', lag: false, type: '专项' },
        { name: '2026年第二季度勾庄片重大风险检查任务', startDate: '2026-04-01', endDate: '2026-06-30', covered: 65, rate: '0%', progress: '91%', hazards: '-', majorHazards: '-', creator: '范嘉杰', region: '勾庄片', risk: '重大风险', lag: true, type: '专项' }
      ],

      // 分级处置事项（内部管理 + 外部管理双线）
      disposalInternal: [
        {
          level: 1, levelName: '轻微 · 微信/浙政钉/电话了解', tag: 'level-1', icon: 'message-circle',
          items: [
            { title: '宏达建材 · 自查缺失', desc: '近 30 天自查 0 次，通过浙政钉提醒进一步落实', action: '' },
            { title: '永固建材 · 培训即将到期', desc: '年度培训完成率 60%，电话了解原因', action: '' }
          ]
        },
        {
          level: 2, levelName: '中等 · 叫到办公室谈话', tag: 'level-2', icon: 'users',
          items: [
            { title: '消防安全组 · 复查闭环率 68%', desc: '低于站均值 6pp，叫组长和相关人员到办公室谈话', action: '' },
            { title: '华阳包装辖区村社 · 自查持续为 0', desc: '已电话提醒一次仍未改善，叫村社负责人谈话', action: '' }
          ]
        },
        {
          level: 3, levelName: '较重 · 一键提醒应消站/区域站/专家/村社', tag: 'level-3', icon: 'bell',
          items: [
            { title: '东兴机械 · 自查缺失+培训不足', desc: '一键提醒应消站、区域站、第三方专家、村社相关人员履职', action: 'remind-all' },
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
            { title: '鑫盛机械 · 自查 0+隐患 8 项', desc: '组长带队（带上专家；低风险单位则叫上村社和区域站）到现场督促指导', action: '' },
            { title: '永固建材 · 安全管理能力不足', desc: '安排组长带队了解具体原因，帮助解决实际问题', action: '' }
          ]
        },
        {
          level: 2, levelName: '第 2 级 · 站长约谈企业负责人', tag: 'level-2', icon: 'message-square',
          items: [
            { title: '恒源化工 · 危化品隐患持续超期', desc: '站长及张义、国生出面对企业负责人进行约谈，施加压力、强调责任', action: '' },
            { title: '天元纺织 · 多项异常叠加', desc: '约谈企业负责人，明确整改时限和责任人', action: '' }
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
      ]
    };

    // ════════════════════════════════════════════════════════════════
    // STATE
    // ════════════════════════════════════════════════════════════════

    var state = {
      activeScene: 'dashboard'
    };

    // ════════════════════════════════════════════════════════════════
    // SCENE RENDERERS
    // ════════════════════════════════════════════════════════════════

    function renderScene(sceneId) {
      var container = document.getElementById('sceneContent');
      var html = '';
      switch (sceneId) {
        case 'dashboard': html = renderDashboard(); break;
        case 'hazard-report': html = renderHazardReport(); break;
        case 'efficiency': html = renderEfficiency(); break;
        case 'responsibility': html = renderResponsibility(); break;
        case 'disposal': html = renderDisposal(); break;
        default: html = renderDashboard();
      }
      container.innerHTML = html;
      lucide.createIcons();
    }

    // ─── Dashboard ───────────────────────────────────────────────────

    function renderDashboard() {
      var p = MOCK.priority;

      var html = '';

      // ─── AI 管家开场 ────────────────────────────────────────────
      var hour = new Date().getHours();
      var greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
      html += '<div class="ai-briefing">' +
        '<div class="ai-briefing-left">' +
          '<div class="ai-avatar"><i data-lucide="bot" width="20" height="20"></i></div>' +
        '</div>' +
        '<div class="ai-briefing-body">' +
          '<div class="ai-briefing-head">' + greeting + '，站长</div>' +
          '<div class="ai-briefing-text">今天重点关注 <b>重大未闭环隐患</b> 和 <b>履职效能</b>，下面是你需要的核心数据——</div>' +
        '</div>' +
      '</div>';

      // ─── 整体安全态势（指标卡两排） ────────────────────────────
      // 四级风险统计
      var majorRisk = 0, significantRisk = 0, generalRisk = 0, lowRisk = 0;
      for (var ri = 0; ri < MOCK.hazards.length; ri++) {
        var hz = MOCK.hazards[ri];
        if (hz.status === '超期未整改') majorRisk++;
        else if (hz.status === '整改中') significantRisk++;
        else if (hz.status === '已完成') lowRisk++;
        else generalRisk++;
      }
      for (var pi = 0; pi < MOCK.priority.length; pi++) {
        if (MOCK.priority[pi].tag === '滞后') significantRisk++;
      }
      lowRisk = Math.max(0, 12 - majorRisk - significantRisk - generalRisk);

      // ═══ 指标定义：按周期展开 ═══════════════════════════════════
      var metricPrefs = JSON.parse(localStorage.getItem('yaq_metric_prefs') || 'null');
      var baseMetrics = [
        // 运营概览
        { id: 'subjectTotal', label: '安全责任主体总数', value: '2028', group: '监管概况', type: '时点', desc: '当前纳入监管范围的责任主体对象总量' },
        { id: 'coverageCum', label: '覆盖户数', value: '2028', group: '监管概况', type: '累计', desc: '从年初到当前累计被检查或监管触达的主体户数' },
        { id: 'coveragePeriod', label: '覆盖户数', value: '368', group: '监管概况', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内被检查或监管触达过的主体对象数量' },
        { id: 'coverageRate', label: '主体覆盖率', value: '100%', group: '监管概况', type: '闭环率', periods: ['本月','本季','本年'], desc: '已覆盖主体占全部责任主体的比例' },
        // 检查执法
        { id: 'inspectTotal', label: '检查次数', value: '86', group: '监管执法', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内完成的检查总次数（日常监管+监督检查）' },
        { id: 'dailyInspect', label: '日常监管次数', value: '54', group: '监管执法', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内完成的日常监管检查次数' },
        { id: 'superviseInspect', label: '监督检查次数', value: '32', group: '监管执法', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内完成的监督检查次数' },
        { id: 'pushHousehold', label: '检查单推送户数', value: '186', group: '监管执法', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内被推送检查单的主体户数' },
        { id: 'pushCount', label: '检查单推送次数', value: '245', group: '监管执法', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内推送检查单的总次数' },
        { id: 'closeCount', label: '检查单办结数量', value: '198', group: '监管执法', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内完成办结的检查单数量' },
        { id: 'closeRate', label: '检查单办结率', value: '80.8%', group: '监管执法', type: '闭环率', periods: ['本月','本季','本年'], desc: '统计周期内办结检查单占应办结检查单的比例' },
        { id: 'unclosedCount', label: '检查单未办结数', value: '47', group: '监管执法', type: '时点', desc: '已推送但截至统计时间仍未办结的检查单数量' },
        // 隐患闭环
        { id: 'newHazardPeriod', label: '新增隐患', value: '24', group: '隐患闭环', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内新发现的隐患数量' },
        { id: 'hazardCum', label: '累计隐患数', value: '2454', group: '隐患闭环', type: '累计', desc: '从年初到当前累计发现的隐患总数' },
        { id: 'openHazard', label: '未闭环隐患', value: '548', group: '隐患闭环', type: '时点', desc: '截至统计时间仍未完成整改闭环的全部隐患数量' },
        { id: 'fixedPeriod', label: '整改完成', value: '36', group: '隐患闭环', type: '期间', periods: ['今日','本周','本月','本季','本年'], desc: '统计周期内完成整改闭环的隐患数量' },
        { id: 'fixedCum', label: '累计整改完成', value: '1906', group: '隐患闭环', type: '累计', desc: '从年初到当前累计完成整改闭环的隐患数量' },
        { id: 'rectifyRate', label: '隐患整改率', value: '77.7%', group: '隐患闭环', type: '闭环率', periods: ['本月','本季','本年'], desc: '统计周期内隐患整改闭环的比例' },
        // 重大隐患
        { id: 'majorNew', label: '新增重大隐患', value: '2', group: '重大隐患', type: '期间', periods: ['今日','本周','本月','本季','本年'] },
        { id: 'majorCum', label: '累计重大隐患', value: '12', group: '重大隐患', type: '累计' },
        { id: 'majorOpen', label: '未闭环重大隐患', value: '5', group: '重大隐患', type: '时点' },
        { id: 'majorOverdue', label: '逾期未整改重大隐患', value: '2', group: '重大隐患', type: '时点' },
        { id: 'majorFixed', label: '重大隐患整改完成', value: '1', group: '重大隐患', type: '期间', periods: ['今日','本周','本月','本季','本年'] },
        { id: 'majorRectifyRate', label: '重大隐患整改率', value: '58.3%', group: '重大隐患', type: '闭环率', periods: ['本月','本季','本年'] },
        // 风险分类
        { id: 'majorRisk', label: '重大风险', value: '' + majorRisk, group: '风险分类', type: '期间', periods: ['截至目前', '本月', '本季', '本年'], desc: '对公共安全构成直接重大威胁，需每月检查', valueColor: 'var(--red)' },
        { id: 'significantRisk', label: '较大风险', value: '' + significantRisk, group: '风险分类', type: '期间', periods: ['截至目前', '本月', '本季', '本年'], desc: '风险较高需要重点管控，需每季度检查', valueColor: '#d97706' },
        { id: 'generalRisk', label: '一般风险', value: '' + generalRisk, group: '风险分类', type: '期间', periods: ['截至目前', '本月', '本季', '本年'], desc: '常规风险正常管控，需每半年检查', valueColor: '#ca8a04' },
        { id: 'lowRisk', label: '低风险', value: '' + lowRisk, group: '风险分类', type: '期间', periods: ['截至目前', '本月', '本季', '本年'], desc: '风险较低维持日常巡查，抽样检查', valueColor: 'var(--blue)' },
        // 今日聚焦（站长每日必看）
        { id: 'dueToday', label: '到期整改事项', value: '3', group: '今日聚焦', type: '期间', periods: ['今日','本周','本月'], desc: '整改期限为今日且需要今日跟进的隐患或整改事项数量' },
        { id: 'abnormalSubject', label: '重点监管主体异常', value: '8', group: '今日聚焦', type: '时点', desc: '重点监管主体中存在风险上升、长期未登录、自查异常、隐患反复等异常的数量' },
        { id: 'taskCompleteRate', label: '检查任务完成率', value: '82%', group: '今日聚焦', type: '闭环率', periods: ['今日','本周','本月'], desc: '今日已完成检查任务占今日应完成检查任务的比例' },
        // 主体责任
        { id: 'riskUpSubjects', label: '风险上升主体数', value: '3', group: '主体责任', type: '期间', periods: ['今日','本周','本月'], desc: '统计周期内风险等级上升或风险指标明显变差的主体对象数量' },
        { id: 'selfCheckAbnormal', label: '自查异常主体数', value: '5', group: '主体责任', type: '时点', desc: '未按要求自查、长期不上报或自查质量异常的主体数量' },
        { id: 'selfCheckDiff', label: '自查与检查差异主体数', value: '8', group: '主体责任', type: '期间', periods: ['本周','本月','本季','本年'], desc: '企业自查隐患明显少于政府检查隐患的主体数量' },
        { id: 'repeatSubjects', label: '隐患反复主体数', value: '4', group: '主体责任', type: '期间', periods: ['本月','本季','本年','近30天'], desc: '反复出现同类隐患或整改后复发的主体对象数量' },
        // 履职效能
        { id: 'staffAbnormal', label: '一线履职异常数', value: '3', group: '履职效能', type: '期间', periods: ['今日','本周','本月'], desc: '任务完成率低、隐患发现率异常低、复查闭环慢的人员或小组数量' },
        { id: 'expertAbnormal', label: '专家履职异常数', value: '1', group: '履职效能', type: '期间', periods: ['本周','本月','本季','本年'], desc: '检查、重大隐患发现、复核销号等低于要求的专家数量' },
        // 区域风险
        { id: 'areaRiskAbnormal', label: '片区风险异常数', value: '2', group: '区域风险', type: '期间', periods: ['今日','本周','本月'], desc: '隐患、重大隐患、逾期事项明显高于基准或环比上升的片区数量' },
        // 风险结构
        { id: 'topHazardTypes', label: '高频隐患类型TOP', value: '3', group: '风险结构', type: '期间', periods: ['近7天','今日','本周','本月','本季','本年'], desc: '统计周期内出现频次最高的隐患类型排行' },
        // 专项任务
        { id: 'taskCompletionRate', label: '专项任务完成率', value: '63%', group: '专项任务', type: '闭环率', periods: ['本月','本季','本年'], desc: '某专项任务已完成量占计划量的比例' },
        { id: 'taskLagging', label: '专项任务滞后数', value: '2', group: '专项任务', type: '期间', periods: ['截至目前','本周','本月'], desc: '进度低于计划节奏的专项任务数量' },
        // 执法处置
        { id: 'penaltyCount', label: '立案处罚数', value: '3', group: '执法处置', type: '期间', periods: ['今日','本周','本月','本季','本年','累计'], desc: '统计周期内立案处罚的主体对象数量' },
        { id: 'rectifyOrderCount', label: '整改指令书下发数', value: '18', group: '执法处置', type: '期间', periods: ['今日','本周','本月','本季','本年','累计'], desc: '统计周期内下发整改指令书数量' }
      ];

      // 展开：每个期间指标按周期拆成独立卡片
      // 站长每日工作台默认 8 个指标
      var dailyDefaults = {
        majorOpen:1, majorOverdue:1, 'majorNew_今日':1,
        openHazard:1, 'dueToday_今日':1,
        unclosedCount:1, abnormalSubject:1, 'taskCompleteRate_今日':1,
        'majorRisk_截至目前':1, 'significantRisk_截至目前':1, 'generalRisk_截至目前':1, 'lowRisk_截至目前':1
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
              desc: bm.desc || ''
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
            desc: bm.desc || ''
          });
        }
      }

      // 检测存储版本，不匹配则重置（指标结构变了）
      var STORAGE_VERSION = 2;
      if (localStorage.getItem('yaq_metric_ver') != STORAGE_VERSION) {
        localStorage.removeItem('yaq_metric_prefs');
        localStorage.removeItem('yaq_metric_order');
        localStorage.removeItem('yaq_metric_ver');
        metricPrefs = null;
      }
      for (var mi = 0; mi < allMetrics.length; mi++) {
        var m = allMetrics[mi];
        m.checked = metricPrefs ? (metricPrefs[m.id] !== false) : !!dailyDefaults[m.id];
      }
      window.__allMetrics = allMetrics;
      // 加载排序
      var savedOrder = JSON.parse(localStorage.getItem('yaq_metric_order') || 'null');
      window.__metricOrder = savedOrder || allMetrics.filter(function(m) { return m.checked; }).map(function(m) { return m.id; });
      // 写入版本号
      if (!metricPrefs) localStorage.setItem('yaq_metric_ver', STORAGE_VERSION);

      html += '<div class="info-card" id="situationCard">' +
        '<div class="info-card-head">' +
          '<h3><i data-lucide="activity" aria-hidden="true" style="color:var(--accent)"></i> 整体安全态势</h3>' +
          '<div style="position:relative">' +
            '<button class="metric-config-btn" onclick="openMetricConfig()" title="配置指标"><i data-lucide="sliders-horizontal" width="15" height="15"></i></button>' +
          '</div>' +
        '</div>' +
        '<div class="metric-row" id="metricRow">' +
          renderSelectedMetrics(allMetrics) +
        '</div>' +
      '</div>';

      // ─── 纵向：关键风险 + 核心任务 ────────────────────────────
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
      for (var si = 0; si < majorHazards.length; si++) {
        if (majorHazards[si].status === '超期未整改') overdueCount++;
        else if (majorHazards[si].status === '已完成') doneCount++;
      }

      html +=
      '<div class="info-card">' +
        '<div class="info-card-head">' +
          '<h3><i data-lucide="shield-alert" aria-hidden="true" style="color:var(--red)"></i> 关键风险闭环</h3>' +
          '<div style="display:flex;gap:10px;font-size:11px">' +
            '<span style="color:var(--weak)">本月 <strong style="color:var(--text)">' + totalMajor + '</strong> 个重大隐患</span>' +
            '<span style="color:var(--weak)">超期未整改 <strong style="color:var(--red)">' + overdueCount + '</strong></span>' +
            '<span style="color:var(--weak)">已完成 <strong style="color:var(--green)">' + doneCount + '</strong></span>' +
          '</div>' +
        '</div>' +
        '<div class="hc-scroll">';
      for (var hi = 0; hi < majorHazards.length; hi++) {
        var h = majorHazards[hi];
        var overdueLabel = h.overdue > 0 ? '<span style="color:var(--red);font-weight:600">逾期 ' + h.overdue + ' 天</span>' : '<span style="color:var(--weak)">—</span>';
        html += '<div class="hazard-card" style="flex:0 0 270px;min-width:250px;cursor:pointer" onclick="openHazardDetail(\'' + h.object + '\')" title="点击查看详情">' +
          '<div class="hc-head">' +
            '<span class="hc-name">' + h.object + '</span>' +
          '</div>' +
          '<div class="hc-desc">' + h.hazard + '</div>' +
          '<div class="hc-meta">' +
            '<span>来源 ' + h.source + '</span>' +
            '<span class="hc-status ' + h.statusCls + '">' + h.status + '</span>' +
            '<span>逾期 ' + (h.overdue > 0 ? h.overdue + '天' : '—') + '</span>' +
          '</div>' +
          '<div class="hc-time">' + h.foundDate + ' → ' + h.deadline + '</div>' +
          '<div class="hc-actions">' +
            (h.status === '已完成' ?
              '<button class="hc-btn" onclick="showToast(\'复查记录已提交\')"><i data-lucide="check-circle" width="11" height="11"></i> 复查确认</button>' +
              '<button class="hc-btn" onclick="openHazardDetail(\'' + h.object + '\')"><i data-lucide="file-text" width="11" height="11"></i> 查看详情</button>'
            :
              '<button class="hc-btn" onclick="openDrawer(\'supervise\')"><i data-lucide="megaphone" width="11" height="11"></i> 督办</button>' +
              '<button class="hc-btn" onclick="openDrawer(\'inspect\')"><i data-lucide="search" width="11" height="11"></i> 现场核查</button>' +
              '<button class="hc-btn" onclick="showToast(\'已加入持续跟踪\')"><i data-lucide="pin" width="11" height="11"></i> 跟踪</button>'
            ) +
          '</div>' +
        '</div>';
      }
      html += '</div></div>';

      // ─── 板块三：核心任务进展 ──────────────────────────────────
      var tasks = MOCK.tasks;
      var lagCount = 0;
      for (var ti = 0; ti < tasks.length; ti++) { if (tasks[ti].lag) lagCount++; }
      html +=
      '<div class="info-card">' +
        '<div class="info-card-head">' +
          '<h3><i data-lucide="target" aria-hidden="true" style="color:var(--accent)"></i> 核心任务进展</h3>' +
          '<span class="info-card-badge warning">' + lagCount + ' 项滞后</span>' +
        '</div>' +
        '<div style="padding:0">' +
        '<table style="width:100%;border-collapse:collapse;font-size:11px">' +
        '<thead><tr style="border-bottom:1px solid var(--border);background:var(--fg-soft)">' +
          '<th style="padding:7px 10px;text-align:left;font-weight:500;color:var(--weak);font-size:9px">任务名称</th>' +
          '<th style="padding:7px 10px;text-align:center;font-weight:500;color:var(--weak);font-size:9px;width:60px">类型</th>' +
          '<th style="padding:7px 10px;text-align:center;font-weight:500;color:var(--weak);font-size:9px;width:60px">完成进度</th>' +
          '<th style="padding:7px 10px;text-align:center;font-weight:500;color:var(--weak);font-size:9px;width:60px">时间进度</th>' +
          '<th style="padding:7px 10px;text-align:center;font-weight:500;color:var(--weak);font-size:9px;width:50px">完成率</th>' +
          '<th style="padding:7px 10px;text-align:center;font-weight:500;color:var(--weak);font-size:9px;width:50px">覆盖</th>' +
          '<th style="padding:7px 10px;text-align:center;font-weight:500;color:var(--weak);font-size:9px;white-space:nowrap;width:85px">隐患总数/重大</th>' +
          '<th style="padding:7px 10px;text-align:right;font-weight:500;color:var(--weak);font-size:9px;width:78px">开始时间</th>' +
          '<th style="padding:7px 10px;text-align:right;font-weight:500;color:var(--weak);font-size:9px;width:78px">结束时间</th>' +
          '<th style="padding:7px 10px;text-align:right;font-weight:500;color:var(--weak);font-size:9px;width:50px">创建</th>' +
        '</tr></thead><tbody>';
      // 专项任务在上，日常任务在下
      var taskTypes = ['专项', '日常'];
      for (var tt = 0; tt < taskTypes.length; tt++) {
        for (var ti = 0; ti < tasks.length; ti++) {
          var t = tasks[ti];
          if (t.type !== taskTypes[tt]) continue;
          var riskColor = t.risk === '重大风险' ? 'var(--red)' : '#d97706';
          var rateNum = parseInt(t.rate) || 0;
          var colorBar = t.lag ? riskColor : (rateNum >= 90 ? 'var(--green)' : rateNum >= 70 ? '#d97706' : riskColor);
          html += '<tr style="border-bottom:1px solid var(--border)">' +
            '<td style="padding:7px 10px;font-weight:500;color:var(--text);max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + t.name + '</td>' +
            '<td style="padding:7px 10px;text-align:center;white-space:nowrap"><span style="font-size:10px;font-weight:600;color:' + (t.type === '日常' ? '#98a2b3' : 'var(--blue)') + '">' + (t.type === '日常' ? '日常任务' : '专项任务') + '</span></td>' +
            '<td style="padding:7px 10px;text-align:center"><div style="display:flex;align-items:center;justify-content:center;gap:3px"><div style="width:28px;height:4px;border-radius:999px;background:#f0f2f5;overflow:hidden;flex-shrink:0"><div style="width:' + rateNum + '%;height:100%;border-radius:999px;background:' + colorBar + '"></div></div><span style="font-size:11px;font-weight:600;color:' + colorBar + '">' + t.rate + '</span></div></td>' +
            '<td style="padding:7px 10px;text-align:center"><div style="display:flex;align-items:center;justify-content:center;gap:3px"><div style="width:28px;height:4px;border-radius:999px;background:#f0f2f5;overflow:hidden;flex-shrink:0"><div style="width:' + (parseInt(t.progress) || 0) + '%;height:100%;border-radius:999px;background:#98a2b3"></div></div><span style="font-size:11px;font-weight:600;color:#98a2b3">' + (t.progress || '-') + '</span></div></td>' +
            '<td style="padding:7px 10px;text-align:center;font-weight:700;color:' + colorBar + '">' + t.rate + '</td>' +
            '<td style="padding:7px 10px;text-align:center;font-weight:600;color:var(--text)">' + t.covered + '</td>' +
            '<td style="padding:7px 10px;text-align:center"><span style="font-weight:600">' + t.hazards + '</span><span style="color:var(--weak);margin:0 1px">/</span><span style="font-weight:600;color:var(--red)">' + t.majorHazards + '</span></td>' +
            '<td style="padding:7px 10px;text-align:right;font-size:10px;color:var(--weak);white-space:nowrap">' + t.startDate + '</td>' +
            '<td style="padding:7px 10px;text-align:right;font-size:10px;color:var(--weak);white-space:nowrap">' + t.endDate + '</td>' +
            '<td style="padding:7px 10px;text-align:right;font-size:10px;color:var(--weak);white-space:nowrap">' + t.creator + '</td>' +
          '</tr>';
        }
      }
      html += '</tbody></table></div>';
      html += '</div>';

      // ─── 主体责任落实情况 ────────────────────────────────────────
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
        var selfCheckRate = Math.round((total - noSelfCheck) / total * 100);
        var trainingRate = Math.round((total - trainingLow) / total * 100);
        var drillOk = total - noDrill;
        var drillRate = Math.round(drillOk / total * 100);
        // 计算自查-政府检查差异，按差异排序
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
              '<td style="padding:4px 6px;font-weight:500"><span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:' + gRisk + ';margin-right:4px;vertical-align:middle"></span>' + g.name + '</td>' +
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
        html += sectionHtml;
      })();

      return html;
    }

    function renderPriorityItem(item) {
      var actionsHtml = '';
      for (var ai = 0; ai < item.actions.length; ai++) {
        var cls = ai === 0 ? 'primary' : '';
        actionsHtml += '<button class="pi-action-btn ' + cls + '" data-pi-action="' + item.actions[ai] + '" data-pi-id="' + item.id + '"><i data-lucide="' + getActionIcon(item.actions[ai]) + '" aria-hidden="true"></i> ' + item.actions[ai] + '</button>';
      }
      return '<div class="priority-item level-' + item.level + '" data-pi-id="' + item.id + '">' +
        '<div class="pi-left"><span class="pi-index">#' + item.index + '</span><span class="pi-tag ' + item.level + '">' + item.tag + '</span></div>' +
        '<div class="pi-body"><div class="pi-title">' + item.title + '</div>' +
        '<div class="pi-detail"><span><i data-lucide="clock" aria-hidden="true"></i>' + item.detail.split('·').join('</span><span><i data-lucide="user" aria-hidden="true"></i>') + '</span></div>' +
        '<div class="pi-actions">' + actionsHtml + '</div></div></div>';
    }

    function getActionIcon(name) {
      var map = { '督办': 'megaphone', '现场核查': 'search', '会议议题': 'calendar', '跟踪': 'pin', '提醒履职': 'bell' };
      return map[name] || 'chevron-right';
    }

    function countByLevel(arr, level) {
      var c = 0;
      for (var i = 0; i < arr.length; i++) { if (arr[i].level === level) c++; }
      return c;
    }

    // ─── Hazard Report ───────────────────────────────────────────────

    function renderHazardReport() {
      var h = MOCK.hazards;

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
        rows += '<tr><td>' + h[i].object + '</td><td>' + h[i].hazard + '</td><td>' + h[i].region + '</td>' +
          '<td><span class="ht-status ' + h[i].prevStatusCls + '" style="font-size:10px">' + h[i].prevStatus + '</span></td>' +
          '<td><span class="ht-status ' + h[i].statusCls + '">' + h[i].status + '</span>' +
            '<div style="margin-top:2px">' + statusChange(h[i].prevStatus, h[i].status, h[i].prevStatusCls, h[i].statusCls) + '</div></td>' +
          '<td>' + h[i].person + '</td>' +
          '<td><div class="ht-actions"><button class="ht-action-btn primary" title="督办" onclick="openDrawer(\'supervise\')"><i data-lucide="megaphone" aria-hidden="true"></i></button><button class="ht-action-btn" title="现场核查" onclick="openDrawer(\'inspect\')"><i data-lucide="search" aria-hidden="true"></i></button><button class="ht-action-btn" title="会议议题" onclick="openDrawer(\'meeting\')"><i data-lucide="calendar" aria-hidden="true"></i></button><button class="ht-action-btn" title="持续跟踪" onclick="showToast(\'已加入持续跟踪\')"><i data-lucide="pin" aria-hidden="true"></i></button></div></td></tr>';
      }

      // 隐患回头看
      var reviewItems = '';
      for (var ri = 0; ri < h.length; ri++) {
        if (h[ri].statusCls === 'danger' || h[ri].statusCls === 'warning') {
          reviewItems += '<div class="info-list-item"><div class="il-left"><i data-lucide="alert-circle" aria-hidden="true" style="color:' + (h[ri].statusCls === 'danger' ? 'var(--red)' : 'var(--orange)') + '"></i>' +
            '<span class="il-label"><strong>' + h[ri].object + '</strong> · ' + h[ri].hazard + '</span></div></div>' +
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
      var cardsHtml = '';
      for (var gi = 0; gi < e.groups.length; gi++) {
        var g = e.groups[gi];
        var metricsHtml = '';
        var iconKeys = ['clipboard-check', 'search', 'alert-triangle', 'file-text', 'refresh-cw'];
        for (var mi = 0; mi < g.metrics.length; mi++) {
          metricsHtml += '<div class="eff-metric"><span class="eff-metric-label"><i data-lucide="' + (iconKeys[mi] || 'chevron-right') + '" aria-hidden="true"></i> ' + g.metrics[mi].label + '</span><span class="eff-metric-value ' + g.metrics[mi].cls + '">' + g.metrics[mi].value + '</span></div>';
        }
        cardsHtml += '<div class="eff-card">' +
          '<div class="eff-head"><h3><i data-lucide="' + g.icon + '" aria-hidden="true"></i> ' + g.name + '</h3><span class="eff-status ' + g.status + '">' + (g.status === 'danger' ? '需关注' : '异常') + '</span></div>' +
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
      var rows = '';
      for (var i = 0; i < MOCK.subjects.length; i++) {
        var s = MOCK.subjects[i];
        var riskLabel = s.risk === 'high' ? '高度关注' : s.risk === 'mid' ? '需关注' : '观察';
        rows += '<tr><td>' + s.name + '</td><td>' + s.selfCheck + '</td><td>' + s.govCheck + '</td><td>' + s.training + '</td><td>' + s.drill + '</td><td><span class="st-risk ' + s.risk + '">' + riskLabel + '</span></td><td style="font-size:12px;color:var(--accent);font-weight:500;cursor:pointer" onclick="showToast(\'已记录建议：' + s.suggest + '\')">' + s.suggest + '</td></tr>';
      }

      return '' +
        '<div class="section-head" style="margin-bottom:0"><h2><i data-lucide="users" aria-hidden="true" style="color:var(--accent)"></i> 主体责任判断矩阵</h2></div>' +
        '<div class="matrix-grid">' +
          '<div class="matrix-card"><div class="matrix-card-icon green"><i data-lucide="check-circle-2" aria-hidden="true"></i></div><div class="matrix-card-title">主体责任较主动</div><div class="matrix-card-desc">自查多，政府检查少，安全管理较到位</div></div>' +
          '<div class="matrix-card"><div class="matrix-card-icon red"><i data-lucide="alert-triangle" aria-hidden="true"></i></div><div class="matrix-card-title">疑似敷衍自查</div><div class="matrix-card-desc">自查为 0，政府检查发现多项隐患</div></div>' +
          '<div class="matrix-card"><div class="matrix-card-icon orange"><i data-lucide="trending-down" aria-hidden="true"></i></div><div class="matrix-card-title">管理能力不足</div><div class="matrix-card-desc">培训低，隐患反复，安全投入不足</div></div>' +
          '<div class="matrix-card"><div class="matrix-card-icon neutral"><i data-lucide="log-out" aria-hidden="true"></i></div><div class="matrix-card-title">触达失败</div><div class="matrix-card-desc">平台长期不登录，需要培训或依法督促</div></div>' +
        '</div>' +

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

      var html = '<div class="section-head" style="margin-bottom:0"><h2><i data-lucide="git-branch" aria-hidden="true" style="color:var(--accent)"></i> 分级处置闭环</h2></div>';

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

    // ════════════════════════════════════════════════════════════════
    // DRAWER
    // ════════════════════════════════════════════════════════════════

    var drawerContent = {
      briefing: {
        title: '生成站长简报',
        sections: [
          { label: '今日判断', value: '总体平稳可控，但重大隐患闭环压力上升。今日需优先处理 2 项已超期重大隐患，随后核查高层小区专项任务滞后原因，并关注 8 家主体对象自查与政府检查不匹配。' },
          { label: '主要依据', value: '新增隐患 12 项（较日均+20%）；村社履职率 76%（目标 80%）；主体责任异常 8 家；重大未闭环 5 项，其中超期 2 项。' },
          { label: '优先动作', value: '1. 确认北苑商业综合体、云栖高层住宅整改方案\n2. 核查高层小区消防专项滞后原因\n3. 安排恒源化工、鑫盛机械主体责任约谈' },
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
          { label: '建议决策', value: '1. 明确重大隐患整改责任人和完成时限\n2. 同意将恒源化工、鑫盛机械等纳入 C 类重点监管\n3. 启动电动自行车违规停放专项整治' },
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
          { label: '提醒事由', value: '东兴机械自查缺失+培训不足、云栖高层住宅消防设施失效，需相关责任人员现场核查隐患整改进展。' },
          { label: '提醒方式', value: '系统自动发送浙政钉通知 + 短信提醒至以下角色：\n• 应消站值班人员\n• 区域站负责人\n• 第三方安全专家\n• 属地村社负责人' },
          { label: '跟踪要求', value: '请于 2 个工作日内反馈现场核查结果。若本周内无反馈，将升级为站长督办事项。' }
        ]
      },
    };

    function openDrawer(action) {
      var content = drawerContent[action];
      if (!content) return;

      document.getElementById('drawerTitle').innerHTML = '<i data-lucide="' + getDrawerIcon(action) + '" aria-hidden="true"></i> ' + content.title;

      var bodyHtml = '';
      for (var i = 0; i < content.sections.length; i++) {
        var sec = content.sections[i];
        bodyHtml += '<div class="drawer-section"><div class="drawer-section-label">' + sec.label + '</div><div class="drawer-section-value">' + sec.value.replace(/\n/g, '<br>') + '</div></div>';
        if (i < content.sections.length - 1) bodyHtml += '<div class="drawer-divider"></div>';
      }
      document.getElementById('drawerBody').innerHTML = bodyHtml;
      lucide.createIcons();

      document.getElementById('drawerPanel').classList.add('open');
      document.getElementById('drawerOverlay').classList.add('open');
    }

    function closeDrawer() {
      document.getElementById('drawerPanel').classList.remove('open');
      document.getElementById('drawerOverlay').classList.remove('open');
    }

    function getDrawerIcon(action) {
      var map = { briefing: 'file-text', supervise: 'megaphone', meeting: 'calendar', inspect: 'search', remind: 'bell' };
      return map[action] || 'file-text';
    }

    // ════════════════════════════════════════════════════════════════
    // TOAST
    // ════════════════════════════════════════════════════════════════

    function showToast(msg) {
      var el = document.getElementById('toast');
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(function() { el.classList.remove('show'); }, 2500);
    }

    // ════════════════════════════════════════════════════════════════
    // HAZARD DETAIL
    // ════════════════════════════════════════════════════════════════

    function openHazardDetail(objectName) {
      var arr = window.__majorHazards || [];
      var h = null;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].object === objectName) { h = arr[i]; break; }
      }
      if (!h) { showToast('未找到隐患数据'); return; }

      var dotColor = h.level.indexOf('重大') > -1 ? 'var(--red)' : '#d97706';
      document.getElementById('hazardModalName').textContent = h.object;
      document.getElementById('hazardModalDot').style.background = dotColor;

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
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span style="color:var(--weak)">对象</span> ' + h.object + '</div>' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span style="color:var(--weak)">责任人</span> ' + (h.person || '—') + '</div>' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span style="color:var(--weak)">发现</span> ' + (h.discoverer || '—') + ' / ' + h.foundDate + '</div>' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span style="color:var(--weak)">期限</span> ' + h.deadline + '</div>' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span style="color:var(--weak)">来源</span> ' + h.source + '</div>' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span style="color:var(--weak)">片区</span> ' + (h.region || '—') + '</div>' +
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
      document.getElementById('hazardModalBody').innerHTML = bodyHtml;

      document.getElementById('hazardModalOverlay').style.display = 'block';
      document.getElementById('hazardModal').style.display = 'flex';
    }

    function closeHazardModal() {
      document.getElementById('hazardModalOverlay').style.display = 'none';
      document.getElementById('hazardModal').style.display = 'none';
    }
    window.openHazardDetail = openHazardDetail;
    window.closeHazardModal = closeHazardModal;

    function toggleRegulation() {
      var body = document.getElementById('regulationBody');
      var arrow = document.getElementById('regArrow');
      if (!body) return;
      var isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      arrow.textContent = isOpen ? '▶' : '▼';
    }
    window.toggleRegulation = toggleRegulation;

    // ════════════════════════════════════════════════════════════════
    // SCENE SWITCHING
    // ════════════════════════════════════════════════════════════════

    function switchScene(sceneId) {
      if (sceneId === state.activeScene) return;
      state.activeScene = sceneId;

      var ws = document.getElementById('workspace');
      ws.classList.add('scanning');

      // 同步左栏场景高亮
      document.querySelectorAll('.nav-item[data-scene]').forEach(function(n) {
        n.classList.toggle('active', n.getAttribute('data-scene') === sceneId);
      });

      // 同步右栏场景提示
      var chatBody = document.getElementById('chatBody');
      var sceneNames = { dashboard: '📊 今日监管工作台', 'hazard-report': '⚠ 重大隐患整改日报', efficiency: '📈 履职效能分析', responsibility: '👥 主体责任评估', disposal: '🔁 分级处置闭环' };

      setTimeout(function() {
        renderScene(sceneId);
        ws.classList.remove('scanning');

        // AI 对话追加系统消息
        var name = sceneNames[sceneId] || sceneId;
        chatBody.innerHTML += '<div class="msg agent"><div class="bubble">已切换到「' + name + '」，你需要关注什么？</div></div>';
        chatBody.scrollTop = chatBody.scrollHeight;

        showToast('已切换至「' + name + '」');
      }, 250);
    }

    // ════════════════════════════════════════════════════════════════
    // BIND INTERACTIONS
    // ════════════════════════════════════════════════════════════════

    function bindInteractions() {
      // 左栏侧边导航点击
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

      // 右栏 Tab 切换
      document.querySelectorAll('.tab[data-tab]').forEach(function(tab) {
        tab.addEventListener('click', function() {
          document.querySelectorAll('.tab[data-tab]').forEach(function(t) { t.classList.remove('active'); });
          this.classList.add('active');
          var tabName = this.getAttribute('data-tab');
          document.getElementById('chatTab').style.display = tabName === 'chat' ? 'flex' : 'none';
          document.getElementById('configTab').style.display = tabName === 'config' ? 'block' : 'none';
        });
      });

      // Drawer overlay close
      document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);
      document.getElementById('drawerClose').addEventListener('click', closeDrawer);
      document.getElementById('drawerCancel').addEventListener('click', closeDrawer);

      // Drawer confirm
      document.getElementById('drawerConfirm').addEventListener('click', function() {
        closeDrawer();
        showToast('已生成，可继续编辑');
      });

      // Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          if (document.getElementById('drawerPanel').classList.contains('open')) {
            closeDrawer();
          }
        }
      });

      // Priority item action buttons (delegated)
      document.getElementById('sceneContent').addEventListener('click', function(e) {
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
      var chatBody = document.getElementById('chatBody');
      var sceneNames = { dashboard: '📊 今日监管工作台', 'hazard-report': '⚠ 重大隐患整改日报', efficiency: '📈 履职效能分析', responsibility: '👥 主体责任评估', disposal: '🔁 分级处置闭环' };
      var name = sceneNames[sceneId] || sceneId;

      // 用户消息
      chatBody.innerHTML += '<div class="msg user"><div class="bubble">我想看「' + name + '」</div></div>';
      chatBody.scrollTop = chatBody.scrollHeight;

      // 切换到对应场景
      switchScene(sceneId);
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
        html += '<div class="metric-card" data-desc="' + (m.desc || '') + '" onmouseenter="showMetricTip(event,this.getAttribute(\'data-desc\'))" onmouseleave="hideMetricTip()">' +
          '<div class="mc-value"' + (m.valueColor ? ' style="color:' + m.valueColor + '"' : '') + '>' + m.value + '</div>' +
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
      var input = document.getElementById('metricSearchInput');
      if (input) input.value = '';
      document.getElementById('metricModalOverlay').style.display = 'block';
      document.getElementById('metricModal').style.display = 'flex';
      renderMetricCheckboxes();
      lucide.createIcons();
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
      document.getElementById('metricModalOverlay').style.display = 'none';
      document.getElementById('metricModal').style.display = 'none';
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
      document.getElementById('metricFilterTabs').innerHTML = filterHtml;

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
          html += '<div class="metric-card' + (m.checked ? ' mc-active' : ' mc-dim') + '" data-id="' + m.id + '" onclick="toggleMiniCard(this)" data-desc="' + (m.desc || '') + '" onmouseenter="showMetricTip(event,this.getAttribute(\'data-desc\'))" onmouseleave="hideMetricTip()">' +
            '<span class="mc-checkmark"><i data-lucide="check" width="10" height="10"></i></span>' +
            '<div class="mc-value"' + (m.valueColor ? ' style="color:' + m.valueColor + '"' : '') + '>' + m.value + '</div>' +
            '<div class="mc-label">' + m.label + '</div>' +
            '<div class="mc-period ' + bCls + '">' + periodDisp2 + '</div>' +
          '</div>';
        }
        html += '</div>';
      }
      document.getElementById('metricCheckboxes').innerHTML = html || '<div style="text-align:center;padding:30px 0;color:var(--weak);font-size:13px">该分组暂无指标</div>';

      // 渲染已选指标列表（拖拽排序）
      renderSelectedMetricsList();

      // 更新已选计数
      var allMet = window.__allMetrics || [];
      var checkedCount = 0;
      for (var ci = 0; ci < allMet.length; ci++) {
        if (allMet[ci].checked) checkedCount++;
      }
      var countEl = document.getElementById('mfootCount');
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
        html += '<div class="metric-card sel-card-drag" draggable="true" data-id="' + m.id + '" ondragstart="onDragStart(event)" ondragover="onDragOver(event)" ondrop="onDrop(event)" ondragend="onDragEnd(event)" data-desc="' + (m.desc || '') + '" onmouseenter="showMetricTip(event,this.getAttribute(\'data-desc\'))" onmouseleave="hideMetricTip()">' +
          '<span class="sel-hover-remove" onclick="event.stopPropagation();removeSelected(\'' + m.id + '\')"><i data-lucide="x" width="10" height="10"></i></span>' +
          '<div class="mc-value"' + (m.valueColor ? ' style="color:' + m.valueColor + '"' : '') + '>' + m.value + '</div>' +
          '<div class="mc-label">' + m.label + '</div>' +
          '<div class="mc-period ' + bCls + '">' + periodDisp + '</div>' +
        '</div>';
      }
      document.getElementById('selectedMetricsList').innerHTML = html;
      lucide.createIcons();
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
      var input = document.getElementById('metricSearchInput');
      window.__metricSearch = input ? input.value : '';
      renderMetricCheckboxes();
    }

    // ─── 指标说明浮层 ─────────────────────────────────────────────
    function showMetricTip(e, text) {
      if (!text) return;
      var tip = document.getElementById('metricTip');
      tip.textContent = text;
      tip.classList.add('show');
      // 更新位置跟随鼠标
      function moveTip(ev) {
        var x = ev.clientX + 14;
        var y = ev.clientY + 10;
        if (x + tip.offsetWidth > window.innerWidth - 8) x = ev.clientX - tip.offsetWidth - 14;
        if (y + tip.offsetHeight > window.innerHeight - 8) y = ev.clientY - tip.offsetHeight - 10;
        tip.style.left = x + 'px';
        tip.style.top = y + 'px';
      }
      moveTip(e);
      tip._moveHandler = moveTip;
      document.addEventListener('mousemove', moveTip);
    }

    function hideMetricTip() {
      var tip = document.getElementById('metricTip');
      if (tip._moveHandler) {
        document.removeEventListener('mousemove', tip._moveHandler);
        tip._moveHandler = null;
      }
      tip.classList.remove('show');
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
      localStorage.setItem('yaq_metric_prefs', JSON.stringify(prefs));
      // 保存排序
      if (window.__metricOrder) {
        localStorage.setItem('yaq_metric_order', JSON.stringify(window.__metricOrder));
      }
      localStorage.setItem('yaq_metric_ver', 2);
      closeMetricConfig();
      // 重新渲染当前场景
      var sceneId = state.activeScene;
      var container = document.getElementById('sceneContent');
      var html = '';
      switch (sceneId) {
        case 'dashboard': html = renderDashboard(); break;
        case 'hazard-report': html = renderHazardReport(); break;
        case 'efficiency': html = renderEfficiency(); break;
        case 'responsibility': html = renderResponsibility(); break;
        case 'disposal': html = renderDisposal(); break;
      }
      container.innerHTML = html;
      lucide.createIcons();
      showToast('指标配置已保存');
    }

    // ════════════════════════════════════════════════════════════════
    // 渲染左栏场景列表
    // ════════════════════════════════════════════════════════════════

    function renderSceneList() {
      var scenes = [
        { id: 'dashboard', name: '今日监管工作台', icon: 'layout-dashboard', badge: { cls: 'danger', text: '3' } },
        { id: 'hazard-report', name: '重大隐患整改日报', icon: 'shield-alert', badge: { cls: 'danger', text: '5' } },
        { id: 'efficiency', name: '履职效能分析', icon: 'bar-chart-3', badge: { cls: 'orange', text: '2' } },
        { id: 'responsibility', name: '主体责任评估', icon: 'users', badge: { cls: 'orange', text: '8' } },
        { id: 'disposal', name: '分级处置闭环', icon: 'git-branch', badge: null }
      ];
      var html = '';
      for (var i = 0; i < scenes.length; i++) {
        var s = scenes[i];
        var active = s.id === state.activeScene ? ' active' : '';
        html += '<div class="nav-item' + active + '" data-scene="' + s.id + '">' +
          '<i data-lucide="' + s.icon + '" aria-hidden="true"></i>' +
          '<span>' + s.name + '</span>';
        if (s.badge) {
          html += '<span class="badge ' + s.badge.cls + '">' + s.badge.text + '</span>';
        }
        html += '</div>';
      }
      document.getElementById('sceneList').innerHTML = html;
      lucide.createIcons();
    }

    // ════════════════════════════════════════════════════════════════
    // INIT
    // ════════════════════════════════════════════════════════════════

    // Date
    var now = new Date();
    var dateStr = now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日';
    var weekdays = ['日','一','二','三','四','五','六'];
    document.getElementById('topbarDate').textContent = dateStr + ' 星期' + weekdays[now.getDay()];

    // Expose for onclick handlers
    window.switchScene = switchScene;
    window.showToast = showToast;
    window.openDrawer = openDrawer;
    window.agentAsk = agentAsk;
    window.openMetricConfig = openMetricConfig;
    window.closeMetricConfig = closeMetricConfig;
    window.saveMetricConfig = saveMetricConfig;
    window.toggleMiniCard = toggleMiniCard;
    window.cycleMetricPeriod = cycleMetricPeriod;
    window.setMetricFilter = setMetricFilter;
    window.setPeriodFilter = setPeriodFilter;
    window.onDragStart = onDragStart;
    window.onDragOver = onDragOver;
    window.onDrop = onDrop;
    window.onDragEnd = onDragEnd;
    window.removeSelected = removeSelected;
    window.onMetricSearch = onMetricSearch;
    window.showMetricTip = showMetricTip;
    window.hideMetricTip = hideMetricTip;

    // 渲染左栏场景列表
    renderSceneList();

    // Render default scene
    renderScene('dashboard');
    bindInteractions();

  })();
