"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RiGithubFill } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { Loader, CheckCircle, ArrowRight } from "lucide-react";
import crypto from "crypto";
import { useUser } from "../store/global/context/userContext";

const InstallationsContent = () => {
  const state = crypto.randomBytes(16).toString("hex");
  const params = useSearchParams();
  const provider = params.get("provider");
  const installationId = params.get("installation_id");
  const { setUser, user } = useUser();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const GITHUB_APP_INSTALL_URL = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL;
  const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI;
  const router = useRouter();

  useEffect(() => {
    if (!user?.email && !user?.username && !user?.githubUsername) {
      router.push("/auth/signin");
    }
  }, [user, router]);

  const processGithubInstallation = useCallback(
    async (installationId: string, providerHint: string | null) => {
      if (!installationId) return;
      setIsAuthenticating(true);
      try {
        const response = await fetch(`${backend_uri}/api/v1/auth/github/install`, {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ installationId }),
        });
        if (!response.ok) throw new Error(await response.text());
        setUser({ ...user, hasInstallations: true });
        router.replace("/dashboard");
      } catch (err: any) {
        console.error("Installation failed:", err);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [router, backend_uri, setUser, user]
  );

  useEffect(() => {
    const lastProvider = typeof window !== "undefined" ? sessionStorage.getItem("lastProvider") : null;
    const providerHint = provider || lastProvider || undefined;
    if (installationId && !isAuthenticating) {
      if (providerHint && providerHint !== "github") return;
      processGithubInstallation(installationId, providerHint || null);
    }
  }, [provider, installationId]);

  const handleGithubInstallation = () => {
    const githubInstallationUrl = `${GITHUB_APP_INSTALL_URL}?state=${state}`;
    try { sessionStorage.setItem("lastProvider", "github"); } catch {}
    window.location.href = githubInstallationUrl;
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full h-screen grid lg:grid-cols-2 items-stretch">
        {/* Left Panel */}
        <div className="relative hidden lg:flex overflow-hidden bg-black p-10 flex-col justify-between border-r border-gray-200">
          <div className="bg-grid-pattern absolute inset-0 opacity-[0.03]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <span className="nav text-xs uppercase tracking-widest text-gray-400">[ INTEGRION ]</span>
            </div>
            <div className="space-y-6">
              <h1 className="text-5xl font-black leading-[0.95] text-white tracking-tight">
                Connect your<br />repositories
              </h1>
              <p className="font-aeonik-light text-gray-400 text-base max-w-md leading-relaxed">
                Install the Integrion app on your Git provider to start importing and managing your projects.
              </p>
            </div>
          </div>
          <div className="relative z-10 grid grid-cols-1 gap-px mt-auto">
            <div className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-5">
              <span className="nav text-[10px] uppercase tracking-widest text-zinc-500">HOW IT WORKS</span>
              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="nav text-xs text-zinc-500">01</span>
                  <p className="text-sm text-white font-aeonik-light">Install the GitHub App on your account or organization</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="nav text-xs text-zinc-500">02</span>
                  <p className="text-sm text-white font-aeonik-light">Select which repositories to grant access to</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="nav text-xs text-zinc-500">03</span>
                  <p className="text-sm text-white font-aeonik-light">Start creating projects from your connected repos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-white p-8 lg:p-12 flex flex-col justify-center max-w-lg mx-auto w-full">
          <div className="mb-8">
            <span className="nav text-xs uppercase tracking-widest text-gray-400">[ CONNECT ]</span>
            <h2 className="text-3xl font-black text-black tracking-tight mt-2">Choose a provider</h2>
            <p className="text-sm text-gray-500 font-aeonik-light mt-2">Connect a Git provider to import your repositories</p>
          </div>

          <div className="space-y-3">
            <button
              className="w-full flex items-center justify-between border border-gray-200 bg-white p-5 transition-all hover:border-black hover:shadow-[3px_3px_0px_0px] hover:shadow-gray-300 hover:translate-y-[-1px] group"
              onClick={handleGithubInstallation}
            >
              <div className="flex items-center gap-4">
                {isAuthenticating ? (
                  <Loader className="animate-spin h-6 w-6" />
                ) : (
                  <RiGithubFill size={24} />
                )}
                <div className="text-left">
                  <p className="font-bold text-black text-sm">GitHub</p>
                  <p className="text-xs text-gray-400 font-aeonik-light">Install app on your account or org</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-black transition-colors" />
            </button>

            <div className="w-full flex items-center justify-between border border-gray-100 bg-gray-50/50 p-5 opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <svg className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/></svg>
                <div className="text-left">
                  <p className="font-bold text-gray-400 text-sm">GitLab</p>
                  <p className="text-xs text-gray-300 font-aeonik-light">Coming soon</p>
                </div>
              </div>
              <span className="nav text-[10px] uppercase tracking-widest text-gray-300">Soon</span>
            </div>

            <div className="w-full flex items-center justify-between border border-gray-100 bg-gray-50/50 p-5 opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <svg className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 0 0 .77-.646l3.27-20.03a.768.768 0 0 0-.768-.892zM14.52 15.53H9.522L8.17 8.466h7.561z"/></svg>
                <div className="text-left">
                  <p className="font-bold text-gray-400 text-sm">Bitbucket</p>
                  <p className="text-xs text-gray-300 font-aeonik-light">Coming soon</p>
                </div>
              </div>
              <span className="nav text-[10px] uppercase tracking-widest text-gray-300">Soon</span>
            </div>
          </div>

          <div className="mt-8 border border-gray-100 p-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 font-aeonik-light">Read-only access to selected repos</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 font-aeonik-light">Revokable at any time from GitHub</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const InstallationsPage = () => {
  return (
    <Suspense fallback={<main className="min-h-screen bg-white flex items-center justify-center"><Loader className="animate-spin text-black" size={24} /></main>}>
      <InstallationsContent />
    </Suspense>
  );
};

export default InstallationsPage;
