import payload from 'payload'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { ServiceRegistry } from '@/services/service.registry'
import { EmailService } from '@/services/email.service'

/**
 * Service for generating project reports
 */
export class ProjectReportService {
  /**
   * Generate a weekly report for a project
   * @param projectId The ID of the project
   */
  async generateWeeklyReport(projectId: string): Promise<any> {
    try {
      // Get the project
      const project = await payload.findByID({
        collection: 'service-projects',
        id: projectId,
        depth: 1,
      })

      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`)
      }

      // Calculate the date range for the report (last week)
      const now = new Date()
      const endDate = now
      const startDate = subDays(now, 7)

      // Format dates for display
      const formattedStartDate = format(startDate, 'yyyy-MM-dd')
      const formattedEndDate = format(endDate, 'yyyy-MM-dd')

      // Generate report title
      const title = `Weekly Report: ${project.name} (${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')})`

      // Get project milestones
      const milestonesResponse = await payload.find({
        collection: 'project-milestones',
        where: {
          project: {
            equals: projectId,
          },
        },
        depth: 1,
      })

      const milestones = milestonesResponse.docs

      // Calculate milestone statistics
      const milestonesTotal = milestones.length
      const milestonesCompleted = milestones.filter(m => m.status === 'completed').length
      const milestonesInProgress = milestones.filter(m => m.status === 'in_progress').length
      const milestonesDelayed = milestones.filter(m => m.status === 'delayed').length

      // Calculate completion percentage
      const completionPercentage = milestonesTotal > 0
        ? Math.round((milestonesCompleted / milestonesTotal) * 100)
        : 0

      // Get milestones completed in this period
      const milestonesCompletedInPeriod = milestones.filter(milestone => {
        if (milestone.status === 'completed' && milestone.completedAt) {
          const completedDate = new Date(milestone.completedAt)
          return completedDate >= startDate && completedDate <= endDate
        }
        return false
      }).length

      // Get upcoming milestones
      const upcomingMilestones = milestones
        .filter(milestone =>
          milestone.status !== 'completed' &&
          milestone.dueDate &&
          new Date(milestone.dueDate) > now
        )
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5) // Get the next 5 upcoming milestones

      // Get recent milestones (completed in this period)
      const recentMilestones = milestones
        .filter(milestone => {
          if (milestone.status === 'completed' && milestone.completedAt) {
            const completedDate = new Date(milestone.completedAt)
            return completedDate >= startDate && completedDate <= endDate
          }
          return false
        })
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

      // Get project messages in this period
      const messagesResponse = await payload.find({
        collection: 'project-messages',
        where: {
          project: {
            equals: projectId,
          },
          createdAt: {
            greater_than_equal: formattedStartDate,
            less_than_equal: formattedEndDate,
          },
        },
      })

      const messages = messagesResponse.docs

      // Count files shared in this period
      const filesCount = messages.reduce((count, message) => {
        return count + (message.attachments ? message.attachments.length : 0)
      }, 0)

      // Generate summary
      const summary = `Weekly progress report for ${project.name}. Overall project completion: ${completionPercentage}%. ${milestonesCompletedInPeriod} milestones completed this week. ${messagesResponse.totalDocs} messages exchanged and ${filesCount} files shared.`

      // Create the report
      const report = await payload.create({
        collection: 'project-reports',
        data: {
          title,
          project: projectId,
          reportType: 'weekly',
          reportPeriod: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
          summary,
          content: `<p>Weekly report content for ${project.name}</p>`,
          progressMetrics: {
            completionPercentage,
            milestonesTotal,
            milestonesCompleted,
            milestonesInProgress,
            milestonesDelayed,
          },
          activitySummary: {
            messagesCount: messagesResponse.totalDocs,
            filesCount,
            milestonesCompletedInPeriod,
          },
          recentMilestones: recentMilestones.map(m => m.id),
          upcomingMilestones: upcomingMilestones.map(m => m.id),
          sentToClient: false,
          clientViewed: false,
          generatedAutomatically: true,
        },
      })

      // Send email notification to the customer
      await this.sendReportNotificationEmail(report, project)

      return report
    } catch (error) {
      console.error('Error generating weekly report:', error)
      throw error
    }
  }

  /**
   * Generate a monthly report for a project
   * @param projectId The ID of the project
   */
  async generateMonthlyReport(projectId: string): Promise<any> {
    try {
      // Get the project
      const project = await payload.findByID({
        collection: 'service-projects',
        id: projectId,
        depth: 1,
      })

      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`)
      }

      // Calculate the date range for the report (last month)
      const now = new Date()
      const endDate = now
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

      // Format dates for display
      const formattedStartDate = format(startDate, 'yyyy-MM-dd')
      const formattedEndDate = format(endDate, 'yyyy-MM-dd')

      // Generate report title
      const title = `Monthly Report: ${project.name} (${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')})`

      // Get project milestones
      const milestonesResponse = await payload.find({
        collection: 'project-milestones',
        where: {
          project: {
            equals: projectId,
          },
        },
        depth: 1,
      })

      const milestones = milestonesResponse.docs

      // Calculate milestone statistics
      const milestonesTotal = milestones.length
      const milestonesCompleted = milestones.filter(m => m.status === 'completed').length
      const milestonesInProgress = milestones.filter(m => m.status === 'in_progress').length
      const milestonesDelayed = milestones.filter(m => m.status === 'delayed').length

      // Calculate completion percentage
      const completionPercentage = milestonesTotal > 0
        ? Math.round((milestonesCompleted / milestonesTotal) * 100)
        : 0

      // Get milestones completed in this period
      const milestonesCompletedInPeriod = milestones.filter(milestone => {
        if (milestone.status === 'completed' && milestone.completedAt) {
          const completedDate = new Date(milestone.completedAt)
          return completedDate >= startDate && completedDate <= endDate
        }
        return false
      }).length

      // Get upcoming milestones
      const upcomingMilestones = milestones
        .filter(milestone =>
          milestone.status !== 'completed' &&
          milestone.dueDate &&
          new Date(milestone.dueDate) > now
        )
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5) // Get the next 5 upcoming milestones

      // Get recent milestones (completed in this period)
      const recentMilestones = milestones
        .filter(milestone => {
          if (milestone.status === 'completed' && milestone.completedAt) {
            const completedDate = new Date(milestone.completedAt)
            return completedDate >= startDate && completedDate <= endDate
          }
          return false
        })
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

      // Get project messages in this period
      const messagesResponse = await payload.find({
        collection: 'project-messages',
        where: {
          project: {
            equals: projectId,
          },
          createdAt: {
            greater_than_equal: formattedStartDate,
            less_than_equal: formattedEndDate,
          },
        },
      })

      const messages = messagesResponse.docs

      // Count files shared in this period
      const filesCount = messages.reduce((count, message) => {
        return count + (message.attachments ? message.attachments.length : 0)
      }, 0)

      // Generate summary
      const summary = `Monthly progress report for ${project.name}. Overall project completion: ${completionPercentage}%. ${milestonesCompletedInPeriod} milestones completed this month. ${messagesResponse.totalDocs} messages exchanged and ${filesCount} files shared.`

      // Create the report
      const report = await payload.create({
        collection: 'project-reports',
        data: {
          title,
          project: projectId,
          reportType: 'monthly',
          reportPeriod: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
          summary,
          content: `<p>Monthly report content for ${project.name}</p>`,
          progressMetrics: {
            completionPercentage,
            milestonesTotal,
            milestonesCompleted,
            milestonesInProgress,
            milestonesDelayed,
          },
          activitySummary: {
            messagesCount: messagesResponse.totalDocs,
            filesCount,
            milestonesCompletedInPeriod,
          },
          recentMilestones: recentMilestones.map(m => m.id),
          upcomingMilestones: upcomingMilestones.map(m => m.id),
          sentToClient: false,
          clientViewed: false,
          generatedAutomatically: true,
        },
      })

      // Send email notification to the customer
      await this.sendReportNotificationEmail(report, project)

      return report
    } catch (error) {
      console.error('Error generating monthly report:', error)
      throw error
    }
  }

  /**
   * Send email notification about a new report
   * @param report The generated report
   * @param project The project the report is for
   */
  async sendReportNotificationEmail(report: any, project: any): Promise<boolean> {
    try {
      // Get the customer user
      const customer = await payload.findByID({
        collection: 'users',
        id: project.customer,
        depth: 0,
      })

      if (!customer || !customer.email) {
        console.error(`Customer not found or missing email for project ${project.id}`)
        return false
      }

      // Get the email service
      const emailService = ServiceRegistry.getInstance(payload).getEmailService()

      // Prepare the report data for the email
      const reportData = {
        userName: customer.name || customer.email,
        email: customer.email,
        locale: customer.locale || 'ru',
        projectName: project.name,
        projectId: project.id,
        reportId: report.id,
        reportTitle: report.title,
        reportType: report.reportType,
        reportPeriod: {
          startDate: report.reportPeriod.startDate,
          endDate: report.reportPeriod.endDate,
        },
        reportSummary: report.summary,
        completionPercentage: report.progressMetrics.completionPercentage,
        dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru'}/dashboard/projects/${project.id}?tab=reports&reportId=${report.id}`,
      }

      // Send the email notification
      const result = await emailService.sendProjectReportNotificationEmail(reportData)

      if (result) {
        // Update the report to mark it as sent
        await payload.update({
          collection: 'project-reports',
          id: report.id,
          data: {
            sentToClient: true,
          },
        })
      }

      return result
    } catch (error) {
      console.error('Error sending report notification email:', error)
      return false
    }
  }

  /**
   * Generate reports for all active projects
   * @param reportType The type of report to generate ('weekly' or 'monthly')
   */
  async generateReportsForAllProjects(reportType: 'weekly' | 'monthly'): Promise<any[]> {
    try {
      // Get all active projects
      const projectsResponse = await payload.find({
        collection: 'service-projects',
        where: {
          status: {
            not_equals: 'completed',
            not_equals: 'cancelled',
          },
        },
      })

      const projects = projectsResponse.docs
      const reports = []

      // Generate reports for each project
      for (const project of projects) {
        try {
          let report

          if (reportType === 'weekly') {
            report = await this.generateWeeklyReport(project.id)
          } else if (reportType === 'monthly') {
            report = await this.generateMonthlyReport(project.id)
          }

          if (report) {
            reports.push(report)
          }
        } catch (error) {
          console.error(`Error generating ${reportType} report for project ${project.id}:`, error)
          // Continue with next project
        }
      }

      return reports
    } catch (error) {
      console.error(`Error generating ${reportType} reports for all projects:`, error)
      throw error
    }
  }
}

// Export a singleton instance
export const projectReportService = new ProjectReportService()
