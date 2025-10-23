// ConnectHub API Configuration
// This file contains the configuration for global message storage
// Updated by acridge3-369

const API_CONFIG = {
    // JSONBin.io configuration for global storage
    JSONBIN: {
        binId: 'connecthub-messages',
        apiKey: '$2a$10$WpKZqN2xJ8mF9sL3vR7yAe', // Public read-only key
        baseUrl: 'https://api.jsonbin.io/v3/b'
    },
    
    // Alternative storage options (can be implemented later)
    FIREBASE: {
        // Firebase configuration would go here
        enabled: false
    },
    
    // Local storage fallback
    LOCAL_STORAGE: {
        key: 'connecthub_posts',
        enabled: true
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
