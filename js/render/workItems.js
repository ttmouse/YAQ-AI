// ═══════════════════════════════════════════════════════════
// Render Work Items — left column
// ═══════════════════════════════════════════════════════════

import { state } from '../state.js'
import { workItems } from '../data.js'

const diagLabels = {
  discovered: '已发现',
  located: '已定位',
  need_verify: '待核实',
  reason_confirmed: '原因已确认',
  action_generated: '已生成行动',
  closed: '已关闭',
}

export function renderWorkItems() {
  const items = workItems[state.activeGoalId] || []
  const count = items.length
  const highCount = items.filter(i => i.riskLevel === 'high').length
  const verifyCount = items.filter(i => i.diagnosisStatus === 'need_verify').length

  const listHtml = items.length === 0
    ? `<div class="work-items-empty">
         <i data-lucide="inbox"></i>
         <span class="text-sm">当前目标下暂无事项</span>
       </div>`
    : items.map(item => renderItemCard(item)).join('')

  return `
    <div class="col-work-items">
      <div class="col-head">
        <span class="col-title">
          <i data-lucide="alert-circle"></i>
          当前重点事项
        </span>
        <span class="col-count">${count} 件 · <strong>${highCount}</strong> 建议督办${verifyCount > 0 ? ` · ${verifyCount} 待核实` : ''}</span>
      </div>
      <div class="work-items-list">${listHtml}</div>
    </div>`
}

function renderItemCard(item) {
  const selected = state.selectedItemId === item.id ? ' selected' : ''
  const riskLabel = { high: '高', medium: '中', low: '低' }[item.riskLevel] || ''
  const diagLabel = diagLabels[item.diagnosisStatus] || ''

  return `
    <div class="work-item${selected}" data-item-id="${item.id}">
      <div class="work-item-head">
        <span class="work-item-title">${item.title}</span>
        <div class="work-item-meta">
          <span class="badge badge-${item.riskLevel}">${riskLabel}</span>
          <span class="badge badge-neutral">${item.status}</span>
        </div>
      </div>
      <div class="work-item-blocker">${item.currentBlocker}</div>
      <div class="work-item-footer">
        <span class="work-item-resp">
          <i data-lucide="user"></i>
          ${item.responsibleLine}
        </span>
        <span class="work-item-action">${item.nextAction}</span>
      </div>
    </div>`
}
