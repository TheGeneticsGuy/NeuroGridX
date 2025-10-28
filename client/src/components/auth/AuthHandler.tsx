import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

const AuthHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setToken } = useAuthStore();

  useEffect(() => {
    // This object is from the browser's location
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      setToken(token);
      // Navigate cleans token from URL security and the replace:true prevents it from being in browser history - BEST PRACTICES :)
      navigate('/', { replace: true });
    }
  }, [location, navigate, setToken]);

  // This isn't rendering anything, just running logic, so no need to return anything.
  return null;
};

export default AuthHandler;