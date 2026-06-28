import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export async function exportBienBanExcel(bienBan, ngay) {
    if (!bienBan) return
    const caSang = bienBan.cas?.find(c => c.loai_ca === 'sang')
    const caChieu = bienBan.cas?.find(c => c.loai_ca === 'chieu')
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
    const headersArr = [
        'STT', 'Tên sản phẩm', 'Giá SP',
        'Tồn đầu', 'Nhập mới', 'Tổng', 'Tồn cuối', 'SL bán', 'Thành tiền',
        'Nhập mới', 'Tổng', 'Tồn cuối', 'SL bán', 'Thành tiền'
    ]
    const headerRow = ws.addRow(headersArr)
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

    // Cộng/trừ phát sinh vào tổng
    const psSang = caSang?.phat_sinh || []
    const psChieu = caChieu?.phat_sinh || []
    psSang.forEach(ps => {
        const amt = Number(ps.so_tien) || 0
        tongSang += ps.loai === 'thu' ? amt : -amt
    })
    psChieu.forEach(ps => {
        const amt = Number(ps.so_tien) || 0
        tongChieu += ps.loai === 'thu' ? amt : -amt
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

    // ========== THU CHI PHÁT SINH ==========
    if (psSang.length > 0 || psChieu.length > 0) {
        ws.addRow([])
        const psHeader = ws.addRow(['', '💸 THU CHI PHÁT SINH'])
        psHeader.getCell(2).style = { font: { bold: true, size: 12, color: { argb: 'FF92400E' } } }
        const allPs = [...psSang.map(p => ({ ...p, ca: 'sang' })), ...psChieu.map(p => ({ ...p, ca: 'chieu' }))]
        allPs.forEach(ps => {
            const label = `${ps.loai === 'thu' ? '+ Thu' : '- Chi'}: ${ps.ten} (Ca ${ps.ca === 'sang' ? 'Sáng' : 'Chiều'})`
            const rowArr = Array(14).fill('')
            rowArr[1] = label
            const moneyCol = ps.ca === 'sang' ? 9 : 14
            rowArr[moneyCol - 1] = Number(ps.so_tien)

            const row = ws.addRow(rowArr)
            row.getCell(2).style = { alignment: { horizontal: 'left' } }
            row.getCell(moneyCol).style = {
                numFmt: '#,##0', alignment: { horizontal: 'right' },
                font: { bold: true, color: { argb: ps.loai === 'thu' ? 'FF059669' : 'FFDC2626' } }
            }
        })
    }

    // ========== PHẦN THU TIỀN ==========
    ws.addRow([])

    const addMoneyRow = (label, valueSang, valueChieu) => {
        const row = ws.addRow(['', label, '', '', '', '', '', '', valueSang, '', '', '', '', valueChieu])
        row.getCell(2).style = { font: { bold: true }, alignment: { horizontal: 'left' } }
        row.getCell(9).style = { numFmt: '#,##0', alignment: { horizontal: 'right' }, font: { color: { argb: 'FF059669' } } }
        row.getCell(14).style = { numFmt: '#,##0', alignment: { horizontal: 'right' }, font: { color: { argb: 'FF7C3AED' } } }
    }

    addMoneyRow('🛵 Grab:', Number(caSang?.grab || 0), Number(caChieu?.grab || 0))
    addMoneyRow('🏦 Chuyển khoản:', Number(caSang?.chuyen_khoan || 0), Number(caChieu?.chuyen_khoan || 0))
    addMoneyRow('💵 Tiền mặt:', Number(caSang?.tien_mat || 0), Number(caChieu?.tien_mat || 0))
    addMoneyRow('💰 Tổng thu:', Number(caSang?.tong_thu || 0), Number(caChieu?.tong_thu || 0))
    addMoneyRow('🤝 Bàn giao tiền mặt:', Number(caSang?.ban_giao || 0), Number(caChieu?.ban_giao || 0))

    // Thiếu/Dư
    const thieuDuRow = ws.addRow([
        '', 'Thiếu / Dư:', '', '', '', '', '', '', Number(caSang?.thieu_du || 0), '', '', '', '', Number(caChieu?.thieu_du || 0)
    ])
    thieuDuRow.getCell(2).style = { font: { bold: true, size: 12 } }
    const thieuDuSang = Number(caSang?.thieu_du || 0)
    const thieuDuChieu = Number(caChieu?.thieu_du || 0)
    thieuDuRow.getCell(9).style = {
        numFmt: '#,##0', font: {
            bold: true, size: 12,
            color: { argb: thieuDuSang >= 0 ? 'FF059669' : 'FFDC2626' }
        },
        alignment: { horizontal: 'right' }
    }
    thieuDuRow.getCell(14).style = {
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
