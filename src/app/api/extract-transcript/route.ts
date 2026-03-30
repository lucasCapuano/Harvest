import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import OpenAI from "openai";

// ── Schema helpers ─────────────────────────────────────────────────────────

function personSchema() {
  return {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      civilite: {
        type: ["string", "null"] as const,
        enum: ["Monsieur", "Madame", "Mademoiselle", null],
      },
      nom: { type: ["string", "null"] as const },
      prenom: { type: ["string", "null"] as const },
      dateNaissance: { type: ["string", "null"] as const },
      professionCSP: {
        type: ["string", "null"] as const,
        enum: [
          "Salarié Article 36", "Salarié cadre", "Salarié non cadre",
          "Fonctionnaire", "Profession libérale", "Commerçant / Artisan",
          "Agriculteur", "Retraité", "Sans activité", null,
        ],
      },
      professionLibelle: { type: ["string", "null"] as const },
      telephone: { type: ["string", "null"] as const },
      email: { type: ["string", "null"] as const },
    },
    required: [
      "civilite", "nom", "prenom", "dateNaissance",
      "professionCSP", "professionLibelle", "telephone", "email",
    ],
  };
}

function childSchema() {
  return {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      prenom: { type: ["string", "null"] as const },
      dateNaissance: { type: ["string", "null"] as const },
    },
    required: ["prenom", "dateNaissance"],
  };
}

function assetSchema() {
  return {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      nature: { type: ["string", "null"] as const },
      libelle: { type: ["string", "null"] as const },
      valeurEstimee: { type: ["number", "null"] as const },
      valeurAcquisition: { type: ["number", "null"] as const },
      dateAcquisition: { type: ["string", "null"] as const },
      capitauxDeces: { type: ["number", "null"] as const },
      dateSouscription: { type: ["string", "null"] as const },
    },
    required: [
      "nature", "libelle", "valeurEstimee", "valeurAcquisition",
      "dateAcquisition", "capitauxDeces", "dateSouscription",
    ],
  };
}

function liabilitySchema() {
  return {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      nature: { type: ["string", "null"] as const },
      libelle: { type: ["string", "null"] as const },
      capitalRestantDu: { type: ["number", "null"] as const },
    },
    required: ["nature", "libelle", "capitalRestantDu"],
  };
}

function incomeSchema() {
  return {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      nature: { type: ["string", "null"] as const },
      libelle: { type: ["string", "null"] as const },
      montantAnnuel: { type: ["number", "null"] as const },
    },
    required: ["nature", "libelle", "montantAnnuel"],
  };
}

function chargeSchema() {
  return {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      nature: { type: ["string", "null"] as const },
      libelle: { type: ["string", "null"] as const },
      montantAnnuel: { type: ["number", "null"] as const },
    },
    required: ["nature", "libelle", "montantAnnuel"],
  };
}

const extractionSchema = {
  name: "client_form_extraction",
  strict: true,
  schema: {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      situationPersonnelle: {
        type: "object" as const,
        additionalProperties: false,
        properties: { client: personSchema() },
        required: ["client"],
      },
      compositionFamiliale: {
        type: "object" as const,
        additionalProperties: false,
        properties: {
          situationFamiliale: {
            type: ["string", "null"] as const,
            enum: ["Célibataire", "Marié(e)", "Pacsé(e)", "Divorcé(e)", "Veuf(ve)", "Concubinage", null],
          },
          partenaire: personSchema(),
        },
        required: ["situationFamiliale", "partenaire"],
      },
      enfants: { type: "array" as const, items: childSchema() },
      actifs: {
        type: "object" as const,
        additionalProperties: false,
        properties: {
          immobilierEtAutresBiensUsage: { type: "array" as const, items: assetSchema() },
          immobilierRapport: { type: "array" as const, items: assetSchema() },
          immobilierDefiscalisant: { type: "array" as const, items: assetSchema() },
          disponibilitesEtValeursMobilieres: { type: "array" as const, items: assetSchema() },
          assuranceVieEtPrevoyance: { type: "array" as const, items: assetSchema() },
          epargneRetraite: { type: "array" as const, items: assetSchema() },
          produitsDefiscalisation: { type: "array" as const, items: assetSchema() },
          biensProfessionnels: { type: "array" as const, items: assetSchema() },
          placementsFonciersEtDivers: { type: "array" as const, items: assetSchema() },
        },
        required: [
          "immobilierEtAutresBiensUsage", "immobilierRapport", "immobilierDefiscalisant",
          "disponibilitesEtValeursMobilieres", "assuranceVieEtPrevoyance", "epargneRetraite",
          "produitsDefiscalisation", "biensProfessionnels", "placementsFonciersEtDivers",
        ],
      },
      passifs: {
        type: "object" as const,
        additionalProperties: false,
        properties: {
          pretImmobilier: { type: "array" as const, items: liabilitySchema() },
          pretProfessionnel: { type: "array" as const, items: liabilitySchema() },
          autresPrets: { type: "array" as const, items: liabilitySchema() },
        },
        required: ["pretImmobilier", "pretProfessionnel", "autresPrets"],
      },
      revenus: {
        type: "object" as const,
        additionalProperties: false,
        properties: {
          revenusActivites: { type: "array" as const, items: incomeSchema() },
          pensionsRetraitesEtRentes: { type: "array" as const, items: incomeSchema() },
          revenusMobilers: { type: "array" as const, items: incomeSchema() },
          revenusImmobiliers: { type: "array" as const, items: incomeSchema() },
          autresRevenus: { type: "array" as const, items: incomeSchema() },
        },
        required: [
          "revenusActivites", "pensionsRetraitesEtRentes", "revenusMobilers",
          "revenusImmobiliers", "autresRevenus",
        ],
      },
      charges: {
        type: "object" as const,
        additionalProperties: false,
        properties: {
          chargesGeneralesEtFiscales: { type: "array" as const, items: chargeSchema() },
          chargesDeductibles: { type: "array" as const, items: chargeSchema() },
        },
        required: ["chargesGeneralesEtFiscales", "chargesDeductibles"],
      },
      extractionMeta: {
        type: "object" as const,
        additionalProperties: false,
        properties: {
          transcriptLanguage: { type: ["string", "null"] as const },
          summary: { type: "string" as const },
          missingFields: { type: "array" as const, items: { type: "string" as const } },
          assumptions: { type: "array" as const, items: { type: "string" as const } },
        },
        required: ["transcriptLanguage", "summary", "missingFields", "assumptions"],
      },
    },
    required: [
      "situationPersonnelle", "compositionFamiliale", "enfants",
      "actifs", "passifs", "revenus", "charges", "extractionMeta",
    ],
  },
};

// ── Text normalization ─────────────────────────────────────────────────────

function normalizeTranscript(input: string): string {
  return input
    .replace(/\u2019/g, "'")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY non configurée" },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Extract text
    let text = "";
    if (file.name.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      text = normalizeTranscript(result.value);
    } else if (file.name.endsWith(".txt")) {
      text = normalizeTranscript(await file.text());
    } else {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez .docx ou .txt" },
        { status: 400 },
      );
    }

    if (text.length < 20) {
      return NextResponse.json(
        { error: "Le fichier semble vide ou trop court" },
        { status: 400 },
      );
    }

    // Call OpenAI
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: extractionSchema,
      },
      messages: [
        {
          role: "developer",
          content: [
            "You extract wealth-management client intake data from meeting transcripts.",
            "Return only facts explicitly stated in the transcript.",
            "Never invent values.",
            "When a value is missing or ambiguous, return null.",
            "Classify items into the closest matching form section.",
            "Normalize all dates to DD/MM/YYYY.",
            "Normalize all money amounts to numbers without currency symbols or spaces.",
            "If the transcript mentions monthly amounts and annual value is needed, multiply by 12 and list that conversion in assumptions.",
            "If there is no partner, return an empty partner object with null fields.",
            "Do not merge two different people into one person.",
            "",
            "CRITICAL — the 'nature' field in each category MUST use one of these exact values (or null if unclear):",
            "",
            "actifs.immobilierEtAutresBiensUsage → nature: 'Résidence principale' | 'Résidence secondaire' | 'Autre bien d\'usage'",
            "actifs.immobilierRapport → nature: 'Nu' | 'Meublé' | 'Parts de SCI' | 'Parts de SCPI'",
            "actifs.immobilierDefiscalisant → nature: 'Pinel' | 'Denormandie' | 'Malraux' | 'Monuments historiques'",
            "actifs.disponibilitesEtValeursMobilieres → nature: 'Compte courant' | 'Livret A' | 'PEL' | 'Compte titres' | 'PEA'",
            "actifs.assuranceVieEtPrevoyance → nature: 'Assurance vie' | 'Contrat de capitalisation' | 'Prévoyance'",
            "actifs.epargneRetraite → nature: 'PER individuel' | 'PER entreprise' | 'Madelin' | 'PERP'",
            "actifs.produitsDefiscalisation → nature: 'FIP' | 'FCPI' | 'SOFICA' | 'Girardin'",
            "actifs.biensProfessionnels → nature: 'Fonds de commerce' | 'Parts sociales' | 'Brevet / Licence' | 'Matériel'",
            "actifs.placementsFonciersEtDivers → nature: 'Forêt' | 'GFV' | 'GFA' | 'Autres'",
            "passifs (all) → nature: 'Prêt amortissable' | 'Prêt in fine' | 'Crédit-bail'",
            "revenus.revenusActivites → nature: 'Salaire' | 'BIC' | 'BNC' | 'BA'",
            "revenus.pensionsRetraitesEtRentes → nature: 'Pension' | 'Rente'",
            "revenus.revenusMobilers → nature: 'Dividende' | 'Intérêts'",
            "revenus.revenusImmobiliers → nature: 'Loyer'",
            "revenus.autresRevenus → nature: 'Autres'",
            "charges.chargesGeneralesEtFiscales → nature: 'Impôt sur le revenu' | 'Taxe foncière' | 'Taxe d\'habitation'",
            "charges.chargesDeductibles → nature: 'Pension alimentaire' | 'Autre'",
          ].join("\n"),
        },
        {
          role: "user",
          content: "Extract the client form data from this transcript:\n\n" + text,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ error: "Réponse vide du modèle" }, { status: 502 });
    }

    const payload = JSON.parse(raw);
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[extract-transcript] Error:", err);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
