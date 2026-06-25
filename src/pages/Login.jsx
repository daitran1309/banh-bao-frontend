import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import { LogIn, Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const API = import.meta.env.VITE_API_URL

export default function Login() {
    const { login } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const [danhSach, setDanhSach] = useState([])
    const [ten, setTen] = useState('')
    const [mat_khau, setMatKhau] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingDS, setLoadingDS] = useState(true)

    // Load danh sách tên từ Sheet khi mở trang
    useEffect(() => {
        axios.get(`${API}/api/auth/danh-sach`)
            .then(res => setDanhSach(res.data))
            .catch(() => toast.error('Không tải được danh sách nhân viên'))
            .finally(() => setLoadingDS(false))
    }, [])

    async function handleLogin() {
        if (!ten || !mat_khau) {
            toast.error('Vui lòng chọn tên và nhập mật khẩu')
            return
        }
        setLoading(true)
        try {
            await login(ten, mat_khau)
            toast.success(`Xin chào, ${ten}!`)
        } catch {
            toast.error('Sai tên hoặc mật khẩu!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', width: '100%',
            background: 'var(--bg-gradient)',
            position: 'relative', overflow: 'hidden'
        }}>
            {/* Theme Toggle Button */}
            <button 
                onClick={toggleTheme} 
                style={{
                    position: 'absolute', top: 24, right: 24, zIndex: 10,
                    background: 'var(--glass-bg)', backdropFilter: 'blur(10px)',
                    border: '1px solid var(--gray-200)',
                    borderRadius: '50%', width: 44, height: 44,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-main)', cursor: 'pointer', transition: 'var(--transition)'
                }}
            >
                {theme === 'light' ? <Moon size={20} color="var(--primary)" /> : <Sun size={20} color="var(--warning)" />}
            </button>
            
            {/* Background elements for SaaS look */}
            <div style={{
                position: 'absolute', top: '-10%', left: '-10%', width: 500, height: 500,
                background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.3, borderRadius: '50%'
            }} />
            <div style={{
                position: 'absolute', bottom: '-10%', right: '-10%', width: 400, height: 400,
                background: 'var(--accent)', filter: 'blur(150px)', opacity: 0.2, borderRadius: '50%'
            }} />

            <motion.div 
                className="card" 
                style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 20, zIndex: 1, padding: '40px 32px' }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
                <div className="center-flex mb-2">
                    <div style={{
                        width: 64, height: 64, borderRadius: 16,
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        color: 'var(--white)', fontWeight: '800', fontSize: 32,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 25px rgba(108, 93, 211, 0.4)',
                        marginBottom: 16
                    }}>B</div>
                </div>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <h2 style={{ color: 'var(--text-main)', margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: 700 }}>Chào mừng trở lại</h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Đăng nhập để vào hệ thống Bánh Bao</p>
                </div>

                {loadingDS
                    ? <p className="text-center text-muted">Đang tải danh sách...</p>
                    : <select
                        className="input-field select-field"
                        value={ten}
                        onChange={e => setTen(e.target.value)}
                    >
                        <option value="">-- Chọn tên tài khoản --</option>
                        {danhSach.map(nv => (
                            <option key={nv.id} value={nv.ten}>{nv.ten}</option>
                        ))}
                    </select>
                }

                <input
                    className="input-field"
                    type="password"
                    placeholder="Mật khẩu"
                    value={mat_khau}
                    onChange={e => setMatKhau(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />

                <motion.button
                    className="btn btn-primary"
                    style={{ marginTop: 8, padding: '16px', fontSize: '1.1rem', letterSpacing: 1 }}
                    onClick={handleLogin}
                    disabled={loading || loadingDS}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <LogIn size={20} />
                    {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
                </motion.button>
            </motion.div>
        </div>
    )
}