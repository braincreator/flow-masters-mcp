#!/usr/bin/env node

/**
 * Script to fix issues after restoring database dump from another machine
 * This addresses common problems with Posts collection and related data
 */

const { MongoClient } = require('mongodb')
const dotenv = require('dotenv')
const path = require('path')

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

async function fixRestoredDatabase() {
  console.log('🔧 Fixing Restored Database Issues...\n')

  const args = process.argv.slice(2)
  const shouldFix = args.includes('--fix') || args.includes('-f')
  const shouldForce = args.includes('--force')

  if (!shouldFix) {
    console.log('🔍 Running in CHECK-ONLY mode')
    console.log('💡 To actually fix issues, run with --fix flag')
    console.log('💡 Example: pnpm debug:database --fix\n')
  } else {
    console.log('🛠️  Running in FIX mode - will attempt to repair issues')
    if (shouldForce) {
      console.log('⚠️  FORCE mode enabled - will make aggressive fixes\n')
    } else {
      console.log('💡 Use --force for more aggressive fixes\n')
    }
  }

  // Try different possible MongoDB URLs
  const mongoUrls = [
    process.env.DATABASE_URI,
    process.env.MONGODB_URI,
    process.env.MONGO_URL,
    'mongodb://127.0.0.1:27017/flow-masters',
    'mongodb://localhost:27017/flow-masters'
  ].filter(Boolean)

  console.log(`🔑 Environment variables:`)
  console.log(`   DATABASE_URI: ${process.env.DATABASE_URI ? 'Set' : 'Not set'}`)
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`)
  console.log(`\n📡 Will try these MongoDB URLs:`)
  mongoUrls.forEach((url, index) => {
    console.log(`   ${index + 1}. ${url}`)
  })

  let client
  let connectedUrl = null

  // Try each MongoDB URL until one works
  for (const mongoUrl of mongoUrls) {
    try {
      console.log(`\n🔄 Trying: ${mongoUrl}`)
      client = new MongoClient(mongoUrl, {
        serverSelectionTimeoutMS: 5000, // 5 second timeout
        connectTimeoutMS: 5000,
      })

      await client.connect()
      await client.db().admin().ping()

      connectedUrl = mongoUrl
      console.log(`✅ Connected successfully to: ${mongoUrl}\n`)
      break

    } catch (error) {
      console.log(`❌ Failed to connect to ${mongoUrl}: ${error.message}`)
      if (client) {
        try {
          await client.close()
        } catch (closeError) {
          // Ignore close errors
        }
        client = null
      }
    }
  }

  if (!client || !connectedUrl) {
    console.log('\n❌ Could not connect to any MongoDB instance')
    console.log('💡 Make sure MongoDB is running and accessible')
    console.log('💡 Check your DATABASE_URI environment variable')
    return
  }

  try {
    const db = client.db()

    // 1. Check Posts collection
    console.log('📋 Checking Posts collection...')
    const postsCount = await db.collection('posts').countDocuments()
    console.log(`   Found ${postsCount} posts in database`)

    if (postsCount === 0) {
      console.log('⚠️  No posts found - database might need seeding')
      console.log('   Run: npm run seed')
      return
    }

    // 2. Check for broken references
    console.log('\n🔗 Checking for broken references...')
    
    // Check posts with missing authors
    const postsWithMissingAuthors = await db.collection('posts').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'authors',
          foreignField: '_id',
          as: 'authorDocs'
        }
      },
      {
        $match: {
          $expr: {
            $ne: [{ $size: '$authors' }, { $size: '$authorDocs' }]
          }
        }
      },
      {
        $project: { title: 1, authors: 1, authorDocs: 1 }
      }
    ]).toArray()

    if (postsWithMissingAuthors.length > 0) {
      console.log(`⚠️  Found ${postsWithMissingAuthors.length} posts with missing authors`)
      for (const post of postsWithMissingAuthors) {
        console.log(`   - "${post.title}" (ID: ${post._id})`)
      }

      if (shouldFix) {
        console.log('\n🔧 Fixing missing authors...')

        // Create or find a default author
        let defaultAuthor = await db.collection('users').findOne({ email: 'admin@flow-masters.ru' })

        if (!defaultAuthor) {
          console.log('   Creating default author...')
          const authorResult = await db.collection('users').insertOne({
            name: 'Flow Masters Admin',
            email: 'admin@flow-masters.ru',
            roles: ['admin'],
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          defaultAuthor = { _id: authorResult.insertedId }
          console.log(`   ✅ Created default author with ID: ${defaultAuthor._id}`)
        } else {
          console.log(`   ✅ Using existing author: ${defaultAuthor.name} (${defaultAuthor._id})`)
        }

        // Update posts with missing authors
        for (const post of postsWithMissingAuthors) {
          await db.collection('posts').updateOne(
            { _id: post._id },
            {
              $set: {
                authors: [defaultAuthor._id],
                updatedAt: new Date()
              }
            }
          )
          console.log(`   ✅ Fixed author for: "${post.title}"`)
        }
      }
    } else {
      console.log('✅ All posts have valid author references')
    }

    // Check posts with missing categories
    const postsWithMissingCategories = await db.collection('posts').aggregate([
      {
        $match: { categories: { $exists: true, $ne: [] } }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categoryDocs'
        }
      },
      {
        $match: {
          $expr: {
            $ne: [{ $size: '$categories' }, { $size: '$categoryDocs' }]
          }
        }
      },
      {
        $project: { title: 1, categories: 1, categoryDocs: 1 }
      }
    ]).toArray()

    if (postsWithMissingCategories.length > 0) {
      console.log(`⚠️  Found ${postsWithMissingCategories.length} posts with missing categories`)

      if (shouldFix) {
        console.log('\n🔧 Fixing missing categories...')

        // Create default categories if they don't exist
        const defaultCategories = [
          { name: 'Technology', slug: 'technology' },
          { name: 'Business', slug: 'business' },
          { name: 'AI & Automation', slug: 'ai-automation' }
        ]

        const createdCategories = []
        for (const catData of defaultCategories) {
          let category = await db.collection('categories').findOne({ slug: catData.slug })

          if (!category) {
            const catResult = await db.collection('categories').insertOne({
              ...catData,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            category = { _id: catResult.insertedId, ...catData }
            console.log(`   ✅ Created category: ${catData.name}`)
          }
          createdCategories.push(category)
        }

        // Fix posts with missing categories
        for (const post of postsWithMissingCategories) {
          // Remove invalid category references and add default category
          await db.collection('posts').updateOne(
            { _id: post._id },
            {
              $set: {
                categories: [createdCategories[0]._id], // Use first default category
                updatedAt: new Date()
              }
            }
          )
          console.log(`   ✅ Fixed categories for: "${post.title}"`)
        }
      }
    } else {
      console.log('✅ All posts have valid category references')
    }

    // Check posts with missing media
    const postsWithMissingMedia = await db.collection('posts').aggregate([
      {
        $match: { heroImage: { $exists: true, $ne: null } }
      },
      {
        $lookup: {
          from: 'media',
          localField: 'heroImage',
          foreignField: '_id',
          as: 'mediaDocs'
        }
      },
      {
        $match: {
          mediaDocs: { $size: 0 }
        }
      },
      {
        $project: { title: 1, heroImage: 1 }
      }
    ]).toArray()

    if (postsWithMissingMedia.length > 0) {
      console.log(`⚠️  Found ${postsWithMissingMedia.length} posts with missing hero images`)

      if (shouldFix) {
        console.log('\n🔧 Fixing missing media references...')

        if (shouldForce) {
          // Remove invalid media references
          for (const post of postsWithMissingMedia) {
            await db.collection('posts').updateOne(
              { _id: post._id },
              {
                $unset: { heroImage: "" },
                $set: { updatedAt: new Date() }
              }
            )
            console.log(`   ✅ Removed invalid media reference from: "${post.title}"`)
          }
        } else {
          console.log('   ⚠️  Use --force to remove invalid media references')
          console.log('   💡 Or manually upload missing images and update references')
        }
      }
    } else {
      console.log('✅ All posts have valid media references')
    }

    // 3. Check post status distribution
    console.log('\n📊 Post status distribution...')
    const statusCounts = await db.collection('posts').aggregate([
      {
        $group: {
          _id: '$_status',
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    statusCounts.forEach(status => {
      console.log(`   ${status._id}: ${status.count} posts`)
    })

    // Fix posts without proper status
    if (shouldFix) {
      const postsWithoutStatus = await db.collection('posts').countDocuments({
        $or: [
          { _status: { $exists: false } },
          { _status: null },
          { _status: "" }
        ]
      })

      if (postsWithoutStatus > 0) {
        console.log(`\n🔧 Fixing ${postsWithoutStatus} posts without proper status...`)
        await db.collection('posts').updateMany(
          {
            $or: [
              { _status: { $exists: false } },
              { _status: null },
              { _status: "" }
            ]
          },
          {
            $set: {
              _status: 'published',
              updatedAt: new Date()
            }
          }
        )
        console.log(`   ✅ Set status to 'published' for ${postsWithoutStatus} posts`)
      }
    }

    // 4. Sample a few posts to check structure
    console.log('\n🔍 Sampling post structure...')
    const samplePosts = await db.collection('posts').find({}).limit(3).toArray()
    
    samplePosts.forEach((post, index) => {
      console.log(`\n   Post ${index + 1}: "${post.title}"`)
      console.log(`   - ID: ${post._id}`)
      console.log(`   - Status: ${post._status}`)
      console.log(`   - Slug: ${post.slug}`)
      console.log(`   - Authors: ${post.authors ? post.authors.length : 0}`)
      console.log(`   - Categories: ${post.categories ? post.categories.length : 0}`)
      console.log(`   - Hero Image: ${post.heroImage ? 'Yes' : 'No'}`)
      console.log(`   - Content: ${post.content ? 'Yes' : 'No'}`)
    })

    // 5. Check collection indexes
    console.log('\n📇 Checking collection indexes...')
    const indexes = await db.collection('posts').indexes()
    console.log(`   Found ${indexes.length} indexes:`)
    indexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`)
    })

    // 6. Summary and next steps
    console.log('\n🎯 Summary and Next Steps:')

    if (!shouldFix) {
      console.log('\n📋 Issues found that can be automatically fixed:')
      if (postsWithMissingAuthors.length > 0) {
        console.log(`   - ${postsWithMissingAuthors.length} posts with missing authors`)
      }
      if (postsWithMissingCategories.length > 0) {
        console.log(`   - ${postsWithMissingCategories.length} posts with missing categories`)
      }
      if (postsWithMissingMedia.length > 0) {
        console.log(`   - ${postsWithMissingMedia.length} posts with missing media`)
      }

      console.log('\n🛠️  To fix these issues automatically:')
      console.log('   pnpm debug:database --fix')
      console.log('   pnpm debug:database --fix --force  (for aggressive fixes)')
    } else {
      console.log('✅ Automatic fixes have been applied!')
      console.log('🔄 Re-run without --fix to verify all issues are resolved')
    }

    console.log('\n📚 Additional options:')
    console.log('1. Create fresh test data: pnpm seed')
    console.log('2. Check Payload admin: http://localhost:3000/admin/collections/posts')
    console.log('3. Test blog API: pnpm debug:posts')
    console.log('4. Test HTTP API: curl http://localhost:3000/api/v1/blog/posts')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    if (client) {
      await client.close()
      console.log('\n📡 Database connection closed')
    }
  }
}

// Run the script
fixRestoredDatabase()
  .then(() => {
    console.log('\n✅ Database check completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
