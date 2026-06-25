import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { StaggerContainer, BubbleItem } from '../components/BubbleAnimation'
import ChiTietCaModal from '../components/ChiTietCaModal'
import { AnimatePresence } from 'framer-motion'

const API = import.meta.env.VITE_API_URL

export default function LichSu() {
    const { token, user } = useAuth()
    const [expandedId, setExpandedId] = useState(null)
    const [lichSu, setLichSu] = useState([])
    const [nhanViens, setNhanViens] = useState([])
    const [locNV, setLocNV] = useState('')
    const [tuNgay, setTuNgay] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 7)
        return d.toISOString().split('T')[0]
    })
    const [denNgay, setDenNgay] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(false)
    const headers = { Authorization: `Bearer ${token}` }

    useEffect(() => {
        axios.get(`${API}/api/auth/danh-sach`, { headers }).then(r => setNhanViens(r.data))
        loadLichSu()
    }, [])

    async function loadLichSu() {
        setLoading(true)
        try {
            const params = new URLSearchParams({ tu_ngay: tuNgay, den_ngay: denNgay })
            if (locNV) params.append('nhan_vien_id', locNV)
            const res = await axios.get(`${API}/api/baocao/lich-su?${params}`, { headers })
            setLichSu(res.data)
        } finally { setLoading(false) }
    }

    return (
        <StaggerContainer delay={0.1} style={s.wrap}>
            {/* Bộ lọc */}
            <BubbleItem className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', marginBottom: 24, padding: 20 }}>
                <div style={s.filterRow}>
                    <label style={s.label}>Từ ngày:</label>
                    <input type="date" value={tuNgay} onChange={e => setTuNgay(e.target.value)} className="input-field" style={{ width: 'auto' }} />
                </div>
                <div style={s.filterRow}>
                    <label style={s.label}>Đến ngày:</label>
                    <input type="date" value={denNgay} onChange={e => setDenNgay(e.target.value)} className="input-field" style={{ width: 'auto' }} />
                </div>
                <div style={s.filterRow}>
                    <label style={s.label}>Nhân viên:</label>
                    <select value={locNV} onChange={e => setLocNV(e.target.value)} className="input-field select-field" style={{ width: 'auto' }}>
                        <option value="">Tất cả</option>
                        {nhanViens.map(nv => <option key={nv.id} value={nv.id}>{nv.ten}</option>)}
                    </select>
                </div>
                <button className="btn btn-primary" onClick={loadLichSu} disabled={loading} style={{ padding: '12px 24px' }}>
                    {loading ? 'Đang tải...' : '🔍 Lọc dữ liệu'}
                </button>
            </BubbleItem>

            {/* Danh sách */}
            {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }} className="animate-fade-in">Đang tải dữ liệu lịch sử...</p>
            ) : lichSu.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }} className="animate-fade-in">Không có dữ liệu trong khoảng thời gian này</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {lichSu.map((ca, i) => (
                        <BubbleItem 
                            key={i} 
                            delay={(i % 5) * 0.1}
                            className="card"
                            style={{ ...s.caCard, padding: 0, marginBottom: 0, overflow: 'hidden' }} 
                        >
                            <div 
                                style={{ padding: '20px 24px', cursor: 'pointer', transition: 'background 0.2s', background: expandedId === ca.id ? 'rgba(255,255,255,0.03)' : 'transparent' }} 
                                onClick={() => setExpandedId(expandedId === ca.id ? null : ca.id)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={s.ngay}>📅 {ca.ngay}</div>
                                        <div style={s.info}>
                                            <span style={{ color: ca.loai_ca === 'sang' ? 'var(--warning)' : 'var(--accent)' }}>
                                                {ca.loai_ca === 'sang' ? '☀️ Ca Sáng' : '🌙 Ca Chiều'}
                                            </span>
                                            <span style={{ margin: '0 8px', color: 'var(--gray-200)' }}>|</span>
                                            <span style={{ color: 'var(--text-main)' }}>{ca.nhan_vien}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={s.dt}>{Number(ca.tong_doanh_thu).toLocaleString('vi-VN')}đ</div>
                                        <div className="badge" style={{ background: 'var(--success-bg)', color: 'var(--success)', marginTop: 8 }}>✅ Đã chốt</div>
                                    </div>
                                </div>
                                <div style={s.moneyRow}>
                                    <span style={s.moneyItem}>🛵 {Number(ca.grab || 0).toLocaleString('vi-VN')}đ</span>
                                    <span style={s.moneyItem}>🏦 {Number(ca.chuyen_khoan || 0).toLocaleString('vi-VN')}đ</span>
                                    <span style={s.moneyItem}>💵 {Number(ca.tien_mat || 0).toLocaleString('vi-VN')}đ</span>
                                    <span style={{ 
                                        ...s.moneyItem,
                                        background: Number(ca.thieu_du || 0) >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                                        color: Number(ca.thieu_du || 0) >= 0 ? 'var(--success)' : 'var(--danger)',
                                        border: 'none',
                                        fontWeight: '700'
                                    }}>
                                        {Number(ca.thieu_du || 0) >= 0 ? 'Dư' : 'Thiếu'}: {Math.abs(Number(ca.thieu_du || 0)).toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                            </div>
                            
                            <AnimatePresence>
                                {expandedId === ca.id && (
                                    <ChiTietCaModal 
                                        caId={ca.id} 
                                        user={user} 
                                        token={token} 
                                        inline={true} 
                                        onClose={(changed) => {
                                            if (changed) loadLichSu();
                                            setExpandedId(null);
                                        }} 
                                    />
                                )}
                            </AnimatePresence>
                        </BubbleItem>
                    ))}
                </div>
            )}
        </StaggerContainer>
    )
}

const s = {
    wrap: { padding: '0 0 24px' },
    filterRow: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: { fontSize: 13, color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    caCard: {
        transition: 'var(--transition)'
    },
    ngay: { fontWeight: '700', fontSize: 18, color: 'var(--text-main)' },
    info: { fontSize: 14, marginTop: 6, fontWeight: '600' },
    dt: { fontWeight: '800', fontSize: 20, color: 'var(--primary)', textShadow: '0 0 15px rgba(108, 93, 211, 0.4)' },
    moneyRow: {
        display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16,
        paddingTop: 16, borderTop: '1px solid var(--gray-200)', fontSize: 13
    },
    moneyItem: {
        border: '1px solid var(--gray-200)',
        padding: '6px 12px',
        borderRadius: 8,
        color: 'var(--text-muted)',
        fontWeight: '500'
    }
}