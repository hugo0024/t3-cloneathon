// Animation configuration for better cross-browser performance
export const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('firefox');

// Reduce animation complexity for Firefox
export const animationConfig = {
  // Reduced durations for Firefox
  duration: {
    fast: isFirefox ? 0.15 : 0.2,
    normal: isFirefox ? 0.2 : 0.3,
    slow: isFirefox ? 0.3 : 0.5,
  },
  
  // Simplified easing for Firefox
  ease: isFirefox ? 'easeOut' : 'easeInOut',
  
  // Reduced scale changes for Firefox
  scale: {
    hover: isFirefox ? 1.01 : 1.02,
    tap: isFirefox ? 0.99 : 0.98,
  },
  
  // Simplified initial states for Firefox
  getInitial: (complex = true) => {
    if (isFirefox) {
      return { opacity: 0, y: 5 }; // Simple fade + slight slide
    }
    return complex ? { opacity: 0, y: 20, x: -10 } : { opacity: 0, y: 10 };
  },
  
  // Simplified animate states
  getAnimate: () => ({ opacity: 1, y: 0, x: 0 }),
  
  // Simplified exit states
  getExit: () => {
    if (isFirefox) {
      return { opacity: 0, y: -5 };
    }
    return { opacity: 0, y: -10 };
  },
  
  // Stagger delays - reduced for Firefox
  getStaggerDelay: (index: number) => {
    const baseDelay = isFirefox ? 0.02 : 0.05;
    const maxDelay = isFirefox ? 0.2 : 0.3;
    return Math.min(baseDelay * index, maxDelay);
  },
};

// Framer Motion configuration for better performance
export const motionConfig = {
  // Disable layout animations in Firefox
  layout: !isFirefox,
  
  // Reduce precision for Firefox
  transition: {
    type: 'tween',
    ease: animationConfig.ease,
    duration: animationConfig.duration.normal,
  },
  
  // Optimized hover states
  whileHover: {
    scale: animationConfig.scale.hover,
    transition: { duration: animationConfig.duration.fast },
  },
  
  whileTap: {
    scale: animationConfig.scale.tap,
    transition: { duration: animationConfig.duration.fast },
  },
};

// CSS-in-JS animation helpers
export const cssAnimations = {
  // Use CSS transforms instead of JS for simple animations in Firefox
  fadeIn: isFirefox ? 'animate-fade-in' : undefined,
  slideUp: isFirefox ? 'animate-slide-up' : undefined,
  pulse: isFirefox ? 'animate-pulse-slow' : 'animate-pulse',
}; 