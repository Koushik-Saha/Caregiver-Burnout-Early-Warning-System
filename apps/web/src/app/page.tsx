export default function HomePage() {
  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <a href="#" className="brand-logo">
            <div className="brand-icon">🛡️</div>
            <span className="brand-text">CareLoad</span>
            <span className="brand-badge">Early-Warning</span>
          </a>
          <nav className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#voice-calls" className="nav-link">Voice Engine</a>
            <a href="#circles" className="nav-link">Care Circles</a>
            <a href="http://localhost:8081" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              Open Mobile Web (Port 8081)
            </a>
          </nav>
        </div>
      </header>

      <section className="hero-section">
        <div className="pill-tag">
          <span className="pulse-dot"></span>
          <span>Preventing Caregiver Burnout Before It Happens</span>
        </div>

        <h1 className="hero-title">
          Supporting Caregivers &amp; <br />
          <span className="gradient-text">Protecting Senior Loved Ones</span>
        </h1>

        <p className="hero-sub">
          CareLoad helps family caregivers quantify mental care load, automate daily senior voice check-in calls with speech analysis, and coordinate instant care circle support.
        </p>

        <div className="hero-cta-group">
          <a href="exp://192.168.0.253:8081" className="btn-primary">
            <span>📱 Open in Expo Go (Mobile)</span>
          </a>
          <a href="http://localhost:8081" target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <span>🌐 Launch Web App</span>
          </a>
        </div>
      </section>

      <section className="features-grid" id="features">
        <div className="feature-card">
          <div className="feature-icon-wrapper">📊</div>
          <h3 className="feature-title">CareLoad Scoring</h3>
          <p className="feature-desc">
            Algorithmic daily score (0-100) combining mood, stress levels, sleep hours, weekly care hours, and personal time tracking.
          </p>
          <span className="feature-pill">Boundary-Tested Rules</span>
        </div>

        <div className="feature-card" id="voice-calls">
          <div className="feature-icon-wrapper">📞</div>
          <h3 className="feature-title">Automated Voice Calls</h3>
          <p className="feature-desc">
            Twilio-powered 6-step automated check-in calls for seniors with DTMF/Speech recognition, pain detection, and emergency keywords.
          </p>
          <span className="feature-pill">Powered by Twilio Voice</span>
        </div>

        <div className="feature-card" id="circles">
          <div className="feature-icon-wrapper">🤝</div>
          <h3 className="feature-title">Care Circles &amp; Tasks</h3>
          <p className="feature-desc">
            Collaborative family circles with 6-character single-use invite codes, task assignments, and Expo Push notifications.
          </p>
          <span className="feature-pill">Family Sync</span>
        </div>
      </section>

      <section className="highlights-section">
        <div className="highlights-card">
          <div>
            <div className="stat-number">30-Day</div>
            <div className="stat-label">Visual Trends</div>
            <div className="stat-desc">SVG analytics &amp; PHQ-2 prompts</div>
          </div>
          <div>
            <div className="stat-number">6-Step</div>
            <div className="stat-label">Voice Script</div>
            <div className="stat-desc">Automated senior check-ins</div>
          </div>
          <div>
            <div className="stat-number">100%</div>
            <div className="stat-label">Privacy First</div>
            <div className="stat-desc">Zero audio call recording</div>
          </div>
          <div>
            <div className="stat-number">Instant</div>
            <div className="stat-label">Push Alerts</div>
            <div className="stat-desc">"I'm on it" circle coordination</div>
          </div>
        </div>
      </section>
    </>
  );
}
