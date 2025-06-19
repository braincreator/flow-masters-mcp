#!/bin/bash

# SEO проверка для Flow Masters
# Использование: ./scripts/check-seo.sh [URL]

URL=${1:-"https://flow-masters.ru"}
echo "🔍 Проверка SEO для: $URL"
echo "=================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для проверки HTTP статуса
check_url() {
    local url=$1
    local name=$2
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✅ $name: OK (200)${NC}"
        return 0
    else
        echo -e "${RED}❌ $name: FAILED ($status)${NC}"
        return 1
    fi
}

# Функция для проверки содержимого
check_content() {
    local url=$1
    local pattern=$2
    local name=$3
    
    if curl -s "$url" | grep -q "$pattern"; then
        echo -e "${GREEN}✅ $name: найден${NC}"
        return 0
    else
        echo -e "${RED}❌ $name: не найден${NC}"
        return 1
    fi
}

echo "📄 Проверка основных файлов:"
echo "----------------------------"

# Проверка sitemap файлов
check_url "$URL/sitemap.xml" "Основной sitemap"
check_url "$URL/pages-sitemap.xml" "Pages sitemap"
check_url "$URL/posts-sitemap.xml" "Posts sitemap"
check_url "$URL/services-sitemap.xml" "Services sitemap"
check_url "$URL/sitemap-index.xml" "Sitemap index"

# Проверка robots.txt
check_url "$URL/robots.txt" "Robots.txt"

echo ""
echo "🔍 Проверка содержимого robots.txt:"
echo "-----------------------------------"

# Проверка содержимого robots.txt
check_content "$URL/robots.txt" "Sitemap:" "Ссылки на sitemap"
check_content "$URL/robots.txt" "Disallow: /admin/" "Блокировка админки"
check_content "$URL/robots.txt" "User-agent: \*" "Правила для всех ботов"

echo ""
echo "📊 Проверка мета-тегов главной страницы:"
echo "----------------------------------------"

# Получаем HTML главной страницы
html=$(curl -s "$URL")

# Проверяем наличие основных мета-тегов
if echo "$html" | grep -q "<title>"; then
    title=$(echo "$html" | grep -o '<title>[^<]*</title>' | sed 's/<[^>]*>//g')
    echo -e "${GREEN}✅ Title: $title${NC}"
else
    echo -e "${RED}❌ Title: не найден${NC}"
fi

if echo "$html" | grep -q 'name="description"'; then
    description=$(echo "$html" | grep -o 'name="description"[^>]*content="[^"]*"' | sed 's/.*content="\([^"]*\)".*/\1/')
    echo -e "${GREEN}✅ Description: ${description:0:100}...${NC}"
else
    echo -e "${RED}❌ Description: не найден${NC}"
fi

# Проверка Open Graph
if echo "$html" | grep -q 'property="og:title"'; then
    echo -e "${GREEN}✅ Open Graph: настроен${NC}"
else
    echo -e "${RED}❌ Open Graph: не найден${NC}"
fi

# Проверка canonical
if echo "$html" | grep -q 'rel="canonical"'; then
    echo -e "${GREEN}✅ Canonical URL: настроен${NC}"
else
    echo -e "${RED}❌ Canonical URL: не найден${NC}"
fi

# Проверка структурированных данных
if echo "$html" | grep -q 'application/ld+json'; then
    echo -e "${GREEN}✅ JSON-LD: найден${NC}"
else
    echo -e "${RED}❌ JSON-LD: не найден${NC}"
fi

echo ""
echo "🌐 Проверка мультиязычности:"
echo "----------------------------"

# Проверка hreflang
if echo "$html" | grep -q 'hreflang'; then
    echo -e "${GREEN}✅ Hreflang: настроен${NC}"
else
    echo -e "${YELLOW}⚠️  Hreflang: не найден${NC}"
fi

# Проверка языковых версий
check_url "$URL/ru" "Русская версия"
check_url "$URL/en" "Английская версия"

echo ""
echo "🔗 Проверка важных страниц:"
echo "---------------------------"

# Проверка ключевых страниц
check_url "$URL/services" "Страница услуг"
check_url "$URL/posts" "Страница блога"
check_url "$URL/about" "О компании"
check_url "$URL/contact" "Контакты"

echo ""
echo "📈 Рекомендации для дальнейшей проверки:"
echo "---------------------------------------"
echo "1. Проверьте sitemap в Google Search Console:"
echo "   https://search.google.com/search-console"
echo ""
echo "2. Валидируйте структурированные данные:"
echo "   https://search.google.com/test/rich-results"
echo ""
echo "3. Проверьте Open Graph:"
echo "   https://developers.facebook.com/tools/debug/"
echo ""
echo "4. Анализ производительности:"
echo "   https://pagespeed.web.dev/"
echo ""
echo "5. Проверка мобильной версии:"
echo "   https://search.google.com/test/mobile-friendly"

echo ""
echo "✅ Проверка завершена!"
