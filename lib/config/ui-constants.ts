// View mode options for components with multiple display options
export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
} as const;

// Pagination settings for different components
export const PAGINATION = {
  BOTS: {
    PAGE_SIZE: 20,
  },
  SERVERS: {
    PAGE_SIZE: 15,
  },
  MESSAGES: {
    PAGE_SIZE: 30,
  }
};

// Sort options for different components
export const SORT_OPTIONS = {
  BOTS: [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'recent', label: 'Most Recent' },
  ],
  // Example for future components
  SERVERS: [
    { value: 'popular', label: 'Most Popular' },
    { value: 'active', label: 'Most Active' },
    { value: 'recent', label: 'Most Recent' },
  ]
}; 