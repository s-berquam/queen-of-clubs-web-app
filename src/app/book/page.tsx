"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "lib/supabase"
import { validateEmail, validatePhone } from "lib/validation"
import SocialLinks from "../../components/SocialLinks"
import { Pacifico, Poppins } from "next/font/google"

const pacifico = Pacifico({ weight: "400", subsets: ["latin"] })
const poppins = Poppins({ weight: ["300", "400", "600"], subsets: ["latin"] })

export default function BookPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventInfo, setEventInfo] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg("")

    if (!fullName.trim()) {
      setErrorMsg("Full name is required.")
      return
    }
    if (!email.trim() && !phone.trim()) {
      setErrorMsg("Please provide either an email or phone number.")
      return
    }
    if (email && !validateEmail(email)) {
      setErrorMsg("Invalid email format.")
      return
    }
    if (phone && !validatePhone(phone)) {
      setErrorMsg("Invalid phone format.")
      return
    }
    if (eventDate) {
      const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/
      if (!dateRegex.test(eventDate)) {
        setErrorMsg("Please enter the date as MM/DD/YYYY.")
        return
      }
      const [month, day, year] = eventDate.split("/").map(Number)
      const entered = new Date(year, month - 1, day)
      if (entered <= new Date()) {
        setErrorMsg("Event date must be in the future.")
        return
      }
    }

    setLoading(true)
    const { error } = await supabase.from("bookings").insert([{
      full_name: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      event_date: eventDate ? `${eventDate.split("/")[2]}-${eventDate.split("/")[0]}-${eventDate.split("/")[1]}` : null,
      event_info: eventInfo.trim() || null,
    }])
    setLoading(false)

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSubmitted(true)
      setTimeout(() => router.push("/home"), 5000)
    }
  }

  if (submitted) {
    return (
      <main className="book-page" style={{ fontFamily: poppins.style.fontFamily }}>
        <div className="modal-overlay">
          <div className="modal">
            <h2 className={pacifico.className}>Request Received!</h2>
            <p>Thanks for reaching out! I'll be in touch soon to discuss your event.</p>
          </div>
        </div>
        <SocialLinks />
        <Styles pacifico={pacifico.style.fontFamily} poppins={poppins.style.fontFamily} />
      </main>
    )
  }

  return (
    <main className="book-page" style={{ fontFamily: poppins.style.fontFamily }}>
      <div className="container">
        <div className="top-nav">
          <button className="back-arrow" onClick={() => router.push("/home")}>⌂ Home</button>
        </div>
        <p className="sub">Fill out the form below and we'll get back to you to discuss your event.</p>

        <form onSubmit={handleSubmit}>
          <p className="error">{errorMsg}</p>

          <input
            className="input-field"
            name="name"
            placeholder="Full Name *"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            className="input-field"
            type="email"
            name="email"
            placeholder="Email (optional if phone provided)"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input-field"
            type="tel"
            name="tel"
            placeholder="Phone (optional if email provided)"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="input-field date-input"
            type="text"
            name="event-date"
            autoComplete="off"
            placeholder="Event Date e.g. 12/31/2025 (optional)"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
          <div className="info-section">
            <p className="section-label">Tell me about your event <span className="optional">(optional)</span></p>
            <textarea
              className="input-field"
              name="event-info"
              autoComplete="off"
              placeholder="Venue, vibe, expected attendance, anything helpful..."
              value={eventInfo}
              onChange={(e) => setEventInfo(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Sending..." : "Send Booking Request"}
          </button>
        </form>
      </div>

      <SocialLinks />

      <Styles pacifico={pacifico.style.fontFamily} poppins={poppins.style.fontFamily} />
    </main>
  )
}

function Styles({ pacifico, poppins }: { pacifico: string; poppins: string }) {
  return (
    <style jsx global>{`
      .book-page {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 2rem 1rem;
        background-color: #2c1a3b;
        color: #f0e6f5;
        font-family: ${poppins};
        overflow-x: hidden;
        box-sizing: border-box;
      }
      .book-page .container {
        width: 100%;
        max-width: 420px;
        display: flex;
        flex-direction: column;
      }
      .book-page .top-nav { margin-bottom: 0.5rem; }
      .book-page .back-arrow {
        background: transparent; border: 2px solid #a07cc5;
        color: #c9b8e0; border-radius: 20px; padding: 0.35rem 0.9rem;
        font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
      }
      .book-page .back-arrow:hover { background: #a07cc5; color: white; }
      .book-page h1 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
        color: #6b7c3a;
      }
      .book-page .success-icon {
        text-align: center;
        font-size: 3rem;
        margin-bottom: 0.5rem;
      }
      .book-page .sub {
        text-align: center;
        font-size: 0.9rem;
        color: #c9b8e0;
        margin: 0 0 1.25rem;
        line-height: 1.4;
      }
      .book-page form {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
      }
      .book-page .input-field {
        padding: 0.75rem;
        border-radius: 12px;
        border: 2px solid #3d2656;
        font-size: 1rem;
        width: 100%;
        box-sizing: border-box;
        font-family: ${poppins};
        color: #f0e6f5;
        background-color: #3d2656;
        outline: none;
        transition: border-color 0.2s;
      }
      .book-page .input-field:focus { border-color: #a07cc5; }
      .book-page .input-field::placeholder { color: #7a6a8a; }
      .book-page .input-field:-webkit-autofill,
      .book-page .input-field:-webkit-autofill:hover,
      .book-page .input-field:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0px 1000px #3d2656 inset;
        -webkit-text-fill-color: #f0e6f5;
        caret-color: #f0e6f5;
      }
      .book-page textarea.input-field {
        resize: vertical;
        min-height: 110px;
      }
      .book-page .date-input {
        width: 100%;
        box-sizing: border-box;
        -webkit-appearance: none;
        appearance: none;
        display: block;
        line-height: normal;
        color: #7a6a8a;
      }
      .book-page .date-input:valid {
        color: #f0e6f5;
      }
      .book-page .date-input::-webkit-calendar-picker-indicator {
        filter: invert(0.7);
        cursor: pointer;
      }
      .book-page .date-section,
      .book-page .info-section {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .book-page .section-label {
        font-size: 0.88rem;
        color: #c9b8e0;
        margin: 0;
      }
      .book-page .optional {
        font-size: 0.8rem;
        color: #7a6a8a;
      }
      .book-page .submit-btn {
        background-color: #6b7c3a;
        color: #c9b8e0;
        font-weight: bold;
        cursor: pointer;
        border: none;
        border-radius: 12px;
        padding: 0.8rem;
        font-size: 1.2rem;
        font-family: ${pacifico};
        transition: background-color 0.2s;
      }
      .book-page .submit-btn:hover:not(:disabled) { background-color: #5a6830; }
      .book-page .submit-btn:disabled { opacity: 0.6; cursor: default; }
      .book-page .home-btn {
        background: transparent; border: 2px solid #a07cc5;
        color: #c9b8e0; border-radius: 20px; padding: 0.35rem 0.9rem;
        font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
        align-self: center; margin-top: 0.5rem;
      }
      .book-page .home-btn:hover { background: #a07cc5; color: white; }
      .book-page .error {
        color: #6b7c3a;
        text-align: center;
        font-weight: bold;
        min-height: 1.4rem;
        margin: 0;
      }
      .modal-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.6);
        display: flex; align-items: center; justify-content: center;
        z-index: 1000; padding: 1rem;
      }
      .modal {
        background: #3d2656; border: 2px solid #a07cc5;
        border-radius: 20px; padding: 2rem 1.5rem;
        max-width: 340px; width: 100%;
        display: flex; flex-direction: column;
        align-items: center; gap: 0.75rem; text-align: center;
      }
      .modal h2 {
        font-size: 1.8rem; color: #6b7c3a; margin: 0;
      }
      .modal p {
        font-size: 0.9rem; color: #c9b8e0; margin: 0;
      }
      @media (max-width: 430px) {
        .book-page {
          padding-bottom: 6rem;
        }
      }
    `}</style>
  )
}
