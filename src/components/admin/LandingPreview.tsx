import React from 'react';

interface LandingPreviewProps {
  content: string | null;
}

const LandingPreview: React.FC<LandingPreviewProps> = ({ content }) => {
  return (
    <iframe
      srcDoc={content || ''}
      title="Landing Page Preview"
      width="100%"
      height="500px"
      style={{ border: '1px solid #ccc' }}
    />
  );
};

export default LandingPreview;
