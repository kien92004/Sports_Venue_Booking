import { useState } from 'react'
import { apiPost } from '../api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    try {
      const res = await apiPost('/api/auth/login', { username, password })
      setMessage(res.success ? 'Đăng nhập thành công' : res.message || 'Đăng nhập thất bại')
    } catch {
      setMessage('Lỗi kết nối')
    }
  }
  return (
    <div>
      <h3>Đăng nhập</h3>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <input placeholder="Tên đăng nhập" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Đăng nhập</button>
      </form>
      {message && <p style={{ marginTop: 8 }}>{message}</p>}
    </div>
  )
}
