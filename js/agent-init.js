// ═════════════════════════════════════════════════════════════════════
// 站长主控 Agent 初始化场景 — 纯对话式
// ═════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  var STORAGE_KEY = 'yaq_agent_initialized';
  var userMode = 'default';
  var attentionItems = [
    { id:'a1', title:'今天有没有必须处理的安全风险', desc:'整体安全态势、风险区域、新增隐患变化', on:true },
    { id:'a2', title:'重大隐患是否闭环',             desc:'新增重大隐患、逾期未整改、临时管控措施', on:true },
    { id:'a3', title:'专项行动是否滞后',             desc:'日常任务、专项任务是否时间过半、任务过半', on:true },
    { id:'a4', title:'重点主体对象是否异常',         desc:'重点企业/场所风险上升、整改反复、异常', on:true },
    { id:'a5', title:'团队履职是否异常',             desc:'应消站、区域站、村社、专家履职情况', on:true },
    { id:'a6', title:'是否需要准备会议材料',         desc:'会议前自动整理重大隐患、专项滞后、待确认事项', on:false },
    { id:'a7', title:'是否需要生成月度监管报告草稿', desc:'月末整理日常监管、履职、主体责任和辖区安全形势', on:false }
  ];
  var agents = [
    { id:'g1', name:'每日态势 Agent',     schedule:'每天 08:30', output:'今日安全态势简报',          push:'有异常进入总控动态', on:true },
    { id:'g2', name:'重大隐患 Agent',     schedule:'每天 10:00', output:'重大隐患闭环检查',          push:'高风险进入待我确认', on:true },
    { id:'g3', name:'重点主体 Agent',     schedule:'每天 11:00', output:'重点主体异常清单',          push:'异常进入总控动态', on:true },
    { id:'g4', name:'专项行动 Agent',     schedule:'每天 14:00', output:'专项行动进度简报',          push:'明显滞后进入待我确认', on:true },
    { id:'g5', name:'履职分析 Agent',     schedule:'每天 16:30', output:'工作效能简报',              push:'异常进入总控动态', on:true },
    { id:'g6', name:'会前准备 Agent',     schedule:'会议前一天', output:'会议议题和发言提纲',        push:'材料生成后进入材料区', on:true },
    { id:'g7', name:'月报 Agent',         schedule:'每月 25 日起', output:'月度监管报告草稿',       push:'生成后进入材料区', on:true },
    { id:'g8', name:'系统性复盘 Agent',   schedule:'异常反复时触发', output:'复盘建议',             push:'进入建议复盘', on:true }
  ];
  var PREF_OPTIONS = [
    { id:'daily_risk',     label:'今天有没有必须处理的安全风险', sub:'整体安全态势、风险区域、新增隐患变化。' },
    { id:'major_hazard',   label:'重大隐患是否闭环',             sub:'新增重大隐患、历史遗留隐患、逾期未整改、临时管控措施。' },
    { id:'special_task',   label:'专项行动是否滞后',             sub:'日常任务、专项任务是否时间过半、任务过半。' },
    { id:'key_subject',    label:'重点主体对象是否异常',         sub:'重点企业/场所风险上升、整改反复、平台使用异常。' },
    { id:'team_duty',      label:'团队履职是否异常',             sub:'应消站、区域站、村社、专家履职情况是否异常。' },
    { id:'monthly_report', label:'帮我生成每月的安全月报',        sub:'月末自动整理日常监管数据，生成月度报告草稿。' }
  ];
  var MODE_RESPONSES = {
    major_hazard: '已将<span class="hl">重大隐患闭环</span>设为优先关注。<br><br>我会重点检查：<br>• 是否超期未整改<br>• 是否有临时管控措施<br>• 整改方案是否可行<br>• 责任人是否履职到位<br><br>其他日常巡检——安全态势、专项行动进度、重点主体异常、团队履职——继续保持正常运行。',
    special_task: '已将<span class="hl">专项行动进度</span>纳入本周重点关注。<br><br>我会每天检查：<br>• 任务完成率与时间进度对比<br>• 滞后超过 15% 的进入待我确认<br>• 责任条线是否存在掉队情况<br><br>其他日常巡检——安全态势、重大隐患、重点主体异常、团队履职——继续保持正常运行。',
    low_interrupt: '已切换为<span class="hl">低打扰模式</span>。<br><br>规则调整为：<br>• 普通完成只进入运行记录<br>• 只有重大风险和需要你拍板的事项才会主动提醒<br>• 日报正常生成但不推送通知<br><br>所有巡检任务在后台正常运行，只是不再频繁推送。',
    meeting_material: '已增强<span class="hl">会前材料准备</span>能力。<br><br>会议前我将自动整理：<br>• 重大隐患整改进展摘要<br>• 专项行动滞后情况<br>• 重点主体异常清单<br>• 待确认事项汇总<br>• 会议发言提纲草稿<br><br>其他日常巡检——安全态势、重大隐患、专项行动、重点主体、团队履职——继续保持正常运行。',
    default: '好的，采用<span class="hl">默认管理方案</span>。<br><br>我会按标准节奏执行以下日常巡检：<br>• 每日安全态势巡检<br>• 重大隐患闭环检查<br>• 专项行动进度跟踪<br>• 重点主体异常监控<br>• 团队履职情况分析<br>• 会前材料准备<br>• 月度监管报告草稿生成<br><br>需要调整时随时告诉我。'
  };
  var MODE_LABELS = { default:'默认方案', major_hazard:'重大隐患优先', special_task:'专项进度优先', low_interrupt:'低打扰模式', meeting_material:'会前材料增强' };

  // ═══ 对话引擎 ══════════════════════════════════════════════════════
  function chatAppend(html) {
    var box = document.getElementById('chatBox');
    if (!box) return;
    box.insertAdjacentHTML('beforeend', html);
    // 滚动父级容器（.init-container 才是有 overflow-y 的元素）
    var container = box.closest('.init-container') || box.parentElement;
    if (container) {
      requestAnimationFrame(function() { container.scrollTop = container.scrollHeight; });
    }
  }
  function agentMsg(html) {
    return '<div class="c-row agent"><div class="agent-text">' + html + '</div></div>';
  }
  function userMsg(text) {
    return '<div class="c-row user"><div class="c-bubble user">' + text + '</div></div>';
  }
  function thinkingDots(text) {
    var t = text || '正在处理';
    return '<div class="c-row agent thinking" id="thinkingRow"><div class="c-bubble"><span class="td">' + t + '<span></span><span></span><span></span></span></div></div>';
  }
  function showThinking(text, callback) {
    chatAppend(thinkingDots(text));
    setTimeout(function() {
      var row = document.getElementById('thinkingRow');
      if (row) row.remove();
      if (callback) callback();
    }, 700 + Math.random() * 400);
  }
  // ─── 打字引擎 ──────────────────────────────────────────────
  var _typeId = 0;
  function doType(id, html, callback) {
    var el = document.getElementById(id);
    if (!el) { if (callback) callback(); return; }
    // 将 HTML 拆分为标签和纯文本交替的 token 数组
    var tokens = [];
    var regex = /(<[^>]+>)/g;
    var lastIdx = 0, match;
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

    var ti = 0;      // token index
    var ci = 0;      // char index within current text token
    var output = '';

    function typeToken() {
      if (ti >= tokens.length) {
        lucide.createIcons();
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
      // 纯文本：每次追加 2-3 个字符
      var chunk = '';
      for (var c = 0; c < 2 + Math.round(Math.random()) && ci < tok.v.length; c++, ci++) {
        chunk += tok.v[ci];
      }
      output += chunk;
      el.innerHTML = output;
      var ct = document.querySelector('.init-container');
      if (ct) ct.scrollTop = ct.scrollHeight;
      if (ci >= tok.v.length) {
        ci = 0;
        ti++;
      }
      setTimeout(typeToken, 20 + Math.random() * 15);
    }
    typeToken();
  }
  // ─── 思考 → 打字回复 ─────────────────────────────────────
  function typeResponse(thinkText, responseHTML, callback) {
    _typeId++;
    var id = 'typeArea' + _typeId;
    chatAppend(thinkingDots(thinkText));
    setTimeout(function() {
      var row = document.getElementById('thinkingRow');
      if (row) row.remove();
      chatAppend('<div class="c-row agent"><div class="agent-text" id="' + id + '"></div></div>');
      doType(id, responseHTML, callback);
    }, 600 + Math.random() * 300);
  }
  // ─── 纯打字（无思考圆点） ─────────────────────────────────
  function typeText(text, callback) {
    _typeId++;
    var id = 'typeArea' + _typeId;
    chatAppend('<div class="c-row agent"><div class="agent-text" id="' + id + '"></div></div>');
    doType(id, text, callback);
  }
  // ─── 快捷操作芯片（输入框上方居中） ──────────────────────────
  function showActions(chips) {
    var wrap = document.getElementById('initQuickWrap');
    if (!wrap) return;
    if (!chips || chips.length === 0) { wrap.innerHTML = ''; return; }
    var html = '';
    for (var i = 0; i < chips.length; i++) {
      var c = chips[i];
      var cls = c.primary ? ' primary' : '';
      html += '<button class="q-chip' + cls + '" onclick="' + c.click + '">' + c.label + '</button>';
    }
    wrap.innerHTML = html;
    // 自动演示：按钮渲染后自动点击
    if (window._autoChain) {
      clearTimeout(window._chainTimer);
      window._chainTimer = setTimeout(function() {
        var btns = document.querySelectorAll('.q-chip.primary');
        if (btns.length > 0) btns[0].click();
      }, 2500);
    }
  }

  // ═══ 开场 ══════════════════════════════════════════════════════════
  function startConversation() {
    var now = new Date();
    var h = now.getHours();
    var g = h < 9 ? '早上好' : h < 12 ? '上午好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
    chatAppend(
      '<div class="init-welcome">' +
        '<div class="iw-hero">' +
        '<div class="iw-hero-title">' + g + '，站长。</div>' +
        '<div class="iw-hero-desc">我是应擎总控。正在接管你的日常监管节奏——我会按日常节奏巡检整体态势、重大隐患、专项进度、重点主体和团队履职情况。需要你判断的事项会进入总控台。</div>' +
        '<div class="iw-role"><div class="iw-row"><span>当前角色</span><span>良渚街道应急消防工作站站长</span></div><div class="iw-row"><span>管辖范围</span><span>良渚街道</span></div><div class="iw-row"><span>关注对象</span><span>主体对象 / 隐患 / 任务 / 履职</span></div></div></div>' +
      '</div>'
    );
    setTimeout(function() {
      typeText('我们先完成初始化设置，把日常监管安排起来。准备好了吗？', function() {
        showActions([
          { label: '准备好了', click: 'window.doWelcomeNext()', primary: true }
        ]);
        lucide.createIcons();
      });
    }, 600);
  }
  function doWelcomeNext() {
    chatAppend(userMsg('准备好了'));
    setTimeout(function() {
      typeText('好的。在正式开始之前，我先介绍一下我能在哪些方面协助你的日常工作。', function() {
        chatAppend(
          '<div class="ability-grid" style="margin-top:4px">' +
          '<div class="ability-card"><div class="ac-icon blue">盯</div><div class="ac-title">帮你盯</div><div class="ac-desc">重大隐患、重点主体、专项进度、团队履职。</div></div>' +
          '<div class="ability-card"><div class="ac-icon green">判</div><div class="ac-title">帮你判断</div><div class="ac-desc">区分普通波动、待确认事项和重大风险。</div></div>' +
          '<div class="ability-card"><div class="ac-icon orange">整</div><div class="ac-title">帮你整理</div><div class="ac-desc">态势简报、隐患日报、履职简报、会议材料。</div></div>' +
          '<div class="ability-card"><div class="ac-icon red">推</div><div class="ac-title">帮你推动</div><div class="ac-desc">督办、会议议题、现场核查、持续跟踪。</div></div>' +
          '<div class="ability-card"><div class="ac-icon purple">醒</div><div class="ac-title">帮你提醒</div><div class="ac-desc">只在需要关注、判断或处置时推送。</div></div>' +
          '<div class="ability-card"><div class="ac-icon blue">问</div><div class="ac-title">你可直接问</div><div class="ac-desc">支持文字或语音追问、查询、调整口径。</div></div>' +
          '</div>'
        );
        showActions([
          { label: '好的，继续', click: 'window.doContinueAbility()', primary: true }
        ]);
        lucide.createIcons();
      });
    }, 350);
  }
  // ═══ 用户选偏好（多选） ═══════════════════════════════════════════
  var selectedModes = ['daily_risk', 'major_hazard', 'special_task', 'key_subject'];

  function doContinueAbility() {
    chatAppend(userMsg('好的，继续'));
    setTimeout(function() {
      typeText('根据你的岗位，我已整理以下日常关注方向，请确认。', function() {
        renderPrefCards();
      });
    }, 350);
  }

  function renderPrefCards() {
    var html = '<div class="pref-card-wrap" id="prefGrid">' +
      '<div class="attn-list">';
    for (var i = 0; i < PREF_OPTIONS.length; i++) {
      var p = PREF_OPTIONS[i];
      var sel = selectedModes.indexOf(p.id) > -1;
      if (!sel) continue;
      html += '<div class="attn-card selected" data-id="' + p.id + '" onclick="window.togglePref(\'' + p.id + '\')">' +
        '<div class="attn-check">✓</div>' +
        '<div class="attn-body">' +
          '<div class="attn-title">' + p.label + '</div>' +
          '<div class="attn-desc">' + p.sub + '</div>' +
        '</div>' +
      '</div>';
    }
    html += '</div>' +
      '<button class="card-confirm-btn" onclick="window.confirmPref()">确认关注方向</button>' +
    '</div>';
    chatAppend(html);
    lucide.createIcons();
  }

  function togglePref(id) {
    var idx = selectedModes.indexOf(id);
    if (idx > -1) {
      selectedModes.splice(idx, 1);
      if (selectedModes.length === 0) selectedModes.push('daily_risk');
    } else {
      selectedModes.push(id);
    }
    // 只更新被点击的卡片
    var el = document.querySelector('.attn-card[data-id="' + id + '"]');
    if (el) {
      var sel = selectedModes.indexOf(id) > -1;
      el.className = 'attn-card' + (sel ? ' selected' : '');
      var chk = el.querySelector('.attn-check');
      if (chk) chk.textContent = sel ? '✓' : '';
    }
  }

  function confirmPref() {
    // 根据选择生成响应
    userMode = 'default';
    var labels = [];
    for (var i = 0; i < selectedModes.length; i++) {
      var p = PREF_OPTIONS.filter(function(x) { return x.id === selectedModes[i]; })[0];
      if (p) labels.push(p.label);
    }
    chatAppend(userMsg(labels.join('、')));
    var thinkTexts = '正在按你的选择生成管理方案…';
    setTimeout(function() {
      typeResponse(thinkTexts, buildCombinedResponse(), function() {
        showActions([
          { label: '调整关注重点', click: 'window.doContinue("attention")', primary: true },
          { label: '直接生成方案', click: 'window.doQuickFinish()' }
        ]);
        lucide.createIcons();
      });
    }, 350);
  }

  function buildCombinedResponse() {
    var combined = '好的，我将重点关注以下方向：<br><br>';
    for (var i = 0; i < selectedModes.length; i++) {
      var p = PREF_OPTIONS.filter(function(x) { return x.id === selectedModes[i]; })[0];
      if (p) combined += '• <strong>' + p.label + '</strong><br>' + p.sub + '<br><br>';
    }
    combined += '其他日常巡检项继续保持正常运行。需要调整时随时告诉我。';
    return combined;
  }

  // ═══ 关注项 / 提醒边界 ═════════════════════════════════════════════
  function doContinue(phase) {
    if (phase === 'attention') {
      chatAppend(userMsg('调整关注重点'));
      setTimeout(function() {
        typeText('以下默认关注项，点掉不需要的我自动调整推送方式。也可以在直接在输入框告诉我。', function() {
          var html = '<div class="attn-list" id="attentionToggles">';
          for (var i = 0; i < attentionItems.length; i++) {
            var a = attentionItems[i];
            html += '<div class="attn-card' + (a.on ? ' selected' : '') + '" data-id="' + a.id + '" onclick="window.togAttn(\'' + a.id + '\')"><div class="attn-check">' + (a.on ? '✓' : '') + '</div><div class="attn-body"><div class="attn-title">' + a.title + '</div><div class="attn-desc">' + a.desc + '</div></div></div>';
          }
          html += '</div>';
          chatAppend(html);
          showActions([
            { label: '继续设置提醒边界', click: 'window.doContinue("boundary")', primary: true }
          ]);
          lucide.createIcons();
        });
      }, 350);
    } else if (phase === 'boundary') {
      chatAppend(userMsg('继续设置提醒边界'));
      setTimeout(function() {
        var msg = userMode === 'low_interrupt' ? '低打扰模式已启用。最后看一下四级推送规则。' : '最后看一下推送规则。我不会把所有结果都推给你——只有需要关注的才会进入总控台。';
        typeText(msg, function() {
          var ruleHtml = '<div class="rule-list">';
          var rules = [
            { n:'普通完成', h:'只进入运行记录', e:'每日态势简报正常生成', c:'level-gray' },
            { n:'轻微异常', h:'进入总控动态',   e:'片区隐患闭环率轻微下降', c:'level-orange' },
            { n:'需要判断', h:'进入待我确认',   e:'专项行动明显滞后、隐患整改证据不足', c:'level-blue' },
            { n:'重大风险', h:'主动提醒并建议行动', e:'重大隐患超期未闭环、多主体集中异常', c:'level-red' }
          ];
          for (var i = 0; i < rules.length; i++) {
            var r = rules[i];
            var hl = (userMode === 'low_interrupt' && i === 3) ? ' highlighted' : '';
            ruleHtml += '<div class="rule-card ' + r.c + hl + '"><div class="rule-n">' + r.n + '</div><div class="rule-h">' + r.h + '</div><div class="rule-e">' + r.e + '</div></div>';
          }
          ruleHtml += '</div>';
          chatAppend(ruleHtml);
          showActions([
            { label: '生成管理心跳计划', click: 'window.doGenerate()', primary: true, large: true }
          ]);
          lucide.createIcons();
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
    chatAppend(userMsg('直接生成方案'));
    typeText('好的，跳过微调，直接按你的偏好生成方案。', function() {
      setTimeout(function() { doGenerate(); }, 400);
    });
  }

  // ═══ 生成 ══════════════════════════════════════════════════════════
  function doGenerate() {
    chatAppend(userMsg('生成管理心跳计划'));
    var msgs = [
      '正在确认你的角色和管辖范围…',
      '正在生成管理心跳计划…',
      '正在配置日常巡检任务…',
      '正在设置 ' + (userMode === 'low_interrupt' ? '低打扰' : '4 级') + ' 推送边界…',
      '管理心跳计划已生成。'
    ];
    var i = 0;
    function nextGenMsg() {
      if (i >= msgs.length) { setTimeout(showDone, 400); return; }
      typeText(msgs[i], function() {
        i++;
        setTimeout(nextGenMsg, 200);
      });
    }
    setTimeout(nextGenMsg, 350);
  }

  // ═══ 完成 ══════════════════════════════════════════════════════════
  var FEEDS = {
    default: [
      ['08:30','已完成今日安全态势初始化检查','暂无重大新增风险，重大隐患闭环检查将在 10:00 自动运行。','每日态势 Agent'],
      ['09:00','已创建今日重大隐患闭环检查任务','系统将检查重大隐患整改进展、逾期情况和临时管控措施。','重大隐患 Agent']
    ],
    major_hazard: [
      ['08:30','【优先】已完成重大隐患专项检查','重点检查 5 个未闭环重大隐患，其中 2 个已超期。','重大隐患 Agent（优先级提升）'],
      ['09:00','已创建重大隐患整改跟踪任务','今日重点跟踪：北苑商业综合体（超期 3 天）、云栖高层住宅（超期 1 天）。','应擎总控']
    ],
    special_task: [
      ['08:30','【优先】已加载专项行动进度数据','2 个专项行动存在滞后，物流片区完成率 63%。','专项行动 Agent（优先级提升）'],
      ['09:00','已创建专项滞后跟踪任务','重点跟踪：高层小区消防专项（完成率 42%）、危化品专项整治（完成率 71%）。','应擎总控']
    ],
    low_interrupt: [
      ['08:30','低打扰模式已启用','普通完成只进入运行记录。今日巡检已在后台运行。','应擎总控'],
      ['09:00','今日首轮巡检已完成','未发现需你确认的重大风险。如有异常我会主动提醒。','每日态势 Agent']
    ],
    meeting_material: [
      ['08:30','【增强】会前材料整理能力已就绪','会议议题整理、重大隐患摘要、发言提纲草稿均已就绪。','会前准备 Agent（优先级提升）'],
      ['09:00','已生成今日议题简报草稿','包含 2 项需会议决策的事项。','应擎总控']
    ]
  };
  function showDone() {
    var modeTitle = { default:'已生成默认管理心跳计划', major_hazard:'已生成重大隐患优先管理心跳计划', special_task:'已生成专项进度优先管理心跳计划', low_interrupt:'已生成低打扰巡检计划', meeting_material:'已生成会前材料增强计划' };
    var directionLabels = { default:'安全态势、重大隐患、专项行动、重点主体、团队履职', major_hazard:'重大隐患闭环（超期、临时管控、整改方案）', special_task:'专项行动进度（完成率、滞后情况、责任条线）', low_interrupt:'重大风险提醒（仅需要拍板的事）', meeting_material:'会前材料整理（议题摘要、发言提纲）' };
    var html = '';
    html += '<div class="done-scene">' +
      '<div class="done-icon"><i data-lucide="check" width="28" height="28"></i></div>' +
      '<div class="done-title">' + (modeTitle[userMode] || modeTitle.default) + '</div>' +
      '<div class="done-list">' +
        '<div class="done-item"><i data-lucide="check-circle" width="16" height="16"></i><span>已覆盖：' + (directionLabels[userMode] || directionLabels.default) + '</span></div>' +
        '<div class="done-item"><i data-lucide="check-circle" width="16" height="16"></i><span>每日常规检查已安排</span></div>' +
        '<div class="done-item"><i data-lucide="check-circle" width="16" height="16"></i><span>' + (userMode === 'low_interrupt' ? '只在需要你判断时提醒' : '发现异常会自动推送给你') + '</span></div>' +
        '<div class="done-item"><i data-lucide="check-circle" width="16" height="16"></i><span>下一次检查：今日 10:00</span></div>' +
      '</div></div>';
    chatAppend(html);
    showActions([
      { label: '进入工作台', click: 'window.doEnter()', primary: true, large: true }
    ]);
    lucide.createIcons();
    window._initUserMode = userMode;
  }

  // ═══ 进入总控台 ═══════════════════════════════════════════════════
  function doEnter() {
    chatAppend(userMsg('进入工作台'));
    localStorage.setItem(STORAGE_KEY, 'true');
    var overlay = document.getElementById('initOverlay');
    if (overlay) { overlay.classList.remove('active'); overlay.style.display = 'none'; }
    var appEl = document.querySelector('.app');
    if (appEl) appEl.style.display = 'flex';
    if (window.renderScene) window.renderScene('dashboard');
  }

  // ═══ 全局输入处理 ═════════════════════════════════════════════════
  function convChatSend() {
    var input = document.getElementById('initChatInput');
    if (!input || !input.value.trim()) return;
    var val = input.value.trim();
    input.value = '';
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
      setTimeout(function() {
        // 1. 先出状态消息
        chatAppend('<div class="c-row agent"><div class="agent-text" style="color:#94a3b8">正在更新关注项⋯</div></div>');
        // 2. 再插入卡片（带延迟有逐个出现的效果）
        setTimeout(function() {
          if (selectedModes.indexOf(insertId) === -1) {
            selectedModes.push(insertId);
            var grid = document.querySelector('#prefGrid .attn-list');
            if (grid) {
              var p = PREF_OPTIONS.filter(function(x) { return x.id === insertId; })[0];
              if (p) {
                var card = document.createElement('div');
                card.className = 'attn-card selected';
                card.setAttribute('data-id', insertId);
                card.setAttribute('onclick', "window.togglePref('" + insertId + "')");
                card.innerHTML = '<div class="attn-check">✓</div><div class="attn-body"><div class="attn-title">' + p.label + '</div><div class="attn-desc">' + p.sub + '</div></div>';
                card.style.animation = 'fadeUp .35s ease-out both';
                grid.appendChild(card);
                var ct = document.querySelector('.init-container');
                if (ct) ct.scrollTop = ct.scrollHeight;
              }
            }
          }
          // 3. 状态变为完成
          var statusEls = document.querySelectorAll('.c-row.agent .agent-text');
          if (statusEls.length > 0) {
            var last = statusEls[statusEls.length - 1];
            if (last && last.textContent.indexOf('正在更新') === 0) {
              last.style.color = '';
              last.innerHTML = '更新关注项 <span style="color:#16a34a">✓</span>';
            }
          }
          // 4. 打出确认文案
          typeText('好的，已加上。现在关注 ' + selectedModes.length + ' 个方向。', function() {
            lucide.createIcons();
          });
        }, 500);
      }, 600);
      return;
    }
    if (/隐患|超期|闭环|重大/.test(val)) mode = 'major_hazard';
    else if (/专项|任务|进度|滞后/.test(val)) mode = 'special_task';
    else if (/少|别烦|安静|轻|低/.test(val)) mode = 'low_interrupt';
    else if (/会议|材料|议题|发言|月报|报告/.test(val)) mode = 'meeting_material';
    else if (/什么|帮|功能|干|盯/.test(val)) mode = 'what';
    if (mode && mode !== 'what') {
      userMode = mode;
      setTimeout(function() {
        typeResponse('正在按你的要求调整…', MODE_RESPONSES[mode] || MODE_RESPONSES.default, function() {
          showActions([
            { label: '调整关注重点', click: 'window.doContinue("attention")', primary: true },
            { label: '直接生成方案', click: 'window.doQuickFinish()' }
          ]);
          lucide.createIcons();
        });
      }, 350);
    } else if (mode === 'what') {
      setTimeout(function() {
        typeResponse('正在整理能力清单…', '在日常监管中，我可以：<br><br>• <strong>盯</strong> — 重大隐患、重点主体、专项进度、团队履职<br>• <strong>判</strong> — 区分正常波动、待确认和重大风险<br>• <strong>整</strong> — 态势简报、隐患日报、会议材料、月报草稿<br>• <strong>推</strong> — 督办提议、会议议题、现场核查<br>• <strong>醒</strong> — 只在需要你关注时推送<br><br>你现在最想让我先盯什么？', function() {
          lucide.createIcons();
        });
      }, 350);
    } else {
      setTimeout(function() {
        typeResponse('正在同步你的偏好…', '好的，已记录。有什么需要调整的随时告诉我。', function() {
          lucide.createIcons();
        });
      }, 350);
    }
  }
  function convChatVoice() {
    var input = document.getElementById('initChatInput');
    if (!input) return;
    // 检测当前页面上下文，决定模拟内容
    var prefGrid = document.getElementById('prefGrid');
    if (prefGrid) {
      // 在偏好选择页：模拟语音输入添加关注项
      var stepVoice = window._voiceStep || 0;
      if (stepVoice === 0) {
        window._voiceStep = 1;
        input.value = '我还想关注 团队履职是否异常';
        window.convChatSend();
        return;
      } else if (stepVoice === 1) {
        window._voiceStep = 2;
        input.value = '帮我生成每月的安全月报';
        window.convChatSend();
        return;
      }
    }
    // 默认语音弹窗
    showSheet('已识别你的语音','"帮我盯好重大隐患，别让超期的漏掉。"','已切换为重大隐患优先模式。重大隐患 Agent 已提升为最高优先，每天 08:00 和 16:00 各巡检一次。');
  }

  // ═══ 底部快捷回复 ══════════════════════════════════════════════════
  function convQuickReply(text) {
    chatAppend(userMsg(text));
    convChatSend();
  }

  // ═══ Skip ══════════════════════════════════════════════════════════
  function skip() {
    chatAppend(userMsg('稍后再说'));
    var overlay = document.getElementById('initOverlay');
    if (overlay) { overlay.classList.remove('active'); overlay.style.display = 'none'; }
    var appEl = document.querySelector('.app');
    if (appEl) appEl.style.display = 'flex';
    showDisabledBar();
  }
  function showDisabledBar() {
    var ws = document.getElementById('workspace');
    if (!ws || document.getElementById('disabledBar')) return;
    var bar = document.createElement('div');
    bar.id = 'disabledBar';
    bar.className = 'agent-disabled-bar';
    bar.innerHTML = '<i data-lucide="alert-triangle" width="16" height="16"></i><span>应擎总控尚未启用，当前仅展示基础工作台。</span><button class="adb-btn" onclick="window.reEnable()">启用主控 Agent</button>';
    ws.insertBefore(bar, ws.firstChild);
    lucide.createIcons();
  }
  function reEnable() {
    var bar = document.getElementById('disabledBar');
    if (bar) bar.remove();
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
  function resetInit() {
    localStorage.removeItem(STORAGE_KEY);
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
    var m = document.createElement('div'); m.id = 'convSheetMask'; m.className = 'conv-sheet-mask'; m.onclick = closeSheet;
    var s = document.createElement('div'); s.id = 'convSheet'; s.className = 'conv-sheet';
    s.innerHTML = '<div class="conv-sheet-handle"></div><div class="conv-sheet-title">' + title + '</div><div class="conv-sheet-text">' + text + '</div><div class="conv-sheet-result"><div class="conv-sheet-result-label">处理结果</div><p>' + result + '</p></div><button class="c-btn primary sheet-close" onclick="window.closeSheet()">知道了</button>';
    overlay.appendChild(m); overlay.appendChild(s);
    setTimeout(function() { m.classList.add('show'); s.classList.add('show'); }, 10);
  }
  function closeSheet() {
    var m = document.getElementById('convSheetMask');
    var s = document.getElementById('convSheet');
    if (m) m.classList.remove('show');
    if (s) s.classList.remove('show');
    setTimeout(function() { if (m) m.remove(); if (s) s.remove(); }, 300);
  }

  // ═══ Dashboard HTML ════════════════════════════════════════════════
  function renderAgentEnabledHTML() {
    var mode = window._initUserMode || 'default';
    var ac = 0;
    for (var i = 0; i < agents.length; i++) { if (agents[i].on) ac++; }
    var feeds = FEEDS[mode] || FEEDS.default;
    var label = MODE_LABELS[mode] || MODE_LABELS.default;
    var intents = ['今天有没有必须处理的事','看重大隐患有没有超期','看专项行动是否滞后','看重点主体对象有没有异常','看团队履职有没有异常','准备明天会议材料','生成本月监管报告草稿'];
    var html = '';
    html += '<div class="agent-enabled-bar"><div class="aeb-left"><i data-lucide="bot" width="18" height="18"></i><span>应擎总控已启用 <span class="aeb-mode">· ' + label + '</span></span></div><div class="aeb-meta"><span><i data-lucide="activity" width="12" height="12"></i> ' + ac + ' 个子 Agent</span><span><i data-lucide="clock" width="12" height="12"></i> 下次巡检：今日 10:00</span></div></div>';
    html += '<div class="control-feed"><h3><i data-lucide="activity" width="16" height="16"></i> 主控动态</h3>';
    for (var i = 0; i < feeds.length; i++) {
      html += '<div class="feed-item"><span class="feed-time">' + feeds[i][0] + '</span><div class="feed-body"><div class="feed-title">' + feeds[i][1] + '</div><div class="feed-desc">' + feeds[i][2] + '</div><div class="feed-source"><i data-lucide="bot" width="11" height="11"></i> ' + feeds[i][3] + '</div></div><span class="feed-status done">已完成</span></div>';
    }
    html += '</div>';
    html += '<div class="intent-section"><div class="intent-label">你可以让我继续看</div><div class="intent-grid">';
    for (var i = 0; i < intents.length; i++) {
      html += '<div class="intent-chip" onclick="window.doIntent(\'' + intents[i] + '\')"><span>' + intents[i] + '</span></div>';
    }
    html += '</div></div>';
    html += '<div class="agent-input-bar"><input type="text" placeholder="直接问应擎总控，例如：帮我看一下物流片区为什么隐患闭环率下降" id="dashboardQuery" onkeydown="if(event.key===\'Enter\')window.doDashboardQuery()"><button class="aib-btn" onclick="window.doDashboardQuery()"><i data-lucide="send" width="16" height="16"></i></button></div>';
    return html;
  }
  function doIntent(label) { showToast('正在查看「' + label + '」…（演示回复）'); }
  function doDashboardQuery() {
    var input = document.getElementById('dashboardQuery');
    if (!input || !input.value.trim()) return;
    showToast('正在分析你的问题…（演示回复）');
    input.value = '';
  }
  function showToast(text) {
    var t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = text; t.className = 'toast show';
    setTimeout(function() { t.className = 'toast'; }, 2000);
  }

  // ═══ 启动 ══════════════════════════════════════════════════════════
  function init() {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      setTimeout(function() { if (window.renderScene) window.renderScene('dashboard'); }, 50);
      return;
    }
    var overlay = document.getElementById('initOverlay');
    if (overlay) {
      var appEl = document.querySelector('.app');
      if (appEl) appEl.style.display = 'none';
      overlay.style.display = 'flex'; overlay.classList.add('active');
      var box = document.getElementById('chatBox');
      if (box) box.innerHTML = '';
      startConversation();
    }
  }

  // ═══ 导出 ══════════════════════════════════════════════════════════
  window.togglePref = togglePref;
  window.confirmPref = confirmPref;
  window.doContinue = doContinue;
  window.doQuickFinish = doQuickFinish;
  window.doGenerate = doGenerate;
  window.doEnter = doEnter;
  window.doWelcomeNext = doWelcomeNext;
  window.doContinueAbility = doContinueAbility;
  window.togAttn = togAttn;
  window.convChatSend = convChatSend;
  window.convChatVoice = convChatVoice;
  window.convQuickReply = convQuickReply;
  window.skip = skip;
  window.reEnable = reEnable;
  window.resetInit = resetInit;
  window.closeSheet = closeSheet;
  window.doIntent = doIntent;
  window.doDashboardQuery = doDashboardQuery;
  window.isAgentInitialized = function() { return localStorage.getItem(STORAGE_KEY) === 'true'; };
  window.renderAgentEnabledHTML = renderAgentEnabledHTML;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
