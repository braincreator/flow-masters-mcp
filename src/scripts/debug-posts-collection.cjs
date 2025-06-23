#!/usr/bin/env node

/**
 * Debug script to check Posts collection status
 * This script helps diagnose issues with the Posts collection
 */

const { getPayload } = require('payload')
const path = require('path')

// Import the config
const configPath = path.resolve(__dirname, '../payload.config.ts')

async function debugPostsCollection() {
  console.log('🔍 Debugging Posts Collection...\n')

  try {
    // Initialize Payload
    console.log('📡 Initializing Payload...')
    const payload = await getPayload({
      config: require(configPath).default,
      initOptions: {
        local: true,
        secret: process.env.PAYLOAD_SECRET || 'your-secret-here',
        mongoURL: process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/flow-masters',
      },
    })
    console.log('✅ Payload initialized successfully\n')

    // 1. Check if Posts collection exists
    console.log('📋 Checking Posts collection configuration...')
    const collections = payload.config.collections
    const postsCollection = collections.find(col => col.slug === 'posts')
    
    if (postsCollection) {
      console.log('✅ Posts collection found in config')
      console.log(`   - Slug: ${postsCollection.slug}`)
      console.log(`   - Admin group: ${postsCollection.admin?.group || 'None'}`)
      console.log(`   - Access control: ${JSON.stringify(postsCollection.access)}`)
    } else {
      console.log('❌ Posts collection NOT found in config')
      return
    }

    // 2. Check database connection and collection
    console.log('\n🗄️  Checking database...')
    try {
      const dbStats = await payload.db.connection.db.stats()
      console.log('✅ Database connection successful')
      console.log(`   - Database: ${payload.db.connection.db.databaseName}`)
      console.log(`   - Collections: ${dbStats.collections}`)
    } catch (dbError) {
      console.log('❌ Database connection failed:', dbError.message)
      return
    }

    // 3. Count posts in database
    console.log('\n📊 Checking posts in database...')
    try {
      const postsCount = await payload.count({
        collection: 'posts',
      })
      console.log(`✅ Found ${postsCount.totalDocs} posts in database`)

      if (postsCount.totalDocs === 0) {
        console.log('⚠️  No posts found - database might need seeding')
      }
    } catch (countError) {
      console.log('❌ Error counting posts:', countError.message)
    }

    // 4. Try to fetch posts with different filters
    console.log('\n🔍 Testing posts queries...')
    
    // Test 1: All posts
    try {
      const allPosts = await payload.find({
        collection: 'posts',
        limit: 5,
      })
      console.log(`✅ All posts query: ${allPosts.docs.length} results`)
      if (allPosts.docs.length > 0) {
        console.log(`   - First post: "${allPosts.docs[0].title}" (${allPosts.docs[0]._status})`)
      }
    } catch (error) {
      console.log('❌ All posts query failed:', error.message)
    }

    // Test 2: Published posts only
    try {
      const publishedPosts = await payload.find({
        collection: 'posts',
        where: {
          _status: { equals: 'published' }
        },
        limit: 5,
      })
      console.log(`✅ Published posts query: ${publishedPosts.docs.length} results`)
    } catch (error) {
      console.log('❌ Published posts query failed:', error.message)
    }

    // Test 3: Draft posts
    try {
      const draftPosts = await payload.find({
        collection: 'posts',
        where: {
          _status: { equals: 'draft' }
        },
        limit: 5,
      })
      console.log(`✅ Draft posts query: ${draftPosts.docs.length} results`)
    } catch (error) {
      console.log('❌ Draft posts query failed:', error.message)
    }

    // 5. Check related collections
    console.log('\n🔗 Checking related collections...')
    
    try {
      const categoriesCount = await payload.count({ collection: 'categories' })
      console.log(`✅ Categories: ${categoriesCount.totalDocs} found`)
    } catch (error) {
      console.log('❌ Categories check failed:', error.message)
    }

    try {
      const tagsCount = await payload.count({ collection: 'tags' })
      console.log(`✅ Tags: ${tagsCount.totalDocs} found`)
    } catch (error) {
      console.log('❌ Tags check failed:', error.message)
    }

    try {
      const usersCount = await payload.count({ collection: 'users' })
      console.log(`✅ Users: ${usersCount.totalDocs} found`)
    } catch (error) {
      console.log('❌ Users check failed:', error.message)
    }

    // 6. Test API endpoint
    console.log('\n🌐 Testing API endpoints...')
    try {
      const response = await fetch('http://localhost:3000/api/v1/blog/posts?limit=5')
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Blog API endpoint: ${data.docs?.length || 0} posts returned`)
      } else {
        console.log(`❌ Blog API endpoint failed: ${response.status} ${response.statusText}`)
      }
    } catch (apiError) {
      console.log('❌ Blog API endpoint test failed:', apiError.message)
      console.log('   (This is expected if the server is not running)')
    }

    console.log('\n🎯 Diagnosis Summary:')
    console.log('1. Check if posts exist in database')
    console.log('2. If no posts, run: npm run seed')
    console.log('3. Check Payload admin panel at /admin/collections/posts')
    console.log('4. Verify API endpoints are working')
    console.log('5. Check browser console for any JavaScript errors')

  } catch (error) {
    console.error('❌ Debug script failed:', error)
  }
}

// Run the debug script
debugPostsCollection()
  .then(() => {
    console.log('\n✅ Debug completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Debug script error:', error)
    process.exit(1)
  })
