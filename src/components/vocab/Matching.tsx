"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Timer, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VocabWord } from "@/lib/vocab-data";
import { shuffle, speak, vibrate } from "@/lib/vocab-utils";

interface MatchingProps {
  deck: VocabWord[];
}

const PAIRS = 5;

export function Matching({ deck }: MatchingProps) {
  const [pairs, setPairs] = useState<VocabWord[]>(() =>
    deck.length < 3 ? [] : shuffle(deck).slice(0, PAIRS)
  );
  const [selL, setSelL] = useState<number | null>(null);
  const [selR, setSelR] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [bad, setBad] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const t0 = useRef<number | null>(null);
  const [running, setRunning] = useState(false);
  const finalRef = useRef<HTMLDivElement>(null);

  const complete = pairs.length > 0 && done.length === pairs.length;

  // Al completar la ronda, centra el panel final en pantalla
  useEffect(() => {
    if (complete) {
      finalRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [complete]);

  const L = useMemo(() => shuffle(pairs), [pairs]);
  const R = useMemo(() => shuffle(pairs), [pairs]);

  // cronómetro: intervalo único que solo actualiza si la ronda está activa
  useEffect(() => {
    const iv = setInterval(() => {
      if (t0.current && running) setElapsed((Date.now() - t0.current) / 1000);
    }, 100);
    return () => clearInterval(iv);
  }, [running]);

  const newRound = useCallback(() => {
    setPairs(deck.length < 3 ? [] : shuffle(deck).slice(0, PAIRS));
    setSelL(null);
    setSelR(null);
    setDone([]);
    setBad([]);
    setElapsed(0);
    t0.current = null;
    setRunning(false);
  }, [deck]);

  const finishStamp = () => {
    setRunning(false);
    if (t0.current) setElapsed((Date.now() - t0.current) / 1000);
  };

  const tryMatch = useCallback(
    (l: number | null, r: number | null, currentDone: number[]) => {
      if (!l || !r) return;
      if (l === r) {
        vibrate(35);
        const nd = [...currentDone, l];
        setDone(nd);
        setSelL(null);
        setSelR(null);
        if (nd.length === pairs.length) finishStamp();
      } else {
        vibrate([60, 40, 60]);
        setBad([l, r]);
        setTimeout(() => {
          setBad([]);
          setSelL(null);
          setSelR(null);
        }, 450);
      }
    },
    [pairs.length]
  );

  const clickL = (id: number) => {
    if (done.includes(id) || bad.length) return;
    setSelL(id);
    if (!t0.current) {
      t0.current = Date.now();
      setRunning(true);
    }
    const w = deck.find((x) => x.id === id);
    if (w) speak(w.chinese);
    tryMatch(id, selR, done);
  };

  const clickR = (id: number) => {
    if (done.includes(id) || bad.length) return;
    setSelR(id);
    if (!t0.current) {
      t0.current = Date.now();
      setRunning(true);
    }
    tryMatch(selL, id, done);
  };

  if (deck.length < 3) {
    return (
      <div className="py-14 text-center text-sm text-slate-500">
        <Shuffle className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden />
        Necesitas al menos 3 palabras en el mazo filtrado para jugar.
        <br />
        Amplía los filtros.
      </div>
    );
  }

  const cellCls = (id: number, side: "l" | "r") => {
    if (done.includes(id))
      return "border-[#16a34a] bg-[#e8f7ee] text-[#14532d] opacity-75 cursor-default";
    const sel = side === "l" ? selL : selR;
    if (bad.includes(id))
      return "border-[#dc2626] bg-[#fdecec] animate-[shake_0.4s_ease]";
    if (sel === id)
      return "border-[#529286] bg-[#eef7f5] shadow-[0_0_0_2px_rgba(82,146,134,0.25)]";
    return "border-[#d7e0dd] bg-white hover:border-[#529286]";
  };

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-center gap-4 text-[14px] text-slate-500">
        <span>Empareja 汉字 con su significado</span>
        <span className="inline-flex items-center gap-1 font-bold tabular-nums text-[#3f7a6f]">
          <Timer className="h-4 w-4" aria-hidden />
          {elapsed.toFixed(1)} s
        </span>
      </div>

      <div className="mx-auto grid max-w-[640px] grid-cols-2 gap-2.5">
        <div className="grid gap-2.5">
          {L.map((w) => (
            <motion.button
              key={w.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => clickL(w.id)}
              className={`cjk min-h-[56px] rounded-xl border-[1.5px] px-2.5 py-3 text-[19px] font-bold transition-colors ${cellCls(
                w.id,
                "l"
              )}`}
            >
              {w.chinese}
            </motion.button>
          ))}
        </div>
        <div className="grid gap-2.5">
          {R.map((w) => (
            <motion.button
              key={w.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => clickR(w.id)}
              className={`min-h-[56px] rounded-xl border-[1.5px] px-2.5 py-3 text-[15px] leading-snug transition-colors ${cellCls(
                w.id,
                "r"
              )}`}
            >
              {w.spanish}
            </motion.button>
          ))}
        </div>
      </div>

      {complete && (
        <motion.div
          ref={finalRef}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mt-5 max-w-[420px] rounded-[20px] border-2 border-[#529286] bg-[#f4faf8] p-6 text-center"
          role="status"
        >
          <div className="text-[15px] text-slate-500">¡Ronda completa! 🎉</div>
          <div className="my-1 text-[38px] font-extrabold leading-none text-[#3f7a6f]">
            {elapsed.toFixed(1)} s
          </div>
          <Button
            onClick={newRound}
            className="mt-3 min-h-[44px] rounded-xl bg-[#0B1C2C] text-white hover:bg-[#1a3049]"
          >
            <Shuffle className="mr-1.5 h-4 w-4" aria-hidden /> Nueva ronda
          </Button>
        </motion.div>
      )}
    </div>
  );
}
