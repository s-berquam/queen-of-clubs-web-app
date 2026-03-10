"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "lib/supabase"

type SelfieRequest = {
  id: string
  first_name: string
  song_title: string
  artist: string
  selfie_url: string
  selfie_duration: number
  selfie_status: string | null
}

export default function MonitorPage() {
  const [selfies, setSelfies] = useState<SelfieRequest[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const selfiesRef = useRef<SelfieRequest[]>([])

  useEffect(() => {
    selfiesRef.current = selfies
  }, [selfies])

  useEffect(() => {
    async function fetchSelfies() {
      const { data } = await supabase
        .from("requests")
        .select("id, first_name, song_title, artist, selfie_url, selfie_duration, selfie_status")
        .eq("selfie_status", "approved")
        .not("selfie_url", "is", null)
        .order("datetime_requested", { ascending: true })
      if (data) setSelfies(data)
    }
    fetchSelfies()

    const channel = supabase
      .channel("monitor-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, (payload) => {
        if (payload.eventType === "UPDATE") {
          const r = payload.new as SelfieRequest
          if (r.selfie_status === "approved" && r.selfie_url) {
            setSelfies((prev) => {
              const exists = prev.find((x) => x.id === r.id)
              if (exists) return prev.map((x) => (x.id === r.id ? r : x))
              return [...prev, r]
            })
          } else {
            setSelfies((prev) => prev.filter((x) => x.id !== r.id))
          }
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Advance to next selfie after current one's duration
  useEffect(() => {
    if (selfies.length === 0) return
    const current = selfies[currentIndex % selfies.length]
    const duration = (current?.selfie_duration ?? 15) * 1000

    // Fade out 600ms before switching
    const fadeTimer = setTimeout(() => setFading(true), duration - 600)
    const switchTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % selfiesRef.current.length)
      setFading(false)
    }, duration)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(switchTimer)
    }
  }, [currentIndex, selfies])

  if (selfies.length === 0) {
    return (
      <main className="monitor empty">
        <div className="waiting">
          <div className="logo">🎶 All Love</div>
          <p>Waiting for selfies...</p>
        </div>
        <style jsx>{`
          .monitor {
            min-height: 100vh;
            background: #0d0d0d;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .waiting {
            text-align: center;
            color: #f0e6f5;
          }
          .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          p {
            font-size: 1.2rem;
            color: #a07cc5;
          }
        `}</style>
      </main>
    )
  }

  const current = selfies[currentIndex % selfies.length]

  return (
    <main className="monitor">
      <div className={`selfie-wrap${fading ? " fading" : ""}`}>
        <img
          key={current.id + currentIndex}
          src={current.selfie_url}
          alt={current.first_name}
          className="selfie-img"
        />
        <div className="overlay">
          <div className="overlay-content">
            <div className="requester-name">{current.first_name}</div>
            <div className="song-title">"{current.song_title}"</div>
            <div className="artist">by {current.artist}</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .monitor {
          width: 100vw;
          height: 100vh;
          background: #0d0d0d;
          overflow: hidden;
          position: relative;
        }
        .selfie-wrap {
          width: 100%;
          height: 100%;
          position: relative;
          transition: opacity 0.6s ease;
          opacity: 1;
        }
        .selfie-wrap.fading {
          opacity: 0;
        }
        .selfie-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
          padding: 4rem 3rem 2.5rem;
        }
        .overlay-content {
          max-width: 900px;
        }
        .requester-name {
          font-size: 2.8rem;
          font-weight: bold;
          color: #ffffff;
          line-height: 1.1;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }
        .song-title {
          font-size: 2rem;
          color: #ffd77d;
          margin-top: 0.3rem;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }
        .artist {
          font-size: 1.4rem;
          color: #d8b8ff;
          margin-top: 0.2rem;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }
        @media (max-width: 768px) {
          .requester-name { font-size: 2rem; }
          .song-title { font-size: 1.4rem; }
          .artist { font-size: 1rem; }
          .overlay { padding: 3rem 1.5rem 1.5rem; }
        }
      `}</style>
    </main>
  )
}
