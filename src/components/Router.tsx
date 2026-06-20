import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read path and handle trailing slashes consistently (except for root '/')
  const getNormalizedPath = () => {
    const p = window.location.pathname;
    if (p.length > 1 && p.endsWith('/')) {
      return p.slice(0, -1);
    }
    return p;
  };

  const [path, setPath] = useState(getNormalizedPath());

  useEffect(() => {
    const handlePopState = () => {
      setPath(getNormalizedPath());
    };

    window.addEventListener('popstate', handlePopState);
    
    // Custom event to handle programmatically triggered navigate calls
    const handleLocationChange = () => {
      setPath(getNormalizedPath());
    };
    window.addEventListener('locationchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('locationchange', handleLocationChange);
    };
  }, []);

  const navigate = (to: string) => {
    // Normalize target path
    const normalizedTo = to.length > 1 && to.endsWith('/') ? to.slice(0, -1) : to;
    if (window.location.pathname !== normalizedTo) {
      window.history.pushState(null, '', normalizedTo);
      // Dispatch custom event to notify router context
      window.dispatchEvent(new Event('locationchange'));
    }
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

interface RouteProps {
  path: string;
  element: React.ReactNode;
}

export const Route: React.FC<RouteProps> = ({ path, element }) => {
  const router = useRouter();
  
  if (router.path === path) {
    return <>{element}</>;
  }
  return null;
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ to, children, ...props }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let meta key/control key clicks pass through to open new tab
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      return;
    }
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};
