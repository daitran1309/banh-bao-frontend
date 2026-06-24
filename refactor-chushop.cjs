const fs = require('fs');
let c = fs.readFileSync('src/pages/ChuShop.jsx', 'utf8');

c = c.replace("import DoiMatKhau from '../components/DoiMatKhau'", 
`import DoiMatKhau from '../components/DoiMatKhau'
import YeuCauSua from '../components/YeuCauSua'
import ChiTietCaModal from '../components/ChiTietCaModal'`);

c = c.replace("const [showDoiMK, setShowDoiMK] = useState(false)", 
`const [showDoiMK, setShowDoiMK] = useState(false)
    const [viewCaId, setViewCaId] = useState(null)`);

c = c.replace("{ key: 'quan_ly', label: '🥟 Bánh' },", 
`{ key: 'quan_ly', label: '🥟 Bánh' },
                    { key: 'yeu_cau', label: '🔔 Yêu cầu sửa' },`);

c = c.replace("{tab === 'lich_su' && <LichSu />}", 
`{tab === 'lich_su' && <LichSu onCaClick={ca => setViewCaId(ca.id)} />}
            {tab === 'yeu_cau' && <YeuCauSua token={token} onViewCa={setViewCaId} />}
            {viewCaId && <ChiTietCaModal caId={viewCaId} onClose={() => setViewCaId(null)} user={user} token={token} />}`);

fs.writeFileSync('src/pages/ChuShop.jsx', c);
console.log('success');
