import React, { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.css';

const RESPONSES = {
  flood: [
    'Move to higher ground immediately. Avoid contact with floodwater — it may be contaminated.',
    'Do not walk through moving water. 6 inches can knock you down.',
    'Turn off utilities at main switches. Disconnect electrical appliances.',
  ],
  earthquake: [
    'DROP, COVER, HOLD ON. Get under a sturdy table and protect your neck.',
    'Stay indoors until shaking stops. After, check for gas leaks and structural damage.',
    'Expect aftershocks. Keep away from damaged buildings.',
  ],
  fire: [
    'Evacuate immediately. Close doors behind you to slow fire spread.',
    'Stay low to the ground where air is cleaner. Use a wet cloth over your mouth.',
    'Do not use elevators. Meet at your designated assembly point.',
  ],
  landslide: [
    'Move away from the slide path quickly — do not try to outrun it.',
    'If trapped, signal rescuers by tapping on a pipe or wall.',
    'Listen for unusual sounds — cracking trees, rumbling — that may signal movement.',
  ],
  storm: [
    'Stay indoors and away from windows. Secure loose outdoor items.',
    'Keep emergency supplies: water, flashlight, battery radio, first aid kit.',
    'Do not drive through flooded roads. Turn around, don\'t drown.',
  ],
  shelter: [
    'Nearest designated shelters: Zone-B Community Hall, City School, District Hospital.',
    'Shelters have capacity for ~500 people each with medical and food support.',
    'Bring ID documents, medications, and 3 days of supplies if possible.',
  ],
  sos: [
    '🚨 SOS signal received! Coordinates transmitted to emergency dispatch.',
    'Emergency teams notified. ETA: 15–25 minutes depending on road conditions.',
    'Stay in a safe, visible location. Signal with a flashlight or whistle.',
  ],
  priority: [
    'Priority score = (severity × 10) + (people affected ÷ 500) + (urgency × 15), with time decay.',
    'CRITICAL (≥130): Immediate multi-team response. HIGH (≥80): Priority dispatch. MEDIUM (≥40): Standard response.',
    'Scores decay over time so recent incidents get priority boost.',
  ],
  help: [
    'I can help with: flood, earthquake, fire, landslide, storm, shelter info, sos signals, or priority scoring.',
    'Try asking: "What to do in a flood?" or "Find nearest shelter" or "Explain priority score".',
  ],
};

function getBotReply(msg) {
  const lower = msg.toLowerCase();
  for (const [key, replies] of Object.entries(RESPONSES)) {
    if (lower.includes(key)) {
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  return 'I can assist with disaster response protocols, shelter locations, SOS procedures, and priority scoring. Ask me anything!';
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'DisasterReliefAI assistant online. Ask me about disaster protocols, shelters, or SOS procedures.' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = () => {
    const msg = input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: 'bot', text: getBotReply(msg) }]);
    }, 600 + Math.random() * 600);
  };

  const quickActions = ['Flood protocol', 'Find shelter', 'SOS', 'Priority score'];

  return (
    <div className={styles.chatbot}>
      {open && (
        <div className={styles.window}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerDot} />
              <span className={styles.headerTitle}>AI RESPONSE ASSISTANT</span>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>×</button>
          </div>

          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.user : styles.bot}`}>
                {m.role === 'bot' && <div className={styles.botIcon}>AI</div>}
                <div className={styles.bubble}>{m.text}</div>
              </div>
            ))}
            {typing && (
              <div className={`${styles.msg} ${styles.bot}`}>
                <div className={styles.botIcon}>AI</div>
                <div className={`${styles.bubble} ${styles.typing}`}>
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className={styles.quickActions}>
            {quickActions.map(q => (
              <button key={q} className={styles.quickBtn} onClick={() => {
                setInput(q);
                setTimeout(send, 50);
              }}>{q}</button>
            ))}
          </div>

          <div className={styles.inputRow}>
            <input
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about disaster protocols..."
            />
            <button className={styles.sendBtn} onClick={send}>↑</button>
          </div>
        </div>
      )}

      <button className={`${styles.fab} ${open ? styles.fabOpen : ''}`} onClick={() => setOpen(!open)}>
        {open ? '×' : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="white" opacity="0.9"/>
          </svg>
        )}
        {!open && <div className={styles.fabPulse} />}
      </button>
    </div>
  );
}