import React from 'react';

// Интерфейс для описания шага процесса
export interface ProcessStepItem { // Exporting for potential use elsewhere
  step: number;
  title: string;
  description: string;
  icon?: React.ReactNode; // Иконка для шага
}

// Props для компонента WorkProcess
interface WorkProcessProps {
  title?: string; // Optional title for the section
  steps: ProcessStepItem[]; // Array of steps to display
}

// Default steps data (can be overridden by props)
const defaultSteps: ProcessStepItem[] = [
    {
    step: 1,
    title: 'Заявка / Контакт',
    description: 'Оставьте заявку на сайте или свяжитесь с нами удобным способом. Мы оперативно ответим.',
    // icon: <ContactIcon />,
  },
  {
    step: 2,
    title: 'Консультация / Бриф',
    description: 'Проведем бесплатную консультацию, чтобы понять ваши задачи, цели и текущую ситуацию.',
    // icon: <ConsultationIcon />,
  },
  {
    step: 3,
    title: 'Предложение / План',
    description: 'Подготовим индивидуальное коммерческое предложение с описанием услуг, сроков и стоимости.',
    // icon: <ProposalIcon />,
  },
  {
    step: 4,
    title: 'Согласование / Договор',
    description: 'Обсудим детали предложения, ответим на вопросы и заключим договор.',
    // icon: <ContractIcon />,
  },
  {
    step: 5,
    title: 'Реализация / Отчетность',
    description: 'Выполним работы согласно плану, предоставляя регулярные отчеты о ходе проекта.',
    // icon: <ExecutionIcon />,
  },
];

const WorkProcess: React.FC<WorkProcessProps> = ({
  title = "Как мы работаем?", // Default title
  steps = defaultSteps, // Use default data if steps prop is not provided
}) => {
  return (
    // Using more generic class names and relying on theme variables potentially
    <section className="py-12 md:py-20 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary-foreground">
          {title}
        </h2>
        <div className="relative">
          {/* Process Line (optional visualization) */}
          <div className="hidden md:block absolute left-1/2 top-6 bottom-6 w-0.5 bg-border transform -translate-x-1/2"></div>

          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className={`process-step flex flex-col md:flex-row items-center ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''} relative`} // Added relative for z-index context
              >
                {/* Step Number/Icon */}
                <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4 md:mb-0 z-10 border-4 border-secondary">
                  {step.icon || step.step}
                </div>
                {/* Step Description */}
                <div className={`bg-card p-6 rounded-lg shadow-md md:w-1/2 ${index % 2 !== 0 ? 'md:mr-12 lg:mr-16' : 'md:ml-12 lg:ml-16'} border border-border text-card-foreground`}>
                  <h3 className="text-xl font-semibold mb-2 text-accent-foreground">{step.title}</h3>
                  <p className="text-secondary-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkProcess;