(function() {
'use strict';
var YAQ = window.YAQ;
var MOCK = YAQ.MOCK;

// ════════════════════════════════════════════════════════════════
// 渲染左栏场景列表
// ════════════════════════════════════════════════════════════════

function renderSceneList() {
  // 侧边导航已移除，无需渲染
}

// ════════════════════════════════════════════════════════════════
// TAB 管理
// ════════════════════════════════════════════════════════════════

var tabs = [];
var sceneLabels = {
  dashboard: '工作台',
  'hazard-report': '每日隐患',
  efficiency: '履职效能',
  responsibility: '主体责任',
  disposal: '分级处置',
  followup: '重点跟进',
  'pending-actions': '待确认行动',
  'supervision-track': '督办跟踪',
  'monthly-report': '月报'
};

function switchTab(sceneId) {
  YAQ.switchScene(sceneId);
}

function closeTab(sceneId) {
  var idx = -1;
  for (var ti = 0; ti < tabs.length; ti++) {
    if (tabs[ti].id === sceneId) { idx = ti; break; }
  }
  if (idx === -1) return;
  tabs.splice(idx, 1);
  var st = YAQ.state;
  if (st && st.activeScene === sceneId) {
    var next = tabs[Math.min(idx, tabs.length - 1)];
    if (next) {
      st.activeScene = next.id;
      renderTabs();
      YAQ.switchScene(next.id);
    }
  } else {
    renderTabs();
  }
}

function renderTabs() {
  var strip = document.getElementById('tabStrip');
  if (!strip) return;
  var st = YAQ.state || {};
  var html = '';
  for (var ti = 0; ti < tabs.length; ti++) {
    var t = tabs[ti];
    var active = t.id === st.activeScene ? ' active' : '';
    var closeBtn = t.id === 'dashboard' ? '' : '<button class="tab-close" onclick="event.stopPropagation();YAQ.closeTab(\'' + t.id + '\')">✕</button>';
    html += '<div class="tab-item' + active + '" onclick="YAQ.switchTab(\'' + t.id + '\')">' + t.label + closeBtn + '</div>';
  }
  strip.innerHTML = html;
}

var defaultTabs = [
  { id: 'dashboard', label: '工作台' },
  { id: 'hazard-report', label: '每日隐患' },
  { id: 'efficiency', label: '履职效能' },
  { id: 'responsibility', label: '主体责任' },
  { id: 'disposal', label: '分级处置' },
  { id: 'followup', label: '重点跟进' },
  { id: 'pending-actions', label: '待确认行动' },
  { id: 'supervision-track', label: '督办跟踪' },
  { id: 'monthly-report', label: '月报' }
];
defaultTabs.forEach(function(t) { tabs.push(t); });
renderTabs();

// ════════════════════════════════════════════════════════════════
// Backward-compatible window aliases
// ════════════════════════════════════════════════════════════════
window.toggleDemoMenu = window.YAQ.toggleDemoMenu;
window.showToast = function(m) { if (window.YAQ.showToast) window.YAQ.showToast(m); };
window.openDrawer = function(a) { if (window.YAQ.openDrawer) window.YAQ.openDrawer(a); };
window.toggleHamburger = function() { if (window.YAQ.toggleHamburger) window.YAQ.toggleHamburger(); };
window.openLauncher = function() { if (window.YAQ.openLauncher) window.YAQ.openLauncher(); };
window.closeLauncher = function() { if (window.YAQ.closeLauncher) window.YAQ.closeLauncher(); };
window.closeDrillFloat = function() { if (window.YAQ.closeDrillFloat) window.YAQ.closeDrillFloat(); };
window.closeHazardModal = function() { if (window.YAQ.closeHazardModal) window.YAQ.closeHazardModal(); };
window.closeMetricConfig = function() { if (window.YAQ.closeMetricConfig) window.YAQ.closeMetricConfig(); };
window.closeEnterprisePanel = function() { if (window.YAQ.closeEnterprisePanel) window.YAQ.closeEnterprisePanel(); };
window.closeTaskModal = function() { if (window.YAQ.closeTaskModal) window.YAQ.closeTaskModal(); };
window.copyHazardInfo = function() { if (window.YAQ.copyHazardInfo) window.YAQ.copyHazardInfo(); };
window.saveMetricConfig = function() { if (window.YAQ.saveMetricConfig) window.YAQ.saveMetricConfig(); };
window.closePAModal = function() {
  var overlay = document.getElementById('paModalOverlay');
  var modal = document.getElementById('paModal');
  if (overlay) overlay.style.display = 'none';
  if (modal) modal.style.display = 'none';
};
window.renderScene = function(id) { if (window.YAQ.renderScene) window.YAQ.renderScene(id); };
window.escapeHtml = function(s) { if (window.YAQ.escapeHtml) return window.YAQ.escapeHtml(s); return s; };
window.openEnterprisePanel = function(n) { if (window.YAQ.openEnterprisePanel) window.YAQ.openEnterprisePanel(n); };

// ════════════════════════════════════════════════════════════════
// 待确认行动交互
// ════════════════════════════════════════════════════════════════

function confirmPendingAction(paId) {
  var pa = null;
  for (var i = 0; i < MOCK.pendingActions.length; i++) {
    if (MOCK.pendingActions[i].id === paId) { pa = MOCK.pendingActions[i]; break; }
  }
  if (!pa) { YAQ.showToast('未找到待确认行动'); return; }
  // 创建督办包
  var sp = {
    id: 'sp-' + Date.now(),
    title: pa.title,
    basis: pa.basis,
    requirement: pa.requirement,
    items: []
  };
  for (var di = 0; di < pa.draftItems.length; di++) {
    sp.items.push({
      role: pa.draftItems[di].role,
      task: pa.draftItems[di].task,
      status: 'pending'
    });
  }
  (MOCK.confirmedPackages || (MOCK.confirmedPackages = [])).push(sp);
  pa.status = 'confirmed';
  MOCK.supervisionPackages = MOCK.supervisionPackages || [];
  MOCK.supervisionPackages.push({
    id: 'spkg-' + Date.now(),
    title: pa.title,
    createdAt: new Date().toISOString(),
    status: 'active'
  });
  // 同步 TrackStore
  if (YAQ.TrackStore) {
    YAQ.TrackStore.add({ title: pa.title, source: '待确认行动', initNote: pa.requirement });
  }
  YAQ.showToast('✅ 督办包已生成，已向 ' + pa.draftItems.length + ' 个角色发送处理项');
  YAQ.renderScene('pending-actions');
}

function changePendingAction(paId, newType) {
  var pa = null;
  for (var i = 0; i < MOCK.pendingActions.length; i++) {
    if (MOCK.pendingActions[i].id === paId) { pa = MOCK.pendingActions[i]; break; }
  }
  if (!pa) { YAQ.showToast('未找到待确认行动'); return; }
  var labels = { supervise: '督办', track: '跟进', explain: '要求说明' };
  pa.typeId = newType;
  pa.status = 'pending';
  YAQ.showToast('已改为「' + (labels[newType] || newType) + '」');
  YAQ.renderScene('pending-actions');
}

function ignorePendingAction(paId) {
  var pa = null;
  for (var i = 0; i < MOCK.pendingActions.length; i++) {
    if (MOCK.pendingActions[i].id === paId) { pa = MOCK.pendingActions[i]; break; }
  }
  if (!pa) { YAQ.showToast('未找到待确认行动'); return; }
  pa.status = 'ignored';
  YAQ.showToast('已忽略');
  YAQ.renderScene('pending-actions');
}

// 选中 / 批量操作
function togglePASelection(paId, checked) {
  var state = YAQ.state || {};
  state.selectedPAIds = state.selectedPAIds || {};
  if (checked) state.selectedPAIds[paId] = true;
  else delete state.selectedPAIds[paId];
  updateBatchBar();
}
function toggleSelectAllPA(checked) {
  var state = YAQ.state || {};
  state.selectedPAIds = {};
  if (checked) {
    for (var i = 0; i < MOCK.pendingActions.length; i++) {
      if (MOCK.pendingActions[i].status === 'pending') {
        state.selectedPAIds[MOCK.pendingActions[i].id] = true;
      }
    }
  }
  updateBatchBar();
}
function clearPASelection() {
  var state = YAQ.state || {};
  state.selectedPAIds = {};
  updateBatchBar();
}
function updateBatchBar() {
  var state = YAQ.state || {};
  var ids = state.selectedPAIds || {};
  var n = 0;
  for (var k in ids) { if (ids[k]) n++; }
  var bar = document.getElementById('paBatchBar');
  var countEl = document.getElementById('paBatchCount');
  var confirmN = document.getElementById('paBatchConfirmN');
  if (bar) bar.style.display = n > 0 ? 'flex' : 'none';
  if (countEl) countEl.textContent = '已选 ' + n + ' 项';
  if (confirmN) confirmN.textContent = '确认 ' + n + ' 项';
  // 更新全选框
  var selectAllCb = document.getElementById('paSelectAll');
  if (selectAllCb) {
    var pendingCount = 0;
    var pas = MOCK.pendingActions || [];
    for (var pi = 0; pi < pas.length; pi++) {
      if (pas[pi].status === 'pending') pendingCount++;
    }
    selectAllCb.checked = (n === pendingCount && pendingCount > 0);
    selectAllCb.indeterminate = (n > 0 && n < pendingCount);
  }
}
function getSelectedPendingActions() {
  var state = YAQ.state || {};
  var ids = state.selectedPAIds || {};
  var result = [];
  for (var i = 0; i < MOCK.pendingActions.length; i++) {
    var pa = MOCK.pendingActions[i];
    if (ids[pa.id] && pa.status === 'pending') result.push(pa);
  }
  return result;
}
function batchConfirmPAs() {
  var selected = getSelectedPendingActions();
  if (selected.length === 0) { YAQ.showToast('请先选择待确认行动'); return; }
  var totalItems = 0;
  for (var i = 0; i < selected.length; i++) {
    var pa = selected[i];
    var sp = {
      id: 'sp-' + Date.now() + '-' + i,
      title: pa.title,
      basis: pa.basis,
      requirement: pa.requirement,
      items: []
    };
    if (pa.draftItems) {
      for (var di = 0; di < pa.draftItems.length; di++) {
        sp.items.push({ role: pa.draftItems[di].role, task: pa.draftItems[di].task, status: 'pending' });
      }
      totalItems += pa.draftItems.length;
    }
    (MOCK.confirmedPackages || (MOCK.confirmedPackages = [])).push(sp);
    pa.status = 'confirmed';
  }
  clearPASelection();
  YAQ.showToast('✅ 已批量确认 ' + selected.length + ' 个督办包，共生成 ' + totalItems + ' 个处理项');
  YAQ.renderScene('pending-actions');
}
function batchIgnorePAs() {
  var selected = getSelectedPendingActions();
  if (selected.length === 0) { YAQ.showToast('请先选择待确认行动'); return; }
  for (var i = 0; i < selected.length; i++) {
    selected[i].status = 'ignored';
  }
  clearPASelection();
  YAQ.showToast('已批量忽略 ' + selected.length + ' 项待确认行动');
  YAQ.renderScene('pending-actions');
}
function batchChangePAs(newType) {
  var selected = getSelectedPendingActions();
  if (selected.length === 0) { YAQ.showToast('请先选择待确认行动'); return; }
  var labels = { supervise: '督办', track: '跟进', explain: '要求说明' };
  for (var i = 0; i < selected.length; i++) {
    selected[i].typeId = newType;
    selected[i].status = 'pending';
  }
  clearPASelection();
  YAQ.showToast('已批量改为「' + (labels[newType] || newType) + '」共 ' + selected.length + ' 项');
  YAQ.renderScene('pending-actions');
}

// ─── 导出到 YAQ ───
YAQ.confirmPendingAction = confirmPendingAction;
YAQ.changePendingAction = changePendingAction;
YAQ.ignorePendingAction = ignorePendingAction;
YAQ.togglePASelection = togglePASelection;
YAQ.toggleSelectAllPA = toggleSelectAllPA;
YAQ.clearPASelection = clearPASelection;
YAQ.updateBatchBar = updateBatchBar;
YAQ.getSelectedPendingActions = getSelectedPendingActions;
YAQ.batchConfirmPAs = batchConfirmPAs;
YAQ.batchIgnorePAs = batchIgnorePAs;
YAQ.batchChangePAs = batchChangePAs;
YAQ.renderTabs = renderTabs;
YAQ.switchTab = switchTab;
YAQ.closeTab = closeTab;
YAQ.renderSceneList = renderSceneList;

// ════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════

renderSceneList();
YAQ.renderScene('dashboard');
YAQ.bindInteractions();

// ════════════════════════════════════════════════════════════════
// ES6 MODULE SYSTEM
// ════════════════════════════════════════════════════════════════
(function connectES6Modules() {
  var moduleMap = {
    state:       { path: './state.js',        name: '状态管理器' },
    data:        { path: './data.js',         name: '数据层' },
    modules:     { path: './modules.js',      name: '模块注册表' },
    header:      { path: './render/header.js',     name: '顶栏渲染' },
    assistant:   { path: './render/assistant.js',  name: 'AI助手渲染' },
    blocks:      { path: './render/blocks.js',     name: '区块渲染' },
    detail:      { path: './render/detail.js',     name: '详情面板渲染' },
    modal:       { path: './render/modal.js',      name: '弹窗渲染' },
    workItems:   { path: './render/workItems.js',  name: '工作项渲染' },
  };
  var keys = Object.keys(moduleMap);
  var total = keys.length;
  var loaded = [];
  var failed = [];
  keys.forEach(function(key) {
    import(moduleMap[key].path)
      .then(function(mod) {
        window.__Modules = window.__Modules || {};
        window.__Modules[key] = mod;
        loaded.push(key);
      })
      .catch(function(err) {
        failed.push({ key: key, name: moduleMap[key].name, error: err });
        console.warn('[YAQ] 模块加载失败: ' + moduleMap[key].name + ' (' + key + ')', err);
      })
      .finally(function() {
        if (loaded.length + failed.length === total) {
          var detail = { loaded: loaded.slice(), failed: failed.slice() };
          console.log('[YAQ] ✅ ES6 模块系统已连接 — ' + loaded.length + '/' + total + ' 模块加载完成' + (failed.length > 0 ? ' (' + failed.length + ' 个失败)' : ''));
          if (loaded.length > 0) console.log('[YAQ] 已加载模块:', loaded.join(', '));
          window.dispatchEvent(new CustomEvent('modulesReady', { detail: detail }));
        }
      });
  });
})();

})();