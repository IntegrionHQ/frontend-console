'use client'
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from '@/app/store/global/context/userContext';
import { RiGithubFill, RiGitlabFill } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { EyeIcon,EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from '@/hooks';
import { ApiError } from '@/lib/api';
import Image from "next/image";
import crypto from "crypto";

const SignUpPage = () => {
  const params = useSearchParams();
  const provider = params.get("provider");
  const authCode = params.get("code");
  
  const { setUser } = useUser();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { register: registerWithService, registerWithGitHub, loading: authLoading } = useAuth();
const state = crypto.randomBytes(16).toString("hex");
  const router = useRouter();
  const registerWithGitHubRef = useRef(registerWithGitHub);
  const setUserRef = useRef(setUser);
  
  // Keep refs updated
  useEffect(() => {
    registerWithGitHubRef.current = registerWithGitHub;
    setUserRef.current = setUser;
  }, [registerWithGitHub, setUser]);

  
  const SignUpSchema = Yup.object().shape({
      email: Yup.string()
        .email("Invalid email format. Kindly try again")
        .required("E-mail is required"),
      password: Yup.string()
        .min(8, "Your password must be at least 8 characters long")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/\d/, "Password must contain at least one number")
        .matches(/[@$!%*?&#^()_\-+=]/, "Password must contain at least one special character")
        .required("Password is required"),
    });
  const formik = useFormik({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema: SignUpSchema,
    onSubmit: async (values) => {
      setAuthError(null);
      try {
        const response = await registerWithService({
          email: values.email,
          password: values.password
        });
        
        if (response?.data) {
          const userData = {
            id: response.data.id,
            email: response.data.email || "",
            username: response.data.email || response.data.githubUsername || "",
            githubUsername: response.data.githubUsername || "",
            primaryEmail: response.data.email || response.data.githubEmail || "",
            gitlabUsername: response.data.gitlabUsername || "",
            bitbucketUsername: response.data.bitbucketUsername || "",
            accessToken: "",
            authCode: "",
            provider: "email",
            hasInstallations: response.data.hasInstallations || false
          };
          
          // Only set user and redirect if we have valid user data
          if (userData.email || userData.username || userData.githubUsername) {
            setUser(userData);
            // After successful email registration, redirect to OTP verification
            // For GitHub OAuth, isVerified will be handled differently
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

  
  const logObject = (label: string, obj: unknown) => {
    const objStr = JSON.stringify(obj, null, 2);
    console.log(`${label}:`, objStr);
    setDebugInfo(prev => `${prev}\n${label}: ${objStr}`);
  };

  
  const handleGithubAuth = useCallback(async (code: string, providerValue: string) => {
    try {
      setDebugInfo(prev => `${prev}\nStarting GitHub authentication`);
      setAuthError(null);
      setIsAuthenticating(true);
      
      const response = await registerWithGitHubRef.current({ authToken: code });
      
      if (response?.data?.user) {
        const user = response.data.user;
        logObject("User data from API", user);
        
        const userData = {
          id: user.id,
          email: user.email || user.githubEmail || "",
          username: user.githubUsername || "",
          githubUsername: user.githubUsername || "",
          primaryEmail: user.email || user.githubEmail || "",
          gitlabUsername: user.gitlabUsername || "",
          bitbucketUsername: user.bitbucketUsername || "",
          accessToken: "",
          authCode: code,
          provider: providerValue || 'github',
          hasInstallations: user.hasInstallations || false
        };
        
        logObject("Setting user data", userData);
        
        // Only set user and redirect if we have valid user data
        if (userData.email || userData.username || userData.githubUsername) {
          setUserRef.current(userData);
          // Redirect to dashboard after successful authentication
          router.push('/dashboard');
        } else {
          setAuthError("Registration failed. No valid user data received from backend.");
        }
      } else {
        setAuthError("Invalid user data received from authentication response");
      }
    } catch (error) {
      const errMsg = error instanceof ApiError ? error.message : (error instanceof Error ? error.message : 'Unknown error');
      setDebugInfo(prev => `${prev}\nAuthentication error: ${errMsg}`);
      setAuthError(`Error: ${errMsg}`);
      console.error('[GitHub Sign-Up] Error:', errMsg);
    } finally {
      setIsAuthenticating(false);
    }
  }, [router]);
  
  useEffect(() => {
    logObject("Auth parameters", { provider, authCode });
    
    if (provider && authCode && !isAuthenticating) {
      setDebugInfo("Starting authentication process...");
      if (provider === "github") {
        handleGithubAuth(authCode, provider);
      }
    }
  }, [provider, authCode]);

 
  const handleGithubLogin = () => {
    const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_SIGNUP_REDIRECT_URI_GITHUB;
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state}&scope=read%3Auser%2Cuser%3Aemail%20user%20repo`;
    setDebugInfo(`GitHub Auth URL: ${githubAuthUrl}`);
    window.location.href = githubAuthUrl;
  };

  const handleGitLabLogin = () => {
    const GITLAB_CLIENT_ID = process.env.NEXT_PUBLIC_GITLAB_CLIENT_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI_GITLAB;
    
    const gitlabAuthUrl = `https://gitlab.com/oauth/authorize?client_id=${GITLAB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&state=STATE&scope=read_api`;
    setDebugInfo(`GitLab Auth URL: ${gitlabAuthUrl}`);
    window.location.href = gitlabAuthUrl;
  };

   

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="w-full h-screen grid lg:grid-cols-[1fr_0.6fr] items-stretch">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-black p-10 shadow-2xl">
          <div className="absolute inset-0 opacity-20">
            <Image src="/bg-g.jpg" alt="Decorative background" fill className="object-cover" />
          </div>
          <div className="relative flex h-full flex-col justify-between">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-200">
                Integrion
              </p>
              <h1 className="hemming text-4xl font-semibold leading-tight text-white">Join us and ship faster</h1>
              <p className="manrope text-slate-200 text-base max-w-lg">
                Start centralizing your repos, tracking pull requests, and delivering with confidence in minutes.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-4 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
                <p className="text-xs uppercase tracking-wide text-slate-300">Quick setup</p>
                <p className="mt-2 text-lg font-semibold">2-minute start</p>
                <p className="text-sm text-slate-300">Connect your account and get started instantly.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
                <p className="text-xs uppercase tracking-wide text-slate-300">Team ready</p>
                <p className="mt-2 text-lg font-semibold">Collaborate</p>
                <p className="text-sm text-slate-300">Invite your team and ship together.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white text-slate-900 shadow-2xl p-8 sm:p-10 flex flex-col  justify-center gap-6 overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 manrope">Get started today</p>
              <h2 className="hemming text-2xl font-semibold text-slate-900">Create your account</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Free</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:shadow-sm"
              onClick={handleGithubLogin}
            >
              {isAuthenticating && provider === "github" ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <RiGithubFill size={18} />
              )}
              GitHub
            </button>

            <button
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:shadow-sm"
              onClick={handleGitLabLogin}
            >
              {isAuthenticating && provider === "gitlab" ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <RiGitlabFill size={18} />
              )}
              GitLab
            </button>

            <button
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:shadow-sm"
              onClick={handleGitLabLogin}
            >
              {isAuthenticating && provider === "bitbucket" ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <RiGitlabFill size={18} />
              )}
              Bitbucket
            </button>
          </div>

          <div className="relative flex items-center gap-3 text-xs text-slate-500 uppercase tracking-[0.2em]">
            <span className="h-px flex-1 bg-slate-200" />
            Or continue with email
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-800 manrope">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                autoComplete="email"
                placeholder="you@example.com"
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="text-sm text-red-600 manrope">{formik.errors.email}</div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-800 manrope">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 pr-12 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  onClick={() => setShowPassword((prev: boolean) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password ? (
                <div className="text-sm text-red-600 manrope">{formik.errors.password}</div>
              ) : null}
            </div>

            <div className="text-xs text-slate-600 manrope">
              By creating an account, you agree to our{" "}
              <Link href="" className="font-semibold text-slate-900 hover:underline">
                Terms of Service
              </Link>
              {" "}and{" "}
              <Link href="" className="font-semibold text-slate-900 hover:underline">
                Privacy Policy
              </Link>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {authLoading ? <Loader className="size-4 animate-spin" /> : "Create Account"}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <span className="manrope">Already have an account?</span>
            <Link href="/auth/signin" className="font-semibold text-slate-900 hover:underline">Sign in</Link>
          </div>

          {authError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {authError}
            </div>
          )}
{/* 
          {process.env.NODE_ENV !== 'production' && debugInfo && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono overflow-auto max-h-60">
              <h4 className="font-bold mb-2">Debug Information:</h4>
              <pre>{debugInfo}</pre>
            </div>
          )} */}
        </div>
      </div>
    </main>
  );
};

export default SignUpPage;

