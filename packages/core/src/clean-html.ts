const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  ordm: "º",
  ordf: "ª",
  deg: "°",
  aacute: "á",
  eacute: "é",
  iacute: "í",
  oacute: "ó",
  uacute: "ú",
  acirc: "â",
  ecirc: "ê",
  ocirc: "ô",
  atilde: "ã",
  otilde: "õ",
  ccedil: "ç",
  agrave: "à",
  Aacute: "Á",
  Eacute: "É",
  Iacute: "Í",
  Oacute: "Ó",
  Uacute: "Ú",
  Acirc: "Â",
  Ecirc: "Ê",
  Ocirc: "Ô",
  Atilde: "Ã",
  Otilde: "Õ",
  Ccedil: "Ç",
  Agrave: "À",
  uuml: "ü",
  ndash: "-",
  mdash: "—",
  hellip: "…",
  laquo: "«",
  raquo: "»",
  sect: "§",
};

function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, body: string) => {
    if (body[0] === "#") {
      const code =
        body[1] === "x" || body[1] === "X"
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
      if (!Number.isNaN(code)) return String.fromCodePoint(code);
      return match;
    }
    return NAMED_ENTITIES[body] ?? match;
  });
}

/** Remove tags HTML, decodifica entidades e normaliza espaços. */
export function htmlToText(html: string): string {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|br|li|tr|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  text = decodeEntities(text);
  text = text.replace(/[ \t\u00a0]+/g, " ");
  text = text.replace(/\n{2,}/g, "\n");
  return text.trim();
}
