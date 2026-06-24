import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react'

const API = import.meta.env.VITE_API_URL

export default function SidebarLayout({ children, menuItems, activeTab, onTabChange }) {
    const { user, logout } = useAuth()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Parse avatar URL
    let avatarUrl = user?.avatar
    if (avatarUrl && !avatarUrl.startsWith('http')) {
        avatarUrl = `${API}${avatarUrl}`
    }

    return (
        <div style={s.layout}>
            {/* Mobile Header */}
            <div style={s.mobileHeader} className="mobile-header-responsive">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={s.logo}>B</div>
                    <span style={{ fontWeight: 'bold', fontSize: 18 }}>Bánh Bao</span>
                </div>
                <button onClick={() => setIsMobileOpen(true)} className="btn btn-ghost" style={{ padding: 4, color: 'var(--text-main)' }}>
                    <Menu size={24} />
                </button>
            </div>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div style={s.overlay} onClick={() => setIsMobileOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside style={{ ...s.sidebar, transform: isMobileOpen ? 'translateX(0)' : '' }} className="sidebar-responsive">
                <div style={s.sidebarHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={s.logo}>B</div>
                        <span style={{ fontWeight: 'bold', fontSize: 20 }}>Bánh Bao</span>
                    </div>
                    {/* Close btn on mobile only */}
                    <button onClick={() => setIsMobileOpen(false)} className="btn btn-ghost close-mobile" style={{ padding: 4, color: 'var(--text-main)', display: 'none' }}>
                        <X size={24} />
                    </button>
                </div>

                <nav style={s.nav}>
                    {menuItems.map(item => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                style={{ ...s.navItem, ...(isActive ? s.navItemActive : {}) }}
                                onClick={() => {
                                    onTabChange(item.id)
                                    setIsMobileOpen(false)
                                }}
                            >
                                <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
                                    {item.icon}
                                </span>
                                <span style={{ fontWeight: isActive ? '700' : '500' }}>{item.label}</span>
                            </button>
                        )
                    })}
                </nav>

                <div style={s.footer}>
                    <div style={s.userInfo}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="avatar" style={s.avatar} />
                        ) : (
                            <div style={s.avatarPlaceholder}><UserIcon size={20} color="var(--primary)" /></div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 'bold', fontSize: 14 }}>{user.ten}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {user.vai_tro === 'chu' ? '👑 Chủ Shop' : '💼 Nhân Viên'}
                            </span>
                        </div>
                    </div>
                    <button onClick={logout} style={s.logoutBtn}>
                        <LogOut size={18} /> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={s.main}>
                <div style={s.contentInner}>
                    {children}
                </div>
            </main>

            <style>{`
                @media (max-width: 768px) {
                    .sidebar-responsive {
                        transform: translateX(-100%);
                        position: fixed !important;
                        z-index: 1000;
                        transition: transform 0.3s ease;
                    }
                    .close-mobile { display: block !important; }
                }
                @media (min-width: 769px) {
                    .sidebar-responsive { transform: none !important; }
                    .mobile-header-responsive { display: none !important; }
                }
            `}</style>
        </div>
    )
}

const s = {
    layout: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-color)',
    },
    mobileHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        backgroundColor: 'var(--white)',
        borderBottom: '1px solid var(--gray-200)',
    },
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999
    },
    sidebar: {
        width: 260,
        backgroundColor: 'var(--white)',
        borderRight: '1px solid var(--gray-200)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
    },
    sidebarHeader: {
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--primary-light)',
    },
    logo: {
        width: 32, height: 32, borderRadius: 8,
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        color: 'var(--white)', fontWeight: '800', fontSize: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    nav: {
        flex: 1,
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflowY: 'auto'
    },
    navItem: {
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 12, border: 'none',
        background: 'transparent', color: 'var(--text-main)', fontSize: 15,
        cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
    },
    navItemActive: {
        background: 'var(--primary-light)',
        color: 'var(--primary)',
    },
    footer: {
        padding: 20,
        borderTop: '1px solid var(--gray-200)',
        backgroundColor: 'var(--white)',
    },
    userInfo: {
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16
    },
    avatar: {
        width: 40, height: 40, borderRadius: '50%', objectFit: 'cover',
        border: '2px solid var(--primary-light)'
    },
    avatarPlaceholder: {
        width: 40, height: 40, borderRadius: '50%',
        background: 'var(--primary-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    logoutBtn: {
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '10px', borderRadius: 8, border: 'none', background: 'var(--danger-bg)',
        color: 'var(--danger)', fontWeight: 'bold', cursor: 'pointer', transition: 'var(--transition)'
    },
    main: {
        flex: 1,
        height: '100vh',
        overflowY: 'auto',
    },
    contentInner: {
        maxWidth: 1000,
        margin: '0 auto',
        padding: '24px',
    }
}
