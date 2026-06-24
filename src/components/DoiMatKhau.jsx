import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { X, Check } from 'lucide-react'

const API = import.meta.env.VITE_API_URL

export default function DoiMatKhau({ onClose, inline = false }) {
    const { user, token } = useAuth()
    const [mkCu, setMkCu] = useState('')
    const [mkMoi, setMkMoi] = useState('')
    const [msg, setMsg] = useState('')

    async function handleLuu() {
        if (!mkCu || !mkMoi) return setMsg('Vui lòng nhập đủ thông tin')
        if (mkMoi.length < 3) return setMsg('Mật khẩu mới quá ngắn')
        try {
            await axios.put(`${API}/api/auth/cap-nhat-thong-tin`, {
                id: user.id,
                mat_khau_cu: mkCu,
                mat_khau_moi: mkMoi
            }, { headers: { Authorization: `Bearer ${token}` } })
            setMsg('✅ Đổi mật khẩu thành công!')
            setMkCu(''); setMkMoi('')
            if (!inline && onClose) setTimeout(onClose, 1500)
        } catch (e) {
            setMsg(e.response?.data?.error || 'Lỗi hệ thống')
        }
    }

    const content = (
        <div style={inline ? s.inlineContainer : s.modal}>
            {!inline && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={s.title}>Đổi mật khẩu</h3>
                    <button onClick={onClose} style={s.closeBtn}><X size={20}/></button>
                </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input 
                    type="password" placeholder="Mật khẩu hiện tại" 
                    value={mkCu} onChange={e => setMkCu(e.target.value)}
                    style={s.input}
                />
                <input 
                    type="password" placeholder="Mật khẩu mới" 
                    value={mkMoi} onChange={e => setMkMoi(e.target.value)}
                    style={s.input}
                />
                {msg && <p style={{ textAlign: 'center', color: msg.includes('✅') ? 'var(--success)' : 'var(--danger)' }}>{msg}</p>}
                
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    {!inline && <button onClick={onClose} style={s.btnHuy}>Hủy</button>}
                    <button onClick={handleLuu} style={s.btnLuu}><Check size={18}/> Cập nhật</button>
                </div>
            </div>
        </div>
    )

    if (inline) return content;

    return (
        <div style={s.overlay}>
            {content}
        </div>
    )
}

const s = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
    },
    modal: {
        background: '#fff', borderRadius: 16, padding: 24, width: '90%', maxWidth: 360,
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    },
    inlineContainer: {
        width: '100%', background: 'transparent'
    },
    title: { margin: 0, textAlign: 'center', color: 'var(--text-main)' },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' },
    input: {
        padding: '12px 16px', borderRadius: 8, fontSize: 15,
        border: '2px solid var(--gray-200)', outline: 'none'
    },
    btnHuy: {
        flex: 1, padding: 12, borderRadius: 10, border: '2px solid var(--gray-200)',
        background: '#fff', cursor: 'pointer', fontSize: 15
    },
    btnLuu: {
        flex: 1, padding: 12, borderRadius: 10, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 'bold'
    }
}