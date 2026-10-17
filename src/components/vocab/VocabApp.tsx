"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Smartphone } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { buildVocab, useVocabStore } from "@/lib/vocab-store";
import type { PartFilter, ActiveTab } from "./FilterBar";
import { FilterBar } from "./FilterBar";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { Flashcards } from "./Flashcards";
import { Quiz } from "./Quiz";
import { Matching } from "./Matching";
import { WordList } from "./WordList";
import { CardCreator } from "./CardCreator";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
}

/** Detección de montaje segura para SSR (evita mismatch con store persistido). */
const emptySubscribe = () => () => {};

export function VocabApp() {
  const { toast } = useToast();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [tab, setTab] = useState<ActiveTab>("fc");
  const [part, setPart] = useState<PartFilter>("all");
  const [section, setSection] = useState("all");
  const [installEvt, setInstallEvt] = useState<BIPEvent | null>(null);

  const learned = useVocabStore((s) => s.learned);
  const quizBest = useVocabStore((s) => s.quizBest);
  const custom = useVocabStore((s) => s.custom);
  const toggleLearned = useVocabStore((s) => s.toggleLearned);
  const resetProgress = useVocabStore((s) => s.resetProgress);
  const setQuizBest = useVocabStore((s) => s.setQuizBest);

  // Banner de instalación PWA (Android Chrome)
  useEffect(() => {
    const h = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  const learnedSet = useMemo(() => new Set(learned), [learned]);
  const vocab = useMemo(() => buildVocab(custom), [custom]);
  const deck = useMemo(
    () =>
      vocab.filter(
        (w) =>
          (part === "all" || w.part === part) &&
          (section === "all" || w.sectionCode === section)
      ),
    [vocab, part, section]
  );
  const sections = useMemo(() => {
    const map = new Map<string, string>();
    vocab.forEach((w) => {
      if (!map.has(w.sectionCode)) map.set(w.sectionCode, w.sectionTitle);
    });
    return [...map.entries()].map(([code, title]) => ({ code, title }));
  }, [vocab]);

  const onPartChange = (p: PartFilter) => {
    setPart(p);
    setSection("all");
  };

  const onSectionChange = (s: string) => {
    setSection(s);
    if (s !== "all") {
      const w = vocab.find((v) => v.sectionCode === s);
      if (w) setPart(w.part);
    }
  };

  if (!mounted) {
    // Evita mismatch de hidratación con el store persistido
    return (
      <div className="flex min-h-screen flex-col bg-[#eef2f1]">
        <div className="h-40 bg-[#0B1C2C]" />
        <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
          <div className="h-64 animate-pulse rounded-2xl bg-white/70" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#eef2f1]">
      <AppHeader total={vocab.length} learned={learnedSet.size} />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 pb-32 pt-4 sm:px-4">
        <FilterBar
          part={part}
          section={section}
          sections={sections}
          deckSize={deck.length}
          onPartChange={onPartChange}
          onSectionChange={onSectionChange}
        />

        <div className="mt-4 rounded-2xl border border-[#d7e0dd] bg-white p-4 shadow-sm sm:p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${tab}-${part}-${section}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "fc" && (
                <Flashcards
                  deck={deck}
                  learned={learnedSet}
                  onToggleLearned={toggleLearned}
                />
              )}
              {tab === "qz" && (
                <Quiz
                  deck={deck}
                  vocab={vocab}
                  quizBest={quizBest}
                  onSetBest={setQuizBest}
                />
              )}
              {tab === "mt" && <Matching deck={deck} />}
              {tab === "ls" && (
                <WordList
                  deck={deck}
                  learned={learnedSet}
                  onToggleLearned={toggleLearned}
                />
              )}
              {tab === "cr" && <CardCreator />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pie de app */}
        <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 px-1 pb-2 pt-6 text-[12.5px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Smartphone className="h-3.5 w-3.5" aria-hidden />
            App offline · progreso guardado en este dispositivo
          </span>
          <div className="flex gap-2">
            {installEvt && (
              <Button
                size="sm"
                onClick={() => {
                  installEvt.prompt();
                  setInstallEvt(null);
                }}
                className="h-8 rounded-lg bg-[#529286] px-3 text-[12px] text-white hover:bg-[#3f7a6f]"
              >
                ⬇ Instalar app
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-[#d7e0dd] bg-white px-3 text-[12px] text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="mr-1 h-3 w-3" aria-hidden /> Reiniciar
                  progreso
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    ¿Borrar todo tu progreso?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Se reiniciarán las palabras marcadas como aprendidas y el
                    mejor puntaje del quiz. Tus tarjetas personalizadas se
                    conservan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      resetProgress();
                      toast({ title: "♻️ Progreso reiniciado" });
                    }}
                    className="rounded-xl bg-[#dc2626] text-white hover:bg-red-700"
                  >
                    Reiniciar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </footer>
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
