export type EmploymentType = "permanent" | "fixed_term" | "self_employed";

export interface MortgageInput {
  annualIncome: number;
  monthlyDebts: number;
  employmentType: EmploymentType;
  propertyValue: number;
  downPayment: number;
  loanTermYears: number;
  interestRate: number;
}

export interface CriterionResult {
  name: string;
  value: number;
  displayValue: string;
  status: "pass" | "warning" | "fail";
  message: string;
}

export interface FeasibilityResult {
  status: "approved" | "conditionally_approved" | "denied";
  statusMessage: string;
  monthlyPayment: number;
  loanAmount: number;
  totalInterest: number;
  totalCost: number;
  criteria: CriterionResult[];
  notes: string[];
}
