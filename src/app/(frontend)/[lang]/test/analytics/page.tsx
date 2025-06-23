import { AnalyticsTestDashboard } from '@/components/AnalyticsTestDashboard'
import { SecurityHeadersTest } from '@/components/SecurityHeadersTest'
import { VKPixelTest } from '@/components/VKPixelTest'
import { YandexMetrikaDebug } from '@/components/YandexMetrika/YandexMetrikaDebug'

export default function AnalyticsTestPage() {
  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Analytics & Pixel Test Center</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Test and verify that Yandex Metrica and VK Pixel bypass mechanisms are working correctly. 
          This page helps diagnose connectivity issues and ensures analytics tracking is functional.
        </p>
      </div>

      {/* Main Analytics Test Dashboard */}
      <AnalyticsTestDashboard />

      {/* Security Headers Test */}
      <SecurityHeadersTest />

      {/* Yandex Metrica Debug */}
      <YandexMetrikaDebug />

      {/* VK Pixel Test */}
      <VKPixelTest />

      {/* Additional Information */}
      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Troubleshooting Guide</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">🔧 Common Issues</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Ad blockers preventing script loading</li>
              <li>• Network restrictions blocking analytics domains</li>
              <li>• Proxy configuration not working correctly</li>
              <li>• DNS resolution issues</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">✅ Expected Behavior</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Proxy endpoints should return 200 status</li>
              <li>• Scripts should load within 2-3 seconds</li>
              <li>• Analytics objects should be available in browser</li>
              <li>• Events should be tracked successfully</li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">🛠️ Technical Details</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Yandex Metrica:</strong> Uses mc.webvisor.org as alternative CDN with proxy fallback</p>
            <p><strong>VK Pixel:</strong> Proxied through /vk-pixel/ route to bypass ad blockers</p>
            <p><strong>Middleware:</strong> Handles rewrites and fallback mechanisms automatically</p>
          </div>
        </div>
      </div>
    </div>
  )
}
