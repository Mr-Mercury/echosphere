import { BOT_MODEL_OPTIONS } from './models';
import { VIEW_MODES, PAGINATION, SORT_OPTIONS } from './ui-constants';

// Default values specific to bot explorer
export const BOT_EXPLORER_DEFAULTS = {
  SORT: 'popular' as const,
  MODEL: 'All Models',
  SEARCH_QUERY: '',
  VIEW_MODE: VIEW_MODES.GRID,
};

// Re-export just what we need for the bot explorer
export { BOT_MODEL_OPTIONS };
export const BOT_SORT_OPTIONS = SORT_OPTIONS.BOTS;
export const BOT_PAGINATION = PAGINATION.BOTS; 