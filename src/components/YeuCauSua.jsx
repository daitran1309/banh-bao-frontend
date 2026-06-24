import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Check, X } from 'lucide-react'

const API = import.meta.env.VITE_API_URL

export default function YeuCauSua({ token, onViewCa }) {
    const [yeuCaus, setYeuCaus] = useState([])
    const [loading, setLoading] = useState(false)
    const headers = { Authorization: `Bearer ${token}` }

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        try {
            const res = await axios.get(`${API}/api/yeucau/danh-sach`, { headers })
            setYeuCaus(res.data)
        } finally { setLoading(false) }
    }

    async function handleDuyet(id, trang_thai) {
        if (!window.confirm(`Xác nhận ${trang_thai === 'da_duyet' ? 'Duyệt' : 'Từ chối'}?`)) return
        try {
            await axios.post(`${API}/api/yeucau/duyet/${id}`, { trang_thai }, { headers })
            load()
        } catch (e) {
            alert('Lỗi: ' + (e.response?.data?.error || e.message))
        }
    }

    if (loading) return <p style={{ textAlign: 'center' }}>Đang tải...</p>
    if (yeuCaus.length === 0) return <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Không có yêu cầu nào</p>

    return (
        <div className="card">
            <h3 style={{ margin: '0 0 16px' }}>Danh sách Yêu cầu Sửa Ca</h3>
            {yeuCaus.map((yc) => (
                <div key={yc.id} style={{ borderBottom: '1px solid var(--gray-200)', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontWeight: 'bold' }}>Ca {yc.ca?.loai_ca === 'sang' ? 'Sáng' : 'Chiều'} ngày {yc.ca?.ngay}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                            Nhân viên: {yc.nhan_vien_ten} • Gửi lúc {new Date(yc.ngay_tao).toLocaleString('vi-VN')}
                        </div>
                        <div style={{ background: 'var(--primary-light)', padding: 8, borderRadius: 8, marginTop: 8, fontSize: 14 }}>
                            <strong>Lý do:</strong> {yc.noi_dung}
                        </div>
                        <div style={{ marginTop: 8, fontSize: 14 }}>
                            Trạng thái: 
                            <span style={{ marginLeft: 4, fontWeight: 'bold', color: yc.trang_thai === 'cho_duyet' ? 'var(--primary)' : yc.trang_thai === 'da_duyet' ? 'var(--success)' : yc.trang_thai === 'tu_choi' ? 'var(--danger)' : 'var(--info)' }}>
                                {yc.trang_thai === 'cho_duyet' ? 'Chờ duyệt' : yc.trang_thai === 'da_duyet' ? 'Đã duyệt' : yc.trang_thai === 'tu_choi' ? 'Từ chối' : 'Đã sửa xong'}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                        <button onClick={() => onViewCa(yc.ca_id)} className="btn btn-outline" style={{ fontSize: 13, padding: '6px 10px' }}>Xem chi tiết ca</button>
                        {yc.trang_thai === 'cho_duyet' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => handleDuyet(yc.id, 'tu_choi')} className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 13, padding: '6px 10px' }}><X size={16}/> Từ chối</button>
                                <button onClick={() => handleDuyet(yc.id, 'da_duyet')} className="btn btn-primary" style={{ background: 'var(--success)', fontSize: 13, padding: '6px 10px' }}><Check size={16}/> Duyệt cho sửa</button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
