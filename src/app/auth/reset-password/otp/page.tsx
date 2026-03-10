'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader, ArrowLeft } from 'lucide-react'
import { verificationService, ApiError } from '@/lib/api'

const ResetOtpPage = () => {
  const router = useRouter()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('resetEmail') || ''
      setEmail(stored)
      if (!stored) router.push('/auth/forgot-password')
    } catch {
      router.push('/auth/forgot-password')
    }
  }, [router])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length > 0) {
      const newOtp = [...otp]
      pasted.split('').forEach((char, i) => { newOtp[i] = char })
      setOtp(newOtp)
      const focusIdx = Math.min(pasted.length, 5)
      document.getElementById(`otp-${focusIdx}`)?.focus()
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
      await verificationService.verifyOtp(email, otpCode)
      router.push('/auth/reset-password/new')
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Invalid verification code. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError(null)
    try {
      await verificationService.sendOtp(email)
      setResent(true)
      setTimeout(() => setResent(false), 3000)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to resend code. Please try again.'
      setError(msg)
    } finally {
      setResending(false)
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
                Verify<br />ownership
              </h1>
              <p className="font-aeonik-light text-gray-400 text-base max-w-md leading-relaxed">
                We sent a one-time code to your email. Enter it below to continue.
              </p>
            </div>
          </div>
          <div className="relative z-10 mt-auto">
            <div className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-5">
              <span className="nav text-[10px] uppercase tracking-widest text-zinc-500">SENT TO</span>
              <p className="mt-3 text-sm font-semibold text-white font-mono truncate">{email || 'your email'}</p>
              <p className="text-xs text-zinc-400 font-aeonik-light mt-1">Check your inbox and spam folder.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 lg:p-12 flex flex-col justify-center max-w-lg mx-auto w-full">
          <Link href="/auth/forgot-password" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8 w-fit">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="nav text-xs uppercase tracking-wide">Back</span>
          </Link>

          <div className="mb-8">
            <span className="nav text-xs uppercase tracking-widest text-gray-400">[ VERIFY ]</span>
            <h2 className="text-3xl font-black text-black tracking-tight mt-2">Enter code</h2>
            <p className="text-sm text-gray-500 font-aeonik-light mt-2">
              Enter the 6-digit code we sent to <span className="font-medium text-black">{email || 'your email'}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
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
                  className="w-12 h-14 text-center text-xl font-bold border border-gray-200 bg-white outline-none transition-all focus:border-black focus:shadow-[2px_2px_0px_0px] focus:shadow-gray-400 nav"
                />
              ))}
            </div>

            {error && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {resent && (
              <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Verification code resent successfully.</div>
            )}

            <button type="submit" disabled={loading || otp.join('').length !== 6} className="btn-primary flex items-center justify-center gap-2">
              {loading ? <><Loader className="h-4 w-4 animate-spin" /> Verifying...</> : 'Verify code'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-500 font-aeonik-light">Did not receive the code?</span>
            <button onClick={handleResend} disabled={resending || !email} className="font-semibold text-black hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
              {resending ? 'Resending...' : 'Resend code'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ResetOtpPage
