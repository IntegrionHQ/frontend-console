'use client'
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from '@/app/store/global/context/userContext';

export default function Home() {
  const router = useRouter();
  const params = useSearchParams(); 
  const provider = params.get("provider");
  const authCode = params.get("code");
  const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI;
  const { setUser } = useUser(); 

  useEffect(()=>{
    const makeRequest = async () =>{
    if (provider === "github" && authCode) {
        try {
          console.log("Auth Flow - Starting GitHub auth with:", {
            uri: backend_uri,
            authCode: authCode
          });

          console.log(`${backend_uri}api/v1/registerWithGitHub?authToken=${authCode}`);
          const response = await fetch(`${backend_uri}api/v1/registerWithGitHub?authToken=${authCode}`);
          
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("Auth Flow - Backend Response:", data);

          if (data.id) { 
            const userData = {
              email: data.email || "",
              username: data.username || data.email?.split('@')[0] || "",
              githubUsername: data.githubUsername || "",
              primaryEmail: data.email || "",
              gitlabUsername: "",
              bitbucketUsername: "",
              authToken: authCode,
            };
            console.log("Auth Flow - Setting user data:", userData);
            setUser(userData);
          } else {
            console.error("Auth Flow - Invalid response format:", data);
          }
        } catch (error) {
          console.error("Auth Flow - Error:", error);
        }
      } 
      else if(provider == "gitlab" && authCode){
        const response =  await fetch(`${backend_uri}api/v1/registerWithGitLab?authToken=${authCode}`)
        const data = await response.json()
      }
      else if(provider == "bitbucket" && authCode){
        const response =  await fetch(`${backend_uri}api/v1/registerWithBitbucket?authToken=${authCode}`)
        const data = await response.json()
      }
      else{
        router.replace("/auth/signin")
      }
    }
    makeRequest()
  },[provider, authCode, backend_uri, setUser])
  return (
    <main>
      <h1>Home Page</h1>
    </main>
  );
}