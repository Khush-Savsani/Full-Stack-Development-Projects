// Dashboard component that displays user activity and profile information
// Provides a personalized view of recent RailExpress activities and user data
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Dashboard = () => {
  // Component state management
  const [username, setUsername] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initialize dashboard data on component mount
  useEffect(() => {
    // Get username from session storage
    const uname = sessionStorage.getItem("username") || "";
    setUsername(uname);

    // Try to fetch recent activity from backend; gracefully fallback
    // Handles cases where backend might be unavailable or user not authenticated
    const fetchActivity = async () => {
      try {
        const email = sessionStorage.getItem("email") || "";
        const url = email
          ? `http://127.0.0.1:8000/users/activity/?email=${encodeURIComponent(
              email
            )}`
          : `http://127.0.0.1:8000/users/activity/`;

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          mode: "cors",
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json?.activities) ? json.activities : [];
          setActivities(items);
        } else {
          // On 403 or other errors, avoid throwing and just show empty state
          setActivities([]);
        }
      } catch (_) {
        // Gracefully handle network errors by showing empty state
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  return (
    <div className="dashboard-scope">
      {/* Page-scoped styles for dashboard-specific design */}
      <style>{`
        .dashboard-scope .hero {
          background: linear-gradient(135deg, #eef4ff 0%, #ffffff 100%);
          padding: 2.2rem 1rem; text-align: center; color: #0b2368;
        }
        .dashboard-scope .headline { font-weight: 900; font-size: clamp(1.8rem, 3.2vw, 2.4rem); letter-spacing: -0.4px; }
        .dashboard-scope .sub { color: #3b4a88; font-weight: 600; }

        .dashboard-scope .wrap { max-width: 1100px; margin: 0 auto; padding: 1rem; }
        .dashboard-scope .grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 992px) { .dashboard-scope .grid { grid-template-columns: 1.2fr .8fr; } }

        /* Glassmorphism card design with gradient borders */
        .dashboard-scope .cardx {
          position: relative; border: 0; border-radius: 18px;
          background: rgba(255,255,255,0.92); backdrop-filter: saturate(140%) blur(6px);
          box-shadow: 0 12px 36px rgba(29,78,216,0.10), 0 6px 18px rgba(17,24,39,0.06);
          overflow: hidden;
        }
        .dashboard-scope .cardx::before { content: ""; position: absolute; inset: 0; pointer-events: none; border-radius: 20px; padding: 1px; background: linear-gradient(120deg, rgba(29,78,216,.35), rgba(99,102,241,.30), rgba(56,189,248,.28)); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
        .dashboard-scope .cardx .hd { display:flex; align-items:center; justify-content:space-between; padding: 16px 18px; border-bottom: 1px solid rgba(37,99,235,.14); }
        .dashboard-scope .cardx .bd { padding: 16px 18px; }

        /* Activity list styling with hover effects */
        .dashboard-scope .activity-list { list-style: none; padding: 0; margin: 0; }
        .dashboard-scope .activity-item { display:flex; gap: 12px; align-items: flex-start; padding: 12px 10px; border-radius: 12px; }
        .dashboard-scope .activity-item + .activity-item { margin-top: 6px; }
        .dashboard-scope .activity-item:hover { background: rgba(13,110,253,0.06); }
        .dashboard-scope .act-ic { width: 36px; height: 36px; border-radius: 10px; display:grid; place-items:center; background: linear-gradient(135deg,#1d4ed8,#60a5fa); color:#fff; box-shadow: 0 6px 16px rgba(37,99,235,.25); }
        .dashboard-scope .act-title { font-weight: 700; color: #0b2368; }
        .dashboard-scope .act-time { color: #445; font-size: .92rem; opacity: .8; }

        /* Profile section styling */
        .dashboard-scope .profile { display:flex; align-items:center; gap:12px; }
        .dashboard-scope .avatar { width: 48px; height: 48px; border-radius: 50%; background: #1742a0; color:#fff; display:grid; place-items:center; font-weight:800; }
        .dashboard-scope .uname { font-weight: 800; color:#0b2368; }
      `}</style>

      {/* Navigation bar */}
      <Navbar />

      {/* Welcome hero section */}
      <section className="hero">
        <h1 className="headline">Welcome back, {username || "User"}!</h1>
        <p className="sub">
          Here is a summary of your recent RailExpress activity.
        </p>
      </section>

      {/* Main dashboard content */}
      <main className="wrap">
        <div className="grid">
          {/* Recent activity card */}
          <div className="cardx">
            <div className="hd">
              <strong>Recent Activity</strong>
            </div>
            <div className="bd">
              {loading ? (
                <div>Loading...</div>
              ) : error ? (
                <div className="text-danger">{error}</div>
              ) : activities.length === 0 ? (
                <div>No recent activity found.</div>
              ) : (
                <ul className="activity-list">
                  {activities.map((a, idx) => (
                    <li key={idx} className="activity-item">
                      <span className="act-ic">
                        <i className="fa-solid fa-train" />
                      </span>
                      <div>
                        <div className="act-title">
                          {a.title || a.type || "Activity"}
                        </div>
                        <div className="act-time">
                          {a.time || a.timestamp || ""}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Your Profile card */}
          <div className="cardx">
            <div className="hd">
              <strong>Your Profile</strong>
            </div>
            <div className="bd">
              <div className="profile">
                <div className="avatar">
                  {(username || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="uname">{username || "User"}</div>
                  <div style={{ opacity: 0.75 }}>
                    {sessionStorage.getItem("email") || ""}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
