"use client"

import { useState } from "react"
import { supabase } from "lib/supabase"
import { v4 as uuidv4 } from "uuid"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pacifico, Poppins } from "next/font/google"

const pacifico = Pacifico({ weight: "400", subsets: ["latin"] })
const poppins = Poppins({ weight: ["300", "400", "600"], subsets: ["latin"] })

const VIBES = ["Hype", "Sing-Along", "Feel-Good", "Slow Jam", "Throwback"] as const
type Vibe = typeof VIBES[number]

type Suggestion = { song_title: string; artist: string; request_count: number }

export default function RequestPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [artist, setArtist] = useState("")
  const [song, setSong] = useState("")
  const [djChoice, setDjChoice] = useState(false)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [vibe, setVibe] = useState<Vibe | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [submitted, setSubmitted] = useState<{ song: string; artist: string; requestId: string } | null>(null)
  const [tipAmount, setTipAmount] = useState<number | null>(null)
  const [tipping, setTipping] = useState(false)

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  function validatePhone(phone: string) {
    return /^\+?[\d\s\-]{7,15}$/.test(phone)
  }

  async function handleVibeSelect(selected: Vibe) {
    setVibe(selected)
    setSuggestions([])
    setLoadingSuggestions(true)
    try {
      const res = await fetch(`/api/suggestions?vibe=${encodeURIComponent(selected)}`)
      const json = await res.json()
      setSuggestions(json.suggestions ?? [])
    } catch {
      // suggestions are optional
    } finally {
      setLoadingSuggestions(false)
    }
  }

  function handleDjChoice() {
    setDjChoice(true)
    setSong("")
  }

  function handleSongInput(value: string) {
    setSong(value)
    if (value.trim()) {
      setDjChoice(false)
      setVibe(null)
      setSuggestions([])
    }
  }

  function applySuggestion(s: Suggestion) {
    setSong(s.song_title)
    setArtist(s.artist)
    setDjChoice(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg("")
    setLoading(true)

    if (!firstName.trim()) {
      setErrorMsg("First name is required.")
      setLoading(false)
      return
    }
    if (!artist.trim()) {
      setErrorMsg("Artist is required.")
      setLoading(false)
      return
    }
    if (!djChoice && !song.trim()) {
      setErrorMsg("Enter a song title or tap \"DJ's Choice\".")
      setLoading(false)
      return
    }
    if (djChoice && !vibe) {
      setErrorMsg("Pick a vibe so the DJ knows what to play.")
      setLoading(false)
      return
    }
    if (!email.trim() && !phone.trim()) {
      setErrorMsg("Please provide either an email or phone number.")
      setLoading(false)
      return
    }
    if (email && !validateEmail(email)) {
      setErrorMsg("Invalid email format.")
      setLoading(false)
      return
    }
    if (phone && !validatePhone(phone)) {
      setErrorMsg("Invalid phone format. Include country code if needed.")
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("requests")
      .insert([{
        first_name: firstName.trim(),
        song_title: djChoice ? "" : song.trim(),
        artist: artist.trim(),
        apple_music_id: uuidv4(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        notes: notes.trim() || null,
        vibe: vibe,
        selfie_url: null,
        selfie_status: "none",
      }])
      .select("id")
      .single()

    setLoading(false)

    if (error) {
      setErrorMsg(`Supabase insert error: ${error.message}`)
    } else {
      if (data?.id) localStorage.setItem("my_request_id", data.id)
      setSubmitted({ song: djChoice ? "DJ's Choice" : song.trim(), artist: artist.trim(), requestId: data.id })
    }
  }

  async function handleTip(amount: number) {
    if (!submitted?.requestId || tipping) return
    setTipping(true)
    const res = await fetch("/api/dj-tip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: submitted.requestId, tipAmount: amount }),
    })
    const json = await res.json()
    setTipping(false)
    if (json.url) {
      window.location.href = json.url
    } else {
      alert("Payment setup failed. Please try again.")
    }
  }

  function goToSelfie() {
    const params = new URLSearchParams({
      song: submitted?.song ?? "",
      artist: submitted?.artist ?? "",
    })
    router.push(`/selfie?${params.toString()}`)
  }

  return (
    <main className="request-page">

      {/* Falling olives background */}
      <div className="olives-bg" aria-hidden="true">
        {[
          { left: "4%",  size: "1rem",   delay: "0s",    dur: "13s"  },
          { left: "11%", size: "0.8rem", delay: "3s",    dur: "10s"  },
          { left: "20%", size: "1.1rem", delay: "6s",    dur: "15s"  },
          { left: "30%", size: "0.75rem",delay: "1.5s",  dur: "11s"  },
          { left: "40%", size: "1rem",   delay: "8s",    dur: "12s"  },
          { left: "50%", size: "1.2rem", delay: "4s",    dur: "14s"  },
          { left: "59%", size: "0.85rem",delay: "9.5s",  dur: "10s"  },
          { left: "68%", size: "1rem",   delay: "2s",    dur: "13s"  },
          { left: "77%", size: "0.9rem", delay: "5s",    dur: "11s"  },
          { left: "86%", size: "1.1rem", delay: "7s",    dur: "14s"  },
          { left: "94%", size: "0.8rem", delay: "11s",   dur: "12s"  },
          { left: "15%", size: "0.9rem", delay: "13s",   dur: "10s"  },
          { left: "45%", size: "1rem",   delay: "15s",   dur: "13s"  },
          { left: "72%", size: "0.85rem",delay: "17s",   dur: "11s"  },
        ].map((o, i) => (
          <span
            key={i}
            className="olive"
            style={{ left: o.left, fontSize: o.size, animationDelay: o.delay, animationDuration: o.dur }}
          >🫒</span>
        ))}
      </div>

      <div className="container">
        <div className="top-nav">
          <button className="back-arrow" onClick={() => router.push("/")}>⌂ Home</button>
        </div>
        <h1 className={pacifico.className}>Song Requests</h1>
        <p className="intro">
          Tell us who you want to hear — then either name the song or let the DJ pick something perfect for the vibe.
        </p>

        {/* Success modal */}
        {submitted && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-icon">🎉</div>
              <h2>Song submitted!</h2>
              <p className="modal-song">
                {submitted.song} <span className="modal-by">by</span> {submitted.artist}
              </p>
              {tipAmount && (
                <div className="modal-tip">
                  <p className="modal-sub">Send a <strong style={{ color: "#6b7c3a" }}>${tipAmount}</strong> tip to the DJ?</p>
                  <button className="selfie-cta-btn" onClick={() => handleTip(tipAmount)} disabled={tipping}>
                    {tipping ? "Redirecting..." : `Tip $${tipAmount}`}
                  </button>
                </div>
              )}
              <p className="modal-sub">Want to show your face on the big screen?</p>
              <button className="selfie-cta-btn" onClick={goToSelfie}>Take a Selfie</button>
              <Link href="/queue" className="skip-link" style={{ color: "#6b7c3a" }}>Skip — take me to the queue</Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {errorMsg && <p className="error">{errorMsg}</p>}

          <input
            className="input-field"
            placeholder="Your First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <input
            className="input-field"
            placeholder="Artist *"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />

          <div className="song-section">
            <div className="song-row">
              <input
                className={`input-field song-input${djChoice ? " dimmed" : ""}`}
                placeholder="Song title"
                value={djChoice ? "" : song}
                onChange={(e) => handleSongInput(e.target.value)}
                onFocus={() => { if (djChoice) { setDjChoice(false); setVibe(null); setSuggestions([]) } }}
                disabled={false}
              />
              <button
                type="button"
                className={`dj-choice-btn${djChoice ? " active" : ""}${song.trim() && !djChoice ? " inactive" : ""}`}
                onClick={handleDjChoice}
                disabled={!!song.trim() && !djChoice}
              >
                DJ's Choice
              </button>
            </div>
            {djChoice && <p className="dj-hint">The DJ will pick the perfect song — just choose a vibe below.</p>}
          </div>

          {djChoice && (
            <div className="vibe-section">
              <p className="section-label">Pick a vibe <span className="required">*</span></p>
              <div className="vibe-buttons">
                {VIBES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`vibe-btn${vibe === v ? " selected" : ""}`}
                    onClick={() => handleVibeSelect(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {loadingSuggestions && <p className="suggestions-hint">Finding popular songs...</p>}
              {!loadingSuggestions && suggestions.length > 0 && (
                <>
                  <p className="suggestions-hint">Popular {vibe} picks — tap to fill in:</p>
                  <div className="suggestion-chips">
                    {suggestions.map((s, i) => (
                      <button key={i} type="button" className="suggestion-chip" onClick={() => applySuggestion(s)}>
                        {s.song_title} – {s.artist}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <input
            className="input-field"
            type="email"
            placeholder="Email (optional if phone provided)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input-field"
            type="tel"
            placeholder="Phone (optional if email provided)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <textarea
            className="input-field"
            placeholder="Optional notes for the DJ"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="tip-section">
            <p className="section-label">Tip the DJ <span className="tip-optional">(optional)</span></p>
            <div className="tip-buttons">
              {[1, 3, 5, 10].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`tip-btn${tipAmount === amt ? " selected" : ""}`}
                  onClick={() => setTipAmount(tipAmount === amt ? null : amt)}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          <button disabled={loading} className="submit-btn">
            {loading ? "Submitting..." : "Send Request"}
          </button>
        </form>

      </div>

      <style jsx>{`
        .request-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 2rem 1rem;
          background-color: #2c1a3b;
          color: #f0e6f5;
          font-family: ${poppins.style.fontFamily};
          position: relative;
        }
        .olives-bg {
          position: fixed; inset: 0; pointer-events: none;
          overflow: hidden; z-index: 0;
        }
        .olive {
          position: absolute; top: -2rem;
          animation: olivefall linear infinite;
          opacity: 0.22; user-select: none;
        }
        @keyframes olivefall {
          0%   { transform: translateY(-2rem) translateX(0) rotate(0deg); }
          25%  { transform: translateY(25vh) translateX(10px) rotate(20deg); }
          50%  { transform: translateY(50vh) translateX(-8px) rotate(-15deg); }
          75%  { transform: translateY(75vh) translateX(12px) rotate(25deg); }
          100% { transform: translateY(110vh) translateX(0) rotate(0deg); }
        }
        .container { position: relative; z-index: 1; }
        .container {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
        }
        h1 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #6b7c3a;
        }
        .intro {
          text-align: center;
          font-size: 0.9rem;
          color: #c9b8e0;
          margin: 0 0 1.25rem;
          line-height: 1.4;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .input-field {
          padding: 0.75rem;
          border-radius: 12px;
          border: 2px solid #3d2656;
          font-size: 1rem;
          width: 100%;
          box-sizing: border-box;
          font-family: ${poppins.style.fontFamily};
          color: #f0e6f5;
          background-color: #3d2656;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: #a07cc5; }
        .input-field::placeholder { color: #7a6a8a; }
        .input-field.dimmed { opacity: 0.4; }
        textarea.input-field {
          resize: vertical;
          min-height: 90px;
        }
        .song-section,
        .vibe-section {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .section-label {
          font-size: 0.88rem;
          color: #c9b8e0;
          margin: 0;
        }
        .required { color: #FF6F61; }
        .song-row {
          display: flex;
          gap: 0.5rem;
          align-items: stretch;
        }
        .song-input { flex: 1; }
        .dj-choice-btn {
          flex-shrink: 0;
          padding: 0 1rem;
          border-radius: 12px;
          border: 2px solid #a07cc5;
          background: transparent;
          color: #c9b8e0;
          font-size: 0.85rem;
          font-family: ${pacifico.style.fontFamily};
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .dj-choice-btn.active {
          background: #a07cc5;
          color: #c9b8e0;
        }
        .dj-choice-btn.inactive {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .dj-hint {
          font-size: 0.82rem;
          color: #a07cc5;
          margin: 0;
          font-style: italic;
        }
        .vibe-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .vibe-btn {
          padding: 0.35rem 0.8rem;
          border-radius: 20px;
          border: 2px solid #a07cc5;
          background: transparent;
          color: #c9b8e0;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .vibe-btn.selected {
          background: #a07cc5;
          color: white;
        }
        .suggestions-hint {
          font-size: 0.82rem;
          color: #c9b8e0;
          margin: 0 0 0.4rem;
        }
        .suggestion-chips {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .suggestion-chip {
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          border: none;
          background: #3d2656;
          color: #f0e6f5;
          font-size: 0.85rem;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s;
        }
        .suggestion-chip:hover { background: #4e3268; }
        .tip-section {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .tip-optional {
          font-size: 0.8rem;
          color: #7a6a8a;
        }
        .tip-buttons {
          display: flex;
          gap: 0.5rem;
        }
        .tip-btn {
          flex: 1;
          padding: 0.5rem 0;
          border-radius: 12px;
          border: 2px solid #a07cc5;
          background: transparent;
          color: #c9b8e0;
          font-size: 0.95rem;
          font-family: ${poppins.style.fontFamily};
          cursor: pointer;
          transition: all 0.2s;
        }
        .tip-btn.selected {
          background: #a07cc5;
          color: #f0e6f5;
        }
        .tip-btn:hover { background: #a07cc5; color: #f0e6f5; }
        .modal-tip { width: 100%; display: flex; flex-direction: column; gap: 0.5rem; align-items: center; }
        .submit-btn {
          background-color: #6b7c3a;
          color: #c9b8e0;
          font-weight: bold;
          cursor: pointer;
          border-radius: 12px;
          padding: 0.8rem;
          font-size: 1.2rem;
          font-family: ${pacifico.style.fontFamily};
          transition: transform 0.2s, background-color 0.2s;
        }
        .submit-btn:hover {
          transform: scale(1.05);
          background-color: #5a6830;
        }
        .top-nav { margin-bottom: 0.5rem; }
        .back-arrow {
          background: transparent; border: 2px solid #a07cc5;
          color: #c9b8e0; border-radius: 20px; padding: 0.35rem 0.9rem;
          font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
        }
        .back-arrow:hover { background: #a07cc5; color: white; }
        .error {
          color: #6b7c3a;
          text-align: center;
          font-weight: bold;
        }

        /* Success modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal {
          background: #3d2656;
          border: 2px solid #a07cc5;
          border-radius: 20px;
          padding: 2rem 1.5rem;
          max-width: 340px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .modal-icon { font-size: 2.5rem; }
        .modal h2 {
          font-family: ${pacifico.style.fontFamily};
          font-size: 1.6rem;
          color: #6b7c3a;
          margin: 0;
        }
        .modal-song {
          font-size: 1rem;
          font-weight: bold;
          color: #6b7c3a;
          margin: 0;
        }
        .modal-by {
          font-weight: normal;
          color: #c9b8e0;
        }
        .modal-sub {
          font-size: 0.9rem;
          color: #c9b8e0;
          margin: 0;
        }
        .selfie-cta-btn {
          width: 100%;
          padding: 0.85rem;
          border-radius: 12px;
          border: none;
          background: #a07cc5;
          color: #f0e6f5;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
          font-family: ${pacifico.style.fontFamily};
        }
        .selfie-cta-btn:hover { background: #8a63b0; }
        .skip-link {
          font-size: 0.85rem;
          color: #6b7c3a;
          text-decoration: underline;
          cursor: pointer;
        }

        @media (max-width: 480px) {
          h1 { font-size: 2rem; }
          .input-field,
          .submit-btn,
          .back-btn { font-size: 1rem; padding: 0.7rem; }
        }
      `}</style>
    </main>
  )
}
