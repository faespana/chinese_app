"use client";

import { useState } from "react";
import { Copy, Download, Upload, Save, Trash2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { type CustomCard, nextCustomId, useVocabStore } from "@/lib/vocab-store";

export function CardCreator() {
  const { toast } = useToast();
  const custom = useVocabStore((s) => s.custom);
  const addCustom = useVocabStore((s) => s.addCustom);
  const removeCustom = useVocabStore((s) => s.removeCustom);

  const [zh, setZh] = useState("");
  const [py, setPy] = useState("");
  const [es, setEs] = useState("");
  const [part, setPart] = useState<"A" | "B">("B");
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [delId, setDelId] = useState<number | null>(null);

  const save = () => {
    const cZh = zh.trim();
    const cEs = es.trim();
    if (!cZh || !cEs) {
      toast({
        title: "Faltan datos",
        description: "Completa 汉字 (caracteres) y el significado en español.",
        variant: "destructive",
      });
      return;
    }
    const dupe = custom.some((c) => c.chinese === cZh && c.spanish === cEs);
    if (dupe) {
      toast({
        title: "Tarjeta duplicada",
        description: "Esa tarjeta ya existe (mismo 汉字 y mismo significado).",
        variant: "destructive",
      });
      return;
    }
    addCustom({
      id: nextCustomId(custom),
      chinese: cZh,
      pinyin: py.trim(),
      spanish: cEs,
      part,
    });
    setZh("");
    setPy("");
    setEs("");
    vibrateOk();
    toast({
      title: "✅ Tarjeta añadida",
      description: `Ya está en tus mazos (${
        part === "A" ? "palabra clave" : "técnico constructivo"
      }).`,
    });
  };

  const vibrateOk = () => {
    try {
      navigator.vibrate?.(35);
    } catch {
      /* no-op */
    }
  };

  const exportJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(custom, null, 2));
      toast({ title: "📋 JSON copiado al portapapeles" });
    } catch {
      toast({
        title: "No se pudo copiar",
        description: "Tu navegador bloqueó el portapapeles.",
        variant: "destructive",
      });
    }
  };

  const importJson = () => {
    try {
      const parsed = JSON.parse(importText) as CustomCard[];
      if (!Array.isArray(parsed)) throw new Error("no array");
      let added = 0;
      for (const p of parsed) {
        if (!p.chinese || !p.spanish) continue;
        if (
          custom.some((c) => c.chinese === p.chinese && c.spanish === p.spanish)
        )
          continue;
        addCustom({
          id: nextCustomId(custom),
          chinese: String(p.chinese),
          pinyin: p.pinyin ? String(p.pinyin) : "",
          spanish: String(p.spanish),
          part: p.part === "A" ? "A" : "B",
        });
        added++;
      }
      setImportText("");
      setImportOpen(false);
      toast({
        title: `📥 ${added} tarjeta${added === 1 ? "" : "s"} importada${
          added === 1 ? "" : "s"
        }`,
      });
    } catch {
      toast({
        title: "JSON inválido",
        description: "Revisa el formato e inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <PlusCircle className="h-5 w-5 text-[#529286]" aria-hidden />
        <h2 className="text-[19px] font-bold">Crear nueva tarjeta</h2>
      </div>
      <p className="mt-1 mb-4 text-[12.5px] text-slate-500">
        Añade tus propias palabras y clasifícalas al instante como palabra clave
        o término técnico constructivo.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="cZh"
            className="mb-1 block text-[12.5px] font-semibold text-slate-500"
          >
            汉字 (caracteres) *
          </label>
          <Input
            id="cZh"
            value={zh}
            onChange={(e) => setZh(e.target.value)}
            placeholder="ej. 钢结构"
            className="cjk h-11 rounded-xl border-[#d7e0dd] bg-white text-[16px] focus-visible:ring-[#529286]"
          />
        </div>
        <div>
          <label
            htmlFor="cPy"
            className="mb-1 block text-[12.5px] font-semibold text-slate-500"
          >
            Pinyin (opcional)
          </label>
          <Input
            id="cPy"
            value={py}
            onChange={(e) => setPy(e.target.value)}
            placeholder="ej. gāngjiégòu"
            className="h-11 rounded-xl border-[#d7e0dd] bg-white focus-visible:ring-[#529286]"
          />
        </div>
      </div>

      <div className="mt-3">
        <label
          htmlFor="cEs"
          className="mb-1 block text-[12.5px] font-semibold text-slate-500"
        >
          Significado en español *
        </label>
        <Input
          id="cEs"
          value={es}
          onChange={(e) => setEs(e.target.value)}
          placeholder="ej. estructura de acero"
          className="h-11 rounded-xl border-[#d7e0dd] bg-white focus-visible:ring-[#529286]"
        />
      </div>

      <div className="mt-3">
        <span className="mb-1.5 block text-[12.5px] font-semibold text-slate-500">
          Clasificación *
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Clasificación">
          <button
            type="button"
            onClick={() => setPart("A")}
            aria-pressed={part === "A"}
            className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              part === "A"
                ? "border-[#529286] bg-[#529286] text-white"
                : "border-[#d7e0dd] bg-white text-slate-700 hover:border-[#529286]"
            }`}
          >
            A · Palabra clave
          </button>
          <button
            type="button"
            onClick={() => setPart("B")}
            aria-pressed={part === "B"}
            className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              part === "B"
                ? "border-[#529286] bg-[#529286] text-white"
                : "border-[#d7e0dd] bg-white text-slate-700 hover:border-[#529286]"
            }`}
          >
            B · Técnico constructivo
          </button>
        </div>
        <p className="mt-1.5 text-[12.5px] text-slate-500">
          {part === "A"
            ? "Se clasificará en “A+ — Mis palabras clave (personalizadas)”."
            : "Se clasificará en “B+ — Mis términos técnicos (personalizados)”."}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <Button
          onClick={save}
          className="min-h-[44px] rounded-xl bg-[#16a34a] text-white hover:bg-green-700"
        >
          <Save className="mr-1.5 h-4 w-4" aria-hidden /> Guardar tarjeta
        </Button>
      </div>

      <div className="mt-6 border-t border-dashed border-[#d7e0dd] pt-4">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-bold">
            Mis tarjetas personalizadas (
            <b className="text-[#3f7a6f]">{custom.length}</b>)
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportJson}
              disabled={custom.length === 0}
              className="h-9 rounded-lg border-[#d7e0dd] bg-white text-[12.5px] text-slate-800 hover:bg-slate-50"
            >
              <Copy className="mr-1 h-3.5 w-3.5" aria-hidden /> Copiar JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportOpen((o) => !o)}
              className="h-9 rounded-lg border-[#d7e0dd] bg-white text-[12.5px] text-slate-800 hover:bg-slate-50"
            >
              <Upload className="mr-1 h-3.5 w-3.5" aria-hidden /> Importar JSON
            </Button>
          </div>
        </div>

        {importOpen && (
          <div className="mb-3">
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='Pega aquí un JSON: [{"chinese":"试","pinyin":"shì","spanish":"prueba","part":"A"}]'
              className="min-h-[74px] rounded-xl border-[#d7e0dd] bg-white font-mono text-[13px] focus-visible:ring-[#529286]"
            />
            <Button
              onClick={importJson}
              size="sm"
              className="mt-2 h-9 rounded-lg bg-[#0B1C2C] text-[13px] text-white hover:bg-[#1a3049]"
            >
              <Download className="mr-1 h-3.5 w-3.5" aria-hidden /> Importar
            </Button>
          </div>
        )}

        {custom.length === 0 ? (
          <p className="py-4 text-center text-[14px] text-slate-500">
            Aún no has creado tarjetas personalizadas.
          </p>
        ) : (
          <ul className="mt-2 max-h-96 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
            {custom.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-[#d7e0dd] bg-white px-3 py-2"
              >
                <span className="cjk min-w-[70px] text-[19px] font-bold">
                  {c.chinese}
                </span>
                <span className="hidden min-[420px]:inline text-[12.5px] italic text-[#3f7a6f]">
                  {c.pinyin || "—"}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13.5px]">
                  {c.spanish}
                </span>
                <span className="shrink-0 rounded-full border border-[#d7e0dd] px-2 py-0.5 text-[11px] text-slate-500">
                  {c.part}+
                </span>
                <button
                  type="button"
                  onClick={() => setDelId(c.id)}
                  aria-label={`Eliminar ${c.chinese}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d7e0dd] text-slate-400 transition-colors hover:border-[#dc2626] hover:text-[#dc2626]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog
        open={delId !== null}
        onOpenChange={(o) => !o && setDelId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta tarjeta?</AlertDialogTitle>
            <AlertDialogDescription>
              La tarjeta personalizada se borrará de tus mazos. Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (delId !== null) {
                  removeCustom(delId); // también la quita de "aprendidas"
                }
                setDelId(null);
                toast({ title: "🗑️ Tarjeta eliminada" });
              }}
              className="rounded-xl bg-[#dc2626] text-white hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
