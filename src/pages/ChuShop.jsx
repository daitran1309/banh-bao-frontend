import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import BaoCao from './BaoCao'
import QuanLyBanh from './QuanLyBanh'
import LichSu from './LichSu'
import YeuCauSua from '../components/YeuCauSua'
import ChiTietCaModal from '../components/ChiTietCaModal'
import SidebarLayout from '../components/SidebarLayout'
import { ClipboardList, BarChart2, Clock, Package, Bell, User as UserIcon } from 'lucide-react'
import BienBan from './BienBan'
import CaNhan from './CaNhan'

export default function ChuShop() {
    const { user, token } = useAuth()
    const [tab, setTab] = useState('baocao')
    const [viewCaId, setViewCaId] = useState(null)
    const [refreshKey, setRefreshKey] = useState(0)

    // Bắt sự kiện xem chi tiết ca từ các component con
    useEffect(() => {
        const handleViewCa = (e) => setViewCaId(e.detail)
        window.addEventListener('xem-chi-tiet-ca', handleViewCa)
        return () => window.removeEventListener('xem-chi-tiet-ca', handleViewCa)
    }, [])

    const MENU = [
        { id: 'baocao', label: 'Báo cáo', icon: <BarChart2 size={20} /> },
        { id: 'bien_ban', label: 'Biên bản', icon: <ClipboardList size={20} /> },
        { id: 'lich_su', label: 'Lịch sử ca', icon: <Clock size={20} /> },
        { id: 'quan_ly', label: 'Quản lý bánh', icon: <Package size={20} /> },
        { id: 'yeu_cau', label: 'Yêu cầu sửa', icon: <Bell size={20} /> },
        { id: 'ca_nhan', label: 'Cá nhân', icon: <UserIcon size={20} /> },
    ]

    return (
        <SidebarLayout menuItems={MENU} activeTab={tab} onTabChange={setTab}>
            <div style={{ marginBottom: 32 }} className="animate-fade-in">
                <h1 style={{ margin: 0, fontSize: 28, color: 'var(--text-main)' }}>Quản lý Cửa Hàng 👋</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 8 }}>Xem tổng quan hoạt động kinh doanh hôm nay.</p>
            </div>

            {tab === 'bien_ban' && <BienBan key={`bb_${refreshKey}`} />}
            {tab === 'baocao' && <BaoCao key={`bc_${refreshKey}`} />}
            {tab === 'quan_ly' && <QuanLyBanh />}
            {tab === 'lich_su' && <LichSu key={`ls_${refreshKey}`} onCaClick={ca => setViewCaId(ca.id)} />}
            {tab === 'yeu_cau' && <YeuCauSua />}
            {tab === 'ca_nhan' && <CaNhan />}

            {viewCaId && <ChiTietCaModal caId={viewCaId} onClose={(changed) => {
                setViewCaId(null)
                if (changed) setRefreshKey(k => k + 1)
            }} user={user} token={token} />}
        </SidebarLayout>
    )
}