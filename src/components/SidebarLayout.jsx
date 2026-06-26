import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Menu, X, LogOut, User as UserIcon, Search, Bell, Sun, Moon } from 'lucide-react'
import { StaggerContainer, BubbleItem } from './BubbleAnimation'

const API = import.meta.env.VITE_API_URL

export default function SidebarLayout({ children, menuItems, activeTab, onTabChange }) {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Parse avatar URL
    let avatarUrl = user?.avatar
    if (avatarUrl && !avatarUrl.startsWith('http')) {
        avatarUrl = `${API}${avatarUrl}`
    }

    return (
        <div style={s.layout}>
            {/* Sidebar */}
            <aside style={{ ...s.sidebar, transform: isMobileOpen ? 'translateX(0)' : '' }} className="sidebar-responsive">
                <div style={s.sidebarHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={s.logo}>B</div>
                        <span style={{ fontWeight: '700', fontSize: 22, color: 'var(--text-main)', letterSpacing: 1 }}>Bánh Bao</span>
                    </div>
                    <button onClick={() => setIsMobileOpen(false)} className="btn btn-ghost close-mobile" style={{ padding: 4, display: 'none' }}>
                        <X size={24} />
                    </button>
                </div>

                <StaggerContainer delay={0.1} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    <nav style={s.nav} className="no-scrollbar">
                        {menuItems.map((item, i) => {
                            const isActive = activeTab === item.id;
                            return (
                                <BubbleItem
                                    key={item.id}
                                    delay={i * 0.3}
                                    style={{ ...s.navItem, ...(isActive ? s.navItemActive : {}) }}
                                    onClick={() => {
                                        onTabChange(item.id)
                                        setIsMobileOpen(false)
                                    }}
                                    className="dock-item"
                                >
                                    <span style={{ color: isActive ? 'var(--white)' : 'var(--text-muted)' }}>
                                        {item.icon}
                                    </span>
                                    <span style={{ fontWeight: isActive ? '600' : '500' }}>{item.label}</span>
                                </BubbleItem>
                            )
                        })}
                    </nav>
                </StaggerContainer>

                <div style={s.footer}>
                    <button onClick={logout} style={s.logoutBtn}>
                        <LogOut size={18} /> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div style={s.overlay} onClick={() => setIsMobileOpen(false)}></div>
            )}

            {/* Main Content Area */}
            <main style={s.main}>
                {/* Topbar */}
                <StaggerContainer delay={0.2}>
                    <header style={s.topbar}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <BubbleItem>
                                <button onClick={() => setIsMobileOpen(true)} className="btn btn-ghost mobile-menu-btn" style={{ padding: 8, display: 'none' }}>
                                    <Menu size={24} color="var(--white)" />
                                </button>
                            </BubbleItem>

                            <BubbleItem style={s.searchBox} className="hide-on-mobile">
                                <Search size={18} color="var(--text-muted)" />
                                <input type="text" placeholder="Tìm kiếm..." style={s.searchInput} />
                            </BubbleItem>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            <BubbleItem>
                                <button style={s.iconBtn} onClick={toggleTheme}>
                                    {theme === 'light' ? <Moon size={20} color="var(--primary)" /> : <Sun size={20} color="var(--warning)" />}
                                </button>
                            </BubbleItem>

                            <BubbleItem>
                                <button style={s.iconBtn}>
                                    <Bell size={20} />
                                    <span style={s.notificationDot}></span>
                                </button>
                            </BubbleItem>

                            <BubbleItem style={s.userInfo}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }} className="hide-on-mobile">
                                    <span style={{ fontWeight: '600', fontSize: 14, color: 'var(--text-main)' }}>{user.ten}</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {user.vai_tro === 'chu' ? 'Admin' : 'Nhân Viên'}
                                    </span>
                                </div>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="avatar" style={s.avatar} />
                                ) : (
                                    <div style={s.avatarPlaceholder}><UserIcon size={20} color="var(--white)" /></div>
                                )}
                            </BubbleItem>
                        </div>
                    </header>
                </StaggerContainer>

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
                        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .close-mobile { display: block !important; }
                    .mobile-menu-btn { display: block !important; }
                    .hide-on-mobile { display: none !important; }
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
        backgroundImage: 'var(--bg-gradient)',
    },
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 999
    },
    sidebar: {
        width: 280,
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--gray-200)', /* Phục hồi viền Sidebar */
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
    },
    sidebarHeader: {
        padding: '32px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        width: 36, height: 36, borderRadius: 10,
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        color: 'var(--white)', fontWeight: '800', fontSize: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(108, 93, 211, 0.4)'
    },
    nav: {
        height: '100%',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflowY: 'auto',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE
    },
    navItem: {
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 20px', borderRadius: 14,
        border: '1px solid var(--gray-200)',
        background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)', fontSize: 15,
        cursor: 'pointer', textAlign: 'left',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    },
    navItemActive: {
        background: 'var(--primary-light)',
        color: 'var(--text-main)',
        border: '1px solid var(--primary)',
        borderLeft: '4px solid var(--primary)',
    },
    footer: {
        padding: 24,
    },
    logoutBtn: {
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: '14px', borderRadius: 14, border: '1px solid rgba(255, 77, 79, 0.2)',
        background: 'rgba(255, 77, 79, 0.05)',
        color: 'var(--danger)', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition)'
    },
    main: {
        flex: 1,
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
    },
    topbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--gray-200)',
        position: 'sticky',
        top: 0,
        zIndex: 100
    },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--glass-bg)',
        border: '1px solid var(--gray-200)',
        borderRadius: 100,
        padding: '10px 20px',
        width: 300,
        transition: 'var(--transition)'
    },
    searchInput: {
        background: 'transparent',
        border: 'none',
        color: 'var(--text-main)',
        outline: 'none',
        width: '100%',
        fontFamily: 'var(--font-body)',
        fontSize: '0.95rem'
    },
    iconBtn: {
        background: 'var(--glass-bg)', backdropFilter: 'blur(10px)',
        border: '1px solid var(--gray-200)',
        borderRadius: '50%',
        width: 44, height: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', cursor: 'pointer', position: 'relative',
        transition: 'var(--transition)'
    },
    notificationDot: {
        position: 'absolute', top: 10, right: 12,
        width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
        boxShadow: '0 0 10px var(--accent)'
    },
    userInfo: {
        display: 'flex', alignItems: 'center', gap: 16
    },
    avatar: {
        width: 44, height: 44, borderRadius: '50%', objectFit: 'cover',
        border: '2px solid var(--primary)',
        boxShadow: '0 0 15px rgba(108, 93, 211, 0.3)'
    },
    avatarPlaceholder: {
        width: 44, height: 44, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    contentInner: {
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px',
        width: '100%'
    }
}
