// ═══════════════════════════════════════════════════════════
// State — simple observable state manager
// ═══════════════════════════════════════════════════════════

const listeners = new Map()

export const state = {
  activeGoalId: 'comprehensive',
  selectedItemId: null,
  messages: [],            // { role: 'user'|'ai', text: string }
  showNotification: false, // modal
  notificationText: '',
  showVerify: false,       // modal
  verifyQuestions: [],
  aiBanner: null,          // { text: string } | null — shown temporarily
  userModules: null,       // user-adjusted module order per goal
}

export function setState(patch) {
  Object.assign(state, patch)
  emit('stateChange', state)
}

export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, [])
  listeners.get(event).push(fn)
}

export function off(event, fn) {
  if (!listeners.has(event)) return
  const arr = listeners.get(event)
  const i = arr.indexOf(fn)
  if (i >= 0) arr.splice(i, 1)
}

function emit(event, data) {
  if (!listeners.has(event)) return
  for (const fn of listeners.get(event)) fn(data)
}
