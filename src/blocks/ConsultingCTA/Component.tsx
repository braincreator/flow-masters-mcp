import React from 'react';

interface ConsultingCTABlock {
  title: string;
  description?: string;
  buttonLabel: string;
  buttonLink: string;
}

interface ConsultingCTAProps {
  block: ConsultingCTABlock
}

const ConsultingCTAComponent: React.FC<ConsultingCTAProps> = ({ block }) => {
  const { title, description, buttonLabel, buttonLink } = block;

  return (
    <div className="consulting-cta">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <a href={buttonLink} className="button">{buttonLabel}</a>
    </div>
  );
};

export default ConsultingCTAComponent;