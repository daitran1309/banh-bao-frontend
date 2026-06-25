import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import DoiMatKhau from '../components/DoiMatKhau'
import { Camera, Save, User as UserIcon, Lock } from 'lucide-react'

const API = import.meta.env.VITE_API_URL

export default function CaNhan() {
    const { user, token, updateUser } = useAuth()
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
            
            updateUser(res.data.user)
            setMsg('✅ Cập nhật thành công!')
        } catch (e) {
            setMsg('❌ Lỗi: ' + (e.response?.data?.error || e.message))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 40 }} className="animate-fade-in">
            <h2 style={{ marginBottom: 24, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 8, background: 'rgba(108, 93, 211, 0.2)', borderRadius: 12, display: 'flex', color: 'var(--primary)' }}>
                    <UserIcon size={24} />
                </div>
                Thông tin cá nhân
            </h2>

            <div className="card animate-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: 32 }}>
                <div style={{ position: 'relative' }}>
                    {previewUrl ? (
                        <img src={previewUrl} alt="Avatar" style={s.avatar} />
                    ) : (
                        <div style={s.avatarPlaceholder}>
                            <UserIcon size={40} opacity={0.5} />
                        </div>
                    )}
                    <button 
                        style={s.cameraBtn}
                        onClick={() => fileInputRef.current.click()}
                        title="Đổi ảnh đại diện"
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

                <div style={{ width: '100%' }}>
                    <label style={s.label}>Họ và tên hiển thị</label>
                    <input 
                        className="input-field" 
                        value={ten} 
                        onChange={e => setTen(e.target.value)}
                        style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}
                    />
                </div>

                {msg && <div style={{ 
                    width: '100%', padding: 12, borderRadius: 8, textAlign: 'center', fontWeight: 'bold',
                    background: msg.includes('✅') ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color: msg.includes('✅') ? 'var(--success)' : 'var(--danger)'
                 }}>{msg}</div>}

                <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '14px' }}
                    onClick={handleSave}
                    disabled={saving}
                >
                    <Save size={18}/> {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
            </div>

            <div style={{ marginTop: 40 }} className="animate-slide-up stagger-1">
                <h3 style={{ marginBottom: 20, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: 8, background: 'rgba(255, 117, 216, 0.2)', borderRadius: 12, display: 'flex', color: 'var(--accent)' }}>
                        <Lock size={20} />
                    </div>
                    Bảo mật tài khoản
                </h3>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Reuse DoiMatKhau without modal wrapper, or just render it inline */}
                    <div style={{ padding: 32 }}>
                        <DoiMatKhau inline={true} />
                    </div>
                </div>
            </div>
        </div>
    )
}

const s = {
    avatar: {
        width: 130, height: 130, borderRadius: '50%', objectFit: 'cover',
        border: '4px solid var(--primary)',
        boxShadow: '0 0 20px rgba(108, 93, 211, 0.4)'
    },
    avatarPlaceholder: {
        width: 130, height: 130, borderRadius: '50%', border: '2px dashed var(--gray-200)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
    },
    cameraBtn: {
        position: 'absolute', bottom: 4, right: 4,
        width: 40, height: 40, borderRadius: '50%',
        background: 'var(--accent)', color: '#fff', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 4px 10px rgba(255, 117, 216, 0.5)',
        transition: 'transform 0.2s ease',
    },
    label: {
        display: 'block', fontSize: 13, fontWeight: '600', color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1
    }
}
