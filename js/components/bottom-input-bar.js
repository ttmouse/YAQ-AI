/* ═══════════════════════════════════════════════════════════════════════════
   BottomInputBar — 全局可复用的底部输入条组件
   
   统一多种场景（global / init / drill / agent / rules）的输入条结构，
   通过选项配置不同外观和行为，消除 HTML/CSS/JS 的重复定义。
   每个变体使用项目已有的 CSS 类名，保持与现有样式完全兼容。
   
   用法：
     // 获取 HTML 字符串（适用于 innerHTML 赋值）
     var html = BottomInputBar.render({ placeholder: '直接对话...', variant: 'pill', sendCommand: 'globalChatSend' });
     container.innerHTML = html;
     
     // 创建 DOM 元素
     var el = BottomInputBar.create({ placeholder: '直接对话...', variant: 'pill', sendCommand: 'globalChatSend' });
     container.appendChild(el);
   
   变体对照：
     pill    → global-chat-bar（主应用底部药丸形输入条）
     init    → init-chat-bar（初始化覆盖层输入条）
     compact → drill-ai-bar（弹窗/抽屉内紧凑型输入条）
     inline  → agent-input-bar（内容区内联输入条）
     purple  → rules-ai-input-row（规则配置紫色主题输入条）
   
   事件处理：
     - 优先使用 data-cmd / data-cmd-key 属性，由 app.js 的全局命令分发委托处理
     - 兼容 onSend / onVoice 回调函数（会注册为 data-cmd 可调用的函数）
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ─── 默认配置 ─────────────────────────────────────────────────────────
  var DEFAULTS = {
    placeholder: '输入消息...',
    sendCommand: null, // data-cmd 值（发送按钮 + Enter 键）
    voiceCommand: null, // data-cmd 值（语音按钮），null 则不显示语音按钮
    onSend: null, // 发送回调（替代 sendCommand）
    onVoice: null, // 语音回调（替代 voiceCommand）
    sendIcon: 'arrow-up', // 发送按钮图标名
    voiceIcon: 'mic', // 语音按钮图标名
    iconSize: 16, // 图标尺寸（px）
    variant: 'pill', // 'pill' | 'init' | 'compact' | 'inline' | 'purple'
    extraClass: '', // 附加 CSS 类（加在容器上）
    inputId: '', // input 元素的 id
    inputType: 'text', // input 的 type
    inputValue: '', // 初始输入值
    inputAttrs: {}, // 额外的 input 属性（key-value 对象）
    showSend: true, // 是否显示发送按钮
    showMic: true, // 是否显示语音按钮（仅在 voiceCommand 或 onVoice 设置时有效）
    sendButtonText: '', // 发送按钮上的文字（有文字时不显示图标）
    sendButtonIcon: true, // 发送按钮是否显示图标
    leadingHtml: '', // 输入框左侧前置 HTML（例如上传按钮）
  };

  var _callbackCounter = 0;

  // ─── 注册回调到 window.YAQ ──────────────────────────────────────────
  function _registerCallback(fn, callbackName) {
    if (!window.YAQ) window.YAQ = {};
    window.YAQ[callbackName] = fn;
    return callbackName;
  }

  // ─── 获取变体对应的 CSS 类名映射 ────────────────────────────────────
  function _getClassMap(variant) {
    switch (variant) {
      case 'init':
        return {
          bar: 'init-chat-bar',
          inner: false, // 无内层 wrapper，input 直接作为 flex 子项
          input: 'init-chat-input',
          mic: 'init-chat-btn',
          send: 'init-chat-send',
        };
      case 'compact':
        return {
          bar: 'drill-ai-bar',
          inner: false,
          input: 'dmsg-input',
          mic: false, // 紧凑型无语音按钮
          send: 'dmsg-send',
        };
      case 'inline':
        return {
          bar: 'agent-input-bar',
          inner: false,
          input: false, // inline 的 input 无独立类名，由 .agent-input-bar input 统一样式
          mic: false,
          send: 'aib-btn',
        };
      case 'purple':
        return {
          bar: 'rules-ai-input-row',
          inner: false,
          input: 'rules-ai-input',
          mic: false,
          send: 'rules-ai-btn',
        };
      case 'pill':
      default:
        return {
          bar: 'global-chat-bar',
          inner: 'global-chat-inner', // 有内层 wrapper
          input: false, // input 无独立类名，由 .global-chat-inner input 统一样式
          mic: 'global-chat-mic',
          send: 'global-chat-btn',
        };
    }
  }

  // ─── 构建输入框属性 ──────────────────────────────────────────────────
  function _buildInputAttrs(opts) {
    var attrs = 'type="' + (opts.inputType || 'text') + '"';
    if (opts.inputId) attrs += ' id="' + opts.inputId + '"';
    if (opts.placeholder) attrs += ' placeholder="' + escHtml(opts.placeholder) + '"';

    // data-cmd / data-cmd-key — 由 app.js 全局委托处理
    if (opts.sendCommand) {
      attrs += ' data-cmd-key="Enter" data-cmd="' + opts.sendCommand + '"';
    } else if (opts.onSend) {
      var fnName = '_bip_send_' + ++_callbackCounter;
      attrs += ' data-cmd-key="Enter" data-cmd="' + fnName + '"';
      _registerCallback(opts.onSend, fnName);
    }

    // 额外 HTML 属性
    if (opts.inputAttrs) {
      for (var k in opts.inputAttrs) {
        if (opts.inputAttrs.hasOwnProperty(k)) {
          attrs += ' ' + k + '="' + escHtml(String(opts.inputAttrs[k])) + '"';
        }
      }
    }

    if (opts.inputValue) {
      attrs += ' value="' + escHtml(opts.inputValue) + '"';
    }

    return attrs;
  }

  // ─── 构建图标 HTML ──────────────────────────────────────────────────
  function _iconHtml(name, size) {
    return '<i data-lucide="' + name + '" width="' + size + '" height="' + size + '"></i>';
  }

  // ─── HTML 转义 ──────────────────────────────────────────────────────
  function escHtml(s) {
    if (typeof s !== 'string') return '';
    return s
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ─── 构建命令属性 ──────────────────────────────────────────────────
  function _cmdAttr(command, onCallback, prefix) {
    if (command) return ' data-cmd="' + command + '"';
    if (onCallback) {
      var fnName = prefix + ++_callbackCounter;
      _registerCallback(onCallback, fnName);
      return ' data-cmd="' + fnName + '"';
    }
    return '';
  }

  // ─── 设置命令属性 (DOM 版) ──────────────────────────────────────────
  function _setCmdAttr(el, command, onCallback, prefix) {
    if (command) {
      el.setAttribute('data-cmd', command);
    } else if (onCallback) {
      var fnName = prefix + ++_callbackCounter;
      _registerCallback(onCallback, fnName);
      el.setAttribute('data-cmd', fnName);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     BottomInputBar.render() — 返回 HTML 字符串
     ═══════════════════════════════════════════════════════════════════════ */
  function render(options) {
    var opts = _mergeOptions(options);
    var cls = _getClassMap(opts.variant);
    var barClass = cls.bar + (opts.extraClass ? ' ' + opts.extraClass : '');

    var html = '<div class="' + barClass + '">';

    // 内层 wrapper（仅 pill 变体有 .global-chat-inner）
    if (cls.inner) html += '<div class="' + cls.inner + '">';

    // 前置 HTML（输入框左侧，例如上传按钮）
    if (opts.leadingHtml) html += opts.leadingHtml;

    // input
    var inputClass = cls.input ? ' class="' + cls.input + '"' : '';
    html += '<input' + inputClass + ' ' + _buildInputAttrs(opts) + ' />';

    // mic 按钮
    if (opts.showMic && opts.voiceCommand) {
      html +=
        '<button class="' +
        cls.mic +
        '"' +
        _cmdAttr(opts.voiceCommand, null, '') +
        ' title="语音输入">' +
        _iconHtml(opts.voiceIcon, opts.iconSize) +
        '</button>';
    } else if (opts.showMic && opts.onVoice) {
      html +=
        '<button class="' +
        cls.mic +
        '"' +
        _cmdAttr(null, opts.onVoice, '_bip_voice_') +
        ' title="语音输入">' +
        _iconHtml(opts.voiceIcon, opts.iconSize) +
        '</button>';
    }

    // 发送按钮
    if (opts.showSend) {
      html +=
        '<button class="' + cls.send + '"' + _cmdAttr(opts.sendCommand, opts.onSend, '_bip_send_') + ' title="发送">';
      if (opts.sendButtonText && opts.sendButtonIcon) {
        // icon + text 并存（如 rules 场景的 wand-2 + "解析"）
        html += _iconHtml(opts.sendIcon, opts.iconSize) + ' ' + escHtml(opts.sendButtonText);
      } else if (opts.sendButtonText) {
        html += escHtml(opts.sendButtonText);
      } else if (opts.sendButtonIcon) {
        html += _iconHtml(opts.sendIcon, opts.iconSize);
      }
      html += '</button>';
    }

    if (cls.inner) html += '</div>'; // 关闭内层 wrapper
    html += '</div>';

    return html;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     BottomInputBar.create() — 创建 DOM 元素，自动渲染 Lucide 图标
     ═══════════════════════════════════════════════════════════════════════ */
  function create(options) {
    var opts = _mergeOptions(options);
    var cls = _getClassMap(opts.variant);
    var barClass = cls.bar + (opts.extraClass ? ' ' + opts.extraClass : '');

    var bar = document.createElement('div');
    bar.className = barClass;

    // 内层 wrapper / 容器引用
    var container = bar;
    if (cls.inner) {
      var inner = document.createElement('div');
      inner.className = cls.inner;
      bar.appendChild(inner);
      container = inner;
    }

    // 前置 HTML（输入框左侧，例如上传按钮）
    if (opts.leadingHtml) {
      container.insertAdjacentHTML('beforeend', opts.leadingHtml);
    }

    // input
    var input = document.createElement('input');
    input.type = opts.inputType || 'text';
    if (cls.input) input.className = cls.input;
    if (opts.inputId) input.id = opts.inputId;
    if (opts.placeholder) input.placeholder = opts.placeholder;
    if (opts.inputValue) input.value = opts.inputValue;

    // data-cmd 委托
    if (opts.sendCommand) {
      input.setAttribute('data-cmd-key', 'Enter');
      input.setAttribute('data-cmd', opts.sendCommand);
    } else if (opts.onSend) {
      var fnName = '_bip_send_' + ++_callbackCounter;
      input.setAttribute('data-cmd-key', 'Enter');
      input.setAttribute('data-cmd', fnName);
      _registerCallback(opts.onSend, fnName);
    }

    // 额外 input 属性
    if (opts.inputAttrs) {
      for (var k in opts.inputAttrs) {
        if (opts.inputAttrs.hasOwnProperty(k)) {
          input.setAttribute(k, opts.inputAttrs[k]);
        }
      }
    }

    container.appendChild(input);

    // mic 按钮
    if (opts.showMic && (opts.voiceCommand || opts.onVoice)) {
      var mic = document.createElement('button');
      mic.className = cls.mic;
      mic.title = '语音输入';
      _setCmdAttr(mic, opts.voiceCommand, opts.onVoice, '_bip_voice_');
      mic.innerHTML = _iconHtml(opts.voiceIcon, opts.iconSize);
      container.appendChild(mic);
    }

    // 发送按钮
    if (opts.showSend) {
      var send = document.createElement('button');
      send.className = cls.send;
      send.title = '发送';
      _setCmdAttr(send, opts.sendCommand, opts.onSend, '_bip_send_');
      if (opts.sendButtonText && opts.sendButtonIcon) {
        send.innerHTML = _iconHtml(opts.sendIcon, opts.iconSize) + ' ' + escHtml(opts.sendButtonText);
      } else if (opts.sendButtonText) {
        send.textContent = opts.sendButtonText;
      } else if (opts.sendButtonIcon) {
        send.innerHTML = _iconHtml(opts.sendIcon, opts.iconSize);
      }
      container.appendChild(send);
    }

    // 渲染 Lucide 图标
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons({ container: bar });
    }

    return bar;
  }

  // ─── 合并选项 ──────────────────────────────────────────────────────
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

  // ─── 暴露 API ──────────────────────────────────────────────────────
  window.BottomInputBar = {
    render: render,
    create: create,
    escHtml: escHtml,
  };
})();
