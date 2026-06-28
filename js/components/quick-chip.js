/* ═══════════════════════════════════════════════════════════════════════════
   QuickChip — 统一快捷操作芯片组件

   统一初始化场景（#initQuickWrap）和通用场景（消息流内联）的芯片样式和行为。
   两种变体使用相同的视觉设计，仅布局方式不同。

   用法：
     // HTML 字符串（适用于 innerHTML 赋值）
     var html = QuickChip.render([
       { label: '进入工作台', click: 'YAQ.doEnter()', primary: true },
       { label: '取消', click: 'YAQ.doCancel()' }
     ], { variant: 'wrap' });
     container.innerHTML = html;

     // 创建 DOM 元素
     var el = QuickChip.create([
       { label: '分析超期原因', text: '分析一下隐患闭环未关闭的原因' }
     ], { variant: 'inline' });
     sceneContent.appendChild(el);

   变体：
     wrap   → 渲染在 .quick-chip-wrap 弹性容器中（初始化场景使用）
     inline → 渲染在 .quick-chips-row 行内容器中（消息流使用）

   芯片选项：
     { label, click?, text?, primary?, large? }
     - label:   显示文字
     - click:   onclick 字符串（如 'YAQ.doEnter()'）
     - text:    快捷发送文本（用于 globalChatQuick 模式）
     - primary: 是否高亮
     - large:   是否大号
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════════
     默认配置
     ═══════════════════════════════════════════════════════════════════════ */
  var DEFAULTS = {
    variant: 'wrap',         // 'wrap' | 'inline'
    containerClass: '',      // 附加到容器上的 CSS 类
    onChipClick: null,       // 全局芯片点击回调 (chip, event) => void
  };

  /* ═══════════════════════════════════════════════════════════════════════
     构建单个芯片 HTML
     ═══════════════════════════════════════════════════════════════════════ */
  function _chipHtml(chip) {
    var cls = 'qc-chip';
    if (chip.primary) cls += ' primary';
    if (chip.large) cls += ' large';

    var attrs = ' class="' + cls + '"';
    // 支持两种回调模式：click 字符串 / text 快捷发送
    // 点击后自动移除芯片容器
    var removeChips = ';var _r=this.closest(\'.quick-chips-row\');if(_r)_r.remove()';
    if (chip.click) {
      attrs += ' onclick="' + escHtml(chip.click) + removeChips + '"';
    } else if (chip.text) {
      attrs += ' onclick="YAQ.globalChatQuick(\'' + escHtml(chip.text.replace(/'/g, "\\'")) + '\')"';
    }
    // data-cmd 模式（由 app.js 全局分发）
    if (chip.cmd) {
      attrs += ' data-cmd="' + chip.cmd + '"';
      if (chip.cmdArg) attrs += ' data-arg="' + chip.cmdArg + '"';
    }

    var html = '<button' + attrs + '>';
    html += escHtml(chip.label);
    // 非 primary 芯片显示箭头图标
    if (!chip.primary) {
      html += '<svg class="qc-chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
    }
    html += '</button>';
    return html;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     构建容器 HTML
     ═══════════════════════════════════════════════════════════════════════ */
  function _containerTag(variant) {
    switch (variant) {
      case 'inline':
        return 'quick-chips-row';
      case 'wrap':
      default:
        return 'quick-chip-wrap';
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     QuickChip.render() — 返回 HTML 字符串
     ═══════════════════════════════════════════════════════════════════════ */
  function render(chips, options) {
    if (!chips || chips.length === 0) return '';
    var opts = _mergeOptions(options);
    var tag = _containerTag(opts.variant);
    var cls = tag + (opts.containerClass ? ' ' + opts.containerClass : '');

    var html = '<div class="' + cls + '">';
    for (var i = 0; i < chips.length; i++) {
      html += _chipHtml(chips[i]);
    }
    html += '</div>';
    return html;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     QuickChip.create() — 创建 DOM 元素
     ═══════════════════════════════════════════════════════════════════════ */
  function create(chips, options) {
    if (!chips || chips.length === 0) return null;
    var opts = _mergeOptions(options);
    var tag = _containerTag(opts.variant);

    var container = document.createElement('div');
    container.className = tag + (opts.containerClass ? ' ' + opts.containerClass : '');

    for (var i = 0; i < chips.length; i++) {
      var chip = chips[i];
      var btn = document.createElement('button');
      var cls = 'qc-chip';
      if (chip.primary) cls += ' primary';
      if (chip.large) cls += ' large';
      btn.className = cls;

      if (chip.click) {
        btn.setAttribute('onclick', chip.click);
      } else if (chip.text) {
        btn.setAttribute('onclick', "YAQ.globalChatQuick('" + chip.text.replace(/'/g, "\\'") + "')");
      }
      if (chip.cmd) {
        btn.setAttribute('data-cmd', chip.cmd);
        if (chip.cmdArg) btn.setAttribute('data-arg', chip.cmdArg);
      }

      btn.textContent = chip.label;
      if (!chip.primary) {
        var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('class', 'qc-chip-icon');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', 'currentColor');
        icon.setAttribute('stroke-width', '2');
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '12'); line.setAttribute('y1', '19');
        line.setAttribute('x2', '12'); line.setAttribute('y2', '5');
        icon.appendChild(line);
        var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        poly.setAttribute('points', '5 12 12 5 19 12');
        icon.appendChild(poly);
        btn.appendChild(icon);
      }

      if (opts.onChipClick) {
        btn.addEventListener('click', function (e) {
          opts.onChipClick(chip, e);
        });
      }

      container.appendChild(btn);
    }

    return container;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     HTML 转义
     ═══════════════════════════════════════════════════════════════════════ */
  function escHtml(s) {
    if (typeof s !== 'string') return '';
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ═══════════════════════════════════════════════════════════════════════
     合并选项
     ═══════════════════════════════════════════════════════════════════════ */
  function _mergeOptions(opts) {
    if (!opts) opts = {};
    var result = {};
    for (var k in DEFAULTS) {
      if (DEFAULTS.hasOwnProperty(k)) {
        result[k] = opts.hasOwnProperty(k) ? opts[k] : DEFAULTS[k];
      }
    }
    return result;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     暴露 API
     ═══════════════════════════════════════════════════════════════════════ */
  window.QuickChip = {
    render: render,
    create: create,
    escHtml: escHtml,
  };
})();
