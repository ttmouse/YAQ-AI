# 站长每日监管闭环工作台 Demo

## Goal
Build a complete, high-fidelity HTML demo for the "站长每日监管闭环工作台" (Station Chief Daily Supervision Closed-Loop Workbench) as a single self-contained HTML file.

## Scope
- Complete rewrite of index.html as the new v6 demo
- 5 navigation scenes in sidebar: 今日监管工作台, 重大隐患整改日报, 履职效能分析, 主体责任评估, 分级处置闭环
- Drawer panel for 5 action types: 一键督办, 生成简报, 加入会议议题, 现场核查, 履职提醒
- All mock data from the spec
- Toast notifications

## Non-goals
- Do NOT use React/Vue/Tailwind/external CSS frameworks
- No backend, no API calls
- No admin dashboard or BI dashboard styles
- No dark/colorful big-screen styles

## Success criteria
1. Page loads with 今日监管工作台 as default scene
2. All 5 sidebar navigation items switch scenes correctly
3. Topbar action buttons open drawer with dynamic content per action type
4. Drawer content varies correctly for each action
5. All data reflects the mock data from the spec
6. No emoji as UI icons (Lucide only)
7. No console errors on load or interaction
8. Visual style: clean SaaS management + AI command center

## Allowed operations
- read_file, write_file, edit_file, grep, bash

## Verification gates
- Open in browser after each major phase
- Check console for errors
- Verify all interactions work
