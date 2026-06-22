// ═══════════════════════════════════════════════════════════
// Render AI Assistant — right column
// ═══════════════════════════════════════════════════════════

import { state } from '../state.js'
import { suggestedQuestions, goalMeta } from '../data.js'

export function renderAssistant() {
  const meta = goalMeta[state.activeGoalId] || goalMeta.comprehensive
  const questions = suggestedQuestions[state.activeGoalId] || suggestedQuestions.comprehensive

  const suggestionsHtml = questions.map(q => `
    <div class="assistant-sug" data-question="${escapeAttr(q)}">
      <i data-lucide="sparkles"></i>
      <span>${q}</span>
    </div>`).join('')

  const messagesHtml = state.messages.map(m => `
    <div class="assistant-msg ${m.role}">
      <div class="assistant-msg-label">${m.role === 'user' ? '你' : '安全助手'}</div>
      <div>${m.text}</div>
    </div>`).join('')

  return `
    <div class="assistant">
      <div class="col-head">
        <span class="col-title">
          <i data-lucide="bot"></i>
          安全助手
        </span>
      </div>
      <div class="assistant-body">
        ${messagesHtml}
        ${state.messages.length === 0 ? `
          <div class="assistant-suggestions">
            <div class="assistant-sug-title">推荐问题</div>
            ${suggestionsHtml}
          </div>
        ` : ''}
      </div>
      <div class="assistant-input-wrap">
        <input class="assistant-input" id="assistant-input" type="text"
               placeholder="输入问题或指令…"
               value="">
        <button class="assistant-send" id="assistant-send" title="发送">
          <i data-lucide="arrow-up"></i>
        </button>
      </div>
    </div>`
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
