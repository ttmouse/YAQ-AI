// ═══════════════════════════════════════════════════════════
// Render Blocks — bottom section
// ═══════════════════════════════════════════════════════════

import { blocks } from '../data.js'

export function renderBlocks() {
  const cards = blocks.map(b => `
    <div class="block-card" data-block="${b.id}">
      <div class="block-card-head">
        <span class="block-name">${b.name}</span>
        <span class="block-status ${b.statusClass}">${b.status}</span>
      </div>
      <div class="block-issue">${b.mainIssue}</div>
      <div class="block-resp">
        <i data-lucide="user"></i>
        ${b.responsibleLine}
      </div>
      <div class="block-metrics">
        <div class="block-metric">
          <div class="block-metric-val">${b.metrics.total.toLocaleString()}</div>
          <div class="block-metric-label">主体总数</div>
        </div>
        <div class="block-metric">
          <div class="block-metric-val">${b.metrics.weekCheck}</div>
          <div class="block-metric-label">本周检查</div>
        </div>
        <div class="block-metric">
          <div class="block-metric-val${b.metrics.overdue > 10 ? ' text-muted' : ''}" style="${b.metrics.overdue > 10 ? 'color:var(--red)' : ''}">${b.metrics.overdue}</div>
          <div class="block-metric-label">逾期数</div>
        </div>
      </div>
    </div>`).join('')

  return `
    <div class="bottom-section">
      <div class="blocks-row">${cards}</div>
    </div>`
}
