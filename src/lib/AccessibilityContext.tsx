import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  screenReaderOptimized: boolean;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setHighContrast: (val: boolean) => void;
  setScreenReaderOptimized: (val: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  fontSize: 'medium',
  highContrast: false,
  screenReaderOptimized: false,
  setFontSize: () => {},
  setHighContrast: () => {},
  setScreenReaderOptimized: () => {},
});

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => {
    return (localStorage.getItem('naija_safety_font_size') as any) || 'medium';
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('naija_safety_high_contrast') === 'true';
  });
  const [screenReaderOptimized, setScreenReaderOptimized] = useState(() => {
    return localStorage.getItem('naija_safety_screen_reader') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('naija_safety_font_size', fontSize);
    localStorage.setItem('naija_safety_high_contrast', String(highContrast));
    localStorage.setItem('naija_safety_screen_reader', String(screenReaderOptimized));

    // Apply classes to body
    const body = document.body;
    body.classList.remove('text-sm', 'text-base', 'text-lg');
    if (fontSize === 'small') body.classList.add('text-sm');
    if (fontSize === 'medium') body.classList.add('text-base');
    if (fontSize === 'large') body.classList.add('text-lg');

    if (highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
  }, [fontSize, highContrast, screenReaderOptimized]);

  return (
    <AccessibilityContext.Provider value={{ 
      fontSize, 
      highContrast, 
      screenReaderOptimized,
      setFontSize,
      setHighContrast,
      setScreenReaderOptimized
    }}>
      <div className={`${highContrast ? 'contrast-200 grayscale' : ''}`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
