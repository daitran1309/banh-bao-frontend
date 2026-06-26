import React, { useState, useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageViewer() {
    const [imgSrc, setImgSrc] = useState(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (e.target.tagName === 'IMG') {
                // Bỏ qua ảnh nếu có class 'no-zoom'
                if (e.target.classList.contains('no-zoom')) return;
                
                const src = e.target.src;
                // Bỏ qua ảnh base64 nhỏ hoặc ảnh rỗng
                if (src && !src.startsWith('data:image/svg')) {
                    setImgSrc(src);
                }
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setImgSrc(null);
        };
        if (imgSrc) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [imgSrc]);

    return (
        <AnimatePresence>
            {imgSrc && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setImgSrc(null)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(5px)',
                        zIndex: 999999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'zoom-out',
                        padding: 40
                    }}
                >
                    <button 
                        onClick={() => setImgSrc(null)}
                        style={{
                            position: 'absolute',
                            top: 24, right: 24,
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            color: 'white',
                            padding: 12,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                    >
                        <X size={28} />
                    </button>
                    
                    <motion.img 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        src={imgSrc} 
                        alt="Phóng to"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: 16,
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            cursor: 'default'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
