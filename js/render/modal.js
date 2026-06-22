// ═══════════════════════════════════════════════════════════
// Render Modals — notification + verify questions
// ═══════════════════════════════════════════════════════════

import { state } from '../state.js'

export function renderModals() {
  return `
    ${renderNotificationModal()}
    ${renderVerifyModal()}`
}

function renderNotificationModal() {
  const open = state.showNotification ? ' open' : ''
  return `
    <div class="modal-overlay${open}" id="modal-notification">
      <div class="modal">
        <div class="modal-head">
          <span class="modal-title">生成督办通知</span>
          <button class="modal-close" data-close-modal="notification">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="notif-text">${state.notificationText || ''}</div>
        </div>
        <div class="modal-footer">
          <button class="detail-btn" data-close-modal="notification">关闭</button>
          <button class="detail-btn primary" data-action="copy-notif">
            <i data-lucide="copy"></i> 复制通知
          </button>
        </div>
      </div>
    </div>`
}

function renderVerifyModal() {
  const open = state.showVerify ? ' open' : ''
  const questions = state.verifyQuestions || []
  const qHtml = questions.map((q, i) => `
    <div class="verify-item">
      <span class="verify-num">${i + 1}.</span>
      <span>${q}</span>
    </div>`).join('')

  return `
    <div class="modal-overlay${open}" id="modal-verify">
      <div class="modal">
        <div class="modal-head">
          <span class="modal-title">核实问题清单</span>
          <button class="modal-close" data-close-modal="verify">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom:var(--sp-3);color:var(--muted);font-size:var(--fs-sm)">
            请核实以下问题，确认后系统将更新事项状态：
          </p>
          <div class="verify-list">${qHtml}</div>
        </div>
        <div class="modal-footer">
          <button class="detail-btn" data-close-modal="verify">关闭</button>
          <button class="detail-btn primary" data-action="copy-verify">
            <i data-lucide="copy"></i> 复制问题
          </button>
        </div>
      </div>
    </div>`
}
