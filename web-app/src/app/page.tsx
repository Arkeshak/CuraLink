'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Stethoscope, FileSearch, Camera, CalendarCheck, ShieldPlus, Globe, 
  Activity, ArrowRight, User, Droplets, CheckCircle2 
} from 'lucide-react';
import Image from 'next/image';

const AI_FEATURES = [
  {
    id: 'symptom',
    title: 'AI Symptom Analysis',
    desc: 'Get immediate clinical insights before you even book an appointment.',
    bullets: [
      'Describe symptoms in plain language',
      'AI predicts potential conditions',
      'Instant routing to the right specialist',
      'Available 24/7 with zero wait time'
    ],
    mockup: '/images/mockup_symptom.png',
    blobColor: '#E6F4F1' // soft teal
  },
  {
    id: 'rag',
    title: 'Lab Report Q&A',
    desc: 'Understand your medical data without waiting for your next consultation.',
    bullets: [
      'Upload PDFs of your lab results',
      'Ask questions in conversational language',
      'Answers grounded strictly in your own data',
      'Clear, jargon-free explanations'
    ],
    mockup: '/images/mockup_lab.png',
    blobColor: '#EBF4FF' // soft blue
  },
  {
    id: 'rx',
    title: 'Digital Prescriptions',
    desc: 'Paperless, secure, and instantly verifiable by partner pharmacies.',
    bullets: [
      'QR-coded for absolute security',
      'Automatic drug interaction checks',
      'Direct routing to local pharmacies',
      'Never lose a prescription again'
    ],
    mockup: '/images/mockup_rx.png',
    blobColor: '#E8F5E9' // soft green
  }
];

const STATS = [
  { value: 500, label: 'Doctors Onboarded', suffix: '+' },
  { value: 50, label: 'Specialties Covered', suffix: '+' },
  { value: 10, label: 'Active Patients', suffix: 'K+' },
];

const ROLES = [
  { icon: User, title: 'Patients', desc: 'Book appointments, upload reports, get AI triage.', href: '/login' },
  { icon: Stethoscope, title: 'Doctors', desc: 'Manage schedule, review patients, issue prescriptions.', href: '/login' },
  { icon: Droplets, title: 'Nurses', desc: 'Coordinate lab queue and sample collection.', href: '/login' },
  { icon: ShieldPlus, title: 'Pharmacy', desc: 'Scan digital prescriptions & check interactions.', href: '/login' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [statCounts, setStatCounts] = useState([0, 0, 0]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      
      // Very basic count-up trigger when scrolled past 100px
      if (window.scrollY > 100 && statCounts[0] === 0) {
        let step = 0;
        const timer = setInterval(() => {
          step += 1;
          setStatCounts([
            Math.min(Math.floor((step / 20) * STATS[0].value), STATS[0].value),
            Math.min(Math.floor((step / 20) * STATS[1].value), STATS[1].value),
            Math.min(Math.floor((step / 20) * STATS[2].value), STATS[2].value),
          ]);
          if (step >= 20) clearInterval(timer);
        }, 50);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [statCounts]);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: 'var(--cl-canvas)', color: 'var(--cl-ink)' }}>
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: scrolled ? 'rgba(247,250,250,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--cl-border)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: 'var(--cl-teal)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Activity size={20} strokeWidth={2} color="#fff" aria-hidden="true" />
          </div>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: 'var(--cl-ink)', letterSpacing: '0.01em' }}>
            CuraLink
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/login" style={{
            color: 'var(--cl-ink)', fontWeight: 600, fontSize: '0.9375rem', textDecoration: 'none',
          }}>Sign in</Link>
          <Link href="/register" style={{
            padding: '0.625rem 1.25rem', borderRadius: 8, background: 'var(--cl-teal)', color: 'white',
            fontWeight: 600, fontSize: '0.9375rem', transition: 'background 0.2s', textDecoration: 'none',
          }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--cl-teal-dark)'}
             onMouseLeave={(e) => e.currentTarget.style.background = 'var(--cl-teal)'}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{
        padding: '10rem 2rem 5rem',
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '4rem',
        minHeight: '85vh',
      }}>
        {/* Left Content */}
        <div style={{ flex: 1 }} className="animate-fade-slide-up">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--cl-teal-light)', color: 'var(--cl-teal-dark)',
            padding: '0.4rem 1rem', borderRadius: 9999, fontSize: '0.875rem', fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            🇱🇰 &nbsp; Built for Sri Lanka
          </div>
          <h1 style={{
            fontSize: 'clamp(2.75rem, 5vw, 4.25rem)',
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 700,
            color: 'var(--cl-ink)',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}>
            Healthcare That<br />Thinks With You
          </h1>
          <p style={{
            fontSize: '1.125rem', color: 'var(--cl-muted)', lineHeight: 1.6,
            marginBottom: '2.5rem', maxWidth: 480,
          }}>
            Book a doctor, understand your lab report, and get a preliminary triage —
            all in your own language, from any browser.
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/register" style={{
              padding: '0.875rem 2rem', borderRadius: 8, background: 'var(--cl-teal)', color: 'white',
              fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s', textDecoration: 'none',
            }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cl-teal-dark)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
               onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--cl-teal)'; e.currentTarget.style.transform = 'none'; }}>
              Get Started
            </Link>
            <a href="#how-it-works" style={{
              padding: '0.875rem 2rem', borderRadius: 8, border: '1.5px solid var(--cl-border-strong)',
              color: 'var(--cl-ink)', fontWeight: 600, fontSize: '1rem', transition: 'all 0.2s', textDecoration: 'none',
            }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cl-surface-2)'; }}
               onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              Book a Demo
            </a>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'flex', gap: '2.5rem', marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid var(--cl-border)' }}>
            {STATS.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: "'IBM Plex Sans', sans-serif", color: 'var(--cl-ink)' }}>
                  {statCounts[i]}{s.suffix}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--cl-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Photo Blob */}
        <div style={{ flex: 1, position: 'relative', height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hero-parallax">
          {/* Soft teal blob background */}
          <div style={{
            position: 'absolute', width: '90%', height: '90%',
            background: 'var(--cl-teal-light)',
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            zIndex: 0,
            animation: 'blobDrift 15s ease-in-out infinite alternate',
          }} />
          {/* Actual Doctor Photo */}
          <div style={{
            position: 'relative', zIndex: 1, width: '85%', height: '85%',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(11, 110, 110, 0.15)',
          }}>
             <img src="/images/hero.png" alt="Sri Lankan Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* ── How It Works (Numbered Row) ──────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '6rem 2rem', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '2rem', fontWeight: 700, color: 'var(--cl-ink)', marginBottom: '3rem' }}>
            Let's Understand <span style={{ color: 'var(--cl-teal)' }}>How It Works</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            {[
              { num: '01', title: 'Register Profile', desc: 'Sign up quickly with your basic details.', color: 'var(--cl-blue)' },
              { num: '02', title: 'AI Symptom Check', desc: 'Let our AI assess your current condition.', color: 'var(--cl-teal)' },
              { num: '03', title: 'Book Consultation', desc: 'Instantly schedule with the right specialist.', color: 'var(--cl-status-monitor)' },
              { num: '04', title: 'Digital Follow-up', desc: 'Receive QR prescriptions and lab reports.', color: 'var(--cl-status-low)' },
            ].map((step, i) => (
              <div key={i} className="animate-fade-slide-up hover-lift" style={{
                background: 'var(--cl-canvas)', padding: '2rem', borderRadius: 12,
                border: '1px solid var(--cl-border)', position: 'relative',
                animationDelay: `${i * 0.1}s`,
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--cl-border-strong)', fontFamily: "'IBM Plex Sans', sans-serif", marginBottom: '1rem', lineHeight: 1 }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--cl-ink)', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--cl-muted)', marginBottom: '2rem' }}>{step.desc}</p>
                <div style={{ position: 'absolute', bottom: 0, left: '2rem', right: '2rem', height: 4, background: step.color, borderRadius: '4px 4px 0 0' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Features (Alternating Layout) ──────────────────────────────────── */}
      <section style={{ padding: '2rem 0 6rem', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {AI_FEATURES.map((feat, i) => {
            const isEven = i % 2 === 0;
            return (
              <div key={feat.id} style={{
                display: 'flex', alignItems: 'center', gap: '4rem', padding: '5rem 2rem',
                flexDirection: isEven ? 'row' : 'row-reverse',
              }}>
                {/* Text Side */}
                <div style={{ flex: 1 }} className="animate-fade-slide-up">
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: 'var(--cl-surface-2)', color: 'var(--cl-ink-2)',
                    padding: '0.35rem 0.875rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700,
                    letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1.25rem'
                  }}>
                    Intelligent Features
                  </div>
                  <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '2.25rem', fontWeight: 700, color: 'var(--cl-ink)', marginBottom: '1rem', lineHeight: 1.2 }}>
                    {feat.title}
                  </h2>
                  <p style={{ fontSize: '1.125rem', color: 'var(--cl-muted)', marginBottom: '2rem' }}>
                    {feat.desc}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {feat.bullets.map((b, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9375rem', color: 'var(--cl-ink-2)' }}>
                        <CheckCircle2 size={18} color="var(--cl-teal)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mockup Side */}
                <div style={{ flex: 1, display: 'flex', justifyContent: isEven ? 'flex-end' : 'flex-start', position: 'relative' }}>
                  <div className="hover-lift-blob" style={{
                    position: 'relative', width: '90%', paddingBottom: '75%',
                    background: feat.blobColor, borderRadius: '30% 70% 50% 50% / 50% 40% 60% 50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <img src={feat.mockup} alt={`${feat.title} mockup`} style={{
                      position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%',
                      objectFit: 'contain', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.1))'
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Roles (Icon Grid) ─────────────────────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem', background: 'var(--cl-canvas)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '2rem', fontWeight: 700, color: 'var(--cl-ink)', marginBottom: '3rem' }}>
            One Platform, Every Role
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {ROLES.map((r, i) => (
              <Link key={i} href={r.href} className="hover-lift" style={{
                background: '#fff', padding: '2.5rem 1.5rem', borderRadius: 16,
                border: '1px solid var(--cl-border)', textDecoration: 'none', color: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12, background: 'var(--cl-teal-light)', color: 'var(--cl-teal)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem'
                }}>
                  <r.icon size={28} strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--cl-ink)', marginBottom: '0.5rem' }}>{r.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--cl-muted)' }}>{r.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────────── */}
      <section style={{ padding: '4rem 2rem 6rem', background: 'var(--cl-canvas)' }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto', background: 'var(--cl-teal-light)',
          borderRadius: 24, padding: '4rem 2rem', textAlign: 'center',
          border: '1px solid var(--cl-teal)', boxShadow: '0 20px 40px rgba(11,110,110,0.05)'
        }}>
          <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '2.25rem', fontWeight: 700, color: 'var(--cl-teal-dark)', marginBottom: '1rem' }}>
            Ready for better healthcare?
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--cl-teal-dark)', opacity: 0.8, marginBottom: '2.5rem' }}>
            Join thousands of patients and providers on CuraLink today.
          </p>
          <Link href="/register" style={{
            display: 'inline-flex', padding: '1rem 2.5rem', borderRadius: 8, background: 'var(--cl-teal)',
            color: '#fff', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none',
            transition: 'background 0.2s',
          }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--cl-teal-dark)'}
             onMouseLeave={(e) => e.currentTarget.style.background = 'var(--cl-teal)'}>
            Create your account
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderTop: '1px solid var(--cl-border)', color: 'var(--cl-muted)', fontSize: '0.875rem' }}>
        © 2026 CuraLink. AI-Powered Healthcare Platform — Sri Lanka.
      </footer>

      <style>{`
        @keyframes blobDrift {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(2%, 2%) scale(1.02); }
          66% { transform: translate(-2%, 1%) scale(0.98); }
          100% { transform: translate(0, -2%) scale(1.01); }
        }
        .animate-fade-slide-up {
          animation: fadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hover-lift {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.06);
        }
        .hover-lift-blob {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hover-lift-blob:hover {
          transform: translateY(-8px) scale(1.02);
        }
      `}</style>
    </div>
  );
}
