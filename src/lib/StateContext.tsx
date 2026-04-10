import React, { createContext, useContext, useState, useEffect } from 'react';

interface StateContextType {
  selectedState: string;
  setSelectedState: (state: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const StateContext = createContext<StateContextType>({
  selectedState: 'Anambra',
  setSelectedState: () => {},
  language: 'English',
  setLanguage: () => {},
});

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedState, setSelectedState] = useState(() => {
    return localStorage.getItem('naija_safety_state') || 'Anambra';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('naija_safety_language') || 'English';
  });

  useEffect(() => {
    localStorage.setItem('naija_safety_state', selectedState);
  }, [selectedState]);

  useEffect(() => {
    localStorage.setItem('naija_safety_language', language);
  }, [language]);

  return (
    <StateContext.Provider value={{ selectedState, setSelectedState, language, setLanguage }}>
      {children}
    </StateContext.Provider>
  );
};

export const useGlobalState = () => useContext(StateContext);
