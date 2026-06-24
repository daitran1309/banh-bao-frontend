import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import InfoTooltip from '../components/InfoTooltip'

const API = import.meta.env.VITE_API_URL

export default function BaoCao({ nhanVienId }) {
    const { token } = useAuth()
    
    // Default to last 30 days
    const getDefaultDate = (daysAgo) => {
        const d = new Date()
        d.setDate(d.getDate() - daysAgo)
        return d.toISOString().split('T')[0]
    }
    const today = new Date().toISOString().split('T')[0]

    const [preset, setPreset] = useState('30_ngay')
    const [tuNgay, setTuNgay] = useState(getDefaultDate(30))
    const [denNgay, setDenNgay] = useState(today)
    const [data, setData] = useState(null)
    const [soSanh, setSoSanh] = useState(null)
    const [loading, setLoading] = useState(false)
    
    // For ChuShop to filter by employee
    const [danhSachNv, setDanhSachNv] = useState([])
    const [selectedNv, setSelectedNv] = useState('')

    useEffect(() => {
        if (!nhanVienId) {
            axios.get(`${API}/api/auth/danh-sach`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setDanhSachNv(res.data))
                .catch(e => console.error('Lỗi lấy danh sách NV:', e))
        }
    }, [nhanVienId, token])

    useEffect(() => { loadData() }, [tuNgay, denNgay, nhanVienId, selectedNv])

    function handlePresetChange(val) {
        setPreset(val)
        const d = new Date()
        const current = d.toISOString().split('T')[0]
        setDenNgay(current)

        if (val === 'hom_nay') {
            setTuNgay(current)
        } else if (val === 'tuan_nay') {
            const day = d.getDay()
            const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
            d.setDate(diff)
            setTuNgay(d.toISOString().split('T')[0])
        } else if (val === 'thang_nay') {
            d.setDate(1)
            setTuNgay(d.toISOString().split('T')[0])
        } else if (val === '30_ngay') {
            setTuNgay(getDefaultDate(30))
        } else if (val === 'quy_nay') {
            const quarter = Math.floor((d.getMonth() / 3))
            d.setMonth(quarter * 3, 1)
            setTuNgay(d.toISOString().split('T')[0])
        } else if (val === 'nam_nay') {
            d.setMonth(0, 1)
            setTuNgay(d.toISOString().split('T')[0])
        }
    }

    async function loadData() {
        setLoading(true)
        try {
            const effectiveNvId = nhanVienId || selectedNv
            const query = `?tu_ngay=${tuNgay}&den_ngay=${denNgay}${effectiveNvId ? `&nhan_vien_id=${effectiveNvId}` : ''}`
            const headers = { Authorization: `Bearer ${token}` }
            const [r1, r2] = await Promise.all([
                axios.get(`${API}/api/baocao/theo-ngay${query}`, { headers }),
                axios.get(`${API}/api/baocao/so-sanh${query}`, { headers })
            ])
            setData(r1.data)
            setSoSanh(r2.data)
        } catch (e) {
            console.error('Lỗi báo cáo:', e)
        } finally {
            setLoading(false)
        }
    }

    const chartData = data?.theo_ngay?.map(d => ({
        ngay: d.ngay.slice(5),
        'Doanh thu': d.doanh_thu
    })) || []

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: '#fff',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: 12,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: 4 }}>{label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF6A00' }}></div>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: 15 }}>
                            {payload[0].value.toLocaleString('vi-VN')}
                        </span>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <div style={s.wrap}>
            {/* Bộ lọc ngày */}
            <div style={s.filterBox}>
                {!nhanVienId && (
                    <div style={s.filterRow}>
                        <label style={s.label}>Nhân viên:</label>
                        <select className="input-field" value={selectedNv} onChange={e => setSelectedNv(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '2px solid var(--gray-200)' }}>
                            <option value="">Tất cả nhân viên</option>
                            {danhSachNv.map(nv => (
                                <option key={nv.id} value={nv.id}>{nv.ten}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div style={s.filterRow}>
                    <label style={s.label}>Thời gian:</label>
                    <select className="input-field" value={preset} onChange={e => handlePresetChange(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '2px solid var(--gray-200)' }}>
                        <option value="hom_nay">Hôm nay</option>
                        <option value="tuan_nay">Tuần này</option>
                        <option value="thang_nay">Tháng này</option>
                        <option value="30_ngay">30 ngày qua</option>
                        <option value="quy_nay">Quý này</option>
                        <option value="nam_nay">Năm nay</option>
                        <option value="tuy_chinh">Tùy chỉnh...</option>
                    </select>
                </div>
                <div style={s.filterRow}>
                    <label style={s.label}>Từ ngày:</label>
                    <input type="date" value={tuNgay} onChange={e => { setTuNgay(e.target.value); setPreset('tuy_chinh') }} style={s.dateInput} />
                </div>
                <div style={s.filterRow}>
                    <label style={s.label}>Đến ngày:</label>
                    <input type="date" value={denNgay} onChange={e => { setDenNgay(e.target.value); setPreset('tuy_chinh') }} style={s.dateInput} />
                </div>
                <button style={s.btnLoad} onClick={loadData} disabled={loading}>
                    {loading ? 'Đang tải...' : '🔍 Xem'}
                </button>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 24 }} className="animate-fade-in">Đang tải dữ liệu...</p>
            ) : !data ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 24 }} className="animate-fade-in">Không có dữ liệu</p>
            ) : (
                <>
                {/* Tổng quan */}
                <div style={s.summaryRow}>
                    <div style={{ ...s.summaryCard, background: 'var(--primary)' }} className="animate-slide-up">
                        <div style={s.summaryLabel}>Tổng doanh thu</div>
                        <div style={s.summaryVal}>{data.tong_doanh_thu.toLocaleString('vi-VN')}đ</div>
                    </div>
                    <div style={{ ...s.summaryCard, background: 'var(--accent)' }} className="animate-slide-up">
                        <div style={s.summaryLabel}>Số ca đã làm</div>
                        <div style={s.summaryVal}>{data.tong_ca} ca</div>
                    </div>
                </div>

                {/* Biểu đồ doanh thu */}
                <div style={s.card} className="animate-slide-up">
                    <h3 style={s.cardTitle}>
                        📈 Doanh thu theo ngày 
                        <InfoTooltip text={nhanVienId ? "Xem xu hướng doanh thu cá nhân từ các ca do chính bạn bán." : "Xem xu hướng doanh thu qua các ngày. Rê chuột vào điểm để xem chi tiết."} />
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorDoanhThu" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#FF6A00" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="ngay" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={v => (v / 1000) + 'k'} axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FF6A00', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.4 }} />
                            <Area 
                                type="monotone" 
                                dataKey="Doanh thu" 
                                stroke="#FF6A00" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorDoanhThu)" 
                                dot={{ r: 4, fill: '#fff', stroke: '#FF6A00', strokeWidth: 2 }}
                                activeDot={{ r: 7, fill: '#FF6A00', stroke: '#fff', strokeWidth: 3, style: { filter: 'drop-shadow(0px 2px 4px rgba(255,106,0,0.4))' } }}
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* So sánh ca */}
                {soSanh && (
                    <div style={s.card}>
                        <h3 style={s.cardTitle}>⚖️ So sánh Ca Sáng vs Ca Chiều <InfoTooltip text="Đánh giá hiệu suất bán hàng giữa các ca làm việc" /></h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={[
                                { name: '☀️ Ca Sáng', 'Doanh thu': soSanh.sang.tong_dt, 'TB/ca': soSanh.sang.tb_moi_ca },
                                { name: '🌙 Ca Chiều', 'Doanh thu': soSanh.chieu.tong_dt, 'TB/ca': soSanh.chieu.tb_moi_ca },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={v => (v / 1000) + 'k'} />
                                <Tooltip formatter={v => v.toLocaleString('vi-VN') + 'đ'} />
                                <Legend />
                                <Bar dataKey="Doanh thu" fill="var(--primary)" />
                                <Bar dataKey="TB/ca" fill="var(--accent)" />
                            </BarChart>
                        </ResponsiveContainer>
                        <div style={s.soSanhRow}>
                            <div style={s.soSanhCard}>
                                <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>☀️ Ca Sáng</div>
                                <div>{soSanh.sang.so_ca} ca</div>
                                <div style={{ color: 'var(--danger)' }}>{soSanh.sang.tong_dt.toLocaleString('vi-VN')}đ</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>TB: {soSanh.sang.tb_moi_ca.toLocaleString('vi-VN')}đ/ca</div>
                            </div>
                            <div style={s.soSanhCard}>
                                <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>🌙 Ca Chiều</div>
                                <div>{soSanh.chieu.so_ca} ca</div>
                                <div style={{ color: 'var(--danger)' }}>{soSanh.chieu.tong_dt.toLocaleString('vi-VN')}đ</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>TB: {soSanh.chieu.tb_moi_ca.toLocaleString('vi-VN')}đ/ca</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bánh bán chạy */}
                <div style={s.card} className="animate-slide-up">
                    <h3 style={s.cardTitle}>🏆 Bánh bán chạy <InfoTooltip text="Top bánh có số lượng bán nhiều nhất trong khoảng thời gian chọn" /></h3>
                    {data.theo_loai.slice(0, 10).map((b, i) => (
                        <div key={i} style={s.banhRow}>
                            <div style={s.rank}>{i + 1}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold' }}>{b.ten_banh}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{b.tong_ban} cái</div>
                            </div>
                            <div style={{ color: 'var(--danger)', fontWeight: 'bold' }}>
                                {b.tong_dt.toLocaleString('vi-VN')}đ
                            </div>
                        </div>
                    ))}
                </div>
                </>
            )}
        </div>
    )
}

const s = {
    wrap: { padding: '0 0 24px' },
    filterBox: {
        background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
        border: '2px solid var(--gray-200)', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end'
    },
    filterRow: { display: 'flex', flexDirection: 'column', gap: 4 },
    label: { fontSize: 13, color: 'var(--text-muted)', fontWeight: 'bold' },
    dateInput: { padding: '8px 12px', fontSize: 15, borderRadius: 8, border: '2px solid var(--gray-200)' },
    btnLoad: {
        padding: '8px 20px', fontSize: 15, borderRadius: 8, border: 'none',
        background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
    },
    summaryRow: { display: 'flex', gap: 12, marginBottom: 16 },
    summaryCard: { flex: 1, borderRadius: 12, padding: 16, color: '#fff', textAlign: 'center' },
    summaryLabel: { fontSize: 13, opacity: 0.9 },
    summaryVal: { fontSize: 22, fontWeight: 'bold', marginTop: 4 },
    card: {
        background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
        border: '2px solid var(--gray-200)'
    },
    cardTitle: { margin: '0 0 12px', color: 'var(--text-main)', fontSize: 16 },
    soSanhRow: { display: 'flex', gap: 12, marginTop: 12 },
    soSanhCard: { flex: 1, background: 'var(--primary-light)', borderRadius: 10, padding: 12, textAlign: 'center', lineHeight: 1.8 },
    banhRow: {
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
        borderBottom: '1px solid var(--primary-light)'
    },
    rank: {
        width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-light)',
        color: 'var(--text-main)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
}