const fs = require('fs');
let c = fs.readFileSync('src/pages/NhanVien.jsx', 'utf8');

// Replace imports
c = c.replace(/import \{ xuatExcelBienBan \} from '\.\.\/utils\/excel'\r?\nimport \{ Sun, Moon, Play, LogOut, Lock, Wallet, Banknote, CreditCard, Plus, X, Square, Download \} from 'lucide-react'/,
`import { xuatExcelBienBan } from '../utils/excel'
import LichSu from './LichSu'
import ChiTietCaModal from '../components/ChiTietCaModal'
import { Sun, Moon, Play, LogOut, Lock, Wallet, Banknote, CreditCard, Plus, X, Square, Download, Clock, Briefcase } from 'lucide-react'`);

// Add states
c = c.replace(/const \[loadingXuat, setLoadingXuat\] = useState\(false\)/,
`const [loadingXuat, setLoadingXuat] = useState(false)
    const [tab, setTab] = useState('lam_viec')
    const [viewCaId, setViewCaId] = useState(null)`);

// Extract chunks
const startChonCa = c.indexOf("    if (step === 'chon_ca') return (");
const endChonCa = c.indexOf("    )\r\n\r\n    return (");
if (startChonCa === -1 || endChonCa === -1) {
    const endChonCa2 = c.indexOf("    )\n\n    return (");
    if (endChonCa2 === -1) throw new Error("Could not find endChonCa");
}
const actualEndChonCa = endChonCa !== -1 ? endChonCa : c.indexOf("    )\n\n    return (");

const startDangLam = actualEndChonCa + (endChonCa !== -1 ? 18 : 16);
const endDangLam = c.lastIndexOf("            {showDoiMK && <DoiMatKhau onClose={() => setShowDoiMK(false)} />}\r\n        </div>\r\n    )\r\n}");
const actualEndDangLam = endDangLam !== -1 ? endDangLam : c.lastIndexOf("            {showDoiMK && <DoiMatKhau onClose={() => setShowDoiMK(false)} />}\n        </div>\n    )\n}");

let chonCaContent = c.substring(startChonCa + (c.indexOf('\r\n') !== -1 ? 38 : 36), actualEndChonCa);
// remove app-container and header
chonCaContent = chonCaContent.replace(/<div className="app-container">[\s\S]*?<\/div>\r?\n\s*\{msg && <div className="card"/, '{msg && <div className="card"');

let dangLamContent = c.substring(startDangLam + (c.indexOf('\r\n') !== -1 ? 33 : 31), actualEndDangLam);
// remove app-container and header
dangLamContent = dangLamContent.replace(/<div className="header-bar bg-cta">[\s\S]*?<\/div>\r?\n\r?\n\s*\{\/\* Tổng doanh thu \*\/\}/, '{/* Tổng doanh thu */}');

const newReturn = `
    function renderChonCa() {
        return (
            <div>
                ${chonCaContent}
            </div>
        )
    }

    function renderDangLam() {
        return (
            <div>
                ${dangLamContent}
            </div>
        )
    }

    return (
        <div className="app-container">
            <div className="header-bar bg-cta">
                <div className="flex-gap">
                    <span>🥟 {user.ten} {step === 'dang_lam' ? \`— Ca \${loaiCa === 'sang' ? 'Sáng' : 'Chiều'}\` : ''}</span>
                </div>
                <div className="flex-gap">
                    <button onClick={() => setShowDoiMK(true)} className="btn btn-ghost" style={{ padding: '8px 12px' }}><Lock size={16} /></button>
                    <button onClick={logout} className="btn btn-ghost" style={{ padding: '8px 12px' }}><LogOut size={16} /> Thoát</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button className={\`btn btn-outline \${tab === 'lam_viec' ? 'active' : ''}\`} style={{ flex: 1 }} onClick={() => setTab('lam_viec')}>
                    <Briefcase size={16} /> Làm việc
                </button>
                <button className={\`btn btn-outline \${tab === 'lich_su' ? 'active' : ''}\`} style={{ flex: 1 }} onClick={() => setTab('lich_su')}>
                    <Clock size={16} /> Lịch sử ca
                </button>
            </div>

            {tab === 'lam_viec' && (step === 'chon_ca' ? renderChonCa() : renderDangLam())}
            {tab === 'lich_su' && <LichSu onCaClick={ca => setViewCaId(ca.id)} />}
            {viewCaId && <ChiTietCaModal caId={viewCaId} onClose={() => setViewCaId(null)} user={user} token={token} />}

            {showDoiMK && <DoiMatKhau onClose={() => setShowDoiMK(false)} />}
        </div>
    )
}
`;

c = c.substring(0, startChonCa) + newReturn;
fs.writeFileSync('src/pages/NhanVien.jsx', c);
console.log('success');
