"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VocabWord } from "@/lib/vocab-data";
import { shuffle, vibrate } from "@/lib/vocab-utils";

interface QuizProps {
  deck: VocabWord[];
  vocab: VocabWord[];
  quizBest: number;
  onSetBest: (score: number) => void;
}

interface Question {
  w: VocabWord;
  dir: "zh" | "es";
  opts: string[];
  ans: number;
}

interface QuizState {
  qs: Question[];
  i: number;
  score: number;
}

function buildQuiz(deck: VocabWord[], vocab: VocabWord[]): QuizState | null {
  if (deck.length < 4) return null;
  const n = Math.min(10, deck.length);
  const pool = shuffle(deck).slice(0, n);
  const qs: Question[] = pool.map((w) => {
    const dir: "zh" | "es" = Math.random() < 0.5 ? "zh" : "es";
    const correct = dir === "zh" ? w.spanish : w.chinese;
    const opts = new Set<string>([correct]);
    while (opts.size < 4) {
      const r = vocab[Math.floor(Math.random() * vocab.length)];
      const v = dir === "zh" ? r.spanish : r.chinese;
      if (v !== correct) opts.add(v);
    }
    const arr = shuffle([...opts]);
    return { w, dir, opts: arr, ans: arr.indexOf(correct) };
  });
  return { qs, i: 0, score: 0 };
}

export function Quiz({ deck, vocab, quizBest, onSetBest }: QuizProps) {
  const [quiz, setQuiz] = useState<QuizState | null>(() => buildQuiz(deck, vocab));
  const [picked, setPicked] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const nextRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);

  // Al responder o terminar, trae el botón/panel a la vista (evita que quede tras la barra inferior)
  useEffect(() => {
    if (finished) {
      finalRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (picked !== null) {
      nextRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [picked, finished]);

  const newQuiz = useCallback(() => {
    setQuiz(buildQuiz(deck, vocab));
    setPicked(null);
    setFinished(false);
  }, [deck, vocab]);

  if (deck.length < 4) {
    return (
      <div className="py-14 text-center text-sm text-slate-500">
        <Sparkles className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden />
        Necesitas al menos 4 palabras en el mazo filtrado para jugar.
        <br />
        Amplía los filtros.
      </div>
    );
  }

  if (!quiz) return null;

  if (finished || quiz.i >= quiz.qs.length) {
    const s = quiz.score;
    const total = quiz.qs.length;
    const msg =
      s >= 9
        ? "¡Impecable! 🎉"
        : s >= 7
          ? "¡Muy bien! Sigue así 💪"
          : s >= 5
            ? "Buen avance, repite para consolidar 📖"
            : "Repasa con las flashcards y vuelve 🔄";
    const best = Math.max(quizBest, s);
    return (
      <motion.div
        ref={finalRef}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-auto mt-6 max-w-[420px] rounded-[20px] border-2 border-[#529286] bg-[#f4faf8] p-7 text-center"
        role="status"
      >
        <div className="text-[15px] text-slate-500">Resultado de la ronda</div>
        <div className="my-1 text-[52px] font-extrabold leading-none text-[#3f7a6f]">
          {s} / {total}
        </div>
        <div className="mt-2">{msg}</div>
        <div className="mt-1 mb-5 text-[13px] text-slate-500">
          Mejor puntaje: {best} / {total}
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Button onClick={newQuiz} className="min-h-[44px] rounded-xl bg-[#0B1C2C] text-white hover:bg-[#1a3049]">
            <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden /> Repetir
          </Button>
          <Button
            onClick={newQuiz}
            variant="outline"
            className="min-h-[44px] rounded-xl border-[#d7e0dd] bg-white text-slate-800 hover:bg-slate-50"
          >
            Nuevo mazo 🔀
          </Button>
        </div>
      </motion.div>
    );
  }

  const cur = quiz.qs[quiz.i];
  const zh = cur.dir === "zh";

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === cur.ans) vibrate(35);
    else vibrate([60, 40, 60]);
  };

  const next = () => {
    const score = picked === cur.ans ? quiz.score + 1 : quiz.score;
    if (quiz.i + 1 >= quiz.qs.length) {
      onSetBest(score); // guarda el récord (manejador de evento)
      setQuiz({ ...quiz, score });
      setFinished(true);
    } else {
      setQuiz({ ...quiz, i: quiz.i + 1, score });
      setPicked(null);
    }
  };

  return (
    <div className="mx-auto max-w-[560px] text-center">
      <div className="mb-2 text-[13px] text-slate-500">
        Pregunta {quiz.i + 1} de {quiz.qs.length} ·{" "}
        {zh ? "¿Qué significa?" : "¿Cómo se dice en chino?"}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={quiz.i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className={`my-2 font-bold ${
              zh
                ? "cjk text-[40px] leading-tight"
                : "text-[26px] font-semibold"
            }`}
          >
            {zh ? cur.w.chinese : cur.w.spanish}
          </div>
          {!zh && (
            <div className="text-[12.5px] text-slate-500">
              elige el 汉字 correcto
            </div>
          )}
          <div className="mt-4 grid gap-2.5">
            {cur.opts.map((o, i) => {
              const isAns = i === cur.ans;
              const isPicked = i === picked;
              let cls =
                "border-[#d7e0dd] bg-white hover:border-[#529286] hover:bg-[#f4faf8]";
              if (picked !== null) {
                if (isAns)
                  cls =
                    "border-[#16a34a] bg-[#e8f7ee] text-[#14532d] font-semibold";
                else if (isPicked)
                  cls = "border-[#dc2626] bg-[#fdecec] text-[#7f1d1d]";
              }
              return (
                <button
                  key={i}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => pick(i)}
                  className={`rounded-xl border-[1.5px] px-4 py-3.5 text-[15.5px] transition-colors disabled:cursor-default ${cls} ${
                    zh ? "cjk" : ""
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-4 flex items-center justify-between text-[13px] text-slate-500">
        <span>
          Aciertos: <b className="text-[#3f7a6f]">{quiz.score}</b>
        </span>
        <span>
          Mejor: <b className="text-[#3f7a6f]">{Math.max(quizBest, quiz.score)}</b>
        </span>
      </div>
      {picked !== null && (
        <div ref={nextRef} className="mt-4 flex justify-center">
          <Button
            onClick={next}
            className="min-h-[44px] w-full max-w-xs rounded-xl bg-[#0B1C2C] text-white hover:bg-[#1a3049]"
          >
            Siguiente <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}
