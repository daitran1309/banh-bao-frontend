import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import * as XLSX from 'xlsx'
import { Download, RefreshCw } from 'lucide-react'
import { exportBienBanExcel } from '../utils/exportExcel'

const API = import.meta.env.VITE_API_URL

export default function BienBan() {
    const { token } = useAuth()
    const [ngay, setNgay] = useState(new Date().toISOString().split('T')[0])
    const [bienBan, setBienBan] = useState(null)
    const [loading, setLoading] = useState(false)
    const headers = { Authorization: `Bearer ${token}` }

    useEffect(() => { loadBienBan() }, [ngay])

    async function loadBienBan() {
        setLoading(true)
        try {
            const res = await axios.get(`${API}/api/ca/bien-ban/${ngay}`, { headers })
            setBienBan(res.data)
        } catch { setBienBan(null) }
        finally { setLoading(false) }
    }

    function getCa(loai) {
        return bienBan?.cas?.find(c => c.loai_ca === loai)
    }

    async function xuatExcel() {
        if (!bienBan) return
        await exportBienBanExcel(bienBan, ngay)
    }

    const caSang = getCa('sang')
    const caChieu = getCa('chieu')
    const banhs = bienBan?.banhs || []

    function renderBang(ca) {
        if (!ca) return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>Chưa có dữ liệu ca này</p>
        return (
            <div className="table-wrapper" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên bánh</th>
                            <th>Giá</th>
                            <th>Tồn đầu</th>
                            <th>Nhập mới</th>
                            <th>Tổng</th>
                            <th>Tồn cuối</th>
                            <th>SL bán</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banhs.map((banh, i) => {
                            const ct = ca.chi_tiet?.find(c => c.banh_id === banh.id) || {}
                            const tong = (Number(ct.ton_dau) || 0) + (Number(ct.xuat) || 0)
                            return (
                                <tr key={banh.id}>
                                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                                    <td><strong>{banh.ten_banh}</strong></td>
                                    <td style={{ textAlign: 'right' }}>{Number(banh.gia).toLocaleString('vi-VN')}</td>
                                    <td style={{ textAlign: 'center' }}>{ct.ton_dau || 0}</td>
                                    <td style={{ textAlign: 'center' }}>{ct.xuat || 0}</td>
                                    <td style={{ textAlign: 'center' }}>{tong}</td>
                                    <td style={{ textAlign: 'center' }}>{ct.ton_cuoi || 0}</td>
                                    <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 'bold' }}>{ct.ban || 0}</td>
                                    <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 'bold' }}>
                                        {Number(ct.doanh_thu || 0).toLocaleString('vi-VN')}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                    <tfoot>
                        {(() => {
                            const dtBanh = ca.chi_tiet?.reduce((sum, c) => sum + Number(c.doanh_thu), 0) || 0
                            const dtPhatSinh = (ca.phat_sinh || []).reduce((sum, ps) => {
                                const amt = Number(ps.so_tien) || 0
                                return ps.loai === 'thu' ? sum + amt : sum - amt
                            }, 0)
                            const tongCong = dtBanh + dtPhatSinh
                            return (
                                <tr style={{ background: 'var(--warning-bg)', fontWeight: 'bold' }}>
                                    <td colSpan={8} style={{ textAlign: 'right' }}>TỔNG CỘNG (đã gồm phát sinh):</td>
                                    <td style={{ textAlign: 'right', color: 'var(--danger)', fontSize: 15 }}>
                                        {tongCong.toLocaleString('vi-VN')}đ
                                    </td>
                                </tr>
                            )
                        })()}
                    </tfoot>
                </table>

                {/* Thu chi phát sinh */}
                {ca.phat_sinh && ca.phat_sinh.length > 0 && (
                    <div style={{ padding: '12px 16px', borderTop: '2px solid var(--gray-200)', background: 'var(--warning-bg)' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--warning)', marginBottom: 8, fontSize: 15 }}>💸 Thu chi phát sinh</div>
                        {ca.phat_sinh.map((ps, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 14 }}>
                                <span>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 'bold', marginRight: 8,
                                        background: ps.loai === 'thu' ? 'var(--success-bg)' : 'var(--danger-bg)',
                                        color: ps.loai === 'thu' ? 'var(--success)' : 'var(--danger)'
                                    }}>
                                        {ps.loai === 'thu' ? '+ Thu' : '- Chi'}
                                    </span>
                                    {ps.ten}
                                </span>
                                <strong style={{ color: ps.loai === 'thu' ? 'var(--success)' : 'var(--danger)' }}>
                                    {Number(ps.so_tien).toLocaleString('vi-VN')}đ
                                </strong>
                            </div>
                        ))}
                    </div>
                )}

                {/* Thu tiền */}
                <div style={{ padding: 16, borderTop: '2px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>🛵 Grab:</span><strong>{Number(ca.grab || 0).toLocaleString('vi-VN')}đ</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>🏦 Chuyển khoản:</span><strong>{Number(ca.chuyen_khoan || 0).toLocaleString('vi-VN')}đ</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>💵 Tiền mặt:</span><strong>{Number(ca.tien_mat || 0).toLocaleString('vi-VN')}đ</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--gray-200)', paddingTop: 8, marginBottom: 8 }}>
                        <span>Tổng thu:</span>
                        <strong style={{ color: 'var(--success)', fontSize: 16 }}>{Number(ca.tong_thu || 0).toLocaleString('vi-VN')}đ</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Bàn giao tiền mặt:</span>
                        <strong>{Number(ca.ban_giao || 0).toLocaleString('vi-VN')}đ</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Thiếu / Dư:</span>
                        <strong style={{ color: Number(ca.thieu_du || 0) >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: 16 }}>
                            {Number(ca.thieu_du || 0) >= 0 ? '+' : ''}{Number(ca.thieu_du || 0).toLocaleString('vi-VN')}đ
                        </strong>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            {/* Chọn ngày */}
            <div className="card animate-slide-up" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <label style={{ fontWeight: 'bold' }}>📅 Chọn Ngày:</label>
                <input type="date" value={ngay} onChange={e => setNgay(e.target.value)} className="input-field" style={{ width: 'auto' }} />
                <button onClick={loadBienBan} className="btn btn-outline" title="Làm mới"><RefreshCw size={18}/></button>
                <button onClick={xuatExcel} className="btn btn-primary" style={{ background: 'var(--success)' }}><Download size={18}/> Xuất Excel</button>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }} className="animate-fade-in">Đang tải dữ liệu...</p>
            ) : !bienBan ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }} className="animate-fade-in">Không có dữ liệu cho ngày này</p>
            ) : (
                <>
                    {/* Ca Sáng */}
                    <div className="card animate-slide-up" style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '16px 20px', background: 'var(--primary)', color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                    ☀️ CA SÁNG {caSang ? `— ${bienBan?.cas?.find(c => c.loai_ca === 'sang')?.nhan_vien}` : '(Chưa có)'}
                </div>
                {renderBang(caSang)}
            </div>

            {/* Ca Chiều */}
            <div className="card" style={{ overflow: 'hidden', padding: 0, marginTop: 24 }}>
                <div style={{ padding: '16px 20px', background: 'var(--accent)', color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                    🌙 CA CHIỀU {caChieu ? `— ${bienBan?.cas?.find(c => c.loai_ca === 'chieu')?.nhan_vien}` : '(Chưa có)'}
                </div>
                {renderBang(caChieu)}
            </div>
            </>
            )}
        </div>
    )
}
