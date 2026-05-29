import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const API = import.meta.env.VITE_API_URL

export default function ChuShop() {
    const { user, token, logout } = useAuth()
    const [tab, setTab] = useState('bien_ban')
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

    function xuatExcel() {
        if (!bienBan) return
        const wb = XLSX.utils.book_new()
        const caSang = getCa('sang')
        const caChieu = getCa('chieu')
        const banhs = bienBan.banhs || []

        // Tạo dữ liệu bảng
        const rows = []
        rows.push(['BIÊN BẢN BÀN GIAO CA', '', '', '', '', '', '', '', '', '', '', '', '', ''])
        rows.push(['', '', '', 'CA 1 (SÁNG)', '', '', '', '', '', 'CA 2 (CHIỀU)', '', '', '', ''])
        rows.push(['STT', 'Tên sản phẩm', 'Giá SP',
            'Ngày trước', 'Nhập mới', 'Tổng', 'Tồn ca 1', 'SL bán', 'Thành tiền',
            'Nhập mới', 'Tổng', 'Tồn ca 2', 'SL bán', 'Thành tiền'
        ])

        banhs.forEach((banh, i) => {
            const ctSang = caSang?.chi_tiet?.find(ct => ct.banh_id === banh.id) || {}
            const ctChieu = caChieu?.chi_tiet?.find(ct => ct.banh_id === banh.id) || {}
            const tongSang = (Number(ctSang.ton_dau) || 0) + (Number(ctSang.xuat) || 0)
            const tongChieu = (Number(ctChieu.ton_dau) || 0) + (Number(ctChieu.xuat) || 0)
            rows.push([
                i + 1, banh.ten_banh, Number(banh.gia),
                ctSang.ton_dau || 0, ctSang.xuat || 0, tongSang, ctSang.ton_cuoi || 0, ctSang.ban || 0, ctSang.doanh_thu || 0,
                ctChieu.xuat || 0, tongChieu, ctChieu.ton_cuoi || 0, ctChieu.ban || 0, ctChieu.doanh_thu || 0
            ])
        })

        // Tổng cộng
        rows.push(['', 'TỔNG CỘNG', '', '', '', '', '', '', caSang ? caSang.chi_tiet?.reduce((s, c) => s + Number(c.doanh_thu), 0) : 0,
            '', '', '', '', caChieu ? caChieu.chi_tiet?.reduce((s, c) => s + Number(c.doanh_thu), 0) : 0])
        rows.push([])

        // Phần thu tiền
        rows.push(['Tiền bàn giao ca 1:', '', '', caSang?.ban_giao || 0])
        rows.push(['Grab', '', '', caSang?.grab || 0])
        rows.push(['Chuyển khoản', '', '', caSang?.chuyen_khoan || 0])
        rows.push(['Chi:'])
        rows.push(['Bàn giao tiền mặt', '', '', caSang?.tien_mat || 0])
        rows.push(['Thiếu', '', '', caSang?.thieu_du || 0])

        const ws = XLSX.utils.aoa_to_sheet(rows)
        ws['!cols'] = [
            { wch: 5 }, { wch: 20 }, { wch: 10 },
            { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 12 },
            { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 12 }
        ]
        XLSX.utils.book_append_sheet(wb, ws, 'Biên bản')
        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        saveAs(new Blob([buf], { type: 'application/octet-stream' }), `bien-ban-${ngay}.xlsx`)
    }

    const caSang = getCa('sang')
    const caChieu = getCa('chieu')
    const banhs = bienBan?.banhs || []

    function renderBang(ca) {
        if (!ca) return <p style={{ color: '#9ca3af', textAlign: 'center', padding: 16 }}>Chưa có dữ liệu ca này</p>
        return (
            <div style={{ overflowX: 'auto' }}>
                <table style={s.table}>
                    <thead>
                        <tr style={{ background: '#fef3c7' }}>
                            <th style={s.th}>STT</th>
                            <th style={s.th}>Tên bánh</th>
                            <th style={s.th}>Giá</th>
                            <th style={s.th}>Tồn đầu</th>
                            <th style={s.th}>Nhập mới</th>
                            <th style={s.th}>Tổng</th>
                            <th style={s.th}>Tồn cuối</th>
                            <th style={s.th}>SL bán</th>
                            <th style={s.th}>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banhs.map((banh, i) => {
                            const ct = ca.chi_tiet?.find(c => c.banh_id === banh.id) || {}
                            const tong = (Number(ct.ton_dau) || 0) + (Number(ct.xuat) || 0)
                            return (
                                <tr key={banh.id} style={{ background: i % 2 === 0 ? '#fff' : '#fffbeb' }}>
                                    <td style={s.tdC}>{i + 1}</td>
                                    <td style={s.td}><strong>{banh.ten_banh}</strong></td>
                                    <td style={s.tdR}>{Number(banh.gia).toLocaleString('vi-VN')}</td>
                                    <td style={s.tdC}>{ct.ton_dau || 0}</td>
                                    <td style={s.tdC}>{ct.xuat || 0}</td>
                                    <td style={s.tdC}>{tong}</td>
                                    <td style={s.tdC}>{ct.ton_cuoi || 0}</td>
                                    <td style={{ ...s.tdC, color: '#059669', fontWeight: 'bold' }}>{ct.ban || 0}</td>
                                    <td style={{ ...s.tdR, color: '#dc2626', fontWeight: 'bold' }}>
                                        {Number(ct.doanh_thu || 0).toLocaleString('vi-VN')}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                    <tfoot>
                        <tr style={{ background: '#fef3c7', fontWeight: 'bold' }}>
                            <td colSpan={8} style={{ ...s.td, textAlign: 'right' }}>TỔNG CỘNG:</td>
                            <td style={{ ...s.tdR, color: '#dc2626', fontSize: 15 }}>
                                {ca.chi_tiet?.reduce((sum, c) => sum + Number(c.doanh_thu), 0).toLocaleString('vi-VN')}đ
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Thu tiền */}
                <div style={s.moneyBox}>
                    <div style={s.moneyRow}><span>🛵 Grab:</span><strong>{Number(ca.grab || 0).toLocaleString('vi-VN')}đ</strong></div>
                    <div style={s.moneyRow}><span>🏦 Chuyển khoản:</span><strong>{Number(ca.chuyen_khoan || 0).toLocaleString('vi-VN')}đ</strong></div>
                    <div style={s.moneyRow}><span>💵 Tiền mặt:</span><strong>{Number(ca.tien_mat || 0).toLocaleString('vi-VN')}đ</strong></div>
                    <div style={{ ...s.moneyRow, borderTop: '2px solid #e5e7eb', paddingTop: 8 }}>
                        <span>Tổng thu:</span>
                        <strong style={{ color: '#059669', fontSize: 16 }}>{Number(ca.tong_thu || 0).toLocaleString('vi-VN')}đ</strong>
                    </div>
                    <div style={s.moneyRow}>
                        <span>Bàn giao tiền mặt:</span>
                        <strong>{Number(ca.ban_giao || 0).toLocaleString('vi-VN')}đ</strong>
                    </div>
                    <div style={s.moneyRow}>
                        <span>Thiếu / Dư:</span>
                        <strong style={{ color: Number(ca.thieu_du || 0) >= 0 ? '#059669' : '#dc2626', fontSize: 16 }}>
                            {Number(ca.thieu_du || 0) >= 0 ? '+' : ''}{Number(ca.thieu_du || 0).toLocaleString('vi-VN')}đ
                        </strong>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={s.page}>
            <div style={{ ...s.header, background: '#7c3aed' }}>
                <span>👑 {user.ten}</span>
                <button onClick={logout} style={s.logoutBtn}>Đăng xuất</button>
            </div>

            {/* Chọn ngày */}
            <div style={s.dateRow}>
                <label style={{ fontWeight: 'bold', color: '#374151' }}>📅 Ngày:</label>
                <input type="date" value={ngay} onChange={e => setNgay(e.target.value)} style={s.dateInput} />
                <button onClick={loadBienBan} style={s.refreshBtn}>🔄</button>
                <button onClick={xuatExcel} style={s.exportBtn}>📥 Xuất Excel</button>
            </div>

            {loading && <p style={{ textAlign: 'center', color: '#6b7280' }}>Đang tải...</p>}

            {/* Ca Sáng */}
            <div style={s.caCard}>
                <div style={{ ...s.caHeader, background: '#f59e0b' }}>
                    ☀️ CA SÁNG {caSang ? `— ${bienBan?.cas?.find(c => c.loai_ca === 'sang')?.nhan_vien}` : '(Chưa có)'}
                </div>
                {renderBang(caSang)}
            </div>

            {/* Ca Chiều */}
            <div style={s.caCard}>
                <div style={{ ...s.caHeader, background: '#7c3aed' }}>
                    🌙 CA CHIỀU {caChieu ? `— ${bienBan?.cas?.find(c => c.loai_ca === 'chieu')?.nhan_vien}` : '(Chưa có)'}
                </div>
                {renderBang(caChieu)}
            </div>
        </div>
    )
}

const s = {
    page: { maxWidth: 1000, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: '#fff', padding: '12px 16px', borderRadius: 12, marginBottom: 16
    },
    logoutBtn: {
        background: 'rgba(0,0,0,0.2)', color: '#fff', border: 'none',
        borderRadius: 8, padding: '6px 12px', cursor: 'pointer'
    },
    dateRow: {
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
        background: '#fff', padding: 12, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    dateInput: { padding: '8px 12px', fontSize: 15, borderRadius: 8, border: '2px solid #e5e7eb' },
    refreshBtn: {
        padding: '8px 12px', fontSize: 16, borderRadius: 8,
        border: '2px solid #e5e7eb', background: '#fff', cursor: 'pointer'
    },
    exportBtn: {
        padding: '8px 16px', fontSize: 15, borderRadius: 8, fontWeight: 'bold',
        border: 'none', background: '#059669', color: '#fff', cursor: 'pointer'
    },
    caCard: {
        background: '#fff', borderRadius: 12, marginBottom: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden'
    },
    caHeader: { color: '#fff', padding: '12px 16px', fontWeight: 'bold', fontSize: 16 },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
    th: { padding: '10px 8px', textAlign: 'center', border: '1px solid #e5e7eb', fontSize: 13 },
    td: { padding: '8px', border: '1px solid #e5e7eb' },
    tdC: { padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' },
    tdR: { padding: '8px', border: '1px solid #e5e7eb', textAlign: 'right' },
    moneyBox: { padding: 16, borderTop: '2px solid #f3f4f6' },
    moneyRow: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 8, fontSize: 15
    },
}