import { Link, Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import News from './pages/News'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#0b5fff' }}>Simple Sports</h2>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/simple/home">Trang chủ</Link>
          <Link to="/simple/news">Tin tức</Link>
          <Link to="/simple/login">Đăng nhập</Link>
          <Link to="/simple/register">Đăng ký</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/simple/home" replace />} />
        <Route path="/simple/home" element={<Home />} />
        <Route path="/simple/news" element={<News />} />
        <Route path="/simple/login" element={<Login />} />
        <Route path="/simple/register" element={<Register />} />
      </Routes>
    </div>
  )
}
