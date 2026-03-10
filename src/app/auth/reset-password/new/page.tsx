'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { verificationService, ApiError } from '@/lib/api'

const ResetPasswordPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('resetEmail') || ''
      setEmail(stored)
      if (!stored) router.push('/auth/forgot-password')
    } catch {
      router.push('/auth/forgot-password')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await verificationService.resetPassword(email, password)
      try { sessionStorage.removeItem('resetEmail') } catch {}
      router.push('/auth/signin')
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to reset password. Please try again.'
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
                Create<br />new password
              </h1>
              <p className="font-aeonik-light text-gray-400 text-base max-w-md leading-relaxed">
                Set a new password for your account and sign in again.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 lg:p-12 flex flex-col justify-center max-w-lg mx-auto w-full">
          <Link href="/auth/forgot-password" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8 w-fit">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="nav text-xs uppercase tracking-wide">Back</span>
          </Link>

          <div className="mb-8">
            <span className="nav text-xs uppercase tracking-widest text-gray-400">[ RESET ]</span>
            <h2 className="text-3xl font-black text-black tracking-tight mt-2">New password</h2>
            <p className="text-sm text-gray-500 font-aeonik-light mt-2">
              Reset password for <span className="font-medium text-black">{email || 'your email'}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-black">New password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-base pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="********"
                />
                <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors" onClick={() => setShowPassword(prev => !prev)} tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm" className="text-sm font-medium text-black">Confirm password</label>
              <div className="relative">
                <input
                  id="confirm"
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className="input-base pr-10"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  placeholder="********"
                />
                <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors" onClick={() => setShowConfirm(prev => !prev)} tabIndex={-1}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <button type="submit" disabled={loading || !password || !confirm} className="btn-primary flex items-center justify-center gap-2">
              {loading ? <><Loader className="h-4 w-4 animate-spin" /> Saving...</> : 'Reset password'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default ResetPasswordPage
