import { NextRequest, NextResponse } from 'next/server'
import { projectReportService } from '@/services/reports/projectReportService'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * API route for generating reports via cron job
 * This can be triggered by a scheduled job service like Vercel Cron
 */
export async function POST(req: NextRequest) {
  try {
    // Check for authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    const { reportType = 'weekly' } = body

    if (reportType !== 'weekly' && reportType !== 'monthly') {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid report type. Must be "weekly" or "monthly".' 
      }, { status: 400 })
    }

    // Generate reports
    const reports = await projectReportService.generateReportsForAllProjects(reportType)

    return NextResponse.json({
      success: true,
      message: `Generated ${reports.length} ${reportType} reports`,
      reports: reports.map(report => ({
        id: report.id,
        title: report.title,
        project: report.project,
      })),
    })
  } catch (error) {
    logError('Error generating reports:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate reports',
        message: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

/**
 * GET method for testing the endpoint
 */
export async function GET(req: NextRequest) {
  // For security, we'll only allow this in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Method not allowed in production' }, { status: 405 })
  }
  
  try {
    // Generate weekly reports
    const reports = await projectReportService.generateReportsForAllProjects('weekly')
    
    return NextResponse.json({
      success: true,
      message: `Generated ${reports.length} weekly reports`,
      reports: reports.map(report => ({
        id: report.id,
        title: report.title,
        project: report.project,
      })),
    })
  } catch (error) {
    logError('Error generating reports:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate reports',
        message: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}
