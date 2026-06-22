# 日常态势管理场景 — 实现任务

## Goal
Implement the "日常态势管理" (Daily Situational Awareness) scene as the new default in the YAQ-AI safety supervision workbench, per the design document.

## Scope
- New scenario "日常态势管理" (situational-awareness) as default
- 5 new modules: `situation-judgment`, `concern-queue`, `mainlines`, `recommended-scenes`, `ai-briefing`
- Right sidebar layout support in workspace
- All existing scenarios/modules preserved
- Version badge: v4 → v5

## Non-goals
- Do not remove or modify existing scenarios (comprehensive/inspection/hazard/supervision)
- Custom goal input remains unchanged
- Drill-down panel remains unchanged

## Success criteria
1. "日常态势管理" is the default active scene on load
2. Page shows: top judgment bar → concern queue → three mainlines → recommended scenes → right sidebar with AI briefing
3. Every issue in concern queue has action buttons
4. AI summary includes evidence/reasoning
5. Scenario switching works correctly between all 5 scenarios
6. All animations and interactions work
7. No console errors

## Allowed operations
- read_file, edit_file, write_file, grep, bash (for open/ls)
- lucide.createIcons() available via CDN

## Verification gates
- Open index.html in browser after each major change
- Check console for errors
- Verify all scenarios can be switched to and render correctly
