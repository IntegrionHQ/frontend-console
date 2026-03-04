'use client'
import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from '@/app/store/global/context/userContext';
import { RiGithubFill, RiGitlabFill } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from '@/hooks';
import { ApiError } from '@/lib/api';
import crypto from "crypto";

const SignUpContent = () => {
  const params = useSearchParams();
  const provider = params.get("provider");
  const authCode = params.get("code");

  const { setUser } = useUser();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { register: registerWithService, registerWithGitHub, loading: authLoading } = useAuth();
  const state = crypto.randomBytes(16).toString("hex");
  const router = useRouter();
  const registerWithGitHubRef = useRef(registerWithGitHub);
  const setUserRef = useRef(setUser);

  useEffect(() => {
    registerWithGitHubRef.current = registerWithGitHub;
    setUserRef.current = setUser;
  }, [registerWithGitHub, setUser]);

  const SignUpSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email format").required("E-mail is required"),
    password: Yup.string()
      .min(8, "Must be at least 8 characters")
      .matches(/[a-z]/, "Needs a lowercase letter")
      .matches(/[A-Z]/, "Needs an uppercase letter")
      .matches(/\d/, "Needs a number")
      .matches(/[@$!%*?&#^()_\-+=]/, "Needs a special character")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: SignUpSchema,
    onSubmit: async (values) => {
      setAuthError(null);
      try {
        const response = await registerWithService({ email: values.email, password: values.password });
        if (response?.data) {
          const userData = {
            id: response.data.id,
            email: response.data.email || "",
            username: response.data.email || response.data.githubUsername || "",
            githubUsername: response.data.githubUsername || "",
            primaryEmail: response.data.email || response.data.githubEmail || "",
            gitlabUsername: response.data.gitlabUsername || "",
            bitbucketUsername: response.data.bitbucketUsername || "",
            accessToken: "", authCode: "", provider: "email",
            hasInstallations: response.data.hasInstallations || false
          };
          if (userData.email || userData.username || userData.githubUsername) {
            setUser(userData);
            if (userData.provider === 'email' && response.data.isVerified === 'false') {
              router.push('/auth/signup/otp');
            } else {
              router.push('/dashboard');
            }
          } else {
            setAuthError("Registration failed. Invalid user data received.");
          }
        } else {
          setAuthError("Registration failed. Please try again.");
        }
      } catch (error) {
        const errMsg = error instanceof ApiError ? error.message : 'Registration failed. Please try again.';
        setAuthError(errMsg);
      }
    }
  });

  const handleGithubAuth = useCallback(async (code: string, providerValue: string) => {
    try {
      setAuthError(null);
      setIsAuthenticating(true);
      const response = await registerWithGitHubRef.current({ authToken: code });
      if (response?.data?.user) {
        const user = response.data.user;
        const userData = {
          id: user.id,
          email: user.email || user.githubEmail || "",
          username: user.githubUsername || "",
          githubUsername: user.githubUsername || "",
          primaryEmail: user.email || user.githubEmail || "",
          gitlabUsername: user.gitlabUsername || "",
          bitbucketUsername: user.bitbucketUsername || "",
          accessToken: "", authCode: code,
          provider: providerValue || 'github',
          hasInstallations: user.hasInstallations || false
        };
        if (userData.email || userData.username || userData.githubUsername) {
          setUserRef.current(userData);
          router.push('/dashboard');
        } else {
          setAuthError("Registration failed. No valid user data received.");
        }
      } else {
        setAuthError("Invalid response from authentication.");
      }
    } catch (error) {
      const errMsg = error instanceof ApiError ? error.message : (error instanceof Error ? error.message : 'Unknown error');
      setAuthError(`Error: ${errMsg}`);
    } finally {
      setIsAuthenticating(false);
    }
  }, [router]);

  useEffect(() => {
    if (provider && authCode && !isAuthenticating) {
      if (provider === "github") handleGithubAuth(authCode, provider);
    }
  }, [provider, authCode]);

  const handleGithubLogin = () => {
    const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_SIGNUP_REDIRECT_URI_GITHUB;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state}&scope=read%3Auser%2Cuser%3Aemail%20user%20repo`;
    window.location.href = githubAuthUrl;
  };

  const handleGitLabLogin = () => {
    const GITLAB_CLIENT_ID = process.env.NEXT_PUBLIC_GITLAB_CLIENT_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI_GITLAB;
    const gitlabAuthUrl = `https://gitlab.com/oauth/authorize?client_id=${GITLAB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&state=STATE&scope=read_api`;
    try { sessionStorage.setItem('lastProvider', 'gitlab'); } catch {}
    window.location.href = gitlabAuthUrl;
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
                Join us<br />and ship faster
              </h1>
              <p className="font-aeonik-light text-gray-400 text-base max-w-md leading-relaxed">
                Start centralizing your repos, tracking pull requests, and delivering with confidence in minutes.
              </p>
            </div>
          </div>
          <div className="relative z-10 grid grid-cols-2 gap-px mt-auto">
            <div className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-5 hover:bg-zinc-900/80 transition-all duration-300">
              <span className="nav text-[10px] uppercase tracking-widest text-zinc-500">01</span>
              <p className="mt-3 text-sm font-semibold text-white">2-minute start</p>
              <p className="text-xs text-zinc-400 font-aeonik-light mt-1">Connect your account and get started instantly.</p>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-5 hover:bg-zinc-900/80 transition-all duration-300">
              <span className="nav text-[10px] uppercase tracking-widest text-zinc-500">02</span>
              <p className="mt-3 text-sm font-semibold text-white">Collaborate</p>
              <p className="text-xs text-zinc-400 font-aeonik-light mt-1">Invite your team and ship together.</p>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-white p-8 lg:p-12 flex flex-col justify-center max-w-lg mx-auto w-full">
          <div className="mb-8">
            <span className="nav text-xs uppercase tracking-widest text-gray-400">[ GET STARTED ]</span>
            <h2 className="text-3xl font-black text-black tracking-tight mt-2">Create account</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <button className="flex items-center justify-center gap-2 border border-gray-200 bg-white px-3 py-3 text-xs nav uppercase tracking-wide text-black transition-all hover:border-black hover:shadow-[2px_2px_0px_0px] hover:shadow-gray-400 hover:translate-y-[-1px]" onClick={handleGithubLogin}>
              {isAuthenticating && provider === "github" ? <Loader className="animate-spin" size={14} /> : <RiGithubFill size={16} />}
              GitHub
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-200 bg-white px-3 py-3 text-xs nav uppercase tracking-wide text-black transition-all hover:border-black hover:shadow-[2px_2px_0px_0px] hover:shadow-gray-400 hover:translate-y-[-1px]" onClick={handleGitLabLogin}>
              {isAuthenticating && provider === "gitlab" ? <Loader className="animate-spin" size={14} /> : <RiGitlabFill size={16} />}
              GitLab
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-200 bg-white px-3 py-3 text-xs nav uppercase tracking-wide text-black transition-all hover:border-black hover:shadow-[2px_2px_0px_0px] hover:shadow-gray-400 hover:translate-y-[-1px]" onClick={handleGitLabLogin}>
              <RiGitlabFill size={16} />
              Bitbucket
            </button>
          </div>

          <div className="relative flex items-center gap-3 mb-6">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="nav text-[10px] uppercase tracking-widest text-gray-400">or continue with email</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <form className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-black">Email <span className="text-red-600">*</span></label>
              <input id="email" name="email" type="email" className="input-base" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.email} autoComplete="email" placeholder="you@example.com" />
              {formik.touched.email && formik.errors.email && <span className="text-xs text-red-600">{formik.errors.email}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-black">Password <span className="text-red-600">*</span></label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? "text" : "password"} className="input-base pr-10" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.password} autoComplete="new-password" placeholder="••••••••" />
                <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors" onClick={() => setShowPassword(prev => !prev)} tabIndex={-1}>
                  {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && <span className="text-xs text-red-600">{formik.errors.password}</span>}
            </div>

            <p className="text-xs text-gray-500 font-aeonik-light">
              By creating an account, you agree to our{" "}
              <Link href="" className="font-semibold text-black hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="" className="font-semibold text-black hover:underline">Privacy Policy</Link>
            </p>

            <button type="submit" disabled={authLoading} className="btn-primary mt-1 flex items-center justify-center gap-2">
              {authLoading ? <Loader className="animate-spin h-4 w-4" /> : null}
              {authLoading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-500 font-aeonik-light">Already have an account?</span>
            <Link href="/auth/signin" className="font-semibold text-black hover:underline">Sign in</Link>
          </div>

          {authError && (
            <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{authError}</div>
          )}
        </div>
      </div>
    </main>
  );
};

const SignUpPage = () => {
  return (
    <Suspense fallback={<main className="min-h-screen bg-white flex items-center justify-center"><Loader className="animate-spin text-black" size={24} /></main>}>
      <SignUpContent />
    </Suspense>
  );
};

export default SignUpPage;
