const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      SIGNUP: '/api/auth/signup',
      ME: '/api/auth/me'
    },
    PROPERTIES: {
      SEARCH: '/api/properties',
      OWNER: '/api/owner/properties',
      ADMIN: '/api/admin/properties'
    },
    ADMIN: {
      USERS: '/api/admin/users'
    }
  }
};

window.API_CONFIG = API_CONFIG;
