import React from 'react';
import { motion } from 'framer-motion';

export const StaggerContainer = ({ children, className = '', style = {}, delay = 0 }) => {
    return (
        <motion.div
            className={className}
            style={style}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        delayChildren: delay,
                        staggerChildren: 0.1
                    }
                }
            }}
        >
            {children}
        </motion.div>
    );
};

export const BubbleItem = ({ children, className = '', style = {}, whileHover, onClick, delay = 0 }) => {
    return (
        <motion.div
            className={className}
            style={{ ...style, willChange: 'opacity, transform' }}
            whileHover={whileHover}
            onClick={onClick}
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "200px" }}
            transition={{ 
                opacity: { duration: 0.15, delay: delay * 0.3, ease: 'easeOut' },
                y: { duration: 0.25, delay: delay * 0.3, ease: 'easeOut' },
                scale: { duration: 0.3, delay: (delay * 0.3) + 0.05, ease: [0.25, 0.1, 0.25, 1] } 
            }}
        >
            {children}
        </motion.div>
    );
};
