import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import ExcelJS from 'exceljs'
import BaoCao from './BaoCao'
import LichSu from './LichSu'
import QuanLyBanh from './QuanLyBanh'
import DoiMatKhau from '../components/DoiMatKhau'

const API = import.meta.env.VITE_API_URL

export default function ChuShop() {
    const { user, token, logout } = useAuth()
    const [tab, setTab] = useState('bien_ban')
    const [ngay, setNgay] = useState(new Date().toISOString().split('T')[0])
    const [bienBan, setBienBan] = useState(null)
    const [loading, setLoading] = useState(false)
    const headers = { Authorization: `Bearer ${token}` }
    const [showDoiMK, setShowDoiMK] = useState(false)


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
        const caSang = getCa('sang')
        const caChieu = getCa('chieu')
        const banhs = bienBan.banhs || []

        const wb = new ExcelJS.Workbook()
        const ws = wb.addWorksheet('Biên bản')

        // ========== STYLE ==========
        const headerStyle = {
            font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } },
            alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
            border: {
                top: { style: 'thin' }, bottom: { style: 'thin' },
                left: { style: 'thin' }, right: { style: 'thin' }
            }
        }

        const ca1Style = {
            font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: {
                top: { style: 'thin' }, bottom: { style: 'thin' },
                left: { style: 'thin' }, right: { style: 'thin' }
            }
        }

        const ca2Style = {
            font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: {
                top: { style: 'thin' }, bottom: { style: 'thin' },
                left: { style: 'thin' }, right: { style: 'thin' }
            }
        }

        const dataStyle = {
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: {
                top: { style: 'thin' }, bottom: { style: 'thin' },
                left: { style: 'thin' }, right: { style: 'thin' }
            }
        }

        const dataAltStyle = {
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8F0' } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: {
                top: { style: 'thin' }, bottom: { style: 'thin' },
                left: { style: 'thin' }, right: { style: 'thin' }
            }
        }

        const moneyStyle = {
            font: { bold: true, color: { argb: 'FFDC2626' } },
            alignment: { horizontal: 'right', vertical: 'middle' },
            numFmt: '#,##0',
            border: {
                top: { style: 'thin' }, bottom: { style: 'thin' },
                left: { style: 'thin' }, right: { style: 'thin' }
            }
        }

        const totalStyle = {
            font: { bold: true, size: 12, color: { argb: 'FFDC2626' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } },
            alignment: { horizontal: 'right', vertical: 'middle' },
            numFmt: '#,##0',
            border: {
                top: { style: 'medium' }, bottom: { style: 'medium' },
                left: { style: 'thin' }, right: { style: 'thin' }
            }
        }

        const greenStyle = {
            font: { bold: true, color: { argb: 'FF059669' } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: {
                top: { style: 'thin' }, bottom: { style: 'thin' },
                left: { style: 'thin' }, right: { style: 'thin' }
            }
        }

        // ========== TIÊU ĐỀ ==========
        ws.mergeCells('A1:N1')
        const titleCell = ws.getCell('A1')
        titleCell.value = `BIÊN BẢN BÀN GIAO CA — Ngày ${ngay}`
        titleCell.style = {
            font: { bold: true, size: 14, color: { argb: 'FF92400E' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } },
            alignment: { horizontal: 'center', vertical: 'middle' }
        }
        ws.getRow(1).height = 30

        // ========== HEADER CA ==========
        ws.mergeCells('D2:I2')
        ws.getCell('D2').value = '☀️ CA 1 (SÁNG)'
        ws.getCell('D2').style = ca1Style

        ws.mergeCells('J2:N2')
        ws.getCell('J2').value = '🌙 CA 2 (CHIỀU)'
        ws.getCell('J2').style = ca2Style

        // ========== HEADER CỘT ==========
        const headers = [
            'STT', 'Tên sản phẩm', 'Giá SP',
            'Tồn đầu', 'Nhập mới', 'Tổng', 'Tồn cuối', 'SL bán', 'Thành tiền',
            'Nhập mới', 'Tổng', 'Tồn cuối', 'SL bán', 'Thành tiền'
        ]
        const headerRow = ws.addRow(headers)
        headerRow.eachCell(cell => { cell.style = headerStyle })
        ws.getRow(3).height = 35

        // ========== DỮ LIỆU ==========
        let tongSang = 0, tongChieu = 0
        banhs.forEach((banh, i) => {
            const ctSang = caSang?.chi_tiet?.find(ct => ct.banh_id === banh.id) || {}
            const ctChieu = caChieu?.chi_tiet?.find(ct => ct.banh_id === banh.id) || {}
            const tongS = (Number(ctSang.ton_dau) || 0) + (Number(ctSang.xuat) || 0)
            const tongC = (Number(ctChieu.ton_dau) || 0) + (Number(ctChieu.xuat) || 0)
            const dtSang = Number(ctSang.doanh_thu || 0)
            const dtChieu = Number(ctChieu.doanh_thu || 0)
            tongSang += dtSang
            tongChieu += dtChieu

            const row = ws.addRow([
                i + 1, banh.ten_banh, Number(banh.gia),
                ctSang.ton_dau || 0, ctSang.xuat || 0, tongS, ctSang.ton_cuoi || 0, ctSang.ban || 0, dtSang,
                ctChieu.xuat || 0, tongC, ctChieu.ton_cuoi || 0, ctChieu.ban || 0, dtChieu
            ])

            const rowStyle = i % 2 === 0 ? dataStyle : dataAltStyle
            row.eachCell((cell, colNum) => {
                if (colNum === 2) {
                    cell.style = { ...rowStyle, alignment: { horizontal: 'left', vertical: 'middle' } }
                } else if (colNum === 9 || colNum === 14) {
                    cell.style = { ...moneyStyle, fill: rowStyle.fill }
                } else if (colNum === 8 || colNum === 13) {
                    cell.style = { ...greenStyle, fill: rowStyle.fill }
                } else {
                    cell.style = rowStyle
                }
            })
            row.height = 22
        })

        // ========== TỔNG CỘNG ==========
        const totalRow = ws.addRow([
            '', 'TỔNG CỘNG', '', '', '', '', '', '', tongSang,
            '', '', '', '', tongChieu
        ])
        totalRow.eachCell((cell, colNum) => {
            if (colNum === 2) {
                cell.style = { ...totalStyle, alignment: { horizontal: 'right' } }
            } else {
                cell.style = totalStyle
            }
        })
        totalRow.height = 25

        // ========== PHẦN THU TIỀN ==========
        ws.addRow([])

        const addMoneyRow = (label, valueSang, valueChieu) => {
            const row = ws.addRow(['', label, '', valueSang, '', '', '', '', '', valueChieu])
            row.getCell(2).style = { font: { bold: true }, alignment: { horizontal: 'left' } }
            row.getCell(4).style = { numFmt: '#,##0', alignment: { horizontal: 'right' }, font: { color: { argb: 'FF059669' } } }
            row.getCell(10).style = { numFmt: '#,##0', alignment: { horizontal: 'right' }, font: { color: { argb: 'FF7C3AED' } } }
        }

        addMoneyRow('🛵 Grab:', Number(caSang?.grab || 0), Number(caChieu?.grab || 0))
        addMoneyRow('🏦 Chuyển khoản:', Number(caSang?.chuyen_khoan || 0), Number(caChieu?.chuyen_khoan || 0))
        addMoneyRow('💵 Tiền mặt:', Number(caSang?.tien_mat || 0), Number(caChieu?.tien_mat || 0))
        addMoneyRow('💰 Tổng thu:', Number(caSang?.tong_thu || 0), Number(caChieu?.tong_thu || 0))
        addMoneyRow('🤝 Bàn giao tiền mặt:', Number(caSang?.ban_giao || 0), Number(caChieu?.ban_giao || 0))

        // Thiếu/Dư
        const thieuDuRow = ws.addRow([
            '', 'Thiếu / Dư:', '', Number(caSang?.thieu_du || 0), '', '', '', '', '', Number(caChieu?.thieu_du || 0)
        ])
        thieuDuRow.getCell(2).style = { font: { bold: true, size: 12 } }
        const thieuDuSang = Number(caSang?.thieu_du || 0)
        const thieuDuChieu = Number(caChieu?.thieu_du || 0)
        thieuDuRow.getCell(4).style = {
            numFmt: '#,##0', font: {
                bold: true, size: 12,
                color: { argb: thieuDuSang >= 0 ? 'FF059669' : 'FFDC2626' }
            },
            alignment: { horizontal: 'right' }
        }
        thieuDuRow.getCell(10).style = {
            numFmt: '#,##0', font: {
                bold: true, size: 12,
                color: { argb: thieuDuChieu >= 0 ? 'FF059669' : 'FFDC2626' }
            },
            alignment: { horizontal: 'right' }
        }

        // ========== ĐỘ RỘNG CỘT ==========
        ws.columns = [
            { width: 5 },   // STT
            { width: 22 },  // Tên bánh
            { width: 12 },  // Giá
            { width: 10 },  // Tồn đầu CA1
            { width: 10 },  // Nhập mới CA1
            { width: 8 },   // Tổng CA1
            { width: 10 },  // Tồn cuối CA1
            { width: 8 },   // SL bán CA1
            { width: 14 },  // Thành tiền CA1
            { width: 10 },  // Nhập mới CA2
            { width: 8 },   // Tổng CA2
            { width: 10 },  // Tồn cuối CA2
            { width: 8 },   // SL bán CA2
            { width: 14 },  // Thành tiền CA2
        ]

        // ========== XUẤT FILE ==========
        const buf = await wb.xlsx.writeBuffer()
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
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowDoiMK(true)} style={s.logoutBtn}>🔒</button>
                    <button onClick={logout} style={s.logoutBtn}>Đăng xuất</button>
                </div>
            </div>

            {showDoiMK && <DoiMatKhau onClose={() => setShowDoiMK(false)} />}

            {/* Chọn ngày */}
            <div style={s.dateRow}>
                <label style={{ fontWeight: 'bold', color: '#374151' }}>📅 Ngày:</label>
                <input type="date" value={ngay} onChange={e => setNgay(e.target.value)} style={s.dateInput} />
                <button onClick={loadBienBan} style={s.refreshBtn}>🔄</button>
                <button onClick={xuatExcel} style={s.exportBtn}>📥 Xuất Excel</button>
            </div>

            {/* Tabs */}
            <div style={s.tabs}>
                {[
                    { key: 'bien_ban', label: '📋 Biên bản' },
                    { key: 'baocao', label: '📊 Báo cáo' },
                    { key: 'lich_su', label: '🕐 Lịch sử' },
                    { key: 'quan_ly', label: '🥟 Bánh' },
                ].map(t => (
                    <button key={t.key}
                        style={tab === t.key ? { ...s.tab, ...s.tabActive } : s.tab}
                        onClick={() => setTab(t.key)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'baocao' && <BaoCao />}
            {tab === 'lich_su' && <LichSu />}
            {tab === 'quan_ly' && <QuanLyBanh />}

            {tab === 'bien_ban' && <>
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
            </>}

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
    tabs: { display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' },
    tab: {
        flex: 1, padding: 10, fontSize: 13, borderRadius: 10, whiteSpace: 'nowrap',
        border: '2px solid #e5e7eb', background: '#fff', cursor: 'pointer'
    },
    tabActive: { border: '2px solid #7c3aed', background: '#f5f3ff', fontWeight: 'bold' },
}