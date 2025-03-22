import React, { useState } from 'react'
import { usePayloadAPI } from 'payload/components/hooks'
import { Button } from 'payload/components/elements'
import { Modal } from 'payload/components/elements'
import { CodeEditor } from 'payload/components/fields/Code'

export const TestIntegration: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [testData, setTestData] = useState('{\n  "event": "test",\n  "data": {}\n}')
  const [result, setResult] = useState(null)

  const [, sendTest] = usePayloadAPI('/api/test-integration', {
    method: 'post',
  })

  const handleTest = async () => {
    try {
      const response = await sendTest({
        data: JSON.parse(testData),
      })
      setResult({
        success: true,
        data: response,
      })
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
      })
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Test Integration
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="test-integration-modal">
          <h2>Test Integration</h2>
          
          <div className="test-data">
            <label>Test Data</label>
            <CodeEditor
              language="json"
              value={testData}
              onChange={setTestData}
            />
          </div>

          <Button onClick={handleTest}>
            Run Test
          </Button>

          {result && (
            <div className={`test-result ${result.success ? 'success' : 'error'}`}>
              <h3>{result.success ? 'Success!' : 'Error'}</h3>
              <pre>
                {JSON.stringify(result.data || result.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}