# FlowMasters Page Builder

The FlowMasters Page Builder is a flexible system for creating pages with a variety of content blocks.

## Available Blocks

The page builder includes the following block types:

### Layout and Structure
- **Container**: A container for nesting other blocks with custom styling
- **Divider**: A horizontal line for separating content
- **Tabs**: Content organized into tabs that users can switch between

### Content
- **Hero**: Large header section, typically at the top of a page
- **Content**: Flexible rich text content columns
- **Media**: Image or video display
- **Code**: Code snippets with syntax highlighting

### Features and Benefits
- **Feature Grid**: Display features in a grid layout
- **Stats**: Display key statistics or metrics
- **Timeline**: Display events in chronological order

### Conversion
- **CTA (Call to Action)**: Prompt users to take action
- **Pricing Table**: Display pricing options
- **Banner**: Notification or announcement banner
- **Testimonial**: Display customer testimonials
- **FAQ**: Frequently asked questions in accordion format
- **Form**: Contact or signup forms
- **Products List**: Display a list of products

## How to Use

### Basic Implementation

```tsx
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Block } from '@/types/blocks'

export default function Page() {
  // Blocks data, typically from a CMS or API
  const blocks: Block[] = [
    {
      blockType: 'hero',
      heading: 'Welcome',
      subheading: 'This is a hero block',
      // additional properties based on block type
    },
    {
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: { /* rich text content */ }
        }
      ]
    }
    // additional blocks as needed
  ]

  return <RenderBlocks blocks={blocks} />
}
```

### Common Block Settings

All blocks support a common set of layout settings through the `settings` property:

```tsx
settings: {
  fullWidth: boolean,       // Whether the block should be full width
  containerWidth: 'small' | 'medium' | 'large' | 'full',
  padding: {
    top: 'none' | 'small' | 'medium' | 'large',
    bottom: 'none' | 'small' | 'medium' | 'large',
    left: 'none' | 'small' | 'medium' | 'large',
    right: 'none' | 'small' | 'medium' | 'large',
  },
  margin: {
    top: 'none' | 'small' | 'medium' | 'large',
    bottom: 'none' | 'small' | 'medium' | 'large',
  },
  background: {
    color: string,         // Background color
    image: {              // Background image
      url: string,
      alt: string,
    },
    overlay: boolean,      // Whether to add an overlay over the background
    overlayOpacity: number, // Opacity of the overlay (0-1)
  }
}
```

## Example

The best way to see how the page builder works is to visit the example page at `/en/pagebuilder-example`, which showcases various block types.

You can also find code examples in `src/examples/BlocksExample.tsx`.

## Extending the System

To add a new block type:

1. Define the block type interface in `src/types/blocks.ts`
2. Create a component in `src/blocks/YourBlockName/Component.tsx`
3. Add the component to the `blockComponents` object in `src/blocks/RenderBlocks.tsx`

## Best Practices

- Use the `GridContainer` component to ensure consistent spacing and responsive behavior
- Maintain consistent styling by using the design tokens from your theme
- Use responsive design techniques for all block components
- Keep blocks modular and focused on a single purpose
- Test on different screen sizes to ensure a good user experience 