export default function XacNhanCa({ data, tongDT, grab, chuyenKhoan, tienMat, banGiao, onConfirm, onCancel, loading }) {
    const tongThu = Number(grab) + Number(chuyenKhoan) + Number(tienMat)
    const tienMatThucTe = tongDT - Number(grab) - Number(chuyenKhoan)
    const thieuDu = Number(banGiao) - tienMatThucTe

    return (
        <div style={s.overlay}>
            <div style={s.modal}>
                <h3 style={s.title}>📋 Xác nhận kết thúc ca</h3>

                <div style={s.section}>
                    <div style={s.sectionTitle}>Tổng doanh thu</div>
                    <div style={s.bigNum}>{tongDT.toLocaleString('vi-VN')}đ</div>
                </div>

                <div style={s.section}>
                    <div style={s.row}><span>🛵 Grab:</span><strong>{Number(grab).toLocaleString('vi-VN')}đ</strong></div>
                    <div style={s.row}><span>🏦 Chuyển khoản:</span><strong>{Number(chuyenKhoan).toLocaleString('vi-VN')}đ</strong></div>
                    <div style={s.row}><span>💵 Tiền mặt thực tế:</span><strong>{tienMatThucTe.toLocaleString('vi-VN')}đ</strong></div>
                    <div style={s.row}><span>🤝 Bàn giao:</span><strong>{Number(banGiao).toLocaleString('vi-VN')}đ</strong></div>
                    <div style={{ ...s.row, borderTop: '2px solid var(--gray-200)', paddingTop: 8, marginTop: 4 }}>
                        <span>Thiếu / Dư:</span>
                        <strong style={{ color: thieuDu >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: 18 }}>
                            {thieuDu >= 0 ? '+' : ''}{thieuDu.toLocaleString('vi-VN')}đ
                        </strong>
                    </div>
                </div>

                <div style={s.section}>
                    <div style={s.sectionTitle}>Chi tiết bánh bán</div>
                    {data.map(d => {
                        const xuat = d.so_bich_xuat * d.so_cai_moi_bich
                        const ban = Math.max(0, d.ton_dau + xuat - (d.hong || 0) - d.ton_cuoi)
                        return ban > 0 ? (
                            <div key={d.banh_id} style={s.row}>
                                <span>{d.ten_banh}:</span>
                                <strong style={{ color: 'var(--success)' }}>{ban} cái</strong>
                            </div>
                        ) : null
                    })}
                </div>

                <div style={s.btnRow}>
                    <button style={s.btnCancel} onClick={onCancel}>← Sửa lại</button>
                    <button style={s.btnConfirm} onClick={onConfirm} disabled={loading}>
                        {loading ? 'Đang lưu...' : '✅ Xác nhận'}
                    </button>
                </div>
            </div>
        </div>
    )
}

const s = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
    },
    modal: {
        background: 'var(--input-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--gray-200)', 
        borderRadius: 16, padding: 20, width: '100%', maxWidth: 400,
        maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12
    },
    title: { margin: 0, textAlign: 'center', color: 'var(--text-main)', fontSize: 18 },
    section: { background: 'var(--primary-light)', borderRadius: 12, padding: 12, border: '1px solid var(--gray-200)' },
    sectionTitle: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 },
    bigNum: { fontSize: 28, fontWeight: 'bold', color: 'var(--danger)', textAlign: 'center' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 15, color: 'var(--text-main)' },
    btnRow: { display: 'flex', gap: 8 },
    btnCancel: {
        flex: 1, padding: 14, borderRadius: 10, border: 'none',
        background: 'var(--gray-200)', color: 'var(--text-main)', cursor: 'pointer', fontSize: 15, transition: 'var(--transition)',
        fontWeight: '600'
    },
    btnConfirm: {
        flex: 1, padding: 14, borderRadius: 10, border: 'none',
        background: 'var(--success)', color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 'bold'
    },
}