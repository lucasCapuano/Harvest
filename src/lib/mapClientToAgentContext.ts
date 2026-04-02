export type ClientPageData = {
  netWorth?: number | string | null;
  totalAssets?: number | string | null;
  totalLiabilities?: number | string | null;
  annualIncome?: number | string | null;
  realEstateAssets?: number | string | null;
  cash?: number | string | null;
  lifeInsurance?: number | string | null;
  retirementSavings?: number | string | null;
  occupation?: string | null;
  employmentStatus?: string | null;
  maritalStatus?: string | null;
  childrenCount?: number | null;
  wealthScore?: number | null;
};

export type AgentDynamicVariables = {
  net_worth: string;
  total_assets: string;
  total_liabilities: string;
  annual_income: string;
  real_estate_assets: string;
  cash: string;
  life_insurance: string;
  retirement_savings: string;
  occupation: string;
  employment_status: string;
  marital_status: string;
  children_count: string;
  wealth_score: string;
};

function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "Unknown";
  if (typeof value === "string") return value;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatText(value: string | null | undefined): string {
  if (!value || value.trim() === "") return "Unknown";
  return value;
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "Unknown";
  return String(value);
}

export function mapClientToAgentContext(
  client: ClientPageData,
): AgentDynamicVariables {
  return {
    net_worth: formatCurrency(client.netWorth),
    total_assets: formatCurrency(client.totalAssets),
    total_liabilities: formatCurrency(client.totalLiabilities),
    annual_income: formatCurrency(client.annualIncome),
    real_estate_assets: formatCurrency(client.realEstateAssets),
    cash: formatCurrency(client.cash),
    life_insurance: formatCurrency(client.lifeInsurance),
    retirement_savings: formatCurrency(client.retirementSavings),
    occupation: formatText(client.occupation),
    employment_status: formatText(client.employmentStatus),
    marital_status: formatText(client.maritalStatus),
    children_count: formatNumber(client.childrenCount),
    wealth_score: formatNumber(client.wealthScore),
  };
}
