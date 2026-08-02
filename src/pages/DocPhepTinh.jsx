import React, { useState, useEffect, useRef } from 'react'
import { StaggerContainer, BubbleItem } from '../components/BubbleAnimation'
import { Mic, MicOff } from 'lucide-react'

const wordMap = [
  [/\b(cộng|công|cồng|cọng)\b/g, '+'],
  [/\b(trừ|chừ|từ)\b/g, '-'],
  [/\b(nhân|nhâng)\b/g, '*'],
  [/\b(chia|chia ra)\b/g, '/'],
  [/\bmở ngoặc\b/g, '('], [/\bđóng ngoặc\b/g, ')'],
  [/\b(phẩy|phẩi)\b/g, '.'], [/\bchấm\b/g, '.'],
  [/\bkhông\b/g, '0'], [/\bmột\b/g, '1'], [/\bhai\b/g, '2'],
  [/\bba\b/g, '3'], [/\bbốn\b/g, '4'], [/\btư\b/g, '4'],
  [/\bnăm\b/g, '5'], [/\bsáu\b/g, '6'], [/\bbảy\b/g, '7'],
  [/\btám\b/g, '8'], [/\bchín\b/g, '9'], [/\bmười\b/g, '10']
];

function normalize(text) {
  let t = text.toLowerCase();
  for (const [re, rep] of wordMap) t = t.replace(re, rep);
  t = t.replace(/(?<=\d)\s*[.,]\s*(?=\d)/g, '.');
  t = t.replace(/(?<=\d)\s+(?=\d)/g, '');
  t = t.replace(/[.,](?!\d)/g, '');
  t = t.replace(/([+\-*/()])/g, ' $1 ');
  return t.replace(/\s+/g, ' ').trim();
}

function extractExpression(raw) {
  const norm = normalize(raw);
  const words = norm.split(' ');

  let op1 = null;
  let operator = null;
  let op2 = null;

  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    let numStr = word.replace(',', '.');

    if (/^[0-9]+(\.[0-9]+)?$/.test(numStr)) {
      if (op1 === null) {
        op1 = numStr;
      } else if (op2 === null) {
        op2 = numStr;
        break;
      }
    } else if (op1 !== null && op2 === null && operator === null) {
      if (word.startsWith('ch') || word === '/') {
        operator = '/';
      } else if (word.startsWith('c') || word === '+') {
        operator = '+';
      } else if (word.startsWith('t') || word === '-') {
        operator = '-';
      } else if (word.startsWith('n') || word.startsWith('x') || word === '*') {
        operator = '*';
      }
    }
  }

  if (op1 !== null && operator !== null && op2 !== null) {
    return `${op1} ${operator} ${op2}`;
  }

  return norm.replace(/[^0-9+\-*/.() ]/g, '').replace(/\s+/g, ' ').trim();
}

export default function DocPhepTinh() {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('Nhấn micro để bắt đầu');
  const [liveText, setLiveText] = useState('');
  const [interimHint, setInterimHint] = useState('');
  const [calcResult, setCalcResult] = useState('—');
  const [history, setHistory] = useState([]);

  const liveBoxRef = useRef(null);
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);

  useEffect(() => {
    listeningRef.current = listening;
  }, [listening]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setStatus('Trình duyệt không hỗ trợ. Hãy dùng Chrome.');
      return;
    }

    const recognition = new SR();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setStatus('Micro đã bật, đang chờ giọng nói...');
    recognition.onsoundstart = () => setStatus('Đã phát hiện âm thanh...');
    recognition.onspeechstart = () => setStatus('Đang nghe giọng nói...');
    recognition.onnomatch = () => setStatus('Không nhận diện được, thử nói rõ hơn');

    recognition.onerror = (e) => {
      console.log('Speech recognition error:', e.error);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setStatus('Chưa được cấp quyền micro. Hãy kiểm tra cài đặt.');
        setListening(false);
      } else if (e.error === 'aborted') {
        // Ignore
      } else if (e.error === 'no-speech') {
        setStatus('Chưa nghe thấy gì, vẫn đang chờ...');
      } else if (e.error === 'audio-capture') {
        setStatus('Không tìm thấy micro. Kiểm tra lại thiết bị âm thanh.');
        setListening(false);
      } else {
        setStatus('Lỗi: ' + e.error);
      }
    };

    recognition.onresult = (event) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t; else interim += t;
      }
      setInterimHint(interim ? '(đang nói...) ' + interim : '');

      if (final) {
        setLiveText(prev => {
          const finalStr = final.trim();
          let shouldNewline = true;

          const boxVal = prev.trimEnd();
          const lastWord = boxVal.split(/\s+/).pop();
          const firstWord = finalStr.split(/\s+/)[0];

          function isOp(w) {
            if (!w) return false;
            const lw = w.toLowerCase();
            return lw.startsWith('c') || lw === '+' ||
              lw.startsWith('t') || lw === '-' ||
              lw.startsWith('n') || lw.startsWith('x') || lw === '*' ||
              lw === '/';
          }

          if (isOp(lastWord) || isOp(firstWord)) {
            shouldNewline = false;
          }

          const sep = prev && !prev.endsWith('\n')
            ? (shouldNewline ? '\n' : ' ')
            : '';

          let newText = prev + sep + finalStr;
          
          const lines = newText.split('\n');
          const lastLine = lines[lines.length - 1];
          lines[lines.length - 1] = extractExpression(lastLine);
          newText = lines.join('\n');
          
          tryCalcFromText(newText);
          return newText;
        });
        if (liveBoxRef.current) {
          setTimeout(() => {
            if (liveBoxRef.current) liveBoxRef.current.scrollTop = liveBoxRef.current.scrollHeight;
          }, 10);
        }
      }
    };

    recognition.onend = () => {
      if (listeningRef.current) {
        setTimeout(() => {
          if (listeningRef.current && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) { }
          }
        }, 50);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (!listening) {
      try { recognitionRef.current.start(); } catch (e) { }
      setStatus('Đang nghe...');
      setListening(true);
    } else {
      recognitionRef.current.stop();
      setStatus('Đã dừng');
      setListening(false);
    }
  };

  const tryCalc = (cleaned) => {
    if (!cleaned || !/[0-9]/.test(cleaned)) return;
    try {
      const safe = cleaned.replace(/[^0-9+\-*/.() ]/g, '');
      const val = Function('"use strict";return (' + safe + ')')();
      if (isNaN(val)) return;
      const rounded = Math.round(val * 1000) / 1000;
      setCalcResult(cleaned + ' = ' + rounded);
      setHistory(prev => {
        const newHist = [{ expr: cleaned, result: rounded }, ...prev];
        return newHist.slice(0, 10);
      });
    } catch (e) { }
  };

  const tryCalcFromText = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    const lastLine = lines[lines.length - 1] || '';
    const cleaned = extractExpression(lastLine);
    tryCalc(cleaned);
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setLiveText(val);
    tryCalcFromText(val);
  };

  const insertOp = (op) => {
    const box = liveBoxRef.current;
    if (!box) return;
    const start = box.selectionStart;
    const end = box.selectionEnd;
    const val = liveText;
    const newVal = val.slice(0, start) + op + val.slice(end);
    setLiveText(newVal);

    setTimeout(() => {
      box.focus();
      box.selectionStart = box.selectionEnd = start + op.length;
      tryCalcFromText(newVal);
    }, 10);
  };

  return (
    <StaggerContainer delay={0.1} style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      <BubbleItem>
        <h1 style={{ margin: 0, fontSize: 24, color: 'var(--text-main)' }}>Đọc phép tính bằng giọng nói</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}> Đọc số và phép tính, ví dụ: "5 cộng 3 nhân 2"</p>
      </BubbleItem>

      <BubbleItem className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px' }}>
        <button
          onClick={toggleListening}
          style={{
            width: 64, height: 64, borderRadius: '50%', border: 'none',
            background: listening ? 'var(--danger)' : 'var(--primary)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: 'var(--shadow-md)', transition: 'var(--transition)'
          }}
        >
          {listening ? <Mic size={32} /> : <MicOff size={32} />}
        </button>
        <span style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: 16 }}>{status}</span>
      </BubbleItem>

      <BubbleItem className="card" style={{ padding: '20px' }}>
        <textarea
          ref={liveBoxRef}
          value={liveText}
          onChange={handleTextChange}
          placeholder="Văn bản đọc được sẽ nối vào đây, bạn có thể sửa tự do..."
          style={{
            width: '100%', minHeight: 120, background: 'var(--bg-color)', color: 'var(--text-main)',
            border: '1px solid var(--gray-200)', borderRadius: 10, padding: 16, fontSize: 18,
            boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical',
            outline: 'none', transition: 'var(--transition)'
          }}
        />
        <div style={{ fontSize: 13, color: 'var(--text-muted)', minHeight: 18, marginTop: 8, marginBottom: 16 }}>
          {interimHint}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {['+', '-', '*', '/', '(', ')', '.'].map(op => (
            <button
              key={op}
              onClick={() => insertOp(op)}
              className="btn"
              style={{
                width: 44, height: 40, background: 'var(--bg-color)', color: 'var(--text-main)',
                border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {op === '*' ? '×' : op === '/' ? '÷' : op === '.' ? ',' : op}
            </button>
          ))}
        </div>

        <div style={{
          background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: 10,
          padding: '16px 20px', fontSize: 20, fontWeight: 600, color: 'var(--text-main)'
        }}>
          <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--primary)', display: 'block', marginBottom: 4 }}>
            Kết quả tính được
          </span>
          {calcResult}
        </div>
      </BubbleItem>

      {history.length > 0 && (
        <BubbleItem className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, color: 'var(--text-main)' }}>Lịch sử tính</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {history.map((h, i) => (
              <div key={i} style={{
                padding: '10px 0', borderBottom: i < history.length - 1 ? '1px solid var(--gray-200)' : 'none',
                fontFamily: 'monospace', fontSize: 16, display: 'flex', justifyContent: 'space-between',
                color: 'var(--text-main)'
              }}>
                <span>{h.expr}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>= {h.result}</span>
              </div>
            ))}
          </div>
        </BubbleItem>
      )}
    </StaggerContainer>
  )
}
