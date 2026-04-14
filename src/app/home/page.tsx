"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Pacifico } from "next/font/google"
import { supabase } from "lib/supabase"
import { SELFIE_TIP_TIERS } from "lib/tiers"
import TipModal from "../../components/TipModal"
import SocialLinks from "../../components/SocialLinks"

const pacifico = Pacifico({ weight: "400", subsets: ["latin"] })

export default function Landing() {
  const [selfieApproved, setSelfieApproved] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [selfieModalOpen, setSelfieModalOpen] = useState(false)
  const [activeTip, setActiveTip] = useState<{ tipAmount: number; requestId: string } | null>(null)

  useEffect(() => {
    const id = localStorage.getItem("my_request_id")
    if (!id) return
    setRequestId(id)
    supabase
      .from("requests")
      .select("selfie_status")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data?.selfie_status === "approved") setSelfieApproved(true)
      })
  }, [])

  function handleSelfieTip(amount: number) {
    if (!requestId) return
    setSelfieModalOpen(false)
    setActiveTip({ tipAmount: amount, requestId })
  }

  return (
    <main className="landing">
      <div className="container">

        <div className="logo">

          <div className="wordmark">
            <span className={pacifico.className}>
              <span className="q-wrap">
                <span className="queue">Q</span>
                <svg className="crown" viewBox="0 0 52 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Crown points */}
                  <path d="M2 24 L2 10 L13 18 L26 2 L39 18 L50 10 L50 24 Z" fill="#6b7c3a" stroke="#a0b85a" strokeWidth="1.5" strokeLinejoin="round"/>
                  {/* Base band */}
                  <rect x="2" y="22" width="48" height="6" rx="2" fill="#5a6830" stroke="#a0b85a" strokeWidth="1.2"/>
                  {/* Gems */}
                  <circle cx="26" cy="5" r="3" fill="#6b7c3a"/>
                  <circle cx="13" cy="19" r="2.2" fill="#f0e6f5" className="gem gem-1"/>
                  <circle cx="39" cy="19" r="2.2" fill="#f0e6f5" className="gem gem-2"/>
                  <circle cx="2" cy="11" r="1.8" fill="#6b7c3a"/>
                  <circle cx="50" cy="11" r="1.8" fill="#6b7c3a"/>
                </svg>
              </span><span className="queue">ueue</span><span className="tip">Tip</span>
            </span>
            <span className="tagline">request · boost · vibe</span>
          </div>
        </div>

        <Link href="/request-page">
          <button>Request a Song</button>
        </Link>
        <Link href="/queue">
          <button className="secondary">View Queue</button>
        </Link>
        <Link href="/book">
          <button className="book-btn">Book With Us</button>
        </Link>
      </div>

      {activeTip && (
        <TipModal
          title="Keep your selfie on screen"
          tipAmount={activeTip.tipAmount}
          tipType="selfie"
          requestId={activeTip.requestId}
          onSuccess={() => setActiveTip(null)}
          onClose={() => setActiveTip(null)}
        />
      )}

      {selfieModalOpen && (
        <div className="modal-overlay" onClick={() => setSelfieModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className={pacifico.className}>Keep your selfie on screen! 🔥</h2>
            <p className="modal-sub">Tip to add more screen time:</p>
            <div className="tip-tiers">
              {SELFIE_TIP_TIERS.map((tier) => (
                <button key={tier.amount} className="tip-tier-btn" onClick={() => handleSelfieTip(tier.amount)}>
                  {tier.label}
                </button>
              ))}
            </div>
            <button className="modal-cancel" onClick={() => setSelfieModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {selfieApproved && (
        <div className="selfie-banner">
          <span>Your selfie is on the big screen!</span>
          <button className="selfie-btn" onClick={() => setSelfieModalOpen(true)}>Keep it on longer 🔥</button>
        </div>
      )}

      <SocialLinks />



      <style jsx>{`
        .landing {
          min-height: 100vh;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1.5rem;
          background-color: #2c1a3b; /* warm dark purple */
          color: #f0e6f5;
          box-sizing: border-box;
        }

        .container {
          text-align: center;
          max-width: 400px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .logo {
          position: absolute;
          top: 3rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          width: 100%;
          max-width: 400px;
        }
        .wordmark {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .wordmark > span:first-child {
          font-size: 2.8rem;
          line-height: 1.1;
          padding-bottom: 0.4rem;
        }
        .q-wrap {
          position: relative;
          display: inline-block;
        }
        .crown {
          position: absolute;
          width: 36px;
          top: -8px;
          left: 50%;
          transform: translateX(-60%) rotate(-14deg);
        }
        .queue { color: #d8b8ff; }
        .tip { color: #6b7c3a; }
        .tagline {
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: linear-gradient(
            90deg,
            #7a6a8a 0%,
            #7a6a8a 20%,
            #d8b8ff 40%,
            #f0e6f5 50%,
            #d8b8ff 60%,
            #7a6a8a 80%,
            #7a6a8a 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 6s linear infinite;
        }

        @keyframes shimmer {
          from { background-position: 200% center; }
          to { background-position: -200% center; }
        }

        :global(.gem) {
          transform-box: fill-box;
          transform-origin: center;
          animation: sparkle 2.4s ease-in-out infinite;
        }
        :global(.gem-2) {
          animation-delay: 1.2s;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); filter: none; }
          40% { opacity: 0.15; transform: scale(0.6); filter: none; }
          50% { opacity: 1; transform: scale(1.5); filter: drop-shadow(0 0 3px #fff); }
          60% { opacity: 0.15; transform: scale(0.6); filter: none; }
        }

        p {
          font-size: 1.1rem;
        }

        button {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          border-radius: 8px;
          border: none;
          background-color: #d8b8ff; /* light lavender */
          color: #2c1a3b;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s;
          min-width: 220px;
        }

        button:hover {
          background-color: #c3a0ff;
        }
        button.book-btn {
          background-color: #6b7c3a;
          color: #2c1a3b;
          border: none;
        }
        button.book-btn:hover {
          background-color: #5a6830;
        }
        button.secondary {
          background-color: transparent;
          border: 2px solid #d8b8ff;
          color: #d8b8ff;
        }
        button.secondary:hover {
          background-color: #d8b8ff;
          color: #2c1a3b;
        }

        .selfie-banner {
          position: fixed;
          top: 1.25rem;
          left: 50%;
          transform: translateX(-50%);
          background: #3d2656;
          border: 2px solid #ffd77d;
          border-radius: 12px;
          padding: 0.65rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          white-space: nowrap;
          z-index: 100;
        }
        .selfie-banner span { font-size: 0.9rem; color: #ffd77d; }
        .selfie-btn {
          background: #ffd77d; color: #2c1a3b; border: none;
          border-radius: 20px; padding: 0.35rem 0.9rem;
          font-size: 0.85rem; font-weight: bold; cursor: pointer;
          white-space: nowrap; transition: background 0.2s;
        }
        .selfie-btn:hover { background: #ffc94d; }

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
        .modal h2 { font-size: 1.4rem; color: #ffd77d; margin: 0; text-align: center; }
        .modal-sub { font-size: 0.9rem; color: #c9b8e0; margin: 0; text-align: center; }
        .tip-tiers { display: flex; flex-direction: column; gap: 0.5rem; }
        .tip-tier-btn {
          padding: 0.75rem; border-radius: 10px; border: 2px solid #a07cc5;
          background: #a07cc5; color: #f0e6f5; font-size: 1rem;
          cursor: pointer; transition: all 0.2s;
        }
        .tip-tier-btn:hover { background: #8a63b0; border-color: #8a63b0; }
        .modal-cancel {
          padding: 0.5rem; border-radius: 10px; border: 2px solid #6b586e;
          background: transparent; color: #c9b8e0; font-size: 0.9rem;
          cursor: pointer; transition: all 0.2s;
        }
        .modal-cancel:hover { border-color: #a07cc5; color: #f0e6f5; }

        /* Mobile adjustments */
        @media (max-width: 480px) {
          h1 {
            font-size: 2rem;
          }

          p {
            font-size: 1rem;
          }

          button {
            width: 100%; /* stretch button full width */
            font-size: 1rem;
            padding: 0.7rem;
          }

          .container {
            gap: 0.75rem; /* reduce spacing for small screens */
          }
        }

        /* Tablet adjustments */
        @media (max-width: 768px) {
          h1 {
            font-size: 2.2rem;
          }

          p {
            font-size: 1.05rem;
          }

          button {
            font-size: 1rem;
            padding: 0.75rem 1.25rem;
          }
        }
      `}</style>
    </main>
  )
}