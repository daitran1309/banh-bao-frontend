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
        <div style={inline ? s.inlineContainer : s.modal} className={!inline ? "modal-content animate-pop-in" : ""}>
            {!inline && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={s.title}>Đổi mật khẩu</h3>
                    <button onClick={onClose} style={s.closeBtn} className="btn btn-ghost"><X size={20}/></button>
                </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: '600', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Mật khẩu hiện tại</label>
                    <input 
                        type="password" placeholder="Nhập mật khẩu cũ..." 
                        value={mkCu} onChange={e => setMkCu(e.target.value)}
                        className="input-field"
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: '600', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Mật khẩu mới</label>
                    <input 
                        type="password" placeholder="Nhập mật khẩu mới..." 
                        value={mkMoi} onChange={e => setMkMoi(e.target.value)}
                        className="input-field"
                    />
                </div>
                {msg && <div style={{ 
                    padding: 12, borderRadius: 8, textAlign: 'center', fontWeight: 'bold',
                    background: msg.includes('✅') ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color: msg.includes('✅') ? 'var(--success)' : 'var(--danger)'
                 }}>{msg}</div>}
                
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    {!inline && <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Hủy</button>}
                    <button onClick={handleLuu} className="btn btn-primary" style={{ flex: inline ? undefined : 1, width: inline ? '100%' : undefined }}><Check size={18}/> Cập nhật mật khẩu</button>
                </div>
            </div>
        </div>
    )

    if (inline) return content;

    return (
        <div className="modal-overlay animate-fade-in" style={s.overlay}>
            {content}
        </div>
    )
}

const s = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
    },
    modal: {
        width: '100%', maxWidth: 400, padding: 32
    },
    inlineContainer: {
        width: '100%', background: 'transparent'
    },
    title: { margin: 0, textAlign: 'center', color: 'var(--text-main)', fontSize: 24 },
    closeBtn: { padding: 4 }
}