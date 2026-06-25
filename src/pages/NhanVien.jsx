import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import XacNhanCa from '../components/XacNhanCa'
import SidebarLayout from '../components/SidebarLayout'
import { Briefcase, Clock, User as UserIcon, Plus, X, BarChart2 } from 'lucide-react'
import LichSu from './LichSu'
import CaNhan from './CaNhan'
import BaoCao from './BaoCao'
import ChiTietCaModal from '../components/ChiTietCaModal'
import InfoTooltip from '../components/InfoTooltip'

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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <select className="input-field select-field" value={loai} onChange={e => setLoai(e.target.value)} style={{ width: 'auto' }}>
                <option value="thu">+ Thu</option>
                <option value="chi">- Chi</option>
            </select>
            <input className="input-field" style={{ flex: 2 }}
                placeholder="Tên khoản (VD: mua túi nilon)"
                value={ten} onChange={e => setTen(e.target.value)} />
            <input className="input-field" style={{ flex: 1 }}
                type="number" placeholder="Số tiền"
                value={soTien} onChange={e => setSoTien(e.target.value)} />
            <button className="btn btn-outline" onClick={handleAdd}
                style={{
                    borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 'bold'
                }}>
                <Plus size={16} /> Thêm
            </button>
        </div>
    )
}

export default function NhanVien() {
    const { user, token } = useAuth()
    const [tab, setTab] = useState('lam_viec')

    const [step, setStep] = useState('chon_ca')
    const [loaiCa, setLoaiCa] = useState('sang') // default to sang
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
    const [ghiChu, setGhiChu] = useState('')
    const [phatSinh, setPhatSinh] = useState([])
    const [viewCaId, setViewCaId] = useState(null)

    useEffect(() => {
        axios.get(`${API}/api/ca/hien-tai`, { headers }).then(async res => {
            if (res.data) {
                setStep('dang_lam')
                setCaId(res.data.id)
                setLoaiCa(res.data.loai_ca)

                // Load lại dữ liệu tồn đầu khi reload trang
                try {
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

    const tongDTBanh = data.reduce((s, d) => s + tinhDoanhThu(d), 0)
    const tongPhatSinh = phatSinh.reduce((s, ps) => {
        const amt = Number(ps.so_tien) || 0
        return ps.loai === 'thu' ? s + amt : s - amt
    }, 0)
    const tongDT = tongDTBanh + tongPhatSinh
    const tongThu = Number(grab) + Number(chuyenKhoan) + Number(tienMat)
    const tienMatThucTe = tongDT - Number(grab) - Number(chuyenKhoan)
    const thieuDu = Number(banGiao) - tienMatThucTe

    async function ketThucCa() {
        setLoading(true)
        try {
            await axios.post(`${API}/api/ca/ket-thuc`, {
                ca_id: caId, chi_tiet: data,
                grab, chuyen_khoan: chuyenKhoan, tien_mat: tienMat, banGiao: banGiao,
                ghi_chu: ghiChu, phat_sinh: phatSinh
            }, { headers })
            setMsg('✅ Ca đã kết thúc!')
            localStorage.removeItem('ca_tam')
            setShowXacNhan(false)
            setStep('chon_ca'); setCaId(null); setData([]); setLoaiCa('sang')
            setGrab(0); setChuyenKhoan(0); setTienMat(0); setBanGiao(0)
            setGhiChu('')
            setPhatSinh([])
        } catch (e) { setMsg(e.response?.data?.error || 'Lỗi!') }
        finally { setLoading(false) }
    }

    const MENU = [
        { id: 'lam_viec', label: 'Làm việc', icon: <Briefcase size={20} /> },
        { id: 'bao_cao', label: 'Thống kê', icon: <BarChart2 size={20} /> },
        { id: 'lich_su', label: 'Lịch sử ca', icon: <Clock size={20} /> },
        { id: 'ca_nhan', label: 'Cá nhân', icon: <UserIcon size={20} /> },
    ]

    function renderChonCa() {
        return (
            <div className="card animate-fade-in text-center" style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                {msg && <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: 12, borderRadius: 10, textAlign: 'center', fontWeight: 'bold', width: '100%', maxWidth: 400 }}>{msg}</div>}

                <div style={{ width: 80, height: 80, background: 'rgba(108, 93, 211, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: '0 0 20px rgba(108, 93, 211, 0.3)' }}>
                    <Briefcase size={40} />
                </div>
                <h2 style={{ color: 'var(--text-main)' }}>Chưa có ca làm việc nào</h2>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <select className="input-field select-field" value={loaiCa} onChange={e => setLoaiCa(e.target.value)} style={{ width: 180 }}>
                        <option value="sang">☀️ Ca Sáng</option>
                        <option value="chieu">🌙 Ca Chiều</option>
                    </select>
                    <button className="btn btn-primary" onClick={batDauCa} disabled={loading} style={{ padding: '14px 24px' }}>
                        {loading ? 'Đang tải...' : <><Plus size={20} /> Mở ca làm ngay</>}
                    </button>
                </div>
            </div>
        )
    }

    function renderDangLam() {
        return (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Tổng doanh thu */}
                <div className="card animate-slide-up" style={{ background: 'linear-gradient(135deg, rgba(108, 93, 211, 0.3) 0%, rgba(108, 93, 211, 0.1) 100%)', border: '1px solid rgba(108, 93, 211, 0.4)', color: 'var(--text-main)', textAlign: 'center', padding: '32px' }}>
                    <div style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' }}>Doanh thu tạm tính</div>
                    <div style={{ fontSize: 42, fontWeight: '800', color: 'var(--primary)', textShadow: '0 0 20px rgba(108, 93, 211, 0.6)' }}>{tongDT.toLocaleString('vi-VN')}đ</div>
                </div>

                {/* Bảng bánh */}
                <div className="card animate-slide-up stagger-1" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-wrapper" style={{ margin: 0, border: 'none', background: 'transparent' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left' }}>Tên bánh</th>
                                    <th>Giá</th>
                                    <th>Tồn đầu</th>
                                    <th>Xuất (bịch)</th>
                                    <th>Hỏng</th>
                                    <th>Tồn cuối</th>
                                    <th>Bán</th>
                                    <th style={{ textAlign: 'right' }}>Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((d, i) => (
                                    <tr key={d.banh_id}>
                                        <td><strong style={{ color: 'var(--text-main)' }}>{d.ten_banh}</strong></td>
                                        <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{Number(d.gia).toLocaleString('vi-VN')}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{d.ton_dau}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input className="input-field" style={{ width: 70, padding: '8px', textAlign: 'center', border: '1px solid var(--gray-200)' }} type="number" min="0" value={d.so_bich_xuat}
                                                onChange={e => updateField(d.banh_id, 'so_bich_xuat', e.target.value)} />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input className="input-field" style={{ width: 70, padding: '8px', textAlign: 'center', border: '1px solid var(--gray-200)' }} type="number" min="0" value={d.hong}
                                                onChange={e => updateField(d.banh_id, 'hong', e.target.value)} />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input className="input-field" style={{ width: 70, padding: '8px', textAlign: 'center', border: '1px solid var(--gray-200)' }} type="number" min="0" value={d.ton_cuoi}
                                                onChange={e => updateField(d.banh_id, 'ton_cuoi', e.target.value)} />
                                        </td>
                                        <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 'bold', fontSize: 16 }}>{tinhBan(d)}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--accent)', fontWeight: 'bold' }}>
                                            {tinhDoanhThu(d).toLocaleString('vi-VN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: 'rgba(251, 191, 36, 0.1)' }}>
                                    <td colSpan={7} style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--warning)', paddingRight: 20 }}>TỔNG CỘNG:</td>
                                    <td style={{ textAlign: 'right', color: 'var(--warning)', fontSize: 18, fontWeight: '900' }}>
                                        {tongDT.toLocaleString('vi-VN')}đ
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
                    {/* Phát sinh & Ghi chú */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="card animate-slide-up stagger-2" style={{ marginBottom: 0 }}>
                            <h3 className="card-title">💸 Thu chi phát sinh <InfoTooltip text="Ghi nhận các khoản tiền thu thêm hoặc chi ra trong ca (VD: mua đá, tiền rác...)" /></h3>
                            {phatSinh.map((ps, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center', padding: '10px 16px', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 'bold',
                                        background: ps.loai === 'thu' ? 'var(--success-bg)' : 'var(--danger-bg)',
                                        color: ps.loai === 'thu' ? 'var(--success)' : 'var(--danger)'
                                    }}>
                                        {ps.loai === 'thu' ? '+ THU' : '- CHI'}
                                    </span>
                                    <span style={{ flex: 1, color: 'var(--text-main)' }}>{ps.ten}</span>
                                    <span style={{ fontWeight: 'bold', color: ps.loai === 'thu' ? 'var(--success)' : 'var(--danger)' }}>
                                        {ps.loai === 'thu' ? '+' : '-'}{Number(ps.so_tien).toLocaleString('vi-VN')}đ
                                    </span>
                                    <button onClick={() => setPhatSinh(prev => prev.filter((_, j) => j !== i))}
                                        className="btn btn-ghost" style={{ padding: 4, color: 'var(--text-muted)' }}>
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                            <ThemPhatSinh onAdd={ps => setPhatSinh(prev => [...prev, ps])} />
                        </div>

                        <div className="card animate-slide-up stagger-3" style={{ marginBottom: 0 }}>
                            <h3 className="card-title">📝 Ghi chú ca <InfoTooltip text="Để lại tin nhắn hoặc tình trạng ca làm cho quản lý/ca sau" /></h3>
                            <textarea
                                className="input-field"
                                style={{ minHeight: 100, resize: 'vertical' }}
                                placeholder="VD: Hết bánh chay lúc 10h, máy POS lỗi..."
                                value={ghiChu}
                                onChange={e => setGhiChu(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Thu tiền & Bàn giao */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="card animate-slide-up stagger-4" style={{ border: '1px solid var(--gray-200)', marginBottom: 0 }}>
                            <h3 className="card-title">💰 Thu tiền ca {loaiCa === 'sang' ? 'Sáng' : 'Chiều'}</h3>
                            <div className="flex-between" style={{ marginBottom: 16 }}>
                                <label style={{ fontWeight: '600', color: 'var(--text-muted)' }}>🛵 Grab:</label>
                                <input className="input-field" style={{ width: 160, textAlign: 'right' }} type="number" min="0" value={grab} onChange={e => setGrab(e.target.value)} />
                            </div>
                            <div className="flex-between" style={{ marginBottom: 16 }}>
                                <label style={{ fontWeight: '600', color: 'var(--text-muted)' }}>🏦 Chuyển khoản:</label>
                                <input className="input-field" style={{ width: 160, textAlign: 'right' }} type="number" min="0" value={chuyenKhoan} onChange={e => setChuyenKhoan(e.target.value)} />
                            </div>
                            <div className="flex-between" style={{ marginBottom: 16 }}>
                                <label style={{ fontWeight: '600', color: 'var(--text-muted)' }}>💵 Tiền mặt:</label>
                                <input className="input-field" style={{ width: 160, textAlign: 'right' }} type="number" min="0" value={tienMat} onChange={e => setTienMat(e.target.value)} />
                            </div>
                            <div className="flex-between" style={{ borderTop: '1px dashed var(--gray-200)', paddingTop: 16, marginTop: 16 }}>
                                <label style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Tổng thu:</label>
                                <span style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--success)' }}>
                                    {tongThu.toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                        </div>

                        <div className="card animate-slide-up stagger-5" style={{ marginBottom: 0 }}>
                            <h3 className="card-title">🤝 Bàn giao tiền mặt <InfoTooltip text="Số tiền mặt thực tế bạn để lại tại quán sau khi kết thúc ca" /></h3>
                            <div className="flex-between" style={{ marginBottom: 16 }}>
                                <label style={{ color: 'var(--text-muted)' }}>Tiền mặt thực tế:</label>
                                <span style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--text-main)' }}>
                                    {tienMatThucTe.toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                            <div className="flex-between" style={{ marginBottom: 16 }}>
                                <label style={{ fontWeight: '600', color: 'var(--text-main)' }}>Số tiền bàn giao:</label>
                                <input className="input-field" style={{ width: 160, textAlign: 'right', fontSize: 16, fontWeight: 'bold' }} type="number" min="0" value={banGiao} onChange={e => setBanGiao(e.target.value)} />
                            </div>
                            <div className="flex-between" style={{ borderTop: '1px dashed var(--gray-200)', paddingTop: 16, marginTop: 16 }}>
                                <label style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Thiếu / Dư:</label>
                                <span style={{ 
                                    fontSize: 20, fontWeight: 'bold', 
                                    color: thieuDu >= 0 ? 'var(--success)' : 'var(--danger)',
                                    background: thieuDu >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                                    padding: '4px 12px', borderRadius: 8
                                }}>
                                    {thieuDu >= 0 ? '+' : ''}{thieuDu.toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                        </div>

                        <button className="btn btn-danger animate-slide-up stagger-5" style={{ width: '100%', padding: '18px', fontSize: 16, letterSpacing: 1 }}
                            onClick={() => setShowXacNhan(true)}>
                            ⏹ Kết Thúc & Xem Tóm Tắt
                        </button>
                    </div>
                </div>

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
            </div>
        )
    }

    const [lichSuKey, setLichSuKey] = useState(0)

    return (
        <SidebarLayout menuItems={MENU} activeTab={tab} onTabChange={setTab}>
            <div style={{ marginBottom: 32 }} className="animate-fade-in">
                <h1 style={{ margin: 0, fontSize: 28, color: 'var(--text-main)' }}>Chào, <span style={{ color: 'var(--primary)' }}>{user.ten}</span> 👋</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 8 }}>
                    {step === 'dang_lam' ? `Đang trong ca làm việc: ${loaiCa === 'sang' ? 'Ca Sáng' : 'Ca Chiều'}` : 'Chúc bạn một ca làm việc vui vẻ và suôn sẻ!'}
                </p>
            </div>

            {tab === 'lam_viec' && (
                step === 'chon_ca' ? renderChonCa() : renderDangLam()
            )}

            {tab === 'bao_cao' && <BaoCao nhanVienId={user.id} />}
            {tab === 'lich_su' && <LichSu key={lichSuKey} onCaClick={ca => setViewCaId(ca.id)} />}
            {tab === 'ca_nhan' && <CaNhan />}

            {viewCaId && (
                <ChiTietCaModal 
                    caId={viewCaId} 
                    onClose={(changed) => {
                        setViewCaId(null)
                        if (changed) setLichSuKey(k => k + 1)
                    }} 
                    user={user} 
                    token={token} 
                />
            )}
        </SidebarLayout>
    )
}
