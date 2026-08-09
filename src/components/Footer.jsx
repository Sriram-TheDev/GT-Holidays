import React from 'react';
import { Rss } from 'lucide-react';

// ── Social icon SVGs — aria-hidden because their parent <a> carries the label ─
const FacebookIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const InstagramIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const LinkedinIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--color-base, #0B0C10)',
      borderTop: '1px solid var(--color-border, rgba(255,255,255,0.08))',
      padding: '60px 4px 40px',
      color: 'rgba(255,255,255,0.6)',
      fontSize: '0.9rem',
      fontFamily: 'var(--font-body, "Inter", sans-serif)'
    }}>
      <div className="mx-auto px-4 lg:px-8 w-full" style={{ maxWidth: 1380 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '40px',
        }}>
          {/* Column 1: OUR OFFICE */}
          <div>
            <h3 style={{
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginBottom: '20px',
              fontFamily: 'var(--font-display, "Outfit", sans-serif)'
            }}>
              OUR OFFICE
            </h3>
            <div style={{
              width: '100%',
              height: '180px',
              borderRadius: '20px', // Curved edges as requested
              overflow: 'hidden',
              marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
              <iframe 
                src="https://maps.google.com/maps?q=10.963328,78.059124&z=15&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                title="Office Location"
              />
            </div>
            <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.7)' }}>t: +123 456 789</p>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)' }}>1234 Main Street Anywhere</p>
          </div>

          {/* Column 2: SAY HELLO */}
          <div>
            <h3 style={{
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginBottom: '20px',
              fontFamily: 'var(--font-display, "Outfit", sans-serif)'
            }}>
              SAY HELLO
            </h3>
            <p style={{ 
              marginBottom: '20px', 
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '300px'
            }}>
              If you are interested in working with us or just want to say hello simply drop us a line!
            </p>
            <a href="mailto:sayhi@baamboostudio.com" style={{ 
              color: '#fff', 
              textDecoration: 'none', 
              fontWeight: 500,
              display: 'inline-block',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = 'var(--color-accent-green, #00FFA3)'}
            onMouseOut={(e) => e.target.style.color = '#fff'}
            >
              sayhi@baamboostudio.com
            </a>
          </div>

          {/* Column 3: SUBSCRIBE US */}
          <div>
            <h3 style={{
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginBottom: '20px',
              fontFamily: 'var(--font-display, "Outfit", sans-serif)'
            }}>
              SUBSCRIBE US
            </h3>
            
            {/* Social links — each has aria-label for screen readers since they contain only icons */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '30px' }} role="list">
              {[
                { Icon: FacebookIcon, label: 'Follow us on Facebook',  href: '#' },
                { Icon: TwitterIcon,  label: 'Follow us on Twitter/X',  href: '#' },
                { Icon: Rss,          label: 'Subscribe to RSS feed',   href: '#' },
                { Icon: InstagramIcon,label: 'Follow us on Instagram',  href: '#' },
                { Icon: LinkedinIcon, label: 'Connect on LinkedIn',     href: '#' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  role="listitem"
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    transition: 'color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>

            <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '320px' }}>
              {/* Input must have an associated label for WCAG 1.3.1 (Info and Relationships) */}
              <label htmlFor="footer-newsletter-email" className="sr-only">Email address for newsletter</label>
              <input
                id="footer-newsletter-email"
                type="email"
                placeholder="YOUR EMAIL"
                required
                aria-required="true"
                autoComplete="email"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '99px',
                  padding: '12px 20px',
                  color: '#fff',
                  fontSize: '0.8rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
              />
              <button type="submit" style={{
                background: 'rgba(255,255,255,0.6)',
                color: '#fff',
                border: 'none',
                borderRadius: '99px',
                padding: '12px 32px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
                alignSelf: 'flex-start',
                letterSpacing: '0.05em'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.8)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.6)'}
              >
                SUBMIT
              </button>
            </form>

          </div>
        </div>
      </div>
    </footer>
  );
}
