// src/components/CourseCertificateInfo.tsx
import React from 'react';
import { useTranslations } from 'next-intl';

const CourseCertificateInfo: React.FC = () => {
  // Assuming 'CoursePage' namespace or create a specific one if needed
  const t = useTranslations('CoursePage');

  return (
    <div className="py-8 md:py-12 border-t border-border">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
        {t('course.certificate.title')}
      </h2>
      <p className="text-base md:text-lg text-muted-foreground mb-6">
        {t('course.certificate.description')}
      </p>
      {/* Optional: Placeholder for a certificate image */}
      {/*
      <div className="bg-muted h-48 w-full max-w-md mx-auto flex items-center justify-center rounded-lg shadow">
        <span className="text-muted-foreground">Certificate Image Placeholder</span>
      </div>
      */}
    </div>
  );
};

export default CourseCertificateInfo;