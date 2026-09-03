import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const portalDir = resolve(root, "portal");
const manifest = JSON.parse(readFileSync(resolve(portalDir, "deployment.json"), "utf8"));
const index = readFileSync(resolve(portalDir, "index.html"), "utf8");

const REQUIRED_REPOSITORY = "henricklu-creator/fiscabot-pro";
const REQUIRED_SUPABASE_REF = "oadqtuisqewfbtvgwfkz";
const FORBIDDEN_SUPABASE_REFS = [
  "wvepnwkkyqdrcrhozsfx",
  "mgklrzopnjhwrucuqoyt",
  "xhbsxtqejmhnmbzqsxth",
];
const REQUIRED_MARKERS = [
  "Crédito Outorgado GO",
  "Crédito de ICMS de CT-e importados",
  "ICMS-ST calculado no ingresso",
  "Economia vs. Apuração Normal",
  "Análise Fiscal",
];

function fail(message) {
  throw new Error(`Publicação inválida: ${message}`);
}

if (manifest.schemaVersion !== 1 || manifest.application !== "portal-cliente") {
  fail("manifesto ausente ou incompatível");
}
if (manifest.sourceRepository !== REQUIRED_REPOSITORY) {
  fail(`fonte não canônica: ${manifest.sourceRepository ?? "não informada"}`);
}
if (!/^[0-9a-f]{40}$/.test(manifest.sourceCommit ?? "")) {
  fail("commit de origem inválido");
}
if (manifest.dirty !== false) {
  fail("o bundle foi gerado a partir de uma árvore com alterações não commitadas");
}
if (manifest.supabaseProjectRef !== REQUIRED_SUPABASE_REF) {
  fail(`backend diferente do consolidado: ${manifest.supabaseProjectRef ?? "não informado"}`);
}

const indexAssets = [...index.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css))["']/g)]
  .map((match) => match[1])
  .filter((assetPath) => assetPath.startsWith("/portal/"))
  .map((assetPath) => assetPath.slice("/portal/".length));

for (const assetPath of indexAssets) {
  const content = readFileSync(resolve(portalDir, assetPath));
  const actualHash = `sha256:${createHash("sha256").update(content).digest("hex")}`;
  if (manifest.assets?.[assetPath] !== actualHash) {
    fail(`hash divergente para ${assetPath}`);
  }
}

const javascript = indexAssets
  .filter((assetPath) => assetPath.endsWith(".js"))
  .map((assetPath) => readFileSync(resolve(portalDir, assetPath), "utf8"))
  .join("\n");

if (!javascript.includes(REQUIRED_SUPABASE_REF)) {
  fail("o bundle não aponta para o backend consolidado");
}
for (const legacyRef of FORBIDDEN_SUPABASE_REFS) {
  if (javascript.includes(legacyRef)) fail(`backend legado encontrado: ${legacyRef}`);
}
for (const marker of REQUIRED_MARKERS) {
  if (!javascript.includes(marker)) fail(`funcionalidade crítica ausente: ${marker}`);
}

console.log(
  `Portal validado: ${manifest.sourceCommit.slice(0, 12)} · ${REQUIRED_SUPABASE_REF}`,
);
