#!/usr/bin/env node

/**
 * Direct test of Posts collection using Payload API
 * This bypasses the HTTP API and tests the collection directly
 */

const path = require('path')
const dotenv = require('dotenv')

// Load environment variables - try multiple env files
const envFiles = [
  path.resolve(__dirname, '../../.env.production'),
  path.resolve(__dirname, '../../.env.local'),
  path.resolve(__dirname, '../../.env')
]

for (const envFile of envFiles) {
  try {
    dotenv.config({ path: envFile })
    console.log(`📄 Loaded environment from: ${envFile}`)
    break
  } catch (error) {
    // Continue to next file
  }
}

async function testPostsAPIDirect() {
  console.log('🧪 Testing Posts Collection Directly...\n')

  try {
    // Import Payload dynamically
    const { getPayload } = await import('payload')
    
    console.log('📡 Initializing Payload...')
    
    // Initialize Payload with local config
    const payload = await getPayload({
      secret: process.env.PAYLOAD_SECRET || 'your-secret-here',
      config: await import(path.resolve(__dirname, '../payload.config.ts')),
    })
    
    console.log('✅ Payload initialized successfully\n')

    // Test 1: Count all posts
    console.log('📊 Counting posts...')
    try {
      const totalCount = await payload.count({
        collection: 'posts',
      })
      console.log(`✅ Total posts: ${totalCount.totalDocs}`)
    } catch (error) {
      console.log('❌ Count failed:', error.message)
      return
    }

    // Test 2: Find all posts (limited)
    console.log('\n🔍 Finding posts...')
    try {
      const allPosts = await payload.find({
        collection: 'posts',
        limit: 5,
        depth: 1,
      })
      
      console.log(`✅ Found ${allPosts.docs.length} posts`)
      console.log(`   Total pages: ${allPosts.totalPages}`)
      console.log(`   Has next page: ${allPosts.hasNextPage}`)
      
      if (allPosts.docs.length > 0) {
        console.log('\n📝 Post details:')
        allPosts.docs.forEach((post, index) => {
          console.log(`   ${index + 1}. "${post.title}"`)
          console.log(`      - ID: ${post.id}`)
          console.log(`      - Status: ${post._status}`)
          console.log(`      - Slug: ${post.slug}`)
          console.log(`      - Published: ${post.publishedAt || 'Not set'}`)
          console.log(`      - Authors: ${post.authors ? post.authors.length : 0}`)
          console.log(`      - Categories: ${post.categories ? post.categories.length : 0}`)
        })
      }
    } catch (error) {
      console.log('❌ Find all failed:', error.message)
    }

    // Test 3: Find published posts only
    console.log('\n📰 Finding published posts...')
    try {
      const publishedPosts = await payload.find({
        collection: 'posts',
        where: {
          _status: { equals: 'published' }
        },
        limit: 5,
        depth: 1,
      })
      
      console.log(`✅ Found ${publishedPosts.docs.length} published posts`)
      
      if (publishedPosts.docs.length > 0) {
        console.log('   Published posts:')
        publishedPosts.docs.forEach((post, index) => {
          console.log(`   ${index + 1}. "${post.title}" (${post.slug})`)
        })
      }
    } catch (error) {
      console.log('❌ Find published failed:', error.message)
    }

    // Test 4: Test specific post by slug
    console.log('\n🎯 Testing specific post lookup...')
    const testSlugs = ['digital-horizons', 'global-gaze', 'dollar-and-sense-the-financial-forecast']
    
    for (const slug of testSlugs) {
      try {
        const postBySlug = await payload.find({
          collection: 'posts',
          where: {
            slug: { equals: slug }
          },
          limit: 1,
          depth: 2,
        })
        
        if (postBySlug.docs.length > 0) {
          const post = postBySlug.docs[0]
          console.log(`✅ Found post "${post.title}" by slug "${slug}"`)
          console.log(`   - Status: ${post._status}`)
          console.log(`   - Content: ${post.content ? 'Present' : 'Missing'}`)
        } else {
          console.log(`❌ No post found with slug "${slug}"`)
        }
      } catch (error) {
        console.log(`❌ Slug lookup failed for "${slug}":`, error.message)
      }
    }

    // Test 5: Check related collections
    console.log('\n🔗 Checking related collections...')
    
    try {
      const categoriesCount = await payload.count({ collection: 'categories' })
      console.log(`✅ Categories: ${categoriesCount.totalDocs}`)
    } catch (error) {
      console.log('❌ Categories check failed:', error.message)
    }

    try {
      const tagsCount = await payload.count({ collection: 'tags' })
      console.log(`✅ Tags: ${tagsCount.totalDocs}`)
    } catch (error) {
      console.log('❌ Tags check failed:', error.message)
    }

    try {
      const usersCount = await payload.count({ collection: 'users' })
      console.log(`✅ Users: ${usersCount.totalDocs}`)
    } catch (error) {
      console.log('❌ Users check failed:', error.message)
    }

    try {
      const mediaCount = await payload.count({ collection: 'media' })
      console.log(`✅ Media: ${mediaCount.totalDocs}`)
    } catch (error) {
      console.log('❌ Media check failed:', error.message)
    }

    console.log('\n🎯 Summary:')
    console.log('- If posts exist but API returns empty, check API endpoint implementation')
    console.log('- If posts are missing, run the seed script: npm run seed')
    console.log('- If posts exist but have broken references, run the fix script')
    console.log('- Check Payload admin panel for visual confirmation')

  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('Stack:', error.stack)
  }
}

// Run the test
testPostsAPIDirect()
  .then(() => {
    console.log('\n✅ Direct API test completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Test script failed:', error)
    process.exit(1)
  })
