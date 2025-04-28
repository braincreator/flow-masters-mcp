'use client'

import React, { useState, useEffect } from 'react'
// Remove Payload hooks that aren't needed
import { Gutter, Card } from '@payloadcms/ui'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

import './index.scss'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
)

// Define time periods for filtering
const TIME_PERIODS = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Year to Date', value: 'ytd' },
  { label: 'All Time', value: 'all' },
]

const AnalyticsView: React.FC = () => {
  // Simplified component without Payload hooks
  const api = '/api' // Default API path

  const [isLoading, setIsLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState('30d')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // In a real implementation, this would be a real API call
        // const response = await fetch(`${api}/analytics?period=${timePeriod}`)
        // const data = await response.json()

        // For demo purposes, we'll use mock data
        const mockData = generateMockData(timePeriod)
        setAnalyticsData(mockData)
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError('Failed to load analytics data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [api, timePeriod])

  // Generate mock data for demonstration
  const generateMockData = (period: string) => {
    const daysInPeriod = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
    const dates = Array.from({ length: daysInPeriod }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (daysInPeriod - i - 1))
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    // Generate random data for various metrics
    const visitors = dates.map(() => Math.floor(Math.random() * 500) + 100)
    const pageViews = dates.map(() => Math.floor(Math.random() * 1500) + 300)
    const signups = dates.map(() => Math.floor(Math.random() * 50))
    const courseEnrollments = dates.map(() => Math.floor(Math.random() * 30))
    const courseCompletions = dates.map(() => Math.floor(Math.random() * 15))

    // Calculate totals and averages
    const totalVisitors = visitors.reduce((sum, val) => sum + val, 0)
    const totalPageViews = pageViews.reduce((sum, val) => sum + val, 0)
    const totalSignups = signups.reduce((sum, val) => sum + val, 0)
    const totalEnrollments = courseEnrollments.reduce((sum, val) => sum + val, 0)
    const totalCompletions = courseCompletions.reduce((sum, val) => sum + val, 0)

    // Generate revenue data
    const revenue = dates.map(() => Math.floor(Math.random() * 5000) + 1000)
    const totalRevenue = revenue.reduce((sum, val) => sum + val, 0)

    // Generate course popularity data
    const coursePopularity = [
      { name: 'JavaScript Fundamentals', enrollments: Math.floor(Math.random() * 200) + 100 },
      { name: 'Advanced React Patterns', enrollments: Math.floor(Math.random() * 200) + 100 },
      { name: 'Node.js Masterclass', enrollments: Math.floor(Math.random() * 200) + 100 },
      { name: 'TypeScript Deep Dive', enrollments: Math.floor(Math.random() * 200) + 100 },
      { name: 'Full Stack Development', enrollments: Math.floor(Math.random() * 200) + 100 },
    ]

    // Generate user demographics data
    const userDemographics = {
      age: [
        { range: '18-24', percentage: Math.floor(Math.random() * 20) + 5 },
        { range: '25-34', percentage: Math.floor(Math.random() * 30) + 20 },
        { range: '35-44', percentage: Math.floor(Math.random() * 20) + 15 },
        { range: '45-54', percentage: Math.floor(Math.random() * 15) + 5 },
        { range: '55+', percentage: Math.floor(Math.random() * 10) + 5 },
      ],
      location: [
        { country: 'United States', percentage: Math.floor(Math.random() * 30) + 20 },
        { country: 'Russia', percentage: Math.floor(Math.random() * 20) + 15 },
        { country: 'Germany', percentage: Math.floor(Math.random() * 15) + 5 },
        { country: 'United Kingdom', percentage: Math.floor(Math.random() * 15) + 5 },
        { country: 'Other', percentage: Math.floor(Math.random() * 20) + 10 },
      ],
    }

    return {
      dates,
      visitors,
      pageViews,
      signups,
      courseEnrollments,
      courseCompletions,
      revenue,
      totals: {
        visitors: totalVisitors,
        pageViews: totalPageViews,
        signups: totalSignups,
        enrollments: totalEnrollments,
        completions: totalCompletions,
        revenue: totalRevenue,
      },
      coursePopularity,
      userDemographics,
    }
  }

  // In a real implementation, we would check if the user is authenticated
  // For now, we'll assume the user is authenticated since this is an admin view

  return (
    <div className="analytics-view">
      <Gutter>
        <div className="analytics-view__header">
          <h1>Analytics Dashboard</h1>

          <div className="analytics-view__period-selector">
            <label htmlFor="time-period">Time Period:</label>
            <select
              id="time-period"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="analytics-view__select"
            >
              {TIME_PERIODS.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="analytics-view__loading">
            <div className="analytics-view__loading-spinner"></div>
            <p>Loading analytics data...</p>
          </div>
        ) : error ? (
          <div className="analytics-view__error">
            <p>{error}</p>
          </div>
        ) : analyticsData ? (
          <>
            {/* Key Metrics */}
            <div className="analytics-view__metrics">
              <Card className="analytics-view__metric-card">
                <h3>Total Visitors</h3>
                <div className="analytics-view__metric-value">
                  {analyticsData.totals.visitors.toLocaleString()}
                </div>
              </Card>

              <Card className="analytics-view__metric-card">
                <h3>Page Views</h3>
                <div className="analytics-view__metric-value">
                  {analyticsData.totals.pageViews.toLocaleString()}
                </div>
              </Card>

              <Card className="analytics-view__metric-card">
                <h3>New Signups</h3>
                <div className="analytics-view__metric-value">
                  {analyticsData.totals.signups.toLocaleString()}
                </div>
              </Card>

              <Card className="analytics-view__metric-card">
                <h3>Course Enrollments</h3>
                <div className="analytics-view__metric-value">
                  {analyticsData.totals.enrollments.toLocaleString()}
                </div>
              </Card>

              <Card className="analytics-view__metric-card">
                <h3>Revenue</h3>
                <div className="analytics-view__metric-value">
                  ${analyticsData.totals.revenue.toLocaleString()}
                </div>
              </Card>
            </div>

            {/* Traffic Chart */}
            <div className="analytics-view__row">
              <Card className="analytics-view__card analytics-view__card--full">
                <h3>Website Traffic</h3>
                <div className="analytics-view__chart-container">
                  <Line
                    data={{
                      labels: analyticsData.dates,
                      datasets: [
                        {
                          label: 'Visitors',
                          data: analyticsData.visitors,
                          borderColor: 'rgb(53, 162, 235)',
                          backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        },
                        {
                          label: 'Page Views',
                          data: analyticsData.pageViews,
                          borderColor: 'rgb(75, 192, 192)',
                          backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </Card>
            </div>

            {/* Conversions and Revenue */}
            <div className="analytics-view__row">
              <Card className="analytics-view__card">
                <h3>Conversions</h3>
                <div className="analytics-view__chart-container">
                  <Bar
                    data={{
                      labels: analyticsData.dates,
                      datasets: [
                        {
                          label: 'Signups',
                          data: analyticsData.signups,
                          backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        },
                        {
                          label: 'Course Enrollments',
                          data: analyticsData.courseEnrollments,
                          backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        },
                        {
                          label: 'Course Completions',
                          data: analyticsData.courseCompletions,
                          backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </Card>

              <Card className="analytics-view__card">
                <h3>Revenue</h3>
                <div className="analytics-view__chart-container">
                  <Line
                    data={{
                      labels: analyticsData.dates,
                      datasets: [
                        {
                          label: 'Revenue ($)',
                          data: analyticsData.revenue,
                          borderColor: 'rgb(255, 159, 64)',
                          backgroundColor: 'rgba(255, 159, 64, 0.5)',
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => `$${value}`,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </Card>
            </div>

            {/* Course Popularity and User Demographics */}
            <div className="analytics-view__row">
              <Card className="analytics-view__card">
                <h3>Popular Courses</h3>
                <div className="analytics-view__chart-container">
                  <Bar
                    data={{
                      labels: analyticsData.coursePopularity.map((course) => course.name),
                      datasets: [
                        {
                          label: 'Enrollments',
                          data: analyticsData.coursePopularity.map((course) => course.enrollments),
                          backgroundColor: 'rgba(153, 102, 255, 0.5)',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: 'y',
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        x: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </Card>

              <Card className="analytics-view__card">
                <h3>User Demographics</h3>
                <div className="analytics-view__chart-container analytics-view__chart-container--split">
                  <div className="analytics-view__chart-half">
                    <h4>Age Distribution</h4>
                    <Doughnut
                      data={{
                        labels: analyticsData.userDemographics.age.map((item) => item.range),
                        datasets: [
                          {
                            label: 'Age Distribution',
                            data: analyticsData.userDemographics.age.map((item) => item.percentage),
                            backgroundColor: [
                              'rgba(255, 99, 132, 0.5)',
                              'rgba(54, 162, 235, 0.5)',
                              'rgba(255, 206, 86, 0.5)',
                              'rgba(75, 192, 192, 0.5)',
                              'rgba(153, 102, 255, 0.5)',
                            ],
                            borderColor: [
                              'rgba(255, 99, 132, 1)',
                              'rgba(54, 162, 235, 1)',
                              'rgba(255, 206, 86, 1)',
                              'rgba(75, 192, 192, 1)',
                              'rgba(153, 102, 255, 1)',
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                        },
                      }}
                    />
                  </div>

                  <div className="analytics-view__chart-half">
                    <h4>Geographic Distribution</h4>
                    <Doughnut
                      data={{
                        labels: analyticsData.userDemographics.location.map((item) => item.country),
                        datasets: [
                          {
                            label: 'Geographic Distribution',
                            data: analyticsData.userDemographics.location.map(
                              (item) => item.percentage,
                            ),
                            backgroundColor: [
                              'rgba(255, 99, 132, 0.5)',
                              'rgba(54, 162, 235, 0.5)',
                              'rgba(255, 206, 86, 0.5)',
                              'rgba(75, 192, 192, 0.5)',
                              'rgba(153, 102, 255, 0.5)',
                            ],
                            borderColor: [
                              'rgba(255, 99, 132, 1)',
                              'rgba(54, 162, 235, 1)',
                              'rgba(255, 206, 86, 1)',
                              'rgba(75, 192, 192, 1)',
                              'rgba(153, 102, 255, 1)',
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </>
        ) : null}
      </Gutter>
    </div>
  )
}

export default AnalyticsView
