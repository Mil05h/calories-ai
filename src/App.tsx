import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Home } from './views/Home'
import { getAPI } from './api'

const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => {
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
        Component: Home
      };
    }
  },
  {
    path: "/user/:userId",
    lazy: async () => {
      const { User } = await import('./views/User');
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
        Component: User
      };
    }
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
