"use client";
import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RiGithubFill } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useAuth } from "@/hooks";
const generateState = () => {
  const cryptoObj = typeof globalThis !== "undefined" ? (globalThis.crypto as Crypto | undefined) : undefined;
  return cryptoObj?.randomUUID
    ? cryptoObj.randomUUID()
    : `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
};
import { useUser } from "../store/global/context/userContext";
const InstallationsContent= () => {
  const state = useMemo(() => generateState(), []);
  const params = useSearchParams();
  const provider = params.get("provider");
  const installationId = params.get("installation_id");
  const { setUser, user } = useUser();
  const processedInstallationRef = useRef<string | null>(null);

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const GITHUB_APP_INSTALL_URL = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL;

  const { installGitHubApp } = useAuth();

  const router = useRouter();
  useEffect(() => {
    if (!user?.email && !user?.username && !user?.githubUsername) {
      router.push("/auth/signin");
    }
    if (user?.hasInstallations) {
      router.replace("/dashboard");
    }
  }, [user, router]);

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
        const response = await installGitHubApp({ installationId });
        if (!response) throw new Error("Installation failed.");
        console.log("Installation ID sent successfully");
        setUser({ ...user, hasInstallations: true });
        processedInstallationRef.current = installationId;
        console.log(installationId);
        router.replace("/dashboard");
      } catch (err: any) {
        // setAuthError(err.message);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [router, installGitHubApp, user, setUser]
  );

  useEffect(() => {
    const lastProvider =
      typeof window !== "undefined"
        ? sessionStorage.getItem("lastProvider")
        : null;
    const providerHint = provider || lastProvider || undefined;
    logObject("Auth parameters", { provider, providerHint, installationId });

    console.log(lastProvider, providerHint, provider, installationId);
    if (installationId && !isAuthenticating) {
      if (processedInstallationRef.current === installationId) {
        return;
      }
      console.log("We are here?");
      if (providerHint && providerHint !== "github") {
        setDebugInfo(
          (prev) =>
            `${prev}\nProvider '${providerHint}' is not currently handled in this flow.`
        );
        return;
      }
      console.log("Hmmmm");
      setDebugInfo("Starting authentication process...");
      processGithubInstallation(installationId, providerHint || null);
    }
  }, [provider, installationId, isAuthenticating, processGithubInstallation]);

  const handleGithubInstallation = () => {
    const githubInstallationUrl = `${GITHUB_APP_INSTALL_URL}?state=${state}`;

    setDebugInfo(`GitHub Installation URL: ${githubInstallationUrl}`);
    try {
      sessionStorage.setItem("lastProvider", "github");
    } catch {}
    window.location.href = githubInstallationUrl;
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full h-screen grid lg:grid-cols-2 items-stretch">
        <div className="relative hidden lg:flex overflow-hidden bg-black p-10 flex-col justify-between border-r border-gray-200">
          <div className="bg-dot-pattern absolute inset-0 opacity-[0.04]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <span className="nav text-xs uppercase tracking-widest text-gray-400">[ INTEGRION ]</span>
            </div>
            <div className="space-y-6">
              <h1 className="text-5xl font-black leading-[0.95] text-white tracking-tight">
                Connect<br />your repo
              </h1>
              <p className="font-aeonik-light text-gray-400 text-base max-w-md leading-relaxed">
                Install the Integrion GitHub App to sync repositories, branches, and test runs.
              </p>
            </div>
          </div>
          <div className="relative z-10 grid grid-cols-2 gap-px mt-auto">
            <div className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-5 hover:bg-zinc-900/80 transition-all duration-300">
              <span className="nav text-[10px] uppercase tracking-widest text-zinc-500">01</span>
              <p className="mt-3 text-sm font-semibold text-white">Install app</p>
              <p className="text-xs text-zinc-400 font-aeonik-light mt-1">Approve access to your repos.</p>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-5 hover:bg-zinc-900/80 transition-all duration-300">
              <span className="nav text-[10px] uppercase tracking-widest text-zinc-500">02</span>
              <p className="mt-3 text-sm font-semibold text-white">Sync projects</p>
              <p className="text-xs text-zinc-400 font-aeonik-light mt-1">Pick a repo and start building.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 lg:p-12 flex flex-col justify-center max-w-xl mx-auto w-full">
          <div className="flex items-start justify-between gap-3 mb-8">
            <div>
              <span className="nav text-xs uppercase tracking-widest text-gray-400">[ CONNECT ]</span>
              <h2 className="text-3xl font-black text-black tracking-tight mt-2">
                Choose a provider
              </h2>
              <p className="text-sm text-gray-500 font-aeonik-light mt-2">
                Start with GitHub to enable repository access and integrations.
              </p>
            </div>
            <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
              v1.0
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold text-black transition-all hover:border-black hover:shadow-[2px_2px_0px_0px] hover:shadow-gray-400 hover:translate-y-[-1px]"
              onClick={handleGithubInstallation}
            >
              <span className="flex items-center gap-3">
                {isAuthenticating && provider === "github" ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <RiGithubFill size={20} />
                )}
                GitHub
              </span>
              <span className="text-xs text-gray-500 font-normal">Recommended</span>
            </button>
          </div>

          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
            We only request the minimum permissions needed to read repositories and branches.
          </div>
        </div>
      </div>
    </main>
  );
};


const InstallationsPage = () => {
  return (
    <Suspense
    fallback={
       <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
                   <Loader className="animate-spin" size={32} />
                 </main>
    }
    >
      <InstallationsContent/>
    </Suspense>
  )
};

export default InstallationsPage;
