/**
 * Centralized API configuration management
 */

const apiConfig = {
  // Primary API endpoints
  primary: {
    v1: 'https://xsaim8x-xxx-api.onrender.com',
    v2: 'https://dev.oculux.xyz',
    v3: 'https://sifuapi.vercel.app',
    v4: 'https://mahmud-global-apis.onrender.com'
  },

  // Specialized endpoints
  services: {
    dp: 'https://mahmud-cdp-apis.onrender.com',
    age: 'https://mahmud-age-apis.onrender.com',
    sing: 'https://mahmud-sing-apis.onrender.com',
    emojimix: 'https://mahmud-emojimix-apis.onrender.com',
    font: 'https://mahmud-style-apis.onrender.com',
    anisr: 'https://mahmud-anisrx.onrender.com',
    prompt: 'https://mahmud-prompt.onrender.com',
    album: 'https://mahmud-album7.onrender.com',
    ytb: 'https://ytb-five.vercel.app',
    baby: 'https://simma-baby-69.onrender.com',
    teach: 'https://4gvf6m-3000.csb.app',
    imgur: 'https://qwp8w9-3000.csb.app',
    tv: 'https://049c-34-100-213-170.ngrok-free.app/dipto',
    xnil: 'https://xnilnew404.onrender.com'
  },

  // Fallback endpoints
  fallback: [
    'https://www.noobs-api.rf.gd/dipto',
    'https://www.noobz-api.rf.gd/',
    'https://rest-api-2-d3np.onrender.com/dipto',
    'https://2l8v4r-10000.csb.app/dipto',
    'https://www.x-noobs-apis.42web.io',
    'https://mostakim-3nrz.onrender.com',
    'https://www.x-noobs-apis.000.pe'
  ],

  // Request configuration
  request: {
    timeout: parseInt(process.env.API_TIMEOUT) || 5000,
    retries: parseInt(process.env.API_RETRIES) || 3,
    retryDelay: 1000
  }
};

/**
 * Get API endpoint
 * @param {string} service - Service name
 * @returns {string} - API URL
 */
function getAPIEndpoint(service) {
  if (apiConfig.primary[service]) {
    return apiConfig.primary[service];
  }
  if (apiConfig.services[service]) {
    return apiConfig.services[service];
  }
  return apiConfig.primary.v1;
}

/**
 * Get all working endpoints
 * @returns {string[]}
 */
function getAllEndpoints() {
  return [
    ...Object.values(apiConfig.primary),
    ...Object.values(apiConfig.services),
    ...apiConfig.fallback
  ];
}

module.exports = {
  apiConfig,
  getAPIEndpoint,
  getAllEndpoints
};
