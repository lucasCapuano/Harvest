const lines = [
  "Fiche Client",
  "Civilit\u00e9 : Monsieur",
  "Nom : Dupont",
  "Pr\u00e9nom : Jean-Pierre",
  "Date de naissance : 15/03/1975",
  "Profession (CSP) : Salari\u00e9 cadre",
  "Profession (libell\u00e9) : Directeur commercial",
  "T\u00e9l\u00e9phone : 06 12 34 56 78",
  "E-mail : jp.dupont@email.com",
  "Situation familiale : Mari\u00e9",
  "Conjoint",
  "Civilit\u00e9 : Madame",
  "Nom : Dupont",
  "Pr\u00e9nom : Marie",
  "Date de naissance : 22/07/1978",
  "Profession (CSP) : Profession lib\u00e9rale",
  "Enfants",
  "Pierre \u2013 12/03/2010",
  "Sophie \u2013 15/09/2012",
  "R\u00e9sidence principale",
  "R\u00e9sidence principale - Maison Neuilly : 850 000 \u20ac",
  "Revenus d\u2019activit\u00e9",
  "Salaire JP Dupont : 78 000 \u20ac",
  "BNC Cabinet Marie Dupont : 95 000 \u20ac",
  "Charges",
  "Imp\u00f4t sur le revenu : 25 000 \u20ac",
  "Taxe fonci\u00e8re : 3 500 \u20ac",
];

function norm(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/['\u2019`]/g, "'").replace(/\s+/g, " ").trim();
}

function buildPairs(ls) {
  const pairs = [];
  for (let i = 0; i < ls.length; i++) {
    const line = ls[i];
    const cm = line.match(/^(.{2,60}?)\s*:\s*(.+)$/);
    if (cm) {
      const key = norm(cm[1]);
      const val = cm[2].trim();
      if (key.length > 1 && val.length > 0) pairs.push({ key, val, line: i });
    }
    if (!line.includes(":") && !line.includes("\t") && line.length < 60 && i + 1 < ls.length) {
      const next = ls[i + 1].trim();
      if (next.length > 0 && next.length < 200) pairs.push({ key: norm(line), val: next, line: i });
    }
  }
  return pairs;
}

function findFirst(pairs, aliases) {
  const na = aliases.map(norm);
  for (const a of na) { for (const p of pairs) { if (p.key === a) return p.val; } }
  for (const a of na) { for (const p of pairs) { if (p.key.includes(a) || a.includes(p.key)) return p.val; } }
  return null;
}

const pidx = lines.findIndex(l => { const n = norm(l); return n.includes("conjoint") || n.includes("partenaire"); });
console.log("Partner index:", pidx, "=>", lines[pidx]);

const clientLines = lines.slice(0, pidx >= 0 ? pidx : lines.length);
const clientPairs = buildPairs(clientLines);

console.log("\n=== CLIENT pairs ===");
clientPairs.forEach(p => console.log("  [" + p.line + '] "' + p.key + '" => "' + p.val + '"'));

console.log("\n=== CLIENT lookups ===");
console.log("nom:", findFirst(clientPairs, ["nom", "nom de famille"]));
console.log("prenom:", findFirst(clientPairs, ["prenom"]));
console.log("civilite:", findFirst(clientPairs, ["civilite"]));
console.log("dob:", findFirst(clientPairs, ["date de naissance"]));
console.log("csp:", findFirst(clientPairs, ["profession (csp)"]));
console.log("prof:", findFirst(clientPairs, ["profession (libelle)"]));
console.log("tel:", findFirst(clientPairs, ["telephone"]));
console.log("email:", findFirst(clientPairs, ["email", "e-mail"]));

const partnerLines = pidx >= 0 ? lines.slice(pidx, pidx + 20) : [];
const partnerPairs = buildPairs(partnerLines);
console.log("\n=== PARTNER pairs ===");
partnerPairs.forEach(p => console.log("  [" + p.line + '] "' + p.key + '" => "' + p.val + '"'));

console.log("\n=== PARTNER lookups ===");
console.log("nom:", findFirst(partnerPairs, ["nom"]));
console.log("prenom:", findFirst(partnerPairs, ["prenom"]));
console.log("civilite:", findFirst(partnerPairs, ["civilite"]));
console.log("dob:", findFirst(partnerPairs, ["date de naissance"]));
console.log("csp:", findFirst(partnerPairs, ["profession (csp)"]));
