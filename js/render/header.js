// ═══════════════════════════════════════════════════════════
// Render Header + Goal Bar
// ═══════════════════════════════════════════════════════════

import { state } from '../state.js'
import { goals, goalMeta } from '../data.js'

export function renderHeader() {
  return `
    <header class="header">
      <div class="header-left">
        <div class="header-brand-icon">擎</div>
        <span class="header-brand">安全生产 AI 动态工作台</span>
        <span class="header-divider"></span>
        <span class="header-subtitle">目标驱动 · 动态编排 · 事项闭环</span>
      </div>
      <div class="header-right">
        <button class="header-btn" id="btn-all-items" title="全部工作项">
          <i data-lucide="list-checks"></i>
          <span>全部工作项</span>
        </button>
        <button class="header-btn" id="btn-map" title="全局地图">
          <i data-lucide="map"></i>
          <span>全局地图</span>
        </button>
        <button class="header-btn" id="btn-assistant-toggle" title="安全助手">
          <i data-lucide="bot"></i>
          <span>安全助手</span>
        </button>
        <div class="user-chip">
          <div class="user-avatar">陈</div>
          <div>
            <div class="user-name">陈明远</div>
            <div class="user-role">站长</div>
          </div>
        </div>
      </div>
    </header>`
}

export function renderGoalBar() {
  const meta = goalMeta[state.activeGoalId] || goalMeta.comprehensive
  const chips = goals.map(g => {
    const active = g.id === state.activeGoalId ? ' active' : ''
    return `<button class="goal-chip${active}" data-goal="${g.id}">${g.label}</button>`
  }).join('')

  return `
    <div class="goal-bar">
      <div class="goal-label">
        <i data-lucide="target"></i>
        <span>当前目标</span>
      </div>
      <div class="goal-chips">${chips}</div>
      <div class="goal-input-wrap">
        <input class="goal-input" id="goal-input" type="text"
               placeholder="输入管理目标，例如：本周重点关注危化使用企业专项检查"
               value="">
        <button class="goal-input-btn" id="goal-submit" title="设定目标">
          <i data-lucide="arrow-right"></i>
        </button>
      </div>
    </div>`
}

export function renderAiBanner() {
  if (!state.aiBanner) return ''
  return `
    <div class="ai-banner">
      <span class="pulse-dot"></span>
      <i data-lucide="sparkles"></i>
      <span>${state.aiBanner.text}</span>
    </div>`
}
