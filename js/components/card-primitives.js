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
