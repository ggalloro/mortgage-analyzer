"use client";

import { useState } from "react";
import { FeasibilityResult } from "@/lib/types";

const statusStyles = {
  approved: {
    bg: "bg-green-50",
    border: "border-green-400",
    text: "text-green-800",
    badge: "bg-green-100 text-green-800",
    label: "Approved",
  },
  conditionally_approved: {
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    text: "text-yellow-800",
    badge: "bg-yellow-100 text-yellow-800",
    label: "Conditionally Approved",
  },
  denied: {
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-800",
    badge: "bg-red-100 text-red-800",
    label: "Denied",
  },
};

const criterionStatusStyles = {
  pass: "bg-green-100 text-green-800 border-green-300",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  fail: "bg-red-100 text-red-800 border-red-300",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AnalyzePage() {
  const [result, setResult] = useState<FeasibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const input = {
      annualIncome: Number(formData.get("annualIncome")),
      monthlyDebts: Number(formData.get("monthlyDebts")),
      employmentType: String(formData.get("employmentType")),
      propertyValue: Number(formData.get("propertyValue")),
      downPayment: Number(formData.get("downPayment")),
      loanTermYears: Number(formData.get("loanTermYears")),
      interestRate: Number(formData.get("interestRate")),
    };

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary-900 mb-8">
        Mortgage Feasibility Analysis
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              Your Finances
            </h2>
          </div>

          <div>
            <label htmlFor="annualIncome" className="block text-sm font-medium text-slate-700 mb-1">
              Annual Gross Income (€)
            </label>
            <input
              type="number"
              name="annualIncome"
              id="annualIncome"
              required
              min="0"
              step="1000"
              placeholder="45000"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="monthlyDebts" className="block text-sm font-medium text-slate-700 mb-1">
              Monthly Debt Payments (€)
            </label>
            <input
              type="number"
              name="monthlyDebts"
              id="monthlyDebts"
              required
              min="0"
              step="50"
              placeholder="300"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Car loans, consumer credit, other loan installments, etc.
            </p>
          </div>

          <div>
            <label htmlFor="employmentType" className="block text-sm font-medium text-slate-700 mb-1">
              Employment Contract
            </label>
            <select
              name="employmentType"
              id="employmentType"
              required
              defaultValue="permanent"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="permanent">Permanent</option>
              <option value="fixed_term">Fixed-term</option>
              <option value="self_employed">Self-employed</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Banks weigh contract type when assessing income stability.
            </p>
          </div>

          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">
              Property & Loan Details
            </h2>
          </div>

          <div>
            <label htmlFor="propertyValue" className="block text-sm font-medium text-slate-700 mb-1">
              Property Value (€)
            </label>
            <input
              type="number"
              name="propertyValue"
              id="propertyValue"
              required
              min="0"
              step="5000"
              placeholder="280000"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="downPayment" className="block text-sm font-medium text-slate-700 mb-1">
              Down Payment (€)
            </label>
            <input
              type="number"
              name="downPayment"
              id="downPayment"
              required
              min="0"
              step="1000"
              placeholder="60000"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="loanTermYears" className="block text-sm font-medium text-slate-700 mb-1">
              Loan Term
            </label>
            <select
              name="loanTermYears"
              id="loanTermYears"
              required
              defaultValue="25"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="15">15 years</option>
              <option value="20">20 years</option>
              <option value="25">25 years</option>
              <option value="30">30 years</option>
            </select>
          </div>

          <div>
            <label htmlFor="interestRate" className="block text-sm font-medium text-slate-700 mb-1">
              Interest Rate (%)
            </label>
            <input
              type="number"
              name="interestRate"
              id="interestRate"
              required
              min="0"
              max="20"
              step="0.05"
              placeholder="4.0"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Current typical range: 3.5% - 5.5%
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-300 text-red-800 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing..." : "Analyze Feasibility"}
        </button>
      </form>

      {result && (
        <div id="results">
          <div
            className={`rounded-xl border-2 p-6 mb-8 ${statusStyles[result.status].bg} ${statusStyles[result.status].border}`}
          >
            <div className="flex items-center gap-4 mb-3">
              <span
                className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${statusStyles[result.status].badge}`}
              >
                {statusStyles[result.status].label}
              </span>
            </div>
            <p className={`text-lg ${statusStyles[result.status].text}`}>
              {result.statusMessage}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
              <div className="text-sm text-slate-500 mb-1">Monthly Payment</div>
              <div className="text-2xl font-bold text-primary-700">
                {formatCurrency(result.monthlyPayment)}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
              <div className="text-sm text-slate-500 mb-1">Loan Amount</div>
              <div className="text-2xl font-bold text-slate-800">
                {formatCurrency(result.loanAmount)}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
              <div className="text-sm text-slate-500 mb-1">Total Interest</div>
              <div className="text-2xl font-bold text-slate-800">
                {formatCurrency(result.totalInterest)}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
              <div className="text-sm text-slate-500 mb-1">Total Cost</div>
              <div className="text-2xl font-bold text-slate-800">
                {formatCurrency(result.totalCost)}
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Criteria Breakdown
          </h2>
          <div className="space-y-4 mb-8">
            {result.criteria.map((criterion) => (
              <div
                key={criterion.name}
                className={`rounded-xl border p-5 ${criterionStatusStyles[criterion.status]}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{criterion.name}</h3>
                  <span className="text-lg font-bold">
                    {criterion.displayValue}
                  </span>
                </div>
                <p className="text-sm opacity-80">{criterion.message}</p>
              </div>
            ))}
          </div>

          {result.notes.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-semibold text-blue-800 mb-2">Notes</h3>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                {result.notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
