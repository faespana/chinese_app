"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ChevronLeft, ChevronRight, Shuffle, Check, RotateCcw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { VocabWord } from "@/lib/vocab-data";
import { shuffle, speak, vibrate } from "@/lib/vocab-utils";

interface FlashcardsProps {
  deck: VocabWord[];
  learned: Set<number>;
  onToggleLearned: (id: number) => void;
}

export function Flashcards({ deck, learned, onToggleLearned }: FlashcardsProps) {
  const [order, setOrder] = useState<number[]>(() => deck.map((w) => w.id));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const w = useMemo(
    () => deck.find((x) => x.id === order[pos]) ?? deck[0],
    [deck, order, pos]
  );

  const go = useCallback(
    (delta: number) => {
      if (!order.length) return;
      setPos((p) => (p + delta + order.length) % order.length);
      setFlipped(false);
    },
    [order.length]
  );

  const mark = useCallback(
    (known: boolean) => {
      if (!w) return;
      if (known) vibrate(35);
      onToggleLearned(w.id);
      go(1);
    },
    [w, onToggleLearned, go]
  );

  // Atajos de teclado (escritorio)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [go]);

  if (!w) {
    return (
      <div className="py-14 text-center text-sm text-slate-500">
        <Layers className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden />
        No hay tarjetas en el mazo filtrado.
        <br />
        Amplía los filtros para estudiar.
      </div>
    );
  }

  const isLearned = learned.has(w.id);
  const pct = order.length ? ((pos + 1) / order.length) * 100 : 0;

  return (
    <div className="text-center">
      <div
        className="mx-auto w-full max-w-[420px] cursor-pointer select-none"
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        aria-label="Tarjeta, toca para voltear"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
      >
        <div className="relative min-h-[300px] [perspective:1400px]">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={w.id + (flipped ? "-b" : "-f")}
              initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[20px] border-2 p-6 ${
                flipped
                  ? "border-[#9fc6bd] bg-gradient-to-br from-[#f0f7f5] to-[#e7f1ee]"
                  : "border-[#d7e0dd] bg-gradient-to-br from-white to-[#f4faf8]"
              }`}
            >
              {flipped ? (
                <>
                  <div className="cjk text-2xl font-bold italic text-[#3f7a6f] tracking-wide">
                    {w.pinyin}
                  </div>
                  <div className="text-xl font-medium text-slate-900">
                    {w.spanish}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(w.chinese);
                    }}
                    aria-label="Pronunciar en chino"
                    className="absolute right-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#529286] text-white transition-colors hover:bg-[#3f7a6f]"
                  >
                    <Volume2 className="h-5 w-5" aria-hidden />
                  </button>
                </>
              ) : (
                <>
                  <span className="absolute left-3.5 top-3.5 max-w-[70%] truncate rounded-full border border-[#d7e0dd] bg-[#f1f5f4] px-2.5 py-0.5 text-[11px] text-slate-500">
                    {w.sectionCode} · {w.sectionTitle}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(w.chinese);
                    }}
                    aria-label="Pronunciar en chino"
                    className="absolute right-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#529286] text-white transition-colors hover:bg-[#3f7a6f]"
                  >
                    <Volume2 className="h-5 w-5" aria-hidden />
                  </button>
                  <div className="cjk text-[56px] font-bold leading-tight text-slate-900">
                    {w.chinese}
                  </div>
                  {isLearned && (
                    <div className="absolute bottom-3 right-4 text-[12px] font-semibold text-green-600">
                      ✓ aprendida
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2.5">
        <Button
          variant="outline"
          onClick={() => go(-1)}
          className="min-h-[44px] rounded-xl border-[#d7e0dd] bg-white text-slate-800 hover:bg-slate-50"
        >
          <ChevronLeft className="mr-1 h-4 w-4" aria-hidden /> Anterior
        </Button>
        <Button
          onClick={() => {
            setOrder(shuffle(order));
            setPos(0);
            setFlipped(false);
          }}
          className="min-h-[44px] rounded-xl bg-[#d97706] text-white hover:bg-amber-700"
        >
          <Shuffle className="mr-1 h-4 w-4" aria-hidden /> Barajar
        </Button>
        <Button
          variant="outline"
          onClick={() => go(1)}
          className="min-h-[44px] rounded-xl border-[#d7e0dd] bg-white text-slate-800 hover:bg-slate-50"
        >
          Siguiente <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2.5">
        <Button
          onClick={() => mark(false)}
          className="min-h-[44px] rounded-xl bg-[#dc2626] text-white hover:bg-red-700"
        >
          <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden /> No la sé
        </Button>
        <Button
          onClick={() => mark(true)}
          className="min-h-[44px] rounded-xl bg-[#16a34a] text-white hover:bg-green-700"
        >
          <Check className="mr-1.5 h-4 w-4" aria-hidden /> ¡La sé!
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3 text-[13px] text-slate-500">
        <span>
          Tarjeta {pos + 1} de {order.length}
        </span>
        <Progress
          value={pct}
          className="h-2 w-44 [&>[data-slot=progress-indicator]]:bg-[#529286]"
          aria-label="Progreso del mazo"
        />
      </div>
    </div>
  );
}
