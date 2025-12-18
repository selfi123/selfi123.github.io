// API Configuration for Subtitle Search
// Note: For production, consider using environment variables or a backend proxy
// to keep the API key secure. This file is for reference.

const SUBTITLE_API_CONFIG = {
  apiKey: '',
  apiBaseUrl: 'https://api.opensubtitles.com/api/v1'
};

// Export for use in other files if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SUBTITLE_API_CONFIG;
}
