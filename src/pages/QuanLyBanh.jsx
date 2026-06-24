import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function QuanLyBanh() {
    const { token } = useAuth()
    const [banhs, setBanhs] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ ten_banh: '', gia: '', so_cai_moi_bich: '' })
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const headers = { Authorization: `Bearer ${token}` }

    useEffect(() => { loadBanhs() }, [])

    async function loadBanhs() {
        const res = await axios.get(`${API}/api/banh/tat-ca`, { headers })
        setBanhs(res.data)
    }

    function moForm(banh = null) {
        setEditing(banh)
        setForm(banh ? { ten_banh: banh.ten_banh, gia: banh.gia, so_cai_moi_bich: banh.so_cai_moi_bich } : { ten_banh: '', gia: '', so_cai_moi_bich: '' })
        setShowForm(true)
        setMsg('')
    }

    async function handleLuu() {
        if (!form.ten_banh || !form.gia || !form.so_cai_moi_bich) return setMsg('❌ Điền đầy đủ thông tin!')
        setLoading(true); setMsg('')
        try {
            if (editing) {
                await axios.put(`${API}/api/banh/${editing.id}`,
                    { ...form, trang_thai: editing.trang_thai }, { headers })
            } else {
                await axios.post(`${API}/api/banh`, form, { headers })
            }
            setMsg('✅ Lưu thành công!')
            await loadBanhs()
            setTimeout(() => { setShowForm(false); setMsg('') }, 1000)
        } catch (e) { setMsg(e.response?.data?.error || '❌ Lỗi!') }
        finally { setLoading(false) }
    }

    async function handleAn(banh) {
        if (!window.confirm(`Ẩn bánh "${banh.ten_banh}"?`)) return
        await axios.delete(`${API}/api/banh/${banh.id}`, { headers })
        loadBanhs()
    }

    async function handleHienLai(banh) {
        await axios.put(`${API}/api/banh/${banh.id}`,
            { ten_banh: banh.ten_banh, gia: banh.gia, so_cai_moi_bich: banh.so_cai_moi_bich, trang_thai: 'active' },
            { headers })
        loadBanhs()
    }

    return (
        <div style={s.wrap} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }} className="animate-slide-up">
                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>🥟 Quản lý loại bánh</h3>
                <button style={s.btnAdd} onClick={() => moForm()}>+ Thêm bánh</button>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }} className="animate-fade-in">Đang tải dữ liệu...</p>
            ) : banhs.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }} className="animate-fade-in">Chưa có dữ liệu bánh</p>
            ) : (
                banhs.map((b, i) => (
                    <div key={i} style={{ ...s.banhCard, opacity: b.trang_thai === 'inactive' ? 0.6 : 1 }} className={`animate-slide-up stagger-${(i % 5) + 1}`}>
                        <div style={{ flex: 1 }}>
                            <div style={s.banhName}>
                                {b.ten_banh}
                                {b.trang_thai === 'inactive' && <span style={s.inactiveBadge}>Ẩn</span>}
                            </div>
                            <div style={s.banhInfo}>
                                💰 {Number(b.gia).toLocaleString('vi-VN')}đ &nbsp;|&nbsp;
                                📦 {b.so_cai_moi_bich} cái/bịch
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button style={s.btnEdit} onClick={() => moForm(b)}>✏️</button>
                            {b.trang_thai === 'active'
                                ? <button style={s.btnHide} onClick={() => handleAn(b)}>🙈</button>
                                : <button style={s.btnShow} onClick={() => handleHienLai(b)}>👁️</button>
                            }
                        </div>
                    </div>
                ))
            )}

            {/* Form thêm/sửa */}
            {showForm && (
                <div style={s.overlay} className="animate-fade-in">
                    <div style={s.modal} className="animate-slide-up">
                        <h3 style={{ margin: '0 0 12px', textAlign: 'center' }}>
                            {editing ? '✏️ Sửa bánh' : '➕ Thêm bánh mới'}
                        </h3>
                        <input style={s.input} placeholder="Tên bánh" value={form.ten_banh}
                            onChange={e => setForm({ ...form, ten_banh: e.target.value })} />
                        <input style={s.input} type="number" placeholder="Giá (VD: 15000)" value={form.gia}
                            onChange={e => setForm({ ...form, gia: e.target.value })} />
                        <input style={s.input} type="number" placeholder="Số cái mỗi bịch" value={form.so_cai_moi_bich}
                            onChange={e => setForm({ ...form, so_cai_moi_bich: e.target.value })} />
                        {msg && <p style={{ textAlign: 'center', color: msg.includes('✅') ? 'var(--success)' : 'var(--danger)' }}>{msg}</p>}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button style={s.btnCancel} onClick={() => setShowForm(false)}>Hủy</button>
                            <button style={s.btnSave} onClick={handleLuu} disabled={loading}>
                                {loading ? 'Đang lưu...' : '💾 Lưu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const s = {
    wrap: { padding: '0 0 24px' },
    btnAdd: {
        padding: '8px 16px', borderRadius: 8, border: 'none',
        background: 'var(--success)', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: 15
    },
    banhCard: {
        background: '#fff', borderRadius: 12, padding: 16, marginBottom: 10,
        border: '2px solid var(--gray-200)', display: 'flex', alignItems: 'center'
    },
    banhName: { fontWeight: 'bold', fontSize: 16, color: 'var(--text-main)', marginBottom: 4 },
    banhInfo: { fontSize: 14, color: 'var(--text-muted)' },
    inactiveBadge: {
        marginLeft: 8, fontSize: 12, background: 'var(--danger-bg)', color: 'var(--danger)',
        padding: '2px 8px', borderRadius: 20
    },
    btnEdit: {
        padding: '6px 10px', borderRadius: 8, border: '2px solid var(--gray-200)',
        background: '#fff', cursor: 'pointer', fontSize: 16
    },
    btnHide: {
        padding: '6px 10px', borderRadius: 8, border: '2px solid var(--danger-bg)',
        background: '#fff', cursor: 'pointer', fontSize: 16
    },
    btnShow: {
        padding: '6px 10px', borderRadius: 8, border: '2px solid var(--success-bg)',
        background: '#fff', cursor: 'pointer', fontSize: 16
    },
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
    },
    modal: {
        background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360,
        display: 'flex', flexDirection: 'column', gap: 12
    },
    input: { padding: '12px 16px', fontSize: 16, borderRadius: 10, border: '2px solid var(--gray-200)' },
    btnCancel: {
        flex: 1, padding: 12, borderRadius: 10, border: '2px solid var(--gray-200)',
        background: '#fff', cursor: 'pointer', fontSize: 15
    },
    btnSave: {
        flex: 1, padding: 12, borderRadius: 10, border: 'none',
        background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 'bold'
    },
}