"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useWizard } from "@/lib/wizard-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Radio, Clock, Square, Play, Lightbulb } from "lucide-react";

interface SuggestedQuestion {
  question: string;
  targetField: string;
  category: string;
}

const SUGGESTED_QUESTIONS: Record<string, SuggestedQuestion[]> = {
  "situation-personnelle": [
    { question: "Quelle est votre civilité ?", targetField: "situationPersonnelle.civilite", category: "État civil" },
    { question: "Quel est votre nom de famille ?", targetField: "situationPersonnelle.nom", category: "État civil" },
    { question: "Quel est votre prénom ?", targetField: "situationPersonnelle.prenom", category: "État civil" },
    { question: "Quelle est votre date de naissance ?", targetField: "situationPersonnelle.dateNaissance", category: "État civil" },
    { question: "Quelle est votre catégorie socioprofessionnelle ?", targetField: "situationPersonnelle.professionCSP", category: "Professionnel" },
    { question: "Quel est l'intitulé exact de votre poste ?", targetField: "situationPersonnelle.professionLibelle", category: "Professionnel" },
    { question: "Quel est votre numéro de téléphone ?", targetField: "situationPersonnelle.telephone", category: "Contact" },
    { question: "Quelle est votre adresse e-mail ?", targetField: "situationPersonnelle.email", category: "Contact" },
  ],
  "composition-familiale": [
    { question: "Êtes-vous marié(e), pacsé(e) ou en union libre ?", targetField: "compositionFamiliale.situationFamiliale", category: "Situation" },
    { question: "Quelle est la civilité de votre conjoint(e) ?", targetField: "compositionFamiliale.partenaire.civilite", category: "Conjoint" },
    { question: "Quel est le nom de famille de votre conjoint(e) ?", targetField: "compositionFamiliale.partenaire.nom", category: "Conjoint" },
    { question: "Quel est le prénom de votre conjoint(e) ?", targetField: "compositionFamiliale.partenaire.prenom", category: "Conjoint" },
    { question: "Quelle est la date de naissance de votre conjoint(e) ?", targetField: "compositionFamiliale.partenaire.dateNaissance", category: "Conjoint" },
    { question: "Quelle est la profession de votre conjoint(e) ?", targetField: "compositionFamiliale.partenaire.professionCSP", category: "Conjoint" },
    { question: "Quel est l'intitulé du poste de votre conjoint(e) ?", targetField: "compositionFamiliale.partenaire.professionLibelle", category: "Conjoint" },
  ],
  enfants: [
    { question: "Avez-vous des enfants ?", targetField: "enfants", category: "Enfants" },
    { question: "Quel est le prénom et la date de naissance de chaque enfant ?", targetField: "enfants.details", category: "Enfants" },
    { question: "Sont-ils à votre charge fiscale ?", targetField: "enfants.charge", category: "Enfants" },
  ],
  actifs: [
    { question: "Possédez-vous des biens immobiliers (résidence principale, secondaire) ?", targetField: "actifs.immobilier", category: "Immobilier" },
    { question: "Avez-vous de l'épargne disponible (comptes, livrets) ?", targetField: "actifs.epargne", category: "Épargne" },
    { question: "Détenez-vous des contrats d'assurance-vie ?", targetField: "actifs.assuranceVie", category: "Épargne" },
    { question: "Avez-vous une épargne retraite (PER, PERP, Madelin) ?", targetField: "actifs.retraite", category: "Épargne" },
    { question: "Possédez-vous des biens professionnels ou fonciers ?", targetField: "actifs.pro", category: "Professionnel" },
  ],
  passifs: [
    { question: "Avez-vous des prêts immobiliers en cours ?", targetField: "passifs.immobilier", category: "Emprunts" },
    { question: "Avez-vous des crédits professionnels en cours ?", targetField: "passifs.pro", category: "Emprunts" },
    { question: "Avez-vous d'autres crédits (consommation, automobile) ?", targetField: "passifs.autres", category: "Emprunts" },
  ],
  revenus: [
    { question: "Quel est le montant de vos revenus d'activité annuels ?", targetField: "revenus.activite", category: "Activité" },
    { question: "Percevez-vous des pensions ou retraites ?", targetField: "revenus.pensions", category: "Pensions" },
    { question: "Avez-vous des revenus mobiliers (dividendes, intérêts) ?", targetField: "revenus.mobiliers", category: "Investissements" },
    { question: "Percevez-vous des revenus fonciers ou immobiliers ?", targetField: "revenus.immobiliers", category: "Investissements" },
  ],
  charges: [
    { question: "Quelles sont vos charges courantes mensuelles ?", targetField: "charges.generales", category: "Charges" },
    { question: "Avez-vous des charges déductibles (pension alimentaire, dons) ?", targetField: "charges.deductibles", category: "Déductions" },
  ],
};

interface Message {
  role: "advisor" | "client" | "system";
  text: string;
  field?: string;
  value?: string;
  section?: string;
  confidence?: number;
}

const MEETING_SCRIPT: Message[] = [
  // ── OUVERTURE ──
  { role: "system", text: "Début de l'entretien – Enregistrement démarré" },
  { role: "advisor", text: "Bonjour Monsieur, merci d'avoir pris le temps de venir. Je suis votre conseiller en gestion de patrimoine. Pouvons-nous commencer par votre état civil ?" },

  // ── SITUATION PERSONNELLE ──
  { role: "client", text: "Bonjour ! Bien sûr. Je suis Monsieur Jean Dupuis.", field: "situationPersonnelle.civilite", value: "Monsieur", section: "situationPersonnelle", confidence: 96 },
  { role: "system", text: "IA – Civilité détectée : Monsieur" },
  { role: "client", text: "D-U-P-U-I-S, Jean.", field: "situationPersonnelle.nom", value: "Dupuis", section: "situationPersonnelle", confidence: 97 },
  { role: "system", text: "IA – Nom détecté : Dupuis" },
  { role: "client", text: "Mon prénom c'est Jean.", field: "situationPersonnelle.prenom", value: "Jean", section: "situationPersonnelle", confidence: 98 },
  { role: "system", text: "IA – Prénom détecté : Jean" },
  { role: "advisor", text: "Très bien, Monsieur Dupuis. Quelle est votre date de naissance ?" },
  { role: "client", text: "Je suis né le 12 juin 1972.", field: "situationPersonnelle.dateNaissance", value: "1972-06-12", section: "situationPersonnelle", confidence: 88 },
  { role: "system", text: "IA – Date de naissance : 12/06/1972" },
  { role: "advisor", text: "Et concernant votre activité professionnelle ?" },
  { role: "client", text: "Je suis salarié cadre, directeur financier dans un groupe industriel.", field: "situationPersonnelle.professionCSP", value: "Salarié cadre", section: "situationPersonnelle", confidence: 91 },
  { role: "system", text: "IA – CSP : Salarié cadre" },
  { role: "client", text: "Mon titre exact est Directeur financier.", field: "situationPersonnelle.professionLibelle", value: "Directeur financier", section: "situationPersonnelle", confidence: 94 },
  { role: "system", text: "IA – Profession : Directeur financier" },
  { role: "advisor", text: "Parfait. Vos coordonnées ?" },
  { role: "client", text: "Mon portable c'est le 06 17 45 54 93.", field: "situationPersonnelle.telephone", value: "0617455493", section: "situationPersonnelle", confidence: 78 },
  { role: "system", text: "IA – Téléphone : 0617455493" },
  { role: "client", text: "Et mon e-mail, jean.dupuis@mail.com.", field: "situationPersonnelle.email", value: "jean.dupuis@mail.com", section: "situationPersonnelle", confidence: 85 },
  { role: "system", text: "IA – Email : jean.dupuis@mail.com" },

  // ── COMPOSITION FAMILIALE ──
  { role: "advisor", text: "Parlons de votre situation familiale. Êtes-vous marié ?" },
  { role: "client", text: "Oui, je suis marié.", field: "compositionFamiliale.situationFamiliale", value: "Marié(e)", section: "compositionFamiliale", confidence: 95 },
  { role: "system", text: "IA – Situation familiale : Marié(e)" },
  { role: "advisor", text: "Pouvez-vous me parler de votre épouse ?" },
  { role: "client", text: "Ma femme c'est Madame Claire Dupuis.", field: "compositionFamiliale.partenaire.civilite", value: "Madame", section: "compositionFamiliale", confidence: 93 },
  { role: "system", text: "IA – Civilité partenaire : Madame" },
  { role: "client", text: "Dupuis également, son nom de jeune fille c'est pareil.", field: "compositionFamiliale.partenaire.nom", value: "Dupuis", section: "compositionFamiliale", confidence: 89 },
  { role: "client", text: "Claire, née le 3 septembre 1975.", field: "compositionFamiliale.partenaire.prenom", value: "Claire", section: "compositionFamiliale", confidence: 94 },
  { role: "system", text: "IA – Partenaire : Claire Dupuis" },
  { role: "client", text: "Sa date de naissance c'est le 3 septembre 1975.", field: "compositionFamiliale.partenaire.dateNaissance", value: "1975-09-03", section: "compositionFamiliale", confidence: 82 },
  { role: "advisor", text: "Et la profession de votre épouse ?" },
  { role: "client", text: "Elle est fonctionnaire, professeure des écoles.", field: "compositionFamiliale.partenaire.professionCSP", value: "Fonctionnaire", section: "compositionFamiliale", confidence: 90 },
  { role: "system", text: "IA – CSP partenaire : Fonctionnaire" },
  { role: "client", text: "Professeure des écoles plus exactement.", field: "compositionFamiliale.partenaire.professionLibelle", value: "Professeure des écoles", section: "compositionFamiliale", confidence: 91 },

  // ── ENFANTS ──
  { role: "advisor", text: "Avez-vous des enfants ?" },
  { role: "client", text: "Oui, deux enfants. Lucie née le 15 mars 2005 et Thomas né le 22 novembre 2010. Les deux sont à notre charge.", field: "enfants", value: "2", section: "enfants", confidence: 86 },
  { role: "system", text: "IA – 2 enfants détectés : Lucie (2005) et Thomas (2010)" },

  // ── ACTIFS IMMOBILIER ──
  { role: "advisor", text: "Très bien. Passons à votre patrimoine. Possédez-vous des biens immobiliers ?" },
  { role: "client", text: "Oui, notre résidence principale est une maison familiale à Maisons-Alfort, on l'estime à environ 850 000 euros.", field: "actifsImmobilier.biensUsage", value: "biensUsage", section: "actifsImmobilier", confidence: 84 },
  { role: "system", text: "IA – Résidence principale détectée : 850 000 €" },
  { role: "client", text: "On a aussi un appartement à La Baule, hérité de mes parents. Il vaut environ 320 000 euros.", field: "actifsImmobilier.biensUsage2", value: "biensUsage2", section: "actifsImmobilier", confidence: 80 },
  { role: "system", text: "IA – Résidence secondaire détectée : 320 000 €" },
  { role: "client", text: "Et puis un petit T2 locatif à Lyon, loué en nu, d'une valeur de 250 000 euros.", field: "actifsImmobilier.immobilierRapport", value: "immobilierRapport", section: "actifsImmobilier", confidence: 82 },
  { role: "system", text: "IA – Immobilier de rapport : T2 Lyon, 250 000 €" },

  // ── ACTIFS ÉPARGNE ──
  { role: "advisor", text: "Et concernant votre épargne financière ?" },
  { role: "client", text: "On a chacun un Livret A. Le mien a 15 000 euros, celui de Claire 8 000 euros. J'ai aussi un PEA avec environ 75 000 euros et un compte-titres joint à 40 000 euros.", field: "actifsEpargne.disponibilites", value: "disponibilites", section: "actifsEpargne", confidence: 76 },
  { role: "system", text: "IA – Épargne disponible détectée : 5 comptes, 150 000 € total" },
  { role: "client", text: "Le compte courant principal du foyer tourne autour de 12 000 euros.", field: "actifsEpargne.disponibilites2", value: "disponibilites2", section: "actifsEpargne", confidence: 72 },
  { role: "system", text: "IA – Compte courant : 12 000 €" },
  { role: "advisor", text: "Des contrats d'assurance-vie ou de prévoyance ?" },
  { role: "client", text: "Oui, j'ai un contrat multisupport ouvert en mai 2012, valorisé à 180 000 euros. Et une garantie décès cadre via mon entreprise, capital de 150 000 euros, depuis 2018.", field: "actifsEpargne.assuranceVie", value: "assuranceVie", section: "actifsEpargne", confidence: 79 },
  { role: "system", text: "IA – Assurance vie : 180 000 € / Prévoyance : 150 000 €" },
  { role: "advisor", text: "Et l'épargne retraite ?" },
  { role: "client", text: "J'ai un PER individuel ouvert en novembre 2020, il y a environ 65 000 euros dessus.", field: "actifsEpargne.epargneRetraite", value: "epargneRetraite", section: "actifsEpargne", confidence: 83 },
  { role: "system", text: "IA – PER individuel : 65 000 €" },
  { role: "client", text: "J'avais aussi souscrit un FCPI Innovation France en octobre 2023, environ 10 000 euros.", field: "actifsEpargne.produitsDefiscalisation", value: "produitsDefiscalisation", section: "actifsEpargne", confidence: 77 },
  { role: "system", text: "IA – FCPI : 10 000 €" },

  // ── PASSIFS ──
  { role: "advisor", text: "Avez-vous des emprunts en cours ?" },
  { role: "client", text: "Oui, deux prêts immobiliers. Le crédit de la résidence principale, il reste environ 180 000 euros. Et le crédit pour l'appartement locatif à Lyon, il reste 120 000 euros. Les deux sont des prêts amortissables.", field: "passifs.pretImmobilier", value: "pretImmobilier", section: "passifs", confidence: 81 },
  { role: "system", text: "IA – 2 prêts immobiliers : 180 000 € + 120 000 €" },
  { role: "advisor", text: "Des crédits professionnels ou à la consommation ?" },
  { role: "client", text: "Non, aucun autre crédit.", field: "passifs.aucunAutre", value: "none", section: "passifs", confidence: 95 },

  // ── REVENUS ──
  { role: "advisor", text: "Parlons de vos revenus. Quels sont vos revenus d'activité ?" },
  { role: "client", text: "Mon salaire brut annuel est de 90 000 euros. Ma femme Claire touche 38 000 euros brut annuel.", field: "revenus.revenusActivites", value: "revenusActivites", section: "revenus", confidence: 87 },
  { role: "system", text: "IA – Revenus d'activité : 90 000 € + 38 000 €" },
  { role: "advisor", text: "Des revenus mobiliers ?" },
  { role: "client", text: "Oui, les dividendes du compte-titres joint, environ 1 200 euros par an. Et les produits d'épargne réglementée, environ 350 euros d'intérêts.", field: "revenus.revenusMobiliers", value: "revenusMobiliers", section: "revenus", confidence: 74 },
  { role: "system", text: "IA – Revenus mobiliers : 1 200 € + 350 €" },
  { role: "client", text: "Et le loyer de l'appartement à Lyon rapporte 10 800 euros par an.", field: "revenus.revenusImmobiliers", value: "revenusImmobiliers", section: "revenus", confidence: 86 },
  { role: "system", text: "IA – Revenus immobiliers : 10 800 €/an" },

  // ── CHARGES ──
  { role: "advisor", text: "Pour terminer, quelles sont vos principales charges annuelles ?" },
  { role: "client", text: "L'impôt sur le revenu du foyer c'est environ 14 500 euros. Ensuite les taxes foncières : 2 500 pour la résidence principale, 1 500 pour l'appartement à La Baule, et 1 300 pour le locatif à Lyon.", field: "charges.chargesGenerales", value: "chargesGenerales", section: "charges", confidence: 80 },
  { role: "system", text: "IA – Charges fiscales détectées : IR + 3 taxes foncières" },
  { role: "client", text: "Il y a aussi la taxe d'habitation pour La Baule, 1 800 euros puisque c'est une résidence secondaire.", field: "charges.chargesGenerales2", value: "chargesGenerales2", section: "charges", confidence: 78 },
  { role: "system", text: "IA – Taxe d'habitation résidence secondaire : 1 800 €" },
  { role: "client", text: "Et les charges de copropriété de l'appartement à La Baule, 1 200 euros par an.", field: "charges.chargesDeductibles", value: "chargesDeductibles", section: "charges", confidence: 75 },
  { role: "system", text: "IA – Charges déductibles : 1 200 €" },

  // ── CLÔTURE ──
  { role: "advisor", text: "Parfait, Monsieur Dupuis. J'ai une vue complète de votre situation patrimoniale. Nous allons pouvoir travailler sur des préconisations adaptées." },
  { role: "system", text: "IA – Extraction complète terminée. Dossier Dupuis pré-rempli." },
];

const ENFANTS_DATA = [
  { id: "live-e1", prenom: "Lucie", dateNaissance: "2005-03-15", aCharge: true },
  { id: "live-e2", prenom: "Thomas", dateNaissance: "2010-11-22", aCharge: true },
];

// ── Bulk data for array-based sections ──
const ACTIFS_IMMOBILIER_DATA = {
  biensUsage: [
    { id: "li1", nature: "Résidence principale", libelle: "Maison familiale à Maisons-Alfort", valeur: "850000" },
    { id: "li2", nature: "Résidence secondaire", libelle: "Appartement à La Baule hérité des parents", valeur: "320000" },
  ],
  immobilierRapport: [
    { id: "li3", nature: "Nu", libelle: "Appartement T2 locatif à Lyon", valeur: "250000" },
  ],
  immobilierDefiscalisant: [],
};

const ACTIFS_EPARGNE_DATA = {
  disponibilites: [
    { id: "le1", nature: "Livret A", libelle: "Livret A Jean Dupuis", valeur: "15000" },
    { id: "le2", nature: "Livret A", libelle: "Livret A Claire Dupuis", valeur: "8000" },
    { id: "le3", nature: "PEA", libelle: "PEA Jean Dupuis", valeur: "75000" },
    { id: "le4", nature: "Compte titres", libelle: "Compte-titres joint", valeur: "40000" },
    { id: "le5", nature: "Compte courant", libelle: "Compte courant principal du foyer", valeur: "12000" },
  ],
  assuranceVie: [
    { id: "le6", nature: "Assurance vie", libelle: "Contrat multisupport Jean Dupuis", valeur: "180000", date: "2012-05-10" },
    { id: "le7", nature: "Prévoyance", libelle: "Garantie décès cadre entreprise", valeur: "150000", date: "2018-01-01" },
  ],
  epargneRetraite: [
    { id: "le8", nature: "PER individuel", libelle: "PER individuel Jean Dupuis", valeur: "65000", date: "2020-11-15" },
  ],
  produitsDefiscalisation: [
    { id: "le9", nature: "FCPI", libelle: "FCPI Innovation France", valeur: "10000", date: "2023-10-20" },
  ],
};

const PASSIFS_DATA = {
  pretImmobilier: [
    { id: "lp1", nature: "Prêt amortissable", libelle: "Crédit résidence principale", montant: "180000" },
    { id: "lp2", nature: "Prêt amortissable", libelle: "Crédit appartement locatif Lyon", montant: "120000" },
  ],
  pretProfessionnel: [],
  autresPrets: [],
};

const REVENUS_DATA = {
  revenusActivites: [
    { id: "lr1", nature: "Salaire", libelle: "Salaire annuel brut Jean Dupuis", montant: "90000" },
    { id: "lr2", nature: "Salaire", libelle: "Salaire annuel brut Claire Dupuis", montant: "38000" },
  ],
  pensionsRetraites: [],
  revenusMobiliers: [
    { id: "lr3", nature: "Dividende", libelle: "Revenus du compte-titres joint", montant: "1200" },
    { id: "lr4", nature: "Intérêts", libelle: "Produits d'épargne réglementée", montant: "350" },
  ],
  revenusImmobiliers: [
    { id: "lr5", nature: "Loyer", libelle: "Loyer annuel appartement T2 Lyon", montant: "10800" },
  ],
  autresRevenus: [],
};

const CHARGES_DATA = {
  chargesGenerales: [
    { id: "lc1", nature: "Impôt sur le revenu", libelle: "Impôt annuel du foyer", montant: "14500" },
    { id: "lc2", nature: "Taxe foncière", libelle: "Taxe foncière résidence principale", montant: "2500" },
    { id: "lc3", nature: "Taxe foncière", libelle: "Taxe foncière appartement à La Baule", montant: "1500" },
    { id: "lc4", nature: "Taxe foncière", libelle: "Taxe foncière appartement locatif Lyon", montant: "1300" },
    { id: "lc5", nature: "Taxe d'habitation", libelle: "Taxe d'habitation résidence secondaire La Baule", montant: "1800" },
  ],
  chargesDeductibles: [
    { id: "lc6", nature: "Autre", libelle: "Charges de copropriété appartement La Baule", montant: "1200" },
  ],
};

export function LiveMeetingPanel() {
  const { liveMode, updateFormData, formData, addConfidenceScore, currentStep } = useWizard();
  const [messages, setMessages] = useState<Message[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [answeredFields, setAnsweredFields] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const formDataRef = useRef(formData);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scriptIdxRef = useRef(0);

  const stopRecording = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    intervalRef.current = null;
    timerRef.current = null;
    setIsRecording(false);
    setMessages((prev) => [
      ...prev,
      { role: "system", text: "Enregistrement en pause" },
    ]);
  }, []);

  const resumeRecording = useCallback(() => {
    if (scriptIdxRef.current >= MEETING_SCRIPT.length) return;
    setIsRecording(true);
    setMessages((prev) => [
      ...prev,
      { role: "system", text: "Enregistrement repris" },
    ]);

    intervalRef.current = setInterval(() => {
      if (scriptIdxRef.current >= MEETING_SCRIPT.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
        return;
      }
      const msg = MEETING_SCRIPT[scriptIdxRef.current];
      setMessages((prev) => [...prev, msg]);
      scriptIdxRef.current++;
    }, 2200);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!liveMode || startedRef.current) return;
    startedRef.current = true;
    setIsRecording(true);

    intervalRef.current = setInterval(() => {
      if (scriptIdxRef.current >= MEETING_SCRIPT.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
        return;
      }
      const msg = MEETING_SCRIPT[scriptIdxRef.current];
      setMessages((prev) => [...prev, msg]);
      scriptIdxRef.current++;
    }, 2200);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [liveMode]);

  // Apply field values when messages with fields appear
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg.field || !lastMsg.value) return;

    const field = lastMsg.field;

    if (lastMsg.confidence) {
      addConfidenceScore(field, lastMsg.confidence);
    }

    setAnsweredFields((prev) => new Set(prev).add(field));

    if (field === "enfants") {
      updateFormData("enfants", ENFANTS_DATA);
      return;
    }

    // ── Actifs Immobilier ──
    if (field === "actifsImmobilier.biensUsage") {
      updateFormData("actifsImmobilier", { ...formDataRef.current.actifsImmobilier, biensUsage: [ACTIFS_IMMOBILIER_DATA.biensUsage[0]] });
      return;
    }
    if (field === "actifsImmobilier.biensUsage2") {
      updateFormData("actifsImmobilier", { ...formDataRef.current.actifsImmobilier, biensUsage: ACTIFS_IMMOBILIER_DATA.biensUsage });
      return;
    }
    if (field === "actifsImmobilier.immobilierRapport") {
      updateFormData("actifsImmobilier", { ...formDataRef.current.actifsImmobilier, immobilierRapport: ACTIFS_IMMOBILIER_DATA.immobilierRapport });
      return;
    }

    // ── Actifs Épargne ──
    if (field === "actifsEpargne.disponibilites") {
      updateFormData("actifsEpargne", { ...formDataRef.current.actifsEpargne, disponibilites: ACTIFS_EPARGNE_DATA.disponibilites.slice(0, 4) });
      return;
    }
    if (field === "actifsEpargne.disponibilites2") {
      updateFormData("actifsEpargne", { ...formDataRef.current.actifsEpargne, disponibilites: ACTIFS_EPARGNE_DATA.disponibilites });
      return;
    }
    if (field === "actifsEpargne.assuranceVie") {
      updateFormData("actifsEpargne", { ...formDataRef.current.actifsEpargne, assuranceVie: ACTIFS_EPARGNE_DATA.assuranceVie });
      return;
    }
    if (field === "actifsEpargne.epargneRetraite") {
      updateFormData("actifsEpargne", { ...formDataRef.current.actifsEpargne, epargneRetraite: ACTIFS_EPARGNE_DATA.epargneRetraite });
      return;
    }
    if (field === "actifsEpargne.produitsDefiscalisation") {
      updateFormData("actifsEpargne", { ...formDataRef.current.actifsEpargne, produitsDefiscalisation: ACTIFS_EPARGNE_DATA.produitsDefiscalisation });
      return;
    }

    // ── Passifs ──
    if (field === "passifs.pretImmobilier") {
      updateFormData("passifs", { ...formDataRef.current.passifs, pretImmobilier: PASSIFS_DATA.pretImmobilier });
      return;
    }

    // ── Revenus ──
    if (field === "revenus.revenusActivites") {
      updateFormData("revenus", { ...formDataRef.current.revenus, revenusActivites: REVENUS_DATA.revenusActivites });
      return;
    }
    if (field === "revenus.revenusMobiliers") {
      updateFormData("revenus", { ...formDataRef.current.revenus, revenusMobiliers: REVENUS_DATA.revenusMobiliers });
      return;
    }
    if (field === "revenus.revenusImmobiliers") {
      updateFormData("revenus", { ...formDataRef.current.revenus, revenusImmobiliers: REVENUS_DATA.revenusImmobiliers });
      return;
    }

    // ── Charges ──
    if (field === "charges.chargesGenerales") {
      updateFormData("charges", { ...formDataRef.current.charges, chargesGenerales: CHARGES_DATA.chargesGenerales.slice(0, 4) });
      return;
    }
    if (field === "charges.chargesGenerales2") {
      updateFormData("charges", { ...formDataRef.current.charges, chargesGenerales: CHARGES_DATA.chargesGenerales });
      return;
    }
    if (field === "charges.chargesDeductibles") {
      updateFormData("charges", { ...formDataRef.current.charges, chargesDeductibles: CHARGES_DATA.chargesDeductibles });
      return;
    }

    const current = formDataRef.current;

    if (field.startsWith("compositionFamiliale.partenaire.")) {
      const subField = field.replace("compositionFamiliale.partenaire.", "");
      updateFormData("compositionFamiliale", {
        ...current.compositionFamiliale,
        partenaire: { ...current.compositionFamiliale.partenaire, [subField]: lastMsg.value },
      });
      return;
    }

    if (field.startsWith("compositionFamiliale.")) {
      const subField = field.replace("compositionFamiliale.", "");
      updateFormData("compositionFamiliale", {
        ...current.compositionFamiliale,
        [subField]: lastMsg.value,
      });
      return;
    }

    if (field.startsWith("situationPersonnelle.")) {
      const subField = field.replace("situationPersonnelle.", "");
      updateFormData("situationPersonnelle", {
        ...current.situationPersonnelle,
        [subField]: lastMsg.value,
      });
    }
  }, [messages.length]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!liveMode) return null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // Compute suggested questions for current step
  const stepKey = currentStep === "actifs" ? "actifs" : currentStep;
  const allQuestions = SUGGESTED_QUESTIONS[stepKey] || [];
  const pendingQuestions = allQuestions.filter((q) => !answeredFields.has(q.targetField));

  return (
    <div className="flex w-96 shrink-0 flex-col border-l bg-card">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <div className={`size-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-muted-foreground"}`} />
          <span className="text-sm font-medium">En cours</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {formatTime(elapsed)}
          </div>
          {isRecording && (
            <>
              <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
                <Radio className="size-3" />
                REC
              </div>
              <button
                onClick={stopRecording}
                className="flex items-center gap-1.5 rounded-md bg-red-500 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600"
              >
                <Square className="size-3" />
                Arrêter
              </button>
            </>
          )}
          {!isRecording && scriptIdxRef.current < MEETING_SCRIPT.length && (
            <button
              onClick={resumeRecording}
              className="flex items-center gap-1.5 rounded-md bg-[#0052CC] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-[#0052CC]/90"
            >
              <Play className="size-3" />
              Reprendre
            </button>
          )}
        </div>
      </div>

      {/* Transcript section */}
      <div className="h-1/2 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="space-y-3 p-4 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "system" ? "justify-center" : ""}`}>
                {msg.role === "system" ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-500/20 px-3 py-1 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                    <Mic className="size-3" />
                    {msg.text}
                  </div>
                ) : (
                  <>
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                      {msg.role === "advisor" ? "CG" : "CL"}
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-medium text-muted-foreground mb-0.5">
                        {msg.role === "advisor" ? "Conseiller" : "Client"}
                      </p>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
            {isRecording && messages.length > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs">Écoute en cours…</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Suggested questions section */}
      <div className="h-1/2 min-h-0 flex flex-col border-t">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50">
          <Lightbulb className="size-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Questions suggérées</span>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1.5">
            {pendingQuestions.length > 0 ? (
              pendingQuestions.map((q, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border/50 bg-background px-3 py-2 transition-colors hover:bg-muted/50"
                >
                  <p className="text-xs leading-relaxed text-foreground">{q.question}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{q.category}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="size-8 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                  <svg className="size-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs text-muted-foreground">Toutes les informations de cette étape ont été collectées</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
