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
