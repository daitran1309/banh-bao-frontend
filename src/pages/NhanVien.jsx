import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import XacNhanCa from '../components/XacNhanCa'
import DoiMatKhau from '../components/DoiMatKhau'
const API = import.meta.env.VITE_API_URL

function ThemPhatSinh({ onAdd }) {
    const [loai, setLoai] = useState('chi')
    const [ten, setTen] = useState('')
    const [soTien, setSoTien] = useState('')

    function handleAdd() {
        if (!ten || !soTien) return
        onAdd({ loai, ten, so_tien: soTien })
        setTen(''); setSoTien('')
    }

    return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <select value={loai} onChange={e => setLoai(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: 8, border: '2px solid #e5e7eb', fontSize: 14 }}>
                <option value="thu">+ Thu</option>
                <option value="chi">- Chi</option>
            </select>
            <input style={{ flex: 2, padding: '8px 10px', borderRadius: 8, border: '2px solid #e5e7eb', fontSize: 14 }}
                placeholder="Tên khoản (VD: mua túi nilon)"
                value={ten} onChange={e => setTen(e.target.value)} />
            <input style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '2px solid #e5e7eb', fontSize: 14 }}
                type="number" placeholder="Số tiền"
                value={soTien} onChange={e => setSoTien(e.target.value)} />
            <button onClick={handleAdd}
                style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none',
                    background: '#f59e0b', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: 14
                }}>
                + Thêm
            </button>
        </div>
    )
}

export default function NhanVien() {
    const { user, token, logout } = useAuth()
    const [step, setStep] = useState('chon_ca')
    const [loaiCa, setLoaiCa] = useState('')
    const [caId, setCaId] = useState(null)
    const [data, setData] = useState([])
    const [grab, setGrab] = useState(0)
    const [chuyenKhoan, setChuyenKhoan] = useState(0)
    const [tienMat, setTienMat] = useState(0)
    const [banGiao, setBanGiao] = useState(0)
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const headers = { Authorization: `Bearer ${token}` }
    const [showXacNhan, setShowXacNhan] = useState(false)
    const [showDoiMK, setShowDoiMK] = useState(false)
    const [ghiChu, setGhiChu] = useState('')
    const [phatSinh, setPhatSinh] = useState([])
    useEffect(() => {
        axios.get(`${API}/api/ca/hien-tai`, { headers }).then(async res => {
            if (res.data) {
                setStep('dang_lam')
                setCaId(res.data.id)
                setLoaiCa(res.data.loai_ca)

                // Load lại dữ liệu tồn đầu khi reload trang
                try {
                    const banhs = await axios.get(`${API}/api/banh`, { headers })
                    const tonDau = await axios.post(`${API}/api/ca/ton-dau`,
                        { ca_id: res.data.id }, { headers })
                    const saved = localStorage.getItem('ca_tam')
                    if (saved) {
                        setData(JSON.parse(saved))
                    } else {
                        setData(tonDau.data.map(b => ({
                            ...b, so_bich_xuat: 0, hong: 0, ton_cuoi: 0
                        })))
                    }
                } catch (e) {
                    console.error('Lỗi load lại dữ liệu:', e)
                }
            }
        })
    }, [])
    useEffect(() => {
        if (data.length > 0) localStorage.setItem('ca_tam', JSON.stringify(data))
    }, [data])

    async function batDauCa() {
        if (!loaiCa) return setMsg('Chọn ca sáng hoặc chiều!')
        setLoading(true); setMsg('')
        try {
            const res = await axios.post(`${API}/api/ca/bat-dau`, { nhan_vien_id: user.id, loai_ca: loaiCa }, { headers })
            setCaId(res.data.ca_id)
            setData(res.data.ton_dau.map(b => ({ ...b, so_bich_xuat: 0, hong: 0, ton_cuoi: 0 })))
            setStep('dang_lam')
        } catch (e) { setMsg(e.response?.data?.error || 'Lỗi!') }
        finally { setLoading(false) }
    }

    function updateField(banh_id, field, val) {
        setData(prev => prev.map(d => d.banh_id === banh_id ? { ...d, [field]: Number(val) } : d))
    }

    function tinhBan(d) {
        const xuat = d.so_bich_xuat * d.so_cai_moi_bich
        return Math.max(0, d.ton_dau + xuat - (d.hong || 0) - d.ton_cuoi)
    }

    function tinhDoanhThu(d) { return tinhBan(d) * Number(d.gia) }

    const tongDT = data.reduce((s, d) => s + tinhDoanhThu(d), 0)
    const tongThu = Number(grab) + Number(chuyenKhoan) + Number(tienMat)
    const tienMatThucTe = tongDT - Number(grab) - Number(chuyenKhoan)
    const thieuDu = Number(banGiao) - tienMatThucTe
    async function ketThucCa() {
        if (!window.confirm('Xác nhận kết thúc ca?')) return
        setLoading(true)
        try {
            await axios.post(`${API}/api/ca/ket-thuc`, {
                ca_id: caId, chi_tiet: data,
                grab, chuyen_khoan: chuyenKhoan, tien_mat: tienMat, ban_giao: banGiao,
                ghi_chu: ghiChu, phat_sinh: phatSinh
            }, { headers })
            setMsg('✅ Ca đã kết thúc!')
            localStorage.removeItem('ca_tam')
            setShowXacNhan(false)
            setStep('chon_ca'); setCaId(null); setData([]); setLoaiCa('')
            setGrab(0); setChuyenKhoan(0); setTienMat(0); setBanGiao(0)
            setGhiChu('')
            setPhatSinh([])
        } catch (e) { setMsg(e.response?.data?.error || 'Lỗi!') }
        finally { setLoading(false) }
    }

    if (step === 'chon_ca') return (
        <div style={s.page}>
            <div style={{ ...s.header, background: '#f59e0b' }}>
                <span>🥟 {user.ten}</span>
                <button onClick={logout} style={s.logoutBtn}>Đăng xuất</button>
            </div>
            {msg && <div style={s.successMsg}>{msg}</div>}
            <h2 style={{ textAlign: 'center', color: '#92400e' }}>Bắt đầu ca làm việc</h2>
            <button style={loaiCa === 'sang' ? { ...s.caBtn, ...s.caBtnActive } : s.caBtn} onClick={() => setLoaiCa('sang')}>
                ☀️ Ca Sáng
            </button>
            <button style={loaiCa === 'chieu' ? { ...s.caBtn, ...s.caBtnActive } : s.caBtn} onClick={() => setLoaiCa('chieu')}>
                🌙 Ca Chiều
            </button>
            <button style={s.btnMain} onClick={batDauCa} disabled={loading}>
                {loading ? 'Đang tải...' : '▶️ Bắt đầu ca'}
            </button>
        </div>
    )

    return (
        <div style={s.page}>
            <div style={{ ...s.header, background: '#f59e0b' }}>
                <span>🥟 {user.ten} — Ca {loaiCa === 'sang' ? 'Sáng' : 'Chiều'}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowDoiMK(true)} style={s.logoutBtn}>🔒</button>
                    <button onClick={logout} style={s.logoutBtn}>Đăng xuất</button>
                </div>
            </div>

            {/* Tổng doanh thu */}
            <div style={s.summaryBox}>
                <div style={s.summaryLabel}>Doanh thu tạm tính</div>
                <div style={s.summaryValue}>{tongDT.toLocaleString('vi-VN')}đ</div>
            </div>

            {/* Bảng bánh */}
            <div style={s.tableWrap}>
                <table style={s.table}>
                    <thead>
                        <tr style={{ background: '#fef3c7' }}>
                            <th style={s.th}>Tên bánh</th>
                            <th style={s.th}>Giá</th>
                            <th style={s.th}>Tồn đầu</th>
                            <th style={s.th}>Xuất (bịch)</th>
                            <th style={s.th}>Hỏng</th>
                            <th style={s.th}>Tồn cuối</th>
                            <th style={s.th}>Bán</th>
                            <th style={s.th}>Doanh thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((d, i) => (
                            <tr key={d.banh_id} style={{ background: i % 2 === 0 ? '#fff' : '#fffbeb' }}>
                                <td style={s.td}><strong>{d.ten_banh}</strong></td>
                                <td style={s.tdNum}>{Number(d.gia).toLocaleString('vi-VN')}</td>
                                <td style={s.tdNum}>{d.ton_dau}</td>
                                <td style={s.td}>
                                    <input style={s.inp} type="number" min="0" value={d.so_bich_xuat}
                                        onChange={e => updateField(d.banh_id, 'so_bich_xuat', e.target.value)} />
                                </td>
                                <td style={s.td}>
                                    <input style={s.inp} type="number" min="0" value={d.hong}
                                        onChange={e => updateField(d.banh_id, 'hong', e.target.value)} />
                                </td>
                                <td style={s.td}>
                                    <input style={s.inp} type="number" min="0" value={d.ton_cuoi}
                                        onChange={e => updateField(d.banh_id, 'ton_cuoi', e.target.value)} />
                                </td>
                                <td style={{ ...s.tdNum, color: '#059669', fontWeight: 'bold' }}>{tinhBan(d)}</td>
                                <td style={{ ...s.tdNum, color: '#dc2626', fontWeight: 'bold' }}>
                                    {tinhDoanhThu(d).toLocaleString('vi-VN')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ background: '#fef3c7', fontWeight: 'bold' }}>
                            <td colSpan={7} style={{ ...s.td, textAlign: 'right' }}>TỔNG CỘNG:</td>
                            <td style={{ ...s.tdNum, color: '#dc2626', fontSize: 16 }}>
                                {tongDT.toLocaleString('vi-VN')}đ
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Thu tiền */}
            <div style={s.card}>
                <h3 style={s.cardTitle}>💰 Thu tiền ca {loaiCa === 'sang' ? 'Sáng' : 'Chiều'}</h3>
                <div style={s.moneyRow}>
                    <label style={s.moneyLabel}>🛵 Grab:</label>
                    <input style={s.moneyInput} type="number" min="0" value={grab}
                        onChange={e => setGrab(e.target.value)} />
                </div>
                <div style={s.moneyRow}>
                    <label style={s.moneyLabel}>🏦 Chuyển khoản:</label>
                    <input style={s.moneyInput} type="number" min="0" value={chuyenKhoan}
                        onChange={e => setChuyenKhoan(e.target.value)} />
                </div>
                <div style={s.moneyRow}>
                    <label style={s.moneyLabel}>💵 Tiền mặt:</label>
                    <input style={s.moneyInput} type="number" min="0" value={tienMat}
                        onChange={e => setTienMat(e.target.value)} />
                </div>
                <div style={{ ...s.moneyRow, borderTop: '2px solid #e5e7eb', paddingTop: 8, marginTop: 4 }}>
                    <label style={{ ...s.moneyLabel, fontWeight: 'bold' }}>Tổng thu:</label>
                    <span style={{ fontSize: 18, fontWeight: 'bold', color: '#059669' }}>
                        {tongThu.toLocaleString('vi-VN')}đ
                    </span>
                </div>
            </div>

            <div style={s.card}>
                <h3 style={s.cardTitle}>🤝 Bàn giao tiền mặt</h3>
                <div style={s.moneyRow}>
                    <label style={s.moneyLabel}>Tiền mặt thực tế:</label>
                    <span style={{ fontSize: 16, fontWeight: 'bold', color: '#374151' }}>
                        {tienMatThucTe.toLocaleString('vi-VN')}đ
                    </span>
                </div>
                <div style={s.moneyRow}>
                    <label style={s.moneyLabel}>Số tiền bàn giao:</label>
                    <input style={s.moneyInput} type="number" min="0" value={banGiao}
                        onChange={e => setBanGiao(e.target.value)} />
                </div>
                <div style={{ ...s.moneyRow, marginTop: 8 }}>
                    <label style={s.moneyLabel}>Thiếu / Dư:</label>
                    <span style={{ fontSize: 18, fontWeight: 'bold', color: thieuDu >= 0 ? '#059669' : '#dc2626' }}>
                        {thieuDu >= 0 ? '+' : ''}{thieuDu.toLocaleString('vi-VN')}đ
                    </span>
                </div>
            </div>

            {msg && <div style={s.successMsg}>{msg}</div>}
            {/* Thu chi phát sinh */}
            <div style={s.card}>
                <h3 style={s.cardTitle}>💸 Thu chi phát sinh</h3>

                {phatSinh.map((ps, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                        <span style={{
                            padding: '4px 10px', borderRadius: 20, fontSize: 13, fontWeight: 'bold',
                            background: ps.loai === 'thu' ? '#d1fae5' : '#fee2e2',
                            color: ps.loai === 'thu' ? '#059669' : '#dc2626'
                        }}>
                            {ps.loai === 'thu' ? '+ Thu' : '- Chi'}
                        </span>
                        <span style={{ flex: 1 }}>{ps.ten}</span>
                        <span style={{ fontWeight: 'bold' }}>
                            {Number(ps.so_tien).toLocaleString('vi-VN')}đ
                        </span>
                        <button onClick={() => setPhatSinh(prev => prev.filter((_, j) => j !== i))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#dc2626' }}>
                            ✕
                        </button>
                    </div>
                ))}

                {/* Form thêm */}
                <ThemPhatSinh onAdd={ps => setPhatSinh(prev => [...prev, ps])} />
            </div>



            {/* Ghi chú */}
            <div style={s.card}>
                <h3 style={s.cardTitle}>📝 Ghi chú ca</h3>
                <textarea
                    style={{
                        width: '100%', padding: '10px 12px', fontSize: 15, borderRadius: 10,
                        border: '2px solid #e5e7eb', resize: 'vertical', minHeight: 80, boxSizing: 'border-box'
                    }}
                    placeholder="VD: Hết bánh chay lúc 10h, máy POS lỗi..."
                    value={ghiChu}
                    onChange={e => setGhiChu(e.target.value)}
                />
            </div>
            {/* nut ket thuc ca*/}
            <button style={{ ...s.btnMain, background: '#dc2626' }}
                onClick={() => setShowXacNhan(true)}>
                ⏹ Kết thúc & Xem tóm tắt
            </button>

            {showXacNhan && (
                <XacNhanCa
                    data={data} tongDT={tongDT}
                    grab={grab} chuyenKhoan={chuyenKhoan}
                    tienMat={tienMat} banGiao={banGiao}
                    loading={loading}
                    onConfirm={ketThucCa}
                    onCancel={() => setShowXacNhan(false)}
                />
            )}

            {showDoiMK && <DoiMatKhau onClose={() => setShowDoiMK(false)} />}
        </div>
    )
}

const s = {
    page: { maxWidth: 900, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: '#fff', padding: '12px 16px', borderRadius: 12, marginBottom: 16
    },
    logoutBtn: {
        background: 'rgba(0,0,0,0.2)', color: '#fff', border: 'none',
        borderRadius: 8, padding: '6px 12px', cursor: 'pointer'
    },
    summaryBox: {
        background: '#f59e0b', color: '#fff', borderRadius: 16,
        padding: '20px 24px', textAlign: 'center', marginBottom: 16
    },
    summaryLabel: { fontSize: 14, opacity: 0.9 },
    summaryValue: { fontSize: 36, fontWeight: 'bold' },
    tableWrap: { overflowX: 'auto', marginBottom: 16 },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
    th: { padding: '10px 8px', textAlign: 'center', border: '1px solid #e5e7eb', fontSize: 13 },
    td: { padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' },
    tdNum: { padding: '8px', border: '1px solid #e5e7eb', textAlign: 'right' },
    inp: {
        width: 60, padding: '4px 6px', fontSize: 14, borderRadius: 6,
        border: '2px solid #f59e0b', textAlign: 'center'
    },
    card: {
        background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    cardTitle: { margin: '0 0 12px', color: '#92400e', fontSize: 16 },
    moneyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    moneyLabel: { fontSize: 15, color: '#374151' },
    moneyInput: {
        width: 140, padding: '8px 12px', fontSize: 16, borderRadius: 8,
        border: '2px solid #e5e7eb', textAlign: 'right'
    },
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
    successMsg: {
        background: '#d1fae5', color: '#065f46', padding: 12,
        borderRadius: 10, textAlign: 'center', marginBottom: 12, fontWeight: 'bold'
    },
}