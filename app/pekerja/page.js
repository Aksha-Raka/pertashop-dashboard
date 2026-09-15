'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function PekerjaPage() {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10))
  const [terjual, setTerjual] = useState('')
  const [sisa, setSisa] = useState('')
  const [message, setMessage] = useState('')
  const [entries, setEntries] = useState([])
  const [notes, setNotes] = useState([])

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/')
        return
      }
      setUserId(data.user.id)
      setLoading(false)
      loadEntries()
      loadNotes()
    }
    checkUser()
  }, [])

  async function loadEntries() {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    const startStr = startOfMonth.toISOString().slice(0, 10)

    const { data, error } = await supabase
      .from('sales_entries')
      .select('*')
      .gte('tanggal', startStr)
      .order('tanggal', { ascending: false })

    if (!error) setEntries(data)
  }

  async function loadNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('dibuat_pada', { ascending: false })
      .limit(10)

    if (!error) setNotes(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')

    const { error } = await supabase.from('sales_entries').insert({
      tanggal,
      terjual_liter: parseFloat(terjual),
      sisa_liter: parseFloat(sisa),
      dicatat_oleh: userId,
    })

    if (error) {
      setMessage('Gagal menyimpan: ' + error.message)
    } else {
      setMessage('Catatan tersimpan!')
      setTerjual('')
      setSisa('')
      loadEntries()
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <p className="p-8 text-gray-900">Memuat...</p>

  return (
    <main className="p-8 max-w-md flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Halaman Pekerja</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1.5 rounded text-sm">
          Keluar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Tanggal
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-900"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Bensin terjual (liter)
          <input
            type="number"
            min="0"
            step="0.1"
            value={terjual}
            onChange={(e) => setTerjual(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-900"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Sisa bensin (liter)
          <input
            type="number"
            min="0"
            step="0.1"
            value={sisa}
            onChange={(e) => setSisa(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-900"
            required
          />
        </label>
        {message && <p className="text-sm text-blue-600">{message}</p>}
        <button type="submit" className="bg-blue-600 text-white rounded px-3 py-2 font-semibold">
          Simpan catatan
        </button>
      </form>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold text-gray-900 mb-3">Riwayat bulan ini</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada catatan bulan ini.</p>
        ) : (
          <table className="w-full text-sm text-gray-900">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Tanggal</th>
                <th className="pb-2">Terjual</th>
                <th className="pb-2">Sisa</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="py-1.5">{e.tanggal}</td>
                  <td className="py-1.5">{e.terjual_liter} L</td>
                  <td className="py-1.5">{e.sisa_liter} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold text-gray-900 mb-3">Catatan dari Pemilik</h2>
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada catatan.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {notes.map((n) => (
              <div key={n.id} className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-900">{n.isi}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.dibuat_pada).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}