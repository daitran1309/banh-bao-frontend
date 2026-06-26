import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { X, Edit, Send, RotateCcw, Clock, Check, AlertCircle, Download } from 'lucide-react'
import { exportBienBanExcel } from '../utils/exportExcel'
import { motion, AnimatePresence } from 'framer-motion'

const API = import.meta.env.VITE_API_URL

export default function ChiTietCaModal({ caId, onClose, user, token, inline = false }) {
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

    if (loading) return inline ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div> : (
        <div className="modal-overlay" style={s.overlay}>
            <div className="modal-content" style={s.modal}>
                <div style={s.header}>
                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Đang tải dữ liệu...</h3>
                    <button onClick={() => onClose(hasEdited)} className="btn btn-ghost" style={{ padding: 4 }}><X size={20}/></button>
                </div>
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải chi tiết ca...</div>
            </div>
        </div>
    )

    if (!ca) return inline ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--danger)' }}>Lỗi tải dữ liệu</div> : (
        <div className="modal-overlay" style={s.overlay}>
            <div className="modal-content" style={s.modal}>
                <div style={s.header}>
                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Lỗi dữ liệu</h3>
                    <button onClick={() => onClose(hasEdited)} className="btn btn-ghost" style={{ padding: 4 }}><X size={20}/></button>
                </div>
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--danger)' }}>Không thể tải chi tiết ca này hoặc có lỗi hệ thống.</div>
            </div>
        </div>
    )

    const isMyCa = String(ca.nhan_vien_id) === String(user.id)
    const canEdit = isMyCa

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

    const innerContent = (
        <>
            {!inline && (
                <div style={s.header}>
                    <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        Chi tiết ca {ca.loai_ca === 'sang' ? 'Sáng' : 'Chiều'} - {ca.ngay}
                    </h3>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {!isEditing && canEdit && (
                            <button onClick={startEdit} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 14 }}>
                                <Edit size={16}/> Sửa ca
                            </button>
                        )}
                        {!isEditing && (
                            <button onClick={handleExportExcel} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 14, background: 'var(--success)' }}>
                                <Download size={16}/> Xuất biên bản
                            </button>
                        )}
                        <button onClick={() => onClose(hasEdited)} className="btn btn-ghost" style={{ padding: 8 }}><X size={24}/></button>
                    </div>
                </div>
            )}
            
            {inline && !isEditing && (
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)', background: 'rgba(0,0,0,0.1)' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary)' }}>Chi tiết ca làm việc</h4>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {canEdit && <button onClick={startEdit} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13 }}><Edit size={14}/> Sửa</button>}
                        <button onClick={handleExportExcel} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 13, background: 'var(--success)' }}><Download size={14}/> Xuất Excel</button>
                    </div>
                </div>
            )}

            <div style={inline ? {} : s.body}>
                        {isEditing && (
                            <div style={{ padding: '16px 24px', background: 'rgba(255, 117, 216, 0.1)', borderBottom: '1px solid rgba(255, 117, 216, 0.2)', display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
                                <span style={{ color: 'var(--accent)', fontWeight: 'bold', marginRight: 'auto' }}>Đang chế độ sửa ca</span>
                                <button onClick={() => setIsEditing(false)} className="btn btn-outline">Huỷ bỏ</button>
                                <button onClick={saveEdit} className="btn btn-primary" style={{ background: 'var(--success)' }}><Check size={16}/> Lưu thay đổi</button>
                            </div>
                        )}

                        <div style={{ padding: 24 }}>
                            <h4 style={{ color: 'var(--text-main)', marginBottom: 16 }}>🍩 Chi tiết Bánh</h4>
                            <div className="table-wrapper" style={{ margin: 0, border: 'none', background: 'transparent' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left' }}>Bánh</th>
                                            <th>Tồn đầu</th>
                                            <th>Xuất</th>
                                            <th>Hỏng</th>
                                            <th>Tồn cuối</th>
                                            <th>Bán</th>
                                            <th style={{ textAlign: 'right' }}>Doanh thu</th>
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
                                                    <td style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: 'none' }}>
                                                        {ct.hinh_anh ? (
                                                            <img src={ct.hinh_anh} alt={ct.ten_banh} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--gray-200)', background: 'var(--white)' }} />
                                                        ) : (
                                                            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(108, 93, 211, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(108, 93, 211, 0.2)', color: 'var(--primary)', fontSize: 20, flexShrink: 0 }}>🥟</div>
                                                        )}
                                                        <strong style={{ color: 'var(--text-main)' }}>{ct.ten_banh}</strong>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>{ct.ton_dau}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {isEditing ? <input className="input-field" style={{ width: 70, padding: '6px', textAlign: 'center', border: '1px solid var(--gray-200)' }} type="number" value={ct.so_bich_xuat} onChange={e => {
                                                            const newArr = [...editChiTiet]; newArr[i].so_bich_xuat = e.target.value; setEditChiTiet(newArr)
                                                        }} /> : `${ct.xuat}`}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {isEditing ? <input className="input-field" style={{ width: 70, padding: '6px', textAlign: 'center', border: '1px solid var(--gray-200)' }} type="number" value={ct.hong} onChange={e => {
                                                            const newArr = [...editChiTiet]; newArr[i].hong = e.target.value; setEditChiTiet(newArr)
                                                        }} /> : ct.hong}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {isEditing ? <input className="input-field" style={{ width: 70, padding: '6px', textAlign: 'center', border: '1px solid var(--gray-200)' }} type="number" value={ct.ton_cuoi} onChange={e => {
                                                            const newArr = [...editChiTiet]; newArr[i].ton_cuoi = e.target.value; setEditChiTiet(newArr)
                                                        }} /> : ct.ton_cuoi}
                                                    </td>
                                                    <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 'bold' }}>{ban}</td>
                                                    <td style={{ textAlign: 'right', color: 'var(--accent)', fontWeight: 'bold' }}>{Number(dt).toLocaleString('vi-VN')}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24, marginTop: 24 }}>
                                <div className="card" style={{ marginBottom: 0, padding: 20 }}>
                                    <h4 style={{ color: 'var(--text-main)', marginBottom: 16 }}>💸 Phát sinh</h4>
                                    {(phatSinhToRender || []).map((ps, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center', padding: '10px 16px', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                                            {isEditing ? (
                                                <div style={{ display: 'flex', gap: 8, width: '100%', flexWrap: 'wrap' }}>
                                                    <select className="input-field select-field" style={{ width: 80, padding: '6px 8px' }} value={ps.loai} onChange={e => {
                                                        const newArr = [...editPhatSinh]; newArr[i].loai = e.target.value; setEditPhatSinh(newArr)
                                                    }}>
                                                        <option value="thu">Thu</option><option value="chi">Chi</option>
                                                    </select>
                                                    <input className="input-field" style={{ flex: 1, padding: '6px 8px' }} value={ps.ten} onChange={e => {
                                                        const newArr = [...editPhatSinh]; newArr[i].ten = e.target.value; setEditPhatSinh(newArr)
                                                    }} placeholder="Tên" />
                                                    <input className="input-field" style={{ width: 100, padding: '6px 8px' }} type="number" value={ps.so_tien} onChange={e => {
                                                        const newArr = [...editPhatSinh]; newArr[i].so_tien = e.target.value; setEditPhatSinh(newArr)
                                                    }} placeholder="Số tiền" />
                                                    <button className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setEditPhatSinh(editPhatSinh.filter((_, idx) => idx !== i))}><X size={16} color="var(--danger)"/></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span style={{ 
                                                        padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 'bold',
                                                        background: ps.loai === 'thu' ? 'var(--success-bg)' : 'var(--danger-bg)',
                                                        color: ps.loai === 'thu' ? 'var(--success)' : 'var(--danger)'
                                                    }}>{ps.loai === 'thu' ? '+ THU' : '- CHI'}</span>
                                                    <span style={{ flex: 1, color: 'var(--text-main)' }}>{ps.ten}</span>
                                                    <strong style={{ color: ps.loai === 'thu' ? 'var(--success)' : 'var(--danger)' }}>{ps.loai === 'thu' ? '+' : '-'}{Number(ps.so_tien).toLocaleString('vi-VN')}đ</strong>
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

                                <div className="card" style={{ marginBottom: 0, padding: 20 }}>
                                    <h4 style={{ color: 'var(--text-main)', marginBottom: 16 }}>💰 Thu tiền & Bàn giao</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Tổng doanh thu:</span><strong className="text-primary" style={{ fontSize: 18 }}>{tongDt.toLocaleString('vi-VN')}đ</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>🛵 Grab:</span>
                                        {isEditing ? <input className="input-field" style={{ width: 120, textAlign: 'right', padding: '6px 12px' }} type="number" value={editTien.grab} onChange={e => setEditTien({...editTien, grab: e.target.value})} /> : <strong style={{ color: 'var(--text-main)' }}>{Number(ca.grab || 0).toLocaleString('vi-VN')}đ</strong>}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>🏦 Chuyển khoản:</span>
                                        {isEditing ? <input className="input-field" style={{ width: 120, textAlign: 'right', padding: '6px 12px' }} type="number" value={editTien.chuyen_khoan} onChange={e => setEditTien({...editTien, chuyen_khoan: e.target.value})} /> : <strong style={{ color: 'var(--text-main)' }}>{Number(ca.chuyen_khoan || 0).toLocaleString('vi-VN')}đ</strong>}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>💵 Tiền mặt:</span>
                                        {isEditing ? <input className="input-field" style={{ width: 120, textAlign: 'right', padding: '6px 12px' }} type="number" value={editTien.tien_mat} onChange={e => setEditTien({...editTien, tien_mat: e.target.value})} /> : <strong style={{ color: 'var(--text-main)' }}>{Number(ca.tien_mat || 0).toLocaleString('vi-VN')}đ</strong>}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>🤝 Bàn giao:</span>
                                        {isEditing ? <input className="input-field" style={{ width: 120, textAlign: 'right', padding: '6px 12px', fontWeight: 'bold' }} type="number" value={editTien.ban_giao} onChange={e => setEditTien({...editTien, ban_giao: e.target.value})} /> : <strong style={{ color: 'var(--text-main)' }}>{Number(ca.ban_giao || 0).toLocaleString('vi-VN')}đ</strong>}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--gray-200)' }}>
                                        <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Thiếu / Dư:</span>
                                        <strong style={{ 
                                            color: thieuDu >= 0 ? 'var(--success)' : 'var(--danger)',
                                            background: thieuDu >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                                            padding: '4px 12px', borderRadius: 8, fontSize: 18
                                        }}>{thieuDu >= 0 ? '+' : ''}{thieuDu.toLocaleString('vi-VN')}đ</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ marginTop: 24, marginBottom: 0, padding: 20 }}>
                                <h4 style={{ color: 'var(--text-main)', marginBottom: 12 }}>📝 Ghi chú</h4>
                                {isEditing ? (
                                    <textarea className="input-field" style={{ width: '100%', minHeight: 80, resize: 'vertical' }} value={editTien.ghi_chu} onChange={e => setEditTien({...editTien, ghi_chu: e.target.value})} />
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontStyle: ca.ghi_chu ? 'normal' : 'italic', margin: 0, lineHeight: 1.6 }}>{ca.ghi_chu || 'Không có ghi chú nào trong ca này.'}</p>
                                )}
                            </div>

                            {isOwner && lichSuSua.length > 0 && (
                                <div className="card" style={{ marginTop: 24, border: '1px solid rgba(251, 191, 36, 0.3)', background: 'rgba(251, 191, 36, 0.05)', marginBottom: 0 }}>
                                    <h4 style={{ color: 'var(--warning)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={18} /> Lịch sử chỉnh sửa</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {lichSuSua.map((ls, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, alignItems: 'center' }}>
                                                <div>
                                                    <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>{new Date(ls.ngay_sua).toLocaleString('vi-VN')}</strong>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Người sửa: <span style={{ color: 'var(--text-main)' }}>{ls.nguoi_sua_ten}</span></span>
                                                </div>
                                                <button onClick={() => handleRestore(ls.id)} className="btn btn-outline" style={{ borderColor: 'rgba(251, 191, 36, 0.5)', color: 'var(--warning)', padding: '8px 12px' }}>
                                                    <RotateCcw size={16}/> Khôi phục dữ liệu
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
        </>
    )

    if (inline) return (
        <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            style={{ overflow: 'hidden', borderTop: '1px solid var(--gray-200)', background: 'var(--glass-bg)' }}
        >
            {innerContent}
        </motion.div>
    )

    return (
        <AnimatePresence>
            <motion.div className="modal-overlay" style={s.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="modal-content" style={s.modal} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    {innerContent}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

const s = {
    overlay: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24
    },
    modal: {
        width: '100%', maxWidth: 1000,
        height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
    },
    header: {
        padding: '24px 32px', borderBottom: '1px solid var(--gray-200)', background: 'rgba(11, 15, 25, 0.6)', backdropFilter: 'blur(10px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    body: {
        flex: 1, overflowY: 'auto'
    }
}
