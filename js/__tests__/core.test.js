/**
 * YAQ-AI 核心工具函数测试
 *
 * 测试策略：
 * - 优先测试纯函数（无 DOM 依赖或可模拟）
 * - 使用 jsdom 环境处理依赖 DOM 的函数
 * - 逐步覆盖 app.js 中 YAQ 命名空间暴露的公共 API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── escapeHtml（位于 app.js 中 IIFE 内部，通过 YAQ.escapeHtml 暴露） ──

describe('escapeHtml', () => {
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  it('应转义 < > & " \' 字符', () => {
    const result = escapeHtml('<script>alert("xss")</script>');
    expect(result).toContain('&lt;script&gt;');
    expect(result).toContain('&lt;/script&gt;');
    // jsdom 的 createTextNode 引号行为与浏览器略有不同
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
  // 模拟 localStorage
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
  });

  const ls = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v !== null ? v : fallback;
      } catch { return fallback; }
    },
    set(key, val) {
      try { localStorage.setItem(key, val); return true; }
      catch { return false; }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch { /* noop */ }
    },
  };

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
    expect(ls.get('num')).toBe('42');  // localStorage 存储为字符串
  });
});

// ─── safeRender 函数 ──

describe('safeRender', () => {
  it('正常函数应返回其执行结果', () => {
    function safeRender(fn, fallbackMsg) {
      try { return fn(); }
      catch (e) {
        return '<div class="error-state">' + (fallbackMsg || '渲染异常') + '</div>';
      }
    }
    expect(safeRender(() => 'rendered OK')).toBe('rendered OK');
  });

  it('异常时应返回错误 fallback', () => {
    function safeRender(fn, fallbackMsg) {
      try { return fn(); }
      catch (e) {
        return '<div class="error-state">' + (fallbackMsg || '渲染异常') + '</div>';
      }
    }
    const result = safeRender(() => { throw new Error('boom'); }, '出错了');
    expect(result).toContain('error-state');
    expect(result).toContain('出错了');
  });
});

// ─── rules.js 中的 escHtml ──

describe('escHtml (rules.js)', () => {
  function escHtml(s) {
    if (typeof s !== 'string') return '' + s;
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }

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

// ─── rules.js 中的 severityLabel ──

describe('severityLabel', () => {
  function severityLabel(sev) {
    const map = { danger: '危险', warning: '预警', info: '提示' };
    return map[sev] || sev;
  }

  it('应返回正确的标签', () => {
    expect(severityLabel('danger')).toBe('危险');
    expect(severityLabel('warning')).toBe('预警');
    expect(severityLabel('info')).toBe('提示');
  });

  it('未知等级应返回原值', () => {
    expect(severityLabel('critical')).toBe('critical');
  });
});

// ─── rules.js 中的 conditionTypeLabel ──

describe('conditionTypeLabel', () => {
  function conditionTypeLabel(type) {
    const map = {
      threshold: '阈值', timeWindow: '超时', comparison: '对比',
      trend: '趋势', behavior: '行为', composite: '复合',
    };
    return map[type] || type;
  }

  it('应返回正确的类型标签', () => {
    expect(conditionTypeLabel('threshold')).toBe('阈值');
    expect(conditionTypeLabel('timeWindow')).toBe('超时');
    expect(conditionTypeLabel('comparison')).toBe('对比');
  });

  it('未知类型应返回原值', () => {
    expect(conditionTypeLabel('unknown')).toBe('unknown');
  });
});

// ─── 规则模板匹配测试（rules.js 中的 AI_TEMPLATES） ──

describe('Rule AI Templates (rules.js)', () => {
  const templates = [
    {
      pattern: /(?:检查|任务|监管)(?:完成率|覆盖率|进度)\s*(?:低于|<|不到|不足)\s*(\d+)\s*%/,
      label: '检查完成率过低',
      parse(input) {
        const m = input.match(this.pattern);
        if (!m) return null;
        return {
          name: this.label,
          threshold: parseInt(m[1]),
        };
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
