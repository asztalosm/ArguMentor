// components/TypingIndicator.jsx

export default function TypingIndicator() {
  return (
    <div className="typing-row">
      <div className="message-avatar" aria-hidden="true">ai</div>
      <div className="typing-dots" aria-label="AI is thinking" role="status">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  )
}
