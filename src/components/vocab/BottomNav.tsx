"use client";

import { Copy, Link2, BookOpenText, PlusCircle, Target } from "lucide-react";
import type { ActiveTab } from "./FilterBar";

interface BottomNavProps {
  active: ActiveTab;
  onChange: (t: ActiveTab) => void;
}

const TABS: { id: ActiveTab; label: string; Icon: typeof Copy }[] = [
  { id: "fc", label: "Tarjetas", Icon: Copy },
  { id: "qz", label: "Quiz", Icon: Target },
  { id: "mt", label: "Emparejar", Icon: Link2 },
  { id: "ls", label: "Lista", Icon: BookOpenText },
  { id: "cr", label: "Crear", Icon: PlusCircle },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="flex items-stretch justify-between gap-0.5 rounded-2xl border border-[#d7e0dd] bg-white/95 p-1.5 shadow-[0_-4px_24px_rgba(11,28,44,0.14)] backdrop-blur">
          {TABS.map(({ id, label, Icon }) => {
            const on = active === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 transition-colors ${
                  on
                    ? "bg-[#0B1C2C] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-[#3f7a6f]"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${on ? "text-[#8fd3c6]" : ""}`}
                  aria-hidden
                />
                <span className="max-w-full truncate text-[10px] font-semibold leading-none">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
