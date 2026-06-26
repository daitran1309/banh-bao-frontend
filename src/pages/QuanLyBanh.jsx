import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Plus, Edit2, EyeOff, Eye } from 'lucide-react'
import { StaggerContainer, BubbleItem } from '../components/BubbleAnimation'

const API = import.meta.env.VITE_API_URL

export default function QuanLyBanh() {
    const { token } = useAuth()
    const [banhs, setBanhs] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ ten_banh: '', gia: '', so_cai_moi_bich: '', hinh_anh: '', hinhAnhBase64: '' })
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
        setForm(banh ? { ten_banh: banh.ten_banh, gia: banh.gia, so_cai_moi_bich: banh.so_cai_moi_bich, hinh_anh: banh.hinh_anh || '', hinhAnhBase64: '' } : { ten_banh: '', gia: '', so_cai_moi_bich: '', hinh_anh: '', hinhAnhBase64: '' })
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
        <StaggerContainer delay={0.1} style={s.wrap}>
            <BubbleItem className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '20px 24px' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>🥟</span> Quản lý loại bánh
                </h3>
                <button className="btn btn-primary" onClick={() => moForm()}>
                    <Plus size={18} /> Thêm bánh mới
                </button>
            </BubbleItem>

            {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }} className="animate-fade-in">Đang tải dữ liệu bánh...</p>
            ) : banhs.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }} className="animate-fade-in">Chưa có dữ liệu bánh</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {banhs.map((b, i) => (
                        <BubbleItem key={i} delay={(i % 5) * 0.1} className="card" style={{ ...s.banhCard, opacity: b.trang_thai === 'inactive' ? 0.6 : 1, marginBottom: 0 }}>
                            {b.hinh_anh ? (
                                <div style={{ width: 48, height: 48, borderRadius: 12, marginRight: 16, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--gray-200)', background: 'var(--white)' }}>
                                    <img src={b.hinh_anh} alt={b.ten_banh} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ) : (
                                <div style={{ width: 48, height: 48, borderRadius: 12, marginRight: 16, background: 'rgba(108, 93, 211, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(108, 93, 211, 0.2)', color: 'var(--primary)', fontSize: 24 }}>
                                    🥟
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={s.banhName}>
                                    {b.ten_banh}
                                    {b.trang_thai === 'inactive' && <span className="badge" style={s.inactiveBadge}>Đã ẩn</span>}
                                </div>
                                <div style={s.banhInfo}>
                                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{Number(b.gia).toLocaleString('vi-VN')}đ</span>
                                    <span style={{ margin: '0 8px', color: 'var(--gray-200)' }}>|</span>
                                    <span>📦 {b.so_cai_moi_bich} cái/bịch</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-outline" style={s.actionBtn} onClick={() => moForm(b)} title="Sửa">
                                    <Edit2 size={16} />
                                </button>
                                {b.trang_thai === 'active'
                                    ? <button className="btn btn-outline" style={{ ...s.actionBtn, borderColor: 'rgba(255,77,79,0.3)', color: 'var(--danger)' }} onClick={() => handleAn(b)} title="Ẩn">
                                        <EyeOff size={16} />
                                    </button>
                                    : <button className="btn btn-outline" style={{ ...s.actionBtn, borderColor: 'rgba(74,222,128,0.3)', color: 'var(--success)' }} onClick={() => handleHienLai(b)} title="Hiện">
                                        <Eye size={16} />
                                    </button>
                                }
                            </div>
                        </BubbleItem>
                    ))}
                </div>
            )}

            {/* Form thêm/sửa */}
            {showForm && (
                <div className="modal-overlay animate-fade-in" style={s.overlay}>
                    <div className="modal-content animate-pop-in" style={s.modal}>
                        <h3 style={{ margin: '0 0 20px', textAlign: 'center', color: 'var(--text-main)', fontSize: '1.4rem' }}>
                            {editing ? '✏️ Sửa thông tin bánh' : '➕ Thêm bánh mới'}
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={s.formLabel}>Tên bánh</label>
                                <input className="input-field" placeholder="Nhập tên bánh..." value={form.ten_banh}
                                    onChange={e => setForm({ ...form, ten_banh: e.target.value })} />
                            </div>
                            <div>
                                <label style={s.formLabel}>Giá bán (VNĐ)</label>
                                <input className="input-field" type="number" placeholder="Ví dụ: 15000" value={form.gia}
                                    onChange={e => setForm({ ...form, gia: e.target.value })} />
                            </div>
                            <div>
                                <label style={s.formLabel}>Số lượng cái/bịch</label>
                                <input className="input-field" type="number" placeholder="Ví dụ: 10" value={form.so_cai_moi_bich}
                                    onChange={e => setForm({ ...form, so_cai_moi_bich: e.target.value })} />
                            </div>
                            
                            <div>
                                <label style={s.formLabel}>Hình ảnh minh họa</label>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    {(form.hinhAnhBase64 || form.hinh_anh) && (
                                        <div style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--gray-200)', flexShrink: 0 }}>
                                            <img src={form.hinhAnhBase64 || form.hinh_anh} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <input className="input-field" placeholder="Dán URL hình ảnh..." value={form.hinh_anh}
                                            onChange={e => setForm({ ...form, hinh_anh: e.target.value, hinhAnhBase64: '' })} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Hoặc tải ảnh lên:</span>
                                            <input type="file" accept="image/*" onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setForm({ ...form, hinhAnhBase64: reader.result, hinh_anh: '' });
                                                    reader.readAsDataURL(file);
                                                }
                                            }} style={{ fontSize: 13 }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {msg && <div style={{ 
                            marginTop: 16, padding: 12, borderRadius: 8, textAlign: 'center', fontWeight: 'bold',
                            background: msg.includes('✅') ? 'var(--success-bg)' : 'var(--danger-bg)',
                            color: msg.includes('✅') ? 'var(--success)' : 'var(--danger)'
                        }}>{msg}</div>}

                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Hủy</button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleLuu} disabled={loading}>
                                {loading ? 'Đang lưu...' : '💾 Lưu lại'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </StaggerContainer>
    )
}

const s = {
    wrap: { padding: '0 0 24px' },
    banhCard: {
        display: 'flex', alignItems: 'center', padding: '20px'
    },
    banhName: { fontWeight: '700', fontSize: 18, color: 'var(--text-main)', marginBottom: 8, display: 'flex', alignItems: 'center' },
    banhInfo: { fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' },
    inactiveBadge: {
        marginLeft: 10, fontSize: 11, background: 'var(--danger-bg)', color: 'var(--danger)',
        padding: '4px 10px', textTransform: 'uppercase'
    },
    actionBtn: {
        padding: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    overlay: {
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
    },
    modal: {
        width: '100%', maxWidth: 420, padding: 32,
    },
    formLabel: {
        display: 'block', marginBottom: 8, color: 'var(--text-muted)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5
    }
}