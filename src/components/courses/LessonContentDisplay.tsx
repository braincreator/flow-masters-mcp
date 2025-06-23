import React from 'react';
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import { Lesson } from '@/payload-types'; // Assuming Lesson type includes layout
import RichText from '@/components/RichText'; // For 'content' blocks or rich text within blocks
import { VideoMedia } from '@/components/Media/VideoMedia'; // For video blocks
// Import other block components as needed (e.g., CodeBlock, QuizBlock)

// Define a basic type for the layout blocks array
// Needs refinement based on actual block definitions in Payload config
type LessonBlock = {
  blockType: string;
  id?: string; // Blocks usually have an ID
  // Add other common block props if known, or use 'any'/'unknown'
  [key: string]: any;
};

interface LessonContentDisplayProps {
  // Assuming Lesson type will eventually have 'layout' based on design doc
  // Use 'any' for now due to outdated payload-types.ts
  layout: any[] | undefined | null;
}

const LessonContentDisplay: React.FC<LessonContentDisplayProps> = ({ layout }) => {
  if (!layout || layout.length === 0) {
    // TODO: Add translation
    return <p>Lesson content is not available.</p>;
  }

  return (
    <div className="prose max-w-none space-y-6"> {/* Apply prose styling */}
      {layout.map((block: LessonBlock, index) => {
        const key = block.id || `block-${index}`;

        // Render different components based on blockType
        switch (block.blockType) {
          case 'content': // Common block type for rich text content
            // Assuming the block has a 'content' field with rich text data
            // Pass data to the 'data' prop of RichText component
            return <RichText key={key} data={block.content} />;

          case 'mediaBlock': // Common block type for embedded media
            // Assuming it has 'media' field (ID or object) and 'position'
            // Let's check if the media is a video
            // This requires the 'media' field to be populated (depth >= 1)
            if (typeof block.media === 'object' && block.media?.mimeType?.startsWith('video')) {
              return <VideoMedia key={key} resource={block.media} />;
            }
            // Handle other media types (image, etc.) or show placeholder
            return <div key={key}>[Media Block: {block.media?.filename || block.media}]</div>;

          case 'videoBlock': // Specific video block type (if defined)
             // Assuming it has a 'video' field (Media relation) or 'videoUrl'
             if (block.video) { // Check if 'video' relation is populated
               // Render VideoMedia and caption separately
               return (
                 <div key={key}>
                   <VideoMedia resource={block.video} />
                   {block.caption && <p className="text-sm text-muted-foreground mt-2 text-center">{block.caption}</p>}
                 </div>
               );
             }
             if (block.videoUrl) {
               // Basic iframe for external URL, consider a more robust player
               return (
                 <div key={key}>
                   <iframe
                     src={block.videoUrl}
                     width="100%"
                     height="400" // Adjust height
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                     title={block.caption || 'Lesson Video'}
                     className="aspect-video"
                   ></iframe>
                   {block.caption && <p className="text-sm text-muted-foreground mt-2">{block.caption}</p>}
                 </div>
               );
             }
             return <div key={key}>[Video Block Placeholder]</div>;


          // Add cases for other block types based on actual Payload config
          case 'code': // Example: Code block
             // Assuming block has 'code' and 'language' fields
             return (
               <pre key={key} className="bg-muted p-4 rounded overflow-x-auto">
                 <code className={`language-${block.language || 'plaintext'}`}>
                   {block.code}
                 </code>
               </pre>
             );

          case 'quiz': // Placeholder for Quiz block (design doc)
            // Assuming block links to an Assessment via 'assessment' field
            return <div key={key} className="border p-4 rounded bg-card">[Quiz Placeholder: Assessment ID {block.assessment?.id || block.assessment}]</div>;

          case 'assignment': // Placeholder for Assignment block (design doc)
             // Assuming block links to an Assessment via 'assessment' field
            return <div key={key} className="border p-4 rounded bg-card">[Assignment Placeholder: Assessment ID {block.assessment?.id || block.assessment}]</div>;


          default:
            logWarn(`Unsupported lesson block type: ${block.blockType}`);
            return <div key={key}>[Unsupported Block: {block.blockType}]</div>;
        }
      })}
    </div>
  );
};

export default LessonContentDisplay;