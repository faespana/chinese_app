"use client";

import { BookOpenText, CheckCircle2, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AppHeaderProps {
  total: number;
  learned: number;
}

export function AppHeader({ total, learned }: AppHeaderProps) {
  const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
  return (
    <header className="bg-[#0B1C2C] text-white px-4 pt-6 pb-5 shadow-lg">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/15">
            <BookOpenText className="h-6 w-6 text-[#8fd3c6]" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-wide leading-tight">
              Vocabulario Chino–Español
            </h1>
            <p className="text-[12px] sm:text-[13px] text-slate-300 leading-snug truncate">
              Proyecto El Domo · términos técnicos y palabras clave
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="status" aria-live="polite">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[12.5px]">
            <BookOpenText className="h-3.5 w-3.5 text-[#8fd3c6]" aria-hidden />
            <b className="font-semibold">{total}</b>&nbsp;palabras
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[12.5px]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#8fd3c6]" aria-hidden />
            <b className="font-semibold">{learned}</b>&nbsp;aprendidas
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[12.5px]">
            <Target className="h-3.5 w-3.5 text-[#8fd3c6]" aria-hidden />
            <b className="font-semibold">{pct}%</b>&nbsp;de dominio
          </span>
        </div>

        <div className="mt-3">
          <Progress
            value={pct}
            className="h-2.5 bg-white/15 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-[#529286] [&>[data-slot=progress-indicator]]:to-[#7fc4b5]"
            aria-label={`Progreso de dominio: ${pct}%`}
          />
        </div>
      </div>
    </header>
  );
}
