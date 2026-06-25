/* ═══════════════════════════════════════════════════════════
   规则引擎 · 异常判定规则系统
   ═══════════════════════════════════════════════════════════
   设计理念：AI 配置优先，自然语言 → 结构化规则
   所有"什么是异常"的判定由这套引擎统一管理
   ═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── localStorage 封装：复用 app.js 中已定义的 YAQ.ls ─────
  var ls = (window.YAQ && window.YAQ.ls) || {
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

  // ═══════════════════════════════════════════════════════════
  // 规则维度定义
  // ═══════════════════════════════════════════════════════════

  var DIMENSIONS = [
    { id: 'metric',     label: '指标阈值', icon: 'gauge',         desc: '指标值超过/低于阈值时视为异常' },
    { id: 'timeout',    label: '时间超期', icon: 'clock',         desc: '超过规定时限未完成时视为异常' },
    { id: 'comparison', label: '对比类',   icon: 'bar-chart-3',   desc: '偏离同类/历史基线时视为异常' },
    { id: 'trend',      label: '趋势类',   icon: 'trending-up',   desc: '变化幅度超出预期范围时视为异常' },
    { id: 'behavior',   label: '行为模式', icon: 'eye',           desc: '行为特征符合异常模式时视为异常' },
    { id: 'composite',  label: '复合规则', icon: 'git-merge',     desc: '多条件组合判定' },
  ];

  // ═══════════════════════════════════════════════════════════
  // 规则模板 — AI 配置的解析模板库
  // ═══════════════════════════════════════════════════════════

  var AI_TEMPLATES = [
    {
      pattern: /(?:检查|任务|监管)(?:完成率|覆盖率|进度)\s*(?:低于|<|不到|不足)\s*(\d+)\s*%/,
      label: '检查完成率过低',
      build: function(m) { return {
        name: '检查完成率过低',
        dimension: 'metric',
        severity: 'danger',
        description: '当检查完成率低于 ' + m[1] + '% 时视为异常',
        condition: { type: 'threshold', params: { target: 'checkRate', operator: 'lt', value: parseInt(m[1]), unit: '%' } },
        effect: { markAlert: 'danger', generatePriority: true }
      };},
      example: '检查完成率低于 60%'
    },
    {
      pattern: /(?:隐患|问题)(?:新增|新发现)\s*(?:环比|较上期|相比)\s*(?:增长|上升|增加|↑)\s*(?:超过|大于|>)\s*(\d+)\s*%/,
      label: '隐患新增环比过高',
      build: function(m) { return {
        name: '隐患新增环比过高',
        dimension: 'trend',
        severity: 'warning',
        description: '当隐患新增量环比增长超过 ' + m[1] + '% 时触发预警',
        condition: { type: 'trend', params: { target: 'newHazard', operator: 'gt', value: parseInt(m[1]), unit: '%', period: '环比' } },
        effect: { markAlert: 'warning', generatePriority: true }
      };},
      example: '隐患新增环比增长超过 20%'
    },
    {
      pattern: /(?:连续|持续)\s*(\d+)\s*(?:天|日|周)\s*(?:未|没有|无)\s*(?:登录|自查|上报|打卡)/,
      label: '企业持续未登录/自查',
      build: function(m) { return {
        name: '企业持续未' + (m[2] || '登录'),
        dimension: 'behavior',
        severity: 'danger',
        description: '当企业连续 ' + m[1] + ' 天未登录系统时标记为异常',
        condition: { type: 'behavior', params: { target: 'enterpriseLogin', operator: 'gte', value: parseInt(m[1]), unit: '天', window: '连续' } },
        effect: { markAlert: 'danger', generatePriority: true }
      };},
      example: '企业连续30天未登录标记为危险'
    },
    {
      pattern: /(?:超期|逾期)\s*(?:超过|大于|>)\s*(\d+)\s*(?:天|日)/,
      label: '整改超期阈值',
      build: function(m) { return {
        name: '整改超期超过 ' + m[1] + ' 天',
        dimension: 'timeout',
        severity: 'danger',
        description: '当隐患整改超期超过 ' + m[1] + ' 天时升级为危险',
        condition: { type: 'timeWindow', params: { target: 'overdue', operator: 'gt', value: parseInt(m[1]), unit: '天' } },
        effect: { markAlert: 'danger', generatePriority: true }
      };},
      example: '超期超过3天标记为危险'
    },
    {
      pattern: /(?:低于|落后|差于)\s*(?:均值|平均|同类)\s*(?:超过|大于|>)\s*(\d+)\s*(?:%|pp)/,
      label: '低于同类均值',
      build: function(m) { return {
        name: '低于同类均值超过 ' + m[1] + '%',
        dimension: 'comparison',
        severity: 'warning',
        description: '当某条线指标低于同类均值 ' + m[1] + '% 以上时预警',
        condition: { type: 'comparison', params: { target: 'linePerformance', operator: 'lt', value: parseInt(m[1]), unit: '%', compareTo: 'peerAverage' } },
        effect: { markAlert: 'warning', generatePriority: false }
      };},
      example: '低于同类均值超过 15% 触发预警'
    },
    {
      pattern: /(?:重大|高风险)\s*(?:隐患|风险)\s*(?:超期|逾期)\s*(\d+)\s*(?:天|日)/,
      label: '重大隐患超期',
      build: function(m) { return {
        name: '重大隐患超期 ' + m[1] + ' 天',
        dimension: 'timeout',
        severity: 'danger',
        description: '重大隐患超期 ' + m[1] + ' 天自动标记为危险',
        condition: { type: 'timeWindow', params: { target: 'majorOverdue', operator: 'gte', value: parseInt(m[1]), unit: '天' } },
        effect: { markAlert: 'danger', generatePriority: true }
      };},
      example: '重大隐患超期1天标记为危险'
    },
    {
      pattern: /(?:自查|自检)\s*(?:率为|率)\s*0\s*(?:次|项|户)/,
      label: '自查缺失',
      build: function() { return {
        name: '企业自查持续缺失',
        dimension: 'behavior',
        severity: 'warning',
        description: '企业自查次数为 0 时触发预警',
        condition: { type: 'behavior', params: { target: 'selfCheck', operator: 'eq', value: 0, unit: '次', window: '本期' } },
        effect: { markAlert: 'warning', generatePriority: false }
      };},
      example: '自查率为 0 次的企业标记为预警'
    },
  ];

  // ═══════════════════════════════════════════════════════════
  // 初始规则集
  // ═══════════════════════════════════════════════════════════

  var defaultRules = [
    // ── 指标阈值 ──
    {
      id: 'rule-metric-completion',
      name: '检查完成率过低',
      dimension: 'metric',
      enabled: true,
      severity: 'danger',
      description: '当检查任务完成率低于 60% 时标记为异常',
      condition: { type: 'threshold', params: { target: 'checkRate', operator: 'lt', value: 60, unit: '%' } },
      effect: { markAlert: 'danger', generatePriority: true, label: '异常' },
      stats: { hitCount: 23, lastHit: '2025-07-21 09:15', recentHits: [
        { time: '2025-07-21 09:15', context: '今日监管工作台', detail: '检查任务完成率 48%' },
        { time: '2025-07-21 07:30', context: '今日监管工作台', detail: '检查任务完成率 52%' },
        { time: '2025-07-20 15:00', context: '履职效能分析', detail: '消防安全组完成率 65%' },
      ]},
    },
    {
      id: 'rule-metric-overdue',
      name: '隐患整改超期数过高',
      dimension: 'metric',
      enabled: true,
      severity: 'danger',
      description: '当隐患整改超期数量超过 5 项时标记为异常',
      condition: { type: 'threshold', params: { target: 'overdueCount', operator: 'gt', value: 5, unit: '项' } },
      effect: { markAlert: 'danger', generatePriority: true, label: '异常' },
      stats: { hitCount: 15, lastHit: '2025-07-21 09:15', recentHits: [
        { time: '2025-07-21 09:15', context: '今日监管工作台', detail: '超期 7 项' },
        { time: '2025-07-20 08:00', context: '今日监管工作台', detail: '超期 6 项' },
      ]},
    },
    {
      id: 'rule-metric-closure',
      name: '隐患关闭率低于目标',
      dimension: 'metric',
      enabled: true,
      severity: 'warning',
      description: '当隐患关闭率低于月度目标 95% 时标记为预警',
      condition: { type: 'threshold', params: { target: 'closureRate', operator: 'lt', value: 95, unit: '%' } },
      effect: { markAlert: 'warning', generatePriority: false, label: '预警' },
      stats: { hitCount: 18, lastHit: '2025-07-21 09:15', recentHits: [
        { time: '2025-07-21 09:15', context: '今日监管工作台', detail: '关闭率 91%' },
      ]},
    },
    {
      id: 'rule-metric-major-hazard',
      name: '重大隐患积压',
      dimension: 'metric',
      enabled: true,
      severity: 'danger',
      description: '当有未闭环重大隐患时标记为异常',
      condition: { type: 'threshold', params: { target: 'majorOpen', operator: 'gt', value: 0, unit: '项' } },
      effect: { markAlert: 'danger', generatePriority: true, label: '异常' },
      stats: { hitCount: 30, lastHit: '2025-07-21 09:15', recentHits: [
        { time: '2025-07-21 09:15', context: '今日监管工作台', detail: '未闭环重大隐患 2 项' },
      ]},
    },

    // ── 时间超期 ──
    {
      id: 'rule-timeout-general',
      name: '整改超期超过 3 天',
      dimension: 'timeout',
      enabled: true,
      severity: 'danger',
      description: '隐患整改超期超过 3 天时升级为危险标记',
      condition: { type: 'timeWindow', params: { target: 'overdue', operator: 'gt', value: 3, unit: '天' } },
      effect: { markAlert: 'danger', generatePriority: true, label: '超期' },
      stats: { hitCount: 8, lastHit: '2025-07-20 10:00', recentHits: [
        { time: '2025-07-20 10:00', context: '北苑商业综合体', detail: '超期 3 天' },
        { time: '2025-07-19 09:00', context: '云栖高层住宅', detail: '超期 1 天' },
      ]},
    },
    {
      id: 'rule-timeout-major',
      name: '重大隐患超期即时告警',
      dimension: 'timeout',
      enabled: true,
      severity: 'danger',
      description: '重大隐患一旦超期即标记为危险',
      condition: { type: 'timeWindow', params: { target: 'majorOverdue', operator: 'gte', value: 1, unit: '天' } },
      effect: { markAlert: 'danger', generatePriority: true, label: '超期' },
      stats: { hitCount: 5, lastHit: '2025-07-20 10:00', recentHits: [
        { time: '2025-07-20 10:00', context: '重大隐患整改日报', detail: '2 项重大隐患超期' },
      ]},
    },

    // ── 对比类 ──
    {
      id: 'rule-comp-line',
      name: '条线进度落后均值',
      dimension: 'comparison',
      enabled: true,
      severity: 'warning',
      description: '当某条线完成率低于全部条线均值 15% 时预警',
      condition: { type: 'comparison', params: { target: 'linePerformance', operator: 'lt', value: 15, unit: 'pp', compareTo: 'peerAverage' } },
      effect: { markAlert: 'warning', generatePriority: false, label: '偏低' },
      stats: { hitCount: 6, lastHit: '2025-07-20 14:00', recentHits: [
        { time: '2025-07-20 14:00', context: '履职效能分析', detail: '张毅条线低于均值 17%' },
      ]},
    },
    {
      id: 'rule-comp-self',
      name: '同类主体环比异常',
      dimension: 'comparison',
      enabled: false,
      severity: 'warning',
      description: '同类型企业隐患数高于同类均值 2 倍时预警',
      condition: { type: 'comparison', params: { target: 'enterpriseRisk', operator: 'gt', value: 200, unit: '%', compareTo: 'peerAverage' } },
      effect: { markAlert: 'warning', generatePriority: false, label: '偏高' },
      stats: { hitCount: 2, lastHit: '2025-07-18 09:00' },
    },

    // ── 趋势类 ──
    {
      id: 'rule-trend-new-hazard',
      name: '隐患新增环比增长过高',
      dimension: 'trend',
      enabled: true,
      severity: 'warning',
      description: '隐患新增量环比增长超过 20% 时触发预警',
      condition: { type: 'trend', params: { target: 'newHazard', operator: 'gt', value: 20, unit: '%', period: '环比' } },
      effect: { markAlert: 'warning', generatePriority: true, label: '上升' },
      stats: { hitCount: 7, lastHit: '2025-07-21 09:15', recentHits: [
        { time: '2025-07-21 09:15', context: '今日监管工作台', detail: '隐患新增 ↑28%' },
      ]},
    },
    {
      id: 'rule-trend-closure-drop',
      name: '复查闭环率连续下降',
      dimension: 'trend',
      enabled: false,
      severity: 'warning',
      description: '复查闭环率连续 2 周下降时预警',
      condition: { type: 'trend', params: { target: 'closureRate', operator: 'lt', value: 0, unit: '', period: '连续下降', consecutive: 2 } },
      effect: { markAlert: 'warning', generatePriority: false, label: '下滑' },
      stats: { hitCount: 0, lastHit: null },
    },

    // ── 行为模式 ──
    {
      id: 'rule-behavior-login',
      name: '企业连续未登录',
      dimension: 'behavior',
      enabled: true,
      severity: 'danger',
      description: '当企业连续 30 天未登录系统时标记为异常',
      condition: { type: 'behavior', params: { target: 'enterpriseLogin', operator: 'gte', value: 30, unit: '天', window: '连续' } },
      effect: { markAlert: 'danger', generatePriority: true, label: '失联' },
      stats: { hitCount: 3, lastHit: '2025-07-20 10:00', recentHits: [
        { time: '2025-07-20 10:00', context: '主体责任评估', detail: '恒源化工 32 天未登录' },
        { time: '2025-07-20 10:00', context: '主体责任评估', detail: '鑫盛机械 31 天未登录' },
        { time: '2025-07-19 09:00', context: '主体责任评估', detail: '宏达建材 30 天未登录' },
      ]},
    },
    {
      id: 'rule-behavior-selfcheck',
      name: '企业自查持续缺失',
      dimension: 'behavior',
      enabled: true,
      severity: 'warning',
      description: '企业自查持续为 0 时触发预警',
      condition: { type: 'behavior', params: { target: 'selfCheck', operator: 'eq', value: 0, unit: '次', window: '本期' } },
      effect: { markAlert: 'warning', generatePriority: false, label: '缺失' },
      stats: { hitCount: 12, lastHit: '2025-07-21 09:00', recentHits: [
        { time: '2025-07-21 09:00', context: '主体责任评估', detail: '5 家自查为 0' },
        { time: '2025-07-20 09:00', context: '主体责任评估', detail: '4 家自查为 0' },
      ]},
    },

    // ── 复合规则 ──
    {
      id: 'rule-compound-supervise',
      name: '超期 + 重大风险主体 → 督办',
      dimension: 'composite',
      enabled: true,
      severity: 'danger',
      description: '超期未整改且涉及重大风险主体时，自动升级为督办建议',
      condition: { type: 'composite', params: { rules: ['rule-timeout-general', 'rule-behavior-login'], logic: 'AND' } },
      effect: { markAlert: 'danger', generatePriority: true, generateSupervise: true, label: '督办' },
      stats: { hitCount: 4, lastHit: '2025-07-20 10:00', recentHits: [
        { time: '2025-07-20 10:00', context: '分级处置闭环', detail: '北苑商业综合体 · 超期 + 主体责任异常' },
      ]},
    },
  ];

  // ═══════════════════════════════════════════════════════════
  // 规则引擎状态
  // ═══════════════════════════════════════════════════════════

  var rules = [];
  var dimFilter = 'metric';
  var hitLogVisible = true;
  var aiInput = '';
  var aiSuggestions = [];
  var aiPreviewRule = null;
  var aiZoneVisible = false;   // AI 配置区默认收起
  var toasts = [];

  // ═══════════════════════════════════════════════════════════
  // 规则评估引擎
  // ═══════════════════════════════════════════════════════════

  // 获取当前 mock 数据作为评估上下文
  function getMockContext() {
    // 从 MOCK 数据中提取关键指标用于规则评估
    var ctx = {
      checkRate: 48,              // 模拟：检查任务完成率
      overdueCount: 7,            // 模拟：超期项数
      closureRate: 91,            // 模拟：关闭率
      majorOpen: 2,               // 模拟：未闭环重大隐患
      newHazard: 23,              // 模拟：新增隐患
      linePerformance: {          // 模拟：各条线
        avg: 72,                  // 全部条线均值
        lines: { '张毅条线': 48, '消防安全组': 65, '企业安全组': 78 }
      },
      enterpriseLogin: {          // 模拟：企业登录情况
        '恒源化工': 32, '鑫盛机械': 31, '宏达建材': 30,
        '东兴机械': 15, '华阳包装': 8
      },
      selfCheck: 5,               // 模拟：自查为0的企业数量
      overdue: 3,                 // 模拟：一般超期天数
      majorOverdue: 1,            // 模拟：重大隐患超期天数
      enterpriseRisk: {           // 模拟：企业风险对比
        '恒源化工': 220, '鑫盛机械': 180,
        peerAvg: 100
      },
    };
    return ctx;
  }

  // 评估单条规则
  function evaluateRule(rule, ctx) {
    if (!rule.enabled) return null;

    var p = rule.condition.params;
    var triggered = false;
    var detail = '';

    switch (rule.condition.type) {
      case 'threshold': {
        var actual = ctx[p.target];
        if (actual === undefined) return null;
        switch (p.operator) {
          case 'lt': triggered = actual < p.value; break;
          case 'gt': triggered = actual > p.value; break;
          case 'gte': triggered = actual >= p.value; break;
          case 'lte': triggered = actual <= p.value; break;
          case 'eq': triggered = actual === p.value; break;
        }
        if (triggered) detail = p.target + ' = ' + actual + p.unit + ' (阈值 ' + p.operator + ' ' + p.value + p.unit + ')';
        break;
      }
      case 'timeWindow': {
        var actual = ctx[p.target];
        if (actual === undefined) return null;
        switch (p.operator) {
          case 'gt': triggered = actual > p.value; break;
          case 'gte': triggered = actual >= p.value; break;
          case 'lt': triggered = actual < p.value; break;
        }
        if (triggered) detail = p.target + ' = ' + actual + p.unit + ' (阈值 ' + p.operator + ' ' + p.value + p.unit + ')';
        break;
      }
      case 'comparison': {
        var actual = ctx[p.target];
        if (!actual || typeof actual === 'number') return null;
        if (p.target === 'linePerformance') {
          var avg = actual.avg;
          var lines = actual.lines;
          for (var name in lines) {
            if (p.operator === 'lt' && (avg - lines[name]) > p.value) {
              triggered = true;
              detail = name + ' ' + lines[name] + '% 低于均值 ' + avg + '% 达 ' + (avg - lines[name]) + 'pp';
              break;
            }
          }
        } else if (p.target === 'enterpriseRisk') {
          triggered = true;
          detail = '高风险主体隐患密度高于均值';
        }
        break;
      }
      case 'trend': {
        var actual = ctx[p.target];
        if (actual === undefined) return null;
        if (p.target === 'newHazard') {
          var baseline = 18; // 模拟昨日新增
          var change = Math.round((actual - baseline) / baseline * 100);
          triggered = change > p.value;
          if (triggered) detail = '新增 ' + actual + ' 项 (↑' + change + '%), 阈值 ↑' + p.value + '%';
        } else if (p.target === 'closureRate') {
          triggered = actual < 95;
          if (triggered) detail = '关闭率 ' + actual + '%, 低于目标 95%';
        }
        break;
      }
      case 'behavior': {
        if (p.target === 'enterpriseLogin') {
          var logins = ctx.enterpriseLogin;
          for (var name in logins) {
            if (logins[name] >= p.value) {
              triggered = true;
              detail = name + ' ' + logins[name] + '天未登录';
              break;
            }
          }
        } else if (p.target === 'selfCheck') {
          triggered = ctx.selfCheck > 0;
          if (triggered) detail = '自查为 0 的企业 ' + ctx.selfCheck + ' 家';
        }
        break;
      }
      case 'composite': {
        var subRules = p.rules;
        var results = [];
        for (var i = 0; i < subRules.length; i++) {
          var sub = getRuleById(subRules[i]);
          if (sub) {
            var r = evaluateRule(sub, ctx);
            if (r) results.push(r.triggered);
          }
        }
        if (p.logic === 'AND') triggered = results.every(function(x) { return x; });
        else triggered = results.some(function(x) { return x; });
        if (triggered) detail = '复合条件满足 (' + p.rules.join(' + ') + ')';
        break;
      }
    }

    if (triggered) {
      return { rule: rule, triggered: true, detail: detail, time: getNow() };
    }
    return null;
  }

  // 评估所有规则（纯净版 — 不修改规则状态，仅返回评估结果）
  function evaluateAllRules() {
    var ctx = getMockContext();
    var results = [];
    for (var i = 0; i < rules.length; i++) {
      var r = evaluateRule(rules[i], ctx);
      if (r) {
        results.push(r);
      }
    }
    return results;
  }

  // 持久化单条规则评估结果（由调用方在需要时主动调用）
  function persistRuleEvaluation(ruleIdx, result) {
    rules[ruleIdx].stats.hitCount++;
    rules[ruleIdx].stats.lastHit = getNow();
    rules[ruleIdx].stats.recentHits.unshift({ time: getNow(), context: getTriggerContext(rules[ruleIdx]), detail: result.detail });
    if (rules[ruleIdx].stats.recentHits.length > 10) rules[ruleIdx].stats.recentHits.pop();
  }

  function getTriggerContext(rule) {
    var map = {
      'metric': '今日监管工作台',
      'timeout': '重大隐患整改日报',
      'comparison': '履职效能分析',
      'trend': '今日监管工作台',
      'behavior': '主体责任评估',
      'composite': '分级处置闭环',
    };
    return map[rule.dimension] || '系统';
  }

  function getRuleById(id) {
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].id === id) return rules[i];
    }
    return null;
  }

  function getNow() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  // ═══════════════════════════════════════════════════════════
  // AI 自然语言 → 规则解析
  // ═══════════════════════════════════════════════════════════

  function parseAIConfig(input) {
    var trimmed = input.trim();
    if (!trimmed) return null;

    // 按模板匹配
    for (var i = 0; i < AI_TEMPLATES.length; i++) {
      var tpl = AI_TEMPLATES[i];
      var m = trimmed.match(tpl.pattern);
      if (m) {
        var rule = tpl.build(m);
        rule.id = 'rule-ai-' + Date.now();
        return rule;
      }
    }

    // 无匹配 → 返回通用解析提示
    return null;
  }

  function getAIExamples() {
    var examples = [];
    for (var i = 0; i < AI_TEMPLATES.length; i++) {
      examples.push(AI_TEMPLATES[i].example);
    }
    return examples;
  }

  // ═══════════════════════════════════════════════════════════
  // 规则管理 UI 渲染
  // ═══════════════════════════════════════════════════════════

  function renderRulesPage() {
    // 评估规则（模拟数据）
    evaluateAllRules();

    var enabledCount = 0;
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].enabled) enabledCount++;
    }

    var html = '';
    html += '<div class="rules-page">';

    // ── 页头 ──
    html += '<div class="rules-header">';
    html += '  <h2><i data-lucide="settings-2" aria-hidden="true" style="color:var(--blue)"></i> 规则引擎</h2>';
    html += '  <div class="rules-summary">共 ' + rules.length + ' 条规则 · ' + enabledCount + ' 条启用 · 本日命中 ' + getTodayHitCount() + ' 次</div>';
    html += '</div>';

    // ── AI 配置区（默认收起） ──
    html += '<div class="rules-ai-zone' + (aiZoneVisible ? ' rules-ai-expanded' : '') + '">';
    html += '  <div class="rules-ai-header" onclick="window.toggleAiZone()">';
    html += '    <i data-lucide="sparkles" aria-hidden="true" style="color:#7c3aed"></i> <span>AI 配置规则</span>';
    html += '    <span class="rules-ai-toggle-icon"><i data-lucide="chevron-' + (aiZoneVisible ? 'up' : 'down') + '" aria-hidden="true"></i></span>';
    html += '  </div>';
    if (aiZoneVisible) {
      html += '  <div class="rules-ai-body">';
      html += '    <div class="rules-ai-input-row">';
      html += '      <input type="text" id="aiRuleInput" class="rules-ai-input" placeholder="说一句话就能配置规则，例如：企业连续30天未登录标记为危险" value="' + escHtml(aiInput) + '" onkeydown="if(event.key===\'Enter\')window.parseAiRule()" />';
      html += '      <button class="rules-ai-btn" onclick="window.parseAiRule()"><i data-lucide="wand-2" aria-hidden="true"></i> 解析</button>';
      html += '    </div>';
      html += '    <div class="rules-ai-hints">试试：';
      var examples = getAIExamples();
      for (var i = 0; i < Math.min(examples.length, 4); i++) {
        html += ' <span class="rules-ai-hint" onclick="document.getElementById(\'aiRuleInput\').value=this.textContent;window.parseAiRule()">' + escHtml(examples[i]) + '</span>';
        if (i < Math.min(examples.length, 4) - 1) html += ' · ';
      }
      html += '    </div>';

      // AI 预览区
      if (aiPreviewRule) {
        html += '<div class="rules-ai-preview">';
        html += '  <div class="rules-ai-preview-icon"><i data-lucide="brain" aria-hidden="true"></i></div>';
        html += '  <div class="rules-ai-preview-body">';
        html += '    <div class="rules-ai-preview-title">' + escHtml(aiPreviewRule.name) + '</div>';
        html += '    <div class="rules-ai-preview-desc">' + escHtml(aiPreviewRule.description) + '</div>';
        html += '    <div class="rules-ai-preview-meta">';
        html += '      <span class="badge-sev badge-' + aiPreviewRule.severity + '">' + severityLabel(aiPreviewRule.severity) + '</span>';
        html += '      <span class="badge-dim">' + getDimLabel(aiPreviewRule.dimension) + '</span>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="rules-ai-preview-actions">';
        html += '    <button class="rules-btn rules-btn-primary" onclick="window.confirmAiRule()"><i data-lucide="check" aria-hidden="true"></i> 确认添加</button>';
        html += '    <button class="rules-btn" onclick="window.dismissAiRule()"><i data-lucide="x" aria-hidden="true"></i> 取消</button>';
        html += '  </div>';
        html += '</div>';
      }
      html += '  </div>';
    }
    html += '</div>';

    // ── 规则列表：左侧维度标签 + 右侧规则卡片 ──
    html += '<div class="rules-body">';
    html += '  <div class="rules-sidebar" id="rulesSidebar">';
    for (var d = 0; d < DIMENSIONS.length; d++) {
      var dim = DIMENSIONS[d];
      var active = dim.id === dimFilter ? ' rules-dim-active' : '';
      var dimCount = countByDimension(dim.id);
      var dimEnabled = countEnabledByDimension(dim.id);
      html += '  <div class="rules-dim-item' + active + '" data-dim="' + dim.id + '" onclick="window.switchRulesDim(\'' + dim.id + '\')">';
      html += '    <i data-lucide="' + dim.icon + '" aria-hidden="true"></i>';
      html += '    <div class="rules-dim-info">';
      html += '      <div class="rules-dim-label">' + dim.label + '</div>';
      html += '      <div class="rules-dim-desc">' + dim.desc + '</div>';
      html += '    </div>';
      html += '    <div class="rules-dim-count">' + dimEnabled + '/' + dimCount + '</div>';
      html += '  </div>';
    }
    html += '  </div>';

    // 右侧规则卡片容器
    html += '  <div class="rules-list" id="rulesList">';
    html += '  </div>';
    html += '</div>';

    // ── 命中日志 ──
    html += '<div class="rules-log">';
    html += '  <div class="rules-log-header" onclick="window.toggleHitLog()">';
    html += '    <div class="rules-log-title"><i data-lucide="activity" aria-hidden="true"></i> 命中日志</div>';
    html += '    <div class="rules-log-toggle">' + (hitLogVisible ? '收起' : '展开') + ' <i data-lucide="chevron-' + (hitLogVisible ? 'up' : 'down') + '" aria-hidden="true"></i></div>';
    html += '  </div>';
    if (hitLogVisible) {
      html += '  <div class="rules-log-body" id="rulesLogBody">';
      var logEntries = getAllHitLogs();
      if (logEntries.length === 0) {
        html += '    <div class="rules-log-empty">暂无命中记录</div>';
      } else {
        for (var l = 0; l < Math.min(logEntries.length, 20); l++) {
          var entry = logEntries[l];
          html += '    <div class="rules-log-item">';
          html += '      <div class="rules-log-time">' + entry.time + '</div>';
          html += '      <div class="rules-log-sev"><span class="badge-sev badge-' + entry.severity + '">' + severityLabel(entry.severity) + '</span></div>';
          html += '      <div class="rules-log-name">' + escHtml(entry.name) + '</div>';
          html += '      <div class="rules-log-detail">' + escHtml(entry.detail) + '</div>';
          html += '      <div class="rules-log-context">' + escHtml(entry.context) + '</div>';
          html += '    </div>';
        }
      }
      html += '  </div>';
    }
    html += '</div>';

    html += '</div>'; // rules-page

    return html;
  }

  // 渲染单条规则卡片
  function renderRuleCard(rule) {
    var sevClass = 'sev-' + rule.severity;
    var html = '';
    html += '<div class="rules-card" id="rule-card-' + rule.id + '">';
    html += '  <div class="rules-card-top">';
    html += '    <div class="rules-card-info">';
    html += '      <div class="rules-card-name">' + escHtml(rule.name) + '</div>';
    html += '      <div class="rules-card-desc">' + escHtml(rule.description) + '</div>';
    html += '    </div>';
    html += '    <label class="rules-toggle">';
    html += '      <input type="checkbox" ' + (rule.enabled ? 'checked' : '') + ' onchange="window.toggleRule(\'' + rule.id + '\', this.checked)" />';
    html += '      <span class="rules-toggle-slider"></span>';
    html += '    </label>';
    html += '  </div>';
    html += '  <div class="rules-card-mid">';
    html += '    <div class="rules-card-tags">';
    html += '      <span class="badge-sev badge-' + rule.severity + '">' + severityLabel(rule.severity) + '</span>';
    html += '      <span class="badge-condition">' + conditionTypeLabel(rule.condition.type) + '</span>';
    html += '      <span class="badge-effect">' + effectLabel(rule.effect) + '</span>';
    html += '    </div>';
    html += '  </div>';
    html += '  <div class="rules-card-bottom">';
    html += '    <div class="rules-card-stats">';
    html += '      <span><i data-lucide="activity" aria-hidden="true" style="width:11px;height:11px"></i> 命中 ' + rule.stats.hitCount + ' 次</span>';
    html += '      <span><i data-lucide="clock" aria-hidden="true" style="width:11px;height:11px"></i> ' + (rule.stats.lastHit || '从未命中') + '</span>';
    html += '    </div>';
    html += '    <div class="rules-card-actions">';
    html += '      <button class="rules-btn rules-btn-xs" onclick="window.viewRuleDetail(\'' + rule.id + '\')"><i data-lucide="eye" aria-hidden="true"></i> 详情</button>';
    html += '    </div>';
    html += '  </div>';

    // 最近命中（折叠在卡片内）
    if (rule.stats.recentHits && rule.stats.recentHits.length > 0) {
      html += '  <div class="rules-card-hits">';
      html += '    <div class="rules-card-hits-title">最近命中</div>';
      for (var h = 0; h < Math.min(rule.stats.recentHits.length, 3); h++) {
        var hit = rule.stats.recentHits[h];
        html += '    <div class="rules-card-hit"><span class="rules-hit-time">' + hit.time + '</span> <span class="rules-hit-ctx">' + escHtml(hit.context) + '</span> <span class="rules-hit-detail">' + escHtml(hit.detail) + '</span></div>';
      }
      html += '  </div>';
    }

    html += '</div>';
    return html;
  }

  // ═══════════════════════════════════════════════════════════
  // 规则详情面板
  // ═══════════════════════════════════════════════════════════

  function viewRuleDetail(ruleId) {
    var rule = getRuleById(ruleId);
    if (!rule) return;

    var html = '';
    html += '<div class="rules-detail-overlay" onclick="window.closeRuleDetail()"></div>';
    html += '<div class="rules-detail-panel" id="rulesDetailPanel">';
    html += '  <div class="rules-detail-head">';
    html += '    <h3>' + escHtml(rule.name) + '</h3>';
    html += '    <button class="rules-detail-close" onclick="window.closeRuleDetail()"><i data-lucide="x" aria-hidden="true"></i></button>';
    html += '  </div>';
    html += '  <div class="rules-detail-body">';
    html += '    <div class="rules-detail-section">';
    html += '      <div class="rules-detail-section-title">基本信息</div>';
    html += '      <div class="rules-detail-grid">';
    html += '        <div class="rules-detail-field"><span class="rules-detail-label">描述</span><span>' + escHtml(rule.description) + '</span></div>';
    html += '        <div class="rules-detail-field"><span class="rules-detail-label">维度</span><span>' + getDimLabel(rule.dimension) + '</span></div>';
    html += '        <div class="rules-detail-field"><span class="rules-detail-label">严重等级</span><span class="badge-sev badge-' + rule.severity + '">' + severityLabel(rule.severity) + '</span></div>';
    html += '        <div class="rules-detail-field"><span class="rules-detail-label">当前状态</span><span>' + (rule.enabled ? '✅ 已启用' : '⛔ 已停用') + '</span></div>';
    html += '      </div>';
    html += '    </div>';
    html += '    <div class="rules-detail-section">';
    html += '      <div class="rules-detail-section-title">条件配置</div>';
    html += '      <div class="rules-detail-code">' + escHtml(JSON.stringify(rule.condition, null, 2)) + '</div>';
    html += '      <div class="rules-detail-tip">💡 你也可以对 AI 说：<strong>"修改此规则阈值到 80"</strong> 来调整</div>';
    html += '    </div>';
    html += '    <div class="rules-detail-section">';
    html += '      <div class="rules-detail-section-title">效果配置</div>';
    html += '      <div class="rules-detail-code">' + escHtml(JSON.stringify(rule.effect, null, 2)) + '</div>';
    html += '    </div>';
    html += '    <div class="rules-detail-section">';
    html += '      <div class="rules-detail-section-title">统计数据</div>';
    html += '      <div class="rules-detail-grid">';
    html += '        <div class="rules-detail-field"><span class="rules-detail-label">总命中次数</span><span>' + rule.stats.hitCount + ' 次</span></div>';
    html += '        <div class="rules-detail-field"><span class="rules-detail-label">最近命中</span><span>' + (rule.stats.lastHit || '无') + '</span></div>';
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    // 追加到 body
    var container = document.createElement('div');
    container.id = 'rulesDetailContainer';
    container.innerHTML = html;
    document.body.appendChild(container);
    lucide.createIcons({ container: container });
  }

  function closeRuleDetail() {
    var el = document.getElementById('rulesDetailContainer');
    if (el) el.remove();
  }

  // ═══════════════════════════════════════════════════════════
  // 操作函数
  // ═══════════════════════════════════════════════════════════

  function toggleRule(ruleId, enabled) {
    var rule = getRuleById(ruleId);
    if (rule) {
      rule.enabled = enabled;
      saveRules();
      showRulesToast((enabled ? '已启用' : '已停用') + '：' + rule.name);
    }
  }

  // 仅渲染规则卡片列表（不重绘整个页面）
  function renderRulesList() {
    var container = document.getElementById('rulesList');
    if (!container) return;
    var filteredRules = getRulesByDimension(dimFilter);
    var html = '';
    if (filteredRules.length === 0) {
      html += '<div class="rules-empty"><i data-lucide="file-text" aria-hidden="true" style="color:var(--weak);width:32px;height:32px;margin-bottom:8px"></i><div>暂无此维度规则</div><div class="rules-empty-hint">展开上方 AI 配置快速添加</div></div>';
    } else {
      for (var r = 0; r < filteredRules.length; r++) {
        html += renderRuleCard(filteredRules[r]);
      }
    }
    container.innerHTML = html;
    lucide.createIcons();
  }

  function switchRulesDim(dimId) {
    dimFilter = dimId;
    // 更新侧栏高亮
    var items = document.querySelectorAll('#rulesSidebar .rules-dim-item');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('rules-dim-active', items[i].getAttribute('data-dim') === dimId);
    }
    renderRulesList();
  }

  function parseAiRule() {
    var input = document.getElementById('aiRuleInput');
    if (!input) return;
    var text = input.value.trim();
    if (!text) { showRulesToast('请输入规则描述'); return; }

    var parsed = parseAIConfig(text);
    if (parsed) {
      aiPreviewRule = parsed;
      aiInput = text;
      // 移除已有的预览（如果有）
      var oldPreview = document.querySelector('.rules-ai-preview');
      if (oldPreview) oldPreview.remove();
      // 在提示语后面追加预览
      var hints = document.querySelector('.rules-ai-hints');
      if (hints) {
        var previewHtml = '<div class="rules-ai-preview">';
        previewHtml += '  <div class="rules-ai-preview-icon"><i data-lucide="brain" aria-hidden="true"></i></div>';
        previewHtml += '  <div class="rules-ai-preview-body">';
        previewHtml += '    <div class="rules-ai-preview-title">' + escHtml(aiPreviewRule.name) + '</div>';
        previewHtml += '    <div class="rules-ai-preview-desc">' + escHtml(aiPreviewRule.description) + '</div>';
        previewHtml += '    <div class="rules-ai-preview-meta">';
        previewHtml += '      <span class="badge-sev badge-' + aiPreviewRule.severity + '">' + severityLabel(aiPreviewRule.severity) + '</span>';
        previewHtml += '      <span class="badge-dim">' + getDimLabel(aiPreviewRule.dimension) + '</span>';
        previewHtml += '    </div>';
        previewHtml += '  </div>';
        previewHtml += '  <div class="rules-ai-preview-actions">';
        previewHtml += '    <button class="rules-btn rules-btn-primary" onclick="window.confirmAiRule()"><i data-lucide="check" aria-hidden="true"></i> 确认添加</button>';
        previewHtml += '    <button class="rules-btn" onclick="window.dismissAiRule()"><i data-lucide="x" aria-hidden="true"></i> 取消</button>';
        previewHtml += '  </div>';
        previewHtml += '</div>';
        hints.insertAdjacentHTML('afterend', previewHtml);
        lucide.createIcons();
      }
      showRulesToast('AI 已解析规则，请确认');
    } else {
      aiPreviewRule = null;
      aiInput = text;
      showRulesToast('未能理解，试试上面的范例格式');
    }
  }

  function confirmAiRule() {
    if (!aiPreviewRule) return;
    aiPreviewRule.id = 'rule-ai-' + Date.now();
    aiPreviewRule.stats = { hitCount: 0, lastHit: null, recentHits: [] };
    aiPreviewRule.enabled = true;
    rules.push(aiPreviewRule);
    aiPreviewRule = null;
    aiInput = '';
    // 移除预览
    var preview = document.querySelector('.rules-ai-preview');
    if (preview) preview.remove();
    // 清空输入框
    var input = document.getElementById('aiRuleInput');
    if (input) input.value = '';
    saveRules();
    showRulesToast('✅ 规则已添加，将在下一次评估中生效');
    // 立即评估一次
    var freshResults = evaluateAllRules();
    // 为新触发的规则持久化统计
    for (var ri = 0; ri < freshResults.length; ri++) {
      for (var rj = 0; rj < rules.length; rj++) {
        if (rules[rj].id === freshResults[ri].rule.id) {
          persistRuleEvaluation(rj, freshResults[ri]);
          break;
        }
      }
    }
    // 如果新规则属于当前维度，刷新规则列表
    var newRule = rules[rules.length - 1];
    if (newRule.dimension === dimFilter || dimFilter === 'all') {
      renderRulesList();
    }
    // 更新摘要计数
    updateSummaryCount();
  }

  function dismissAiRule() {
    aiPreviewRule = null;
    aiInput = '';
    // 更新 AI 配置区内预览区域
    var preview = document.querySelector('.rules-ai-preview');
    if (preview) preview.remove();
  }

  function toggleHitLog() {
    hitLogVisible = !hitLogVisible;
    var body = document.getElementById('rulesLogBody');
    var toggle = document.querySelector('.rules-log-toggle');
    if (!body || !toggle) return;
    if (hitLogVisible) {
      body.style.display = '';
      toggle.innerHTML = '收起 <i data-lucide="chevron-up" aria-hidden="true"></i>';
    } else {
      body.style.display = 'none';
      toggle.innerHTML = '展开 <i data-lucide="chevron-down" aria-hidden="true"></i>';
    }
    lucide.createIcons();
  }

  function toggleAiZone() {
    aiZoneVisible = !aiZoneVisible;
    var zone = document.querySelector('.rules-ai-zone');
    if (!zone) return;
    var bodyEl = zone.querySelector('.rules-ai-body');
    if (aiZoneVisible) {
      zone.classList.add('rules-ai-expanded');
      if (!bodyEl) {
        rebuildAiZoneBody(zone);
      } else {
        bodyEl.style.display = '';
      }
    } else {
      zone.classList.remove('rules-ai-expanded');
      if (bodyEl) bodyEl.style.display = 'none';
    }
    var icon = zone.querySelector('.rules-ai-toggle-icon');
    if (icon) icon.innerHTML = '<i data-lucide="chevron-' + (aiZoneVisible ? 'up' : 'down') + '" aria-hidden="true"></i>';
    lucide.createIcons();
  }

  function getTodayHitCount() {
    var today = new Date();
    var prefix = today.getFullYear() + '-' + pad(today.getMonth()+1) + '-' + pad(today.getDate());
    var count = 0;
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].stats.lastHit && rules[i].stats.lastHit.indexOf(prefix) >= 0) {
        count += rules[i].stats.hitCount;
      }
    }
    return count;
  }

  // 重建 AI 配置区展开内容
  function rebuildAiZoneBody(zone) {
    var bodyHtml = '<div class="rules-ai-body">';
    bodyHtml += '    <div class="rules-ai-input-row">';
    bodyHtml += '      <input type="text" id="aiRuleInput" class="rules-ai-input" placeholder="说一句话就能配置规则，例如：企业连续30天未登录标记为危险" value="' + escHtml(aiInput) + '" onkeydown="if(event.key===\'Enter\')window.parseAiRule()" />';
    bodyHtml += '      <button class="rules-ai-btn" onclick="window.parseAiRule()"><i data-lucide="wand-2" aria-hidden="true"></i> 解析</button>';
    bodyHtml += '    </div>';
    bodyHtml += '    <div class="rules-ai-hints">试试：';
    var examples = getAIExamples();
    for (var i = 0; i < Math.min(examples.length, 4); i++) {
      bodyHtml += ' <span class="rules-ai-hint" onclick="document.getElementById(\'aiRuleInput\').value=this.textContent;window.parseAiRule()">' + escHtml(examples[i]) + '</span>';
      if (i < Math.min(examples.length, 4) - 1) bodyHtml += ' · ';
    }
    bodyHtml += '    </div>';
    if (aiPreviewRule) {
      bodyHtml += '<div class="rules-ai-preview">';
      bodyHtml += '  <div class="rules-ai-preview-icon"><i data-lucide="brain" aria-hidden="true"></i></div>';
      bodyHtml += '  <div class="rules-ai-preview-body">';
      bodyHtml += '    <div class="rules-ai-preview-title">' + escHtml(aiPreviewRule.name) + '</div>';
      bodyHtml += '    <div class="rules-ai-preview-desc">' + escHtml(aiPreviewRule.description) + '</div>';
      bodyHtml += '    <div class="rules-ai-preview-meta">';
      bodyHtml += '      <span class="badge-sev badge-' + aiPreviewRule.severity + '">' + severityLabel(aiPreviewRule.severity) + '</span>';
      bodyHtml += '      <span class="badge-dim">' + getDimLabel(aiPreviewRule.dimension) + '</span>';
      bodyHtml += '    </div>';
      bodyHtml += '  </div>';
      bodyHtml += '  <div class="rules-ai-preview-actions">';
      bodyHtml += '    <button class="rules-btn rules-btn-primary" onclick="window.confirmAiRule()"><i data-lucide="check" aria-hidden="true"></i> 确认添加</button>';
      bodyHtml += '    <button class="rules-btn" onclick="window.dismissAiRule()"><i data-lucide="x" aria-hidden="true"></i> 取消</button>';
      bodyHtml += '  </div>';
      bodyHtml += '</div>';
    }
    bodyHtml += '  </div>';
    var header = zone.querySelector('.rules-ai-header');
    if (header) {
      header.insertAdjacentHTML('afterend', bodyHtml);
    }
    lucide.createIcons();
  }

  // 更新页头摘要计数（不重绘页面）
  function updateSummaryCount() {
    var el = document.querySelector('.rules-summary');
    if (!el) return;
    var enabledCount = 0;
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].enabled) enabledCount++;
    }
    el.textContent = '共 ' + rules.length + ' 条规则 · ' + enabledCount + ' 条启用 · 本日命中 ' + getTodayHitCount() + ' 次';
  }

  function getAllHitLogs() {
    var entries = [];
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (rule.stats.recentHits) {
        for (var h = 0; h < rule.stats.recentHits.length; h++) {
          entries.push({
            time: rule.stats.recentHits[h].time,
            name: rule.name,
            severity: rule.severity,
            detail: rule.stats.recentHits[h].detail,
            context: rule.stats.recentHits[h].context,
          });
        }
      }
    }
    entries.sort(function(a, b) { return b.time.localeCompare(a.time); });
    return entries;
  }

  function getRulesByDimension(dimId) {
    var result = [];
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].dimension === dimId) result.push(rules[i]);
    }
    return result;
  }

  function countByDimension(dimId) {
    var count = 0;
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].dimension === dimId) count++;
    }
    return count;
  }

  function countEnabledByDimension(dimId) {
    var count = 0;
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].dimension === dimId && rules[i].enabled) count++;
    }
    return count;
  }

  // ═══════════════════════════════════════════════════════════
  // 工具函数
  // ═══════════════════════════════════════════════════════════

  function escHtml(s) {
    if (typeof s !== 'string') return '' + s;
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function severityLabel(sev) {
    var map = { 'danger': '危险', 'warning': '预警', 'info': '提示' };
    return map[sev] || sev;
  }

  function conditionTypeLabel(type) {
    var map = { 'threshold': '阈值', 'timeWindow': '超时', 'comparison': '对比', 'trend': '趋势', 'behavior': '行为', 'composite': '复合' };
    return map[type] || type;
  }

  function effectLabel(effect) {
    var parts = [];
    if (effect.markAlert) parts.push('标' + effect.markAlert);
    if (effect.generatePriority) parts.push('入队列');
    if (effect.generateSupervise) parts.push('生成督办');
    return parts.join('+') || '仅记录';
  }

  function getDimLabel(dimId) {
    for (var i = 0; i < DIMENSIONS.length; i++) {
      if (DIMENSIONS[i].id === dimId) return DIMENSIONS[i].label;
    }
    return dimId;
  }

  function showRulesToast(msg) {
    var t = document.getElementById('rulesToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'rulesToast';
      t.className = 'rules-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('rules-toast-show');
    clearTimeout(t._hide);
    t._hide = setTimeout(function() { t.classList.remove('rules-toast-show'); }, 2500);
  }

  // ═══════════════════════════════════════════════════════════
  // 外部接口 — 提供给 app.js 和 HTML
  // ═══════════════════════════════════════════════════════════

  // 初始化规则引擎
  function initRulesEngine() {
    // 从 localStorage 加载，或使用默认
    var saved = ls.get('yaq_rules');
    if (saved) {
      try {
        rules = JSON.parse(saved);
      } catch(e) {
        rules = JSON.parse(JSON.stringify(defaultRules));
      }
    } else {
      rules = JSON.parse(JSON.stringify(defaultRules));
    }
  }

  // 保存规则到 localStorage
  function saveRules() {
    ls.set('yaq_rules', JSON.stringify(rules));
  }

  // 暴露到 window
  window.renderRulesPage = function() {
    var container = document.getElementById('sceneContent');
    container.innerHTML = renderRulesPage();
    lucide.createIcons();
    // 首次加载渲染规则列表
    renderRulesList();
    // 保存规则变更
    saveRules();
  };

  window.toggleRule = function(id, en) { toggleRule(id, en); };
  window.switchRulesDim = function(id) { switchRulesDim(id); };
  window.parseAiRule = function() { parseAiRule(); };
  window.confirmAiRule = function() { confirmAiRule(); };
  window.dismissAiRule = function() { dismissAiRule(); };
  window.toggleHitLog = function() { toggleHitLog(); };
  window.toggleAiZone = function() { toggleAiZone(); };
  window.viewRuleDetail = function(id) { viewRuleDetail(id); };
  window.closeRuleDetail = function() { closeRuleDetail(); };

  // 获取规则评估结果（供场景渲染使用）
  window.getRuleEngineResults = function() {
    return evaluateAllRules();
  };

  // 获取规则引擎摘要（供仪表盘展示）
  window.getRuleEngineSummary = function() {
    var total = rules.length;
    var enabled = 0;
    var triggered = 0;
    var alerts = {};
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].enabled) enabled++;
      if (rules[i].stats.lastHit) {
        var today = new Date();
        var prefix = today.getFullYear() + '-' + pad(today.getMonth()+1) + '-' + pad(today.getDate());
        if (rules[i].stats.lastHit.indexOf(prefix) >= 0) {
          triggered++;
          var sev = rules[i].severity;
          if (!alerts[sev]) alerts[sev] = { severity: sev, name: sev === 'danger' ? '危险' : '预警', count: 0 };
          alerts[sev].count++;
        }
      }
    }
    return {
      total: total,
      enabled: enabled,
      triggered: triggered,
      alerts: Object.keys(alerts).map(function(k) { return alerts[k]; }),
    };
  };

  // 初始化
  initRulesEngine();

  // 在页面卸载前保存
  window.addEventListener('beforeunload', function() {
    saveRules();
  });

  console.log('[规则引擎] 已加载，共 ' + rules.length + ' 条规则');

})();
