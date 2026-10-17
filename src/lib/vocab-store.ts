"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { BUILTIN_VOCAB, type VocabWord } from "@/lib/vocab-data";

export interface CustomCard {
  id: number;
  chinese: string;
  pinyin: string;
  spanish: string;
  part: "A" | "B";
}

const CUSTOM_TITLE_A = "Mis palabras clave (personalizadas)";
const CUSTOM_TITLE_B = "Mis términos técnicos (personalizados)";

interface VocabState {
  learned: number[];
  quizBest: number;
  custom: CustomCard[];
  toggleLearned: (id: number) => void;
  resetProgress: () => void;
  addCustom: (card: CustomCard) => void;
  removeCustom: (id: number) => void;
  setQuizBest: (score: number) => void;
}

export const useVocabStore = create<VocabState>()(
  persist(
    (set, get) => ({
      learned: [],
      quizBest: 0,
      custom: [],
      toggleLearned: (id) =>
        set((s) => ({
          learned: s.learned.includes(id)
            ? s.learned.filter((x) => x !== id)
            : [...s.learned, id],
        })),
      resetProgress: () => set({ learned: [], quizBest: 0 }),
      addCustom: (card) => set((s) => ({ custom: [...s.custom, card] })),
      removeCustom: (id) =>
        set((s) => ({
          custom: s.custom.filter((c) => c.id !== id),
          learned: s.learned.filter((x) => x !== id),
        })),
      setQuizBest: (score) => {
        if (score > get().quizBest) set({ quizBest: score });
      },
    }),
    {
      name: "vocab-chino-es-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/** Vocabulario completo: 364 términos integrados + tarjetas personalizadas. */
export function buildVocab(custom: CustomCard[]): VocabWord[] {
  const customWords: VocabWord[] = custom.map((c) => ({
    id: c.id,
    chinese: c.chinese,
    pinyin: c.pinyin || "—",
    spanish: c.spanish,
    part: c.part,
    sectionCode: c.part + "+",
    sectionTitle: c.part === "A" ? CUSTOM_TITLE_A : CUSTOM_TITLE_B,
  }));
  return BUILTIN_VOCAB.concat(customWords);
}

export function nextCustomId(custom: CustomCard[]): number {
  return custom.reduce((m, c) => Math.max(m, c.id), 900000) + 1;
}
