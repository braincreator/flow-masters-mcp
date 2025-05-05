import React from 'react';

// Примерный интерфейс для пропсов, если нужны будут настройки извне
interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  // Можно добавить imageUrl или компонент для визуала
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = "GenAI для Вашего Маркетинга и E-commerce в России",
  subtitle = "Разрабатываем и внедряем решения на базе генеративного ИИ для роста ваших бизнес-показателей.",
  ctaText = "Получить консультацию",
  onCtaClick,
}) => {
  return (
    <section className="service-hero bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 px-4 text-center"> {/* Пример стилизации */}
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {title}
        </h1>
        <p className="text-lg md:text-xl mb-8">
          {subtitle}
        </p>
        {/* TODO: Добавить Визуал (Изображение/Анимация) */}
        <button
          onClick={onCtaClick}
          className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
        >
          {ctaText}
        </button>
      </div>
    </section>
  );
};

export default HeroSection;