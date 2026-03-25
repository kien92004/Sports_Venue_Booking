import { useState } from 'react'
import { apiPost } from '../api'

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', firstname: '', lastname: '', email: '' })
  const [message, setMessage] = useState<string | null>(null)
  function setField<K extends keyof typeof form>(k: K, v: string) {
    setForm({ ...form, [k]: v })
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    try {
      const res = await apiPost('/api/auth/register', form)
      setMessage(res.success ? 'Đăng ký thành công' : res.message || 'Đăng ký thất bại')
    } catch {
      setMessage('Lỗi kết nối')
    }
  }
  return (
    <div>
      <h3>Đăng ký</h3>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <input placeholder="Tên đăng nhập" value={form.username} onChange={e => setField('username', e.target.value)} />
        <input type="password" placeholder="Mật khẩu" value={form.password} onChange={e => setField('password', e.target.value)} />
        <input placeholder="Họ" value={form.firstname} onChange={e => setField('firstname', e.target.value)} />
        <input placeholder="Tên" value={form.lastname} onChange={e => setField('lastname', e.target.value)} />
        <input placeholder="Email" value={form.email} onChange={e => setField('email', e.target.value)} />
        <button type="submit">Đăng ký</button>
      </form>
      {message && <p style={{ marginTop: 8 }}>{message}</p>}
    </div>
  )
}
