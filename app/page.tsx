import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-5xl font-bold text-primary-900 mb-6">
        Mortgage Feasibility Analyzer
      </h1>
      <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
        Find out if you qualify for a mortgage in seconds. Enter your financial
        details and get an instant feasibility assessment with a detailed
        breakdown of key criteria.
      </p>

      <Link
        href="/analyze"
        className="inline-block bg-primary-600 text-white text-lg font-semibold px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors shadow-md"
      >
        Start Analysis
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-left">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-primary-600 text-2xl font-bold mb-2">DTI</div>
          <h3 className="font-semibold text-lg mb-2">Debt-to-Income Ratio</h3>
          <p className="text-slate-500 text-sm">
            We evaluate your total monthly debt obligations against your gross
            monthly income. The European threshold is 40%.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-primary-600 text-2xl font-bold mb-2">LTV</div>
          <h3 className="font-semibold text-lg mb-2">Loan-to-Value Ratio</h3>
          <p className="text-slate-500 text-sm">
            We compare your loan amount to the property value. Above 80%
            typically means a higher rate or stricter conditions; above 90%
            usually means denial.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-primary-600 text-2xl font-bold mb-2">Job</div>
          <h3 className="font-semibold text-lg mb-2">Employment Contract</h3>
          <p className="text-slate-500 text-sm">
            Permanent contracts get standard underwriting. Fixed-term and
            self-employed borrowers may face additional guarantees or stricter
            checks.
          </p>
        </div>
      </div>
    </div>
  );
}
