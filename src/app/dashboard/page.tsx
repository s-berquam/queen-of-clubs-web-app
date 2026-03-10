"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "lib/supabase"

type Request = {
  id: string
  first_name: string
  song_title: string
  artist: string
  notes: string | null
  status: "pending" | "up_next" | "played" | "archived"
  datetime_requested: string
  price_paid?: number
  votes: number
  vibe: string | null
  selfie_url: string | null
  selfie_status: string | null
  selfie_duration: number
}

const STATUS_VALUES: Record<string, Request["status"]> = {
  Played: "played",
  "Up Next": "up_next",
  Archived: "archived",
}

const VIBES = ["Hype", "Sing-Along", "Feel-Good", "Slow Jam", "Throwback"]

export default function Dashboard() {
  const [requests, setRequests] = useState<Request[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [vibeFilter, setVibeFilter] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const prevStatusRef = useRef<Record<string, string>>({})

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission()
    }
  }, [])

  function formatStatus(status: string) {
    return status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  }

  function notifyUpNext(request: Request) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Up Next!", {
        body: `${request.first_name}, "${request.song_title}" by ${request.artist}`,
        icon: "/favicon.ico",
      })
    }
    setToast(`🎵 ${request.first_name}, "${request.song_title}" is Up Next!`)
    setTimeout(() => setToast(null), 4000)
  }

  async function updateStatus(id: string, status: Request["status"]) {
    const { error } = await supabase.from("requests").update({ status }).eq("id", id)
    if (error) console.error("Update error:", error)
  }

  async function moderateSelfie(id: string, status: "approved" | "rejected") {
    const { error } = await supabase
      .from("requests")
      .update({ selfie_status: status })
      .eq("id", id)
    if (error) console.error("Moderation error:", error)
  }

  useEffect(() => {
    async function fetchRequests() {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .order("datetime_requested", { ascending: false })
      if (data) {
        prevStatusRef.current = Object.fromEntries(data.map((r) => [r.id, r.status]))
        setRequests(data)
      }
      if (error) console.error("Fetch error:", error.message, error.details, error.hint, error.code)
    }

    fetchRequests()

    const channel = supabase
      .channel("dashboard-requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setRequests((prev) => [payload.new as Request, ...prev])
          prevStatusRef.current[payload.new.id] = payload.new.status
        } else if (payload.eventType === "UPDATE") {
          const updated = payload.new as Request
          const prevStatus = prevStatusRef.current[updated.id]
          if (prevStatus !== "up_next" && updated.status === "up_next") notifyUpNext(updated)
          prevStatusRef.current[updated.id] = updated.status
          setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
        } else if (payload.eventType === "DELETE") {
          const id = (payload.old as { id: string }).id
          setRequests((prev) => prev.filter((r) => r.id !== id))
          delete prevStatusRef.current[id]
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const displayed = vibeFilter ? requests.filter((r) => r.vibe === vibeFilter) : requests

  return (
    <main className="dashboard">
      {toast && <div className="toast">{toast}</div>}

      {lightboxUrl && (
        <div className="lightbox" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="Selfie" className="lightbox-img" />
          <span className="lightbox-close">✕</span>
        </div>
      )}

      <h1>🎶 Live Song Requests</h1>

      <div className="vibe-filters">
        <button className={`filter-btn${!vibeFilter ? " active" : ""}`} onClick={() => setVibeFilter(null)}>All</button>
        {VIBES.map((v) => (
          <button key={v} className={`filter-btn${vibeFilter === v ? " active" : ""}`} onClick={() => setVibeFilter(v)}>{v}</button>
        ))}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Song</th>
              <th>Artist</th>
              <th>Requester</th>
              <th>Vibe</th>
              <th>🔥</th>
              <th>Tip</th>
              <th>Status</th>
              <th>Time</th>
              <th>Selfie</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((req) => (
              <tr key={req.id} className={req.status === "played" ? "played" : ""}>
                <td>{req.song_title}</td>
                <td>{req.artist}</td>
                <td>{req.first_name}</td>
                <td>{req.vibe || "—"}</td>
                <td className="votes">{req.votes}</td>
                <td>${req.price_paid || 0}</td>
                <td>{formatStatus(req.status)}</td>
                <td>
                  {new Date(req.datetime_requested).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="selfie-cell">
                  {req.selfie_url ? (
                    <div className="selfie-controls">
                      <img
                        src={req.selfie_url}
                        alt="selfie"
                        className="selfie-thumb"
                        onClick={() => setLightboxUrl(req.selfie_url)}
                        title="Click to enlarge"
                      />
                      {req.selfie_status === "pending" && (
                        <div className="selfie-actions">
                          <span className="selfie-badge pending">Pending</span>
                          <button className="mod-btn approve" onClick={() => moderateSelfie(req.id, "approved")}>✓ Approve</button>
                          <button className="mod-btn deny" onClick={() => moderateSelfie(req.id, "rejected")}>✕ Deny</button>
                        </div>
                      )}
                      {req.selfie_status === "approved" && (
                        <div className="selfie-actions">
                          <span className="selfie-badge published">Live</span>
                          <button className="mod-btn deny" onClick={() => moderateSelfie(req.id, "rejected")}>✕ Remove</button>
                        </div>
                      )}
                      {req.selfie_status === "rejected" && (
                        <div className="selfie-actions">
                          <span className="selfie-badge denied">Denied</span>
                          <button className="mod-btn approve" onClick={() => moderateSelfie(req.id, "approved")}>✓ Approve</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="no-selfie">—</span>
                  )}
                </td>
                <td className="actions">
                  {Object.entries(STATUS_VALUES).map(([label, value]) => (
                    <button key={value} onClick={() => updateStatus(req.id, value)}>{label}</button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          padding: 1rem;
          background-color: #2c1a3b;
          color: #f0e6f5;
          position: relative;
        }
        h1 { text-align: center; font-size: 2rem; margin-bottom: 1rem; }
        .vibe-filters {
          display: flex; flex-wrap: wrap; gap: 0.5rem;
          justify-content: center; margin-bottom: 1rem;
        }
        .filter-btn {
          padding: 0.3rem 0.8rem; border-radius: 20px;
          border: 2px solid #a07cc5; background: transparent;
          color: #f0e6f5; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;
        }
        .filter-btn.active { background: #a07cc5; color: white; }
        .table-wrapper { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 800px; }
        th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #6b586e; }
        tr.played { background-color: #88805f; }
        .votes { font-weight: bold; color: #FF6F61; }
        .selfie-cell { vertical-align: middle; }
        .selfie-controls { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
        .selfie-thumb {
          width: 48px; height: 48px; object-fit: cover;
          border-radius: 6px; cursor: pointer;
          border: 2px solid transparent; transition: border-color 0.2s;
        }
        .selfie-thumb:hover { border-color: #d8b8ff; }
        .selfie-actions {
          display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
        }
        .selfie-badge {
          font-size: 0.68rem; font-weight: bold; padding: 0.15rem 0.4rem;
          border-radius: 4px; white-space: nowrap;
        }
        .selfie-badge.pending { background: #ffd77d; color: #333; }
        .selfie-badge.published { background: #9effa3; color: #000; }
        .selfie-badge.denied { background: #ff6b6b; color: #fff; }
        .mod-btn {
          font-size: 0.72rem; padding: 0.2rem 0.5rem;
          border-radius: 6px; border: none; cursor: pointer;
          font-weight: bold; white-space: nowrap; width: 100%;
        }
        .mod-btn.approve { background: #9effa3; color: #000; }
        .mod-btn.deny { background: #ff6b6b; color: #fff; }
        .no-selfie { color: #6b586e; }
        .actions button {
          margin-right: 0.25rem; margin-bottom: 0.25rem;
          padding: 0.25rem 0.5rem; font-size: 0.85rem;
          border-radius: 6px; border: none; cursor: pointer; font-weight: bold;
        }
        .actions button:nth-child(1) { background-color: #9effa3; color: #000; }
        .actions button:nth-child(2) { background-color: #ffd77d; color: #000; }
        .actions button:nth-child(3) { background-color: #ff6b6b; color: #fff; }
        .toast {
          position: fixed; top: 1rem; left: 50%; transform: translateX(-50%);
          background-color: #ffd77d; color: #000; padding: 0.75rem 1.5rem;
          border-radius: 8px; font-weight: bold;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3); z-index: 1000;
        }
        .lightbox {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85);
          display: flex; align-items: center; justify-content: center;
          z-index: 2000; cursor: pointer;
        }
        .lightbox-img {
          max-width: 90vw; max-height: 90vh;
          border-radius: 12px; object-fit: contain;
        }
        .lightbox-close {
          position: absolute; top: 1.5rem; right: 1.5rem;
          color: white; font-size: 1.5rem; cursor: pointer;
        }
        @media (max-width: 768px) {
          th, td { padding: 0.4rem 0.5rem; font-size: 0.9rem; }
          .actions button { font-size: 0.8rem; padding: 0.2rem 0.4rem; }
        }
        @media (max-width: 480px) {
          h1 { font-size: 1.5rem; }
          th, td { font-size: 0.85rem; }
          .actions button { font-size: 0.75rem; padding: 0.2rem 0.3rem; }
        }
      `}</style>
    </main>
  )
}
