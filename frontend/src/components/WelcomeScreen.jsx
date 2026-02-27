const INFO = {
  debate: {
    icon: '⚔️', title: 'Debate Mode',
    sub: 'State your position — I will argue the opposite.',
    tips: ['Make a clear, specific claim', 'I always take the counter-position', 'Challenge me back — debates sharpen thinking'],
    color: 'var(--debate)',
  },
  teach: {
    icon: '🎓', title: 'Teach the AI',
    sub: 'You are the teacher. Explain anything and watch me learn.',
    tips: ['Explain a concept in your own words', 'I will ask questions and paraphrase', 'Correct me if I misunderstand'],
    color: 'var(--teach)',
  },
  mistake_hunter: {
    icon: '🔍', title: 'Mistake Hunter',
    sub: 'Paste any text and I will find every error and explain it.',
    tips: ['Works on essays, emails, and more', 'I check grammar, logic, and style', 'You get a full breakdown with fixes'],
    color: 'var(--hunter)',
  },
}

export default function WelcomeScreen({ mode }) {
  const { icon, title, sub, tips, color } = INFO[mode]

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', animation: 'slideIn 0.4s ease both',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: 420, textAlign: 'center' }}>
        <div style={{
          fontSize: 48, width: 82, height: 82, borderRadius: 18,
          background: `color-mix(in srgb, ${color} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 40px color-mix(in srgb, ${color} 18%, transparent)`,
          animation: 'pulse 3s ease infinite',
        }}>{icon}</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{title}</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.93rem', lineHeight: 1.6 }}>{sub}</p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, width: '100%', marginTop: 6 }}>
          {tips.map((tip, i) => (
            <li key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 15px', background: 'var(--elevated)',
              border: '1px solid var(--border)', borderRadius: 12,
              fontSize: '0.84rem', color: 'var(--muted)', textAlign: 'left',
              animation: `fadeUp 0.4s ${i * 80}ms ease both`,
            }}>
              <span style={{ width: 6, height: 6, minWidth: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
