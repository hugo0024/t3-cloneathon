// Performance utilities for cross-browser optimization

// Detect if user prefers reduced motion
export const prefersReducedMotion = 
  typeof window !== 'undefined' && 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Performance monitoring for animations
export const performanceConfig = {
  // Disable complex animations on slower devices
  enableComplexAnimations: typeof window !== 'undefined' && 
    window.navigator.hardwareConcurrency > 4,
  
  // Reduce animation frequency on mobile/slower devices
  animationThrottle: typeof window !== 'undefined' && 
    /Mobi|Android/i.test(navigator.userAgent) ? 2 : 1,
};

// Simplified animation variants for performance
export const simpleVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Helper to conditionally disable animations
export const conditionalAnimation = (animation: any) => {
  if (prefersReducedMotion) {
    return simpleVariants;
  }
  return animation;
};

// Performance-optimized transition configs
export const transitions = {
  fast: { duration: 0.15, ease: 'easeOut' },
  normal: { duration: 0.2, ease: 'easeOut' },
  slow: { duration: 0.3, ease: 'easeOut' },
  spring: { type: 'spring', damping: 25, stiffness: 300 },
};

// CSS class helpers for Firefox fallbacks
export const getAnimationClass = (animationType: string) => {
  const isFirefox = typeof navigator !== 'undefined' && 
    navigator.userAgent.toLowerCase().includes('firefox');
  
  if (isFirefox) {
    switch (animationType) {
      case 'fadeIn': return 'animate-fade-in';
      case 'slideUp': return 'animate-slide-up';
      case 'pulse': return 'animate-pulse-slow';
      default: return '';
    }
  }
  return ''; // Use Framer Motion for other browsers
}; 