"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { RiGithubFill } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import crypto from "crypto";
import { useUser } from "../store/global/context/userContext";
const InstallationsPage = () => {
  const state = crypto.randomBytes(16).toString("hex");
  const params = useSearchParams();
  const provider = params.get("provider");
  const installationId = params.get("installation_id");
  const { user } = useUser()
  
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const GITHUB_APP_INSTALL_URL = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL;

  const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI;

  const router = useRouter();
  useEffect(() => {
    if (!user?.email && !user?.username && !user?.githubUsername) {
      router.push('/auth/signin')
    }
  }, [user, router])

  const logObject = (label: string, obj: unknown) => {
    const objStr = JSON.stringify(obj, null, 2);
    console.log(`${label}:`, objStr);
    setDebugInfo((prev) => `${prev}\n${label}: ${objStr}`);
  };

  const processGithubInstallation = useCallback(
    async (installationId: string, providerHint: string | null) => {
      console.log(installationId, "here");
      if (!installationId) return;
      setIsAuthenticating(true);
      try {
        const response = await fetch(
          `${backend_uri}/api/v1/auth/github/install`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ installationId }),
          }
        );

        if (!response.ok) throw new Error(await response.text());
        console.log("Installation ID sent successfully");

        console.log(installationId);
        // router.push("/signin");
      } catch (err: any) {
        // setAuthError(err.message);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const lastProvider =
      typeof window !== "undefined"
        ? sessionStorage.getItem("lastProvider")
        : null;
    const providerHint = provider || lastProvider || undefined;
    logObject("Auth parameters", { provider, providerHint, installationId });

    if (installationId && !isAuthenticating) {
      if (providerHint && providerHint !== "github") {
        setDebugInfo(
          (prev) =>
            `${prev}\nProvider '${providerHint}' is not currently handled in this flow.`
        );
        return;
      }
      setDebugInfo("Starting authentication process...");
      processGithubInstallation(installationId, providerHint || null);
    }
  }, [provider, installationId]);

  const handleGithubInstallation = () => {
    const githubInstallationUrl = `${GITHUB_APP_INSTALL_URL}?state=${state}`;

    setDebugInfo(`GitHub Installation URL: ${githubInstallationUrl}`);
    try {
      sessionStorage.setItem("lastProvider", "github");
    } catch {}
    window.location.href = githubInstallationUrl;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="w-full h-screen grid lg:grid-cols-[1fr_0.6fr] items-stretch">
        <div className="bg-white text-slate-900 shadow-2xl p-8 sm:p-10 flex flex-col justify-center gap-6 overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 manrope">
                Connect Git Provider
              </p>
              <h2 className="hemming text-2xl font-semibold text-slate-900">
                Choose a provider from below
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              v1.0
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:shadow-sm"
              onClick={handleGithubInstallation}
            >
              {isAuthenticating && provider === "github" ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <RiGithubFill size={18} />
              )}
              GitHub
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default InstallationsPage;
