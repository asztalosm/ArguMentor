export default function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', animation: 'fadeLeft 0.3s ease both' }}>
      <div style={{
        width: 34, height: 34, minWidth: 34, borderRadius: 8,
        background: 'var(--accent-dim)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, animation: 'pulse 2s ease infinite',
      }}>⚡</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '12px 16px', background: 'var(--elevated)',
        border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px',
      }}>
        {[0, 160, 320].map((d, i) => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--accent)', display: 'inline-block',
            animation: `pop 1.2s ${d}ms ease infinite`,
          }} />
        ))}
        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--dim)', marginLeft: 4 }}>
          thinking
        </span>
      </div>
    </div>
  )
}
