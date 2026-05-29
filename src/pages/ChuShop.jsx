import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function ChuShop() {
    const { user, token, logout } = useAuth()
    const [tab, setTab] = useState('baocao')
    const [baocao, setBaocao] = useState(null)
    const [loading, setLoading] = useState(false)
    const headers = { Authorization: `Bearer ${token}` }

    useEffect(() => { loadBaocao() }, [])

    async function loadBaocao() {
        setLoading(true)
        try {
            const res = await axios.get(`${API}/api/baocao/hom-nay`, { headers })
            setBaocao(res.data)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={s.page}>
            <div style={s.header}>
                <span>👑 {user.ten}</span>
                <button onClick={logout} style={s.logoutBtn}>Đăng xuất</button>
            </div>

            <div style={s.tabs}>
                <button style={tab === 'baocao' ? { ...s.tab, ...s.tabActive } : s.tab}
                    onClick={() => setTab('baocao')}>📊 Báo cáo</button>
                <button style={tab === 'ca' ? { ...s.tab, ...s.tabActive } : s.tab}
                    onClick={() => setTab('ca')}>📋 Quản lý ca</button>
            </div>

            {tab === 'baocao' && (
                <div>
                    <button style={s.refreshBtn} onClick={loadBaocao}>🔄 Làm mới</button>
                    {loading && <p style={{ textAlign: 'center' }}>Đang tải...</p>}
                    {baocao && (
                        <>
                            <div style={s.summaryCard}>
                                <div style={s.summaryLabel}>Tổng doanh thu hôm nay</div>
                                <div style={s.summaryValue}>
                                    {Number(baocao.tong_doanh_thu).toLocaleString('vi-VN')}đ
                                </div>
                                <div style={s.summaryLabel}>Tổng bán: {baocao.tong_ban} cái</div>
                            </div>

                            <h3 style={{ color: '#92400e' }}>Chi tiết theo loại bánh</h3>
                            {baocao.theo_loai.map((b, i) => (
                                <div key={i} style={s.banhCard}>
                                    <div style={s.banhName}>{b.ten_banh}</div>
                                    <div style={s.row}>
                                        <span>Đã bán:</span><strong>{b.ban} cái</strong>
                                    </div>
                                    <div style={s.row}>
                                        <span>Doanh thu:</span>
                                        <strong style={{ color: '#059669' }}>
                                            {Number(b.doanh_thu).toLocaleString('vi-VN')}đ
                                        </strong>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}

            {tab === 'ca' && (
                <div style={s.infoCard}>
                    <p>📌 Xem chi tiết ca trong Google Sheet</p>
                    <p style={{ color: '#6b7280', fontSize: 14 }}>
                        Tab CA và CHI_TIET_CA có đầy đủ dữ liệu từng ca.
                    </p>
                </div>
            )}
        </div>
    )
}

const s = {
    page: { maxWidth: 480, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#7c3aed', color: '#fff', padding: '12px 16px', borderRadius: 12, marginBottom: 16
    },
    logoutBtn: {
        background: 'rgba(0,0,0,0.2)', color: '#fff', border: 'none',
        borderRadius: 8, padding: '6px 12px', cursor: 'pointer'
    },
    tabs: { display: 'flex', gap: 8, marginBottom: 16 },
    tab: {
        flex: 1, padding: 12, fontSize: 15, borderRadius: 10,
        border: '2px solid #e5e7eb', background: '#fff', cursor: 'pointer'
    },
    tabActive: { border: '2px solid #7c3aed', background: '#f5f3ff' },
    refreshBtn: {
        width: '100%', padding: 12, marginBottom: 12, borderRadius: 10,
        border: '2px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 15
    },
    summaryCard: {
        background: '#7c3aed', color: '#fff', borderRadius: 16,
        padding: 24, textAlign: 'center', marginBottom: 16
    },
    summaryLabel: { fontSize: 14, opacity: 0.85 },
    summaryValue: { fontSize: 32, fontWeight: 'bold', margin: '8px 0' },
    banhCard: {
        background: '#fff', borderRadius: 12, padding: 16, marginBottom: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    banhName: { fontSize: 16, fontWeight: 'bold', color: '#7c3aed', marginBottom: 8 },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
    infoCard: {
        background: '#fff', borderRadius: 12, padding: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center'
    },
}