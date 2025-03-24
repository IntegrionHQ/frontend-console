'use client'
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";


export default function Home() {

  const params = useSearchParams(); 
  const provider = params.get("provider");
  const authCode = params.get("code");
  const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI

  useEffect(()=>{
    const makeRequest = async () =>{
      // double check the following requests to the backend with the authCode
      if(provider == "github" && authCode){
        const response =  await fetch(`${backend_uri}api/v1/registerWithGitHub?authToken=${authCode}`)
        const data = await response.json()
        // data would be user data with username that may also have an email
      }

      else if(provider == "gitlab" && authCode){
        const response =  await fetch(`${backend_uri}api/v1/registerWithGitLab?authToken=${authCode}`)
        const data = await response.json()
        // data would be user data with username that may also have an email
      }

      else if(provider == "bitbucket" && authCode){
        const response =  await fetch(`${backend_uri}api/v1/registerWithBitbucket?authToken=${authCode}`)
        const data = await response.json()
        // data would be user data with username that may also have an email
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
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI_GITHUB}&scope=read:user`;
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
    <main className="bg-green-950 flex flex-col justify-center items-center h-screen gap-5">
      <div className="flex flex-col justify-center items-center gap-1">
      <h1 className="text-3xl font-medium text-white">Create an account</h1>
      <p className="font-normal text-white text-sm">Connect with your preferred repository</p>
        </div>
      <div className="flex  justify-center items-center gap-6">
        {/* Github signin in method */}
        <div>
            <button className="bg-white rounded-md px-4 py-2 flex justify-center items-center space-x-2" onClick={handleGithubLogin}>
              <p className="text-md font-normal">Continue with Github</p>
              <Image src="/github.svg" alt="Github" width={20} height={32} />
            </button>
          </div>
          <div>
            <button className="bg-white rounded-md px-4 py-2 flex justify-center items-center space-x-2" onClick={handleGitLabLogin}>
              <p className="text-md font-normal">Continue with Gitlab</p>
              <Image src="/gitlab.svg" alt="Github" width={20} height={32} />
            </button>
          </div>
          <div>
            <button className="bg-white rounded-md px-4 py-2 flex justify-center items-center space-x-2" onClick={handleBitBucketLogin}>
              <p className="text-md font-normal">Continue with BitBucket</p>
              <Image src="/bitbucket.jpeg" alt="Github" width={20} height={32} />
            </button>
          </div>
      </div>
    </main>
      );
}
