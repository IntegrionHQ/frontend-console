'use client'
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from '@/app/store/global/context/userContext';
import { RiGithubFill, RiGitlabFill } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { Formik, useFormik } from "formik";
import * as Yup from "yup";
import { EyeIcon,EyeSlashIcon } from "@heroicons/react/24/outline";





const SignUpPage = () => {
  const params = useSearchParams();
  const provider = params.get("provider");
  const authCode = params.get("code");
  const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI;
  
  const { setUser } = useUser();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading,setLoading] = useState<boolean>(false);

  const router = useRouter();

  
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
      setLoading(true); 
      try {
        const response = await fetch(`${backend_uri}/api/v1/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error creating account:", errorText);
          // Handle error (e.g., show error message to the user)
          return;
        }

        const data = await response.json();
        console.log("Account created successfully:", data);
        // Handle success (e.g., redirect to another page or show success message)
      } catch (error) {
        console.error("Error during account creation:", error);
        // Handle error (e.g., show error message to the user)
      } finally {
        setLoading(false);
        router.push("/auth/signup/otp") // Set loading state to false after the request completes
      }
    }
  });

  
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

   

  return (
    <main className="bg-black flex min-h-screen justify-center items-center max-w-[1920px] ">
   
      <div className="w-full  flex flex-col justify-start items-start   rounded-lg h-full p-10 max-w-[600px]">
        <div>
          <h1 className="hemming text-2xl font-normal text-white jb  tracking-wider">Create an account</h1>
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
            <div className=" grid grid-cols-2 gap-4 w-full justify-center items-center mt-5">
              <button 
                className="w-full hemming text-md font-medium border-[0.01px] border-gray-300 text-white  px-3 py-2 mt-2 hover:bg-gray-200 hover:text-black transition" 
                onClick={handleGithubLogin}
              >
                <span className="flex justify-center items-center gap-4 font-normal manrope">
                  {isAuthenticating && provider == "github" ? (
                    <Loader className="animate-spin" size={15} />
                  ):(
                    <>
                     <RiGithubFill size={20}/>
                  Github
                    </>
                  )}
                 
                </span>
              </button>
              <button 
                className="w-full hemming text-md font-medium border border-gray-300 text-white  px-3 py-2 mt-2 hover:bg-white hover:text-black transition" 
                onClick={handleGitLabLogin}
              >
                <span className="flex justify-center items-center gap-4 font-normal manrope">
                 {isAuthenticating && provider == "gitlab" ? (
                    <Loader className="animate-spin" size={15} />
                  ):(
                    <>
                     <RiGitlabFill size={20}/>
                  Gitlab
                    </>
                  )}
                </span>
              </button>
              <button 
                className="w-full hemming text-md font-medium border border-gray-300 text-white  px-3 py-2 mt-2 hover:bg-white hover:text-black transition" 
                onClick={handleGitLabLogin}
              >
                <span className="flex justify-center items-center gap-4 font-normal manrope">
                {isAuthenticating && provider == "bitbucket" ? (
                    <Loader className="animate-spin" size={15} />
                  ):(
                    <>
                     <RiGitlabFill size={20}/>
                  Bitbucket
                    </>
                  )}
                </span>
              </button>
            </div>
<div className="flex justify-center items-center w-full mt-5">
           <span className="flex justify-center items-center text-white manrope">
            <hr className="w-1/4 h-1/4 bg-white"/>
            or
            <hr className="w-1/4 h-1/4 bg-white"/>
           </span>
            </div>

            <div className="w-full">
              <form className="w-full mt-6 flex flex-col gap-4" onSubmit={formik.handleSubmit}>
          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="email" className="font-light text-sm text-white manrope">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="bg-transparent border-[0.01px] w-full  px-3 py-2 text-white text-sm font-light manrope outline-none"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              autoComplete="email"
              placeholder="your@email.com"
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-200 text-sm manrope font-light">{formik.errors.email}</div>
            ) : null}
          </div>
          <div className="flex flex-col gap-1 w-full">
        <label htmlFor="password" className="font-light text-xs text-white manrope">Password</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className=" bg-transparent border-[0.01px] px-3 py-2 w-full  pr-10 text-white font-light manrope outline-none"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            autoComplete="new-password"
            placeholder="********"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword((prev:boolean) => !prev)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlashIcon fontSize={12}/>
            ) : (
              <EyeIcon/>
            )}
          </button>
        </div>
        {formik.touched.password && formik.errors.password ? (
          <div className="text-red-200 text-xs manrope font-light">{formik.errors.password}</div>
        ) : null}
      </div>

      <div className="w-full flex justify-center items-center">
        <span className="text-white manrope font-normal text-sm">By creating an account, you agree to the {" "} 
          <Link href="" className="text-blue-100 underline">
          terms of our service
          </Link>
          {" "}
           and 
           {" "}
            <Link href="" className="text-blue-100 underline" >
          privacy policy
          </Link>
        </span>
        </div>
          <button
            type="submit"
            className=" manrope text-sm font-semibold bg-main text-black  px-4 py-3 mt-2  transition flex justify-center items-center"
          >
            {
              loading? (
                  <Loader className="size-4 animate-spin"/>
              ): "Create Account"
            }
          </button>
        </form>
            </div>
            <div className="w-full flex justify-between text-center  text-white mt-10">
              <span className="text-sm manrope">
                Already have an account ?{" "}
                <span className="underline font-semibold">
                  <Link href="/auth/signin">Sign In</Link>
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

export default SignUpPage;

