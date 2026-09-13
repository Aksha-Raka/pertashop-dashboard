'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError('Email atau password salah.')
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      setError('Profil tidak ditemukan. Hubungi admin.')
      setLoading(false)
      return
    }

    if (profile.role === 'pekerja') {
      router.push('/pekerja')
    } else if (profile.role === 'pemilik') {
      router.push('/pemilik')
    } else {
      setError('Role tidak dikenali.')
    }

    setLoading(false)
  }

    return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-80 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-center text-gray-900">Login Pertashop</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded px-3 py-2 font-semibold"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
    </main>
  )
}