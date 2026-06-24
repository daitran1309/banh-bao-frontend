import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { X, Edit, Send, RotateCcw, Clock, Check, AlertCircle, Download } from 'lucide-react'
import { exportBienBanExcel } from '../utils/exportExcel'

const API = import.meta.env.VITE_API_URL

export default function ChiTietCaModal({ caId, onClose, user, token }) {
    const [ca, setCa] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [hasEdited, setHasEdited] = useState(false)
    const [yeuCau, setYeuCau] = useState(null)
    const [lichSuSua, setLichSuSua] = useState([])
    const [noiDungYc, setNoiDungYc] = useState('')
    const [showYcForm, setShowYcForm] = useState(false)
    
    // Edit state
    const [editChiTiet, setEditChiTiet] = useState([])
    const [editPhatSinh, setEditPhatSinh] = useState([])
    const [editTien, setEditTien] = useState({ grab: 0, chuyen_khoan: 0, tien_mat: 0, ban_giao: 0, ghi_chu: '' })
    
    const headers = { Authorization: `Bearer ${token}` }
    const isOwner = user.role === 'chu_shop'

    useEffect(() => {
        loadData()
    }, [caId])

    async function loadData() {
        setLoading(true)
        try {
            const resCa = await axios.get(`${API}/api/ca/chi-tiet/${caId}`, { headers })
            setCa(resCa.data)
            
            // Lấy yêu cầu
            const resYc = await axios.get(`${API}/api/yeucau/danh-sach`, { headers })
            const yc = resYc.data.find(y => String(y.ca_id) === String(caId))
            setYeuCau(yc)

            if (isOwner) {
                const resLs = await axios.get(`${API}/api/yeucau/lich-su-sua/${caId}`, { headers })
                setLichSuSua(resLs.data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    async function handleGuiYeuCau() {
        if (!noiDungYc) return alert('Vui lòng nhập nội dung cần sửa')
        try {
            await axios.post(`${API}/api/yeucau/tao`, {
                ca_id: caId, nhan_vien_id: user.id, noi_dung: noiDungYc
            }, { headers })
            alert('Đã gửi yêu cầu thành công!')
            setShowYcForm(false)
            setHasEdited(true)
            loadData()
        } catch (e) {
            alert(e.response?.data?.error || 'Lỗi gửi yêu cầu')
        }
    }

    function startEdit() {
        setIsEditing(true)
        setEditChiTiet(ca.chi_tiet.map(ct => ({ ...ct })))
        setEditPhatSinh(ca.phat_sinh ? ca.phat_sinh.map(ps => ({ ...ps })) : [])
        setEditTien({
            grab: Number(ca.grab || 0), chuyen_khoan: Number(ca.chuyen_khoan || 0),
            tien_mat: Number(ca.tien_mat || 0), ban_giao: Number(ca.ban_giao || 0),
            ghi_chu: ca.ghi_chu || ''
        })
    }

    async function saveEdit() {
        if (!window.confirm('Xác nhận lưu thay đổi? Dữ liệu cũ sẽ được lưu vào lịch sử.')) return
        try {
            await axios.put(`${API}/api/ca/sua/${caId}`, {
                nguoi_sua_id: user.id,
                chi_tiet: editChiTiet, phat_sinh: editPhatSinh,
                ...editTien
            }, { headers })
            alert('Lưu thành công!')
            setIsEditing(false)
            setHasEdited(true)
            loadData()
        } catch (e) {
            alert(e.response?.data?.error || 'Lỗi lưu ca')
        }
    }

    async function handleRestore(lsId) {
        if (!window.confirm('Khôi phục lại dữ liệu của lần này? Toàn bộ dữ liệu hiện tại sẽ bị ghi đè.')) return
        try {
            await axios.post(`${API}/api/yeucau/restore/${lsId}`, {}, { headers })
            alert('Khôi phục thành công!')
            setHasEdited(true)
            loadData()
        } catch (e) {
            alert(e.response?.data?.error || 'Lỗi khôi phục')
        }
    }

    async function handleExportExcel() {
        if (!ca?.ngay) return
        try {
            const res = await axios.get(`${API}/api/ca/bien-ban/${ca.ngay}`, { headers })
            await exportBienBanExcel(res.data, ca.ngay)
        } catch (e) {
            alert('Lỗi khi xuất excel: ' + (e.response?.data?.error || e.message))
        }
    }

    if (loading) return (
        <div style={s.overlay} className="animate-fade-in">
            <div style={s.modal} className="animate-pop-in">
                <div style={s.header}>
                    <h3 style={{ margin: 0 }}>Đang tải dữ liệu...</h3>
                    <button onClick={() => onClose(hasEdited)} className="btn btn-ghost" style={{ padding: 4 }}><X size={20}/></button>
                </div>
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải chi tiết ca...</div>
            </div>
        </div>
    )

    if (!ca) return (
        <div style={s.overlay} className="animate-fade-in">
            <div style={s.modal} className="animate-pop-in">
                <div style={s.header}>
                    <h3 style={{ margin: 0 }}>Lỗi dữ liệu</h3>
                    <button onClick={() => onClose(hasEdited)} className="btn btn-ghost" style={{ padding: 4 }}><X size={20}/></button>
                </div>
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--danger)' }}>Không thể tải chi tiết ca này hoặc có lỗi hệ thống.</div>
            </div>
        </div>
    )

    const isMyCa = String(ca.nhan_vien_id) === String(user.id)
    const canEdit = isMyCa // Removed yeuCau restriction as requested

    // Render Bảng (Xem hoặc Sửa)
    const chiTietToRender = isEditing ? editChiTiet : ca.chi_tiet
    const phatSinhToRender = isEditing ? editPhatSinh : ca.phat_sinh
    const tienToRender = isEditing ? editTien : { grab: ca.grab, chuyen_khoan: ca.chuyen_khoan, tien_mat: ca.tien_mat, ban_giao: ca.ban_giao }

    const tongDtBanh = chiTietToRender.reduce((sum, ct) => {
        const banhInfo = ca?.banhs?.find(b => String(b.id) === String(ct.banh_id))
        const soCaiMoiBich = Number(ct.so_cai_moi_bich) || Number(banhInfo?.so_cai_moi_bich) || 10
        const xuat = isEditing ? (Number(ct.so_bich_xuat || 0) * soCaiMoiBich) : Number(ct.xuat || 0)
        const ban = isEditing ? Math.max(0, Number(ct.ton_dau || 0) + xuat - Number(ct.hong || 0) - Number(ct.ton_cuoi || 0)) : Number(ct.ban || 0)
        return sum + (ban * Number(ct.gia || 0))
    }, 0)
    const tongPs = (phatSinhToRender || []).reduce((sum, ps) => {
        const amt = Number(ps.so_tien || 0)
        return ps.loai === 'thu' ? sum + amt : sum - amt
    }, 0)
    const tongDt = tongDtBanh + tongPs
    const tmThucTe = tongDt - Number(tienToRender.grab || 0) - Number(tienToRender.chuyen_khoan || 0)
    const thieuDu = Number(tienToRender.ban_giao || 0) - tmThucTe

    return (
        <div style={s.overlay} className="animate-fade-in">
            <div style={s.modal} className="animate-pop-in">
                <div style={s.header}>
                    <h3 style={{ margin: 0 }}>Chi tiết ca {ca.loai_ca === 'sang' ? 'Sáng' : 'Chiều'} - {ca.ngay}</h3>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {!isEditing && canEdit && (
                            <button onClick={startEdit} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13, borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                                <Edit size={16}/> Sửa ca
                            </button>
                        )}
                        {!isEditing && (
                            <button onClick={handleExportExcel} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 13, background: 'var(--success)' }}>
                                <Download size={16}/> Xuất biên bản
                            </button>
                        )}
                        <button onClick={() => onClose(hasEdited)} className="btn btn-ghost" style={{ padding: 4 }}><X size={20}/></button>
                    </div>
                </div>

                <div style={s.body}>
                    {/* Nút thao tác khi đang sửa */}
                    {isEditing && (
                        <div style={{ padding: 12, background: 'var(--primary-light)', borderBottom: '1px solid var(--gray-200)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsEditing(false)} className="btn btn-outline">Huỷ bỏ</button>
                            <button onClick={saveEdit} className="btn btn-primary" style={{ background: 'var(--success)' }}><Check size={16}/> Lưu thay đổi</button>
                        </div>
                    )}

                    <div style={{ padding: 16 }}>
                        <h4>Chi tiết Bánh</h4>
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Bánh</th>
                                        <th>Tồn đầu</th>
                                        <th>Xuất</th>
                                        <th>Hỏng</th>
                                        <th>Tồn cuối</th>
                                        <th>Bán</th>
                                        <th>Doanh thu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chiTietToRender.map((ct, i) => {
                                        const banhInfo = ca?.banhs?.find(b => String(b.id) === String(ct.banh_id))
                                        const soCaiMoiBich = Number(ct.so_cai_moi_bich) || Number(banhInfo?.so_cai_moi_bich) || 10
                                        const xuat = isEditing ? (Number(ct.so_bich_xuat || 0) * soCaiMoiBich) : Number(ct.xuat || 0)
                                        const ban = isEditing ? Math.max(0, Number(ct.ton_dau || 0) + xuat - Number(ct.hong || 0) - Number(ct.ton_cuoi || 0)) : Number(ct.ban || 0)
                                        const dt = ban * Number(ct.gia || 0)
                                        return (
                                            <tr key={i}>
                                                <td>{ct.ten_banh}</td>
                                                <td>{ct.ton_dau}</td>
                                                <td>
                                                    {isEditing ? <input className="input-field" style={{ width: 60, padding: '4px 6px', textAlign: 'center' }} type="number" value={ct.so_bich_xuat} onChange={e => {
                                                        const newArr = [...editChiTiet]; newArr[i].so_bich_xuat = e.target.value; setEditChiTiet(newArr)
                                                    }} /> : ct.so_bich_xuat + ' bịch'}
                                                </td>
                                                <td>
                                                    {isEditing ? <input className="input-field" style={{ width: 60, padding: '4px 6px', textAlign: 'center' }} type="number" value={ct.hong} onChange={e => {
                                                        const newArr = [...editChiTiet]; newArr[i].hong = e.target.value; setEditChiTiet(newArr)
                                                    }} /> : ct.hong}
                                                </td>
                                                <td>
                                                    {isEditing ? <input className="input-field" style={{ width: 60, padding: '4px 6px', textAlign: 'center' }} type="number" value={ct.ton_cuoi} onChange={e => {
                                                        const newArr = [...editChiTiet]; newArr[i].ton_cuoi = e.target.value; setEditChiTiet(newArr)
                                                    }} /> : ct.ton_cuoi}
                                                </td>
                                                <td className="text-success">{ban}</td>
                                                <td className="text-danger">{Number(dt).toLocaleString('vi-VN')}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 250 }} className="card">
                                <h4>Phát sinh</h4>
                                {(phatSinhToRender || []).map((ps, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                        {isEditing ? (
                                            <>
                                                <select className="input-field" style={{ width: 80 }} value={ps.loai} onChange={e => {
                                                    const newArr = [...editPhatSinh]; newArr[i].loai = e.target.value; setEditPhatSinh(newArr)
                                                }}>
                                                    <option value="thu">Thu</option><option value="chi">Chi</option>
                                                </select>
                                                <input className="input-field" style={{ flex: 1 }} value={ps.ten} onChange={e => {
                                                    const newArr = [...editPhatSinh]; newArr[i].ten = e.target.value; setEditPhatSinh(newArr)
                                                }} />
                                                <input className="input-field" style={{ width: 100 }} type="number" value={ps.so_tien} onChange={e => {
                                                    const newArr = [...editPhatSinh]; newArr[i].so_tien = e.target.value; setEditPhatSinh(newArr)
                                                }} />
                                                <button className="btn btn-ghost" onClick={() => setEditPhatSinh(editPhatSinh.filter((_, idx) => idx !== i))}><X size={16}/></button>
                                            </>
                                        ) : (
                                            <>
                                                <span style={{ color: ps.loai === 'thu' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{ps.loai === 'thu' ? '+ Thu' : '- Chi'}</span>
                                                <span style={{ flex: 1 }}>{ps.ten}</span>
                                                <strong>{Number(ps.so_tien).toLocaleString('vi-VN')}đ</strong>
                                            </>
                                        )}
                                    </div>
                                ))}
                                {isEditing && (
                                    <button className="btn btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={() => setEditPhatSinh([...editPhatSinh, { loai: 'chi', ten: '', so_tien: 0 }])}>
                                        + Thêm phát sinh
                                    </button>
                                )}
                            </div>

                            <div style={{ flex: 1, minWidth: 250 }} className="card">
                                <h4>Thu tiền & Bàn giao</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span>Tổng doanh thu:</span><strong className="text-danger" style={{ fontSize: 18 }}>{tongDt.toLocaleString('vi-VN')}đ</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span>Grab:</span>
                                    {isEditing ? <input className="input-field" style={{ width: 100 }} type="number" value={editTien.grab} onChange={e => setEditTien({...editTien, grab: e.target.value})} /> : <strong>{Number(ca.grab || 0).toLocaleString('vi-VN')}đ</strong>}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span>Chuyển khoản:</span>
                                    {isEditing ? <input className="input-field" style={{ width: 100 }} type="number" value={editTien.chuyen_khoan} onChange={e => setEditTien({...editTien, chuyen_khoan: e.target.value})} /> : <strong>{Number(ca.chuyen_khoan || 0).toLocaleString('vi-VN')}đ</strong>}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span>Tiền mặt:</span>
                                    {isEditing ? <input className="input-field" style={{ width: 100 }} type="number" value={editTien.tien_mat} onChange={e => setEditTien({...editTien, tien_mat: e.target.value})} /> : <strong>{Number(ca.tien_mat || 0).toLocaleString('vi-VN')}đ</strong>}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span>Bàn giao:</span>
                                    {isEditing ? <input className="input-field" style={{ width: 100 }} type="number" value={editTien.ban_giao} onChange={e => setEditTien({...editTien, ban_giao: e.target.value})} /> : <strong>{Number(ca.ban_giao || 0).toLocaleString('vi-VN')}đ</strong>}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-200)' }}>
                                    <span>Thiếu / Dư:</span>
                                    <strong style={{ color: thieuDu >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: 18 }}>{thieuDu >= 0 ? '+' : ''}{thieuDu.toLocaleString('vi-VN')}đ</strong>
                                </div>
                            </div>
                        </div>

                        {/* Ghi chú */}
                        <div className="card" style={{ marginTop: 16 }}>
                            <h4>Ghi chú</h4>
                            {isEditing ? (
                                <textarea className="input-field" style={{ width: '100%', minHeight: 60 }} value={editTien.ghi_chu} onChange={e => setEditTien({...editTien, ghi_chu: e.target.value})} />
                            ) : (
                                <p>{ca.ghi_chu || '(Không có)'}</p>
                            )}
                        </div>

                        {/* Lịch sử chỉnh sửa cho Chủ Shop */}
                        {isOwner && lichSuSua.length > 0 && (
                            <div className="card" style={{ marginTop: 24, border: '2px solid #fcd34d', background: 'var(--primary-light)' }}>
                                <h4><Clock size={18} style={{ verticalAlign: 'text-bottom' }} /> Lịch sử chỉnh sửa</h4>
                                {lichSuSua.map((ls, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--primary-light)' }}>
                                        <div>
                                            <strong>{new Date(ls.ngay_sua).toLocaleString('vi-VN')}</strong>
                                            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>Người sửa: {ls.nguoi_sua_ten}</p>
                                        </div>
                                        <button onClick={() => handleRestore(ls.id)} className="btn btn-outline" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}>
                                            <RotateCcw size={16}/> Khôi phục dữ liệu này
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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
        background: '#fff', borderRadius: 12, width: '100%', maxWidth: 900,
        height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
    },
    header: {
        padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', background: 'var(--primary-light)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    body: {
        flex: 1, overflowY: 'auto'
    },
    alertBox: {
        padding: '12px 16px', background: 'var(--primary-light)', borderBottom: '1px solid var(--primary-light)',
    }
}
