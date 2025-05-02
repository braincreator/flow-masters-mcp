'use client'; // Convert to Client Component

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl'; // Use client-side hook
import { Course, Tag } from '@/payload-types'; // Add Tag type
import { Locale } from '@/constants';
import { api } from '@/lib/api-client'; // Use the API client
import CourseCard from '@/components/courses/CourseCard'; // Correct path to component
import { GridContainer } from '@/components/GridContainer'; // Assuming a grid container exists

// Define a type for the paginated Payload response (can be reused)
interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface CoursesPageProps {
  params: {
    locale: Locale;
  };
}

// Define types for filters
type Filters = {
  difficulty?: string[];
  tags?: string[];
  accessType?: string[];
};

// Import UI components - Assuming paths and existence
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useDebouncedCallback } from 'use-debounce';
import { Button } from '@/components/ui/button'; // Import Button for pagination


const CoursesPage: React.FC<CoursesPageProps> = ({ params: { locale } }) => {
  const t = useTranslations('CoursesPage');

  // State variables
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({
    difficulty: [],
    tags: [],
    accessType: [],
  }); // Initialize with empty arrays
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // --- Data Fetching ---
  const fetchCourses = useCallback(async (pageToFetch = currentPage, currentSearch = searchTerm, currentFilters = filters) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch Courses with filters and search
      const params: Record<string, any> = {
        where: {
          status: { equals: 'published' },
          ...(currentSearch && {
            or: [
              { title: { like: currentSearch } },
              { excerpt: { like: currentSearch } },
            ],
          }),
          ...(currentFilters.difficulty?.length && { difficulty: { in: currentFilters.difficulty.join(',') } }),
          ...(currentFilters.tags?.length && { tags: { in: currentFilters.tags.join(',') } }),
          ...(currentFilters.accessType?.length && { accessType: { in: currentFilters.accessType.join(',') } }),
        },
        limit: 12,
        page: page,
        depth: 1, // Include featuredImage data
        sort: '-createdAt', // Default sort
      };

      const coursesData = await api.get<PayloadResponse<Course>>('/courses', params);

      setCourses(coursesData.docs);
      setPagination({
        page: coursesData.page,
        totalPages: coursesData.totalPages,
        hasNextPage: coursesData.hasNextPage,
        hasPrevPage: coursesData.hasPrevPage,
      });
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError(t('fetchError'));
      setCourses([]); // Clear courses on error
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, filters, t]); // Dependencies for useCallback

  // Fetch available tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsResponse = await api.get<PayloadResponse<Tag>>('/tags', { limit: 100 });
        setAvailableTags(tagsResponse.docs);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
        // Optionally set an error state for tags
      }
    };
    fetchTags();
  }, []); // Fetch tags only once

  // Fetch courses when page, search term, or filters change
  useEffect(() => {
    fetchCourses(currentPage, searchTerm, filters);
  }, [currentPage, searchTerm, filters, fetchCourses]);

  // --- Event Handlers ---
  const debouncedSearch = useDebouncedCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to page 1 on new search
  }, 500); // Debounce search input by 500ms

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  // Generic handler for single-select filters (like difficulty, accessType)
  const handleFilterChange = (filterType: keyof Filters) => (value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value ? [value] : [], // Replace array for single select
    }));
    setCurrentPage(1); // Reset to page 1 on filter change
  };

   // Handler specifically for multi-select tags using checkboxes (example)
   const handleTagChange = (tagId: string) => {
    setFilters(prevFilters => {
        const currentTags = prevFilters.tags || [];
        const newTags = currentTags.includes(tagId)
          ? currentTags.filter(id => id !== tagId) // Remove tag
          : [...currentTags, tagId]; // Add tag
        return { ...prevFilters, tags: newTags };
    });
    setCurrentPage(1); // Reset to page 1
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // --- Effects ---
  // Initial fetch is handled by the useEffect watching dependencies

  // --- Render ---
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      {/* Search and Filter UI */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Search */}
        <div className="md:col-span-2">
          <Label htmlFor="search">{t('searchLabel')}</Label>
          <Input
            id="search"
            type="search"
            placeholder={t('searchPlaceholder')}
            onChange={handleSearchChange}
            // Use uncontrolled input with debouncing
          />
        </div>

        {/* Difficulty Filter */}
        <div>
          <Label htmlFor="difficulty">{t('difficultyLabel')}</Label>
           <Select onValueChange={handleFilterChange('difficulty')} value={filters.difficulty?.[0] ?? ''}>
             <SelectTrigger id="difficulty">
               <SelectValue placeholder={t('allDifficulties')} />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="">{t('allDifficulties')}</SelectItem>
               <SelectItem value="beginner">{t('beginner')}</SelectItem>
               <SelectItem value="intermediate">{t('intermediate')}</SelectItem>
               <SelectItem value="advanced">{t('advanced')}</SelectItem>
             </SelectContent>
           </Select>
        </div>

         {/* Access Type Filter */}
         <div>
           <Label htmlFor="accessType">{t('accessTypeLabel')}</Label>
           <Select onValueChange={handleFilterChange('accessType')} value={filters.accessType?.[0] ?? ''}>
             <SelectTrigger id="accessType">
               <SelectValue placeholder={t('allAccessTypes')} />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="">{t('allAccessTypes')}</SelectItem>
               <SelectItem value="free">{t('free')}</SelectItem>
               <SelectItem value="paid">{t('paid')}</SelectItem>
               <SelectItem value="subscription">{t('subscription')}</SelectItem>
             </SelectContent>
           </Select>
         </div>

         {/* Tags Filter (Example using Checkboxes - might need a dropdown for many tags) */}
         {availableTags.length > 0 && (
            <div className="md:col-span-4 mt-4">
                <Label className="mb-2 block">{t('tagsLabel')}</Label>
                <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                        <div key={tag.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`tag-${tag.id}`}
                                checked={filters.tags?.includes(tag.id)}
                                onCheckedChange={() => handleTagChange(tag.id)}
                            />
                            {/* Use tag.title assuming it exists based on Tag type */}
                            <Label htmlFor={`tag-${tag.id}`}>{tag.title ?? tag.id}</Label>
                        </div>
                    ))}
                </div>
            </div>
         )}
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <p>{t('loading')}</p>
      ) : error ? (
        <p className="text-red-500">{error}</p> // Display error message
      ) : courses.length === 0 ? (
        <p>{t('noCoursesFound')}</p>
      ) : (
        <GridContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} locale={locale} />
          ))}
        </GridContainer>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-4">
          <Button
            variant="outline"
            disabled={!pagination.hasPrevPage || isLoading}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            {t('previous')}
          </Button>
          <span> {t('page', { current: pagination.page, total: pagination.totalPages })} </span>
          <Button
            variant="outline"
            disabled={!pagination.hasNextPage || isLoading}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            {t('next')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;