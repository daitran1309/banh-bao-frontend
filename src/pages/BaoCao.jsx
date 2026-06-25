import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import InfoTooltip from '../components/InfoTooltip'
import { motion } from 'framer-motion'

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
                    background: 'rgba(11, 15, 25, 0.9)',
                    backdropFilter: 'blur(10px)',
                    padding: '12px 16px',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: '600', marginBottom: 8 }}>{label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
                        <span style={{ fontWeight: 'bold', color: 'var(--white)', fontSize: 16 }}>
                            {payload[0].value.toLocaleString('vi-VN')}đ
                        </span>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <div className="animate-fade-in">
            {/* Bộ lọc ngày */}
            <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', marginBottom: 24 }}>
                {!nhanVienId && (
                    <div style={s.filterRow}>
                        <label style={s.label}>Nhân viên:</label>
                        <select className="input-field select-field" value={selectedNv} onChange={e => setSelectedNv(e.target.value)}>
                            <option value="">Tất cả nhân viên</option>
                            {danhSachNv.map(nv => (
                                <option key={nv.id} value={nv.id}>{nv.ten}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div style={s.filterRow}>
                    <label style={s.label}>Thời gian:</label>
                    <select className="input-field select-field" value={preset} onChange={e => handlePresetChange(e.target.value)}>
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
                    <input type="date" value={tuNgay} onChange={e => { setTuNgay(e.target.value); setPreset('tuy_chinh') }} className="input-field" />
                </div>
                <div style={s.filterRow}>
                    <label style={s.label}>Đến ngày:</label>
                    <input type="date" value={denNgay} onChange={e => { setDenNgay(e.target.value); setPreset('tuy_chinh') }} className="input-field" />
                </div>
                <button className="btn btn-primary" onClick={loadData} disabled={loading} style={{ padding: '14px 24px' }}>
                    {loading ? 'Đang tải...' : '🔍 Xem dữ liệu'}
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24 }}>
                    <div style={{ display: 'flex', gap: 24 }}>
                        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ flex: 1, height: 120, borderRadius: 20, background: 'var(--glass-bg)' }} />
                        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} style={{ flex: 1, height: 120, borderRadius: 20, background: 'var(--glass-bg)' }} />
                    </div>
                    <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} style={{ width: '100%', height: 350, borderRadius: 20, background: 'var(--glass-bg)' }} />
                </div>
            ) : !data ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }} className="animate-fade-in">Không có dữ liệu trong khoảng thời gian này</p>
            ) : (
                <>
                {/* Tổng quan */}
                <div style={s.summaryRow}>
                    <div style={{ ...s.summaryCard, background: 'linear-gradient(135deg, rgba(108, 93, 211, 0.2), rgba(108, 93, 211, 0.05))', border: '1px solid rgba(108, 93, 211, 0.3)' }} className="animate-slide-up stagger-1">
                        <div style={s.summaryLabel}>Tổng doanh thu</div>
                        <div style={{ ...s.summaryVal, color: 'var(--primary)', textShadow: '0 0 20px rgba(108, 93, 211, 0.5)' }}>
                            {data.tong_doanh_thu.toLocaleString('vi-VN')}đ
                        </div>
                    </div>
                    <div style={{ ...s.summaryCard, background: 'linear-gradient(135deg, rgba(255, 117, 216, 0.2), rgba(255, 117, 216, 0.05))', border: '1px solid rgba(255, 117, 216, 0.3)' }} className="animate-slide-up stagger-2">
                        <div style={s.summaryLabel}>Số ca đã làm</div>
                        <div style={{ ...s.summaryVal, color: 'var(--accent)', textShadow: '0 0 20px rgba(255, 117, 216, 0.5)' }}>
                            {data.tong_ca} ca
                        </div>
                    </div>
                </div>

                {/* Biểu đồ doanh thu */}
                <div className="card animate-slide-up stagger-3">
                    <h3 className="card-title">
                        📈 Doanh thu theo ngày 
                        <InfoTooltip text={nhanVienId ? "Xem xu hướng doanh thu cá nhân từ các ca do chính bạn bán." : "Xem xu hướng doanh thu qua các ngày. Rê chuột vào điểm để xem chi tiết."} />
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorDoanhThu" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--gray-200)" />
                            <XAxis dataKey="ngay" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={v => (v / 1000) + 'k'} axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }} />
                            <Area 
                                type="monotone" 
                                dataKey="Doanh thu" 
                                stroke="var(--primary)" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorDoanhThu)" 
                                dot={{ r: 4, fill: '#1a153a', stroke: 'var(--primary)', strokeWidth: 2 }}
                                activeDot={{ r: 7, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 3, style: { filter: 'drop-shadow(0px 0px 10px rgba(108, 93, 211, 0.8))' } }}
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* So sánh ca & Bánh bán chạy */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                    {soSanh && (
                        <div className="card animate-slide-up stagger-4" style={{ flex: '1 1 400px', marginBottom: 0 }}>
                            <h3 className="card-title">⚖️ So sánh Ca Sáng vs Chiều <InfoTooltip text="Đánh giá hiệu suất bán hàng giữa các ca làm việc" /></h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={[
                                    { name: '☀️ Ca Sáng', 'Doanh thu': soSanh.sang.tong_dt, 'TB/ca': soSanh.sang.tb_moi_ca },
                                    { name: '🌙 Ca Chiều', 'Doanh thu': soSanh.chieu.tong_dt, 'TB/ca': soSanh.chieu.tb_moi_ca },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--gray-200)" />
                                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={v => (v / 1000) + 'k'} tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        formatter={v => v.toLocaleString('vi-VN') + 'đ'} 
                                        contentStyle={{ background: 'rgba(11,15,25,0.9)', border: '1px solid var(--gray-200)', borderRadius: 8, color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                                    <Bar dataKey="Doanh thu" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="TB/ca" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div style={s.soSanhRow}>
                                <div style={{ ...s.soSanhCard, borderTop: '2px solid var(--primary)' }}>
                                    <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>☀️ Ca Sáng</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{soSanh.sang.so_ca} ca</div>
                                    <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: 16 }}>{soSanh.sang.tong_dt.toLocaleString('vi-VN')}đ</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>TB: {soSanh.sang.tb_moi_ca.toLocaleString('vi-VN')}đ/ca</div>
                                </div>
                                <div style={{ ...s.soSanhCard, borderTop: '2px solid var(--accent)' }}>
                                    <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>🌙 Ca Chiều</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{soSanh.chieu.so_ca} ca</div>
                                    <div style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: 16 }}>{soSanh.chieu.tong_dt.toLocaleString('vi-VN')}đ</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>TB: {soSanh.chieu.tb_moi_ca.toLocaleString('vi-VN')}đ/ca</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bánh bán chạy */}
                    <motion.div 
                        className="card" 
                        style={{ flex: '1 1 400px', marginBottom: 0 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h3 className="card-title">🏆 Top Sản Phẩm Bán Chạy <InfoTooltip text="Top bánh có số lượng bán nhiều nhất trong khoảng thời gian chọn" /></h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {data.theo_loai.slice(0, 10).map((b, i) => (
                                <motion.div 
                                    key={i} 
                                    style={s.banhRow}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                    whileHover={{ scale: 1.02, background: 'var(--primary-light)' }}
                                >
                                    <div style={{ ...s.rank, background: i < 3 ? 'var(--primary)' : 'var(--gray-200)', color: i < 3 ? '#fff' : 'var(--text-muted)' }}>
                                        {i + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{b.ten_banh}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{b.tong_ban} cái đã bán</div>
                                    </div>
                                    <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                                        {b.tong_dt.toLocaleString('vi-VN')}đ
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
                </>
            )}
        </div>
    )
}

const s = {
    filterRow: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: { fontSize: 13, color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    summaryRow: { display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' },
    summaryCard: { flex: '1 1 200px', borderRadius: 20, padding: 24, textAlign: 'center', backdropFilter: 'blur(10px)' },
    summaryLabel: { fontSize: 14, color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
    summaryVal: { fontSize: 32, fontWeight: '800', marginTop: 8 },
    soSanhRow: { display: 'flex', gap: 16, marginTop: 24 },
    soSanhCard: { flex: 1, border: '1px solid var(--gray-200)', borderRadius: 12, padding: 16, textAlign: 'center', lineHeight: 1.6 },
    banhRow: {
        display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px',
        borderRadius: 12,
        border: '1px solid var(--gray-200)', transition: 'var(--transition)'
    },
    rank: {
        width: 32, height: 32, borderRadius: '50%',
        fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
    },
}