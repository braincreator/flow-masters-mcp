'use client';

import React, { useState, useEffect } from 'react';
import { Category, Tag, User } from '@/payload-types'; // Assuming payload-types is generated

interface BlogFiltersProps {
  onFilterChange: (filters: { categories?: string[], tags?: string[], authors?: string[] }) => void;
  initialFilters?: { categories?: string[], tags?: string[], authors?: string[] };
}

const BlogFilters: React.FC<BlogFiltersProps> = ({ onFilterChange, initialFilters = {} }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [authors, setAuthors] = useState<User[]>([]);
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);
  const [filterCounts, setFilterCounts] = useState<{ categories: { [id: string]: number }, tags: { [id: string]: number } }>({ categories: {}, tags: {} });

  useEffect(() => {
    // Fetch filter options (categories, tags, authors) and counts
    const fetchFilterOptionsAndCounts = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/v1/categories');
        const categoriesData = await categoriesResponse.json();
        if (categoriesData && categoriesData.docs) {
          setCategories(categoriesData.docs);
        }

        // Fetch tags
        const tagsResponse = await fetch('/api/v1/tags');
        const tagsData = await tagsResponse.json();
        if (tagsData && tagsData.docs) {
          setTags(tagsData.docs);
        }

        // Fetch authors (users)
        const authorsResponse = await fetch('/api/v1/users');
        const authorsData = await authorsResponse.json();
        if (authorsData && authorsData.docs) {
          setAuthors(authorsData.docs);
        }

        // Fetch post counts from the posts API route
        const postsCountResponse = await fetch('/api/v1/posts?limit=1'); // Fetching with limit 1 is sufficient to get filterCounts
        const postsCountData = await postsCountResponse.json();

        if (postsCountData.filterCounts) {
          setFilterCounts(postsCountData.filterCounts);
        }

      } catch (error) {
        console.error('Error fetching filter options and counts:', error);
      }
    };

    fetchFilterOptionsAndCounts();
  }, []);

  useEffect(() => {
    // Notify parent component of filter changes
    onFilterChange(selectedFilters);
  }, [selectedFilters, onFilterChange]);

  const handleCheckboxChange = (filterType: 'categories' | 'tags' | 'authors', itemId: string) => {
    setSelectedFilters(prevFilters => {
      const currentItems = prevFilters[filterType] || [];
      const newItems = currentItems.includes(itemId)
        ? currentItems.filter(id => id !== itemId)
        : [...currentItems, itemId];
      return {
        ...prevFilters,
        [filterType]: newItems,
      };
    });
  };

  const handleResetFilters = () => {
    setSelectedFilters({});
    onFilterChange({}); // Notify parent to clear all filters, including search
  };

  return (
    <div className="blog-filters">
      {/* Categories Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Categories</h3>
        {categories.map(category => (
          <div key={category.id} className="flex items-center mb-1">
            <input
              type="checkbox"
              id={`category-${category.id}`}
              checked={selectedFilters.categories?.includes(category.id) || false}
              onChange={() => handleCheckboxChange('categories', category.id)}
              className="mr-2"
            />
            <label htmlFor={`category-${category.id}`}>
              {category.title} ({filterCounts.categories[category.id] || 0})
            </label>
          </div>
        ))}
      </div>

      {/* Tags Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Tags</h3>
        {tags.map(tag => (
          <div key={tag.id} className="flex items-center mb-1">
            <input
              type="checkbox"
              id={`tag-${tag.id}`}
              checked={selectedFilters.tags?.includes(tag.id) || false}
              onChange={() => handleCheckboxChange('tags', tag.id)}
              className="mr-2"
            />
            <label htmlFor={`tag-${tag.id}`}>
              {tag.title} ({filterCounts.tags[tag.id] || 0})
            </label>
          </div>
        ))}
      </div>

      {/* Authors Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Authors</h3>
        {authors.map(author => (
          <div key={author.id} className="flex items-center mb-1">
            <input
              type="checkbox"
              id={`author-${author.id}`}
              checked={selectedFilters.authors?.includes(author.id) || false}
              onChange={() => handleCheckboxChange('authors', author.id)}
              className="mr-2"
            />
            <label htmlFor={`author-${author.id}`}>{author.name}</label>
          </div>
        ))}
      </div>

      <button
        onClick={handleResetFilters}
        className="px-4 py-2 bg-gray-200 rounded-md"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default BlogFilters;