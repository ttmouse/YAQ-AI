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
        { name: '今日到期整改事项跟进', line: '安全生产组', startDate: '2026-06-29', endDate: '2026-06-29', covered: 3, rate: '33%', progress: '100%', hazards: '-', majorHazards: '-', creator: '系统', region: '全片区', risk: '-', lag: true, type: '日常', priority: 1,
          desc: '今日有 3 项整改事项到期，涉及北苑商业综合体消防通道堵塞等，需逐项确认整改完成情况，未完成的立即转为督办。',
          person: '王志安', status: '滞后', statusCls: 'danger', relatedItems: ['北苑商业综合体 · 消防通道堵塞', '恒源化工 · 危化品标识缺失', '永固建材 · 培训到期'] },
        { name: '超期未整改对象督办', line: '安全生产组', startDate: '2026-06-22', endDate: '2026-06-29', covered: 2, rate: '0%', progress: '100%', hazards: 2, majorHazards: 2, creator: '系统', region: '良渚/五常', risk: '-', lag: true, type: '日常', priority: 2,
          desc: '2 家超期未整改对象（北苑商业综合体逾期 3 天、云栖高层住宅逾期 1 天），需站长督办。均已进行临时管控，但整改方案未正式提交。',
          person: '王志安 / 李明', status: '超期', statusCls: 'danger', relatedItems: ['北苑商业综合体 · 消防通道堵塞（逾期3天）', '云栖高层住宅 · 自动消防设施失效（逾期1天）'] },
        { name: '高层小区消防专项核查', line: '消防安全组', startDate: '2026-06-01', endDate: '2026-06-30', covered: 8, rate: '42%', progress: '100%', hazards: 3, majorHazards: 1, creator: '张毅', region: '全片区', risk: '-', lag: true, type: '日常', priority: 3,
          desc: '截至今日仅完成 42%（8/19），时间进度已达 100%，严重滞后 58pp。张毅条线主责，需排查是否存在其它任务挤占、人手不足或流程问题。',
          person: '张毅', status: '滞后', statusCls: 'danger', relatedItems: ['消防安全组 · 任务完成率 65%', '复查闭环率 68%'] },
        // 专项任务
        { name: '2026年第二季度良渚片重大风险检查任务', line: '企业安全组', startDate: '2026-04-01', endDate: '2026-06-30', covered: 141, rate: '0%', progress: '91%', hazards: '-', majorHazards: '-', creator: '范嘉杰', region: '良渚片', risk: '重大风险', lag: true, type: '专项',
          desc: '二季度重大风险检查覆盖 141 家单位，时间进度 91%（即将到期），但完成率为 0%，数据异常，需核实系统统计口径。',
          person: '范嘉杰', status: '異常', statusCls: 'warning', relatedItems: ['良渚片重大风险单位全覆盖检查'] },
        { name: '2026年01月-2026年06月物流片较大风险检查任务', line: '企业安全组', startDate: '2026-01-01', endDate: '2026-06-30', covered: 31, rate: '96%', progress: '100%', hazards: '-', majorHazards: '-', creator: '范嘉杰', region: '物流片', risk: '较大风险', lag: false, type: '专项',
          desc: '物流片较大风险检查覆盖 31 家单位，完成率 96%，接近尾声。剩余 1-2 家需在月底前完成收尾。',
          person: '范嘉杰', status: '正常推进', statusCls: 'stable', relatedItems: ['物流片较大风险单位全覆盖检查'] }
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
        { id: 'majorOpen', label: '未闭环重大隐患', value: '5', group: '重大隐患', type: '时点', alert: 'danger', desc: '截至当前仍未完成整改闭环的重大隐患数量', drilldown: [
            { name: '北苑商业综合体', line: '消防安全组', type: '消防通道堵塞', status: '超期', statusText: '超期未整改', statusCls: 'danger', detail: '消防通道被货架和杂物严重堵塞，宽度不足1.2米', person: '王志安', foundDate: '2026-06-10', deadline: '2026-06-22', overdue: 3, source: '日常巡查', region: '良渚街道' },
            { name: '云栖高层住宅', line: '消防安全组', type: '消防设施失效', status: '超期', statusText: '超期未整改', statusCls: 'danger', detail: '自动喷淋系统、烟感探测器大面积失效，覆盖18-25层', person: '李明', foundDate: '2026-06-15', deadline: '2026-06-24', overdue: 1, source: '专项检查', region: '五常街道' },
            { name: '恒源化工', line: '企业安全组', type: '危化品标识缺失', status: '整改中', statusText: '整改推进中', statusCls: 'warning', detail: '危化品存储区警示标识缺失，未设置临时围挡和出入登记', person: '李安全', foundDate: '2026-06-20', deadline: '2026-07-26', overdue: 0, source: '监督检查', region: '仓前街道' },
            { name: '鑫盛机械', line: '企业安全组', type: '自查缺失', status: '整改中', statusText: '整改推进中', statusCls: 'warning', detail: '近30天企业自查0次，政府检查发现隐患8项未整改', person: '张毅', foundDate: '2026-06-18', deadline: '2026-07-10', overdue: 0, source: '系统预警', region: '良渚街道' },
            { name: '天元纺织', line: '企业安全组', type: '异常叠加', status: '未启动', statusText: '尚未启动整改', statusCls: 'neutral', detail: '多项隐患叠加：疏散通道堵塞、灭火器过期、电气线路私拉乱接', person: '陈芳', foundDate: '2026-06-22', deadline: '2026-07-15', overdue: 0, source: '现场检查', region: '良渚街道' }
          ],
          aiAnalysis: [
            { label: '关联分析', text: '消防安全组2项超期（北苑商业综合体逾期3天、云栖高层住宅逾期1天），与该组"复查闭环率68%（↓6pp）"数据关联——复查环节效率不足。该组人均日处理量估算为4.2项，当前日均新增+待复查量约6.8项/人，人力已超饱和约62%。建议排查复查人力配置或抽查任务排序。' },
            { label: '交叉验证', text: '北苑商业综合体消防通道堵塞为反复出现项（本月已发生第3次），与"重点监管主体异常"中该主体的记录吻合。单一主体的反复问题需从管理机制入手，建议约谈物业管理方而非仅单次整改。' },
            { label: '特征分析', text: '企业安全组3项（恒源化工、鑫盛机械、天元纺织）均位于良渚片区，与"良渚片重大风险检查任务覆盖141家、完成率0%"数据吻合。同片区多家企业同时出问题，存在区域性风险集中特征。良渚片整体自查率仅43%，企业端配合度偏低。' }
          ] },
        { id: 'majorOverdue', label: '逾期未整改重大隐患', value: '2', group: '重大隐患', type: '时点', alert: 'danger', desc: '已过整改期限仍未完成整改的重大隐患', drilldown: [
            { name: '北苑商业综合体', line: '消防安全组', type: '消防通道堵塞', status: '超期', statusText: '超期未整改', statusCls: 'danger', detail: '消防通道被货架和杂物严重堵塞，逾期3天仍未清理', person: '王志安', foundDate: '2026-06-10', deadline: '2026-06-22', overdue: 3, source: '日常巡查', region: '良渚街道' },
            { name: '云栖高层住宅', line: '消防安全组', type: '消防设施失效', status: '超期', statusText: '超期未整改', statusCls: 'danger', detail: '自动消防设施大面积失效，逾期1天仍未启动维修', person: '李明', foundDate: '2026-06-15', deadline: '2026-06-24', overdue: 1, source: '专项检查', region: '五常街道' }
          ],
          aiAnalysis: [
            { label: '根因分析', text: '2项超期均属消防安全组，责任人分别为王志安（北苑）和李明（云栖）。该组复查闭环率仅68%，低于站均值6pp。超期项均为高层建筑/商业综合体，整改涉及物业、业主、消防维保多方协调，单人推动难度较大。' },
            { label: '关联分析', text: '云栖高层住宅的消防设施失效项，同期该小区企业自查记录为0次，企业端安全管理配合度存疑。建议联合物业约谈业主委员会，明确整改责任主体。' }
          ] },
        { id: 'majorFixed', label: '重大隐患整改完成', value: '1', group: '重大隐患', type: '期间', periods: ['今日','本周','本月','本季','本年'] },
        { id: 'majorRectifyRate', label: '重大隐患整改率', value: '58.3%', group: '重大隐患', type: '闭环率', periods: ['本月','本季','本年'] },
        // 风险分类
        { id: 'majorRisk', label: '重大风险', value: '' + majorRisk, group: '风险分类', type: '期间', periods: ['截至目前', '本月', '本季', '本年'], alert: 'danger', desc: '对公共安全构成直接重大威胁，需每月检查', valueColor: 'var(--red)' },
        { id: 'significantRisk', label: '较大风险', value: '' + significantRisk, group: '风险分类', type: '期间', periods: ['截至目前', '本月', '本季', '本年'], desc: '风险较高需要重点管控，需每季度检查', valueColor: '#d97706' },
        { id: 'generalRisk', label: '一般风险', value: '' + generalRisk, group: '风险分类', type: '期间', periods: ['截至目前', '本月', '本季', '本年'], desc: '常规风险正常管控，需每半年检查', valueColor: '#ca8a04' },
        { id: 'lowRisk', label: '低风险', value: '' + lowRisk, group: '风险分类', type: '期间', periods: ['截至目前', '本月', '本季', '本年'], desc: '风险较低维持日常巡查，抽样检查', valueColor: 'var(--blue)' },
        // 今日聚焦（站长每日必看）
        { id: 'dueToday', label: '到期整改事项', value: '3', group: '今日聚焦', type: '期间', periods: ['今日','本周','本月'], alert: 'warning', desc: '整改期限为今日且需要今日跟进的隐患或整改事项数量',
          compare: { baselineLabel: '昨日', baselineValue: '2', delta: '▲ 1', isBad: true },
          drilldown: [
            { name: '北苑商业综合体', line: '消防安全组', type: '整改确认', status: '今日到期', detail: '消防通道堵塞整改确认', region: '良渚街道' },
            { name: '恒源化工', line: '企业安全组', type: '整改验收', status: '今日到期', detail: '危化品标识整改验收', region: '仓前街道' },
            { name: '永固建材', line: '企业安全组', type: '培训整改', status: '今日到期', detail: '培训到期整改', region: '物流片' }
          ],
          aiAnalysis: [
            { label: '优先级建议', text: '3项均为今日到期，涉及3个责任主体。建议优先处理北苑商业综合体（消防通道堵塞）——该主体已有超期记录，若今日未完成将转为第2项超期，进一步拉低消防安全组指标。其次处理恒源化工（危化品标识验收），已有整改方案，验收通过概率较高。' },
            { label: '资源评估', text: '永固建材为培训到期整改，可由企业自行完成线上培训后提交凭证，无需现场核查，建议作为"自行整改"处理以减轻一线人力压力。' }
          ] },
        { id: 'abnormalSubject', label: '重点监管主体异常', value: '8', group: '今日聚焦', type: '时点', alert: 'danger', desc: '重点监管主体中存在风险上升、长期未登录、自查异常、隐患反复等异常的数量',
          drilldown: [
            { name: '恒源化工', line: '企业安全组', type: '风险上升', status: '超期', detail: '危化品隐患超期', region: '仓前街道' },
            { name: '鑫盛机械', line: '企业安全组', type: '自查缺失', status: '异常', detail: '自查0次+隐患8项', region: '良渚街道' },
            { name: '天元纺织', line: '企业安全组', type: '异常叠加', status: '异常', detail: '多项异常叠加', region: '良渚街道' },
            { name: '华阳包装', line: '企业安全组', type: '自查缺失', status: '异常', detail: '自查持续为0', region: '物流片' },
            { name: '东兴机械', line: '安全生产组', type: '培训缺失', status: '异常', detail: '培训不足+自查缺失', region: '良渚街道' },
            { name: '北苑商业综合体', line: '消防安全组', type: '隐患反复', status: '超期', detail: '消防通道反复堵塞', region: '良渚街道' },
            { name: '云栖高层住宅', line: '消防安全组', type: '设施失效', status: '超期', detail: '消防设施全面失效', region: '五常街道' },
            { name: '高层小区消防专项', line: '消防安全组', type: '进度滞后', status: '滞后', detail: '完成率仅42%', region: '全片区' }
          ],
          aiAnalysis: [
            { label: '特征分析', text: '8家异常主体中，5家属于企业安全组管辖的工贸企业（恒源化工、鑫盛机械、天元纺织、华阳包装、东兴机械），共性特征为"自查持续为0"。其中4家自查为0的同时培训完成率低于40%，企业安全主体责任落实存在系统性缺失。' },
            { label: '关联分析', text: '自查缺失的企业——鑫盛机械、东兴机械、华阳包装——同期政府检查隐患数分别为8项、5项、4项。自查0 vs 政府查出一大堆，"自查与检查差异"显著，企业可能是在敷衍自查或根本未开展。建议安排专项抽查核实。' },
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
        { id: 'areaRiskAbnormal', label: '片区风险异常数', value: '2', group: '区域风险', type: '期间', periods: ['今日','本周','本月'], alert: 'warning', desc: '隐患、重大隐患、逾期事项明显高于基准或环比上升的片区数量' },
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

      // 统计异常/预警指标数
      var dangerCount = 0, warningCount = 0;
      for (var mi = 0; mi < allMetrics.length; mi++) {
        if (allMetrics[mi].checked && allMetrics[mi].alert === 'danger') dangerCount++;
        else if (allMetrics[mi].checked && allMetrics[mi].alert === 'warning') warningCount++;
      }

      // AI 解读文案
      var summaryText = '';
      if (dangerCount + warningCount > 0) {
        var parts = [];
        if (dangerCount > 0) parts.push(dangerCount + ' 项异常');
        if (warningCount > 0) parts.push(warningCount + ' 项预警');
        summaryText = '今天有 ' + parts.join('、') + ' 需要关注。';
      } else {
        summaryText = '各项指标均正常，今天态势平稳。';
      }

      html += '<div class="info-card" id="situationCard">' +
        '<div class="info-card-head" style="flex-wrap:wrap;gap:0">' +
          '<h3><i data-lucide="activity" aria-hidden="true" style="color:var(--accent)"></i> 整体安全态势</h3>' +
          '<div style="position:relative;margin-left:auto">' +
            '<button class="metric-config-btn" onclick="openMetricConfig()" title="配置指标"><i data-lucide="sliders-horizontal" width="15" height="15"></i></button>' +
          '</div>' +
          '<div style="width:100%;font-size:12px;color:var(--muted);line-height:1.5;margin-top:2px">' + summaryText + '</div>' +
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
          if (overdueNames.length > 0) riskSummary += '——' + overdueNames.join('、');
        } else if (doneCount === totalMajor) {
          riskSummary = '本月 ' + totalMajor + ' 个重大隐患已全部完成整改闭环。';
        } else {
          riskSummary = '本月共 ' + totalMajor + ' 个重大隐患，已完成 ' + doneCount + ' 个，其余整改推进中。';
        }
      } else {
        riskSummary = '本月暂无重大隐患记录。';
      }

      html +=
      '<div class="info-card">' +
        '<div class="info-card-head" style="flex-wrap:wrap;gap:0">' +
          '<h3><i data-lucide="shield-alert" aria-hidden="true" style="color:var(--red)"></i> 关键风险闭环</h3>' +
          '<div style="margin-left:auto;display:flex;gap:10px;font-size:11px">' +
            '<span style="color:var(--weak)">本月 <strong style="color:var(--text)">' + totalMajor + '</strong> 个重大隐患</span>' +
            '<span style="color:var(--weak)">超期未整改 <strong style="color:var(--red)">' + overdueCount + '</strong></span>' +
            '<span style="color:var(--weak)">已完成 <strong style="color:var(--green)">' + doneCount + '</strong></span>' +
          '</div>' +
          '<div style="width:100%;font-size:12px;color:var(--muted);line-height:1.5;margin-top:2px">' + riskSummary + '</div>' +
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
          '<th style="padding:7px 10px;text-align:center;font-weight:500;color:var(--weak);font-size:9px;width:60px">条线</th>' +
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
          var statusBadge = t.lag
            ? '<span class="hc-status ' + t.statusCls + '" style="display:inline-block;width:36px;text-align:center;font-size:10px;padding:1px 0">异常</span>'
            : '<span style="display:inline-block;width:36px"></span>';
          html += '<tr style="border-bottom:1px solid var(--border)">' +
            '<td style="padding:7px 10px;font-weight:500;color:var(--text);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + statusBadge + ' ' + t.name + '</td>' +
            '<td style="padding:7px 10px;text-align:center;white-space:nowrap"><span style="font-size:10px;font-weight:600;color:' + (t.type === '日常' ? '#98a2b3' : 'var(--blue)') + '">' + (t.type === '日常' ? '日常任务' : '专项任务') + '</span></td>' +
            '<td style="padding:7px 10px;text-align:center;font-size:10px;color:var(--muted);white-space:nowrap">' + (t.line || '—') + '</td>' +
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

      // ─── 规则引擎状态指示 ───────────────────────────────────
      if (typeof window.getRuleEngineSummary === 'function') {
        var ruleSummary = window.getRuleEngineSummary();
        if (ruleSummary) {
          var ruleColors = { danger: 'var(--red)', warning: '#d97706' };
          var dots = '';
          for (var rs = 0; rs < ruleSummary.alerts.length; rs++) {
            var a = ruleSummary.alerts[rs];
            dots += '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + (ruleColors[a.severity] || 'var(--weak)') + ';margin-right:3px" title="' + a.name + ': ' + a.count + ' 次命中"></span>';
          }
          html += '<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;margin-top:8px;font-size:11px;color:var(--weak);border:1px solid var(--line);border-radius:8px;background:#fafbfc">' +
            '<i data-lucide="settings-2" style="width:12px;height:12px;color:var(--muted)"></i>' +
            '<span>规则引擎</span>' +
            '<span style="display:flex;gap:1px">' + dots + '</span>' +
            '<span>' + ruleSummary.triggered + ' 条规则命中 · ' + ruleSummary.enabled + '/' + ruleSummary.total + ' 启用</span>' +
            '<a href="#" onclick="window.switchScene(\'rules\');return false" style="color:var(--blue);margin-left:auto;font-weight:500;border-bottom:1px dashed var(--blue)">管理规则 →</a>' +
            '</div>';
        }
      }

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
      // 恢复确认按钮默认文案
      document.getElementById('drawerConfirm').textContent = '确认生成';
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
      document.getElementById('drawerConfirm').textContent = '确认生成';
      document.getElementById('drawerCancel').style.display = '';
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
      window.__currentHazard = h;

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

    window.openHazardDetail = openHazardDetail;
    window.closeHazardModal = closeHazardModal;
    window.copyHazardInfo = copyHazardInfo;


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

      document.getElementById('drillTitle').innerHTML = '<i data-lucide="list" aria-hidden="true"></i> ' + label;

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
        listHtml += '<div class="drill-item" data-line="' + (it.line || '其他') + '" onclick="openHazardDetail(\'' + it.name.replace(/'/g, "\\'") + '\')" title="点击查看详情" style="cursor:pointer">' +
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

      document.getElementById('drillBody').innerHTML = listHtml + aiHtml;

      // 条线筛选
      var filterEl = document.getElementById('drillFilter');
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

      lucide.createIcons();

      document.getElementById('drillFloat').classList.add('open');
      document.getElementById('drillOverlay').classList.add('open');
    }

    function closeDrillFloat() {
      document.getElementById('drillFloat').classList.remove('open');
      document.getElementById('drillOverlay').classList.remove('open');
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

      var conv = document.getElementById('drillAiConv');
      if (!conv) return;

      // 用户消息
      conv.innerHTML += '<div class="dmsg user"><div class="dmsg-bubble">' + q + '</div></div>';
      conv.scrollTop = conv.scrollHeight;

      // 生成上下文相关的 mock 回答
      var answer = generateAIAnswer(q, label, items, aiItems);

      // 模拟 AI 思考延迟
      setTimeout(function() {
        conv.innerHTML += '<div class="dmsg agent"><div class="dmsg-bubble">' + answer + '</div></div>';
        conv.scrollTop = conv.scrollHeight;
        lucide.createIcons();
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
          '<br><br>建议：对长期不配合的企业（如北苑商业综合体、天元纺织），升级为站长约谈或联合执法，避免单个主体拖累整体指标。';
      }

      if (ql.indexOf('怎么') > -1 || ql.indexOf('建议') > -1 || ql.indexOf('解决') > -1 || ql.indexOf('措施') > -1) {
        // 措施建议
        var sug = [];
        if (lineNames.indexOf('消防安全组') > -1) {
          sug.push('• 消防安全组：优先清理北苑商业综合体（超期最久，逾期3天）和云栖高层住宅，建议今日安排现场核查。同时排查复查人力饱和度问题，必要时申请临时增援。');
        }
        if (lineNames.indexOf('企业安全组') > -1) {
          sug.push('• 企业安全组：恒源化工已有整改方案建议加快审批，鑫盛机械和天元纺织需从企业端推动——建议通知属地村社协助督促。');
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
      var body = document.getElementById('regulationBody');
      var arrow = document.getElementById('regArrow');
      if (!body) return;
      var isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      arrow.textContent = isOpen ? '▶' : '▼';
    }
    window.toggleRegulation = toggleRegulation;

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

      document.getElementById('drawerTitle').innerHTML = '<i data-lucide="target" aria-hidden="true"></i> ' + task.name;

      var rateNum = parseInt(task.rate) || 0;
      var statusCls = task.statusCls || 'neutral';
      var riskColor = task.risk === '重大风险' ? 'var(--red)' : task.risk === '较大风险' ? '#d97706' : 'var(--muted)';

      var bodyHtml = '';

      // 状态 + 进度
      bodyHtml += '<div class="task-detail-section">' +
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
        bodyHtml += '<div class="task-detail-section">' +
          '<div class="task-detail-label">任务说明</div>' +
          '<div class="task-detail-value">' + task.desc + '</div>' +
        '</div>';
      }

      // 基本信息表
      bodyHtml += '<div class="task-detail-section">' +
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
      bodyHtml += '<div class="task-detail-section">' +
        '<div class="task-detail-label">覆盖统计</div>' +
        '<table class="task-detail-table">' +
          '<tr><td>已覆盖</td><td>' + task.covered + ' 家</td></tr>' +
          '<tr><td>隐患总数</td><td>' + (task.hazards !== '-' ? task.hazards : '—') + ' 项</td></tr>' +
          '<tr><td>重大隐患</td><td>' + (task.majorHazards !== '-' ? task.majorHazards : '—') + ' 项</td></tr>' +
        '</table>' +
      '</div>';

      // 关联事项
      if (task.relatedItems && task.relatedItems.length > 0) {
        bodyHtml += '<div class="task-detail-section">' +
          '<div class="task-detail-label">关联事项</div>';
        for (var ri = 0; ri < task.relatedItems.length; ri++) {
          bodyHtml += '<div class="td-related-item"><i data-lucide="chevron-right" width="12" height="12"></i>' + task.relatedItems[ri] + '</div>';
        }
        bodyHtml += '</div>';
      }

      document.getElementById('drawerBody').innerHTML = bodyHtml;
      // 只保留"知道了"按钮
      document.getElementById('drawerConfirm').textContent = '知道了';
      document.getElementById('drawerCancel').style.display = 'none';
      lucide.createIcons();

      document.getElementById('drawerPanel').classList.add('open');
      document.getElementById('drawerOverlay').classList.add('open');
    }

    window.openTaskDetail = openTaskDetail;

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
      // 同步系统导航高亮
      document.querySelectorAll('.nav-item[data-page]').forEach(function(n) {
        n.classList.toggle('active', n.getAttribute('data-page') === sceneId);
      });

      // 同步右栏场景提示
      var chatBody = document.getElementById('chatBody');
      var sceneNames = { dashboard: '📊 今日监管工作台', 'hazard-report': '⚠ 重大隐患整改日报', efficiency: '📈 履职效能分析', responsibility: '👥 主体责任评估', disposal: '🔁 分级处置闭环' };

      setTimeout(function() {
        // 规则管理页特殊处理
        if (sceneId === 'rules') {
          if (window.renderRulesPage) window.renderRulesPage();
          ws.classList.remove('scanning');
          var name = '⚙ 规则引擎';
          chatBody.innerHTML += '<div class="msg agent"><div class="bubble">已切换到「' + name + '」，你可以在这里配置异常判定规则，或直接告诉 AI 你想加的规则。</div></div>';
          chatBody.scrollTop = chatBody.scrollHeight;
          showToast('已切换至「规则引擎」');
          return;
        }

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
        var alertCls2 = m.alert ? ' alert-' + m.alert : '';
        html += '<div class="metric-card sel-card-drag' + alertCls2 + '" draggable="true" data-id="' + m.id + '" ondragstart="onDragStart(event)" ondragover="onDragOver(event)" ondrop="onDrop(event)" ondragend="onDragEnd(event)" data-desc="' + (m.desc || '') + '" onmouseenter="showMetricTip(event,this.getAttribute(\'data-desc\'))" onmouseleave="hideMetricTip()">' +
          (m.alert === 'danger' ? '<span class="mc-alert-badge">异常</span>' : (m.alert === 'warning' ? '<span class="mc-alert-badge">预警</span>' : '')) +
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
    var _tipHideTimer = null;

    function showMetricTip(e, arg) {
      if (!arg) return;
      var tip = document.getElementById('metricTip');
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
      lucide.createIcons();

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
        var tip = document.getElementById('metricTip');
        doHideTip(tip);
      }, 250);
    }

    function doHideTip(tip) {
      if (!tip) tip = document.getElementById('metricTip');
      tip.onmouseenter = null;
      tip.onmouseleave = null;
      tip.classList.remove('show');
    }

    function copyTipContent(e) {
      if (e) e.stopPropagation();
      var tip = document.getElementById('metricTip');
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

      var text = parts.join('\n\n');
      if (!text) return;
      fallbackCopy(text);
    }

    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      ta.style.pointerEvents = 'none';
      ta.style.left = '0';
      ta.style.top = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        var ok = document.execCommand('copy');
        if (ok) showToast('已复制到剪贴板');
        else showToast('按 Ctrl+C 复制');
      } catch(e) {
        showToast('按 Ctrl+C 复制');
      }
      document.body.removeChild(ta);
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
    // 启动台 · 站点地图
    // ════════════════════════════════════════════════════════════════

    var LAUNCHER_DATA = [
      {
        title: '站长工作台', apps: [
          { id: 'dashboard', name: '今日监管工作台', icon: 'layout-dashboard', desc: '整体安全态势' },
          { id: 'hazard-report', name: '重大隐患整改日报', icon: 'shield-alert', desc: '隐患闭环跟踪' },
          { id: 'efficiency', name: '履职效能分析', icon: 'bar-chart-3', desc: '条线绩效评估' },
          { id: 'responsibility', name: '主体责任评估', icon: 'users', desc: '企业风险分级' },
          { id: 'disposal', name: '分级处置闭环', icon: 'git-branch', desc: '内部/外部处置' }
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
      return JSON.parse(localStorage.getItem('yaq_v4_launcher_favs') || '[]');
    }

    function toggleFavorite(id) {
      var favs = getFavorites();
      var idx = favs.indexOf(id);
      if (idx > -1) { favs.splice(idx, 1); }
      else { favs.push(id); }
      localStorage.setItem('yaq_v4_launcher_favs', JSON.stringify(favs));
      renderLauncher();
    }

    window.toggleFavorite = toggleFavorite;

    // ════════════════════════════════════════════════════════════════
    // 最近使用
    // ════════════════════════════════════════════════════════════════

    function recordRecent(id) {
      var recent = JSON.parse(localStorage.getItem('yaq_v4_launcher_recent') || '[]');
      // 移除重复
      for (var i = 0; i < recent.length; i++) {
        if (recent[i].id === id) { recent.splice(i, 1); break; }
      }
      recent.unshift({ id: id, time: Date.now() });
      // 只保留最近 20 条
      if (recent.length > 20) recent.length = 20;
      localStorage.setItem('yaq_v4_launcher_recent', JSON.stringify(recent));
    }

    function getRecentApps(allApps, excludeIds) {
      var recent = JSON.parse(localStorage.getItem('yaq_v4_launcher_recent') || '[]');
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
    // 渲染启动台
    // ════════════════════════════════════════════════════════════════

    function renderLauncher() {
      var query = (document.getElementById('launcherSearch').value || '').trim().toLowerCase();
      var favs = getFavorites();
      var html = '';

      // 收集所有 app 的扁平列表（用于搜索匹配 + 收藏组）
      var allApps = [];
      for (var gi = 0; gi < LAUNCHER_DATA.length; gi++) {
        for (var ai = 0; ai < LAUNCHER_DATA[gi].apps.length; ai++) {
          var a = LAUNCHER_DATA[gi].apps[ai];
          allApps.push(a);
        }
      }

      // ─── 常用功能（仅非搜索时展示） ─────────────────────────
      if (!query && favs.length > 0) {
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

      // ─── 最近使用（仅非搜索时展示，排除已收藏） ────────────
      if (!query) {
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
      }

      // ─── 分类分组 ─────────────────────────────────────────────
      for (var gi = 0; gi < LAUNCHER_DATA.length; gi++) {
        var group = LAUNCHER_DATA[gi];
        var filtered = [];
        for (var ai = 0; ai < group.apps.length; ai++) {
          var a = group.apps[ai];
          if (!query || a.name.indexOf(query) > -1 || (a.desc && a.desc.indexOf(query) > -1)) {
            filtered.push(a);
          }
        }
        if (filtered.length === 0) continue;

        html += '<div class="launcher-group">' +
          '<div class="launcher-group-head">' +
            '<span class="launcher-group-title">' + group.title + '</span>' +
            '<span class="launcher-group-count">' + filtered.length + '</span>' +
            '<span class="lgh-line"></span>' +
          '</div>' +
          '<div class="launcher-grid">';
        for (var aj = 0; aj < filtered.length; aj++) {
          html += buildLauncherItem(filtered[aj], false);
        }
        html += '</div></div>';
      }

      if (!html) {
        html = '<div class="launcher-empty">未找到匹配的功能</div>';
      }
      document.getElementById('launcherBody').innerHTML = html;
      lucide.createIcons();
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
      var panel = document.getElementById('launcherPanel');
      var overlay = document.getElementById('launcherOverlay');
      var isOpen = panel.classList.contains('open');
      if (isOpen) {
        closeLauncher();
      } else {
        openLauncher();
      }
    }

    function openLauncher() {
      document.getElementById('launcherPanel').classList.add('open');
      document.getElementById('launcherOverlay').classList.add('open');
      document.getElementById('launcherSearch').value = '';
      renderLauncher();
      setTimeout(function() {
        document.getElementById('launcherSearch').focus();
      }, 100);
    }

    function closeLauncher() {
      document.getElementById('launcherPanel').classList.remove('open');
      document.getElementById('launcherOverlay').classList.remove('open');
    }

    function onLauncherSearch() {
      renderLauncher();
    }

    function launcherSearchFirst() {
      var first = document.querySelector('.launcher-item:first-child');
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
        'hazard-report': 'hazard-report',
        'efficiency': 'efficiency',
        'responsibility': 'responsibility',
        'disposal': 'disposal',
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
        if (window.openMetricConfig) window.openMetricConfig();
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
        var panel = document.getElementById('launcherPanel');
        if (panel && panel.classList.contains('open')) {
          closeLauncher();
        } else {
          openLauncher();
        }
      }
      // Escape 关闭启动台
      if (e.key === 'Escape') {
        var panel = document.getElementById('launcherPanel');
        if (panel && panel.classList.contains('open')) {
          closeLauncher();
          return;
        }
      }
    });

    // 暴露全局函数
    window.toggleLauncher = toggleLauncher;
    window.openLauncher = openLauncher;
    window.closeLauncher = closeLauncher;
    window.onLauncherSearch = onLauncherSearch;
    window.launcherSearchFirst = launcherSearchFirst;
    window.launcherGo = launcherGo;

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

      // 分隔线 + 系统管理
      html += '<div class="nav-divider"></div>';
      var rulesActive = state.activeScene === 'rules' ? ' active' : '';
      html += '<div class="nav-item' + rulesActive + '" data-page="rules">' +
        '<i data-lucide="settings-2" aria-hidden="true"></i>' +
        '<span>规则管理</span>' +
        '<span class="badge gray" style="font-size:9px;padding:1px 5px">引擎</span>' +
        '</div>';

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
    window.openMetricDrilldown = openMetricDrilldown;
    window.closeDrillFloat = closeDrillFloat;
    window.askAI = askAI;
    window.copyTipContent = copyTipContent;

    // 渲染左栏场景列表
    renderSceneList();

    // Render default scene
    renderScene('dashboard');
    bindInteractions();

  })();
