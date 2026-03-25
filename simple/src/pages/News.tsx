import { useEffect, useState } from 'react'
import { apiGet } from '../api'

type NewsItem = { id: number; title: string; date: string }

export default function News() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    apiGet('/api/news').then(d => setItems(d.items || [])).finally(() => setLoading(false))
  }, [])
  return (
    <div>
      <h3>Tin tức</h3>
      {loading && <div>Đang tải...</div>}
      {!loading && items.length === 0 && <div>Chưa có tin tức</div>}
      <ul>
        {items.map(n => (
          <li key={n.id}>{n.title} - {new Date(n.date).toLocaleDateString('vi-VN')}</li>
        ))}
      </ul>
    </div>
  )
}
