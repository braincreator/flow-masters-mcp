// FlowMasters AI Agents - Navigation Update Script
// Generated with AI assistance for rapid development

const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/flowmasters_payload'

async function updateNavigation() {
  console.log('🔄 Updating FlowMasters navigation to include AI Agents...')
  
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db()
    const globalsCollection = db.collection('globals')
    
    // Get current header configuration
    const headerDoc = await globalsCollection.findOne({ globalType: 'header' })
    
    if (!headerDoc) {
      console.log('❌ Header document not found')
      return
    }
    
    console.log('📋 Current navigation items:', headerDoc.navItems?.length || 0)
    
    // Check if AI Agents already exists
    const hasAgentsItem = headerDoc.navItems?.some(item => 
      item.link?.url === '/agents' || 
      item.link?.label === 'AI Агенты' ||
      item.link?.label === 'AI Agents'
    )
    
    if (hasAgentsItem) {
      console.log('✅ AI Agents navigation item already exists')
      return
    }
    
    // Add AI Agents navigation item
    const newNavItem = {
      link: {
        type: 'reference',
        url: '/agents',
        label: 'AI Агенты',
        appearance: 'default',
        newTab: false
      },
      id: `nav_${Date.now()}`
    }
    
    // Update navigation
    const updatedNavItems = [...(headerDoc.navItems || []), newNavItem]
    
    const result = await globalsCollection.updateOne(
      { globalType: 'header' },
      { 
        $set: { 
          navItems: updatedNavItems,
          updatedAt: new Date()
        } 
      }
    )
    
    if (result.modifiedCount > 0) {
      console.log('✅ Successfully added AI Agents to navigation')
      console.log('📊 Total navigation items:', updatedNavItems.length)
      
      // Also update localized versions if they exist
      const localizedResult = await globalsCollection.updateOne(
        { globalType: 'header', 'navItems.en': { $exists: true } },
        { 
          $set: { 
            'navItems.en': updatedNavItems.map(item => ({
              ...item,
              link: {
                ...item.link,
                label: item.link.url === '/agents' ? 'AI Agents' : item.link.label
              }
            })),
            updatedAt: new Date()
          } 
        }
      )
      
      if (localizedResult.modifiedCount > 0) {
        console.log('✅ Updated English localization')
      }
      
    } else {
      console.log('❌ Failed to update navigation')
    }
    
  } catch (error) {
    console.error('❌ Error updating navigation:', error)
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Run the update
updateNavigation().catch(console.error)