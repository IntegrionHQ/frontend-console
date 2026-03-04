import { LineChart } from 'lucide-react'

export default function TestRunsPage() {
  return (
    <div className="relative flex flex-col justify-center items-center h-[70vh] border border-gray-200 bg-white">
      <div className="bg-dot-pattern absolute inset-0 opacity-[0.04]" />
      <div className="corner-plus top-0 left-0" />
      <div className="corner-plus top-0 right-0" />
      <div className="corner-plus bottom-0 left-0" />
      <div className="corner-plus bottom-0 right-0" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="h-16 w-16 border border-gray-200 flex items-center justify-center mb-6">
          <LineChart className="h-6 w-6 text-gray-300" />
        </div>
        <span className="section-label">[ TEST RUNS ]</span>
        <h2 className="text-xl font-black text-black tracking-tight mt-2">Coming Soon</h2>
        <p className="text-sm text-gray-500 font-aeonik-light mt-2 max-w-sm text-center">Your test execution history and results will be displayed here.</p>
      </div>
    </div>
  )
}
