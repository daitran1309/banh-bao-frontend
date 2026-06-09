import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function Login() {
    const { login } = useAuth()
    const [danhSach, setDanhSach] = useState([])
    const [ten, setTen] = useState('')
    const [mat_khau, setMatKhau] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingDS, setLoadingDS] = useState(true)

    // Load danh sách tên từ Sheet khi mở trang
    useEffect(() => {
        axios.get(`${API}/api/auth/danh-sach`)
            .then(res => setDanhSach(res.data))
            .catch(() => setError('Không tải được danh sách nhân viên'))
            .finally(() => setLoadingDS(false))
    }, [])

    async function handleLogin() {
        if (!ten || !mat_khau) return setError('Vui lòng chọn tên và nhập mật khẩu')
        setLoading(true)
        setError('')
        try {
            await login(ten, mat_khau)
        } catch {
            setError('Sai tên hoặc mật khẩu!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logoContainer}>
                    <img src="/logo.png" alt="Logo" style={styles.logoImg} />
                </div>
                <h2 style={styles.title}>Chốt Ca Bao Tea</h2>

                {loadingDS
                    ? <p style={{ textAlign: 'center', color: '#6b7280' }}>Đang tải danh sách...</p>
                    : <select
                        style={styles.input}
                        value={ten}
                        onChange={e => setTen(e.target.value)}
                    >
                        <option value="">-- Chọn tên --</option>
                        {danhSach.map(nv => (
                            <option key={nv.id} value={nv.ten}>{nv.ten}</option>
                        ))}
                    </select>
                }

                <input
                    style={styles.input}
                    type="password"
                    placeholder="Mật khẩu"
                    value={mat_khau}
                    onChange={e => setMatKhau(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />

                {error && <p style={styles.error}>{error}</p>}

                <button
                    style={loading ? { ...styles.btn, opacity: 0.6 } : styles.btn}
                    onClick={handleLogin}
                    disabled={loading || loadingDS}
                >
                    {loading ? 'Đang vào...' : '🚀 Đăng nhập'}
                </button>
            </div>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#fff8f0', padding: 16
    },
    card: {
        background: '#fff', borderRadius: 16,
        padding: 32, width: '100%', maxWidth: 360,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', gap: 12
    },
    logoContainer: { display: 'flex', justifyContent: 'center', marginBottom: 8 },
    logoImg: { height: 120, objectFit: 'contain' },
    title: { textAlign: 'center', margin: 0, color: '#d97706' },
    input: {
        padding: '14px 16px', fontSize: 16, borderRadius: 10,
        border: '2px solid #e5e7eb', outline: 'none', width: '100%',
        boxSizing: 'border-box'
    },
    btn: {
        padding: '16px', fontSize: 18, fontWeight: 'bold',
        background: '#f59e0b', color: '#fff', border: 'none',
        borderRadius: 12, cursor: 'pointer', marginTop: 8
    },
    error: { color: 'red', textAlign: 'center', margin: 0 }
}