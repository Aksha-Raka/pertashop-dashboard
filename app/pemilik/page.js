'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function PemilikPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState([])
  const [notes, setNotes] = useState([])
  const [noteInput, setNoteInput] = useState('')
  const [notepad, setNotepad] = useState('')
  const [message, setMessage] = useState('')
  const notepadTimer = useRef(null)

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/')
        return
      }
      setLoading(false)
      loadEntries()
      loadNotes()
      loadNotepad()
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

  async function loadNotepad() {
    const { data, error } = await supabase
      .from('owner_notepad')
      .select('isi')
      .eq('id', 1)
      .single()

    if (!error && data) setNotepad(data.isi || '')
  }

  function handleNotepadChange(val) {
    setNotepad(val)
    clearTimeout(notepadTimer.current)
    notepadTimer.current = setTimeout(async () => {
      await supabase
        .from('owner_notepad')
        .update({ isi: val, updated_at: new Date().toISOString() })
        .eq('id', 1)
    }, 700)
  }

  async function handleSendNote(e) {
    e.preventDefault()
    if (!noteInput.trim()) return

    const { error } = await supabase.from('notes').insert({
      isi: noteInput.trim(),
      dari_role: 'pemilik',
    })

    if (error) {
      setMessage('Gagal mengirim: ' + error.message)
    } else {
      setMessage('Catatan terkirim ke pekerja!')
      setNoteInput('')
      loadNotes()
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
        <h1 className="text-2xl font-bold text-gray-900">Halaman Pemilik</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1.5 rounded text-sm">
          Keluar
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold text-gray-900 mb-3">Semua catatan dari Pekerja (bulan ini)</h2>
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
        <h2 className="font-semibold text-gray-900 mb-3">Notepad pribadi</h2>
        <textarea
          value={notepad}
          onChange={(e) => handleNotepadChange(e.target.value)}
          placeholder="Catatan pribadi, tersimpan otomatis..."
          className="w-full min-h-30 border border-gray-300 rounded px-3 py-2 text-gray-900"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold text-gray-900 mb-3">Kirim catatan ke Pekerja</h2>
        <form onSubmit={handleSendNote} className="flex gap-2 mb-4">
          <input
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Tulis catatan..."
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-900"
          />
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold">
            Kirim
          </button>
        </form>
        {message && <p className="text-sm text-blue-600 mb-3">{message}</p>}
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
      </div>
    </main>
  )
}