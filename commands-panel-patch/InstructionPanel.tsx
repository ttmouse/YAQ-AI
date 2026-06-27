// InstructionPanel — 自定义快捷指令面板（右侧 Dock Tab）
// 极简版：就是一个 textarea 列表
import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { useT } from "../lib/i18n";

const STORAGE_KEY = "reasonix.customInstructions";

interface Item {
  id: string;
  content: string;
}

function load(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(items: Item[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

let _idCounter = Date.now();
function genId(): string {
  return `inst_${++_idCounter}`;
}

export function InstructionPanel() {
  const t = useT();
  const [items, setItems] = useState<Item[]>(load);

  useEffect(() => {
    save(items);
  }, [items]);

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, { id: genId(), content: "" }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateContent = useCallback((id: string, content: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, content } : i)));
  }, []);

  return (
    <div className="instruction-panel">
      <div className="instruction-panel__header">
        <span className="instruction-panel__title">{t("instruction.title")}</span>
        <button type="button" className="instruction-panel__add-btn" onClick={addItem} title={t("instruction.add")}>
          <Plus size={14} />
          <span>{t("instruction.add")}</span>
        </button>
      </div>

      {items.length === 0 && (
        <div className="instruction-panel__empty">{t("instruction.empty")}</div>
      )}

      <div className="instruction-panel__list">
        {items.map((item) => (
          <div key={item.id} className="instruction-panel__item">
            <textarea
              className="instruction-panel__textarea"
              value={item.content}
              onChange={(e) => updateContent(item.id, e.target.value)}
              placeholder={t("instruction.contentPlaceholder")}
              rows={3}
            />
            <button
              type="button"
              className="instruction-panel__del-btn"
              onClick={() => removeItem(item.id)}
              title={t("instruction.delete")}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
