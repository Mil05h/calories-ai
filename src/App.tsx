import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { getAPI } from './api'

const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => {
      const { Login } = await import('./views/Login');
      return {
        loader: async () => {
          try {
            const api = await getAPI();
            if (!api) throw new Error('API not available');
            const userData = await api.requireUser();
            throw new Response('', {
              status: 302,
              headers: { Location: `/user/${userData.id}` },
            });
          } catch (err) {
            if (err instanceof Response && err.status === 302) {
              throw err;
            }
            return null;
          }
        },
        Component: Login
      };
    }
  },
  {
    path: "/user/:userId",
    lazy: async () => {
      const { Dashboard } = await import('./views/Dashboard');
      return {
        loader: async () => {
          const api = await getAPI();
          if (!api) throw new Error('API not available');
          try {
            const userData = await api.requireUser();
            return { user: userData };
          } catch (err) {
            console.error('Failed to load user:', err);
            throw new Response('', {
              status: 302,
              headers: { Location: '/' },
            });
          }
        },
        Component: Dashboard
      };
    }
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
