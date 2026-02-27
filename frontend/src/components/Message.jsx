// components/Message.jsx

export default function Message({ msg, animate }) {
  const isUser = msg.role === 'user'

  return (
    <div className={`message-row ${isUser ? 'user' : 'ai'}`}>
      <div className="message-avatar" aria-hidden="true">
        {isUser ? 'you' : 'ai'}
      </div>
      <div className={`message-bubble ${animate ? 'animate' : ''}`}>
        {msg.content}
      </div>
    </div>
  )
}
