# React Axios JWT Authentication Setup

## 1. **Axios Configuration with JWT Interceptor**

```typescript
// src/api/axiosConfig.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

## 2. **Authentication Service**

```typescript
// src/services/authService.ts
import apiClient from '../api/axiosConfig';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      status: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // Get current user
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
};
```

## 3. **Companies Service**

```typescript
// src/services/companyService.ts
import apiClient from '../api/axiosConfig';

export interface Company {
  id: number;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  industry?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyData {
  name: string;
  slug: string;
  description?: string;
  website?: string;
  industry?: string;
  foundedYear?: number;
  employeeCount?: string;
  headquarters?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
}

export const companyService = {
  // Get all companies
  async getCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
    isVerified?: boolean;
  }) {
    const response = await apiClient.get('/companies', { params });
    return response.data;
  },

  // Get company by ID
  async getCompanyById(id: string) {
    const response = await apiClient.get(`/companies/${id}`);
    return response.data;
  },

  // Create company
  async createCompany(data: CreateCompanyData) {
    const response = await apiClient.post('/companies', data);
    return response.data;
  },

  // Update company
  async updateCompany(id: string, data: Partial<CreateCompanyData>) {
    const response = await apiClient.put(`/companies/${id}`, data);
    return response.data;
  },

  // Delete company
  async deleteCompany(id: string) {
    const response = await apiClient.delete(`/companies/${id}`);
    return response.data;
  }
};
```

## 4. **React Component Example**

```typescript
// src/components/CompaniesList.tsx
import React, { useState, useEffect } from 'react';
import { companyService, Company } from '../services/companyService';
import { authService } from '../services/authService';

const CompaniesList: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getCompanies();
      setCompanies(data.companies);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Companies</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      
      <div>
        {companies.map((company) => (
          <div key={company.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h3>{company.name}</h3>
            <p>{company.description}</p>
            <p>Industry: {company.industry}</p>
            <p>Status: {company.isActive ? 'Active' : 'Inactive'}</p>
            <p>Verified: {company.isVerified ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompaniesList;
```

## 5. **Login Component Example**

```typescript
// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { authService, LoginCredentials } from '../services/authService';

const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      
      // Store tokens
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;
```

## 6. **Environment Variables**

```bash
# .env.local
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_JWT_SECRET=your-jwt-secret-key
```

## 7. **Usage Example**

```typescript
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import CompaniesList from './components/CompaniesList';
import { authService } from './services/authService';

const App: React.FC = () => {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginForm />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <CompaniesList /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

export default App;
```

## 8. **Testing the Setup**

1. **Start your backend**: `npm run start:dev`
2. **Start your frontend**: `npm start`
3. **Login** with valid credentials
4. **Check browser dev tools** for Authorization header
5. **Verify** companies API calls work with JWT token

## 9. **Common Issues & Solutions**

### Issue: 403 Forbidden
- **Check**: JWT token is included in Authorization header
- **Check**: Token is not expired
- **Check**: User exists and is active

### Issue: CORS errors
- **Check**: Backend CORS configuration includes your frontend URL
- **Check**: Authorization header is in allowedHeaders

### Issue: Token not being sent
- **Check**: localStorage has 'accessToken'
- **Check**: Axios interceptor is properly configured
- **Check**: Request headers in browser dev tools
