import { NextRequest, NextResponse } from "next/server";
import { analyzeFeasibility } from "@/lib/calculations";
import { EmploymentType, MortgageInput } from "@/lib/types";

const ALLOWED_EMPLOYMENT_TYPES: EmploymentType[] = [
  "permanent",
  "fixed_term",
  "self_employed",
];

export async function POST(request: NextRequest) {
  const body = await request.json();

  const input: MortgageInput = {
    annualIncome: Number(body.annualIncome),
    monthlyDebts: Number(body.monthlyDebts),
    employmentType: body.employmentType as EmploymentType,
    propertyValue: Number(body.propertyValue),
    downPayment: Number(body.downPayment),
    loanTermYears: Number(body.loanTermYears),
    interestRate: Number(body.interestRate),
  };

  const numericFields = [
    "annualIncome",
    "monthlyDebts",
    "propertyValue",
    "downPayment",
    "loanTermYears",
    "interestRate",
  ] as const;

  for (const field of numericFields) {
    if (isNaN(input[field]) || input[field] < 0) {
      return NextResponse.json(
        { error: `Invalid value for ${field}` },
        { status: 400 }
      );
    }
  }

  if (!ALLOWED_EMPLOYMENT_TYPES.includes(input.employmentType)) {
    return NextResponse.json(
      {
        error: `Invalid employmentType. Expected one of: ${ALLOWED_EMPLOYMENT_TYPES.join(", ")}`,
      },
      { status: 400 }
    );
  }

  if (input.downPayment >= input.propertyValue) {
    return NextResponse.json(
      { error: "Down payment must be less than property value" },
      { status: 400 }
    );
  }

  const result = analyzeFeasibility(input);
  return NextResponse.json(result);
}
