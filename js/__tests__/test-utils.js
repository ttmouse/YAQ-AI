/**
 * YAQ-AI 测试工具函数 — 与生产代码实现一致
 *
 * 这些函数与 js/app.js 和 js/rules.js 中的实现保持同步。
 * 如果生产代码修改了这些函数的实现，此处也必须同步更新。
 * 目标是逐步将这些函数提取到可导入的模块中（参见 #89）。
 */

// ─── escapeHtml — 与 app.js 中的实现一致 ──
export function escapeHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ─── safeRender — 与 app.js 中的实现一致 ──
export function safeRender(fn, fallbackMsg) {
  try {
    return fn();
  } catch (e) {
    return (
      '<div class="error-state"><i data-lucide="alert-triangle" width="32" height="32" class="c-red"></i><h3>' +
      (fallbackMsg || '渲染异常') +
      '</h3><p>请刷新页面重试。' +
      (e.message ? ' (' + e.message + ')' : '') +
      '</p></div>'
    );
  }
}

// ─── escHtml — 与 rules.js 中的 escHtml 一致 ──
export function escHtml(s) {
  if (typeof s !== 'string') return '' + s;
  var d = document.createElement('div');
  d.appendChild(document.createTextNode(s));
  return d.innerHTML;
}

// ─── severityLabel — 与 rules.js 中的实现一致 ──
export function severityLabel(sev) {
  var map = { danger: '危险', warning: '预警', info: '提示' };
  return map[sev] || sev;
}

// ─── conditionTypeLabel — 与 rules.js 中的实现一致 ──
export function conditionTypeLabel(type) {
  var map = {
    threshold: '阈值',
    timeWindow: '超时',
    comparison: '对比',
    trend: '趋势',
    behavior: '行为',
    composite: '复合',
  };
  return map[type] || type;
}

// ─── localStorage 封装 — 与 app.js 中的 ls 一致 ──
export function createLS() {
  return {
    get(key, fallback) {
      try {
        var v = localStorage.getItem(key);
        return v !== null ? v : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, val) {
      try {
        localStorage.setItem(key, val);
        return true;
      } catch (e) {
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    },
  };
}
