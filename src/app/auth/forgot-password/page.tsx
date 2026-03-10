'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader, ArrowLeft } from 'lucide-react'
import { verificationService, ApiError } from '@/lib/api'

const ForgotPasswordPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError(null)
    try {
      await verificationService.sendOtp(email)
      try { sessionStorage.setItem('resetEmail', email) } catch {}
      setSent(true)
      router.push('/auth/reset-password/otp')
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to send OTP. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full h-screen grid lg:grid-cols-2 items-stretch">
        <div className="relative hidden lg:flex overflow-hidden bg-black p-10 flex-col justify-between border-r border-gray-200">
          <div className="bg-grid-pattern absolute inset-0 opacity-[0.03]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <span className="nav text-xs uppercase tracking-widest text-gray-400">[ INTEGRION ]</span>
            </div>
            <div className="space-y-6">
              <h1 className="text-5xl font-black leading-[0.95] text-white tracking-tight">
                Reset<br />access
              </h1>
              <p className="font-aeonik-light text-gray-400 text-base max-w-md leading-relaxed">
                Enter your email and we will send you a one-time code to reset your password.
              </p>
            </div>
          </div>
          <div className="relative z-10 grid grid-cols-2 gap-px mt-auto">
            <div className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-5">
              <span className="nav text-[10px] uppercase tracking-widest text-zinc-500">SECURE</span>
              <p className="mt-3 text-sm font-semibold text-white">One-time code</p>
              <p className="text-xs text-zinc-400 font-aeonik-light mt-1">Expires quickly for safety.</p>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-5">
              <span className="nav text-[10px] uppercase tracking-widest text-zinc-500">FAST</span>
              <p className="mt-3 text-sm font-semibold text-white">Email delivery</p>
              <p className="text-xs text-zinc-400 font-aeonik-light mt-1">Check inbox and spam.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 lg:p-12 flex flex-col justify-center max-w-lg mx-auto w-full">
          <Link href="/auth/signin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8 w-fit">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="nav text-xs uppercase tracking-wide">Back</span>
          </Link>

          <div className="mb-8">
            <span className="nav text-xs uppercase tracking-widest text-gray-400">[ RESET ]</span>
            <h2 className="text-3xl font-black text-black tracking-tight mt-2">Forgot password</h2>
            <p className="text-sm text-gray-500 font-aeonik-light mt-2">
              Enter the email linked to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-black">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="input-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {sent && (
              <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Code sent. Check your inbox.
              </div>
            )}

            <button type="submit" disabled={loading || !email} className="btn-primary flex items-center justify-center gap-2">
              {loading ? <><Loader className="h-4 w-4 animate-spin" /> Sending...</> : 'Send OTP'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default ForgotPasswordPage
