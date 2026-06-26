/**
 * 规则引擎 (rules.js) 核心逻辑单元测试
 *
 * 测试 AI_TEMPLATES 模式匹配、parseAIConfig、evaluateRule 等
 * 纯逻辑函数（无 DOM 渲染依赖）。
 */

import { describe, it, expect } from 'vitest';

// ════════════════════════════════════════════════════════════════
// AI_TEMPLATES — 自然语言规则模板匹配
// ════════════════════════════════════════════════════════════════

const AI_TEMPLATES = [
  {
    pattern: /(?:检查|任务|监管)(?:完成率|覆盖率|进度)\s*(?:低于|<|不到|不足)\s*(\d+)\s*%/,
    label: '检查完成率过低',
    build(m) {
      return {
        name: '检查完成率过低',
        dimension: 'metric',
        severity: 'danger',
        description: '当检查完成率低于 ' + m[1] + '% 时视为异常',
        condition: { type: 'threshold', params: { target: 'checkRate', operator: 'lt', value: parseInt(m[1]), unit: '%' } },
        effect: { markAlert: 'danger', generatePriority: true },
      };
    },
    example: '检查完成率低于 60%',
  },
  {
    pattern: /(?:隐患|问题)(?:新增|新发现)\s*(?:环比|较上期|相比)\s*(?:增长|上升|增加|↑)\s*(?:超过|大于|>)\s*(\d+)\s*%/,
    label: '隐患新增环比过高',
    build(m) {
      return {
        name: '隐患新增环比过高',
        dimension: 'trend', severity: 'warning',
        description: '当隐患新增量环比增长超过 ' + m[1] + '% 时触发预警',
        condition: { type: 'trend', params: { target: 'newHazard', operator: 'gt', value: parseInt(m[1]), unit: '%', period: '环比' } },
        effect: { markAlert: 'warning', generatePriority: true },
      };
    },
    example: '隐患新增环比增长超过 20%',
  },
  {
    pattern: /(?:连续|持续)\s*(\d+)\s*(?:天|日|周)\s*(?:未|没有|无)\s*(?:登录|自查|上报|打卡)/,
    label: '企业持续未登录/自查',
    build(m) {
      return {
        name: '企业持续未' + (m[2] || '登录'),
        dimension: 'behavior', severity: 'danger',
        description: '当企业连续 ' + m[1] + ' 天未登录系统时标记为异常',
        condition: { type: 'behavior', params: { target: 'enterpriseLogin', operator: 'gte', value: parseInt(m[1]), unit: '天', window: '连续' } },
        effect: { markAlert: 'danger', generatePriority: true },
      };
    },
    example: '企业连续30天未登录标记为危险',
  },
  {
    pattern: /(?:超期|逾期)\s*(?:超过|大于|>)\s*(\d+)\s*(?:天|日)/,
    label: '整改超期阈值',
    build(m) {
      return {
        name: '整改超期超过 ' + m[1] + ' 天',
        dimension: 'timeout', severity: 'danger',
        description: '当隐患整改超期超过 ' + m[1] + ' 天时升级为危险',
        condition: { type: 'timeWindow', params: { target: 'overdue', operator: 'gt', value: parseInt(m[1]), unit: '天' } },
        effect: { markAlert: 'danger', generatePriority: true },
      };
    },
    example: '超期超过3天标记为危险',
  },
  {
    pattern: /(?:低于|落后|差于)\s*(?:均值|平均|同类)\s*(?:超过|大于|>)\s*(\d+)\s*(?:%|pp)/,
    label: '低于同类均值',
    build(m) {
      return {
        name: '低于同类均值超过 ' + m[1] + '%',
        dimension: 'comparison', severity: 'warning',
        description: '当某条线指标低于同类均值 ' + m[1] + '% 以上时预警',
        condition: { type: 'comparison', params: { target: 'linePerformance', operator: 'lt', value: parseInt(m[1]), unit: '%', compareTo: 'peerAverage' } },
        effect: { markAlert: 'warning', generatePriority: false },
      };
    },
    example: '低于同类均值超过 15% 触发预警',
  },
  {
    pattern: /(?:重大|高风险)\s*(?:隐患|风险)\s*(?:超期|逾期)\s*(\d+)\s*(?:天|日)/,
    label: '重大隐患超期',
    build(m) {
      return {
        name: '重大隐患超期 ' + m[1] + ' 天',
        dimension: 'timeout', severity: 'danger',
        description: '重大隐患超期 ' + m[1] + ' 天自动标记为危险',
        condition: { type: 'timeWindow', params: { target: 'majorOverdue', operator: 'gte', value: parseInt(m[1]), unit: '天' } },
        effect: { markAlert: 'danger', generatePriority: true },
      };
    },
    example: '重大隐患超期1天标记为危险',
  },
  {
    pattern: /(?:自查|自检)\s*(?:率为|率)\s*0\s*(?:次|项|户)/,
    label: '自查缺失',
    build() {
      return {
        name: '企业自查持续缺失',
        dimension: 'behavior', severity: 'warning',
        description: '当存在自查率为 0 的企业时标记为异常',
        condition: { type: 'behavior', params: { target: 'selfCheck', operator: 'gt', value: 0, unit: '家' } },
        effect: { markAlert: 'warning', generatePriority: false },
      };
    },
    example: '自查率为0的隐患企业需要关注',
  },
];

function parseAIConfig(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;
  for (let i = 0; i < AI_TEMPLATES.length; i++) {
    const tpl = AI_TEMPLATES[i];
    const m = trimmed.match(tpl.pattern);
    if (m) {
      const rule = tpl.build(m);
      rule.id = 'rule-ai-' + Date.now();
      return rule;
    }
  }
  return null;
}

function getAIExamples() {
  return AI_TEMPLATES.map(t => t.example);
}

function severityLabel(sev) {
  const map = { danger: '危险', warning: '预警', info: '提示' };
  return map[sev] || sev;
}

function conditionTypeLabel(type) {
  const map = { threshold: '阈值', timeWindow: '超时', comparison: '对比', trend: '趋势', behavior: '行为', composite: '复合' };
  return map[type] || type;
}

// ════════════════════════════════════════════════════════════════
// 测试用例
// ════════════════════════════════════════════════════════════════

// ── Template 1: 检查完成率 ──

describe('AI_TEMPLATES[0] — 检查完成率过低', () => {
  const tpl = AI_TEMPLATES[0];

  it('应匹配"检查完成率低于60%"', () => {
    const m = '检查完成率低于60%'.match(tpl.pattern);
    expect(m).not.toBeNull();
    expect(m[1]).toBe('60');
    const rule = tpl.build(m);
    expect(rule.name).toBe('检查完成率过低');
    expect(rule.dimension).toBe('metric');
    expect(rule.severity).toBe('danger');
    expect(rule.condition.params.value).toBe(60);
  });

  it('应匹配"任务进度不足80%"', () => {
    expect('任务进度不足80%'.match(tpl.pattern)).not.toBeNull();
  });

  it('应匹配"监管覆盖率不到50%"', () => {
    expect('监管覆盖率不到50%'.match(tpl.pattern)).not.toBeNull();
  });

  it('不应匹配无关文本', () => {
    expect('今天天气不错'.match(tpl.pattern)).toBeNull();
    expect('检查完成率很好'.match(tpl.pattern)).toBeNull();
  });
});

// ── Template 2: 隐患新增环比 ──

describe('AI_TEMPLATES[1] — 隐患新增环比过高', () => {
  const tpl = AI_TEMPLATES[1];

  it('应匹配"隐患新增环比增长超过20%"', () => {
    const m = '隐患新增环比增长超过20%'.match(tpl.pattern);
    expect(m).not.toBeNull();
    expect(m[1]).toBe('20');
    const rule = tpl.build(m);
    expect(rule.name).toBe('隐患新增环比过高');
    expect(rule.condition.params.value).toBe(20);
  });

  it('应匹配"问题新增较上期上升超过50%"', () => {
    expect('问题新增较上期上升超过50%'.match(tpl.pattern)).not.toBeNull();
  });

  it('应匹配"隐患新增相比增加超过30%"', () => {
    const m = '隐患新增相比增加超过30%'.match(tpl.pattern);
    expect(m).not.toBeNull();
    expect(m[1]).toBe('30');
  });

  it('不应匹配无百分比的文本', () => {
    expect('隐患新增环比增长'.match(tpl.pattern)).toBeNull();
  });
});

// ── Template 3: 企业持续未登录 ──

describe('AI_TEMPLATES[2] — 企业持续未登录/自查', () => {
  const tpl = AI_TEMPLATES[2];

  it('应匹配"企业连续30天未登录标记为危险"', () => {
    const m = '企业连续30天未登录标记为危险'.match(tpl.pattern);
    expect(m).not.toBeNull();
    expect(m[1]).toBe('30');
    const rule = tpl.build(m);
    expect(rule.condition.params.value).toBe(30);
    expect(rule.condition.params.target).toBe('enterpriseLogin');
  });

  it('应匹配"持续7日未自查"', () => {
    expect('持续7日未自查'.match(tpl.pattern)).not.toBeNull();
  });

  it('应匹配"连续14天无上报"', () => {
    expect('连续14天无上报'.match(tpl.pattern)).not.toBeNull();
  });

  it('不应匹配"连续30天"（缺少动作）', () => {
    expect('连续30天'.match(tpl.pattern)).toBeNull();
  });
});

// ── Template 4: 整改超期 ──

describe('AI_TEMPLATES[3] — 整改超期阈值', () => {
  const tpl = AI_TEMPLATES[3];

  it('应匹配"超期超过3天标记为危险"', () => {
    const m = '超期超过3天标记为危险'.match(tpl.pattern);
    expect(m).not.toBeNull();
    expect(m[1]).toBe('3');
    const rule = tpl.build(m);
    expect(rule.name).toContain('3 天');
    expect(rule.dimension).toBe('timeout');
  });

  it('应匹配"逾期大于7天"', () => {
    expect('逾期大于7天'.match(tpl.pattern)).not.toBeNull();
  });

  it('应匹配"逾期>30日"', () => {
    expect('逾期>30日'.match(tpl.pattern)).not.toBeNull();
  });

  it('不应匹配"超期处理"', () => {
    expect('超期处理'.match(tpl.pattern)).toBeNull();
  });
});

// ── Template 5: 低于同类均值 ──

describe('AI_TEMPLATES[4] — 低于同类均值', () => {
  const tpl = AI_TEMPLATES[4];

  it('应匹配"低于均值超过15%触发预警"', () => {
    const m = '低于均值超过15%触发预警'.match(tpl.pattern);
    expect(m).not.toBeNull();
    expect(m[1]).toBe('15');
    const rule = tpl.build(m);
    expect(rule.severity).toBe('warning');
    expect(rule.condition.params.compareTo).toBe('peerAverage');
  });

  it('应匹配"落后平均超过10pp"', () => {
    expect('落后平均超过10pp'.match(tpl.pattern)).not.toBeNull();
  });

  it('应匹配"差于同类大于5%"', () => {
    expect('差于同类大于5%'.match(tpl.pattern)).not.toBeNull();
  });
});

// ── Template 6: 重大隐患超期 ──

describe('AI_TEMPLATES[5] — 重大隐患超期', () => {
  const tpl = AI_TEMPLATES[5];

  it('应匹配"重大隐患超期1天标记为危险"', () => {
    const m = '重大隐患超期1天标记为危险'.match(tpl.pattern);
    expect(m).not.toBeNull();
    expect(m[1]).toBe('1');
    const rule = tpl.build(m);
    expect(rule.name).toContain('1 天');
    expect(rule.severity).toBe('danger');
  });

  it('应匹配"高风险风险逾期3天"', () => {
    expect('高风险风险逾期3天'.match(tpl.pattern)).not.toBeNull();
  });
});

// ── Template 7: 自查缺失 ──

describe('AI_TEMPLATES[6] — 自查缺失', () => {
  const tpl = AI_TEMPLATES[6];

  it('应匹配"自查率为0户"', () => {
    const m = '自查率为0户'.match(tpl.pattern);
    expect(m).not.toBeNull();
    const rule = tpl.build(m);
    expect(rule.name).toBe('企业自查持续缺失');
    expect(rule.condition.params.target).toBe('selfCheck');
  });

  it('应匹配"自检率0项"', () => {
    expect('自检率0项'.match(tpl.pattern)).not.toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════
// parseAIConfig — 自然语言 → 结构化规则
// ════════════════════════════════════════════════════════════════

describe('parseAIConfig', () => {
  it('应解析"检查完成率低于60%"返回规则对象', () => {
    const rule = parseAIConfig('检查完成率低于60%');
    expect(rule).not.toBeNull();
    expect(rule.name).toBe('检查完成率过低');
    expect(rule.id).toMatch(/^rule-ai-/);
  });

  it('应解析多种输入模式', () => {
    expect(parseAIConfig('隐患新增环比增长超过20%').name).toBe('隐患新增环比过高');
    expect(parseAIConfig('超期超过7天').name).toContain('7 天');
    expect(parseAIConfig('重大隐患超期1天').name).toContain('1 天');
  });

  it('无匹配应返回 null', () => {
    expect(parseAIConfig('这是一个无意义的输入')).toBeNull();
  });

  it('空输入应返回 null', () => {
    expect(parseAIConfig('')).toBeNull();
    expect(parseAIConfig('   ')).toBeNull();
    expect(parseAIConfig(null)).toBeNull();
  });

  it('应去除首尾空格', () => {
    const rule = parseAIConfig('  检查完成率低于60%  ');
    expect(rule).not.toBeNull();
    expect(rule.name).toBe('检查完成率过低');
  });
});

// ════════════════════════════════════════════════════════════════
// getAIExamples — 示例生成
// ════════════════════════════════════════════════════════════════

describe('getAIExamples', () => {
  it('应返回所有模板的示例', () => {
    const examples = getAIExamples();
    expect(examples).toHaveLength(7);
    expect(examples[0]).toBe('检查完成率低于 60%');
    expect(examples[6]).toBe('自查率为0的隐患企业需要关注');
  });
});

// ════════════════════════════════════════════════════════════════
// severityLabel — 严重程度标签
// ════════════════════════════════════════════════════════════════

describe('severityLabel', () => {
  it('应返回中文标签', () => {
    expect(severityLabel('danger')).toBe('危险');
    expect(severityLabel('warning')).toBe('预警');
    expect(severityLabel('info')).toBe('提示');
  });
  it('未知值应返回原值', () => {
    expect(severityLabel('critical')).toBe('critical');
  });
});

// ════════════════════════════════════════════════════════════════
// conditionTypeLabel — 条件类型标签
// ════════════════════════════════════════════════════════════════

describe('conditionTypeLabel', () => {
  it('应返回中文标签', () => {
    expect(conditionTypeLabel('threshold')).toBe('阈值');
    expect(conditionTypeLabel('trend')).toBe('趋势');
    expect(conditionTypeLabel('composite')).toBe('复合');
  });
  it('未知值应返回原值', () => {
    expect(conditionTypeLabel('unknown_type')).toBe('unknown_type');
  });
});

// ════════════════════════════════════════════════════════════════
// evaluateRule — 规则评估引擎
// ════════════════════════════════════════════════════════════════

describe('evaluateRule', () => {
  function evaluateRule(rule, ctx) {
    if (!rule.enabled) return null;
    const p = rule.condition.params;
    let triggered = false;
    let detail = '';

    switch (rule.condition.type) {
      case 'threshold': {
        const actual = ctx[p.target];
        if (actual === undefined) return null;
        switch (p.operator) {
          case 'lt': triggered = actual < p.value; break;
          case 'gt': triggered = actual > p.value; break;
          case 'gte': triggered = actual >= p.value; break;
        }
        if (triggered) detail = p.target + ' = ' + actual + p.unit + ' (阈值 ' + p.operator + ' ' + p.value + p.unit + ')';
        break;
      }
      case 'timeWindow': {
        const actual = ctx[p.target];
        if (actual === undefined) return null;
        switch (p.operator) {
          case 'gt': triggered = actual > p.value; break;
          case 'gte': triggered = actual >= p.value; break;
        }
        if (triggered) detail = p.target + ' = ' + actual + p.unit + ' (阈值 ' + p.operator + ' ' + p.value + p.unit + ')';
        break;
      }
      case 'behavior': {
        if (p.target === 'selfCheck') {
          triggered = ctx.selfCheck > 0;
          if (triggered) detail = '自查为 0 的企业 ' + ctx.selfCheck + ' 家';
        }
        break;
      }
      case 'trend': {
        const actual = ctx[p.target];
        if (actual === undefined) return null;
        if (p.target === 'newHazard') {
          const baseline = 18;
          const change = Math.round((actual - baseline) / baseline * 100);
          triggered = change > p.value;
        }
        break;
      }
    }
    return { triggered, detail, rule };
  }

  const ctx = {
    checkRate: 48,
    overdue: 3,
    selfCheck: 5,
    newHazard: 23,
    closureRate: 91,
  };

  it('禁用的规则应返回 null', () => {
    const result = evaluateRule({ enabled: false, condition: { type: 'threshold', params: {} } }, ctx);
    expect(result).toBeNull();
  });

  it('threshold — actual < value 应触发', () => {
    const result = evaluateRule({
      enabled: true,
      condition: { type: 'threshold', params: { target: 'checkRate', operator: 'lt', value: 60, unit: '%' } },
    }, ctx);
    expect(result.triggered).toBe(true);
    expect(result.detail).toContain('48');
  });

  it('threshold — actual > value 不应触发', () => {
    const result = evaluateRule({
      enabled: true,
      condition: { type: 'threshold', params: { target: 'checkRate', operator: 'gt', value: 60, unit: '%' } },
    }, ctx);
    expect(result.triggered).toBe(false);
  });

  it('threshold — actual >= value 应触发', () => {
    const result = evaluateRule({
      enabled: true,
      condition: { type: 'threshold', params: { target: 'checkRate', operator: 'gte', value: 48, unit: '%' } },
    }, ctx);
    expect(result.triggered).toBe(true);
  });

  it('timeWindow — overdue > value 应触发', () => {
    const result = evaluateRule({
      enabled: true,
      condition: { type: 'timeWindow', params: { target: 'overdue', operator: 'gt', value: 2, unit: '天' } },
    }, ctx);
    expect(result.triggered).toBe(true);
  });

  it('behavior — selfCheck > 0 应触发', () => {
    const result = evaluateRule({
      enabled: true,
      condition: { type: 'behavior', params: { target: 'selfCheck', operator: 'gt', value: 0, unit: '家' } },
    }, ctx);
    expect(result.triggered).toBe(true);
    expect(result.detail).toContain('5');
  });

  it('不存在的 target 应返回 null', () => {
    const result = evaluateRule({
      enabled: true,
      condition: { type: 'threshold', params: { target: 'nonexistent', operator: 'lt', value: 50, unit: '%' } },
    }, ctx);
    expect(result).toBeNull();
  });
});
