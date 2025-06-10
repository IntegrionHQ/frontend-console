'use client'
import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";


// Icon Imports
import {RiGithubFill,RiGitlabFill} from "@remixicon/react"
import { EyeIcon,EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Home() {

  const params = useSearchParams(); 
  const provider = params.get("provider");
  const authCode = params.get("code");
  const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI
  const [showPassword, setShowPassword] = useState(false);
 console.log(params);
 
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
    onSubmit: (values) => {
      console.log(values)
      
    }
  });

  useEffect(()=>{
    const makeRequest = async () =>{
      console.log(params);
      
      if(provider == "github" && authCode){
        const response =  await fetch(`${backend_uri}/api/v1/registerWithGitHub?authToken=${authCode}`)
        const data = await response.json()
        console.log(data);
        
      }
      else if(provider == "gitlab" && authCode){
        const response =  await fetch(`${backend_uri}/api/v1/registerWithGitLab?authToken=${authCode}`)
        const data = await response.json()
      }
      else if(provider == "bitbucket" && authCode){
        const response =  await fetch(`${backend_uri}/api/v1/registerWithBitbucket?authToken=${authCode}`)
        const data = await response.json()
      }
    }
    makeRequest()
  },[params])

  const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
  const REDIRECT_URI_GITHUB = process.env.NEXT_PUBLIC_SIGNUP_REDIRECT_URI_GITHUB
  const BITBUCKET_CLIENT_KEY = process.env.NEXT_PUBLIC_BITBUCKET_CLIENT_KEY
  const GITLAB_CLIENT_ID = process.env.NEXT_PUBLIC_GITLAB_CLIENT_ID
  const REDIRECT_URI_GITLAB = process.env.NEXT_PUBLIC_SIGNUP_REDIRECT_URI_GITLAB

  const handleGithubLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI_GITHUB}&scope=user%20repo`;
    window.location.href = githubAuthUrl;
  };

  const handleBitBucketLogin = () => {
    const bitBucketAuthUrl = `https://bitbucket.org/site/oauth2/authorize?client_id=${BITBUCKET_CLIENT_KEY}&response_type=code`;
    window.location.href = bitBucketAuthUrl;
  };

  const handleGitLabLogin = () => {
    const gitlabAuthUrl = `https://gitlab.com/oauth/authorize?client_id=${GITLAB_CLIENT_ID}&redirect_uri=${REDIRECT_URI_GITLAB}&response_type=code&state=STATE&scope=read_api`;
    console.log(gitlabAuthUrl )
    window.location.href = gitlabAuthUrl;
  };

  return (
    <main className="flex min-h-screen  justify-center items-center  max-w-[1920px]  ">
      <div className="w-1/2 bg-[url(/background.jpg)] min-h-screen bg-cover bg-no-repeat bg-center">

      </div>
      <div className="w-1/2 flex flex-col justify-start items-start bg-white rounded-lg h-full px-36 ">
        <div>
          <h1 className="hemming text-3xl font-medium text-black">Create an account</h1>
          <p className=" font-medium text-sm">Setup your Integrion account for free trial test runs</p>
        </div>
        {/* Email and password login form using formik and yup */}
        <form className="w-full mt-6 flex flex-col gap-4" onSubmit={formik.handleSubmit}>
          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="email" className="font-medium text-sm">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="border rounded px-3 py-2"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              autoComplete="email"
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-sm">{formik.errors.email}</div>
            ) : null}
          </div>
          <div className="flex flex-col gap-1 w-full">
        <label htmlFor="password" className="font-medium text-sm">Password</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className="border rounded px-3 py-2 w-full pr-10"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
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
          <div className="text-red-500 text-sm">{formik.errors.password}</div>
        ) : null}
      </div>
          <button
            type="submit"
            className=" hemming text-lg font-medium bg-blue-400 text-white rounded px-4 py-3 mt-2 hover:bg-green-900 transition"
          >
            Sign Up
          </button>
        </form>

        <div className="flex justify-center items-center  w-full mt-3 px-20 gap-4">
          <hr className="h-0.5 bg-gray-200 w-full"/>
            <span className="hemming text-gray-400">Or continue with</span>
          <hr className="h-0.5 bg-gray-200 w-full"/>
        </div>

        <div className="flex flex-col gap-4 w-full justify-center items-center">
          <button className="w-full hemming text-sm font-medium border border-black text-black rounded px-4 py-2 mt-2 hover:bg-black hover:text-white transition" onClick={handleGithubLogin}>
             <span className="flex justify-center items-center gap-4">
              <RiGithubFill size={30}/>
              Continue With Github
             </span>
          </button>
          <button className="w-full hemming text-sm font-medium border border-black text-black rounded px-4 py-2 mt-2 hover:bg-black hover:text-white transition" onClick={handleGitLabLogin}>
             <span className="flex justify-center items-center gap-4">
              <RiGitlabFill size={30}/>
              Continue With Gitlab
             </span>
          </button>
            
        </div>
        <div className="w-full text-center mt-10">
          <span className="text-sm">Already have an account ? {" "}
            <span className="underline font-semibold">
              <Link href="/auth/signin">
              Sign In
              </Link>
 
            </span>
           
            </span>
        </div>
      </div>
    </main>
  );
}
