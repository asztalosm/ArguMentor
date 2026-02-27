// components/WelcomeScreen.jsx
import { useChatStore } from '../contexts/store'

const MODE_CONFIG = {
  debate: {
    badge: 'Debate Mode',
    title: 'Challenge any position.',
    sub: "Present a claim and I'll argue the strongest case against it — or defend a position you're struggling to articulate.",
    prompts: [
      'Argue against universal basic income',
      'Defend the position that social media does more good than harm',
      'Challenge the idea that remote work increases productivity',
    ],
  },
  teach: {
    badge: 'Teach Mode',
    title: 'Understand anything deeply.',
    sub: "Ask about a concept, topic, or skill. I'll explain it clearly, build intuition, and check your understanding.",
    prompts: [
      'Explain how transformers work in machine learning',
      'Teach me the basics of contract law',
      'Help me understand why inflation affects purchasing power',
    ],
  },
  mistake_hunter: {
    badge: 'Mistake Hunter',
    title: "Find what's wrong.",
    sub: "Share your argument, essay, code, or reasoning. I'll identify errors, logical fallacies, and blind spots.",
    prompts: [
      'Review the logic in my argument about climate policy',
      'Find the flaw in this syllogism: All A are B...',
      'Check my reasoning about this investment thesis',
    ],
  },
}

export default function WelcomeScreen({ mode }) {
  // Clicking a prompt calls addMessage directly — the actual API dispatch
  // lives in ChatInput / wherever you wire up your API handler.
  // Here we just pre-fill via a custom event so ChatInput can submit it,
  // keeping API logic in one place.
  const { addMessage, setLoading, setError } = useChatStore()

  const handlePrompt = (text) => {
    // Dispatch a custom event that ChatInput listens to for pre-fill,
    // OR directly call addMessage if you want to trigger it straight away.
    // Using a CustomEvent keeps API wiring in one place (ChatInput).
    window.dispatchEvent(new CustomEvent('am:prefill', { detail: text }))
  }

  const config = MODE_CONFIG[mode] || MODE_CONFIG.debate

  return (
    <div className="welcome" data-mode={mode}>
      <div className="welcome-mode-badge">{config.badge}</div>
      <h1 className="welcome-title">{config.title}</h1>
      <p className="welcome-sub">{config.sub}</p>
      <div className="welcome-prompts">
        {config.prompts.map((p, i) => (
          <button
            key={i}
            className="welcome-prompt-btn"
            onClick={() => handlePrompt(p)}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
