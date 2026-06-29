/* ═══════════════════════════════════════════════════════════════════════════
   CardPrimitives — Agent 回复表达原语（6 种卡片组件）

   这些不是「场景的积木块」，而是 Agent 生成回复时的表达手段。
   就像 ChatGPT 可以输出文字+表格+代码块，这里的回复可以包含：

     SectionHead "物流片区闭环率分析"
     StatCard    [闭环率 78.3% ↓] [超期 12 件 ↑]
     Table       [企业 | 闭环率 | 状态]
     DetailCard  [XX 化工详情]
     StatusBadge [危险] [正常] [超期]
     ActionBtn   [督办] [查看详情]

   用法：
     var reply = CardPrimitives.sectionHead('物流片区分析') +
       CardPrimitives.statCardRow([
         { label: '闭环率', value: '78.3%', trend: 'down', delta: '5.2%' },
         { label: '超期隐患', value: '12', trend: 'up', delta: '3' }
       ]) +
       CardPrimitives.table({
         headers: ['企业', '闭环率', '状态'],
         rows: [
           ['XX 化工', '65%', CardPrimitives.statusBadge('danger', '危险')],
           ['YY 物流', '92%', CardPrimitives.statusBadge('normal', '正常')],
         ]
       });
     sceneAppend(reply);
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var P = {};

  /* ═══════════════════════════════════════════════════════════════════════
     1. SectionHead — 段落标题
     ═══════════════════════════════════════════════════════════════════════ */
  P.sectionHead = function (title, options) {
    options = options || {};
    var html = '<div class="cp-section"';
    if (options.id) html += ' id="' + esc(options.id) + '"';
    html += '>';
    html += '<div class="cp-section-title">';
    if (options.icon) html += '<span class="cp-section-icon">' + options.icon + '</span>';
    html += esc(title);
    if (options.subtitle) html += '<span class="cp-section-subtitle">' + esc(options.subtitle) + '</span>';
    html += '</div>';
    if (options.desc) html += '<div class="cp-section-desc">' + esc(options.desc) + '</div>';
    html += '</div>';
    return html;
  };

  /* ═══════════════════════════════════════════════════════════════════════
     2. StatCard — 数值指标卡（单张）
     ═══════════════════════════════════════════════════════════════════════ */
  P.statCard = function (opts) {
    var cls = 'cp-statcard';
    if (opts.trend === 'up') cls += ' trend-up';
    if (opts.trend === 'down') cls += ' trend-down';
    if (opts.alert) cls += ' alert-' + opts.alert;
    if (opts.size === 'lg') cls += ' cp-statcard-lg';

    var html = '<div class="' + cls + '">';
    html += '<div class="cp-statcard-label">' + esc(opts.label) + '</div>';
    html += '<div class="cp-statcard-value">' + esc(opts.value) + '</div>';
    if (opts.delta) {
      var arrow = opts.trend === 'up' ? '↑' : opts.trend === 'down' ? '↓' : '';
      html += '<div class="cp-statcard-delta">' + arrow + ' ' + esc(opts.delta) + '</div>';
    }
    if (opts.desc) html += '<div class="cp-statcard-desc">' + esc(opts.desc) + '</div>';
    html += '</div>';
    return html;
  };

  /* ═══════════════════════════════════════════════════════════════════════
     3. StatCardRow — 一行多张指标卡
     ═══════════════════════════════════════════════════════════════════════ */
  P.statCardRow = function (cards) {
    var html = '<div class="cp-statrow">';
    for (var i = 0; i < cards.length; i++) {
      html += P.statCard(cards[i]);
    }
    html += '</div>';
    return html;
  };

  /* ═══════════════════════════════════════════════════════════════════════
     4. Table — 数据表格
     ═══════════════════════════════════════════════════════════════════════ */
  P.table = function (opts) {
    if (!opts.headers || !opts.rows) return '';
    var html = '<div class="cp-table-wrap"><table class="cp-table">';
    // header
    html += '<thead><tr>';
    for (var i = 0; i < opts.headers.length; i++) {
      html += '<th>' + esc(opts.headers[i]) + '</th>';
    }
    html += '</tr></thead>';
    // body
    html += '<tbody>';
    for (var r = 0; r < opts.rows.length; r++) {
      html += '<tr>';
      var row = opts.rows[r];
      for (var c = 0; c < row.length; c++) {
        html += '<td>' + row[c] + '</td>';
      }
      html += '</tr>';
    }
    html += '</tbody>';
    html += '</table></div>';
    return html;
  };

  /* ═══════════════════════════════════════════════════════════════════════
     5. DetailCard — 详情卡片
     ═══════════════════════════════════════════════════════════════════════ */
  P.detailCard = function (opts) {
    var html = '<div class="cp-detailcard"';
    if (opts.onclick) html += ' onclick="' + esc(opts.onclick) + '"';
    html += '>';
    if (opts.icon) html += '<div class="cp-detailcard-icon">' + opts.icon + '</div>';
    html += '<div class="cp-detailcard-body">';
    html += '<div class="cp-detailcard-title">' + esc(opts.title) + '</div>';
    if (opts.subtitle) html += '<div class="cp-detailcard-sub">' + esc(opts.subtitle) + '</div>';
    if (opts.meta) {
      html += '<div class="cp-detailcard-meta">';
      for (var k in opts.meta) {
        if (opts.meta.hasOwnProperty(k)) {
          html +=
            '<span class="cp-detailcard-meta-item"><strong>' + esc(k) + ':</strong> ' + esc(opts.meta[k]) + '</span>';
        }
      }
      html += '</div>';
    }
    if (opts.desc) html += '<div class="cp-detailcard-desc">' + opts.desc + '</div>';
    html += '</div>';
    if (opts.tag) html += '<div class="cp-detailcard-tag">' + opts.tag + '</div>';
    html += '</div>';
    return html;
  };

  /* ═══════════════════════════════════════════════════════════════════════
     6. StatusBadge — 状态标签
     ═══════════════════════════════════════════════════════════════════════ */
  P.statusBadge = function (type, label) {
    var cls = 'cp-badge';
    if (type) cls += ' badge-' + type;
    return '<span class="' + cls + '">' + esc(label || type) + '</span>';
  };

  /* ═══════════════════════════════════════════════════════════════════════
     7. ActionBtn — 操作按钮
     ═══════════════════════════════════════════════════════════════════════ */
  P.actionBtn = function (label, cmd, arg) {
    var html = '<button class="cp-action-btn"';
    if (cmd) html += ' data-cmd="' + cmd + '"';
    if (arg) html += ' data-arg="' + arg + '"';
    html += '>' + esc(label) + '</button>';
    return html;
  };

  /* ═══════════════════════════════════════════════════════════════════════
     8. ButtonRow — 按钮行
     ═══════════════════════════════════════════════════════════════════════ */
  P.buttonRow = function (btns) {
    var html = '<div class="cp-btnrow">';
    for (var i = 0; i < btns.length; i++) {
      html += P.actionBtn(btns[i].label, btns[i].cmd, btns[i].arg);
    }
    html += '</div>';
    return html;
  };

  /* ═══════════════════════════════════════════════════════════════════════
     9. EntityCard — 实体卡片（隐患/任务复用）
     参数: { name, desc, meta:[{text, style}], badge, badgeColor, badgeBg,
            footer, onclick, variant('danger'|'warning'|'') }
     ═══════════════════════════════════════════════════════════════════════ */
  P.entityCard = function (opts) {
    var variant = opts.variant || '';
    var html = '<div class="hazard-card' + (variant ? ' ' + variant : '') + '"';
    html += ' style="width:240px;min-width:220px;margin-bottom:12px;border-color:#e2e8f0;cursor:pointer"';
    if (opts.onclick) html += ' onclick="' + opts.onclick + '"';
    if (opts.title) html += ' title="' + esc(opts.title) + '"';
    html += '>';
    html += '<div class="hc-main has-ai" style="padding:12px 12px 8px">';
    html += '<div class="hc-head"><span class="hc-name">' + esc(opts.name) + '</span></div>';
    if (opts.desc) html += '<div class="hc-desc">' + esc(opts.desc) + '</div>';
    if (opts.meta && opts.meta.length) {
      html += '<div class="hc-meta">';
      for (var i = 0; i < opts.meta.length; i++) {
        html += '<span' + (opts.meta[i].style ? ' style="' + opts.meta[i].style + '"' : '') + '>' + opts.meta[i].text + '</span>';
      }
      html += '</div>';
    }
    if (opts.badge) {
      html += '<div style="font-size:11px;font-weight:600;color:' + (opts.badgeColor || '#dc2626') +
        ';background:' + (opts.badgeBg || '#fef2f2') +
        ';display:inline-block;padding:1px 8px;border-radius:4px">' + esc(opts.badge) + '</div>';
    }
    if (opts.time) html += '<div class="hc-time">' + esc(opts.time) + '</div>';
    html += '</div>';
    if (opts.footer) {
      html += '<div style="font-size:12px;color:#475569;padding:8px 12px 10px;display:flex;align-items:center;gap:4px;line-height:1.4;border-radius:0 0 12px 12px">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#7c3aed;flex-shrink:0"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle></svg>' +
        '<span>' + esc(opts.footer) + '</span>' +
        '</div>';
    }
    html += '</div>';
    return html;
  };

  /* ═══════════════════════════════════════════════════════════════════════
     HTML 转义
     ═══════════════════════════════════════════════════════════════════════ */
  function esc(s) {
    if (typeof s !== 'string') return String(s);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ═══════════════════════════════════════════════════════════════════════
     暴露 API
     ═══════════════════════════════════════════════════════════════════════ */
  window.CardPrimitives = P;
})();
