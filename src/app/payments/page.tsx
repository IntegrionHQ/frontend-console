"use client";
import { useState } from "react";

const CheckoutPage = () => {
  const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI;

  const [selectedTier, setSelectedTier] = useState("pro");
  const [isLoading, setIsLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [devCount, setDevCount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    company: "",
    country: "US",
    acceptTerms: false,
  });

  // probs shouldn't hard code these
  const pricingTiers = {
    pro: {
      name: "Pro",
      price: 15.0,
      description:
        "For small teams that want continuous AI testing integrated into their workflow.",
      features: [
        "Up to 10 repositories",
        "500 AI test cases/month",
        "AI-generated failure suggestions & code snippets",
        "Automated test maintenance (detects broken tests and refactors)",
        "Email alerts for test failures",
        "CI/CD pipeline integrations (GitHub Actions, GitLab CI, Jenkins)",
        "Email support",
      ],
      color: "purple",
      popular: false,
      //pdt_0NWA8mx4iuGmHj3dvb6gp
      productId: "pdt_0NWZHiRxemk6J7eRdCeZl",
    },
    plus: {
      name: "Plus",
      price: 35.0,
      description:
        "For growing teams managing multiple environments and infra repos.",
      features: [
        "Unlimited repositories",
        "2,000 AI test cases/month",
        "Advanced test generation (infra, security, performance)",
        "AI test repair (self-healing tests)",
        "AI-generated root cause analysis for failed builds",
        "Branch-level analytics dashboard",
        "Priority email + chat support",
        "Role-based access control",
      ],
      color: "purple",
      popular: true,
      productId: "pdt_0NWA9XIQJKFgJAE2ykZDX",
    },
    enterprise: {
      name: "Enterprise",
      price: null,
      description:
        "For large organizations with custom security and compliance requirements.",
      features: [
        "Option to self-host in your own infrastructure",
        "Security and compliance",
        "SSO/SAML",
        "GitHub Enterprise support",
        "Dedicated Slack channel for support",
        "Custom invoicing and payment terms",
        "Custom DPA and terms of service",
      ],
      color: "purple",
      popular: false,
      productId: "",
    },
  };

  async function subscribe(productId: string) {
    setIsLoading(true);
    console.log(productId, backend_uri)
    // need to handle failed cases as well like unauthenticated and other backend stuff
    const res = await fetch(`${backend_uri}/api/v1/create-checkout`, {
      credentials: "include",

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    const response = await res.json();
    console.log(response)
    setIsLoading(false);
    window.location.href = response.data.checkoutUrl;

    // redirect to billing/success after success or failure
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600">
            Select the plan that best fits your team's needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {Object.entries(pricingTiers).map(([key, tier]) => (
            <div
              key={key}
              className={`relative rounded-2xl border-2 p-8 transition-all duration-300 cursor-pointer ${
                selectedTier === key
                  ? `border-${tier.color}-500 shadow-xl bg-white transform scale-105`
                  : "border-gray-200 bg-white hover:shadow-lg"
              }`}
              onClick={() => setSelectedTier(key)}
            >
              {tier.popular && (
                <div className="absolute top-0 right-6 transform -translate-y-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline">
                  {tier.price ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900">
                        ${tier.price.toFixed(2)}
                      </span>
                      <span className="ml-2 text-gray-500">/ Month</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-gray-900">
                      Custom
                    </span>
                  )}
                </div>
                <p className="mt-4 text-gray-600">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                // disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold cursor-pointer ${
                  selectedTier === key
                    ? `bg-${tier.color}-500 hover:bg-${tier.color}-600 text-white`
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                } transition-colors duration-300`}
                onClick={async () => {
                  await subscribe(tier.productId);
                }}
              >
                {selectedTier === key ? "Checkout" : "Select Plan"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Integrion. All rights reserved.</p>
          <p className="mt-2">
            <a href="#" className="text-blue-600 hover:underline mx-3">
              Terms of Service
            </a>
            <a href="#" className="text-blue-600 hover:underline mx-3">
              Privacy Policy
            </a>
            <a href="#" className="text-blue-600 hover:underline mx-3">
              Contact Sales
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
