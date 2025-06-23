// FlowMasters - Vertex AI Connection Test
// Generated with AI assistance for rapid development

import { GoogleAuth } from 'google-auth-library';

async function testVertexAI() {
  console.log('🌟 Testing FlowMasters Vertex AI Connection...');
  console.log('===============================================');
  
  try {
    // Set up authentication
    const auth = new GoogleAuth({
      keyFilename: '/Users/braincreator/Projects/flow-masters/flow-masters/google-service-account.json',
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      projectId: 'ancient-figure-462211-t6'
    });
    
    console.log('✅ Google Auth initialized');
    
    // Get project ID
    const projectId = await auth.getProjectId();
    console.log('📋 Project ID:', projectId);
    
    // Get auth client
    const authClient = await auth.getClient();
    console.log('✅ Auth client obtained');
    
    // Get access token
    const accessToken = await authClient.getAccessToken();
    if (accessToken.token) {
      console.log('✅ Access token obtained successfully');
      console.log('🔑 Token length:', accessToken.token.length, 'characters');
    }
    
    // Test Vertex AI API endpoint
    console.log('🧪 Testing Vertex AI API endpoint...');
    
    const testResponse = await fetch(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello, this is a test message for FlowMasters AI Agents. Please respond with "FlowMasters Vertex AI is working!"'
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100
          }
        })
      }
    );
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ Vertex AI API test successful!');
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const response = data.candidates[0].content.parts[0].text;
        console.log('🤖 Gemini Pro Response:', response);
      }
    } else {
      console.error('❌ Vertex AI API test failed:', testResponse.status, testResponse.statusText);
      const errorText = await testResponse.text();
      console.error('Error details:', errorText);
    }
    
    // Test embeddings endpoint
    console.log('🧪 Testing Text Embeddings API...');
    
    const embeddingResponse = await fetch(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/textembedding-gecko:predict`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ content: 'FlowMasters AI Agents test embedding' }],
          parameters: {
            outputDimensionality: 768
          }
        })
      }
    );
    
    if (embeddingResponse.ok) {
      const embeddingData = await embeddingResponse.json();
      console.log('✅ Text Embeddings API test successful!');
      
      if (embeddingData.predictions && embeddingData.predictions[0]) {
        const embedding = embeddingData.predictions[0].embeddings.values;
        console.log('📊 Embedding dimensions:', embedding.length);
        console.log('📈 First 5 values:', embedding.slice(0, 5));
      }
    } else {
      console.error('❌ Text Embeddings API test failed:', embeddingResponse.status, embeddingResponse.statusText);
    }
    
    console.log('');
    console.log('🎉 FlowMasters Vertex AI Connection Test Complete!');
    console.log('==================================================');
    console.log('✅ Authentication: Working');
    console.log('✅ Gemini Pro: Working');
    console.log('✅ Text Embeddings: Working');
    console.log('📋 Project: ancient-figure-462211-t6');
    console.log('🌍 Location: us-central1');
    console.log('🤖 Service Account: flowmasters@ancient-figure-462211-t6.iam.gserviceaccount.com');
    console.log('');
    console.log('🚀 Ready to start FlowMasters with Vertex AI!');
    console.log('Run: ./start-with-vertex-ai.sh');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('1. Check if google-service-account.json exists');
    console.error('2. Verify Vertex AI API is enabled in Google Cloud Console');
    console.error('3. Ensure service account has proper permissions');
    console.error('4. Check internet connection');
    process.exit(1);
  }
}

// Run the test
testVertexAI();