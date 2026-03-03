const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  // Generic request method
  request: async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const config = {
      headers,
      ...options,
    };

    // Only stringify if it's JSON and not FormData
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
      headers['Content-Type'] = 'application/json';
    }

    try {
      console.log('Making API request to:', url);
      console.log('Request config:', {
        method: config.method,
        headers: config.headers,
        body: config.body instanceof FormData ? 'FormData' : config.body
      });
      
      const response = await fetch(url, config);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

// Auth endpoints
auth: {
  login: (credentials) => api.request('/auth/login', {
    method: 'POST',
    body: credentials,
  }),
  register: (userData) => api.request('/auth/register', {
    method: 'POST',
    body: userData,
  }),
  getProfile: () => api.request('/auth/profile'),
},

    // Password Reset endpoints - NEW
  passwordReset: {
    request: (data) => api.request('/password-reset/request', {
      method: 'POST',
      body: data,
    }),
    verify: (data) => api.request('/password-reset/verify', {
      method: 'POST',
      body: data,
    }),
    reset: (data) => api.request('/password-reset/reset', {
      method: 'POST',
      body: data,
    }),
  },


  // Area endpoints - NEW
  areas: {
    getAll: () => api.request('/areas'),
    getByType: (type) => api.request(`/areas/type/${type}`),
    getIssues: (areaId) => api.request(`/areas/${areaId}/issues`),
    create: (areaData) => api.request('/areas', {
      method: 'POST',
      body: areaData,
    }),
  },

users: {
  updateArea: (data) => api.request('/users/area', {
    method: 'PATCH',
    body: data,
  }),
  getProfile: () => api.request('/users/profile'),
},

  // Issue endpoints
  issues: {
    getAll: () => api.request('/issues'),
    getById: (id) => api.request(`/issues/${id}`),
    
    create: (formData) => {
      console.log('Creating issue with FormData:', formData);
      return api.request('/issues', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
    },
    
    updateStatus: (id, status) => api.request(`/issues/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),
    
    delete: (id) => api.request(`/issues/${id}`, {
      method: 'DELETE',
    }),

    getByType: (type) => api.request(`/issues/type/${type}`),
    getByLocation: (location) => api.request(`/issues/location/${location}`),
  },

  // issues: {
  //   getAll: () => api.request('/issues'),
  //   getById: (id) => api.request(`/issues/${id}`),
    
  //   // create method to accept FormData with all fields
  //   create: (formData) => {
  //     console.log('Creating issue with FormData:', formData);
  //     return api.request('/issues', {
  //       method: 'POST',
  //       body: formData,
  //       headers: {
  //         'Authorization': `Bearer ${localStorage.getItem('token')}`,
  //       },
  //     });
  //   },
    
  //   createWithParams: (issueData) => {
  //     const data = {
  //       title: issueData.title,
  //       description: issueData.description,
  //       street_address: issueData.street_address,
  //       issue_date: issueData.issue_date,
  //       issue_type: issueData.issue_type,
  //     };
      
  //     console.log('Creating issue with data:', data);
  //     return api.request('/issues', {
  //       method: 'POST',
  //       body: data,
  //     });
  //   },
    
  //   updateStatus: (id, status) => api.request(`/issues/${id}/status`, {
  //     method: 'PATCH',
  //     body: { status },
  //   }),
    
  //   delete: (id) => api.request(`/issues/${id}`, {
  //     method: 'DELETE',
  //   }),

  //   // filtering methods
  //   getByType: (type) => api.request(`/issues/type/${type}`),
  //   getByLocation: (location) => api.request(`/issues/location/${location}`),
  // },

  // Vote endpoints
  votes: {
    create: (voteData) => api.request('/votes', {
      method: 'POST',
      body: voteData,
    }),
    getForIssue: (issueId) => api.request(`/votes/${issueId}`),
  },

  upload: {
    image: (file) => {
      const formData = new FormData();
      formData.append('image', file);
      
      return api.request('/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
    },
  },
};

export default api;