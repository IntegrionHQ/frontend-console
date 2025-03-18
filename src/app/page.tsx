import Image from "next/image";

export default function Home() {

  return (
    <main className="bg-green-950 flex flex-col justify-center items-center h-screen gap-5">
      <div className="flex flex-col justify-center items-center gap-1">
      <h1 className="text-3xl font-medium text-white">Create an account</h1>
      <p className="font-normal text-white text-sm">Connect with your preffered repository</p>
        </div>
      <div className="flex  justify-center items-center gap-6">
        {/* Github signin in method */}
        <div>
            <button className="bg-white rounded-md px-4 py-2 flex justify-center items-center space-x-2">
              <p className="text-md font-normal">Continue with Github</p>
              <Image src="/github.svg" alt="Github" width={20} height={32} />
            </button>
          </div>
          <div>
            <button className="bg-white rounded-md px-4 py-2 flex justify-center items-center space-x-2">
              <p className="text-md font-normal">Continue with Gitlab</p>
              <Image src="/gitlab.svg" alt="Github" width={20} height={32} />
            </button>
          </div>
          <div>
            <button className="bg-white rounded-md px-4 py-2 flex justify-center items-center space-x-2">
              <p className="text-md font-normal">Continue with BitBucket</p>
              <Image src="/bitbucket.jpeg" alt="Github" width={20} height={32} />
            </button>
          </div>
      </div>
    </main>
      );
}
