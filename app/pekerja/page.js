'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function PekerjaPage() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Halaman Pekerja</h1>
      <p>Selamat datang! Fitur pencatatan akan ditambahkan di sini.</p>
      <button onClick={handleLogout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
        Keluar
      </button>
    </main>
  )
}