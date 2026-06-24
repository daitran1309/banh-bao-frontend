import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import DoiMatKhau from '../components/DoiMatKhau'
import { Camera, Save } from 'lucide-react'

const API = import.meta.env.VITE_API_URL

export default function CaNhan() {
    const { user, token } = useAuth()
    const [ten, setTen] = useState(user.ten)
    const [avatarBase64, setAvatarBase64] = useState('')
    const [previewUrl, setPreviewUrl] = useState(user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${API}${user.avatar}`) : '')
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState('')
    const fileInputRef = useRef()

    function handleFileChange(e) {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            alert('Ảnh quá lớn. Vui lòng chọn ảnh < 5MB')
            return
        }
        const reader = new FileReader()
        reader.onload = (ev) => {
            setAvatarBase64(ev.target.result)
            setPreviewUrl(ev.target.result)
        }
        reader.readAsDataURL(file)
    }

    async function handleSave() {
        setSaving(true)
        setMsg('')
        try {
            const res = await axios.put(`${API}/api/auth/cap-nhat-thong-tin`, {
                id: user.id,
                ten: ten,
                avatarBase64: avatarBase64 || undefined
            }, { headers: { Authorization: `Bearer ${token}` } })
            
            setMsg('✅ Cập nhật thành công. Vui lòng tải lại trang để thấy thay đổi.')
            // Ideally we'd update AuthContext user here, but a reload is safe.
            setTimeout(() => window.location.reload(), 1500)
        } catch (e) {
            setMsg('❌ Lỗi: ' + (e.response?.data?.error || e.message))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ marginBottom: 24, color: 'var(--primary)' }}>👤 Thông tin cá nhân</h2>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ position: 'relative' }}>
                    {previewUrl ? (
                        <img src={previewUrl} alt="Avatar" style={s.avatar} />
                    ) : (
                        <div style={s.avatarPlaceholder}>Chưa có ảnh</div>
                    )}
                    <button 
                        style={s.cameraBtn}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <Camera size={18} />
                    </button>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange}
                    />
                </div>

                <div style={{ width: '100%', marginTop: 16 }}>
                    <label style={s.label}>Họ và tên</label>
                    <input 
                        className="input-field" 
                        value={ten} 
                        onChange={e => setTen(e.target.value)}
                    />
                </div>

                {msg && <p style={{ color: msg.includes('✅') ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{msg}</p>}

                <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: 8 }}
                    onClick={handleSave}
                    disabled={saving}
                >
                    <Save size={18}/> {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
            </div>

            <div style={{ marginTop: 32 }}>
                <h3 style={{ marginBottom: 16, color: 'var(--text-main)' }}>🔒 Bảo mật</h3>
                <div className="card">
                    {/* Reuse DoiMatKhau without modal wrapper, or just render it inline */}
                    {/* Since DoiMatKhau is designed as a modal, let's wrap it nicely */}
                    <div style={{ padding: 16, border: '1px solid var(--gray-200)', borderRadius: 12 }}>
                        <DoiMatKhau inline={true} />
                    </div>
                </div>
            </div>
        </div>
    )
}

const s = {
    avatar: {
        width: 120, height: 120, borderRadius: '50%', objectFit: 'cover',
        border: '4px solid var(--primary-light)'
    },
    avatarPlaceholder: {
        width: 120, height: 120, borderRadius: '50%', background: 'var(--gray-200)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
    },
    cameraBtn: {
        position: 'absolute', bottom: 0, right: 0,
        width: 36, height: 36, borderRadius: '50%',
        background: 'var(--primary)', color: '#fff', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    },
    label: {
        display: 'block', fontSize: 14, fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: 8
    }
}
