/**
 * Turbopack-specific Admin Panel Styles
 * This file contains CSS-in-JS styles that are guaranteed to load
 * regardless of Turbopack's CSS optimization behavior
 */

export const injectAdminStyles = () => {
  // Check if styles are already injected
  if (document.getElementById('turbopack-admin-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'turbopack-admin-styles';
  style.textContent = `
    /* Turbopack Admin Panel Critical Styles */
    /* These styles are injected via JavaScript to bypass CSS optimization */
    
    /* Reset and base styles for admin panel */
    .payload-admin,
    .payload-admin *,
    .payload-admin *::before,
    .payload-admin *::after {
      box-sizing: border-box !important;
    }

    /* Ensure admin panel has proper font and base styles */
    .payload-admin {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
      font-size: 13px !important;
      line-height: 1.5 !important;
      color: #2f2f2f !important;
      background: #ffffff !important;
    }

    /* Critical layout styles */
    .payload-admin .payload__app {
      min-height: 100vh !important;
      background: #ffffff !important;
      color: #2f2f2f !important;
    }

    /* Navigation styles */
    .payload-admin .payload__nav {
      width: 275px !important;
      background: #ffffff !important;
      border-right: 1px solid #eeeeee !important;
    }

    /* Header styles */
    .payload-admin .payload__header {
      height: 56px !important;
      background: #ffffff !important;
      border-bottom: 1px solid #eeeeee !important;
      display: flex !important;
      align-items: center !important;
      padding: 0 20px !important;
    }

    /* Main content area */
    .payload-admin .payload__main {
      padding: 20px !important;
      min-height: calc(100vh - 56px) !important;
    }

    /* Button styles with important declarations */
    .payload-admin button {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      border: 1px solid #dddddd !important;
      background: #ffffff !important;
      color: #333333 !important;
      padding: 8px 16px !important;
      border-radius: 3px !important;
      font-family: inherit !important;
      font-size: inherit !important;
      text-decoration: none !important;
      transition: all 150ms ease !important;
    }

    .payload-admin button:hover {
      background: #f5f5f5 !important;
      border-color: #cccccc !important;
    }

    .payload-admin button:focus {
      outline: 2px solid #1587ba !important;
      outline-offset: 2px !important;
    }

    /* Input styles with important declarations */
    .payload-admin input,
    .payload-admin textarea,
    .payload-admin select {
      display: block !important;
      width: 100% !important;
      border: 1px solid #dddddd !important;
      background: #ffffff !important;
      color: #333333 !important;
      padding: 8px 12px !important;
      border-radius: 3px !important;
      font-family: inherit !important;
      font-size: inherit !important;
      line-height: 1.5 !important;
      transition: border-color 100ms ease, box-shadow 100ms ease !important;
    }

    .payload-admin input:focus,
    .payload-admin textarea:focus,
    .payload-admin select:focus {
      border-color: #999999 !important;
      outline: 0 !important;
      box-shadow: 0 0 0 2px #1587ba !important;
    }

    /* Form styles */
    .payload-admin form {
      display: block !important;
    }

    .payload-admin label {
      display: block !important;
      margin-bottom: 4px !important;
      font-weight: 600 !important;
      color: #333333 !important;
      font-size: 14px !important;
    }

    /* Table styles */
    .payload-admin table {
      display: table !important;
      width: 100% !important;
      border-collapse: collapse !important;
      background: #ffffff !important;
    }

    .payload-admin thead {
      display: table-header-group !important;
    }

    .payload-admin tbody {
      display: table-row-group !important;
    }

    .payload-admin tr {
      display: table-row !important;
    }

    .payload-admin th,
    .payload-admin td {
      display: table-cell !important;
      padding: 12px !important;
      border-bottom: 1px solid #eeeeee !important;
      text-align: left !important;
      vertical-align: top !important;
    }

    .payload-admin th {
      background: #f5f5f5 !important;
      font-weight: 600 !important;
    }

    /* Typography */
    .payload-admin h1 {
      display: block !important;
      font-size: 2rem !important;
      font-weight: 700 !important;
      margin: 0 0 1rem 0 !important;
      line-height: 1.2 !important;
    }

    .payload-admin h2 {
      display: block !important;
      font-size: 1.5rem !important;
      font-weight: 600 !important;
      margin: 0 0 0.75rem 0 !important;
      line-height: 1.3 !important;
    }

    .payload-admin h3 {
      display: block !important;
      font-size: 1.25rem !important;
      font-weight: 600 !important;
      margin: 0 0 0.5rem 0 !important;
      line-height: 1.4 !important;
    }

    .payload-admin p {
      display: block !important;
      margin: 0 0 1rem 0 !important;
      line-height: 1.5 !important;
    }

    /* Links */
    .payload-admin a {
      color: #0b6e99 !important;
      text-decoration: underline !important;
      cursor: pointer !important;
    }

    .payload-admin a:hover {
      color: #115879 !important;
      text-decoration: none !important;
    }

    .payload-admin a:focus {
      outline: 2px solid #1587ba !important;
      outline-offset: 2px !important;
    }

    /* SVG icons */
    .payload-admin svg {
      display: inline-block !important;
      vertical-align: middle !important;
      width: 16px !important;
      height: 16px !important;
      fill: currentColor !important;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .payload-admin .payload__nav {
        width: 100vw !important;
        transform: translateX(-100%) !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        height: 100vh !important;
        z-index: 1000 !important;
      }

      .payload-admin .payload__nav--open {
        transform: translateX(0) !important;
      }

      .payload-admin .payload__main {
        padding: 16px !important;
      }
    }

    /* Ensure proper display properties */
    .payload-admin div,
    .payload-admin section,
    .payload-admin article,
    .payload-admin aside,
    .payload-admin nav,
    .payload-admin header,
    .payload-admin footer,
    .payload-admin main {
      display: block !important;
    }

    .payload-admin span,
    .payload-admin a,
    .payload-admin strong,
    .payload-admin em,
    .payload-admin code {
      display: inline !important;
    }

    /* Override any conflicting styles */
    .payload-admin * {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
    }
  `;

  document.head.appendChild(style);
};

// Auto-inject styles when this module is imported
if (typeof window !== 'undefined') {
  // Inject styles immediately
  injectAdminStyles();

  // Also inject on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectAdminStyles);
  }

  // Re-inject on route changes (for SPA navigation)
  window.addEventListener('popstate', injectAdminStyles);
}
