/**
 * Генерирует безопасный случайный пароль
 * @param length Длина пароля (по умолчанию 12 символов)
 * @returns Сгенерированный пароль
 */
export function generateSecurePassword(length: number = 12): string {
  // Набор символов для пароля
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Исключаем похожие символы I, O
  const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz'; // Исключаем похожие символы l
  const numberChars = '23456789'; // Исключаем похожие символы 0, 1
  const specialChars = '!@#$%^&*_-+=';
  
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  
  // Генерируем пароль
  let password = '';
  
  // Гарантируем, что пароль содержит как минимум по одному символу каждого типа
  password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
  password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
  password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Добавляем остальные символы
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Перемешиваем символы в пароле
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}
