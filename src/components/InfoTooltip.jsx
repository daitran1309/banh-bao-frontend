import { useState } from 'react'
import { Info } from 'lucide-react'

export default function InfoTooltip({ text }) {
    const [show, setShow] = useState(false)

    return (
        <div 
            className="info-tooltip-container"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onClick={() => setShow(!show)}
        >
            <Info size={16} className="info-icon" />
            <div className={`info-tooltip-content ${show ? 'show' : ''}`}>
                {text}
            </div>
        </div>
    )
}
