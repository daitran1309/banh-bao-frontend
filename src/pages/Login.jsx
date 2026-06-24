import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { LogIn } from 'lucide-react'

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
        <div className="app-container center-flex">
            <div className="card" style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="center-flex mb-2">
                    <img src="/logo.png" alt="Logo" style={{ height: 120, objectFit: 'contain' }} />
                </div>
                <h2 className="text-center" style={{ color: 'var(--cta-bg)', margin: 0 }}>Chốt Ca Bao Tea</h2>

                {loadingDS
                    ? <p className="text-center text-muted">Đang tải danh sách...</p>
                    : <select
                        className="input-field select-field"
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
                    className="input-field"
                    type="password"
                    placeholder="Mật khẩu"
                    value={mat_khau}
                    onChange={e => setMatKhau(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />

                {error && <p className="text-danger text-center">{error}</p>}

                <button
                    className="btn btn-primary"
                    style={{ marginTop: 8, padding: '16px', fontSize: '1.1rem' }}
                    onClick={handleLogin}
                    disabled={loading || loadingDS}
                >
                    <LogIn size={20} />
                    {loading ? 'Đang vào...' : 'Đăng nhập'}
                </button>
            </div>
        </div>
    )
}