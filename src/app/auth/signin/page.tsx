'use client'
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from '@/app/store/global/context/userContext';
import { RiGithubFill, RiGitlabFill } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

const SignInPage = () => {
  const params = useSearchParams();
  const provider = params.get("provider");
  const authCode = params.get("code");
  const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI;
  
  const { setUser } = useUser();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const router = useRouter();

  const logObject = (label: string, obj: any) => {
    const objStr = JSON.stringify(obj, null, 2);
    console.log(`${label}:`, objStr);
    setDebugInfo(prev => `${prev}\n${label}: ${objStr}`);
  };

  
  useEffect(() => {
    logObject("Auth parameters", { provider, authCode });
    
    if (provider && authCode && !isAuthenticating) {
      setIsAuthenticating(true);
      setDebugInfo("Starting authentication process...");
      
      const handleGithubAuth = async () => {
        try {
          setDebugInfo(prev => `${prev}\nStarting GitHub authentication`);
          
          // Construct and log the full request URL
          const requestUrl = `${backend_uri}/api/v1/registerWithGitHub?authToken=${authCode}`;
          setDebugInfo(prev => `${prev}\nRequest URL: ${requestUrl}`);
          
          // Fetch data from the API
          const response = await fetch(requestUrl);
          
          setDebugInfo(prev => `${prev}\nResponse status: ${response.status}`);
          setApiStatus(response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            setDebugInfo(prev => `${prev}\nAPI Error: ${response.status} - ${errorText}`);
            
            if (response.status === 500) {
              setAuthError("Server error (500): The authentication server encountered an error. Please try again later or contact support.");
            } else {
              setAuthError(`Authentication failed: ${response.status} - ${errorText}`);
            }
            return;
          }
          
          // Get response as text first to log it
          const responseText = await response.text();
          setDebugInfo(prev => `${prev}\nRaw response: ${responseText.substring(0, 200)}...`);
          
          // Then parse it as JSON
          let data;
          try {
            data = JSON.parse(responseText);
            logObject("Parsed data", data);
          } catch (e) {
            setDebugInfo(prev => `${prev}\nJSON parse error: ${e instanceof Error ? e.message : 'Unknown error'}`);
            setAuthError("Invalid response format");
            return;
          }
          
          
          if (data && data.user.id) {
            logObject("User data from API", data.user);
            
            
            const userData = {
              email: data.user.primaryEmail || data.user.githubEmail || "",
              username: data?.user.githubUsername || "",
              githubUsername: data.user.githubUsername || "",
              primaryEmail: data.user.primaryEmail || "",
              gitlabUsername: data.user.gitlabUsername || "",
              bitbucketUsername: data.user.bitbucketUsername || "",
              accessToken: data.user.githubAccessToken || ""
            };
            
            logObject("Setting user data", userData);
            
           
            setUser({...userData,authCode,provider});
            
           
            setTimeout(() => {
              const storedUser = localStorage.getItem('user');
              setDebugInfo(prev => `${prev}\nUser data in localStorage: ${storedUser}`);
              if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                logObject("Parsed user from localStorage", parsedUser);
                if(parsedUser )
                {
                  router.push(`/dashboard/projects?provider=${provider}&authcode=${authCode}`)
                }
              } else {
                setDebugInfo(prev => `${prev}\nNo user data found in localStorage`);
              }
              
            }, 500);


          } else {
            setDebugInfo(prev => `${prev}\nInvalid user data structure`);
            setAuthError("Invalid user data received");
          }
        } catch (error) {
          setDebugInfo(prev => `${prev}\nAuthentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setAuthError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setIsAuthenticating(false);
        }
      };
      
      if (provider === "github") {
        handleGithubAuth();
      }
    
    }
  }, [ provider,authCode,router]);

 
  const handleGithubLogin = () => {
    const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_SIGNIN_REDIRECT_URI_GITHUB;
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user%20repo`;
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

 
  const renderServerStatus = () => {
    if (apiStatus === 500) {
      return (
        <div className="w-full mt-2 text-sm text-gray-600">
          <p>The authentication server is currently experiencing issues. This could be due to:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Temporary server outage</li>
            <li>Maintenance in progress</li>
            <li>Invalid authentication token</li>
          </ul>
          <p className="mt-2">You can try:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Logging in again in a few minutes</li>
            <li>Contacting support if the issue persists</li>
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="bg-black flex min-h-screen justify-center items-center max-w-[1920px] ">
      <div className="w-1/2 bg-[url(/bg.jpg)] min-h-screen bg-cover bg-no-repeat bg-center">
      </div>
      <div className="w-1/2  flex flex-col justify-start items-start   rounded-lg h-full px-36">
        <div>
          <h1 className="hemming text-3xl font-medium text-white">Sign In</h1>
          <p className="font-medium text-sm text-white sub">Resume testing your backend systems</p>
        </div>
        
        {/* {authError && (
          <div className="w-full mt-4 p-3 bg-red-100 text-red-700 rounded">
            {authError}
            {renderServerStatus()}
          </div>
        )} */}
        
        {/* {isAuthenticating ? (
          <div className="w-full mt-10 text-center">
            <p>Authenticating, please wait...</p>
          </div>
        ) : (
          <> */}
            <div className="flex flex-col gap-4 w-full justify-center items-center mt-10">
              <button 
                className="w-full hemming text-md font-medium  bg-main text-black rounded px-4 py-2 mt-2 hover:bg-black hover:text-white transition" 
                onClick={handleGithubLogin}
              >
                <span className="flex justify-center items-center gap-4">
                  {isAuthenticating && provider == "github" ? (
                    <Loader className="animate-spin" size={30} />
                  ):(
                    <>
                     <RiGithubFill size={30}/>
                  Continue With Github
                    </>
                  )}
                 
                </span>
              </button>
              <button 
                className="w-full hemming text-md font-medium border border-white text-white rounded px-4 py-2 mt-2 hover:bg-black hover:text-white transition" 
                onClick={handleGitLabLogin}
              >
                <span className="flex justify-center items-center gap-4">
                  <RiGitlabFill size={20}/>
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
          {/* </>
        )} */}
        
        {/* Debug section - visible only during development */}
        {/* {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="w-full mt-6 p-3 bg-gray-100 text-xs font-mono overflow-auto max-h-60">
            <h4 className="font-bold mb-2">Debug Information:</h4>
            <pre>{debugInfo}</pre>
          </div>
        )} */}
      </div>
    </main>
  );
};

export default SignInPage;

