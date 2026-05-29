import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function LichSu() {
    const { token } = useAuth()
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
        <div style={s.wrap}>
            {/* Bộ lọc */}
            <div style={s.filterBox}>
                <div style={s.filterRow}>
                    <label style={s.label}>Từ ngày:</label>
                    <input type="date" value={tuNgay} onChange={e => setTuNgay(e.target.value)} style={s.dateInput} />
                </div>
                <div style={s.filterRow}>
                    <label style={s.label}>Đến ngày:</label>
                    <input type="date" value={denNgay} onChange={e => setDenNgay(e.target.value)} style={s.dateInput} />
                </div>
                <div style={s.filterRow}>
                    <label style={s.label}>Nhân viên:</label>
                    <select value={locNV} onChange={e => setLocNV(e.target.value)} style={s.dateInput}>
                        <option value="">Tất cả</option>
                        {nhanViens.map(nv => <option key={nv.id} value={nv.id}>{nv.ten}</option>)}
                    </select>
                </div>
                <button style={s.btnLoad} onClick={loadLichSu} disabled={loading}>
                    {loading ? 'Đang tải...' : '🔍 Lọc'}
                </button>
            </div>

            {/* Danh sách */}
            {lichSu.length === 0
                ? <p style={{ textAlign: 'center', color: '#9ca3af' }}>Không có dữ liệu</p>
                : lichSu.map((ca, i) => (
                    <div key={i} style={s.caCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={s.ngay}>📅 {ca.ngay}</div>
                                <div style={s.info}>
                                    {ca.loai_ca === 'sang' ? '☀️ Ca Sáng' : '🌙 Ca Chiều'} — {ca.nhan_vien}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={s.dt}>{Number(ca.tong_doanh_thu).toLocaleString('vi-VN')}đ</div>
                                <div style={s.badge}>✅ Hoàn thành</div>
                            </div>
                        </div>
                        <div style={s.moneyRow}>
                            <span>🛵 {Number(ca.grab || 0).toLocaleString('vi-VN')}đ</span>
                            <span>🏦 {Number(ca.chuyen_khoan || 0).toLocaleString('vi-VN')}đ</span>
                            <span>💵 {Number(ca.tien_mat || 0).toLocaleString('vi-VN')}đ</span>
                            <span style={{ color: Number(ca.thieu_du || 0) >= 0 ? '#059669' : '#dc2626', fontWeight: 'bold' }}>
                                {Number(ca.thieu_du || 0) >= 0 ? 'Dư' : 'Thiếu'}: {Math.abs(Number(ca.thieu_du || 0)).toLocaleString('vi-VN')}đ
                            </span>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

const s = {
    wrap: { padding: '0 0 24px' },
    filterBox: {
        background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end'
    },
    filterRow: { display: 'flex', flexDirection: 'column', gap: 4 },
    label: { fontSize: 13, color: '#6b7280', fontWeight: 'bold' },
    dateInput: { padding: '8px 12px', fontSize: 15, borderRadius: 8, border: '2px solid #e5e7eb' },
    btnLoad: {
        padding: '8px 20px', fontSize: 15, borderRadius: 8, border: 'none',
        background: '#7c3aed', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
    },
    caCard: {
        background: '#fff', borderRadius: 12, padding: 16, marginBottom: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    ngay: { fontWeight: 'bold', fontSize: 16, color: '#374151' },
    info: { color: '#6b7280', fontSize: 14, marginTop: 2 },
    dt: { fontWeight: 'bold', fontSize: 18, color: '#dc2626' },
    badge: { fontSize: 12, color: '#059669', marginTop: 4 },
    moneyRow: {
        display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10,
        paddingTop: 10, borderTop: '1px solid #f3f4f6', fontSize: 13, color: '#374151'
    },
}