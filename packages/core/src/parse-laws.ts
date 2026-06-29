import fs from "node:fs";
import path from "node:path";
import { htmlToText } from "./clean-html";
import { rawLawsDir } from "./paths";
import type { LawChunk } from "./types";

export interface LawSpec {
  file: string;
  law: string;
  source: string;
  url: string;
  idPrefix: string;
}

export const LAWS: LawSpec[] = [
  {
    file: "lei12651.html",
    law: "Lei nº 12.651/2012 — Código Florestal",
    source: "Código Florestal",
    url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12651.htm",
    idPrefix: "lei12651",
  },
  {
    file: "d7830.html",
    law: "Decreto nº 7.830/2012 — Regulamenta o CAR",
    source: "Decreto 7.830/2012",
    url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/decreto/d7830.htm",
    idPrefix: "d7830",
  },
];

/** Remove anotações do processo legislativo, que só atrapalham o RAG. */
function stripAnnotations(text: string): string {
  return text
    .replace(
      /\(\s*(?:[^()]*?(?:Inclu[ií]d|Reda[çc][ãa]o|Revogad|Vide|Regulamento|Vig[êe]ncia|VETADO|Produ[çc][ãa]o de efeito|Medida Provis[óo]ria|Lei n[ºo]|pela Lei|pelo Decreto|EC n[ºo])[^()]*?)\s*\)/gi,
      " ",
    )
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([.,;])/g, "$1")
    .trim();
}

export function extractArticles(spec: LawSpec): LawChunk[] {
  const html = fs.readFileSync(path.join(rawLawsDir(), spec.file), "latin1");
  const full = htmlToText(html).replace(/\n/g, " ");

  const startIdx = full.search(/Art\.\s*1/);
  const endIdx = full.search(/Este texto n[ãa]o substitui|Bras[íi]lia,\s*\d/);
  const body = full.slice(startIdx >= 0 ? startIdx : 0, endIdx > startIdx ? endIdx : undefined);

  const headerRe = /Art\.\s*(\d+)\s*(?:[ºo°])?\s*(?:-\s*([A-Z]))?\s*\.?/g;
  const matches = [...body.matchAll(headerRe)];

  const chunks: LawChunk[] = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const num = m[1];
    const suffix = m[2] ? `-${m[2]}` : "";
    const startsAt = m.index ?? 0;
    const endsAt = i + 1 < matches.length ? (matches[i + 1].index ?? body.length) : body.length;
    const raw = body.slice(startsAt, endsAt);
    const text = stripAnnotations(raw);

    const meaningful = text.replace(/^Art\.\s*\d+\s*[ºo°]?\s*(?:-\s*[A-Z])?\s*\.?\s*/i, "").trim();
    if (meaningful.length < 25) continue;

    chunks.push({
      id: `${spec.idPrefix}-art-${num}${suffix}`.toLowerCase(),
      law: spec.law,
      source: spec.source,
      article: `Art. ${num}${suffix}`,
      text,
      url: spec.url,
    });
  }

  // O Planalto exibe a versão original (MP) e a versão consolidada do mesmo
  // artigo em sequência. Mantemos a última ocorrência (texto vigente).
  const byId = new Map<string, LawChunk>();
  for (const c of chunks) byId.set(c.id, c);
  return [...byId.values()];
}

export function extractAll(): LawChunk[] {
  return LAWS.flatMap(extractArticles);
}
