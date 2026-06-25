import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // Core CSS
import 'tippy.js/animations/scale-subtle.css'; // Premium animation
import { Info } from 'lucide-react';

export default function InfoTooltip({ text }) {
    return (
        <Tippy 
            content={text}
            animation="scale-subtle"
            theme="premium-glass"
            delay={[150, 0]}
            placement="top"
            arrow={true}
            interactive={true}
            maxWidth={350}
        >
            <div style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help', color: 'var(--text-muted)' }}>
                <Info size={16} />
            </div>
        </Tippy>
    );
}
