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
        if (!ca) return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24, fontStyle: 'italic' }}>Chưa có dữ liệu ca này</p>
        return (
            <div className="table-wrapper" style={{ margin: 0, border: 'none', background: 'transparent' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th style={{ textAlign: 'left' }}>Tên bánh</th>
                            <th>Giá</th>
                            <th>Tồn đầu</th>
                            <th>Nhập mới</th>
                            <th>Tổng</th>
                            <th>Tồn cuối</th>
                            <th>SL bán</th>
                            <th style={{ textAlign: 'right' }}>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banhs.map((banh, i) => {
                            const ct = ca.chi_tiet?.find(c => c.banh_id === banh.id) || {}
                            const tong = (Number(ct.ton_dau) || 0) + (Number(ct.xuat) || 0)
                            return (
                                <tr key={banh.id}>
                                    <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{i + 1}</td>
                                    <td><strong style={{ color: 'var(--text-main)' }}>{banh.ten_banh}</strong></td>
                                    <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{Number(banh.gia).toLocaleString('vi-VN')}</td>
                                    <td style={{ textAlign: 'center' }}>{ct.ton_dau || 0}</td>
                                    <td style={{ textAlign: 'center' }}>{ct.xuat || 0}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{tong}</td>
                                    <td style={{ textAlign: 'center' }}>{ct.ton_cuoi || 0}</td>
                                    <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 'bold', fontSize: 16 }}>{ct.ban || 0}</td>
                                    <td style={{ textAlign: 'right', color: 'var(--accent)', fontWeight: 'bold' }}>
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
                                <tr style={{ background: 'rgba(251, 191, 36, 0.1)' }}>
                                    <td colSpan={8} style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--warning)', paddingRight: 20 }}>TỔNG CỘNG (đã gồm phát sinh):</td>
                                    <td style={{ textAlign: 'right', color: 'var(--warning)', fontSize: 18, fontWeight: '900' }}>
                                        {tongCong.toLocaleString('vi-VN')}đ
                                    </td>
                                </tr>
                            )
                        })()}
                    </tfoot>
                </table>

                {/* Thu chi phát sinh */}
                {ca.phat_sinh && ca.phat_sinh.length > 0 && (
                    <div style={{ padding: '16px 20px', borderTop: '1px solid var(--gray-200)' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--warning)', marginBottom: 12, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>💸</span> Thu chi phát sinh
                        </div>
                        {ca.phat_sinh.map((ps, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, alignItems: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 'bold', marginRight: 12,
                                        background: ps.loai === 'thu' ? 'var(--success-bg)' : 'var(--danger-bg)',
                                        color: ps.loai === 'thu' ? 'var(--success)' : 'var(--danger)'
                                    }}>
                                        {ps.loai === 'thu' ? '+ THU' : '- CHI'}
                                    </span>
                                    <span style={{ color: 'var(--text-main)' }}>{ps.ten}</span>
                                </span>
                                <strong style={{ color: ps.loai === 'thu' ? 'var(--success)' : 'var(--danger)' }}>
                                    {ps.loai === 'thu' ? '+' : '-'}{Number(ps.so_tien).toLocaleString('vi-VN')}đ
                                </strong>
                            </div>
                        ))}
                    </div>
                )}

                {/* Thu tiền summary */}
                <div style={{ padding: '20px 24px', borderTop: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 250 }}>
                            <div style={s.sumRow}><span>🛵 Grab:</span><strong style={{ color: 'var(--text-main)' }}>{Number(ca.grab || 0).toLocaleString('vi-VN')}đ</strong></div>
                            <div style={s.sumRow}><span>🏦 Chuyển khoản:</span><strong style={{ color: 'var(--text-main)' }}>{Number(ca.chuyen_khoan || 0).toLocaleString('vi-VN')}đ</strong></div>
                            <div style={s.sumRow}><span>💵 Tiền mặt:</span><strong style={{ color: 'var(--text-main)' }}>{Number(ca.tien_mat || 0).toLocaleString('vi-VN')}đ</strong></div>
                        </div>
                        <div style={{ flex: 1, minWidth: 250 }}>
                            <div style={s.sumRow}>
                                <span>Tổng thu:</span>
                                <strong style={{ color: 'var(--success)', fontSize: 18 }}>{Number(ca.tong_thu || 0).toLocaleString('vi-VN')}đ</strong>
                            </div>
                            <div style={s.sumRow}>
                                <span>Bàn giao tiền mặt:</span>
                                <strong style={{ color: 'var(--text-main)' }}>{Number(ca.ban_giao || 0).toLocaleString('vi-VN')}đ</strong>
                            </div>
                            <div style={{ ...s.sumRow, borderTop: '1px dashed var(--gray-200)', paddingTop: 12, marginTop: 4 }}>
                                <span>Kiểm quỹ (Thiếu / Dư):</span>
                                <strong style={{ 
                                    background: Number(ca.thieu_du || 0) >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                                    color: Number(ca.thieu_du || 0) >= 0 ? 'var(--success)' : 'var(--danger)', 
                                    fontSize: 18, padding: '4px 12px', borderRadius: 8
                                }}>
                                    {Number(ca.thieu_du || 0) >= 0 ? '+' : ''}{Number(ca.thieu_du || 0).toLocaleString('vi-VN')}đ
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            {/* Chọn ngày */}
            <div className="card animate-slide-up" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '20px 24px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 16px', borderRadius: 100, border: '1px solid var(--gray-200)' }}>
                    <label style={{ fontWeight: '600', color: 'var(--text-muted)' }}>📅 Ngày:</label>
                    <input type="date" value={ngay} onChange={e => setNgay(e.target.value)} 
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: 15, fontFamily: 'inherit' }} 
                    />
                </div>
                <button onClick={loadBienBan} className="btn btn-outline" title="Làm mới"><RefreshCw size={18}/> Làm mới</button>
                <div style={{ flex: 1 }}></div>
                <button onClick={xuatExcel} className="btn" style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white' }}>
                    <Download size={18}/> Xuất Excel
                </button>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }} className="animate-fade-in">Đang tải biên bản...</p>
            ) : !bienBan ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }} className="animate-fade-in">Không có dữ liệu cho ngày này</p>
            ) : (
                <>
                    {/* Ca Sáng */}
                    <div className="card animate-slide-up stagger-1" style={{ overflow: 'hidden', padding: 0 }}>
                        <div style={{ padding: '20px 24px', background: 'linear-gradient(90deg, rgba(108, 93, 211, 0.4) 0%, rgba(108, 93, 211, 0) 100%)', color: 'var(--text-main)', fontWeight: 'bold', fontSize: 16, display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--gray-200)' }}>
                            <div style={{ width: 4, height: 24, background: 'var(--primary)', borderRadius: 4 }}></div>
                            ☀️ CA SÁNG {caSang ? <span style={{ color: 'var(--primary)' }}>— {bienBan?.cas?.find(c => c.loai_ca === 'sang')?.nhan_vien}</span> : <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(Chưa có)</span>}
                        </div>
                        {renderBang(caSang)}
                    </div>

                    {/* Ca Chiều */}
                    <div className="card animate-slide-up stagger-2" style={{ overflow: 'hidden', padding: 0, marginTop: 24 }}>
                        <div style={{ padding: '20px 24px', background: 'linear-gradient(90deg, rgba(255, 117, 216, 0.3) 0%, rgba(255, 117, 216, 0) 100%)', color: 'var(--text-main)', fontWeight: 'bold', fontSize: 16, display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--gray-200)' }}>
                            <div style={{ width: 4, height: 24, background: 'var(--accent)', borderRadius: 4 }}></div>
                            🌙 CA CHIỀU {caChieu ? <span style={{ color: 'var(--accent)' }}>— {bienBan?.cas?.find(c => c.loai_ca === 'chieu')?.nhan_vien}</span> : <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(Chưa có)</span>}
                        </div>
                        {renderBang(caChieu)}
                    </div>
                </>
            )}
        </div>
    )
}

const s = {
    sumRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 10, color: 'var(--text-muted)' }
}
