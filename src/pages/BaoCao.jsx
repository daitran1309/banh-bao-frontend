import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'

const API = import.meta.env.VITE_API_URL

export default function BaoCao() {
    const { token } = useAuth()
    const [tuNgay, setTuNgay] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 7)
        return d.toISOString().split('T')[0]
    })
    const [denNgay, setDenNgay] = useState(new Date().toISOString().split('T')[0])
    const [data, setData] = useState(null)
    const [soSanh, setSoSanh] = useState(null)
    const [loading, setLoading] = useState(false)
    const headers = { Authorization: `Bearer ${token}` }

    useEffect(() => { loadData() }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [r1, r2] = await Promise.all([
                axios.get(`${API}/api/baocao/theo-ngay?tu_ngay=${tuNgay}&den_ngay=${denNgay}`, { headers }),
                axios.get(`${API}/api/baocao/so-sanh?tu_ngay=${tuNgay}&den_ngay=${denNgay}`, { headers })
            ])
            setData(r1.data)
            setSoSanh(r2.data)
        } finally { setLoading(false) }
    }

    const chartData = data?.theo_ngay?.map(d => ({
        ngay: d.ngay.slice(5),
        'Doanh thu': d.doanh_thu
    })) || []

    return (
        <div style={s.wrap}>
            {/* Bộ lọc ngày */}
            <div style={s.filterBox}>
                <div style={s.filterRow}>
                    <label style={s.label}>Từ ngày:</label>
                    <input type="date" value={tuNgay} onChange={e => setTuNgay(e.target.value)} style={s.dateInput} />
                </div>
                <div style={s.filterRow}>
                    <label style={s.label}>Đến ngày:</label>
                    <input type="date" value={denNgay} onChange={e => setDenNgay(e.target.value)} style={s.dateInput} />
                </div>
                <button style={s.btnLoad} onClick={loadData} disabled={loading}>
                    {loading ? 'Đang tải...' : '🔍 Xem'}
                </button>
            </div>

            {data && <>
                {/* Tổng quan */}
                <div style={s.summaryRow}>
                    <div style={{ ...s.summaryCard, background: '#f59e0b' }}>
                        <div style={s.summaryLabel}>Tổng doanh thu</div>
                        <div style={s.summaryVal}>{data.tong_doanh_thu.toLocaleString('vi-VN')}đ</div>
                    </div>
                    <div style={{ ...s.summaryCard, background: '#7c3aed' }}>
                        <div style={s.summaryLabel}>Số ca đã làm</div>
                        <div style={s.summaryVal}>{data.tong_ca} ca</div>
                    </div>
                </div>

                {/* Biểu đồ doanh thu */}
                <div style={s.card}>
                    <h3 style={s.cardTitle}>📈 Doanh thu theo ngày</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="ngay" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v / 1000) + 'k'} />
                            <Tooltip formatter={v => v.toLocaleString('vi-VN') + 'đ'} />
                            <Line type="monotone" dataKey="Doanh thu" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* So sánh ca */}
                {soSanh && (
                    <div style={s.card}>
                        <h3 style={s.cardTitle}>⚖️ So sánh Ca Sáng vs Ca Chiều</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={[
                                { name: '☀️ Ca Sáng', 'Doanh thu': soSanh.sang.tong_dt, 'TB/ca': soSanh.sang.tb_moi_ca },
                                { name: '🌙 Ca Chiều', 'Doanh thu': soSanh.chieu.tong_dt, 'TB/ca': soSanh.chieu.tb_moi_ca },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={v => (v / 1000) + 'k'} />
                                <Tooltip formatter={v => v.toLocaleString('vi-VN') + 'đ'} />
                                <Legend />
                                <Bar dataKey="Doanh thu" fill="#f59e0b" />
                                <Bar dataKey="TB/ca" fill="#7c3aed" />
                            </BarChart>
                        </ResponsiveContainer>
                        <div style={s.soSanhRow}>
                            <div style={s.soSanhCard}>
                                <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>☀️ Ca Sáng</div>
                                <div>{soSanh.sang.so_ca} ca</div>
                                <div style={{ color: '#dc2626' }}>{soSanh.sang.tong_dt.toLocaleString('vi-VN')}đ</div>
                                <div style={{ fontSize: 13, color: '#6b7280' }}>TB: {soSanh.sang.tb_moi_ca.toLocaleString('vi-VN')}đ/ca</div>
                            </div>
                            <div style={s.soSanhCard}>
                                <div style={{ color: '#7c3aed', fontWeight: 'bold' }}>🌙 Ca Chiều</div>
                                <div>{soSanh.chieu.so_ca} ca</div>
                                <div style={{ color: '#dc2626' }}>{soSanh.chieu.tong_dt.toLocaleString('vi-VN')}đ</div>
                                <div style={{ fontSize: 13, color: '#6b7280' }}>TB: {soSanh.chieu.tb_moi_ca.toLocaleString('vi-VN')}đ/ca</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bánh bán chạy */}
                <div style={s.card}>
                    <h3 style={s.cardTitle}>🏆 Bánh bán chạy</h3>
                    {data.theo_loai.slice(0, 10).map((b, i) => (
                        <div key={i} style={s.banhRow}>
                            <div style={s.rank}>{i + 1}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold' }}>{b.ten_banh}</div>
                                <div style={{ fontSize: 13, color: '#6b7280' }}>{b.tong_ban} cái</div>
                            </div>
                            <div style={{ color: '#dc2626', fontWeight: 'bold' }}>
                                {b.tong_dt.toLocaleString('vi-VN')}đ
                            </div>
                        </div>
                    ))}
                </div>
            </>}
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
        background: '#f59e0b', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
    },
    summaryRow: { display: 'flex', gap: 12, marginBottom: 16 },
    summaryCard: { flex: 1, borderRadius: 12, padding: 16, color: '#fff', textAlign: 'center' },
    summaryLabel: { fontSize: 13, opacity: 0.9 },
    summaryVal: { fontSize: 22, fontWeight: 'bold', marginTop: 4 },
    card: {
        background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    cardTitle: { margin: '0 0 12px', color: '#374151', fontSize: 16 },
    soSanhRow: { display: 'flex', gap: 12, marginTop: 12 },
    soSanhCard: { flex: 1, background: '#f9fafb', borderRadius: 10, padding: 12, textAlign: 'center', lineHeight: 1.8 },
    banhRow: {
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
        borderBottom: '1px solid #f3f4f6'
    },
    rank: {
        width: 28, height: 28, borderRadius: '50%', background: '#fef3c7',
        color: '#92400e', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
}