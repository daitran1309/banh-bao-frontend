import React, { useState, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // Core CSS
import 'tippy.js/animations/scale-subtle.css'; // Premium animation
import { Info } from 'lucide-react';

export default function InfoTooltip({ text }) {
    const [visible, setVisible] = useState(true);
    const [isAutoShowing, setIsAutoShowing] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setIsAutoShowing(false);
        }, 4000);

        const hideOnClick = () => {
            setVisible(false);
            setIsAutoShowing(false);
        };
        
        // Bắt click trên toàn trang
        document.addEventListener('click', hideOnClick, true);
        
        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', hideOnClick, true);
        };
    }, []);

    return (
        <Tippy 
            content={text}
            animation="scale-subtle"
            theme="premium-glass"
            visible={visible}
            placement="top"
            arrow={true}
            interactive={true}
            maxWidth={350}
        >
            <div 
                style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help', color: 'var(--text-muted)' }}
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => {
                    if (!isAutoShowing) setVisible(false);
                }}
            >
                <Info size={16} />
            </div>
        </Tippy>
    );
}
