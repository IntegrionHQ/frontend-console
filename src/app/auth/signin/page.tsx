'use client'
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from '@/app/store/global/context/userContext';
import { RiGithubFill, RiGitlabFill } from "@remixicon/react";

const SignInPage = () => {
  const params = useSearchParams();
  const provider = params.get("provider");
  const authCode = params.get("code");
  const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI;
  
  const { setUser } = useUser();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Handle OAuth callback
  useEffect(() => {
    console.log("Auth parameters:", { provider, authCode });
    
    if (provider && authCode && !isAuthenticating) {
      setIsAuthenticating(true);
      
      const handleGithubAuth = async () => {
        try {
          console.log("Starting GitHub authentication");
          
          // Construct and log the full request URL
          const requestUrl = `${backend_uri}/api/v1/registerWithGitHub?authToken=${authCode}`;
          console.log("Request URL:", requestUrl);
          
          // Fetch data from the API
          const response = await fetch(requestUrl);
          
          console.log("Response status:", response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error:", { status: response.status, text: errorText });
            setAuthError(`Authentication failed: ${response.status}`);
            return;
          }
          
          // Get response as text first to log it
          const responseText = await response.text();
          console.log("Raw response:", responseText);
          
          // Then parse it as JSON
          let data;
          try {
            data = JSON.parse(responseText);
            console.log("Parsed data:", data);
          } catch (e) {
            console.error("JSON parse error:", e);
            setAuthError("Invalid response format");
            return;
          }
          
          // Extract user data
          if (data && data.user) {
            console.log("User data from API:", data.user);
            
            // Create user object
            const userData = {
              email: data.user.primaryEmail || data.user.githubEmail || "",
              username: data.user.githubUsername || "",
              githubUsername: data.user.githubUsername || "",
              primaryEmail: data.user.primaryEmail || "",
              gitlabUsername: data.user.gitlabUsername || "",
              bitbucketUsername: data.user.bitbucketUsername || "",
              accessToken: data.user.githubAccessToken || ""
            };
            
            console.log("Setting user data:", userData);
            
            // Update the context
            setUser(userData);
            
            // Verify if the context was updated
            setTimeout(() => {
              const storedUser = localStorage.getItem('user');
              console.log("User data in localStorage:", storedUser);
            }, 500);
          } else {
            console.error("Invalid user data structure:", data);
            setAuthError("Invalid user data received");
          }
        } catch (error) {
          console.error("Authentication error:", error);
          setAuthError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setIsAuthenticating(false);
        }
      };
      
      if (provider === "github") {
        handleGithubAuth();
      }
      // Add similar handlers for other providers
    }
  }, [provider, authCode, backend_uri, setUser, isAuthenticating]);

  // OAuth login handlers
  const handleGithubLogin = () => {
    const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI_GITHUB;
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user%20repo`;
    console.log("GitHub Auth URL:", githubAuthUrl);
    window.location.href = githubAuthUrl;
  };

  const handleGitLabLogin = () => {
    const GITLAB_CLIENT_ID = process.env.NEXT_PUBLIC_GITLAB_CLIENT_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI_GITLAB;
    
    const gitlabAuthUrl = `https://gitlab.com/oauth/authorize?client_id=${GITLAB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&state=STATE&scope=read_api`;
    console.log("GitLab Auth URL:", gitlabAuthUrl);
    window.location.href = gitlabAuthUrl;
  };

  return (
    <main className="flex min-h-screen justify-center items-center max-w-[1920px]">
      <div className="w-1/2 bg-[url(/background.jpg)] min-h-screen bg-cover bg-no-repeat bg-center">
      </div>
      <div className="w-1/2 flex flex-col justify-start items-start bg-white rounded-lg h-full px-36">
        <div>
          <h1 className="hemming text-3xl font-medium text-black">Sign In</h1>
          <p className="font-medium text-sm">Resume testing your backend systems</p>
        </div>
        
        {authError && (
          <div className="w-full mt-4 p-3 bg-red-100 text-red-700 rounded">
            {authError}
          </div>
        )}
        
        {isAuthenticating ? (
          <div className="w-full mt-10 text-center">
            <p>Authenticating, please wait...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 w-full justify-center items-center mt-10">
              <button 
                className="w-full hemming text-md font-medium border border-black text-black rounded px-4 py-2 mt-2 hover:bg-black hover:text-white transition" 
                onClick={handleGithubLogin}
              >
                <span className="flex justify-center items-center gap-4">
                  <RiGithubFill size={30}/>
                  Continue With Github
                </span>
              </button>
              <button 
                className="w-full hemming text-md font-medium border border-black text-black rounded px-4 py-2 mt-2 hover:bg-black hover:text-white transition" 
                onClick={handleGitLabLogin}
              >
                <span className="flex justify-center items-center gap-4">
                  <RiGitlabFill size={30}/>
                  Continue With Gitlab
                </span>
              </button>
            </div>
            
            <div className="w-full text-center mt-10">
              <span className="text-sm">
                Don't have an account?{" "}
                <span className="underline font-semibold">
                  <Link href="/auth/signup">Sign Up</Link>
                </span>
              </span>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default SignInPage;

