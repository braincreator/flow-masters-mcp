'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardData } from '@/components/Card';
import { Course, Category, Tag } from '@/payload-types';
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import { usePayloadAPI } from '@/hooks/usePayloadAPI'; // Assuming this hook exists for API calls
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For filters/sort
import { Input } from "@/components/ui/input"; // For search filter

// Define filter and sort state types
interface Filters {
  category?: string;
  tag?: string;
  search?: string;
}

type SortOrder = 'title_asc' | 'title_desc' | 'createdAt_asc' | 'createdAt_desc';

export const CourseList: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({});
  const [sortOrder, setSortOrder] = useState<SortOrder>('createdAt_desc');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assuming usePayloadAPI hook exists and works like this:
  // const { data, error: apiError, isLoading: apiIsLoading } = usePayloadAPI<Course[]>('/api/courses', { /* query params */ });
  // For now, simulate fetching
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call using usePayloadAPI or fetch
        logDebug('Fetching courses with filters:', filters, 'and sort:', sortOrder);
        // Construct query parameters based on filters and sortOrder
        const queryParams = new URLSearchParams();
        if (filters.category) queryParams.append('where[category][equals]', filters.category);
        if (filters.tag) queryParams.append('where[tags][in]', filters.tag); // Assuming tags is an array relation
        if (filters.search) queryParams.append('where[title][like]', filters.search); // Basic title search

        // Map sortOrder to Payload sort query param
        const sortMap: Record<SortOrder, string> = {
          'title_asc': 'title',
          'title_desc': '-title',
          'createdAt_asc': 'createdAt',
          'createdAt_desc': '-createdAt',
        };
        queryParams.append('sort', sortMap[sortOrder]);
        queryParams.append('limit', '12'); // Example limit
        queryParams.append('depth', '1'); // Ensure relations like featuredImage and tags are populated

        // --- Simulated Fetch ---
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        // Replace with actual fetch: const response = await fetch(`/api/courses?${queryParams.toString()}`);
        // const data = await response.json();
        // setCourses(data.docs || []);
        // --- End Simulated Fetch ---

        // Placeholder data for now
        setCourses([
          // Add some placeholder Course objects if needed for UI testing
        ]);

      } catch (err) {
        logError("Error fetching courses:", err);
        setError('Failed to load courses.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [filters, sortOrder]);

  // Map Course data to CardData format
  const cardDataList: CardData[] = useMemo(() => {
    return courses.map(course => ({
      slug: course.slug,
      title: course.title,
      featuredImage: course.featuredImage, // Use featuredImage for courses
      excerpt: course.excerpt,             // Use excerpt for courses
      tags: course.tags,                   // Use tags for courses
    }));
  }, [courses]);

  // TODO: Fetch actual categories and tags for filter dropdowns
  const categories: Category[] = []; // Placeholder
  const tags: Tag[] = []; // Placeholder

  return (
    <div className="container py-8">
      <h2 className="text-3xl font-bold mb-6">Explore Courses</h2>

      {/* Filter and Sort Controls */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        <Input
          placeholder="Search courses..."
          value={filters.search || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="md:col-span-2"
        />
        {/* TODO: Replace with actual Category Select */}
        <Select
          value={filters.category}
          onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? undefined : value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {/* Map actual categories here */}
          </SelectContent>
        </Select>
        {/* TODO: Replace with actual Tag Select */}
        {/* <Select value={filters.tag} onValueChange={(value) => setFilters(prev => ({ ...prev, tag: value === 'all' ? undefined : value }))}>...</Select> */}
        <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt_desc">Newest</SelectItem>
            <SelectItem value="createdAt_asc">Oldest</SelectItem>
            <SelectItem value="title_asc">Title (A-Z)</SelectItem>
            <SelectItem value="title_desc">Title (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-[300px] rounded-lg" />
          ))}
        </div>
      )}
      {!isLoading && error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && courses.length === 0 && (
        <p>No courses found matching your criteria.</p>
      )}
      {!isLoading && !error && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardDataList.map((courseCardData, index) => (
            <Card
              key={index}
              doc={courseCardData}
              relationTo="courses"
              className="h-full" // Ensure cards stretch to fill grid cell height
              showCategories={true} // This will now show tags for courses
            />
          ))}
        </div>
      )}

      {/* TODO: Add Pagination if needed */}
    </div>
  );
};

export default CourseList;