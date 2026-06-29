// ═════════════════════════════════════════════════════════════════════
// 站长主控 Agent 初始化场景 — 纯对话式
// ═════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── Lucide 安全调用封装：避免 CDN 未加载时报错 ─────
  function refreshIcons(containerId) {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons({ container: document.getElementById(containerId || 'initOverlay') });
    }
  }

  // ─── localStorage 封装：复用 app.js 中已定义的 YAQ.ls ─────
  var ls = (window.YAQ && window.YAQ.ls) || {
    get: function (key, fallback) {
      try {
        var v = localStorage.getItem(key);
        return v !== null ? v : fallback;
      } catch (_e) {
        return fallback !== undefined ? fallback : null;
      }
    },
    set: function (key, val) {
      try {
        localStorage.setItem(key, val);
        return true;
      } catch (_e) {
        console.warn('[YAQ] localStorage 写入失败:', key);
        return false;
      }
    },
    remove: function (key) {
      try {
        localStorage.removeItem(key);
      } catch (_e) {}
    },
  };

  var STORAGE_KEY = 'yaq_agent_initialized';
  var userMode = 'default';
  var attentionItems = [
    { id: 'a1', title: '今天有没有必须处理的安全风险', desc: '整体安全态势、风险区域、新增隐患变化', on: true },
    { id: 'a2', title: '重大隐患是否闭环', desc: '新增重大隐患、逾期未整改、临时管控措施', on: true },
    { id: 'a3', title: '专项行动是否滞后', desc: '日常任务、专项任务是否时间过半、任务过半', on: true },
    { id: 'a4', title: '重点主体对象是否异常', desc: '重点企业/场所风险上升、整改反复、异常', on: true },
    { id: 'a5', title: '团队履职是否异常', desc: '应消站、区域站、村社、专家履职情况', on: true },
    { id: 'a6', title: '是否需要准备会议材料', desc: '会议前自动整理重大隐患、专项滞后、待确认事项', on: false },
    {
      id: 'a7',
      title: '是否需要生成月度监管报告草稿',
      desc: '月末整理日常监管、履职、主体责任和辖区安全形势',
      on: false,
    },
  ];
  var agents = [
    {
      id: 'g1',
      name: '每日态势 Agent',
      schedule: '每天 08:30',
      output: '今日安全态势简报',
      push: '有异常进入总控动态',
      on: true,
    },
    {
      id: 'g2',
      name: '重大隐患 Agent',
      schedule: '每天 10:00',
      output: '重大隐患闭环检查',
      push: '高风险进入待我确认',
      on: true,
    },
    {
      id: 'g3',
      name: '重点主体 Agent',
      schedule: '每天 11:00',
      output: '重点主体异常清单',
      push: '异常进入总控动态',
      on: true,
    },
    {
      id: 'g4',
      name: '专项行动 Agent',
      schedule: '每天 14:00',
      output: '专项行动进度简报',
      push: '明显滞后进入待我确认',
      on: true,
    },
    {
      id: 'g5',
      name: '履职分析 Agent',
      schedule: '每天 16:30',
      output: '工作效能简报',
      push: '异常进入总控动态',
      on: true,
    },
    {
      id: 'g6',
      name: '会前准备 Agent',
      schedule: '会议前一天',
      output: '会议议题和发言提纲',
      push: '材料生成后进入材料区',
      on: true,
    },
    {
      id: 'g7',
      name: '月报 Agent',
      schedule: '每月 25 日起',
      output: '月度监管报告草稿',
      push: '生成后进入材料区',
      on: true,
    },
    {
      id: 'g8',
      name: '系统性复盘 Agent',
      schedule: '异常反复时触发',
      output: '复盘建议',
      push: '进入建议复盘',
      on: true,
    },
  ];
  var PREF_OPTIONS = [
    {
      id: 'daily_risk',
      label: '今天有没有必须处理的安全风险',
      sub: '整体安全态势、风险区域、新增隐患变化。',
      period: '每天 08:30',
    },
    {
      id: 'major_hazard',
      label: '重大隐患是否闭环',
      sub: '新增重大隐患、历史遗留隐患、逾期未整改、临时管控措施。',
      period: '每天 10:00',
    },
    {
      id: 'special_task',
      label: '专项行动是否滞后',
      sub: '日常任务、专项任务是否时间过半、任务过半。',
      period: '每天 14:00',
    },
    {
      id: 'key_subject',
      label: '重点主体对象是否异常',
      sub: '重点企业/场所风险上升、整改反复、平台使用异常。',
      period: '每天 11:00',
    },
    {
      id: 'team_duty',
      label: '团队履职是否异常',
      sub: '应消站、区域站、村社、专家履职情况是否异常。',
      period: '每天 16:30',
    },
    {
      id: 'monthly_report',
      label: '帮我生成每月的安全月报',
      sub: '月末自动整理日常监管数据，生成月度报告草稿。',
      period: '每月 25 日',
    },
  ];
  var customAttentions = []; // 自定义关注项 { id:'c_xxx', label:'...', desc:'...', period:'自定义' }
  var customIdCounter = 0;
  var MODE_RESPONSES = {
    major_hazard:
      '已将<span class="hl">重大隐患闭环</span>设为优先关注。<br><br>我会重点检查：<br>• 是否超期未整改<br>• 是否有临时管控措施<br>• 整改方案是否可行<br>• 责任人是否履职到位<br><br>其他日常巡检——安全态势、专项行动进度、重点主体异常、团队履职——继续保持正常运行。',
    special_task:
      '已将<span class="hl">专项行动进度</span>纳入本周重点关注。<br><br>我会每天检查：<br>• 任务完成率与时间进度对比<br>• 滞后超过 15% 的进入待我确认<br>• 责任条线是否存在掉队情况<br><br>其他日常巡检——安全态势、重大隐患、重点主体异常、团队履职——继续保持正常运行。',
    low_interrupt:
      '已切换为<span class="hl">低打扰模式</span>。<br><br>规则调整为：<br>• 普通完成只进入运行记录<br>• 只有重大风险和需要你拍板的事项才会主动提醒<br>• 日报正常生成但不推送通知<br><br>所有巡检任务在后台正常运行，只是不再频繁推送。',
    meeting_material:
      '已增强<span class="hl">会前材料准备</span>能力。<br><br>会议前我将自动整理：<br>• 重大隐患整改进展摘要<br>• 专项行动滞后情况<br>• 重点主体异常清单<br>• 待确认事项汇总<br>• 会议发言提纲草稿<br><br>其他日常巡检——安全态势、重大隐患、专项行动、重点主体、团队履职——继续保持正常运行。',
    default:
      '好的，采用<span class="hl">默认管理方案</span>。<br><br>我会按标准节奏执行以下日常巡检：<br>• 每日安全态势巡检<br>• 重大隐患闭环检查<br>• 专项行动进度跟踪<br>• 重点主体异常监控<br>• 团队履职情况分析<br>• 会前材料准备<br>• 月度监管报告草稿生成<br><br>需要调整时随时告诉我。',
  };
  var MODE_LABELS = {
    default: '默认方案',
    major_hazard: '重大隐患优先',
    special_task: '专项进度优先',
    low_interrupt: '低打扰模式',
    meeting_material: '会前材料增强',
  };

  // ═══ 对话引擎 ══════════════════════════════════════════════════════
  function chatAppend(html) {
    var box = document.getElementById('chatBox');
    if (!box) return;
    box.insertAdjacentHTML('beforeend', html);
    // chatBox (.init-content) 是实际滚动容器（overflow-y: auto），统一滚到底部
    scrollChatToBottom();
  }

  // ─── 初始化对话容器安全滚动到底部 ──────────────────────
  function scrollChatToBottom() {
    var box = document.getElementById('chatBox');
    if (!box) return;
    requestAnimationFrame(function () {
      box.scrollTop = box.scrollHeight;
    });
  }
  function agentMsg(html) {
    return '<div class="c-row agent"><div class="agent-text">' + html + '</div></div>';
  }
  function userMsg(text) {
    return '<div class="c-row user"><div class="c-bubble user">' + escapeHtml(text) + '</div></div>';
  }
  function voiceMsg(text) {
    return (
      '<div class="c-row user"><div class="c-bubble user voice"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14v-4"/><path d="M7 16V8"/><path d="M11 18V6"/><path d="M15 16V8"/><path d="M19 14v-4"/></svg><span>' +
      escapeHtml(text) +
      '</span></div></div>'
    );
  }
  function thinkingDots(text) {
    var t = text || '正在处理';
    return (
      '<div class="c-row agent thinking" id="thinkingRow"><div class="c-bubble"><span class="td">' +
      t +
      '<span></span><span></span><span></span></span></div></div>'
    );
  }
  // 保留函数签名以兼容全局引用，由 readable global 'showThinking' 覆盖
  // ─── 打字引擎 ──────────────────────────────────────────────
  var _typeId = 0;
  function doType(id, html, callback) {
    var el = document.getElementById(id);
    if (!el) {
      if (callback) callback();
      return;
    }
    // 将 HTML 拆分为标签和纯文本交替的 token 数组
    var tokens = [];
    var regex = /(<[^>]+>)/g;
    var lastIdx = 0,
      match;
    while ((match = regex.exec(html)) !== null) {
      if (match.index > lastIdx) {
        tokens.push({ t: 'text', v: html.substring(lastIdx, match.index) });
      }
      tokens.push({ t: 'tag', v: match[0] });
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < html.length) {
      tokens.push({ t: 'text', v: html.substring(lastIdx) });
    }
    // 如果无标签，整个作为一段文本
    if (tokens.length === 0) tokens.push({ t: 'text', v: html });

    var ti = 0; // token index
    var ci = 0; // char index within current text token
    var output = '';

    function typeToken() {
      if (ti >= tokens.length) {
        refreshIcons('initOverlay');
        if (callback) callback();
        return;
      }
      var tok = tokens[ti];
      if (tok.t === 'tag') {
        output += tok.v;
        ti++;
        // 立即进入下一个 token
        setTimeout(typeToken, 0);
        return;
      }
      // 纯文本：每次追加 4-6 个字符
      var chunk = '';
      for (var c = 0; c < 4 + Math.round(Math.random() * 2) && ci < tok.v.length; c++, ci++) {
        chunk += tok.v[ci];
      }
      output += chunk;
      el.innerHTML = output;
      scrollChatToBottom();
      if (ci >= tok.v.length) {
        ci = 0;
        ti++;
      }
      setTimeout(typeToken, 10 + Math.random() * 8);
    }
    typeToken();
  }
  // ─── 思考 → 打字回复 ─────────────────────────────────────
  function typeResponse(thinkText, responseHTML, callback) {
    _typeId++;
    var id = 'typeArea' + _typeId;
    chatAppend(thinkingDots(thinkText));
    setTimeout(
      function () {
        var row = document.getElementById('thinkingRow');
        if (row) row.remove();
        chatAppend('<div class="c-row agent"><div class="agent-text" id="' + id + '"></div></div>');
        doType(id, responseHTML, callback);
      },
      600 + Math.random() * 300,
    );
  }
  // ─── 纯打字（无思考圆点） ─────────────────────────────────
  function typeText(text, callback) {
    _typeId++;
    var id = 'typeArea' + _typeId;
    chatAppend('<div class="c-row agent"><div class="agent-text" id="' + id + '"></div></div>');
    doType(id, text, callback);
  }
  // ─── 快捷操作芯片（消息流内联） ──────────────────────────
  function showActions(chips) {
    if (!chips || chips.length === 0) return;
    // 渲染到对话流中（和日常工作台同样的带箭头样式）
    var html = QuickChip.render(chips, { variant: 'inline' });
    chatAppend(html);
    // 自动演示：按钮渲染后自动点击
    if (window._autoChain) {
      clearTimeout(window._chainTimer);
      window._chainTimer = setTimeout(function () {
        var btns = document.querySelectorAll('.qc-chip.primary');
        if (btns.length > 0) btns[0].click();
      }, 2500);
    }
  }

  // ═══ 开场 ══════════════════════════════════════════════════════════
  function startConversation() {
    // ═══ MutationObserver + 用户滚动检测 ═══
    // 自动滚动仅在用户未手动上滚时触发；用户上滚后停止自动滚动，
    // 滚回底部时恢复。点击快捷输入后用户消息置顶，后续不再自动滚动。
    (function () {
      var ct = document.querySelector('.center');
      if (!ct || ct._scrollObserverInit) return;
      ct._scrollObserverInit = true;

      ct._autoScrollEnabled = true;

      // 用户滚动检测：上滚时禁用自动滚动（永不自动恢复）
      ct.addEventListener(
        'scroll',
        function () {
          var threshold = 60;
          var atBottom = ct.scrollTop + ct.clientHeight >= ct.scrollHeight - threshold;
          if (!atBottom) ct._autoScrollEnabled = false;
        },
        { passive: true },
      );

      var observer = new MutationObserver(function () {
        if (!ct._autoScrollEnabled) return;
        requestAnimationFrame(function () {
          ct.scrollTop = ct.scrollHeight;
        });
      });
      observer.observe(ct, { childList: true, subtree: true, attributes: false });
    })();

    var now = new Date();
    var h = now.getHours();
    var g = h < 9 ? '早上好' : h < 12 ? '上午好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
    chatAppend(
      '<div class="init-welcome">' +
        '<div class="iw-hero">' +
        '<div class="iw-hero-title">' +
        g +
        '，站长。</div>' +
        '<div class="iw-hero-desc">我是小安。正在接管你的日常监管节奏——我会按日常节奏巡检整体态势、重大隐患、专项进度、重点主体和团队履职情况。需要你判断的事项会进入总控台。</div>' +
        '<div class="iw-role"><div class="iw-row"><span>当前角色</span><span>良渚街道应急消防工作站站长</span></div><div class="iw-row"><span>管辖范围</span><span>良渚街道</span></div><div class="iw-row"><span>关注对象</span><span>主体对象 / 隐患 / 任务 / 履职</span></div></div></div>' +
        '</div>',
    );
    setTimeout(function () {
      typeText('我们先完成初始化设置，把日常监管安排起来。准备好了吗？', function () {
        showActions([{ label: '准备好了', click: 'YAQ.doWelcomeNext()' }]);
        refreshIcons('initOverlay');
      });
    }, 600);
  }
  function doWelcomeNext() {
    showActions([]);
    chatAppend(userMsg('准备好了'));
    setTimeout(function () {
      typeText('好的。在正式开始之前，我先介绍一下我能在哪些方面协助你的日常工作。', function () {
        chatAppend(
          '<div class="ability-grid" style="margin-top:4px">' +
            '<div class="ability-card"><div class="ac-icon blue">盯</div><div class="ac-title">帮你盯</div><div class="ac-desc">重大隐患、重点主体、专项进度、团队履职。</div></div>' +
            '<div class="ability-card"><div class="ac-icon green">判</div><div class="ac-title">帮你判断</div><div class="ac-desc">区分普通波动、待确认事项和重大风险。</div></div>' +
            '<div class="ability-card"><div class="ac-icon orange">整</div><div class="ac-title">帮你整理</div><div class="ac-desc">态势简报、隐患日报、履职简报、会议材料。</div></div>' +
            '<div class="ability-card"><div class="ac-icon red">推</div><div class="ac-title">帮你推动</div><div class="ac-desc">督办、会议议题、现场核查、持续跟踪。</div></div>' +
            '<div class="ability-card"><div class="ac-icon purple">醒</div><div class="ac-title">帮你提醒</div><div class="ac-desc">只在需要关注、判断或处置时推送。</div></div>' +
            '<div class="ability-card"><div class="ac-icon blue">问</div><div class="ac-title">你可直接问</div><div class="ac-desc">支持文字或语音追问、查询、调整口径。</div></div>' +
            '</div>',
        );
        // 能力介绍完后，AI 主动提问，衔接下方的快捷输入
        typeText('需要我来帮你配置关注的方向么？', function () {
          showActions([{ label: '好的，开始配置', click: 'YAQ.doContinueAbility()' }]);
        });
        refreshIcons('initOverlay');
      });
    }, 350);
  }
  // ═══ 用户选偏好（多选） ═══════════════════════════════════════════
  var selectedModes = ['daily_risk', 'major_hazard', 'special_task', 'key_subject'];

  function doContinueAbility() {
    showActions([]);
    chatAppend(userMsg('好的，继续'));
    setTimeout(function () {
      typeText('根据你的岗位，我已整理以下日常关注方向。<br><br><strong>勾选你需要的即可：</strong>', function () {
        renderPrefCards();
      });
    }, 350);
  }

  function renderPrefCards() {
    // 合并版：第一个卡片的壳 + 第二个卡片的多选内容，一步搞定
    var html =
      '<div class="pref-card-wrap" id="prefGrid">' +
      '<div class="step-head-compact"><strong>配置关注方向</strong> — 勾选你需要的，或输入自定义项</div>' +
      '<div class="attn-list">';
    // 预设项 — 只渲染已在 selectedModes 中的（默认 4 个）
    for (var i = 0; i < PREF_OPTIONS.length; i++) {
      var p = PREF_OPTIONS[i];
      if (selectedModes.indexOf(p.id) === -1) continue;
      html +=
        '<div class="attn-card selected" data-id="' +
        p.id +
        '" onclick="YAQ.togglePref(\'' +
        p.id +
        '\')">' +
        '<div class="attn-check">✓</div>' +
        '<div class="attn-body">' +
        '<div class="attn-title">' +
        p.label +
        '</div>' +
        '<div class="attn-desc">' +
        p.sub +
        '</div>' +
        '</div>' +
        '<div class="attn-period">' +
        p.period +
        '</div>' +
        '</div>';
    }
    // 自定义项
    for (var ci = 0; ci < customAttentions.length; ci++) {
      var ca = customAttentions[ci];
      html +=
        '<div class="attn-card selected custom-card" data-id="' +
        ca.id +
        '" onclick="YAQ.toggleCustom(\'' +
        ca.id +
        '\')">' +
        '<div class="attn-check">✓</div>' +
        '<div class="attn-body">' +
        '<div class="attn-title">' +
        ca.label +
        '</div>' +
        '<div class="attn-desc">' +
        (ca.desc || '自定义关注') +
        '</div>' +
        '</div>' +
        '<div class="attn-period">' +
        (ca.period || '自定义') +
        '</div>' +
        '<button class="attn-remove" onclick="event.stopPropagation();YAQ.removeCustom(\'' +
        ca.id +
        '\')" title="移除">✕</button>' +
        '</div>';
    }
    html += '</div>' + '<button class="card-confirm-btn" onclick="YAQ.confirmPref()">确认关注方向</button>' + '</div>';
    // 渲染到浮动卡片（输入框上方），不嵌入聊天流
    var floatCard = document.getElementById('initFloatCard');
    if (floatCard) floatCard.innerHTML = html;
    refreshIcons('initOverlay');
  }

  function confirmPref() {
    showActions([]);
    userMode = 'default';
    chatAppend(userMsg('确认关注方向'));
    // 清除浮动卡片
    var floatCard = document.getElementById('initFloatCard');
    if (floatCard) floatCard.innerHTML = '';
    setTimeout(function () {
      typeResponse('正在生成管理方案…', buildCombinedResponse(), function () {
        setTimeout(function () {
          // 直接进入生成阶段，基于已选方向生成个性化消息
          // 基于已选方向生成任务列表
          var genTasks = [];
          for (var si = 0; si < selectedModes.length; si++) {
            var p = PREF_OPTIONS.filter(function (x) {
              return x.id === selectedModes[si];
            })[0];
            if (p) genTasks.push({ label: p.label, time: p.period });
          }
          showGenTasks(genTasks);
        }, 600);
      });
    }, 350);
  }

  function togglePref(id) {
    var idx = selectedModes.indexOf(id);
    if (idx > -1) {
      selectedModes.splice(idx, 1);
      if (selectedModes.length === 0) selectedModes.push('daily_risk');
    } else {
      selectedModes.push(id);
    }
    // 切换选中状态，卡片保留不消失
    var el = document.querySelector('.attn-card[data-id="' + id + '"]');
    if (el) {
      var sel = selectedModes.indexOf(id) > -1;
      el.className = 'attn-card' + (sel ? ' selected' : '');
      var chk = el.querySelector('.attn-check');
      if (chk) chk.textContent = sel ? '✓' : '';
    }
  }

  // ─── 自定义关注项 ──────────────────────────────────────────
  function toggleCustom(id) {
    for (var i = 0; i < customAttentions.length; i++) {
      if (customAttentions[i].id === id) {
        customAttentions.splice(i, 1);
        break;
      }
    }
    var el = document.querySelector('.attn-card[data-id="' + id + '"]');
    if (el) el.remove();
  }
  function removeCustom(id) {
    toggleCustom(id);
  }

  function addCustomAttention(label) {
    customIdCounter++;
    var id = 'c_' + customIdCounter;
    customAttentions.push({ id: id, label: label, desc: '自定义关注', period: '自定义' });
    // 渲染新卡片
    var list = document.querySelector('#prefGrid .attn-list');
    if (list) {
      var card = document.createElement('div');
      card.className = 'attn-card selected custom-card';
      card.setAttribute('data-id', id);
      card.setAttribute('onclick', "YAQ.toggleCustom('" + id + "')");
      card.style.animation = 'fadeUp .35s ease-out both';
      card.innerHTML =
        '<div class="attn-check">✓</div><div class="attn-body"><div class="attn-title">' +
        escapeHtml(label) +
        '</div><div class="attn-desc">自定义关注</div></div><div class="attn-period">自定义</div><button class="attn-remove" onclick="event.stopPropagation();YAQ.removeCustom(\'' +
        id +
        '\')" title="移除">✕</button>';
      list.appendChild(card);
      scrollChatToBottom();
    }
    refreshIcons('initOverlay');
  }

  function showGenTasks(tasks) {
    var i = 0;
    function nextTask() {
      if (i >= tasks.length) {
        // 全部任务展示完成后，出总结
        setTimeout(function () {
          chatAppend(agentMsg('异常提醒规则已配置——普通波动进入动态，重大风险主动提醒。'));
          setTimeout(function () {
            chatAppend(
              '<div class="c-row agent"><div class="agent-text" style="font-size:15px;font-weight:700;color:#1e293b;padding:4px 0">🎉 智能化监管已开启！' +
                tasks.length +
                ' 个巡检任务已启动，日常监管工作已安排就绪。</div></div>',
            );
            // 简洁庆祝彩带效果
            chatAppend('<div class="confetti-wrap" id="confettiEffect"></div>');
            setTimeout(function () {
              fireConfetti();
            }, 200);
            setTimeout(function () {
              showActions([{ label: '开始今日监管 →', click: 'YAQ.doEnter()' }]);
              refreshIcons('initOverlay');
            }, 500);
          }, 500);
        }, 400);
        return;
      }
      var t = tasks[i];
      chatAppend(
        '<div class="gen-task" style="animation:fadeUp .3s ease-out both;animation-delay:0s">' +
          '<div class="gen-task-dot"></div>' +
          '<div class="gen-task-body">' +
          '<div class="gen-task-name">' +
          t.label +
          '</div>' +
          '<div class="gen-task-time">' +
          t.time +
          '</div>' +
          '</div>' +
          '<div class="gen-task-status">已开启</div>' +
          '</div>',
      );
      refreshIcons('initOverlay');
      i++;
      setTimeout(nextTask, 350);
    }
    // 先出一条总起消息
    chatAppend(agentMsg('正在启动日常巡检任务…'));
    setTimeout(nextTask, 400);
  }

  // ─── 简易彩带庆祝效果 ────────────────────────────────────
  function fireConfetti() {
    var wrap = document.getElementById('confettiEffect');
    if (!wrap) return;
    var colors = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed'];
    var html = '';
    for (var i = 0; i < 20; i++) {
      var c = colors[i % colors.length];
      html +=
        '<div class="cf" style="left:' +
        (10 + Math.random() * 80) +
        '%;width:' +
        (4 + Math.random() * 4) +
        'px;height:' +
        (4 + Math.random() * 4) +
        'px;background:' +
        c +
        ';animation-delay:' +
        Math.random() * 0.8 +
        's;animation-duration:' +
        (1.2 + Math.random() * 0.8) +
        's"></div>';
    }
    wrap.innerHTML = html;
    setTimeout(function () {
      if (wrap) wrap.innerHTML = '';
    }, 3000);
  }

  function buildCombinedResponse() {
    var items = [];
    for (var i = 0; i < selectedModes.length; i++) {
      var p = PREF_OPTIONS.filter(function (x) {
        return x.id === selectedModes[i];
      })[0];
      if (p) items.push(p);
    }
    if (items.length === 0) return '已记录，后续可随时调整。';
    var html = '已确认 ' + items.length + ' 个关注方向，将按以下节奏自动巡检：<br><br>';
    for (i = 0; i < items.length; i++) {
      html +=
        '• <strong>' +
        items[i].label +
        '</strong><br><span style="color:#64748b;font-size:12px">' +
        items[i].period +
        ' — ' +
        items[i].sub +
        '</span><br><br>';
    }
    html += '巡检结果会自动汇总到总控台，发现异常会按规则推送到对应区域。<br>关注项和巡检节奏后续可随时调整。';
    return html;
  }

  // ═══ 关注项 / 提醒边界 ═════════════════════════════════════════════
  function doContinue(phase) {
    showActions([]);
    if (phase === 'attention') {
      chatAppend(userMsg('调整关注重点'));
      setTimeout(function () {
        typeText('以下默认关注项，点掉不需要的我自动调整推送方式。也可以在直接在输入框告诉我。', function () {
          var html = '<div class="attn-list" id="attentionToggles">';
          for (var i = 0; i < attentionItems.length; i++) {
            var a = attentionItems[i];
            html +=
              '<div class="attn-card' +
              (a.on ? ' selected' : '') +
              '" data-id="' +
              a.id +
              '" onclick="YAQ.togAttn(\'' +
              a.id +
              '\')"><div class="attn-check">' +
              (a.on ? '✓' : '') +
              '</div><div class="attn-body"><div class="attn-title">' +
              a.title +
              '</div><div class="attn-desc">' +
              a.desc +
              '</div></div></div>';
          }
          html += '</div>';
          chatAppend(html);
          showActions([{ label: '继续设置提醒边界', click: 'YAQ.doContinue("boundary")' }]);
          refreshIcons('initOverlay');
        });
      }, 350);
    } else if (phase === 'boundary') {
      chatAppend(userMsg('继续设置提醒边界'));
      setTimeout(function () {
        var msg =
          userMode === 'low_interrupt'
            ? '低打扰模式已启用。最后看一下四级推送规则。'
            : '最后看一下推送规则。我不会把所有结果都推给你——只有需要关注的才会进入总控台。';
        typeText(msg, function () {
          var ruleHtml = '<div class="rule-list">';
          var rules = [
            { n: '普通完成', h: '只进入运行记录', e: '每日态势简报正常生成', c: 'level-gray' },
            { n: '轻微异常', h: '进入总控动态', e: '片区隐患闭环率轻微下降', c: 'level-orange' },
            { n: '需要判断', h: '进入待我确认', e: '专项行动明显滞后、隐患整改证据不足', c: 'level-blue' },
            { n: '重大风险', h: '主动提醒并建议行动', e: '重大隐患超期未闭环、多主体集中异常', c: 'level-red' },
          ];
          for (var i = 0; i < rules.length; i++) {
            var r = rules[i];
            var hl = userMode === 'low_interrupt' && i === 3 ? ' highlighted' : '';
            ruleHtml +=
              '<div class="rule-card ' +
              r.c +
              hl +
              '"><div class="rule-n">' +
              r.n +
              '</div><div class="rule-h">' +
              r.h +
              '</div><div class="rule-e">' +
              r.e +
              '</div></div>';
          }
          ruleHtml += '</div>';
          chatAppend(ruleHtml);
          showActions([{ label: '生成管理心跳计划', click: 'YAQ.doGenerate()', large: true }]);
          refreshIcons('initOverlay');
        });
      }, 350);
    }
  }
  function togAttn(id) {
    for (var i = 0; i < attentionItems.length; i++) {
      if (attentionItems[i].id === id) {
        attentionItems[i].on = !attentionItems[i].on;
        var el = document.querySelector('.attn-card[data-id="' + id + '"]');
        if (el) {
          el.className = 'attn-card' + (attentionItems[i].on ? ' selected' : '');
          el.querySelector('.attn-check').textContent = attentionItems[i].on ? '✓' : '';
        }
        break;
      }
    }
  }
  function doQuickFinish() {
    showActions([]);
    chatAppend(userMsg('直接生成方案'));
    typeText('好的，跳过微调，直接按你的偏好生成方案。', function () {
      setTimeout(function () {
        doGenerate();
      }, 400);
    });
  }

  // ═══ 生成 ══════════════════════════════════════════════════════════
  function doGenerate() {
    showActions([]);
    chatAppend(userMsg('生成管理心跳计划'));
    // 使用已选方向或默认任务
    var modeTasks = [];
    if (selectedModes && selectedModes.length > 0) {
      for (var si = 0; si < selectedModes.length; si++) {
        var p = PREF_OPTIONS.filter(function (x) {
          return x.id === selectedModes[si];
        })[0];
        if (p) modeTasks.push({ label: p.label, time: p.period });
      }
    }
    if (modeTasks.length === 0) {
      modeTasks = [
        { label: '今天有没有必须处理的安全风险', time: '每天 08:30' },
        { label: '重大隐患是否闭环', time: '每天 10:00' },
        { label: '专项行动是否滞后', time: '每天 14:00' },
        { label: '重点主体对象是否异常', time: '每天 11:00' },
        { label: '团队履职是否异常', time: '每天 16:30' },
      ];
    }
    showGenTasks(modeTasks);
  }

  // ═══ 完成 ══════════════════════════════════════════════════════════
  function showDone() {
    var modeTitle = {
      default: '已生成默认管理心跳计划',
      major_hazard: '已生成重大隐患优先管理心跳计划',
      special_task: '已生成专项进度优先管理心跳计划',
      low_interrupt: '已生成低打扰巡检计划',
      meeting_material: '已生成会前材料增强计划',
    };
    var directionLabels = {
      default: '安全态势、重大隐患、专项行动、重点主体、团队履职',
      major_hazard: '重大隐患闭环（超期、临时管控、整改方案）',
      special_task: '专项行动进度（完成率、滞后情况、责任条线）',
      low_interrupt: '重大风险提醒（仅需要拍板的事）',
      meeting_material: '会前材料整理（议题摘要、发言提纲）',
    };
    var html = '';
    html +=
      '<div class="done-scene">' +
      '<div class="done-icon"><i data-lucide="check" width="28" height="28"></i></div>' +
      '<div class="done-title">' +
      (modeTitle[userMode] || modeTitle.default) +
      '</div>' +
      '<div class="done-list">' +
      '<div class="done-item"><i data-lucide="check-circle" width="16" height="16"></i><span>已覆盖：' +
      (directionLabels[userMode] || directionLabels.default) +
      '</span></div>' +
      '<div class="done-item"><i data-lucide="check-circle" width="16" height="16"></i><span>每日常规检查已安排</span></div>' +
      '<div class="done-item"><i data-lucide="check-circle" width="16" height="16"></i><span>' +
      (userMode === 'low_interrupt' ? '只在需要你判断时提醒' : '发现异常会自动推送给你') +
      '</span></div>' +
      '<div class="done-item"><i data-lucide="check-circle" width="16" height="16"></i><span>下一次检查：今日 10:00</span></div>' +
      '</div></div>';
    chatAppend(html);
    showActions([{ label: '开始今日监管 →', click: 'YAQ.doEnter()', large: true }]);
    refreshIcons('initOverlay');
    window._initUserMode = userMode;
  }

  // ═══ 进入总控台 ═══════════════════════════════════════════════════
  function doEnter() {
    showActions([]);
    ls.set(STORAGE_KEY, 'true');
    // 切换输入条到通用模式
    if (window.YAQ && window.YAQ.updateGlobalInputBar) {
      window.YAQ.updateGlobalInputBar({
        placeholder: '直接问小安，例如：帮我看一下物流片区为什么隐患闭环率下降',
        sendCommand: 'globalChatSend',
      });
    }
    // 关闭初始化浮窗，进入日常工作台
    var ov = document.getElementById('initOverlay');
    if (ov) {
      ov.classList.remove('active');
      ov.style.display = 'none';
    }
    // 渲染工作台 + 在后台初始化统一对话引擎
    if (window.renderScene) window.renderScene('dashboard');
    if (window.YAQ && window.YAQ.UnifiedChat) {
      window.YAQ.UnifiedChat.reset();
      window.YAQ.UnifiedChat.initialize({
        quickChips: [
          { label: '分析超期未闭环原因', text: '分析一下隐患闭环未关闭的原因' },
          { label: '帮我看看今天的隐患情况', text: '帮我看看今天的重大隐患情况' },
          { label: '查看行动建议', text: '查看行动建议' },
        ],
      });
    }
  }

  // ═══ 追加日常工作台三大板块到对话流 ─────────────────────
  function appendDailyOverview() {
    if (typeof window.renderDashboard !== 'function') {
      sceneAppend(
        '<div class="c-row agent"><div class="agent-text" style="font-size:13px;color:#64748b">日常监管已就绪，你可以直接输入问题。</div></div>',
      );
      return;
    }
  }
  // ═══ 过程步骤渲染：支持分类标签 ═════════════════════════════
  function processStepHTML(step, done) {
    var tags = {
      think: { label: '思考', color: '#7c3aed', bg: '#f5f3ff' },
      tool: { label: '工具', color: '#2563eb', bg: '#eff6ff' },
      query: { label: '查询', color: '#16a34a', bg: '#f0fdf4' },
      skill: { label: '技能', color: '#d97706', bg: '#fffbeb' },
      search: { label: '搜索', color: '#dc2626', bg: '#fef2f2' },
      generate: { label: '生成', color: '#0891b2', bg: '#ecfeff' },
    };
    var t = tags[step.category] || tags.think;
    var suffix = done
      ? '<span style="margin-left:auto;font-weight:700;color:#16a34a">✓</span>'
      : '<span class="thinking-dot" style="width:5px;height:5px;border-radius:50%;background:' +
        t.color +
        ';display:inline-block;animation:pulse 1s infinite;margin-left:auto"></span>';
    return (
      '<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:' +
      (done ? '#16a34a' : '#64748b') +
      ';padding:5px 0">' +
      '<span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;padding:1px 6px;border-radius:4px;color:' +
      t.color +
      ';background:' +
      t.bg +
      ';flex-shrink:0">' +
      step.icon +
      ' ' +
      t.label +
      '</span> ' +
      step.text +
      suffix +
      '</div>'
    );
  }

  // ═══ 追加日常工作台三大板块到对话流 ─────────────────────
  function appendDailyOverview() {
    if (typeof window.renderDashboard !== 'function') {
      sceneAppend(
        '<div class="c-row agent"><div class="agent-text" style="font-size:13px;color:#64748b">日常监管已就绪，你可以直接输入问题。</div></div>',
      );
      return;
    }

    var thinkSteps = [
      { icon: '🧠', text: '正在采集安全态势数据…', category: 'query' },
      { icon: '🔧', text: '调用隐患分析技能解析风险分布…', category: 'skill' },
      { icon: '⚡', text: '正在生成综合分析报告…', category: 'generate' },
    ];
    // 初始渲染第一个步骤
    var thinkHtml =
      '<div class="c-row agent" id="thinkingRow"><div class="c-bubble" style="background:#f8fafc;border-color:#e2e8f0;padding:12px 16px">' +
      '<div id="thinkingSteps">' +
      processStepHTML(thinkSteps[0]) +
      '</div></div></div>';
    sceneAppend(thinkHtml);

    // 解析仪表板为三大板块
    var dashboardHTML = window.renderDashboard(true);
    var temp = document.createElement('div');
    temp.innerHTML = dashboardHTML;
    var sections = [];
    for (var ci = 0; ci < temp.children.length; ci++) {
      sections.push(temp.children[ci].outerHTML);
    }
    var floorSize = Math.ceil(sections.length / thinkSteps.length);
    var floors = [];
    for (var bi = 0; bi < thinkSteps.length; bi++) {
      var start = bi * floorSize;
      floors.push(sections.slice(start, start + floorSize).join(''));
    }

    // 已经完成的步骤收集到这里
    var doneSteps = [];
    var stepIdx = 0;
    function showNextStep() {
      if (stepIdx >= thinkSteps.length) {
        var row = document.getElementById('thinkingRow');
        if (row) row.remove();
        sceneAppend(
          QuickChip.render(
            [
              { label: '分析超期未闭环原因', text: '分析一下隐患闭环未关闭的原因' },
              { label: '督办超期企业', text: '督办超期未整改的企业' },
              { label: '查看行动建议', text: '查看行动建议' },
            ],
            { variant: 'inline' },
          ),
        );
        refreshIcons();
        return;
      }
      // 展现当前楼层卡片
      if (stepIdx < floors.length) {
        sceneAppend(floors[stepIdx]);
      }
      // 标记当前步骤完成
      doneSteps.push(thinkSteps[stepIdx]);
      stepIdx++;
      // 刷新步骤列表：已完成 + 进行中
      var steps = document.getElementById('thinkingSteps');
      if (steps) {
        var inner = '';
        for (var di = 0; di < doneSteps.length; di++) {
          inner += processStepHTML(doneSteps[di], true);
        }
        if (stepIdx < thinkSteps.length) {
          inner += processStepHTML(thinkSteps[stepIdx], false);
        }
        steps.innerHTML = inner;
      }
      setTimeout(showNextStep, stepIdx >= thinkSteps.length ? 800 : 900 + Math.random() * 400);
    }
    setTimeout(showNextStep, 600);
  }

  // ═══ 首次诊断：简单的欢迎 + 快捷入口 ─────────────────────
  function startFirstDiagnosis() {
    var sc = document.getElementById('sceneContent');
    if (!sc) return;
    sc.innerHTML = '';

    // 简短的欢迎信息
    var html = '';
    html +=
      '<div class="c-row agent"><div class="agent-text" style="font-size:15px;font-weight:700;color:#1e293b;padding:8px 0 2px">杨站长，欢迎来到应急监管工作台</div></div>';
    html +=
      '<div class="c-row agent"><div class="agent-text" style="font-size:13px;color:#64748b;line-height:1.6">日常监管工作将从这里展开。你可以直接提问，或者选择以下快捷入口开始：</div></div>';
    sceneAppend(html);

    // 快捷芯片
    var chips = [
      { label: '分析当前安全态势', text: '分析一下当前的安全态势' },
      { label: '查看超期隐患', text: '哪些隐患超期未整改？' },
      { label: '物流片区分析', text: '看一下物流片区的监管数据' },
      { label: '团队履职情况', text: '看一下团队的履职情况' },
    ];
    sceneAppend(QuickChip.render(chips, { variant: 'inline' }));
  }

  // ═══ 全局输入处理 ═════════════════════════════════════════════════
  function processVoiceInsert(insertId, voiceText) {
    if (voiceText) appendBelowCard(voiceMsg(voiceText));
    setTimeout(function () {
      setTimeout(function () {
        if (selectedModes.indexOf(insertId) === -1) {
          selectedModes.push(insertId);
          var grid = document.querySelector('#prefGrid .attn-list');
          if (grid) {
            var p = PREF_OPTIONS.filter(function (x) {
              return x.id === insertId;
            })[0];
            if (p) {
              var card = document.createElement('div');
              card.className = 'attn-card selected';
              card.setAttribute('data-id', insertId);
              card.setAttribute('onclick', "YAQ.togglePref('" + insertId + "')");
              card.innerHTML =
                '<div class="attn-check">✓</div><div class="attn-body"><div class="attn-title">' +
                escapeHtml(p.label) +
                '</div><div class="attn-desc">' +
                escapeHtml(p.sub) +
                '</div></div><div class="attn-period">' +
                escapeHtml(p.period) +
                '</div>';
              card.style.animation = 'fadeUp .35s ease-out both';
              grid.appendChild(card);
              scrollChatToBottom();
            }
          }
        }
        appendBelowCard(agentMsg('好的，已加上。'));
        refreshIcons('initOverlay');
      }, 500);
    }, 600);
  }

  /** 在浮动卡片（选择器）下方追加反馈文本 */
  function appendBelowCard(html) {
    var floatCard = document.getElementById('initFloatCard');
    if (!floatCard) return;
    var wrap = document.getElementById('cardFeedback');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'cardFeedback';
      wrap.style.cssText = 'margin-top:8px;display:flex;flex-direction:column;gap:4px';
      floatCard.appendChild(wrap);
    }
    wrap.insertAdjacentHTML('beforeend', html);
    // DOM 更新后滚动到 chatBox 底部
    scrollChatToBottom();
  }

  function convChatSend() {
    var input = document.getElementById('globalChatInput');
    if (!input || !input.value.trim()) return;
    var val = input.value.trim();
    input.value = '';

    // 移除之前的快捷芯片
    var oldChips = document.querySelector('.quick-chips-row');
    if (oldChips) oldChips.remove();

    chatAppend(userMsg(val));
    var mode;
    // 检测"月报/报告"模式
    var reportMatch = null;
    if (/月报|报告|月度/.test(val)) reportMatch = 'monthly_report';
    // 检测"关注 + 具体事项"模式
    var focusMatch = null;
    if (/关注|加上|还要|增加/.test(val)) {
      if (/团队履职|履职/.test(val)) focusMatch = 'team_duty';
      else if (/重大隐患|隐患/.test(val)) focusMatch = 'major_hazard';
      else if (/专项行动|专项/.test(val)) focusMatch = 'special_task';
      else if (/重点主体|主体/.test(val)) focusMatch = 'key_subject';
      else if (/安全风险|风险/.test(val)) focusMatch = 'daily_risk';
    }
    var insertId = focusMatch || reportMatch;
    if (insertId) {
      processVoiceInsert(insertId);
      return;
    }
    // ═══ 自定义关注项：在关注确认屏输入任意文本 → 添加为自定义关注 ═══
    var prefGrid = document.getElementById('prefGrid');
    if (prefGrid) {
      // 清理词汇：去掉"帮我""帮我盯着""看看""关注"等前缀
      var clean = val.replace(/^(帮我|帮我盯着|帮我看看|帮我留意|看看|关注|盯紧|盯住|盯着|留意|注意)\s*/, '');
      if (clean.length < 2) clean = val;
      addCustomAttention(clean);
      return;
    }
    if (/隐患|超期|闭环|重大/.test(val)) mode = 'major_hazard';
    else if (/专项|任务|进度|滞后/.test(val)) mode = 'special_task';
    else if (/少|别烦|安静|轻|低/.test(val)) mode = 'low_interrupt';
    else if (/会议|材料|议题|发言|月报|报告/.test(val)) mode = 'meeting_material';
    else if (/什么|帮|功能|干|盯/.test(val)) mode = 'what';
    if (mode && mode !== 'what') {
      userMode = mode;
      setTimeout(function () {
        typeResponse('正在按你的要求调整…', MODE_RESPONSES[mode] || MODE_RESPONSES.default, function () {
          showActions([
            { label: '调整关注重点', click: 'YAQ.doContinue("attention")' },
            { label: '直接生成方案', click: 'YAQ.doQuickFinish()' },
          ]);
          refreshIcons('initOverlay');
        });
      }, 350);
    } else if (mode === 'what') {
      setTimeout(function () {
        typeResponse(
          '正在整理能力清单…',
          '在日常监管中，我可以：<br><br>• <strong>盯</strong> — 重大隐患、重点主体、专项进度、团队履职<br>• <strong>判</strong> — 区分正常波动、待确认和重大风险<br>• <strong>整</strong> — 态势简报、隐患日报、会议材料、月报草稿<br>• <strong>推</strong> — 督办提议、会议议题、现场核查<br>• <strong>醒</strong> — 只在需要你关注时推送<br><br>你现在最想让我先盯什么？',
          function () {
            refreshIcons('initOverlay');
          },
        );
      }, 350);
    } else {
      setTimeout(function () {
        typeResponse('正在同步你的偏好…', '好的，已记录。有什么需要调整的随时告诉我。', function () {
          refreshIcons('initOverlay');
        });
      }, 350);
    }
  }
  function convChatVoice() {
    var input = document.getElementById('globalChatInput');
    if (!input) return;
    // 检测当前页面上下文，决定模拟内容
    var prefGrid = document.getElementById('prefGrid');
    if (prefGrid) {
      var stepVoice = window._voiceStep || 0;
      // 前两步：添加关注项 — 语音识别后自动添加到卡片列表
      if (stepVoice < 2) {
        var voiceTexts = ['我还想关注 团队履职是否异常', '帮我生成每月的安全月报'];
        var voiceIds = ['team_duty', 'monthly_report'];
        window._voiceStep = stepVoice + 1;
        processVoiceInsert(voiceIds[stepVoice], voiceTexts[stepVoice]);
        return;
      }
      // 第三步：修改月报时间
      if (stepVoice === 2) {
        window._voiceStep = 3;
        setTimeout(function () {
          // 更新数据
          for (var i = 0; i < PREF_OPTIONS.length; i++) {
            if (PREF_OPTIONS[i].id === 'monthly_report') {
              PREF_OPTIONS[i].period = '每月 28 日';
              break;
            }
          }
          // 更新 DOM 中的卡片
          var periodEl = document.querySelector('.attn-card[data-id="monthly_report"] .attn-period');
          if (periodEl) periodEl.textContent = '每月 28 日';
          // 回复
          appendBelowCard(
            '<div class="c-row agent"><div class="agent-text">好的，已调整。月报改为每月 28 日生成。</div></div>',
          );
          refreshIcons('initOverlay');
        }, 600);
        return;
      }
    }
    // 默认语音：将文本填入输入框并发送
    var input = document.getElementById('globalChatInput');
    if (input) {
      input.value = '帮我盯好重大隐患，别让超期的漏掉。';
      var event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
      var cmd = input.getAttribute('data-cmd');
      var fn = (window.YAQ && window.YAQ[cmd]) || window[cmd];
      if (typeof fn === 'function') fn();
    }
  }

  // ═══ 底部快捷回复 ══════════════════════════════════════════════════
  function convQuickReply(text) {
    chatAppend(userMsg(text));
    convChatSend();
  }

  // ═══ Skip ══════════════════════════════════════════════════════════
  function skip() {
    showActions([]);
    chatAppend(userMsg('稍后再说'));
    var overlay = document.getElementById('initOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.style.display = 'none';
    }
    var mainEl = document.querySelector('.main');
    if (mainEl) mainEl.style.display = 'flex';
    showDisabledBar();
  }
  function showDisabledBar() {
    var ws = document.getElementById('workspace');
    if (!ws || document.getElementById('disabledBar')) return;
    var bar = document.createElement('div');
    bar.id = 'disabledBar';
    bar.className = 'agent-disabled-bar';
    bar.innerHTML =
      '<i data-lucide="alert-triangle" width="16" height="16"></i><span>小安尚未启用，当前仅展示基础工作台。</span><button class="adb-btn" onclick="YAQ.reEnable()">启用主控 Agent</button>';
    ws.insertBefore(bar, ws.firstChild);
    refreshIcons(ws);
  }
  function reEnable() {
    var bar = document.getElementById('disabledBar');
    if (bar) bar.remove();
    ls.remove(STORAGE_KEY);
    location.reload();
  }
  function resetInit() {
    ls.remove(STORAGE_KEY);
    location.reload();
  }

  // ═══ Sheet ═════════════════════════════════════════════════════════
  function showSheet(title, text, result) {
    var overlay = document.getElementById('initOverlay');
    if (!overlay) return;
    var old = document.getElementById('convSheet');
    if (old) old.remove();
    var oldm = document.getElementById('convSheetMask');
    if (oldm) oldm.remove();
    var m = document.createElement('div');
    m.id = 'convSheetMask';
    m.className = 'conv-sheet-mask';
    m.onclick = closeSheet;
    var s = document.createElement('div');
    s.id = 'convSheet';
    s.className = 'conv-sheet';
    s.innerHTML =
      '<div class="conv-sheet-handle"></div><div class="conv-sheet-title">' +
      escapeHtml(title) +
      '</div><div class="conv-sheet-text">' +
      escapeHtml(text) +
      '</div><div class="conv-sheet-result"><div class="conv-sheet-result-label">处理结果</div><p>' +
      escapeHtml(result) +
      '</p></div><button class="c-btn primary sheet-close" onclick="YAQ.closeSheet()">知道了</button>';
    overlay.appendChild(m);
    overlay.appendChild(s);
    setTimeout(function () {
      m.classList.add('show');
      s.classList.add('show');
    }, 10);
  }
  function closeSheet() {
    var m = document.getElementById('convSheetMask');
    var s = document.getElementById('convSheet');
    if (m) m.classList.remove('show');
    if (s) s.classList.remove('show');
    setTimeout(function () {
      if (m) m.remove();
      if (s) s.remove();
    }, 300);
  }

  // ═══ Dashboard HTML ════════════════════════════════════════════════
  function renderAgentEnabledHTML() {
    var mode = window._initUserMode || 'default';
    var ac = 0;
    for (var i = 0; i < agents.length; i++) {
      if (agents[i].on) ac++;
    }
    var label = MODE_LABELS[mode] || MODE_LABELS.default;
    var intents = [
      '今天有没有必须处理的事',
      '看重大隐患有没有超期',
      '看专项行动是否滞后',
      '看重点主体对象有没有异常',
      '看团队履职有没有异常',
      '准备明天会议材料',
      '生成本月监管报告草稿',
    ];
    var html = '';
    html +=
      '<div class="agent-enabled-bar"><div class="aeb-left"><i data-lucide="bot" width="18" height="18"></i><span>小安已启用 <span class="aeb-mode">· ' +
      label +
      '</span></span></div><div class="aeb-meta"><span><i data-lucide="activity" width="12" height="12"></i> ' +
      ac +
      ' 个子 Agent</span><span><i data-lucide="clock" width="12" height="12"></i> 下次巡检：今日 10:00</span></div></div>';
    html += '<div class="intent-section"><div class="intent-label">你可以让我继续看</div><div class="intent-grid">';
    for (var i = 0; i < intents.length; i++) {
      html +=
        '<div class="intent-chip" onclick="YAQ.doIntent(\'' + intents[i] + '\')"><span>' + intents[i] + '</span></div>';
    }
    html += '</div></div>';
    return html;
  }
  function doIntent(label) {
    showToast('正在查看「' + label + '」…（演示回复）');
  }
  function doDashboardRedirect() {
    // 关闭初始化浮窗
    var ov = document.getElementById('initOverlay');
    if (ov && ov.classList.contains('active')) {
      ov.classList.remove('active');
      ov.style.display = 'none';
    }
    // 进入初始化工作台（诊断视图）
    var sc = document.getElementById('sceneContent');
    if (sc) sc.innerHTML = '';
    setTimeout(function () {
      startFirstDiagnosis();
    }, 200);
  }
  function doNormalDashboard() {
    // 关闭初始化浮窗
    var ov = document.getElementById('initOverlay');
    if (ov && ov.classList.contains('active')) {
      ov.classList.remove('active');
      ov.style.display = 'none';
    }
    // 渲染工作台 + 初始化统一对话引擎
    if (window.renderScene) window.renderScene('dashboard');
    if (window.YAQ && window.YAQ.UnifiedChat) {
      window.YAQ.UnifiedChat.reset();
      window.YAQ.UnifiedChat.initialize({
        quickChips: [
          { label: '分析超期未闭环原因', text: '分析一下隐患闭环未关闭的原因' },
          { label: '帮我看看今天的隐患情况', text: '帮我看看今天的重大隐患情况' },
          { label: '查看行动建议', text: '查看行动建议' },
        ],
      });
    }
  }
  // showToast — 复用 YAQ.showToast，保留降级兜底
  var showToast = function (text) {
    if (window.YAQ && window.YAQ.showToast) return window.YAQ.showToast(text);
    var t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.className = 'toast show';
    setTimeout(function () {
      t.className = 'toast';
    }, 2000);
  };

  // ═══ 启动 ══════════════════════════════════════════════════════════
  function toggleDemoMenu() {
    var menu = document.getElementById('demoMenu');
    if (menu) menu.classList.toggle('open');
  }
  function closeDemoMenu() {
    var menu = document.getElementById('demoMenu');
    if (menu) menu.classList.remove('open');
  }
  // 点击外部关闭菜单
  document.addEventListener('click', function (e) {
    var wrap = document.getElementById('demoMenuWrap');
    var plusBtn = document.getElementById('desktopPlusBtn');
    if (wrap && !wrap.contains(e.target)) {
      // 如果点击的是加号按钮或其内部，不关闭菜单
      if (plusBtn && (e.target === plusBtn || plusBtn.contains(e.target))) {
        return;
      }
      var menu = document.getElementById('demoMenu');
      if (menu) menu.classList.remove('open');
    }
  });
  function globalChatSend() {
    var input = document.getElementById('globalChatInput');
    if (!input || !input.value.trim()) return;
    var text = input.value.trim();
    input.value = '';

    // 移除之前的快捷芯片
    var oldChips = document.querySelector('.quick-chips-row');
    if (oldChips) oldChips.remove();

    // 1) 显示用户消息
    sceneAppend('<div class="c-row user">' + '<div class="c-bubble user">' + escapeHtml(text) + '</div>' + '</div>');

    // ═══ 关键词场景路由 ═══
    if (/月报|月度报告/.test(text)) {
      if (typeof window.YAQ.switchScene === 'function') {
        window.YAQ.switchScene('monthly-report', true);
        return;
      }
    }
    if (/日报|隐患清单|隐患/.test(text)) {
      if (typeof window.YAQ.switchScene === 'function') {
        window.YAQ.switchScene('hazard-report', true);
        return;
      }
    }
    if (/履职|督导|统计/.test(text)) {
      if (typeof window.YAQ.switchScene === 'function') {
        window.YAQ.switchScene('responsibility', true);
        return;
      }
    }

    // 2) 模拟 AI 思考 → 假回复
    simulateAIResponse(text);
  }

  // ─── 模拟 AI 回答：思考 → 假回复 ──────────────────────────
  function simulateAIResponse(userText) {
    var fakeReply = generateFakeReply(userText);
    sceneTypeResponse('小安正在分析…', fakeReply, function () {
      // 回复完成后，显示快捷芯片（如果有）
      var quickChips = suggestQuickChips(userText);
      if (quickChips) showGlobalQuickChip(quickChips);
    });
  }

  // ─── 根据输入生成假回复（分段数组，供 sceneTypeResponse 逐段展示） ──
  function generateFakeReply(text) {
    var lower = text.toLowerCase();
    var C = CardPrimitives;

    // ── 隐患/安全类 ──
    if (lower.indexOf('隐患') >= 0 || lower.indexOf('风险') >= 0 || lower.indexOf('安全') >= 0) {
      return [
        C.sectionHead('🔍 当前安全态势概览'),
        '<div style="font-size:13px;color:#64748b;line-height:1.7;margin-bottom:12px;padding:12px 14px;background:#f8fafc;border-radius:12px">' +
          '截至今日，辖区内共有 <strong>47 条</strong>待处理隐患，其中 ' +
          C.statusBadge('danger', '重大隐患 3 条') +
          '，' +
          C.statusBadge('warning', '较大隐患 8 条') +
          '。' +
          '</div>',
        C.statCardRow([
          { label: '待处理隐患', value: '47', trend: 'up', delta: '+5', desc: '较上周' },
          { label: '重大隐患', value: '3', trend: 'up', delta: '+1', desc: '需立即处理' },
          { label: '整改完成率', value: '68.2%', trend: 'down', delta: '3.1%', desc: '较上月下降' },
        ]),
        C.detailCard({
          icon: '⚠️',
          title: '物流片区需重点关注',
          desc: '有 2 条重大隐患已超期 7 天未整改，建议立即督办处理。',
          tag: C.statusBadge('danger', '紧急'),
        }),
        C.buttonRow([
          { label: '查看隐患清单', cmd: 'switchScene', arg: 'hazard-report' },
          { label: '督办超期企业', cmd: 'showToast', arg: '已发起督办提醒' },
        ]),
      ];
    }

    // ── 物流片区 ──
    if (lower.indexOf('物流') >= 0 || lower.indexOf('片区') >= 0) {
      return [
        C.sectionHead('📍 物流片区监管数据'),
        C.statCardRow([
          { label: '监管场所', value: '3,276', desc: '物流片区' },
          { label: '采集率', value: '54.7%', trend: 'up', delta: '2.1%', desc: '较上月' },
          { label: '整改完成率', value: '28.6%', trend: 'down', delta: '5.2%' },
          { label: '超期隐患', value: '3', trend: 'up', delta: '+2' },
        ]),
        C.detailCard({
          icon: '✗',
          title: '物流片需重点关注',
          desc: '整改完成率仅 28.6%，显著低于其他片区。建议联系片区负责人了解原因，必要时安排专项督导。',
          tag: C.statusBadge('danger', '异常'),
        }),
        C.table({
          headers: ['企业', '闭环率', '超期数', '状态'],
          rows: [
            ['XX 物流有限公司', '15.3%', '2', C.statusBadge('danger', '危险')],
            ['YY 仓储服务', '42.1%', '1', C.statusBadge('warning', '警告')],
            ['ZZ 运输公司', '68.4%', '0', C.statusBadge('normal', '正常')],
            ['WW 冷链物流', '91.2%', '0', C.statusBadge('normal', '正常')],
          ],
        }),
        C.buttonRow([
          { label: '查看企业清单', cmd: 'showToast', arg: '已加载物流片区企业清单' },
          { label: '安排专项督导', cmd: 'showToast', arg: '已记录督导安排' },
        ]),
      ];
    }

    // ── 专项行动/任务 ──
    if (lower.indexOf('专项') >= 0 || lower.indexOf('行动') >= 0 || lower.indexOf('任务') >= 0) {
      return [
        C.sectionHead('📋 专项行动进度'),
        C.statCardRow([
          { label: '进行中', value: '3', desc: '专项行动' },
          { label: '平均进度', value: '73%', desc: '整体正常' },
          { label: '滞后项', value: '1', trend: 'up', delta: '+1', desc: '夏季消防安全' },
        ]),
        C.table({
          headers: ['专项行动', '进度', '完成', '状态'],
          rows: [
            ['夏季消防安全专项检查', '62%', '112/180', C.statusBadge('warning', '滞后')],
            ['危化品企业专项排查', '89%', '40/45', C.statusBadge('normal', '正常')],
            ['有限空间作业专项整治', '100%', '28/28', C.statusBadge('normal', '已完成')],
          ],
        }),
        '<div style="background:#f8fafc;border-radius:12px;padding:12px;font-size:12px;color:#64748b;line-height:1.6">' +
          '💡 夏季消防安全专项检查进度滞后，距 deadline 还有 10 天，建议加快节奏。' +
          '</div>',
        C.buttonRow([{ label: '查看任务异常分析', cmd: 'showToast', arg: '正在分析任务异常…' }]),
      ];
    }

    // ── 企业查询 ──
    if (lower.indexOf('企业') >= 0 || lower.indexOf('公司') >= 0) {
      return [
        C.sectionHead('🏢 重点企业监管概况'),
        C.statCardRow([
          { label: '监管企业总数', value: '951' },
          { label: '风险上升企业', value: '23', trend: 'up', delta: '+5', alert: 'warning' },
          { label: '整改反复企业', value: '47', trend: 'up', delta: '+8' },
          { label: '正常企业', value: '881', trend: 'down', delta: '-12', desc: '较上月' },
        ]),
        C.table({
          headers: ['企业名称', '风险等级', '整改状态', '最新更新'],
          rows: [
            ['XX 化工有限公司', C.statusBadge('danger', '高'), C.statusBadge('warning', '超期'), '2026-06-28'],
            ['YY 物流有限公司', C.statusBadge('warning', '较高'), C.statusBadge('warning', '进行中'), '2026-06-27'],
            ['ZZ 建材市场', C.statusBadge('normal', '中'), C.statusBadge('normal', '已完成'), '2026-06-25'],
          ],
        }),
        C.detailCard({
          icon: '🤖',
          title: 'AI 分析',
          desc: '风险上升企业主要集中在物流片区（12 家），建议重点关注。',
        }),
        C.buttonRow([{ label: '查看风险上升企业', cmd: 'showToast', arg: '已列出风险上升企业' }]),
      ];
    }

    // ── 履职/团队 ──
    if (lower.indexOf('履职') >= 0 || lower.indexOf('团队') >= 0 || lower.indexOf('人员') >= 0) {
      return [
        C.sectionHead('👥 团队履职情况'),
        C.statCardRow([
          { label: '应消站', value: C.statusBadge('normal', '正常') },
          { label: '区域站', value: C.statusBadge('warning', '3 人未填报') },
          { label: '村社', value: C.statusBadge('warning', '5 个滞后') },
          { label: '专家', value: C.statusBadge('normal', '正常') },
        ]),
        C.table({
          headers: ['团队', '应到岗', '实到岗', '填报率'],
          rows: [
            ['应消站', '12', '12', '100%'],
            ['区域站', '8', '5', '62.5%'],
            ['村社', '15', '10', '66.7%'],
            ['专家', '4', '4', '100%'],
          ],
        }),
        '<div style="background:#f8fafc;border-radius:12px;padding:12px;font-size:12px;color:#64748b;line-height:1.6">' +
          '💡 区域站有 3 人连续 3 天未填报巡查记录，村社层面勾庄片、物流片各有滞后，建议提醒。' +
          '</div>',
        C.buttonRow([{ label: '提醒未填报人员', cmd: 'showToast', arg: '已发送提醒通知' }]),
      ];
    }

    // ── 默认回复 ──
    return [
      C.sectionHead('🤖 小安'),
      '<div style="font-size:13px;color:#475569;line-height:1.8;margin-bottom:12px;padding:12px 14px;background:#f8fafc;border-radius:12px">' +
        '收到你的问题，让我来分析一下当前的数据…' +
        '</div>',
      C.detailCard({
        icon: '📊',
        title: '当前总体态势',
        desc: '辖区整体安全形势平稳，但物流片区隐患闭环率偏低（28.6%），建议重点关注。如需进一步了解某个具体事项，可以直接告诉我。',
      }),
    ];
  }

  // ─── 根据用户问题建议后续快捷芯片 ──────────────────────────
  function suggestQuickChips(text) {
    var lower = text.toLowerCase();
    if (lower.indexOf('隐患') >= 0 || lower.indexOf('风险') >= 0) {
      return [{ label: '查看超期未整改隐患', text: '哪些隐患超期未整改？' }];
    }
    if (lower.indexOf('物流') >= 0 || lower.indexOf('片区') >= 0) {
      return [{ label: '分析物流片整改率低的原因', text: '分析一下物流片整改率低的原因' }];
    }
    if (lower.indexOf('专项') >= 0 || lower.indexOf('任务') >= 0) {
      return [{ label: '查看任务异常分析', text: '分析一下任务的异常情况' }];
    }
    if (lower.indexOf('企业') >= 0) {
      return [{ label: '查看风险上升企业清单', text: '列出风险上升的企业' }];
    }
    // 默认不显示快捷芯片
    return null;
  }
  // ─── 全局快捷芯片：追加到消息流中，跟随内容滚动 ──
  // ─── 全局输入条：根据场景更新占位符和命令 ──────────────
  function updateGlobalInputBar(opts) {
    if (!opts) opts = {};
    var input = document.getElementById('globalChatInput');
    var sendBtn = document.querySelector('.global-chat-btn');
    if (!input) return;
    // placeholder 始终为 HTML 中设置的"发消息或按住说话"，不做动态变更
    input.setAttribute('data-cmd', opts.sendCommand || 'globalChatSend');
    if (sendBtn) sendBtn.setAttribute('data-cmd', opts.sendCommand || 'globalChatSend');
  }

  function showGlobalQuickChip(chips) {
    if (!chips || chips.length === 0) return;
    // 移除旧的快捷芯片
    var oldChips = document.querySelector('.quick-chips-row');
    if (oldChips) oldChips.remove();
    var chipsWithText = chips.map(function (c) {
      return { label: c.label, text: c.text };
    });
    var html = QuickChip.render(chipsWithText, { variant: 'inline' });
    sceneAppend(html);
    // sceneAppend 已自动滚动到底部
  }

  function globalChatQuick(text) {
    // 先移除快捷芯片（避免内容变化后滚动位置偏移）
    var inlineChips = document.querySelector('.quick-chips-row');
    if (inlineChips) inlineChips.remove();

    // 显示用户消息
    sceneAppend(
      '<div class="c-row user">' + '<div class="c-bubble user">' + escapeHtml(text) + '</div>' + '</div>',
      true,
    );

    var input = document.getElementById('globalChatInput');
    if (input) input.value = '';
    if (input) input.blur();

    // 根据关键词路由到具体场景
    if (text.indexOf('超期未闭环原因') >= 0 || text.indexOf('隐患闭环未关闭的原因') >= 0) {
      renderOverdueAnalysis();
      return;
    }
    if (text.indexOf('任务的异常') >= 0 || text.indexOf('任务异常') >= 0) {
      renderTaskAnomalyAnalysis();
      return;
    }
    if (text.indexOf('督办任务进展') >= 0 || text.indexOf('督办进展') >= 0) {
      showToast('查看督办进展（演示功能）');
      return;
    }
    if (text.indexOf('巡查报告') >= 0 || text.indexOf('生成报告') >= 0) {
      showToast('生成巡查报告（演示功能）');
      return;
    }
    if (text.indexOf('行动建议') >= 0) {
      // 跳转到待确认行动场景
      if (window.switchScene) window.switchScene('pending-actions');
      else showToast('查看行动建议（演示功能）');
      return;
    }
    if (text.indexOf('哪些行动') >= 0 || text.indexOf('有什么行动') >= 0) {
      // 跳转到待确认行动场景
      if (window.switchScene) window.switchScene('pending-actions');
      else showToast('查看待确认行动（演示功能）');
      return;
    }
    if (text.indexOf('业务组') >= 0 || text.indexOf('片区展示') >= 0) {
      renderMonthlyReportRestructured();
      return;
    }
    if (text.indexOf('保存为模板') >= 0 || text.indexOf('月报模板') >= 0) {
      renderSaveTemplate();
      return;
    }
    // 其他 → 通用假回复
    simulateAIResponse(text);
  }

  // ─── 安全的滚动到底部辅助函数 ──────────────────────────
  // 使用 RAF + setTimeout 双保险，确保内容渲染后可靠滚动
  // 仅在用户未手动上滚时生效
  function scrollSceneToBottom() {
    var container = document.getElementById('sceneContent');
    if (!container) return;
    var sc = container.closest('.center');
    if (!sc) return;
    // 用户手动上滚后不再自动滚动
    if (!sc._autoScrollEnabled) return;

    function doScroll() {
      sc.scrollTop = sc.scrollHeight;
    }

    // RAF 优先（在下一帧绘制前执行）
    requestAnimationFrame(doScroll);
    // setTimeout 兜底（某些浏览器 RAF 批次中 scrollHeight 可能滞后）
    setTimeout(doScroll, 50);
  }

  // ─── 将指定元素滚动到容器顶部（用于用户消息置顶） ──
  function scrollElementToTop(el) {
    if (!el) return;
    var sc = el.closest('.center');
    if (!sc) return;
    var top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
    // 留出顶部间距（给场景标题等留空间）
    requestAnimationFrame(function () {
      sc.scrollTop = Math.max(0, top - 46);
    });
  }

  // ─── sceneContent 容器追加（带滚动） ─────────────────────
  function sceneAppend(html, isUserMsg) {
    var container = document.getElementById('sceneContent');
    if (!container) return;

    if (isUserMsg) {
      // 先移除旧的空白占位（防止多次点击积累多个）
      var oldSpacer = container.querySelector('.scroll-spacer');
      if (oldSpacer) oldSpacer.remove();
      // 用户消息：追加到末尾
      container.insertAdjacentHTML('beforeend', html);
      // 在底部加空白占位，确保页面可滚动
      container.insertAdjacentHTML(
        'beforeend',
        '<div class="scroll-spacer" style="height:80vh;pointer-events:none"></div>',
      );
      // 滚动到视口顶部，然后禁用自动滚动
      var sc = container.closest('.center');
      if (sc) sc._autoScrollEnabled = false;
      var userRow = container.querySelector('.c-row.user:last-of-type');
      if (userRow) scrollElementToTop(userRow);
    } else {
      // AI 内容：如果有 spacer，插在它前面；否则追加到末尾
      var spacer = container.querySelector('.scroll-spacer');
      if (spacer) {
        spacer.insertAdjacentHTML('beforebegin', html);
      } else {
        container.insertAdjacentHTML('beforeend', html);
      }
      scrollSceneToBottom();
    }
  }

  // ─── sceneContent 思考 → 逐段展示回复 ──────────────────
  function sceneTypeResponse(thinkText, sections, callback, noCard) {
    sceneAppend(thinkingDots(thinkText));
    setTimeout(
      function () {
        var row = document.getElementById('thinkingRow');
        if (row) row.remove();
        var respId = 'sceneResp' + Date.now();
        if (noCard) {
          // 无卡片模式：直接追加内容容器
          sceneAppend(
            '<div class="c-row agent"><div class="c-bubble" id="' +
              respId +
              '" style="flex:1;min-width:0;font-size:14px;line-height:1.7;color:#1e293b"></div></div>',
          );
        } else {
          sceneAppend(
            '<div class="c-row agent"><div class="c-bubble" id="' +
              respId +
              '" style="flex:1;min-width:0;background:#fff;border:1px solid #e2eaf8;border-radius:16px;padding:14px 16px;font-size:14px;line-height:1.7;color:#1e293b;box-shadow:0 1px 4px rgba(0,0,0,.04)"></div></div>',
          );
        }
        var el = document.getElementById(respId);
        if (!el) {
          if (callback) callback();
          return;
        }
        var idx = 0;
        function appendNext() {
          if (idx >= sections.length) {
            refreshIcons();
            // 图标替换（<i> → <svg>）可能改变布局，需要再次滚动
            scrollSceneToBottom();
            if (callback) callback();
            return;
          }
          el.insertAdjacentHTML('beforeend', sections[idx]);
          scrollSceneToBottom();
          idx++;
          setTimeout(appendNext, 250 + Math.random() * 200);
        }
        appendNext();
      },
      700 + Math.random() * 400,
    );
  }

  function renderOverdueAnalysis() {
    var container = document.getElementById('sceneContent');
    if (!container) return;
    var userQuery = '分析一下隐患闭环未关闭的原因';
    // 分片定义 Agent 回复内容（逐段展示）
    var sections = [
      // 标题
      '<div style="font-size:15px;font-weight:700;color:#1e293b;margin-bottom:14px">超期未闭环原因分析</div>',
      // 概述
      '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:10px">' +
        '当前共有 2 项重大隐患超期未整改。以下从政府端（监督跟进）和企业端（主体责任）两个维度逐项研判责任归属。' +
        '</div>',
      // 卡片1 + 分析
      window.CardPrimitives.entityCard({
        name: '北苑商业综合体',
        desc: '消防通道堵塞',
        meta: [{ text: '来源 日常巡查' }, { text: '逾期 3天', style: 'color:#dc2626;font-weight:600' }],
        time: '06-10 → 06-22',
        footer: '企业主体责任问题为主',
        onclick: "openHazardDetail('北苑商业综合体')",
        title: '点击查看详情',
        variant: 'danger',
      }) +
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:16px">' +
        '<strong>初步研判：企业主体责任问题为主</strong><br>' +
        '政府端已多次提醒催办，手段基本到位但力度偏软；企业端反复堵塞、不配合整改，是超期的主要原因。建议：政府端升级为现场核查 + 企业约谈，如仍不配合则联合执法。<br><br>' +
        '<strong>政府端 — 监督跟进</strong><br>' +
        '已反复提醒：该主体消防通道堵塞本月已发现 3 次，王志安已多次电话督促。已发督办，超期 3 天系统已自动发起督办流程。存在问题：目前仅停留在电话督促层面，未升级实质性措施（如现场核查、临时管控、停业整顿），跟进力度偏软。<br><br>' +
        '<strong>企业端 — 主体责任</strong><br>' +
        '反复堵塞：同一问题月内反复 3 次，说明企业未建立长效管理机制，主体责任落实不到位。整改配合度低：超期 3 天仍未提交整改方案，临时管控措施也未确认，企业配合意愿弱。该主体属于屡教不改型，常规督促已失效，需升级为企业约谈或联合执法。' +
        '</div>',
      // 卡片2 + 分析
      window.CardPrimitives.entityCard({
        name: '云栖高层住宅',
        desc: '自动消防设施失效',
        meta: [{ text: '来源 日常巡查' }, { text: '逾期 1天', style: 'color:#dc2626;font-weight:600' }],
        time: '06-20 → 06-22',
        footer: '政府跟进盲区 + 企业执行不力并存',
        onclick: "openHazardDetail('云栖高层住宅')",
        title: '点击查看详情',
        variant: 'danger',
      }) +
        '<div style="font-size:14px;color:#1e293b;line-height:1.8">' +
        '<strong>初步研判：政府跟进盲区 + 企业执行不力并存</strong><br>' +
        '超期时间较短（1 天），但政府端对整改证据要求不明确、缺少专业检测手段是重要因素；企业端推进缓慢也需要问责。建议：政府端明确整改验收标准，要求企业提交阶段性修复计划并引入第三方检测。<br><br>' +
        '<strong>政府端 — 监督跟进</strong><br>' +
        '已发整改通知：超期 1 天，李明已跟进并下发整改要求。跟进存在盲区：目前仅收到企业口头反馈，未见书面整改方案或修复进度证明，整改证据链未闭环，政府端未对证据完整性提出明确要求。缺少专业支撑：高层消防设施修复涉及专业工程验收，政府端未引入第三方检测机构介入评估。<br><br>' +
        '<strong>企业端 — 主体责任</strong><br>' +
        '整改推进慢：超期 1 天但未见实质性修复进展，企业未主动报告困难和进度。修复能力存疑：18-25 层消防设施全面失效，修复工程量大，企业是否已联系专业消防工程公司未可知。企业配合度一般：有整改意愿但行动迟缓，缺乏紧迫感。' +
        '</div>',
    ];
    // 用思考→逐段打字的方式展现
    sceneTypeResponse(
      '正在分析超期未闭环原因…',
      sections,
      function () {
        showGlobalQuickChip([{ label: '对任务的异常进行分析', text: '分析一下任务的异常情况' }]);
        // 在分析内容底部追加"生成推进行动"按钮
        var respBubble = document.querySelector('.c-row.agent:last-child .c-bubble');
        if (respBubble) {
          var btnHtml =
            '<div style="margin-top:16px;padding-top:14px;border-top:1px solid #e2e8f0;text-align:center">' +
            '<button onclick="generateOverdueActions()" style="background:#2563eb;color:#fff;border:none;border-radius:10px;padding:10px 24px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s" onmouseover="this.style.background=\'#1d4ed8\'" onmouseout="this.style.background=\'#2563eb\'">' +
            '<i data-lucide="clipboard-check" width="16" height="16" style="vertical-align:middle;margin-right:6px"></i> 生成推进行动' +
            '</button>' +
            '<div style="font-size:11px;color:#94a3b8;margin-top:6px">基于以上分析自动生成待确认行动，可前往审核确认</div>' +
            '</div>';
          respBubble.insertAdjacentHTML('beforeend', btnHtml);
          refreshIcons();
        }
      },
      true,
    );
  }

  // ─── 生成超期未闭环推进行动 ──────────────────────────────
  window.generateOverdueActions = function () {
    if (window.YAQ && window.YAQ.showToast) window.YAQ.showToast('已生成超期未闭环推进行动，正在跳转…');
    if (window.renderScene) window.renderScene('pending-actions');
  };

  // ═══ 任务异常分析 ═══════════════════════════════════════════════
  function renderTaskAnomalyAnalysis() {
    var container = document.getElementById('sceneContent');
    if (!container) return;
    var userQuery = '分析一下任务的异常情况';
    var sections = [
      // 标题
      '<div style="font-size:15px;font-weight:700;color:#1e293b;margin-bottom:14px">任务异常分析</div>',
      // 概述
      '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:16px">' +
        '当前有 2 项任务存在异常，需重点关注。' +
        '</div>',
      // 卡片1 + 分析
      window.CardPrimitives.entityCard({
        name: '2026年第二季度良渚片重大风险检查任务',
        progress: {
          timePct: 91,
          compPct: 42,
          color: '#dc2626',
          stats: ['覆盖 <strong>141</strong> 家', '隐患 <strong>3</strong> 个 | 未闭环 <strong>0</strong>'],
        },
        time: '06-01 → 06-30',
        badge: '严重滞后 49pp',
        badgeColor: '#dc2626',
        badgeBg: '#fef2f2',
        onclick: "openTaskDetail('2026年第二季度良渚片重大风险检查任务')",
        title: '点击查看详情',
      }) +
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px"><strong>研判：严重滞后，按当前速度无法按期完成</strong></div>',
      '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px">' +
        '二季度即将结束，剩余 141 家中的 82 家尚未检查，完成率远低于时间进度。建议立即调整资源配置、增加检查频次，或申请延期并制定追赶计划。' +
        '</div>',
      '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px"><strong>数据</strong></div>',
      '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:16px">' +
        '完成率 42% vs 时间进度 91%，差距 49 个百分点。按当前日均检查量推算，至少还需 28 个工作日，远超剩余时间窗口。' +
        '</div>',
      // 卡片2 + 分析
      window.CardPrimitives.entityCard({
        name: '片区隐患排查复查',
        progress: {
          timePct: 75,
          compPct: 55,
          color: '#d97706',
          stats: ['覆盖 <strong>24</strong> 家', '隐患 <strong>2</strong> 个 | 未闭环 <strong>1</strong>'],
        },
        time: '06-10 → 06-30',
        badge: '进度偏低',
        badgeColor: '#d97706',
        badgeBg: '#fff7ed',
        onclick: "openTaskDetail('片区隐患排查复查')",
        title: '点击查看详情',
      }) +
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px"><strong>研判：进度偏慢但风险可控，优先处理重大隐患</strong></div>',
      '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px">' +
        '完成率 55%，距月底尚有时间但需加快节奏。含 1 项重大隐患待复查，建议优先完成重大隐患复查，其余任务按风险等级排序推进。' +
        '</div>',
      '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px"><strong>数据</strong></div>',
      '<div style="font-size:14px;color:#1e293b;line-height:1.8">' +
        '重大隐患复查为最优先事项，需在 2 个工作日内完成。其余 23 家按风险等级推进，预计可在月底前达成 90%+ 完成率。' +
        '</div>',
    ];
    sceneTypeResponse(
      '正在分析任务异常情况…',
      sections,
      function () {
        showGlobalQuickChip([
          { label: '最近的督办任务进展怎样', text: '最近的督办任务进展怎样' },
          { label: '生成巡查报告', text: '帮我生成今天的巡查报告' },
          { label: '我可以有哪些行动？', text: '我可以有哪些行动' },
        ]);
      },
      true,
    );
  }

  // ═══ 月报按业务组 + 多片区重构展示 ═════════════════════════
  function renderMonthlyReportRestructured() {
    var container = document.getElementById('sceneContent');
    if (!container) return;
    var userQuery = '把安全工作组分拆为业务组，并按多个片区展示';
    var sections = [
      // 标题
      '<div style="font-size:15px;font-weight:700;color:#1e293b;margin-bottom:10px">📊 月报已按业务组 + 片区重组</div>',
      // 说明
      '<div style="font-size:13px;color:#64748b;line-height:1.7;margin-bottom:16px;padding:12px 14px;background:#f8fafc;border-radius:12px">' +
        '已将原工作组数据聚合为 <strong>2 个业务组</strong>，按 <strong>3 个片区</strong>分别展示。' +
        '</div>',
      // 业务组1：企业安全组
      '<div style="background:#fff;border:1px solid #f1f5f9;border-radius:14px;padding:16px;margin-bottom:12px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">' +
        '<span style="background:#eef4ff;color:#2563eb;font-size:11px;font-weight:700;padding:2px 10px;border-radius:6px">业务组 ①</span>' +
        '<span style="font-size:14px;font-weight:700;color:#1e293b">企业安全组（原工作组 A/B）</span>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">' +
        '<div style="background:#f8fafc;border-radius:8px;padding:8px;text-align:center"><div style="font-size:18px;font-weight:700;color:#1e293b">951</div><div style="font-size:11px;color:#64748b">监管企业</div></div>' +
        '<div style="background:#f8fafc;border-radius:8px;padding:8px;text-align:center"><div style="font-size:18px;font-weight:700;color:#1e293b">93.48%</div><div style="font-size:11px;color:#64748b">采集率</div></div>' +
        '<div style="background:#f8fafc;border-radius:8px;padding:8px;text-align:center"><div style="font-size:18px;font-weight:700;color:#dc2626">11.13%</div><div style="font-size:11px;color:#64748b">整改完成率</div></div>' +
        '</div>' +
        '<div style="font-size:12px;color:#475569;line-height:1.7;padding:8px 10px;background:#fef2f2;border-radius:8px">⚠ 企业整改完成率仅 11.13%，推送覆盖率 58.57%，需重点关注整改闭环。</div>' +
        '</div>',
      // 业务组2：场所安全组
      '<div style="background:#fff;border:1px solid #f1f5f9;border-radius:14px;padding:16px;margin-bottom:12px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">' +
        '<span style="background:#fef2f2;color:#dc2626;font-size:11px;font-weight:700;padding:2px 10px;border-radius:6px">业务组 ②</span>' +
        '<span style="font-size:14px;font-weight:700;color:#1e293b">场所安全组（原工作组 C/D）</span>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">' +
        '<div style="background:#f8fafc;border-radius:8px;padding:8px;text-align:center"><div style="font-size:18px;font-weight:700;color:#1e293b">13,540</div><div style="font-size:11px;color:#64748b">监管场所</div></div>' +
        '<div style="background:#f8fafc;border-radius:8px;padding:8px;text-align:center"><div style="font-size:18px;font-weight:700;color:#d97706">57.36%</div><div style="font-size:11px;color:#64748b">采集率</div></div>' +
        '<div style="background:#f8fafc;border-radius:8px;padding:8px;text-align:center"><div style="font-size:18px;font-weight:700;color:#16a34a">59.46%</div><div style="font-size:11px;color:#64748b">整改完成率</div></div>' +
        '</div>' +
        '<div style="font-size:12px;color:#475569;line-height:1.7;padding:8px 10px;background:#fff7ed;border-radius:8px">⚠ 场所采集率仅 57.36%，待办推送覆盖率低至 17.05%，监管触达严重不足。</div>' +
        '</div>',
      // 片区数据
      '<div style="background:linear-gradient(135deg,#f8fafc,#f1f5f9);border:1px solid #e2e8f0;border-radius:14px;padding:14px;font-size:13px;color:#1e293b;line-height:1.7">' +
        '<div style="font-weight:700;margin-bottom:8px">📍 各片区关键数据</div>' +
        '<table style="width:100%;font-size:12px;border-collapse:collapse">' +
        '<tr style="border-bottom:1px solid #e2e8f0">' +
        '<th style="text-align:left;padding:4px 6px;color:#64748b;font-weight:500">片区</th>' +
        '<th style="text-align:center;padding:4px 6px;color:#64748b;font-weight:500">监管主体</th>' +
        '<th style="text-align:center;padding:4px 6px;color:#64748b;font-weight:500">采集率</th>' +
        '<th style="text-align:center;padding:4px 6px;color:#64748b;font-weight:500">整改率</th>' +
        '<th style="text-align:center;padding:4px 6px;color:#64748b;font-weight:500">状态</th>' +
        '</tr>' +
        '<tr style="border-bottom:1px solid #f1f5f9">' +
        '<td style="padding:6px;color:#1e293b;font-weight:600">良渚片</td>' +
        '<td style="padding:6px;text-align:center">4,832</td>' +
        '<td style="padding:6px;text-align:center">68.2%</td>' +
        '<td style="padding:6px;text-align:center;color:#d97706">43.1%</td>' +
        '<td style="padding:6px;text-align:center"><span style="color:#d97706">⚠ 偏低</span></td>' +
        '</tr>' +
        '<tr style="border-bottom:1px solid #f1f5f9">' +
        '<td style="padding:6px;color:#1e293b;font-weight:600">物流片</td>' +
        '<td style="padding:6px;text-align:center">3,276</td>' +
        '<td style="padding:6px;text-align:center">54.7%</td>' +
        '<td style="padding:6px;text-align:center;color:#dc2626">28.6%</td>' +
        '<td style="padding:6px;text-align:center"><span style="color:#dc2626">✗ 危险</span></td>' +
        '</tr>' +
        '<tr>' +
        '<td style="padding:6px;color:#1e293b;font-weight:600">勾庄片</td>' +
        '<td style="padding:6px;text-align:center">6,383</td>' +
        '<td style="padding:6px;text-align:center">61.3%</td>' +
        '<td style="padding:6px;text-align:center;color:#16a34a">72.8%</td>' +
        '<td style="padding:6px;text-align:center"><span style="color:#16a34a">✓ 正常</span></td>' +
        '</tr>' +
        '</table>' +
        '<div style="font-size:11px;color:#64748b;margin-top:6px">物流片整改率仅 28.6%，需优先介入。</div>' +
        '</div>',
    ];
    sceneTypeResponse('正在按业务组和片区重构月报…', sections, function () {
      showGlobalQuickChip([{ label: '后续月报是否要保存为模板？', text: '将这种展示方式保存为月报模板' }]);
    });
  }

  // ═══ 保存月报模板 ═══════════════════════════════════════════════
  function renderSaveTemplate() {
    var container = document.getElementById('sceneContent');
    if (!container) return;
    var userQuery = '将这种展示方式保存为月报模板';
    sceneAppend(
      '<div class="c-row user" style="animation:fadeUp .3s ease-out both;margin-top:16px;margin-bottom:12px">' +
        '<div class="c-bubble user" style="align-self:flex-end;flex:0 1 auto;max-width:75%;background:#2563eb;color:#fff;border:none;border-radius:16px 16px 4px 16px;padding:10px 14px;font-size:14px;line-height:1.5">' +
        escapeHtml(userQuery) +
        '</div>' +
        '</div>',
    );
    var sections = [
      // 标题
      '<div style="font-size:15px;font-weight:700;color:#1e293b;margin-bottom:10px">✅ 月报模板已更新</div>',
      // 模板保存确认
      '<div style="font-size:13px;color:#64748b;line-height:1.7;margin-bottom:16px;padding:12px 14px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0">' +
        '已识别当前月报的 <strong>展示结构</strong>，并保存为默认模板。后续月报将自动按此结构生成。' +
        '</div>',
      // 模板结构卡片
      '<div style="background:#fff;border:1px solid #f1f5f9;border-radius:14px;padding:16px;margin-bottom:12px">' +
        '<div style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:10px">📐 已保存的模板结构</div>' +
        '<div style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#475569;line-height:1.6">' +
        '<div style="display:flex;align-items:center;gap:6px;padding:4px 0"><span style="background:#eef4ff;color:#2563eb;font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px">维度</span>按业务组聚合（企业安全组 + 场所安全组）</div>' +
        '<div style="display:flex;align-items:center;gap:6px;padding:4px 0"><span style="background:#eef4ff;color:#2563eb;font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px">维度</span>按片区拆分展示（良渚片 / 物流片 / 勾庄片）</div>' +
        '<div style="display:flex;align-items:center;gap:6px;padding:4px 0"><span style="background:#eef4ff;color:#2563eb;font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px">维度</span>每个业务组展示核心指标卡片（监管数 / 采集率 / 整改率）</div>' +
        '<div style="display:flex;align-items:center;gap:6px;padding:4px 0"><span style="background:#eef4ff;color:#2563eb;font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px">维度</span>各片区附状态标记（正常 / 偏低 / 危险）</div>' +
        '</div>' +
        '</div>',
      // AI 分析说明
      '<div style="background:linear-gradient(135deg,#f8fafc,#f1f5f9);border:1px solid #e2e8f0;border-radius:14px;padding:14px;font-size:13px;color:#1e293b;line-height:1.7">' +
        '<div style="font-weight:700;margin-bottom:6px">🤖 AI 分析</div>' +
        '<div style="font-size:12px;color:#475569">已分析当前月报数据与展示结构，识别出 2 个业务组（企业/场所）和 3 个片区（良渚/物流/勾庄）之间的数据差异。<strong>模板已保存</strong>，下期月报将自动按业务组聚合 + 多片区对比的方式生成。</div>' +
        '</div>',
    ];
    sceneTypeResponse('正在分析月报结构并更新模板…', sections);
  }

  function init() {
    if (ls.get(STORAGE_KEY) === 'true') {
      // 初始化已完成，统一对话引擎已接管
      return;
    }
    // 切换到初始化场景（渲染在 #sceneContent 中）
    if (window.switchScene) {
      window.switchScene('agent-init');
    }
  }

  // 全局空格触发：快捷输入可见时，空格点击主按钮
  // 注意：必须跳过 IME 组合状态（中文输入法按空格选字时不应发送）
  document.addEventListener('keydown', function (e) {
    if (e.isComposing || e.keyCode === 229) return;
    if (e.key === ' ' || e.key === 'Spacebar') {
      var overlay = document.getElementById('initOverlay');
      if (overlay && overlay.classList.contains('active')) {
        var inp = document.getElementById('globalChatInput');
        if (inp && inp.value.trim()) {
          e.preventDefault();
          YAQ.convChatSend();
          return;
        }
        var primary = document.querySelector('.qc-chip.primary');
        if (primary) {
          e.preventDefault();
          primary.click();
        }
      }
    }
  });

  // ═══ 导出 ══════════════════════════════════════════════════════════
  // ════════════════════════════════════════════════════════════════
  // YAQ Namespace — 追加到 app.js 定义的 YAQ 命名空间
  // ════════════════════════════════════════════════════════════════
  window.YAQ = window.YAQ || {};
  Object.assign(window.YAQ, {
    // ─── 初始化流程 ───
    doContinue: doContinue,
    doQuickFinish: doQuickFinish,
    doGenerate: doGenerate,
    doEnter: doEnter,
    doWelcomeNext: doWelcomeNext,
    doContinueAbility: doContinueAbility,
    skip: skip,
    resetInit: resetInit,
    isAgentInitialized: function () {
      return ls.get(STORAGE_KEY) === 'true';
    },
    renderAgentEnabledHTML: renderAgentEnabledHTML,

    // ─── 聊天交互 ───
    convChatSend: convChatSend,
    convChatVoice: convChatVoice,
    convQuickReply: convQuickReply,
    globalChatSend: globalChatSend,
    globalChatQuick: globalChatQuick,
    showGlobalQuickChip: showGlobalQuickChip,
    updateGlobalInputBar: updateGlobalInputBar,

    // ─── 关注项选择 ───
    togglePref: togglePref,
    confirmPref: confirmPref,
    toggleCustom: toggleCustom,
    removeCustom: removeCustom,
    togAttn: togAttn,

    // ─── 仪表盘操作 ───
    doDashboardRedirect: doDashboardRedirect,
    doNormalDashboard: doNormalDashboard,
    doIntent: doIntent,

    // ─── UI 辅助 ───
    closeSheet: closeSheet,
    reEnable: reEnable,
    startConversation: startConversation,
    toggleDemoMenu: toggleDemoMenu,
    closeDemoMenu: closeDemoMenu,
  });

  // ════════════════════════════════════════════════════════════════
  // Backward-compatible window aliases
  // ════════════════════════════════════════════════════════════════
  window.convChatSend = window.YAQ.convChatSend;
  window.convChatVoice = window.YAQ.convChatVoice;
  window.globalChatSend = window.YAQ.globalChatSend;
  window.globalChatQuick = window.YAQ.globalChatQuick;
  window.doDashboardRedirect = window.YAQ.doDashboardRedirect;
  window.doNormalDashboard = window.YAQ.doNormalDashboard;
  window.resetInit = window.YAQ.resetInit;
  window.toggleDemoMenu = window.YAQ.toggleDemoMenu;
  window.closeDemoMenu = window.YAQ.closeDemoMenu;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (window._yaqBooted) {
        // bootApp 在 DOMContentLoaded 之前已执行（脚本同步加载时常见）
        setTimeout(init, 0);
      } else {
        window.addEventListener('yaq:booted', init);
      }
    });
  } else if (window._yaqBooted) {
    // bootApp 已执行完毕（事件已发射，监听器注册晚了），直接调用 init
    setTimeout(init, 0);
  } else {
    window.addEventListener('yaq:booted', init);
  }
})();
