import { format } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import type { ProjectReportNotificationEmailData } from '../../../types/emailTemplates'

/**
 * Generates HTML for a project report notification email
 * @param {ProjectReportNotificationEmailData} data Data for the template
 * @returns {string} HTML markup for the email
 */
export const generateProjectReportNotificationEmail = (data: ProjectReportNotificationEmailData): string => {
  const {
    userName,
    projectName,
    projectId,
    reportId,
    reportTitle,
    reportType,
    reportPeriod,
    reportSummary,
    completionPercentage,
    locale = 'ru',
    siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
    dashboardUrl,
  } = data

  // Format dates based on locale
  const dateLocale = locale === 'ru' ? ru : enUS
  const startDate = reportPeriod?.startDate 
    ? format(new Date(reportPeriod.startDate), 'PPP', { locale: dateLocale })
    : ''
  const endDate = reportPeriod?.endDate
    ? format(new Date(reportPeriod.endDate), 'PPP', { locale: dateLocale })
    : ''

  // Generate report URL
  const reportUrl = dashboardUrl || `${siteUrl}/dashboard/projects/${projectId}?tab=reports&reportId=${reportId}`

  // Localized strings
  const strings = {
    ru: {
      subject: `Новый отчет по проекту: ${projectName}`,
      greeting: `Здравствуйте, ${userName}!`,
      newReport: `Доступен новый ${getReportTypeRu(reportType)} отчет по вашему проекту "${projectName}".`,
      reportTitle: 'Название отчета:',
      reportPeriod: 'Период отчета:',
      periodValue: `${startDate} - ${endDate}`,
      projectProgress: 'Прогресс проекта:',
      summary: 'Краткое содержание:',
      viewReportButton: 'Просмотреть полный отчет',
      viewReportText: 'Вы можете просмотреть полный отчет в панели управления проектом.',
      footer: `© ${new Date().getFullYear()} Flow Masters. Все права защищены.`,
    },
    en: {
      subject: `New Project Report: ${projectName}`,
      greeting: `Hello, ${userName}!`,
      newReport: `A new ${getReportTypeEn(reportType)} report is available for your project "${projectName}".`,
      reportTitle: 'Report Title:',
      reportPeriod: 'Report Period:',
      periodValue: `${startDate} - ${endDate}`,
      projectProgress: 'Project Progress:',
      summary: 'Summary:',
      viewReportButton: 'View Full Report',
      viewReportText: 'You can view the full report in your project dashboard.',
      footer: `© ${new Date().getFullYear()} Flow Masters. All rights reserved.`,
    },
  }

  const text = strings[locale === 'ru' ? 'ru' : 'en']

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${text.subject}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .logo {
      max-width: 150px;
      margin-bottom: 20px;
    }
    .content {
      padding: 20px 0;
    }
    .report-info {
      background-color: #f5f8ff;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
    }
    .report-info p {
      margin: 8px 0;
    }
    .label {
      font-weight: bold;
      color: #555;
    }
    .progress-bar {
      background-color: #e9ecef;
      border-radius: 10px;
      height: 20px;
      margin: 10px 0;
      overflow: hidden;
    }
    .progress {
      background-color: #4a6cf7;
      height: 100%;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    }
    .summary {
      background-color: #f9f9f9;
      border-left: 4px solid #4a6cf7;
      padding: 15px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background-color: #4a6cf7;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #3a5bd9;
    }
    .text-center {
      text-align: center;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #777;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${siteUrl}/images/logo.png" alt="Flow Masters" class="logo">
      <h1>${text.subject}</h1>
    </div>
    
    <div class="content">
      <p>${text.greeting}</p>
      <p>${text.newReport}</p>
      
      <div class="report-info">
        <p><span class="label">${text.reportTitle}</span> ${reportTitle}</p>
        <p><span class="label">${text.reportPeriod}</span> ${text.periodValue}</p>
        <p><span class="label">${text.projectProgress}</span></p>
        <div class="progress-bar">
          <div class="progress" style="width: ${completionPercentage}%">${completionPercentage}%</div>
        </div>
      </div>
      
      <div class="summary">
        <p><span class="label">${text.summary}</span></p>
        <p>${reportSummary}</p>
      </div>
      
      <div class="text-center">
        <a href="${reportUrl}" class="button">${text.viewReportButton}</a>
        <p>${text.viewReportText}</p>
      </div>
    </div>
    
    <div class="footer">
      <p>${text.footer}</p>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Get localized report type for Russian
 */
function getReportTypeRu(type: string): string {
  switch (type) {
    case 'weekly':
      return 'еженедельный'
    case 'monthly':
      return 'ежемесячный'
    case 'milestone':
      return 'этапный'
    case 'custom':
      return 'пользовательский'
    default:
      return type
  }
}

/**
 * Get localized report type for English
 */
function getReportTypeEn(type: string): string {
  switch (type) {
    case 'weekly':
      return 'weekly'
    case 'monthly':
      return 'monthly'
    case 'milestone':
      return 'milestone'
    case 'custom':
      return 'custom'
    default:
      return type
  }
}
