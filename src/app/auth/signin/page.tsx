'use client'
import React from 'react'

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
const page = () => {
 const params = useSearchParams(); 
  const provider = params.get("provider");
  const authCode = params.get("code");
  const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI
  const [showPassword, setShowPassword] = useState(false);
 
  

  useEffect(()=>{
    const makeRequest = async () =>{
      if(provider == "github" && authCode){
        const response =  await fetch(`${backend_uri}api/v1/registerWithGitHub?authToken=${authCode}`)
        const data = await response.json()
      }
      else if(provider == "gitlab" && authCode){
        const response =  await fetch(`${backend_uri}api/v1/registerWithGitLab?authToken=${authCode}`)
        const data = await response.json()
      }
      else if(provider == "bitbucket" && authCode){
        const response =  await fetch(`${backend_uri}api/v1/registerWithBitbucket?authToken=${authCode}`)
        const data = await response.json()
      }
    }
    makeRequest()
  },[])

  const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
  const REDIRECT_URI_GITHUB = process.env.NEXT_PUBLIC_REDIRECT_URI_GITHUB
  const BITBUCKET_CLIENT_KEY = process.env.NEXT_PUBLIC_BITBUCKET_CLIENT_KEY
  const GITLAB_CLIENT_ID = process.env.NEXT_PUBLIC_GITLAB_CLIENT_ID
  const REDIRECT_URI_GITLAB = process.env.NEXT_PUBLIC_REDIRECT_URI_GITLAB

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
          <h1 className="hemming text-4xl font-medium text-black">Sign In</h1>
          <p className=" font-medium">Resume testing your backend systems</p>
        </div>

        <div className="flex flex-col gap-4 w-full justify-center items-center mt-10">
          <button className="w-full hemming text-lg font-medium border border-black text-black rounded px-4 py-2 mt-2 hover:bg-black hover:text-white transition" onClick={handleGithubLogin}>
             <span className="flex justify-center items-center gap-4">
              <RiGithubFill size={36}/>
              Continue With Github
             </span>
          </button>
          <button className="w-full hemming text-lg font-medium border border-black text-black rounded px-4 py-2 mt-2 hover:bg-black hover:text-white transition" onClick={handleGitLabLogin}>
             <span className="flex justify-center items-center gap-4">
              <RiGitlabFill size={36}/>
              Continue With Gitlab
             </span>
          </button>
            
        </div>
        <div className="w-full text-center mt-10">
          <span className="text-lg">Don't have an account ? {" "}
            <span className="underline font-semibold">
              <Link href="/auth/signup">
              Sign Up
              </Link>
 
            </span>
           
            </span>
        </div>
      </div>
    </main>
  )
}

export default page

