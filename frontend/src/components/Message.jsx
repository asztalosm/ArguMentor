// components/Message.jsx
import MessageFormatter from './MessageFormatter'

export default function Message({ msg, animate }) {
  const isUser = msg.role === 'user'

  return (
    <div className={`message-row ${isUser ? 'user' : 'ai'}`}>
      <div className="message-avatar" aria-hidden="true">
        {isUser ? 'you' : 'ai'}
      </div>
      <div className={`message-bubble ${animate ? 'animate' : ''}`}>
        {isUser
          // User messages: plain pre-wrap (preserve their line breaks)
          ? <span className="fmt-user-text">{msg.content}</span>
          // AI messages: full rich formatting
          : <MessageFormatter content={msg.content} />
        }
      </div>
    </div>
  )
}
