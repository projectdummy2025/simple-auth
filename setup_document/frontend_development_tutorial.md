# TUTORIAL: Phase 4 - Frontend Development (Docker-Native)

This tutorial explains how to complete Phase 4 of the development plan: Frontend Development (Docker-Native).

## Tasks to Complete:
1. Create frontend package.json with React and Vite dependencies
2. Build React application with Vite for containerized environment
3. Implement React Router for navigation between views
4. Create Login, Register, and Home page components
5. Implement API service for backend communication
6. Implement authentication state management
7. Implement protected routes logic
8. Implement logout functionality
9. Configure Vite for containerized development
10. Configure Nginx to serve React application
11. Test frontend functionality with containerized backend
12. Ensure no host machine dependencies for frontend development

## PREREQUISITES
- Phase 1 (Project Setup) completed
- Phase 2 (Database Setup) completed
- Phase 3 (Backend Setup) completed
- Backend container running and accessible
- Docker and docker compose installed
- Environment variables properly configured in `.env` file

## STEP 1: CREATE FRONTEND PACKAGE.JSON

In the containerized environment, we'll create a package.json file for the frontend service with necessary dependencies.

From your project root directory (`/home/fedora/projects/simple-auth/frontend/src`), create the `package.json` file with the following content:

```json
{
  "name": "simple-auth-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.23.1",
    "axios": "^1.7.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.0"
  }
}
```

## STEP 2: CREATE FRONTEND SOURCE FILES

Create the following files in the `frontend/src` directory:

### main.jsx - Main entry point for React application:

```
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

### App.jsx - Main application component with routing and authentication state:

```
import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import apiService from './services/apiService';

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await apiService.getMe();
          setUser(userData.user);
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <nav style={{ padding: '1rem', background: '#eee', marginBottom: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        {user ? (
          <>
            <span style={{ marginRight: '1rem' }}>Welcome, {user.username}!</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage setUser={setUser} />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage setUser={setUser} />} />
          <Route path="/" element={user ? <HomePage user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
```

### index.css - Basic styling:

```
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

form {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  gap: 1rem;
}

input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

h2 {
  margin-top: 0;
}
```

### index.html - HTML template:

```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Simple Auth - Frontend</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.jsx"></script>
  </body>
</html>
```

## STEP 3: CREATE PAGES

Create the following files in the `frontend/src/pages` directory:

### HomePage.jsx - Protected home page:

```
import React from 'react';

const HomePage = ({ user }) => {
  return (
    <div>
      <h2>Welcome to the Protected Home Page</h2>
      {user ? (
        <div>
          <p>Hello, <strong>{user.username}</strong>!</p>
          <p>Your user ID is: {user.id}</p>
          <p>Your email is: {user.email}</p>
        </div>
      ) : (
        <p>You are not logged in.</p>
      )}
    </div>
  );
};

export default HomePage;
```

### LoginPage.jsx - Login form component:

```
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const LoginPage = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await apiService.login(username, password);
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginPage;
```

### RegisterPage.jsx - Registration form component:

```
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const RegisterPage = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await apiService.register(username, email, password);
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterPage;
```

## STEP 4: CREATE SERVICES

Create the following file in the `frontend/src/services` directory:

### apiService.js - Service for API communication:

```
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const apiService = {
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default apiService;
```

## STEP 5: CONFIGURE VITE

Create the Vite configuration file in `frontend/src` directory:

### vite.config.js - Vite configuration for containerized development:

```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true,
    },
  },
})
```

## STEP 6: CONFIGURE NGINX

Create the Nginx configuration file in `frontend` directory:

### nginx.conf - Nginx configuration to serve the React application:

```
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # CORS headers for API communication
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

## STEP 7: CREATE DOCKERFILE

Create the Dockerfile in `frontend` directory:

### Dockerfile - Multi-stage Dockerfile for React application:

```
# Use Node.js LTS Alpine image for build stage
FROM node:20-alpine AS builder

# Set working directory in container
WORKDIR /app

# Copy package files
COPY src/package.json src/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ .

# Build the application
RUN npm run build


# Use nginx to serve the built application
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

## STEP 8: BUILD AND RUN THE FRONTEND CONTAINER

Now that all the frontend files are created, let's build and run the complete application:

From the project root directory (`/home/fedora/projects/simple-auth`), run:

```
docker compose up --build
```

This will:
1. Build the frontend container using the Dockerfile
2. Start the PostgreSQL database container
3. Start the backend container
4. Start the frontend container
5. Connect all services together

## STEP 9: TEST THE FRONTEND APPLICATION

Once the containers are running, open a web browser and navigate to:

```
http://localhost:3000
```

The application should:
1. Redirect you to the login page if not authenticated
2. Allow registration of new users
3. Allow login with existing credentials
4. Display a protected home page after login
5. Show user information on the home page
6. Allow logout functionality

## STEP 10: VERIFY CONTAINERIZED DEVELOPMENT WORKFLOW

To verify that development happens entirely within containers:

1. Make a change to one of the frontend files (e.g. App.jsx)
2. The Vite development server in the container should reflect the changes
3. Refresh the browser to see the updated interface

## SUCCESS CRITERIA:
- Frontend container builds and runs successfully
- Frontend connects to backend service container
- All pages (Login, Register, Home) render properly
- Authentication functionality works correctly (register, login)
- Protected routes work as expected
- JWT tokens are stored and used properly
- State management works correctly
- Development happens entirely within containers (no local Node.js required)
- Environment variables are properly configured for API communication
- Nginx successfully serves the built React application