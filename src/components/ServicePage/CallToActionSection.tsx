"use client";
import React, { useState } from 'react';

interface CallToActionSectionProps {
  title?: string;
  text?: string;
  buttonText?: string;
  onSubmit?: (formData: { name: string; contact: string; comment: string }) => void; // Для обработки формы
  onButtonClick?: () => void; // Если используется просто кнопка
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({
  title = "Готовы использовать GenAI для роста вашего бизнеса?",
  text = "Заполните форму ниже или свяжитесь с нами, чтобы обсудить ваши задачи и получить бесплатную консультацию.",
  buttonText = "Запросить бесплатную консультацию",
  onSubmit,
  onButtonClick,
}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState(''); // Может быть email или телефон
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false); // Для отображения сообщения об успехе

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ name, contact, comment });
      setIsSubmitted(true); // Показать сообщение об успехе
      // Опционально: сбросить форму
      // setName('');
      // setContact('');
      // setComment('');
    } else if (onButtonClick) {
        onButtonClick(); // Если используется только кнопка
    }
  };

  return (
    <section className="call-to-action py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white"> {/* Пример стилизации */}
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {title}
        </h2>
        <p className="text-lg md:text-xl mb-8">
          {text}
        </p>

        {isSubmitted ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Спасибо!</strong>
            <span className="block sm:inline"> Ваша заявка отправлена. Мы скоро свяжемся с вами.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white text-gray-800 p-8 rounded-lg shadow-xl max-w-lg mx-auto">
            <div className="mb-4">
              <label htmlFor="cta-name" className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input
                type="text"
                id="cta-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ваше имя"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="cta-contact" className="block text-sm font-medium text-gray-700 mb-1">Email или Телефон</label>
              <input
                type="text"
                id="cta-contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ваш email или телефон"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="cta-comment" className="block text-sm font-medium text-gray-700 mb-1">Комментарий (опционально)</label>
              <textarea
                id="cta-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Кратко опишите вашу задачу или вопрос"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              {buttonText}
            </button>
            <p className="text-xs text-gray-500 mt-3">
              *Консультация бесплатна и ни к чему вас не обязывает.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};

export default CallToActionSection;