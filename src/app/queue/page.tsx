"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "lib/supabase"
import { useRouter } from "next/navigation"
import { Pacifico, Poppins } from "next/font/google"

const pacifico = Pacifico({ weight: "400", subsets: ["latin"] })
const poppins = Poppins({ weight: ["300", "400", "600"], subsets: ["latin"] })

type Request = {
  id: string
  first_name: string
  song_title: string
  artist: string
  vibe: string | null
  votes: number
  status: "pending" | "up_next" | "played" | "archived"
  selfie_status: string | null
}

const BOOST_TIERS = [
  { amount: 2, label: "$2 — Small boost" },
  { amount: 5, label: "$5 — Big boost" },
  { amount: 10, label: "$10 — Jump to the top" },
]

const SELFIE_TIERS = [
  { amount: 1, label: "$1 — +15s" },
  { amount: 3, label: "$3 — +45s" },
  { amount: 5, label: "$5 — +90s" },
]

export default function QueuePage() {
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [myRequestId, setMyRequestId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [boostTargetId, setBoostTargetId] = useState<string | null>(null)
  const [boosting, setBoosting] = useState(false)
  const [selfieModalOpen, setSelfieModalOpen] = useState(false)
  const [tipping, setTipping] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [boostSuccess, setBoostSuccess] = useState(false)
  const [selfieSuccess, setSelfieSuccess] = useState(false)
  const successTimerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setMyRequestId(localStorage.getItem("my_request_id"))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("boost_success") === "true") {
      setBoostSuccess(true)
      window.history.replaceState({}, "", window.location.pathname)
      successTimerRef.current = setTimeout(() => setBoostSuccess(false), 4000)
    }
    if (params.get("selfie_success") === "true") {
      setSelfieSuccess(true)
      window.history.replaceState({}, "", window.location.pathname)
      successTimerRef.current = setTimeout(() => setSelfieSuccess(false), 4000)
    }
    return () => clearTimeout(successTimerRef.current)
  }, [])

  useEffect(() => {
    function onScroll() { setShowScrollTop(window.scrollY > 300) }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    async function fetchQueue() {
      const { data } = await supabase
        .from("requests")
        .select("id, first_name, song_title, artist, vibe, votes, status, selfie_status")
        .in("status", ["pending", "up_next"])
        .order("votes", { ascending: false })
      if (data) setRequests(data)
    }
    fetchQueue()

    const channel = supabase
      .channel("queue-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const r = payload.new as Request
          if (r.status === "pending" || r.status === "up_next") {
            setRequests((prev) => [...prev, r].sort((a, b) => b.votes - a.votes))
          }
        } else if (payload.eventType === "UPDATE") {
          const r = payload.new as Request
          setRequests((prev) => {
            const rest = prev.filter((x) => x.id !== r.id)
            if (r.status === "pending" || r.status === "up_next") {
              return [...rest, r].sort((a, b) => b.votes - a.votes)
            }
            return rest
          })
        } else if (payload.eventType === "DELETE") {
          setRequests((prev) => prev.filter((x) => x.id !== (payload.old as Request).id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function handleBoost(amount: number) {
    if (!boostTargetId || boosting) return
    setBoosting(true)
    const res = await fetch("/api/boost-tip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: boostTargetId, tipAmount: amount }),
    })
    const json = await res.json()
    setBoosting(false)
    setBoostTargetId(null)
    if (json.url) {
      window.location.href = json.url
    } else {
      alert("Payment setup failed. Please try again.")
    }
  }

  async function handleSelfieTip(amount: number) {
    if (!myRequestId || tipping) return
    setTipping(true)
    const res = await fetch("/api/selfie-tip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: myRequestId, tipAmount: amount }),
    })
    const json = await res.json()
    setTipping(false)
    setSelfieModalOpen(false)
    if (json.url) {
      window.location.href = json.url
    } else {
      alert("Payment setup failed. Please try again.")
    }
  }

  const myRequest = myRequestId ? requests.find((r) => r.id === myRequestId) : null
  const isUpNext = myRequest?.status === "up_next"
  const showSelfieButton = myRequest?.selfie_status === "approved"
  const query = search.toLowerCase()
  const displayed = query
    ? requests.filter((r) =>
        (r.artist ?? "").toLowerCase().includes(query) ||
        (r.song_title ?? "").toLowerCase().includes(query) ||
        (r.first_name ?? "").toLowerCase().includes(query)
      )
    : requests

  return (
    <main className="queue-page" style={{ fontFamily: poppins.style.fontFamily }}>

      {/* Falling hearts background */}
      <div className="hearts-bg" aria-hidden="true">
        {[
          { left: "5%",  size: "1rem",   delay: "0s",    dur: "12s",  opacity: 0.07 },
          { left: "12%", size: "0.8rem", delay: "2.5s",  dur: "9s",   opacity: 0.09 },
          { left: "22%", size: "1.2rem", delay: "5s",    dur: "14s",  opacity: 0.06 },
          { left: "33%", size: "0.7rem", delay: "1s",    dur: "11s",  opacity: 0.08 },
          { left: "41%", size: "1rem",   delay: "7s",    dur: "10s",  opacity: 0.07 },
          { left: "50%", size: "1.3rem", delay: "3s",    dur: "13s",  opacity: 0.05 },
          { left: "58%", size: "0.8rem", delay: "8.5s",  dur: "9.5s", opacity: 0.09 },
          { left: "67%", size: "1.1rem", delay: "0.5s",  dur: "15s",  opacity: 0.06 },
          { left: "75%", size: "0.9rem", delay: "4s",    dur: "11s",  opacity: 0.08 },
          { left: "83%", size: "1.2rem", delay: "6s",    dur: "12s",  opacity: 0.07 },
          { left: "90%", size: "0.7rem", delay: "2s",    dur: "10s",  opacity: 0.09 },
          { left: "97%", size: "1rem",   delay: "9s",    dur: "13s",  opacity: 0.06 },
          { left: "17%", size: "0.9rem", delay: "11s",   dur: "14s",  opacity: 0.07 },
          { left: "46%", size: "0.8rem", delay: "13s",   dur: "10s",  opacity: 0.08 },
          { left: "72%", size: "1.1rem", delay: "15s",   dur: "12s",  opacity: 0.06 },
        ].map((h, i) => (
          <span
            key={i}
            className="heart"
            style={{ left: h.left, fontSize: h.size, animationDelay: h.delay, animationDuration: h.dur, opacity: h.opacity }}
          >♥</span>
        ))}
      </div>

      {/* Boost success popup */}
      {boostSuccess && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-icon">🚀</div>
            <p>Your song has been boosted!</p>
            <button onClick={() => setBoostSuccess(false)}>Got it</button>
          </div>
        </div>
      )}

      {/* Selfie success popup */}
      {selfieSuccess && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-icon">🎉</div>
            <p>Your selfie will stay on screen longer!</p>
            <button onClick={() => setSelfieSuccess(false)}>Got it</button>
          </div>
        </div>
      )}

      {/* Boost modal */}
      {boostTargetId && (
        <div className="modal-overlay" onClick={() => !boosting && setBoostTargetId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Boost your song</h2>
            <p className="modal-sub">Tip to move up in the queue:</p>
            <div className="tip-tiers">
              {BOOST_TIERS.map((tier) => (
                <button key={tier.amount} className="tip-tier-btn" onClick={() => handleBoost(tier.amount)} disabled={boosting}>
                  {tier.label}
                </button>
              ))}
            </div>
            <button className="modal-cancel" onClick={() => setBoostTargetId(null)} disabled={boosting}>Cancel</button>
          </div>
        </div>
      )}

      {/* Selfie tip modal */}
      {selfieModalOpen && (
        <div className="modal-overlay" onClick={() => !tipping && setSelfieModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Keep your selfie on screen! 🔥</h2>
            <p className="modal-sub">Tip to add more screen time:</p>
            <div className="tip-tiers">
              {SELFIE_TIERS.map((tier) => (
                <button key={tier.amount} className="tip-tier-btn" onClick={() => handleSelfieTip(tier.amount)} disabled={tipping}>
                  {tier.label}
                </button>
              ))}
            </div>
            <button className="modal-cancel" onClick={() => setSelfieModalOpen(false)} disabled={tipping}>Cancel</button>
          </div>
        </div>
      )}

      <div className="top-nav">
        <button className="back-btn-top" onClick={() => router.back()}>← Back</button>
        <button className="back-btn-top" onClick={() => router.push("/")}>⌂ Home</button>
      </div>

      <h1 className={pacifico.className}>Song Queue</h1>

      {/* Up Next banner */}
      {isUpNext && (
        <div className="up-next-banner">
          <span className="up-next-pulse">🎵</span>
          <span>Your song is up next!</span>
        </div>
      )}

      <div className="search-wrap">
        <input
          className="search-input"
          placeholder="Search artist, song, or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Selfie bump banner */}
      {showSelfieButton && (
        <div className="selfie-banner">
          <span>Your selfie is on the big screen!</span>
          <button className="selfie-btn" onClick={() => setSelfieModalOpen(true)}>Keep it on longer 🔥</button>
        </div>
      )}

      <div className="queue-list">
        {displayed.length === 0 && <p className="empty">{search ? "No matches found." : "No requests yet — be the first!"}</p>}
        {displayed.map((req, i) => (
          <div
            key={req.id}
            className={`queue-card${req.status === "up_next" ? " up-next" : ""}${req.id === myRequestId ? " mine" : ""}`}
          >
            <div className="rank">#{i + 1}</div>
            <div className="song-info">
              <div className="song-title">
                {req.artist}{req.song_title ? ` — ${req.song_title}` : ""}
                {!req.song_title && <span className="dj-pick-badge">DJ's Pick</span>}
              </div>
              <div className="song-meta">{req.first_name}{req.vibe ? ` · ${req.vibe}` : ""}</div>
            </div>
            {req.status === "up_next" && <span className="up-next-badge">Up Next</span>}
            {req.id === myRequestId && req.status !== "up_next" && <span className="my-badge">Yours</span>}
            {req.status === "pending" && (
              <button className="row-boost-btn" onClick={() => setBoostTargetId(req.id)}>Boost</button>
            )}
          </div>
        ))}
      </div>

      {showScrollTop && (
        <button className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">
          ↑
        </button>
      )}

      <style jsx>{`
        .queue-page {
          min-height: 100vh;
          padding: 2rem 1rem;
          background-color: #2c1a3b;
          color: #f0e6f5;
        }
        .hearts-bg {
          position: fixed; inset: 0; pointer-events: none;
          overflow: hidden; z-index: 0;
        }
        .heart {
          position: absolute; top: -2rem; color: #c9b8e0;
          animation: fall linear infinite;
          user-select: none;
        }
        @keyframes fall {
          0%   { transform: translateY(-2rem) translateX(0) rotate(0deg); }
          25%  { transform: translateY(25vh) translateX(12px) rotate(15deg); }
          50%  { transform: translateY(50vh) translateX(-8px) rotate(-10deg); }
          75%  { transform: translateY(75vh) translateX(10px) rotate(12deg); }
          100% { transform: translateY(110vh) translateX(0) rotate(0deg); }
        }
        .queue-page > *:not(.hearts-bg):not(.scroll-top-btn) { position: relative; z-index: 1; }
        .top-nav {
          max-width: 600px; margin: 0 auto 1rem;
          display: flex; gap: 0.5rem;
        }
        .back-btn-top {
          background: transparent; border: 2px solid #a07cc5;
          color: #c9b8e0; border-radius: 20px; padding: 0.35rem 0.9rem;
          font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
        }
        .back-btn-top:hover { background: #a07cc5; color: #c9b8e0; }
        h1 {
          text-align: center; font-size: 2.5rem;
          margin-bottom: 1.5rem; color: #6b7c3a;
        }
        .up-next-banner {
          max-width: 600px; margin: 0 auto 1rem;
          background: #1a3b2c; border: 2px solid #9effa3;
          border-radius: 12px; padding: 0.9rem 1.2rem;
          display: flex; align-items: center; gap: 0.75rem;
          font-size: 1rem; font-weight: bold; color: #9effa3;
          justify-content: center;
        }
        .up-next-pulse {
          animation: pulse 1s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        .search-wrap {
          max-width: 600px; margin: 0 auto 1rem;
        }
        .search-input {
          width: 100%; box-sizing: border-box;
          padding: 0.65rem 1rem; border-radius: 12px;
          border: 2px solid #3d2656; background: #3d2656;
          color: #f0e6f5; font-size: 0.95rem;
          font-family: inherit; outline: none; transition: border-color 0.2s;
        }
        .search-input::placeholder { color: #7a6a8a; }
        .search-input:focus { border-color: #a07cc5; }
        .row-boost-btn {
          background: transparent; border: 2px solid #a07cc5;
          color: #c9b8e0; border-radius: 12px;
          font-size: 0.85rem; font-family: ${poppins.style.fontFamily};
          cursor: pointer; padding: 0.25rem 0.75rem;
          white-space: nowrap; flex-shrink: 0; transition: all 0.2s;
        }
        .row-boost-btn:hover { background: #a07cc5; color: #c9b8e0; }
        .selfie-banner {
          max-width: 600px; margin: 0 auto 1rem;
          background: #3d2656; border: 2px solid #ffd77d;
          border-radius: 12px; padding: 0.75rem 1rem;
          display: flex; align-items: center;
          justify-content: space-between; gap: 0.75rem; flex-wrap: wrap;
        }
        .selfie-banner span { font-size: 0.9rem; color: #ffd77d; }
        .selfie-btn {
          background: #ffd77d; color: #2c1a3b; border: none;
          border-radius: 20px; padding: 0.35rem 0.9rem;
          font-size: 0.85rem; font-weight: bold; cursor: pointer;
          white-space: nowrap; transition: background 0.2s;
        }
        .selfie-btn:hover { background: #ffc94d; }
        .queue-list {
          max-width: 600px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 0.75rem;
        }
        .empty { text-align: center; color: #a07cc5; margin-top: 2rem; }
        .queue-card {
          display: flex; align-items: center; gap: 0.75rem;
          background: #3d2656; border-radius: 12px;
          padding: 0.75rem 1rem; border: 2px solid transparent;
        }
        .queue-card.up-next { border-color: #9effa3; }
        .queue-card.mine { border-color: #a07cc5; }
        .queue-card.up-next.mine { border-color: #9effa3; }
        .rank { font-size: 0.9rem; color: #a07cc5; min-width: 28px; }
        .song-info { flex: 1; min-width: 0; }
        .song-title {
          font-weight: 600; font-size: 1rem; letter-spacing: 0.01em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          text-shadow: 0 1px 6px rgba(160, 124, 197, 0.5);
        }
        .dj-pick-badge {
          display: inline-block; margin-left: 0.5rem;
          font-size: 0.78rem; font-family: ${poppins.style.fontFamily};
          background: #6b7c3a; color: #c9b8e0;
          border: 2px solid #6b7c3a;
          padding: 0.1rem 0.45rem; border-radius: 12px;
          vertical-align: middle;
        }
        .song-meta {
          font-size: 0.78rem; font-weight: 300; color: #c9b8e0; margin-top: 0.2rem;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          letter-spacing: 0.02em;
        }
        .up-next-badge {
          background: #9effa3; color: #1a3b2c; font-size: 0.75rem;
          font-weight: bold; padding: 0.2rem 0.5rem;
          border-radius: 20px; white-space: nowrap;
        }
        .my-badge {
          background: #a07cc5; color: white; font-size: 0.75rem;
          font-weight: bold; padding: 0.2rem 0.5rem;
          border-radius: 20px; white-space: nowrap;
        }
        .scroll-top-btn {
          position: fixed; bottom: 1.5rem; right: 1.5rem;
          width: 44px; height: 44px; border-radius: 50%;
          background: #d8b8ff; color: #2c1a3b; border: none;
          font-size: 1.2rem; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          transition: background 0.2s; z-index: 100;
        }
        .scroll-top-btn:hover { background: #c3a0ff; }

        /* Modals */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 1rem;
        }
        .modal {
          background: #3d2656; border-radius: 16px;
          padding: 2rem; max-width: 340px; width: 100%;
          display: flex; flex-direction: column; gap: 1rem;
          border: 2px solid #a07cc5;
        }
        .modal h2 { font-size: 1.3rem; color: #6b7c3a; margin: 0; text-align: center; font-family: ${pacifico.style.fontFamily}; }
        .modal-sub { font-size: 0.9rem; color: #c9b8e0; margin: 0; text-align: center; }
        .tip-tiers { display: flex; flex-direction: column; gap: 0.5rem; }
        .tip-tier-btn {
          padding: 0.75rem; border-radius: 10px; border: 2px solid #a07cc5;
          background: #a07cc5; color: #f0e6f5; font-size: 1rem;
          font-family: ${poppins.style.fontFamily};
          cursor: pointer; transition: all 0.2s;
        }
        .tip-tier-btn:hover:not(:disabled) { background: #8a63b0; border-color: #8a63b0; }
        .tip-tier-btn:disabled { opacity: 0.6; cursor: default; }
        .modal-cancel {
          padding: 0.5rem; border-radius: 10px; border: 2px solid #6b586e;
          background: transparent; color: #c9b8e0; font-size: 0.9rem;
          cursor: pointer; transition: all 0.2s;
        }
        .modal-cancel:hover:not(:disabled) { border-color: #a07cc5; color: #f0e6f5; }

        /* Popups */
        .popup-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 1rem;
        }
        .popup {
          background: #3d2656; border: 2px solid #9effa3;
          border-radius: 16px; padding: 2rem; max-width: 300px;
          width: 100%; text-align: center; display: flex;
          flex-direction: column; gap: 0.75rem; align-items: center;
        }
        .popup-icon { font-size: 2.5rem; }
        .popup p { font-size: 1rem; color: #f0e6f5; margin: 0; }
        .popup button {
          padding: 0.5rem 1.5rem; border-radius: 20px; border: none;
          background: #9effa3; color: #2c1a3b; font-weight: bold; cursor: pointer;
        }

        @media (max-width: 480px) {
          h1 { font-size: 2rem; }
          .song-title { font-size: 0.95rem; }
          .song-meta { font-size: 0.75rem; }
        }
      `}</style>
    </main>
  )
}
