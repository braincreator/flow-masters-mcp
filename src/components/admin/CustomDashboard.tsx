'use client'

import React from 'react'
import { Card } from '@payloadcms/ui'

const CustomDashboard: React.FC = () => {
  return (
    <div className="custom-dashboard">
      <h2>Flow Masters Dashboard</h2>

      <div className="dashboard-grid">
        <Card className="dashboard-card">
          <h3>Recent Activity</h3>
          <p>View your recent activity and changes</p>
          <ul>
            <li>New user registration: 5 today</li>
            <li>New orders: 12 today</li>
            <li>Course completions: 8 today</li>
          </ul>
        </Card>

        <Card className="dashboard-card">
          <h3>Quick Actions</h3>
          <p>Common tasks and shortcuts</p>
          <div className="action-buttons">
            <button>Create New Course</button>
            <button>Send Email Campaign</button>
            <button>View Analytics</button>
          </div>
        </Card>

        <Card className="dashboard-card">
          <h3>System Status</h3>
          <p>All systems operational</p>
          <div className="status-indicators">
            <div className="status-item">
              <span className="status-dot green"></span>
              <span>API: Online</span>
            </div>
            <div className="status-item">
              <span className="status-dot green"></span>
              <span>Database: Connected</span>
            </div>
            <div className="status-item">
              <span className="status-dot green"></span>
              <span>Email Service: Active</span>
            </div>
          </div>
        </Card>
      </div>

      <style jsx>{`
        .custom-dashboard {
          padding: var(--base);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--base);
          margin-top: var(--base);
        }

        .dashboard-card {
          padding: var(--base);
          height: 100%;
        }

        .dashboard-card h3 {
          margin-top: 0;
          margin-bottom: calc(var(--base) / 2);
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: calc(var(--base) / 2);
          margin-top: var(--base);
        }

        .action-buttons button {
          padding: calc(var(--base) / 2);
          background-color: var(--theme-elevation-150);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .action-buttons button:hover {
          background-color: var(--theme-elevation-250);
        }

        .status-indicators {
          margin-top: var(--base);
        }

        .status-item {
          display: flex;
          align-items: center;
          margin-bottom: calc(var(--base) / 3);
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: calc(var(--base) / 2);
        }

        .green {
          background-color: var(--theme-success-500);
        }
      `}</style>
    </div>
  )
}

export default CustomDashboard
