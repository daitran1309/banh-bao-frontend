import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Check, X, Bell } from 'lucide-react'
import { StaggerContainer, BubbleItem } from './BubbleAnimation'

const API = import.meta.env.VITE_API_URL

export default function YeuCauSua({ token }) {
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

    function dispatchViewCa(caId) {
        window.dispatchEvent(new CustomEvent('xem-chi-tiet-ca', { detail: caId }))
    }

    if (loading) return <p style={{ textAlign: 'center', color: 'var(--text-muted)' }} className="animate-fade-in">Đang tải dữ liệu yêu cầu...</p>
    if (yeuCaus.length === 0) return <p style={{ textAlign: 'center', color: 'var(--text-muted)' }} className="animate-fade-in">Không có yêu cầu sửa ca nào.</p>

    return (
        <StaggerContainer delay={0.1} className="card">
            <h3 style={{ margin: '0 0 24px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Bell size={24} color="var(--warning)" /> Danh sách Yêu cầu Sửa Ca
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {yeuCaus.map((yc, i) => (
                    <BubbleItem key={yc.id} delay={(i % 5) * 0.1} style={{ 
                        border: '1px solid var(--gray-200)', 
                        padding: '16px 20px', borderRadius: 12, display: 'flex', justifyContent: 'space-between', 
                        alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 
                    }}>
                        <div style={{ flex: 1, minWidth: 250 }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: 16 }}>Ca {yc.ca?.loai_ca === 'sang' ? 'Sáng' : 'Chiều'} ngày {yc.ca?.ngay}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
                                Nhân viên: <span style={{ color: 'var(--text-main)' }}>{yc.nhan_vien_ten}</span> • Gửi lúc {new Date(yc.ngay_tao).toLocaleString('vi-VN')}
                            </div>
                            <div style={{ background: 'rgba(108, 93, 211, 0.1)', borderLeft: '3px solid var(--primary)', padding: '10px 12px', borderRadius: '0 8px 8px 0', marginTop: 12, fontSize: 14, color: 'var(--text-main)' }}>
                                <strong style={{ color: 'var(--primary)' }}>Lý do xin sửa:</strong> {yc.noi_dung}
                            </div>
                            <div style={{ marginTop: 12, fontSize: 14 }}>
                                Trạng thái: 
                                <span style={{ 
                                    marginLeft: 8, fontWeight: 'bold', padding: '4px 10px', borderRadius: 100, fontSize: 12,
                                    background: yc.trang_thai === 'cho_duyet' ? 'rgba(108, 93, 211, 0.2)' : yc.trang_thai === 'da_duyet' ? 'var(--success-bg)' : yc.trang_thai === 'tu_choi' ? 'var(--danger-bg)' : 'rgba(0,0,0,0.3)',
                                    color: yc.trang_thai === 'cho_duyet' ? 'var(--primary)' : yc.trang_thai === 'da_duyet' ? 'var(--success)' : yc.trang_thai === 'tu_choi' ? 'var(--danger)' : 'var(--text-muted)'
                                }}>
                                    {yc.trang_thai === 'cho_duyet' ? 'Chờ duyệt' : yc.trang_thai === 'da_duyet' ? 'Đã duyệt' : yc.trang_thai === 'tu_choi' ? 'Từ chối' : 'Đã sửa xong'}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', minWidth: 150 }}>
                            <button onClick={() => dispatchViewCa(yc.ca_id)} className="btn btn-outline" style={{ width: '100%' }}>Xem chi tiết ca</button>
                            {yc.trang_thai === 'cho_duyet' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                                    <button onClick={() => handleDuyet(yc.id, 'da_duyet')} className="btn btn-primary" style={{ background: 'var(--success)', width: '100%' }}><Check size={16}/> Duyệt</button>
                                    <button onClick={() => handleDuyet(yc.id, 'tu_choi')} className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', width: '100%' }}><X size={16}/> Từ chối</button>
                                </div>
                            )}
                        </div>
                    </BubbleItem>
                ))}
            </div>
        </StaggerContainer>
    )
}
