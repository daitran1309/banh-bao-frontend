import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import NhanVien from './pages/NhanVien'
import ChuShop from './pages/ChuShop'

function App() {
    const { user } = useAuth()

    if (!user) return <Routes><Route path="*" element={<Login />} /></Routes>

    return (
        <Routes>
            {user.vai_tro === 'chu'
                ? <Route path="*" element={<ChuShop />} />
                : <Route path="*" element={<NhanVien />} />
            }
        </Routes>
    )
}

export default App