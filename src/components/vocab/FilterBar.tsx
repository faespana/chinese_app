"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type PartFilter = "all" | "A" | "B";
export type ActiveTab = "fc" | "qz" | "mt" | "ls" | "cr";

interface FilterBarProps {
  part: PartFilter;
  section: string;
  sections: { code: string; title: string }[];
  deckSize: number;
  onPartChange: (p: PartFilter) => void;
  onSectionChange: (s: string) => void;
}

const PART_PILLS: { value: PartFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "A", label: "A · Palabras clave" },
  { value: "B", label: "B · Técnico constructivo" },
];

export function FilterBar({
  part,
  section,
  sections,
  deckSize,
  onPartChange,
  onSectionChange,
}: FilterBarProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-[#d7e0dd] bg-white p-3 shadow-sm">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filtrar por parte"
        >
          {PART_PILLS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onPartChange(p.value)}
              aria-pressed={part === p.value}
              className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                part === p.value
                  ? "border-[#529286] bg-[#529286] text-white shadow-sm"
                  : "border-[#d7e0dd] bg-white text-slate-700 hover:border-[#529286]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          <Select
            value={section}
            onValueChange={onSectionChange}
            aria-label="Filtrar por sección"
          >
            <SelectTrigger className="h-9 flex-1 border-[#d7e0dd] bg-white text-[13px] text-slate-800">
              <SelectValue placeholder="Todas las secciones" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">Todas las secciones</SelectItem>
              {sections.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.code} — {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span
            className="shrink-0 whitespace-nowrap text-[12.5px] text-slate-500"
            aria-live="polite"
          >
            Mazo: <b className="text-[#3f7a6f]">{deckSize}</b>
          </span>
        </div>
      </div>
    </div>
  );
}
