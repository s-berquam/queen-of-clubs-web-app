<h1 align="center">
  <em>QueueTip</em> — Song Request App
</h1>

<p align="center">
  A real-time song request app for DJs and music lovers. Guests request songs, set the vibe, and capture the moment — the DJ stays in control.
</p>

---

## Features

- **Song Requests** — Guests submit song requests with name, artist, vibe, and optional notes
- **DJ's Choice** — Guests pick an artist and a vibe; the DJ selects the perfect song
- **Queue Boost** — Guests tip $2 (move up 2 spots) or $5 (jump to top); boost amount drives queue ordering
- **Selfie Integration** — Guests upload selfies for real-time display on screen; tip to extend screen time
- **Monitor View** — Read-only realtime queue display for second screens or venue TVs
- **Event Opt-In** — Guests can opt in to event notifications from Queen of Clubs Collective
- **DJ Booking** — Guests can submit booking inquiries via the Book With Us page
- **DJ Dashboard** — Real-time admin view at `/dashboard` with vibe filtering and queue controls (Pending → Up Next → Played → Archived)
- **Real-time Queue** — Powered by Supabase Realtime; requests update instantly across all clients
- **Social Links** — Facebook, Instagram, Discord, and Twitch links on every user-facing page

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | styled-jsx |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime |
| Payments | Square (Sandbox + Production) |
| SMS | Twilio |
| Hosting | Vercel |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/home` |
| `/home` | Landing page with navigation |
| `/request-page` | Song request form with DJ's Choice and tip options |
| `/queue` | Live song queue — browse requests, boost your song, opt in to event updates |
| `/selfie` | Selfie upload page; guests can tip to extend their selfie's screen time |
| `/monitor` | Read-only realtime queue display for venue screens |
| `/book` | DJ booking inquiry form |
| `/dashboard` | DJ admin console — live requests, status controls, vibe filter, iTunes song search for DJ's Choice |

---

## Database Schema

**`requests` table**

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `first_name` | text | Requester's name |
| `song_title` | text | Empty when DJ's Choice |
| `artist` | text | Required |
| `vibe` | text | Hype, Sing-Along, Feel-Good, Slow Jam, Throwback |
| `status` | text | pending, up_next, played, archived |
| `boost_amount` | numeric | Cumulative boost tip paid; drives queue ordering |
| `price_paid` | numeric | Total tip amount paid |
| `selfie_url` | text | Optional selfie image URL |
| `selfie_status` | text | pending, approved, rejected |
| `selfie_duration` | integer | Screen time in seconds (extended by selfie tips) |
| `email` | text | Optional |
| `phone` | text | Optional |
| `notes` | text | Optional |
| `opt_in` | boolean | Event notification opt-in |
| `event_id` | uuid | FK to events table |
| `datetime_requested` | timestamp | |

**`bookings` table**

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `full_name` | text | |
| `email` | text | Optional |
| `phone` | text | Optional |
| `event_date` | date | Optional |
| `event_info` | text | Optional |
| `created_at` | timestamp | |

**`events` table**

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `name` | text | |
| `venue` | text | Optional |
| `event_date` | date | Optional |
| `is_active` | boolean | Only one active event allowed at a time |
| `created_at` | timestamp | |

**Supabase Functions**
- `get_song_suggestions(p_vibe text, p_event_id uuid)` — top 5 most-requested songs for a vibe, filtered by event

---

## Environment Variables

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_WEBHOOK_SIGNATURE_KEY=
NEXT_PUBLIC_SQUARE_APP_ID=
NEXT_PUBLIC_SQUARE_LOCATION_ID=
NEXT_PUBLIC_BASE_URL=
```

**Optional:**
```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
META_APP_ID=
META_APP_SECRET=
META_PAGE_ACCESS_TOKEN=
META_IG_ACCOUNT_ID=
DISCORD_WEBHOOK_URL=
EVENTBRITE_TOKEN=
EVENTBRITE_ORG_ID=
```

---

## Local Development

**1. Clone the repo**
```bash
git clone https://github.com/s-berquam/queue-tip.git
cd queue-tip
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Copy the variables above into a `.env.local` file and fill in your values.

**4. Run the dev server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

Deployed on [Vercel](https://vercel.com). Every push to `main` triggers an automatic deployment.

To deploy your own instance:
1. Import the repo into Vercel
2. Add all environment variables in Vercel → Settings → Environment Variables
3. Set `NEXT_PUBLIC_BASE_URL` to your Vercel URL after first deploy
4. Redeploy to pick up the base URL

---

## Contact

- Email: sarah.berquam@gmail.com
- Instagram: [@all_love_jams](https://instagram.com/all_love_jams)
- LinkedIn: [sarahberquam](https://www.linkedin.com/in/sarahberquam/)
