export type Civilite = "Monsieur" | "Madame" | "Mademoiselle" | "";

export interface PersonInfo {
  civilite: Civilite;
  nom: string;
  prenom: string;
  dateNaissance: string;
  professionCSP: string;
  professionLibelle: string;
}

export interface SituationPersonnelle extends PersonInfo {
  telephone: string;
  email: string;
}

export interface CompositionFamiliale {
  situationFamiliale: string;
  partenaire: PersonInfo;
}

export interface Enfant {
  id: string;
  prenom: string;
  dateNaissance: string;
  aCharge: boolean;
}

export interface CategoryItem {
  id: string;
  [key: string]: string | undefined;
}

export interface ActifsImmobilier {
  biensUsage: CategoryItem[];
  immobilierRapport: CategoryItem[];
  immobilierDefiscalisant: CategoryItem[];
}

export interface ActifsEpargne {
  disponibilites: CategoryItem[];
  assuranceVie: CategoryItem[];
  epargneRetraite: CategoryItem[];
  produitsDefiscalisation: CategoryItem[];
}

export interface ActifsProfessionnels {
  biensProfessionnels: CategoryItem[];
  placementsFonciers: CategoryItem[];
}

export interface Passifs {
  pretImmobilier: CategoryItem[];
  pretProfessionnel: CategoryItem[];
  autresPrets: CategoryItem[];
}

export interface Revenus {
  revenusActivites: CategoryItem[];
  pensionsRetraites: CategoryItem[];
  revenusMobiliers: CategoryItem[];
  revenusImmobiliers: CategoryItem[];
  autresRevenus: CategoryItem[];
}

export interface Charges {
  chargesGenerales: CategoryItem[];
  chargesDeductibles: CategoryItem[];
}

export type StepId =
  | "situation-personnelle"
  | "composition-familiale"
  | "enfants"
  | "actifs"
  | "passifs"
  | "revenus"
  | "charges";

export type ActifsSubStep =
  | "immobilier"
  | "epargne"
  | "biens-professionnels";

export interface Step {
  id: StepId;
  label: string;
  icon: string;
  completed: boolean;
  subSteps?: { id: ActifsSubStep; label: string; completed: boolean }[];
}
