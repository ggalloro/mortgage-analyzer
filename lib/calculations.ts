import {
  MortgageInput,
  CriterionResult,
  EmploymentType,
  FeasibilityResult,
} from "./types";

const STRESS_TEST_RATE_DELTA = 3;

export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;

  if (monthlyRate === 0) {
    return principal / numPayments;
  }

  return (
    (principal *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

function evaluateDTI(
  monthlyDebts: number,
  monthlyPayment: number,
  monthlyIncome: number
): CriterionResult {
  const ratio = (monthlyDebts + monthlyPayment) / monthlyIncome;

  let status: CriterionResult["status"];
  let message: string;

  if (ratio <= 0.35) {
    status = "pass";
    message = "Comfortable. Your debt-to-income ratio is within the European norm.";
  } else if (ratio <= 0.4) {
    status = "warning";
    message =
      "Acceptable, but close to the 40% maximum most European banks apply.";
  } else {
    status = "fail";
    message =
      "Your debt-to-income ratio exceeds the 40% threshold most European banks apply. Consider lowering existing debts or increasing the down payment.";
  }

  return {
    name: "Debt-to-Income Ratio (DTI)",
    value: ratio,
    displayValue: `${(ratio * 100).toFixed(1)}%`,
    status,
    message,
  };
}

function evaluateLTV(
  loanAmount: number,
  propertyValue: number
): CriterionResult {
  const ratio = loanAmount / propertyValue;

  let status: CriterionResult["status"];
  let message: string;

  if (ratio <= 0.8) {
    status = "pass";
    message =
      "Standard LTV. Most banks lend on these terms at their best rates.";
  } else if (ratio <= 0.9) {
    status = "warning";
    message =
      "Above 80%. Expect a higher rate or stricter conditions from the bank.";
  } else {
    status = "fail";
    message =
      "LTV above 90% typically requires a larger down payment to qualify.";
  }

  return {
    name: "Loan-to-Value Ratio (LTV)",
    value: ratio,
    displayValue: `${(ratio * 100).toFixed(1)}%`,
    status,
    message,
  };
}

function evaluateEmploymentType(employmentType: EmploymentType): CriterionResult {
  let status: CriterionResult["status"];
  let message: string;
  let displayValue: string;

  switch (employmentType) {
    case "permanent":
      status = "pass";
      displayValue = "Permanent";
      message = "Permanent contract. Standard underwriting applies.";
      break;
    case "fixed_term":
      status = "warning";
      displayValue = "Fixed-term";
      message =
        "Fixed-term contract. Banks may require a guarantor or additional collateral.";
      break;
    case "self_employed":
      status = "warning";
      displayValue = "Self-employed";
      message =
        "Self-employed. Expect to provide 2–3 years of tax returns and recent financial statements.";
      break;
  }

  return {
    name: "Employment Contract",
    value: 0,
    displayValue,
    status,
    message,
  };
}

function evaluateStressTest(
  monthlyDebts: number,
  loanAmount: number,
  years: number,
  interestRate: number,
  monthlyIncome: number
): CriterionResult {
  const stressedPayment = calculateMonthlyPayment(
    loanAmount,
    interestRate + STRESS_TEST_RATE_DELTA,
    years
  );
  const stressedRatio = (monthlyDebts + stressedPayment) / monthlyIncome;

  let status: CriterionResult["status"];
  let message: string;

  if (stressedRatio <= 0.4) {
    status = "pass";
    message = `Affordability holds at +${STRESS_TEST_RATE_DELTA}% rate stress.`;
  } else if (stressedRatio <= 0.45) {
    status = "warning";
    message = `Marginal under +${STRESS_TEST_RATE_DELTA}% rate stress. Consider a fixed-rate product.`;
  } else {
    status = "fail";
    message = `Affordability breaks under +${STRESS_TEST_RATE_DELTA}% rate stress. A higher down payment or longer term would help.`;
  }

  return {
    name: "Rate Stress Test (+3%)",
    value: stressedRatio,
    displayValue: `${(stressedRatio * 100).toFixed(1)}%`,
    status,
    message,
  };
}

export function analyzeFeasibility(input: MortgageInput): FeasibilityResult {
  const loanAmount = input.propertyValue - input.downPayment;
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    input.interestRate,
    input.loanTermYears
  );
  const monthlyIncome = input.annualIncome / 12;
  const totalPayments = input.loanTermYears * 12;
  const totalCost = monthlyPayment * totalPayments;
  const totalInterest = totalCost - loanAmount;

  const dti = evaluateDTI(input.monthlyDebts, monthlyPayment, monthlyIncome);
  const ltv = evaluateLTV(loanAmount, input.propertyValue);
  const employment = evaluateEmploymentType(input.employmentType);
  const stress = evaluateStressTest(
    input.monthlyDebts,
    loanAmount,
    input.loanTermYears,
    input.interestRate,
    monthlyIncome
  );

  const criteria = [dti, ltv, employment, stress];
  const notes: string[] = [];

  const hasFailure = criteria.some((c) => c.status === "fail");
  const hasWarning = criteria.some((c) => c.status === "warning");

  let status: FeasibilityResult["status"];
  let statusMessage: string;

  if (hasFailure) {
    status = "denied";
    statusMessage =
      "Based on the information provided, this mortgage application does not meet the minimum requirements.";
  } else if (hasWarning) {
    status = "conditionally_approved";
    statusMessage =
      "This mortgage application may be approved with conditions. Review the flagged criteria below.";
  } else {
    status = "approved";
    statusMessage =
      "Based on the information provided, this mortgage application meets all standard criteria.";
  }

  if (input.downPayment < input.propertyValue * 0.2) {
    const targetDown = Math.round(input.propertyValue * 0.2);
    notes.push(
      `A down payment of €${targetDown.toLocaleString("it-IT")} (20%) typically unlocks the bank's best rates.`
    );
  }

  return {
    status,
    statusMessage,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    loanAmount,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    criteria,
    notes,
  };
}
