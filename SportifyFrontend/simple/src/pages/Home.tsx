import { useEffect, useState } from 'react'
import { apiGet } from '../api'

export default function Home() {
  const [message, setMessage] = useState<string>('Đang tải...')
  useEffect(() => {
    apiGet('/api/home').then(d => setMessage(d.message)).catch(() => setMessage('Không thể tải dữ liệu'))
  }, [])
  return (
    <div>
      <h3>Trang chủ</h3>
      <p>{message}</p>
    </div>
  )
}
