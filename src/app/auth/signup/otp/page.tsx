'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/store/global/context/userContext'
import Link from 'next/link'
import Image from 'next/image'
import { Loader, Mail, ArrowLeft } from 'lucide-react'

const OTPVerificationPage = () => {
  const router = useRouter()
  const { user } = useUser()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    // Redirect if no user in context
    if (!user?.email && !user?.primaryEmail) {
      router.push('/auth/signup')
    }
  }, [user, router])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join('')
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // TODO: Implement OTP verification API call when backend is ready
      // const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/auth/verify-otp`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include',
      //   body: JSON.stringify({ otp: otpCode })
      // })
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // On success, redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('Invalid verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError(null)
    
    try {
      // TODO: Implement resend OTP API call when backend is ready
      // await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/auth/resend-otp`, {
      //   method: 'POST',
      //   credentials: 'include'
      // })
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      setResent(true)
      setTimeout(() => setResent(false), 3000)
    } catch (err) {
      setError('Failed to resend code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="w-full h-screen grid lg:grid-cols-[1fr_0.6fr] items-stretch">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-black p-10 shadow-2xl">
          <div className="absolute inset-0 opacity-20">
            <Image src="/bg-g.jpg" alt="Decorative background" fill className="object-cover" />
          </div>
          <div className="relative flex h-full flex-col justify-between">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-200">
                Integrion
              </p>
              <h1 className="hemming text-4xl font-semibold leading-tight text-white">Almost there!</h1>
              <p className="manrope text-slate-200 text-base max-w-lg">
                We've sent a verification code to your email. Enter it below to complete your registration.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-4 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
                <Mail className="h-6 w-6 mb-2" />
                <p className="text-xs uppercase tracking-wide text-slate-300">Check your inbox</p>
                <p className="mt-2 text-base font-semibold">Verification code sent</p>
                <p className="text-sm text-slate-300 mt-1">
                  Code sent to {user?.email || user?.primaryEmail}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white text-slate-900 shadow-2xl p-8 sm:p-10 flex flex-col justify-center gap-6 overflow-y-auto">
          <Link 
            href="/auth/signup" 
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Sign Up
          </Link>

          <div>
            <h2 className="hemming text-2xl font-semibold text-slate-900">Verify your email</h2>
            <p className="text-sm text-slate-600 manrope mt-2">
              Enter the 6-digit code we sent to your email
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-semibold border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                />
              ))}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {resent && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Verification code resent successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          <div className="text-center text-sm text-slate-600">
            <span className="manrope">Didn't receive the code?</span>{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-slate-900 hover:underline disabled:opacity-50"
            >
              {resending ? 'Resending...' : 'Resend code'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default OTPVerificationPage
