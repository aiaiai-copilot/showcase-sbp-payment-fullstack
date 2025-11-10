import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is on a mobile device.
 *
 * Combines screen size detection (max-width: 768px) with touch capability
 * to provide accurate mobile device detection.
 *
 * @returns {boolean} true if user is on a mobile device, false otherwise
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Check screen size using matchMedia
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    // Check for touch capability
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Function to update mobile state
    const updateIsMobile = () => {
      // Consider device mobile if screen is small OR it has touch capability with small-ish screen
      const isSmallScreen = mediaQuery.matches;
      const isTouchDevice = hasTouchScreen && window.matchMedia('(max-width: 1024px)').matches;

      setIsMobile(isSmallScreen || isTouchDevice);
    };

    // Set initial value
    updateIsMobile();

    // Listen for screen size changes
    const handleChange = () => {
      updateIsMobile();
    };

    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isMobile;
}
