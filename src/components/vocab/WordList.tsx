"use client";

import { useMemo, useState } from "react";
import { Volume2, Check, Circle, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VocabWord } from "@/lib/vocab-data";
import { norm, speak } from "@/lib/vocab-utils";

interface WordListProps {
  deck: VocabWord[];
  learned: Set<number>;
  onToggleLearned: (id: number) => void;
}

const PAGE = 50;

export function WordList({ deck, learned, onToggleLearned }: WordListProps) {
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE);

  const items = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return deck;
    return deck.filter(
      (w) =>
        norm(w.chinese).includes(q) ||
        norm(w.pinyin).includes(q) ||
        norm(w.spanish).includes(q)
    );
  }, [deck, query]);

  const visible = items.slice(0, shown);

  return (
    <div>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShown(PAGE);
          }}
          placeholder="Buscar chino, pinyin o español (baogao → bàogào)"
          aria-label="Buscar en el vocabulario"
          className="h-12 rounded-xl border-[#d7e0dd] bg-white pl-11 text-[15px] focus-visible:ring-[#529286]"
        />
      </div>

      {items.length === 0 ? (
        <div className="px-3 py-10 text-center text-[14.5px] text-slate-500">
          Sin resultados para tu búsqueda.
        </div>
      ) : (
        <ul className="mt-3.5 space-y-2">
          {visible.map((w) => {
            const le = learned.has(w.id);
            return (
              <li
                key={w.id}
                className="flex items-center gap-3 rounded-xl border border-[#d7e0dd] bg-white px-3.5 py-2.5 transition-colors hover:border-[#529286]"
              >
                <span className="cjk min-w-[92px] shrink-0 text-[22px] font-bold leading-tight text-slate-900">
                  {w.chinese}
                </span>
                <span className="hidden min-[420px]:block shrink-0 text-[13px] italic text-[#3f7a6f]">
                  {w.pinyin}
                </span>
                <span className="min-w-0 flex-1 truncate text-[14px] text-slate-800">
                  {w.spanish}
                </span>
                <span className="hidden shrink-0 rounded-full border border-[#d7e0dd] px-2 py-0.5 text-[11px] text-slate-500 sm:inline">
                  {w.sectionCode}
                </span>
                <button
                  type="button"
                  onClick={() => speak(w.chinese)}
                  aria-label={`Pronunciar ${w.chinese}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d7e0dd] bg-white text-slate-600 transition-colors hover:border-[#529286] hover:text-[#3f7a6f]"
                >
                  <Volume2 className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleLearned(w.id)}
                  aria-label={le ? `Desmarcar ${w.chinese}` : `Marcar ${w.chinese} como aprendida`}
                  aria-pressed={le}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    le
                      ? "border-[#16a34a] bg-[#16a34a] text-white"
                      : "border-[#d7e0dd] bg-white text-slate-400 hover:border-[#529286]"
                  }`}
                >
                  {le ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    <Circle className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {items.length > shown && (
        <Button
          variant="outline"
          onClick={() => setShown((s) => s + PAGE)}
          className="mt-3.5 min-h-[44px] w-full rounded-xl border-[#d7e0dd] bg-white text-slate-800 hover:bg-slate-50"
        >
          Mostrar más <ChevronDown className="ml-1.5 h-4 w-4" aria-hidden /> (
          {items.length - shown} restantes)
        </Button>
      )}
    </div>
  );
}
