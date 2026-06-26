import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import NhanVien from './pages/NhanVien'
import ChuShop from './pages/ChuShop'
import ImageViewer from './components/ImageViewer'

function App() {
    const { user } = useAuth()

    const toasterConfig = {
        style: {
            background: 'var(--glass-bg)',
            color: 'var(--text-main)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--gray-200)',
            boxShadow: 'var(--shadow-md)',
            borderRadius: '12px'
        },
        success: { iconTheme: { primary: 'var(--success)', secondary: '#fff' } },
        error: { iconTheme: { primary: 'var(--danger)', secondary: '#fff' } }
    }

    if (!user) return (
        <ThemeProvider>
            <Toaster toastOptions={toasterConfig} />
            <ImageViewer />
            <Routes><Route path="*" element={<Login />} /></Routes>
        </ThemeProvider>
    )

    return (
        <ThemeProvider>
            <Toaster toastOptions={toasterConfig} />
            <ImageViewer />
            <Routes>
                {user.vai_tro === 'chu'
                    ? <Route path="*" element={<ChuShop />} />
                    : <Route path="*" element={<NhanVien />} />
                }
            </Routes>
        </ThemeProvider>
    )
}

export default App