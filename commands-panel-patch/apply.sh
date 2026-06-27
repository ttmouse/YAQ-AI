#!/bin/bash
# ============================================================
# Apply Commands Panel Feature to Reasonix (feat/new-skin-custom)
# ============================================================
# Usage: cd <repo-root> && bash /path/to/this/script.sh
#
# This script creates the new files. You'll still need to make
# the small manual edits listed at the end — those are additive
# changes that won't conflict during rebase.
# ============================================================

set -e

# --- Detect repo root ---
if [ -z "$REPO" ]; then
  REPO="/Users/douba/Projects/DeepSeek-Reasonix/.worktrees/new-skin-custom"
fi
echo "Using repo: $REPO"

# ==============================
# 1. Create CommandsPanel.tsx
# ==============================
COMMANDS_DIR="$REPO/desktop/frontend/src/custom/features/commands"
mkdir -p "$COMMANDS_DIR"

cat > "$COMMANDS_DIR/CommandsPanel.tsx" << 'TSXEOF'
import { useCallback, useEffect, useMemo, useState } from "react";
import { app } from "../../../lib/bridge";
import { useT } from "../../../lib/i18n";
import { Search, Terminal, Zap, Puzzle, Brain } from "lucide-react";
import type { CommandInfo } from "../../../lib/types";
import "./commands.css";

const COMMAND_ICONS: Record<string, typeof Terminal> = {
  builtin: Terminal,
  custom: Zap,
  mcp: Puzzle,
  skill: Brain,
};

const COMMAND_KIND_LABELS: Record<string, string> = {
  builtin: "System",
  custom: "Custom",
  mcp: "MCP",
  skill: "Skill",
};

interface CommandsPanelProps {
  onInsertCommand?: (text: string) => void;
}

export function CommandsPanel({ onInsertCommand }: CommandsPanelProps) {
  const t = useT();
  const [commands, setCommands] = useState<CommandInfo[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    app.Commands()
      .then((next) => setCommands(Array.isArray(next) ? next : []))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!search) return commands;
    const q = search.toLowerCase();
    return commands.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [commands, search]);

  const handlePick = useCallback(
    (cmd: CommandInfo) => {
      onInsertCommand?.(`/${cmd.name} `);
    },
    [onInsertCommand]
  );

  return (
    <div className="commands-panel">
      <div className="commands-panel__search">
        <Search size={14} />
        <input
          type="text"
          className="commands-panel__search-input"
          placeholder={t("commands.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>
      <div className="commands-panel__list">
        {filtered.length === 0 ? (
          <div className="commands-panel__empty">
            {t("commands.noMatches")}
          </div>
        ) : (
          filtered.map((cmd) => {
            const Icon = COMMAND_ICONS[cmd.kind] || Terminal;
            return (
              <button
                key={cmd.kind + ":" + cmd.name}
                type="button"
                className="commands-panel__item"
                onClick={() => handlePick(cmd)}
              >
                <span className="commands-panel__item-icon">
                  <Icon size={14} />
                </span>
                <span className="commands-panel__item-info">
                  <span className="commands-panel__item-name">
                    /{cmd.name}
                  </span>
                  <span className="commands-panel__item-desc">
                    {cmd.description}
                  </span>
                </span>
                <span className="commands-panel__item-kind">
                  {COMMAND_KIND_LABELS[cmd.kind] || cmd.kind}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
TSXEOF

echo "✓ Created $COMMANDS_DIR/CommandsPanel.tsx"

# ==============================
# 2. Create commands.css
# ==============================
cat > "$COMMANDS_DIR/commands.css" << 'CSSEOF'
.commands-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.commands-panel__search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border, #e5e7eb);
  background: var(--bg-secondary, #f9fafb);
}

.commands-panel__search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-primary, #111827);
}

.commands-panel__search-input::placeholder {
  color: var(--text-tertiary, #9ca3af);
}

.commands-panel__list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.commands-panel__empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--text-tertiary, #9ca3af);
  font-size: 13px;
}

.commands-panel__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s ease;
}

.commands-panel__item:hover {
  background: var(--bg-hover, #f3f4f6);
}

.commands-panel__item-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--text-secondary, #6b7280);
}

.commands-panel__item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.commands-panel__item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #111827);
  font-family: var(--font-mono, ui-monospace, monospace);
}

.commands-panel__item-desc {
  font-size: 11px;
  color: var(--text-tertiary, #9ca3af);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.commands-panel__item-kind {
  flex-shrink: 0;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--bg-tertiary, #e5e7eb);
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
}
CSSEOF

echo "✓ Created $COMMANDS_DIR/commands.css"

# ==============================
# 3. Print manual edits summary
# ==============================
echo ""
echo "============================================"
echo "  Manual edits required (additive only) "
echo "============================================"
echo ""
echo "---"
echo "STEP A: store/layout.ts (line ~117)"
echo "---"
echo '  FROM: export type RightDockMode = "context" | "files" | "changed";'
echo '  TO:   export type RightDockMode = "context" | "files" | "changed" | "commands";'
echo ""
echo "---"
echo "STEP B: App.tsx — Add import (near top of file)"
echo "---"
echo '  Add with the other component imports:'
echo '  import { CommandsPanel } from "./custom/features/commands/CommandsPanel";'
echo '  import { Terminal } from "lucide-react";  // if not already imported'
echo ""
echo "---"
echo "STEP C: App.tsx — Add tab button (after line ~3495, the </button> closing 'Changed' tab)"
echo "---"
echo '  Insert BEFORE the </div> on line 3496 (closing workbench-dock__tabs):'
echo ""
echo '                <button'
echo '                  type="button"'
echo '                  role="tab"'
echo '                  aria-selected={rightDockMode === "commands"}'
echo '                  className={`workbench-dock__tab${rightDockMode === "commands" ? " workbench-dock__tab--active" : ""}`}'
echo '                  onClick={() => openRightDockMode("commands")}'
echo '                >'
echo '                  <Terminal size={13} />'
echo '                  <span className="workbench-dock__tab-label">{t("commands.tabLabel")}</span>'
echo '                </button>'
echo ""
echo "---"
echo "STEP D: App.tsx — Add panel rendering (after line ~3533, before the closing </aside>)"
echo "---"
echo '  Insert after the WorkspacePanel closing brace:'
echo ""
echo '              {rightDockMode === "commands" && ('
echo '                <CommandsPanel'
echo '                  onInsertCommand={addWorkspaceTextToComposer}'
echo '                />'
echo '              )}'
echo ""
echo "---"
echo "STEP E: locales/en.ts — Add i18n strings"
echo "---"
echo '  Add somewhere (e.g. near rightDock section):'
echo '  "commands.tabLabel": "Commands",'
echo '  "commands.searchPlaceholder": "Search commands...",'
echo '  "commands.noMatches": "No matching commands",'
echo ""
echo "---"
echo "STEP F: locales/zh.ts — Add Chinese i18n strings"
echo "---"
echo '  "commands.tabLabel": "指令",'
echo '  "commands.searchPlaceholder": "搜索指令...",'
echo '  "commands.noMatches": "没有匹配的指令",'
echo ""
echo "---"
echo "STEP G: locales/zh-TW.ts — Add Traditional Chinese i18n strings"
echo "---"
echo '  "commands.tabLabel": "指令",'
echo '  "commands.searchPlaceholder": "搜尋指令...",'
echo '  "commands.noMatches": "沒有符合的指令",'
echo ""
echo "============================================"
echo "  Done! Rebuild the frontend to see changes."
echo "  cd $REPO/desktop/frontend"
echo "  npm run build   # or pnpm build"
echo "============================================"
