import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function NhanVien() {
    const { user, token, logout } = useAuth()
    const [step, setStep] = useState('chon_ca')   // chon_ca | dang_lam | ket_thuc
    const [loaiCa, setLoaiCa] = useState('')
    const [caId, setCaId] = useState(null)
    const [banhs, setBanhs] = useState([])
    const [data, setData] = useState([])           // [{ banh_id, ten_banh, gia, so_cai_moi_bich, ton_dau, so_bich_xuat, ban, hong, ton_cuoi }]
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')

    const headers = { Authorization: `Bearer ${token}` }

    useEffect(() => {
        // Kiểm tra có ca đang mở không
        axios.get(`${API}/api/ca/hien-tai`, { headers }).then(res => {
            if (res.data) {
                setStep('dang_lam')
                setCaId(res.data.id)
                loadBanhs()
            }
        })
    }, [])

    async function loadBanhs() {
        const res = await axios.get(`${API}/api/banh`, { headers })
        setBanhs(res.data)
    }

    async function batDauCa() {
        if (!loaiCa) return setMsg('Chọn ca sáng hoặc chiều!')
        setLoading(true)
        try {
            const res = await axios.post(`${API}/api/ca/bat-dau`,
                { nhan_vien_id: user.id, loai_ca: loaiCa }, { headers })
            setCaId(res.data.ca_id)
            setData(res.data.ton_dau.map(b => ({
                ...b, so_bich_xuat: 0, ban: 0, hong: 0, ton_cuoi: 0
            })))
            setStep('dang_lam')
            setMsg('')
        } catch (e) {
            setMsg(e.response?.data?.error || 'Lỗi!')
        } finally {
            setLoading(false)
        }
    }

    function updateField(banh_id, field, value) {
        setData(prev => prev.map(d =>
            d.banh_id === banh_id ? { ...d, [field]: Number(value) } : d
        ))
    }

    function tangBan(banh_id) {
        setData(prev => prev.map(d =>
            d.banh_id === banh_id ? { ...d, ban: d.ban + 1 } : d
        ))
    }

    async function ketThucCa() {
        if (!window.confirm('Xác nhận kết thúc ca?')) return
        setLoading(true)
        try {
            await axios.post(`${API}/api/ca/ket-thuc`, { ca_id: caId, chi_tiet: data }, { headers })
            setMsg('✅ Ca đã kết thúc!')
            setStep('chon_ca')
            setCaId(null)
            setData([])
            setLoaiCa('')
        } catch (e) {
            setMsg(e.response?.data?.error || 'Lỗi!')
        } finally {
            setLoading(false)
        }
    }

    // UI: Chọn ca
    if (step === 'chon_ca') return (
        <div style={s.page}>
            <div style={s.header}>
                <span>🥟 Xin chào, {user.ten}</span>
                <button onClick={logout} style={s.logoutBtn}>Đăng xuất</button>
            </div>
            <h2 style={s.title}>Bắt đầu ca làm việc</h2>
            {msg && <p style={s.msg}>{msg}</p>}
            <button
                style={loaiCa === 'sang' ? { ...s.caBtn, ...s.caBtnActive } : s.caBtn}
                onClick={() => setLoaiCa('sang')}
            >☀️ Ca Sáng</button>
            <button
                style={loaiCa === 'chieu' ? { ...s.caBtn, ...s.caBtnActive } : s.caBtn}
                onClick={() => setLoaiCa('chieu')}
            >🌙 Ca Chiều</button>
            <button style={s.btnMain} onClick={batDauCa} disabled={loading}>
                {loading ? 'Đang tải...' : '▶️ Bắt đầu ca'}
            </button>
        </div>
    )

    // UI: Đang làm ca
    return (
        <div style={s.page}>
            <div style={s.header}>
                <span>🥟 {user.ten} — Ca {loaiCa === 'sang' ? 'Sáng' : 'Chiều'}</span>
                <button onClick={logout} style={s.logoutBtn}>Đăng xuất</button>
            </div>
            {msg && <p style={s.msg}>{msg}</p>}

            {data.map(d => (
                <div key={d.banh_id} style={s.card}>
                    <div style={s.banhName}>{d.ten_banh}</div>
                    <div style={s.row}>
                        <span>Tồn đầu:</span>
                        <strong>{d.ton_dau} cái</strong>
                    </div>
                    <div style={s.row}>
                        <span>Xuất (bịch):</span>
                        <input style={s.input} type="number" min="0" value={d.so_bich_xuat}
                            onChange={e => updateField(d.banh_id, 'so_bich_xuat', e.target.value)} />
                    </div>
                    <div style={s.row}>
                        <span>Hỏng:</span>
                        <input style={s.input} type="number" min="0" value={d.hong}
                            onChange={e => updateField(d.banh_id, 'hong', e.target.value)} />
                    </div>
                    <div style={s.row}>
                        <span>Tồn cuối:</span>
                        <input style={s.input} type="number" min="0" value={d.ton_cuoi}
                            onChange={e => updateField(d.banh_id, 'ton_cuoi', e.target.value)} />
                    </div>
                    <div style={s.banRow}>
                        <span style={s.banLabel}>Đã bán: <strong>{d.ban}</strong></span>
                        <button style={s.plusBtn} onClick={() => tangBan(d.banh_id)}>＋1 Bán</button>
                    </div>
                </div>
            ))}

            <button style={{ ...s.btnMain, background: '#dc2626' }}
                onClick={ketThucCa} disabled={loading}>
                {loading ? 'Đang lưu...' : '⏹ Kết thúc ca'}
            </button>
        </div>
    )
}

const s = {
    page: { maxWidth: 480, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#f59e0b', color: '#fff', padding: '12px 16px', borderRadius: 12, marginBottom: 16
    },
    logoutBtn: {
        background: 'rgba(0,0,0,0.2)', color: '#fff', border: 'none',
        borderRadius: 8, padding: '6px 12px', cursor: 'pointer'
    },
    title: { textAlign: 'center', color: '#92400e' },
    msg: { textAlign: 'center', color: '#059669', fontWeight: 'bold' },
    caBtn: {
        width: '100%', padding: 18, fontSize: 20, borderRadius: 12, marginBottom: 12,
        border: '3px solid #e5e7eb', background: '#fff', cursor: 'pointer'
    },
    caBtnActive: { border: '3px solid #f59e0b', background: '#fff8f0' },
    btnMain: {
        width: '100%', padding: 18, fontSize: 18, fontWeight: 'bold',
        background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 12,
        cursor: 'pointer', marginTop: 8, marginBottom: 24
    },
    card: {
        background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    banhName: { fontSize: 18, fontWeight: 'bold', color: '#92400e', marginBottom: 10 },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    input: {
        width: 80, padding: '8px', fontSize: 16, borderRadius: 8,
        border: '2px solid #e5e7eb', textAlign: 'center'
    },
    banRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 8, paddingTop: 8, borderTop: '1px solid #f3f4f6'
    },
    banLabel: { fontSize: 16 },
    plusBtn: {
        padding: '10px 20px', fontSize: 16, fontWeight: 'bold',
        background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer'
    },
}