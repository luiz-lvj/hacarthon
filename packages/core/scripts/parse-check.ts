import { extractArticles, LAWS } from "../src/parse-laws";

for (const spec of LAWS) {
  const chunks = extractArticles(spec);
  console.log(`\n=== ${spec.source}: ${chunks.length} artigos ===`);
  for (const c of chunks.slice(0, 3)) {
    console.log(`\n[${c.id}] ${c.article}`);
    console.log(c.text.slice(0, 220).replace(/\s+/g, " ") + "...");
  }
  const art12 = chunks.find((c) => c.article === "Art. 12");
  if (art12) console.log(`\n--- Art. 12 preview: ${art12.text.slice(0, 200)}...`);
}
