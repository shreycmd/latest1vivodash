import { useState, useEffect } from 'react';

const useSessionStorage = (key) => {
  const [value, setValue] = useState(() => sessionStorage.getItem(key));

  useEffect(() => {
    const handleStorageChange = () => {
      setValue(sessionStorage.getItem(key));
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [value, setValue];
};

export default useSessionStorage;
