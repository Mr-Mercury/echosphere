import { CATEGORY_COLORS } from './categories';
import { VIEW_MODES, PAGINATION, SORT_OPTIONS } from './ui-constants';

// Default values specific to server template explorer
export const SERVER_EXPLORER_DEFAULTS = {
  SORT: 'popular' as const, // Corresponds to usageCount
  CATEGORY: 'All Categories',
  SEARCH_QUERY: '',
  VIEW_MODE: VIEW_MODES.GRID,
};

// Category options for server templates
// (Assuming CATEGORY_COLORS contains all relevant server categories)
export const SERVER_CATEGORY_OPTIONS = ['All Categories', ...Object.keys(CATEGORY_COLORS)];

// Sort options specific to server templates
export const SERVER_SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' }, // by usageCount
  { value: 'recent', label: 'Most Recent' },   // by createdAt
  { value: 'name', label: 'Name (A-Z)' },      // by serverName
];

// Pagination settings for server templates
export const SERVER_PAGINATION = {
  PAGE_SIZE: 12, // You can adjust this value as needed
}; 