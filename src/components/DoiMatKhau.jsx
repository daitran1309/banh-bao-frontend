import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function DoiMatKhau({ onClose }) {
    const { user, token } = useAuth()
    const [matKhauCu, setMatKhauCu] = useState('')
    const [matKhauMoi, setMatKhauMoi] = useState('')
    const [xacNhan, setXacNhan] = useState('')
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const headers = { Authorization: `Bearer ${token}` }

    async function handleDoiMatKhau() {
        if (matKhauMoi !== xacNhan) return setMsg('❌ Mật khẩu mới không khớp!')
        if (matKhauMoi.length < 4) return setMsg('❌ Mật khẩu mới phải ít nhất 4 ký tự!')
        setLoading(true); setMsg('')
        try {
            await axios.put(`${API}/api/auth/doi-mat-khau`,
                { ten: user.ten, mat_khau_cu: matKhauCu, mat_khau_moi: matKhauMoi },
                { headers }
            )
            setMsg('✅ Đổi mật khẩu thành công!')
            setTimeout(onClose, 1500)
        } catch (e) {
            setMsg(e.response?.data?.error || '❌ Lỗi!')
        } finally { setLoading(false) }
    }

    return (
        <div style={s.overlay}>
            <div style={s.modal}>
                <h3 style={s.title}>🔒 Đổi mật khẩu</h3>
                <input style={s.input} type="password" placeholder="Mật khẩu cũ"
                    value={matKhauCu} onChange={e => setMatKhauCu(e.target.value)} />
                <input style={s.input} type="password" placeholder="Mật khẩu mới"
                    value={matKhauMoi} onChange={e => setMatKhauMoi(e.target.value)} />
                <input style={s.input} type="password" placeholder="Xác nhận mật khẩu mới"
                    value={xacNhan} onChange={e => setXacNhan(e.target.value)} />
                {msg && <p style={{ textAlign: 'center', color: msg.includes('✅') ? '#059669' : '#dc2626' }}>{msg}</p>}
                <div style={s.btnRow}>
                    <button style={s.btnCancel} onClick={onClose}>Hủy</button>
                    <button style={s.btnSave} onClick={handleDoiMatKhau} disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    )
}

const s = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    },
    modal: {
        background: '#fff', borderRadius: 16, padding: 24, width: '90%', maxWidth: 360,
        display: 'flex', flexDirection: 'column', gap: 12
    },
    title: { margin: 0, textAlign: 'center', color: '#374151' },
    input: {
        padding: '12px 16px', fontSize: 16, borderRadius: 10,
        border: '2px solid #e5e7eb', outline: 'none'
    },
    btnRow: { display: 'flex', gap: 8 },
    btnCancel: {
        flex: 1, padding: 12, borderRadius: 10, border: '2px solid #e5e7eb',
        background: '#fff', cursor: 'pointer', fontSize: 15
    },
    btnSave: {
        flex: 1, padding: 12, borderRadius: 10, border: 'none',
        background: '#f59e0b', color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 'bold'
    },
}