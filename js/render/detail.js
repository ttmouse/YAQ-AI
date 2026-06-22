// ═══════════════════════════════════════════════════════════
// Render Detail — center column
// ═══════════════════════════════════════════════════════════

import { state } from '../state.js'
import { workItems } from '../data.js'

export function renderDetail() {
  if (!state.selectedItemId) return renderDetailEmpty()

  const items = workItems[state.activeGoalId] || []
  const item = items.find(i => i.id === state.selectedItemId)
  if (!item) return renderDetailEmpty()

  return `
    <div class="detail-panel">
      ${renderDetailHeader(item)}
      ${renderJudgment(item)}
      ${renderActions(item)}
      ${renderChain(item)}
      ${renderEvidence(item)}
      ${renderButtonRow(item)}
    </div>`
}

function renderDetailEmpty() {
  return `
    <div class="detail-empty">
      <i data-lucide="mouse-pointer-click"></i>
      <span class="detail-empty-title">选择左侧事项查看详情</span>
      <span class="detail-empty-desc">点击一条重点事项，这里会展示系统判断、建议动作和执行链路</span>
    </div>`
}

function renderDetailHeader(item) {
  const riskLabel = { high: '高风险', medium: '中风险', low: '低风险' }[item.riskLevel] || ''
  const diagLabels = {
    discovered: '已发现',
    located: '已定位',
    need_verify: '待核实原因',
    reason_confirmed: '原因已确认',
    action_generated: '已生成行动',
    closed: '已关闭',
  }
  return `
    <div class="detail-header">
      <h2 class="detail-title">${item.title}</h2>
      <div class="detail-badges">
        <span class="badge badge-${item.riskLevel}">${riskLabel}</span>
        <span class="badge badge-neutral">${item.status}</span>
        ${item.diagnosisStatus === 'need_verify' ? '<span class="badge badge-medium"><i data-lucide="help-circle" style="width:11px;height:11px"></i> 待核实原因</span>' : ''}
      </div>
    </div>`
}

function renderJudgment(item) {
  // Build judgment text with fact/inference distinction
  const evidenceText = item.evidence.join('；')
  const isVerify = item.diagnosisStatus === 'need_verify'

  let judgment = `<span class="fact">${evidenceText}。</span>`

  if (isVerify) {
    judgment += `<br><br><span class="uncertain">原因待核实</span> — 当前只能确认${item.currentBlocker}，尚不能判断具体原因。建议先发起原因核实。`
  } else {
    judgment += `<br><br>该问题属于${item.type === 'verification_task' ? '核实跟进' : '执行督办'}类事项，建议站长${item.nextAction}。`
  }

  return `
    <div class="detail-section">
      <div class="detail-section-title">
        <i data-lucide="scan-search"></i>
        系统判断
      </div>
      <div class="detail-judgment">${judgment}</div>
    </div>`
}

function renderActions(item) {
  if (!item.actions || item.actions.length === 0) return ''

  const items = item.actions.map((a, i) => `
    <div class="detail-action-item">
      <span class="detail-action-num">${i + 1}</span>
      <span>${a}</span>
    </div>`).join('')

  return `
    <div class="detail-section">
      <div class="detail-section-title">
        <i data-lucide="zap"></i>
        建议站长动作
      </div>
      <div class="detail-actions">${items}</div>
    </div>`
}

function renderChain(item) {
  if (!item.chain) return ''
  const parts = []
  if (item.chain.lead) parts.push({ role: '责任线', desc: item.chain.lead })
  if (item.chain.groupLeader) parts.push({ role: '组长', desc: item.chain.groupLeader })
  if (item.chain.expert) parts.push({ role: '专家', desc: item.chain.expert })
  if (item.chain.enterprise) parts.push({ role: '企业', desc: item.chain.enterprise })

  if (parts.length === 0) return ''

  const html = parts.map(p => `
    <div class="detail-chain-item">
      <span class="detail-chain-role">${p.role}</span>
      <span class="detail-chain-desc">${p.desc}</span>
    </div>`).join('')

  return `
    <div class="detail-section">
      <div class="detail-section-title">
        <i data-lucide="git-branch"></i>
        执行链路
      </div>
      <div class="detail-chain">${html}</div>
    </div>`
}

function renderEvidence(item) {
  if (!item.evidence || item.evidence.length === 0) return ''

  const html = item.evidence.map(e => `
    <div class="detail-evidence-item">${e}</div>`).join('')

  return `
    <div class="detail-section">
      <div class="detail-section-title">
        <i data-lucide="bar-chart-3"></i>
        关联数据
      </div>
      <div class="detail-evidence">${html}</div>
    </div>`
}

function renderButtonRow(item) {
  const isVerify = item.diagnosisStatus === 'need_verify'

  let buttons = ''
  if (isVerify) {
    buttons = `
      <button class="detail-btn primary" data-action="verify" data-item="${item.id}">
        <i data-lucide="help-circle"></i> 发起原因核实
      </button>
      <button class="detail-btn" data-action="verify-questions" data-item="${item.id}">
        <i data-lucide="message-circle-question"></i> 生成核实问题
      </button>
      <button class="detail-btn" data-action="notify" data-item="${item.id}">
        <i data-lucide="bell"></i> 生成通知
      </button>`
  } else {
    buttons = `
      <button class="detail-btn primary" data-action="notify" data-item="${item.id}">
        <i data-lucide="send"></i> 督办责任线
      </button>
      <button class="detail-btn" data-action="notify" data-item="${item.id}">
        <i data-lucide="bell"></i> 生成通知
      </button>
      <button class="detail-btn" data-action="meeting" data-item="${item.id}">
        <i data-lucide="calendar-plus"></i> 加入周会
      </button>`
  }

  return `<div class="detail-btn-row">${buttons}</div>`
}
