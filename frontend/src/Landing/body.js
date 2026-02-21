import './body.css';
import { ReactComponent as AnalyticsSVG } from "./20124657_6239051.svg";
import { ReactComponent as DashboardSVG } from "./11669148_20943767.svg";
import { useEffect, useRef } from 'react';

function Body() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Create floating particles
    const container = containerRef.current;
    if (!container) return;

    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'tech-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 5 + 's';
      container.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 10000);
    };

    const interval = setInterval(createParticle, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="body-container" ref={containerRef}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="row align-items-center">
          <div className="col-md-6 hero-content">
            <div className="hero-badge">
              <div className="hero-badge-glow"></div>
              <span className="hero-badge-text">
                <span>INTRODUCING</span> COMPLAINT360
              </span>
            </div>
            
            <h1 className="hero-title">
              Transform Customer Complaints Into Strategic Intelligence
            </h1>
            
            <p className="hero-subtitle">
              ML-powered platform that automatically classifies, prioritizes, and analyzes 
              customer complaints to prevent churn and optimize operations.
            </p>
            
            <div className="cta-group">
              <button className="cta-primary">
                View Live Demo →
              </button>
              <button className="cta-secondary">
                Watch Video
              </button>
            </div>
            
            <div className="hero-stats">
              <div className="hero-stat-item">
                <div className="hero-stat-number">
                  98% <span className="hero-stat-trend">↑</span>
                </div>
                <div className="hero-stat-label">Classification Accuracy</div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-number">
                  2.5x <span className="hero-stat-trend">↑</span>
                </div>
                <div className="hero-stat-label">Faster Resolution</div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-number">
                  24/7 <span className="hero-stat-trend">⚡</span>
                </div>
                <div className="hero-stat-label">Real-time Monitoring</div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 hero-image">
            <div className="hero-image-wrapper">
              <AnalyticsSVG className="landing-svg primary-svg" />
              
              {/* Floating Cards */}
              <div className="floating-card card-1">
                <div className="metric-value">85%</div>
                <div className="metric-label">Sentiment Score</div>
              </div>
              
              <div className="floating-card card-2">
                <div className="metric-value">High Risk</div>
                <div className="metric-label">Escalation Alert</div>
              </div>
              
              <div className="floating-card card-3">
                <div className="metric-value">12</div>
                <div className="metric-label">Pending Review</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-subtitle">POWERED BY AI & ML</span>
          <h2>Complaint360</h2>
          <p>Advanced analytics and machine learning to transform customer feedback into action</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <AnalyticsSVG />
            </div>
            <h3>NLP Classification</h3>
            <p>Automatically categorize complaints by severity, category, and urgency using advanced NLP models.</p>
            <a href="#" className="feature-link">Learn more →</a>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <DashboardSVG />
            </div>
            <h3>Behavioral Risk Scoring</h3>
            <p>Identify suspicious patterns and potential escalation risks with ML-based behavior analysis.</p>
            <a href="#" className="feature-link">Learn more →</a>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Sentiment Analysis</h3>
            <p>Real-time emotion detection and sentiment scoring from complaint text and feedback.</p>
            <a href="#" className="feature-link">Learn more →</a>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="dashboard-preview">
          <div className="dashboard-grid">
            <div className="dashboard-chart">
              <div className="chart-header">
                <span className="chart-title">Complaint Categories</span>
                <span className="chart-value">↑ 23%</span>
              </div>
              <div className="chart-bars">
                <div className="chart-bar" style={{"--height": "120px"}}></div>
                <div className="chart-bar" style={{"--height": "180px"}}></div>
                <div className="chart-bar" style={{"--height": "90px"}}></div>
                <div className="chart-bar" style={{"--height": "150px"}}></div>
                <div className="chart-bar" style={{"--height": "70px"}}></div>
              </div>
            </div>
            
            <div className="dashboard-chart">
              <div className="chart-header">
                <span className="chart-title">Risk Distribution</span>
                <span className="chart-value">High: 12%</span>
              </div>
              <div className="chart-bars">
                <div className="chart-bar" style={{"--height": "60px"}}></div>
                <div className="chart-bar" style={{"--height": "140px"}}></div>
                <div className="chart-bar" style={{"--height": "200px"}}></div>
                <div className="chart-bar" style={{"--height": "100px"}}></div>
                <div className="chart-bar" style={{"--height": "80px"}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="metrics-container">
          <div className="metric-card">
            <div className="metric-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" strokeWidth="2"/>
              </svg>
            </div>
            <div className="metric-value">15.2K</div>
            <div className="metric-label">Complaints Processed</div>
            <div className="metric-trend">↑ 23% this month</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" strokeWidth="2"/>
              </svg>
            </div>
            <div className="metric-value">4.2hrs</div>
            <div className="metric-label">Avg Resolution Time</div>
            <div className="metric-trend">↓ 1.5hrs from last month</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14.8284 14.8284L20 20M4 20H9.19288M4 4V9.19288M4 14.8284L9.19288 20M20 4H14.8071M20 9.19288L14.8071 4M4 4L20 20" strokeWidth="2"/>
              </svg>
            </div>
            <div className="metric-value">94%</div>
            <div className="metric-label">Customer Satisfaction</div>
            <div className="metric-trend">↑ 5% improvement</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 19V6M15 19V12M3 19H21M3 19L5 21M3 19L5 17M21 19L19 21M21 19L19 17" strokeWidth="2"/>
              </svg>
            </div>
            <div className="metric-value">8</div>
            <div className="metric-label">Risk Levels</div>
            <div className="metric-trend">Real-time scoring</div>
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="process-section">
        <div className="section-header">
          <span className="section-subtitle">HOW IT WORKS</span>
          <h2>End-to-End Complaint Intelligence</h2>
          <p>From submission to strategic insights in 4 simple steps</p>
        </div>
        
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-number">1</div>
            <div className="timeline-content">
              <h3>Complaint Submission</h3>
              <p>Multi-channel intake with structured and unstructured data collection</p>
              <div className="tech-stack">
                <span className="tech-item">Web Forms</span>
                <span className="tech-item">Email Integration</span>
                <span className="tech-item">API Gateway</span>
              </div>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-number">2</div>
            <div className="timeline-content">
              <h3>ML Classification</h3>
              <p>NLP models categorize by severity, sentiment, and escalation risk</p>
              <div className="tech-stack">
                <span className="tech-item">BERT</span>
                <span className="tech-item">Sentiment Analysis</span>
                <span className="tech-item">Risk Scoring</span>
              </div>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-number">3</div>
            <div className="timeline-content">
              <h3>Smart Routing & Resolution</h3>
              <p>Automated assignment to appropriate teams with priority scoring</p>
              <div className="tech-stack">
                <span className="tech-item">Workflow Engine</span>
                <span className="tech-item">Potential Escalation Alerts</span>
              </div>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-number">4</div>
            <div className="timeline-content">
              <h3>Analytics & Insights</h3>
              <p>Power BI dashboards with real-time metrics and trend analysis</p>
              <div className="tech-stack">
                <span className="tech-item">Power BI</span>
                <span className="tech-item">Real-time Dashboards</span>
                <span className="tech-item">Predictive Models</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to transform your complaint management?</h2>
          <p>Join leading enterprises using AI to prevent churn and improve customer satisfaction</p>
          <div className="cta-buttons">
            <button className="cta-primary">Schedule a Demo</button>
            <button className="cta-secondary">Contact Sales</button>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Body;