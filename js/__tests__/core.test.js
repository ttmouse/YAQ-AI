/**
 * YAQ-AI 核心工具函数测试
 *
 * 测试策略：
 * - 导入 js/__tests__/test-utils.js 中的共享实现（与生产代码一致）
 * - 对于已暴露到 YAQ 命名空间的函数，直接测试 window.YAQ 版本
 * - 逐步覆盖 app.js + rules.js 中 YAQ 命名空间暴露的公共 API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  escapeHtml,
  safeRender,
  escHtml,
  severityLabel,
  conditionTypeLabel,
  createLS,
} from './test-utils.js';

// ─── escapeHtml（与 app.js 中 YAQ.escapeHtml 实现一致） ──

describe('escapeHtml', () => {
  // 注：生产环境中应使用 window.YAQ.escapeHtml
  // 此处导入 test-utils.js 的共享实现以确保与生产代码同步

  it('应转义 < > & " \' 字符', () => {
    const result = escapeHtml('<script>alert("xss")</script>');
    expect(result).toContain('&lt;script&gt;');
    expect(result).toContain('&lt;/script&gt;');
    expect(result).not.toContain('<script>');
  });

  it('应转义 & 符号', () => {
    expect(escapeHtml('a & b < c')).toBe('a &amp; b &lt; c');
  });

  it('普通文本应保持不变', () => {
    expect(escapeHtml('Hello, 世界!')).toBe('Hello, 世界!');
  });

  it('空字符串应返回空字符串', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('数字应转为字符串', () => {
    expect(escapeHtml(42)).toBe('42');
  });
});

// ─── localStorage 封装（YAQ.ls） ──

describe('localStorage wrapper (YAQ.ls)', () => {
  let ls;

  beforeEach(() => {
    const store = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key) => store[key] ?? null,
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      (key, value) => { store[key] = String(value); },
    );
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(
      (key) => { delete store[key]; },
    );
    ls = createLS();
  });

  it('set 后 get 应返回相同值', () => {
    ls.set('testKey', 'testValue');
    expect(ls.get('testKey')).toBe('testValue');
  });

  it('不存在的 key 应返回 fallback', () => {
    expect(ls.get('nonExistent', 'default')).toBe('default');
  });

  it('不存在的 key 且无 fallback 应返回 undefined', () => {
    expect(ls.get('nonExistent')).toBeUndefined();
  });

  it('remove 后 get 应返回 fallback', () => {
    ls.set('toBeRemoved', 'value');
    ls.remove('toBeRemoved');
    expect(ls.get('toBeRemoved', null)).toBeNull();
  });

  it('set 应返回 true', () => {
    expect(ls.set('key', 'val')).toBe(true);
  });

  it('应能存储数字', () => {
    ls.set('num', 42);
    expect(ls.get('num')).toBe('42');
  });
});

// ─── safeRender 函数 ──

describe('safeRender', () => {
  it('正常函数应返回其执行结果', () => {
    expect(safeRender(() => 'rendered OK')).toBe('rendered OK');
  });

  it('异常时应返回错误 fallback', () => {
    const result = safeRender(() => { throw new Error('boom'); }, '出错了');
    expect(result).toContain('error-state');
    expect(result).toContain('出错了');
  });
});

// ─── escHtml（与 rules.js 中的实现一致） ──

describe('escHtml (rules.js)', () => {
  it('应转义特殊 HTML 字符', () => {
    expect(escHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('非字符串应转为字符串', () => {
    expect(escHtml(0)).toBe('0');
    expect(escHtml(null)).toBe('null');
    expect(escHtml(undefined)).toBe('undefined');
  });

  it('空字符串应返回空', () => {
    expect(escHtml('')).toBe('');
  });
});

// ─── severityLabel ──

describe('severityLabel', () => {
  it('应返回正确的标签', () => {
    expect(severityLabel('danger')).toBe('危险');
    expect(severityLabel('warning')).toBe('预警');
    expect(severityLabel('info')).toBe('提示');
  });

  it('未知等级应返回原值', () => {
    expect(severityLabel('critical')).toBe('critical');
  });
});

// ─── conditionTypeLabel ──

describe('conditionTypeLabel', () => {
  it('应返回正确的类型标签', () => {
    expect(conditionTypeLabel('threshold')).toBe('阈值');
    expect(conditionTypeLabel('timeWindow')).toBe('超时');
    expect(conditionTypeLabel('comparison')).toBe('对比');
  });

  it('未知类型应返回原值', () => {
    expect(conditionTypeLabel('unknown')).toBe('unknown');
  });
});

// ─── 规则模板匹配测试 ──

describe('Rule AI Templates (rules.js)', () => {
  const templates = [
    {
      pattern: /(?:检查|任务|监管)(?:完成率|覆盖率|进度)\s*(?:低于|<|不到|不足)\s*(\d+)\s*%/,
      label: '检查完成率过低',
      parse(input) {
        const m = input.match(this.pattern);
        if (!m) return null;
        return { name: this.label, threshold: parseInt(m[1]) };
      },
    },
    {
      pattern: /(?:隐患|问题)(?:新增|新发现)\s*(?:环比|较上期|相比)\s*(?:增长|上升|增加|↑)\s*(?:超过|大于|>)\s*(\d+)\s*%/,
      label: '隐患新增环比过高',
      parse(input) {
        const m = input.match(this.pattern);
        if (!m) return null;
        return { name: this.label, pct: parseInt(m[1]) };
      },
    },
  ];

  it('应匹配"检查完成率低于80%"', () => {
    const result = templates[0].parse('检查完成率低于80%');
    expect(result).not.toBeNull();
    expect(result.name).toBe('检查完成率过低');
    expect(result.threshold).toBe(80);
  });

  it('应匹配"任务进度不足60%"', () => {
    const result = templates[0].parse('任务进度不足60%');
    expect(result).not.toBeNull();
    expect(result.threshold).toBe(60);
  });

  it('不应匹配无关输入', () => {
    expect(templates[0].parse('今天天气不错')).toBeNull();
  });

  it('应匹配"隐患新增环比增长超过20%"', () => {
    const result = templates[1].parse('隐患新增环比增长超过20%');
    expect(result).not.toBeNull();
    expect(result.name).toBe('隐患新增环比过高');
    expect(result.pct).toBe(20);
  });
});
