// Оптимизированные анимации для About страницы
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

// Viewport настройки для оптимизации
export const viewportConfig = {
  once: true,
  margin: '-50px'
}

// Уменьшенные анимации для пользователей с предпочтением reduced motion
export const reducedMotionConfig = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 }
}
