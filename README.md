# CuraLink — Project Root

> **AI-Powered Healthcare & E-Channeling Platform for Sri Lanka**
> Book a doctor, understand your lab report, and get a preliminary triage — all in your own language, from any browser, on any device.

---

## 🗂 Repository Structure

```
CuraLink/
├─ backend/          Node.js + Express — auth, bookings, AI, core REST API
├─ web-app/          Next.js 14 (App Router) — patient, doctor, nurse, admin, pharmacy UIs
├─ infra/            Docker Compose + deployment scripts
├─ docs/             Architecture diagrams, API reference
└─ temp-mediAI/      Original MediAI source (reference only — do not edit)
```

---

## ⚡ Quick Start (Development)

### 1. Backend
```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI and Gemini_API_KEY in .env
npm install
npm run dev
# → CuraLink API running on http://localhost:5000
```

### 2. Web App
```bash
cd web-app
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
# → Next.js running on http://localhost:3000
```

### 3. Full Stack (Docker)
```bash
cd infra
docker compose up -d
# → All services running
```

---

## 🧠 AI Features

| Feature | How It Works | Endpoint |
|---|---|---|
| Symptom Triage | Gemini analyzes text symptoms → predicted conditions + specialist | `POST /api/ai/analyze` |
| Report Q&A (RAG) | Upload PDF/image → OCR → embed chunks → cosine-similarity retrieval → Gemini answers | `POST /api/reports/:id/ask` |
| Visual Triage | Upload symptom photo → Gemini Vision → urgency flag (Low/Monitor/See Doctor Soon) | `POST /api/triage/scan` |
| Multilingual Voice | Web Speech API (EN/SI/TA) in browser → text sent to AI | Frontend (browser API) |
| Drug Interaction Check | Gemini checks drug list + patient allergies at pharmacy redemption | `POST /api/pharmacy/redeem` |

---

## 👥 User Roles

| Role | Portal | Key Pages |
|---|---|---|
| Patient | `/patient/*` | Dashboard, Symptom Check, Book Appointment, My Reports, Prescriptions |
| Doctor | `/doctor/*` | Slots, Queue, Patient Detail, New Prescription |
| Nurse | `/nurse/*` | Lab Queue, Sample Collection |
| Admin | `/admin/*` | Verification, User Roles, Monitoring |
| Pharmacy | `/pharmacy/*` | QR Scan, Drug Interactions |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, MongoDB (Mongoose) |
| AI | Google Gemini API (text, vision, embeddings) |
| Auth | JWT + httpOnly cookies |
| PWA | Service Worker + IndexedDB (offline-first for clinic stations) |
| Voice Input | Web Speech API (EN/SI/TA) |
| QR Codes | `qrcode` npm package |
| Notifications | Nodemailer (email) |
| Deployment | Vercel (web-app) + Render/Fly.io (backend) + MongoDB Atlas |

---

## 🗄 Database Collections

| Collection | Purpose |
|---|---|
| `users` | All roles — patients, doctors, nurses, admins, pharmacy |
| `doctors` | Doctor availability, slots, specialty |
| `appointments` | Booking records |
| `labs` + `labbookings` | Lab test bookings |
| `medicalrecords` | Patient medical history + attachments |
| `prescriptions` | Digital prescriptions with QR tokens |
| `reports` | Uploaded lab reports with OCR text + embeddings |
| `ragqueries` | Q&A history per patient |
| `triagescans` | Visual triage results |
| `aianalysislogs` | Symptom check history |
| `notifications` | In-app + email notification records |

---

## 🎓 Portfolio Framing

When talking about this project in interviews:

- **"Built a patient-scoped RAG pipeline"** — OCR ingestion via Gemini Vision, chunk embedding with `text-embedding-004`, cosine-similarity retrieval in MongoDB, grounded Gemini answers with source citations
- **"Visual symptom triage"** — Gemini Vision multimodal API as a zero-training CNN substitute, returns urgency flags routing into the booking flow
- **"Microservice-ready architecture"** — backend and web-app are independently deployable; AI routes are isolated in the backend's AI module for easy extraction to a FastAPI service
- **"PWA with offline-tolerant sync"** — Service Worker caching + IndexedDB form queuing for clinic front-desk stations on flaky Wi-Fi
- **"Multilingual healthcare platform"** — Web Speech API (EN/SI/TA) + full i18n across the UI targeting the Sri Lankan market

---

## 📋 Build Phases

- **Phase 1 (MVP)** — Next.js scaffold, auth, doctor/lab search, appointment booking, digital records
- **Phase 2 (RAG)** — Report upload, OCR pipeline, Q&A chat with source citation  
- **Phase 3 (CNN Triage + Voice)** — Visual triage, Sinhala/Tamil voice intake
- **Phase 4 (Differentiators)** — Queue wait-time, pharmacy QR handoff, drug interaction checks
- **Phase 5 (Polish)** — Accessibility, PWA, deployment, demo video
