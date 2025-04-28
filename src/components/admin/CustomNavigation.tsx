'use client'

import React from 'react'
import { Link } from '@payloadcms/ui'

const CustomNavigation: React.FC = () => {
  return (
    <div className="custom-nav-links">
      <h6>Generators</h6>
      <ul>
        <li>
          <Link href="/admin/landing-generator">Генератор лендингов</Link>
        </li>
        <li>
          <Link href="/admin/course-creator">Создание курса</Link>
        </li>
      </ul>

      <h6>Marketing</h6>
      <ul>
        <li>
          <Link href="/admin/email-campaigns">Email кампании</Link>
        </li>
        <li>
          <Link href="/admin/setup-rewards">Настройка наград</Link>
        </li>
      </ul>

      <h6>Analytics</h6>
      <ul>
        <li>
          <Link href="/admin/analytics/courses">Аналитика курсов</Link>
        </li>
      </ul>

      <h6>Development</h6>
      <ul>
        <li>
          <Link href="/admin/endpoints">API Endpoints Browser</Link>
        </li>
        <li>
          <Link href="/admin/monitoring">System Monitoring</Link>
        </li>
      </ul>

      <style jsx>{`
        .custom-nav-links {
          padding: 0 var(--base);
          margin-top: var(--base);
        }

        .custom-nav-links h6 {
          font-weight: 600;
          margin-top: var(--base);
          margin-bottom: calc(var(--base) / 2);
          color: var(--theme-elevation-800);
        }

        .custom-nav-links ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .custom-nav-links li {
          margin-bottom: calc(var(--base) / 2);
        }

        .custom-nav-links a {
          color: var(--theme-elevation-500);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .custom-nav-links a:hover {
          color: var(--theme-elevation-800);
        }
      `}</style>
    </div>
  )
}

export default CustomNavigation
