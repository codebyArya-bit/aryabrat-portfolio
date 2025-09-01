class ElectricBorder {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      color: options.color || '#5227FF',
      speed: options.speed || 1,
      chaos: options.chaos || 1,
      thickness: options.thickness || 2,
      ...options
    };
    
    this.filterId = `turbulent-displace-${Math.random().toString(36).substr(2, 9)}`;
    this.svg = null;
    this.resizeObserver = null;
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.originalSpeed = this.options.speed;
    this.originalChaos = this.options.chaos;
    
    this.init();
    this.setupScrollOptimization();
  }
  
  init() {
    // Add CSS class and custom properties
    this.element.classList.add('electric-border');
    this.element.style.setProperty('--electric-border-color', this.options.color);
    this.element.style.setProperty('--eb-border-width', `${this.options.thickness}px`);
    
    // Create the new structure
    this.createStructure();
    
    // Create SVG element
    this.createSVG();
    
    // Setup resize observer
    this.setupResizeObserver();
    
    // Initial animation update
    this.updateAnimation();
  }
  
  createStructure() {
    // Wrap existing content in eb-content
    const content = document.createElement('div');
    content.classList.add('eb-content');
    
    // Move all existing children to content wrapper
    while (this.element.firstChild) {
      content.appendChild(this.element.firstChild);
    }
    
    // Create layers container
    const layers = document.createElement('div');
    layers.classList.add('eb-layers');
    
    // Create layer elements
    const stroke = document.createElement('div');
    stroke.classList.add('eb-stroke');
    
    const glow1 = document.createElement('div');
    glow1.classList.add('eb-glow-1');
    
    const glow2 = document.createElement('div');
    glow2.classList.add('eb-glow-2');
    
    const backgroundGlow = document.createElement('div');
    backgroundGlow.classList.add('eb-background-glow');
    
    // Apply filter to stroke element
    stroke.style.filter = `url(#${this.filterId})`;
    
    // Append layers
    layers.appendChild(stroke);
    layers.appendChild(glow1);
    layers.appendChild(glow2);
    layers.appendChild(backgroundGlow);
    
    // Append to element
    this.element.appendChild(content);
    this.element.appendChild(layers);
  }
  
  createSVG() {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.classList.add('eb-svg');
    this.svg.setAttribute('aria-hidden', 'true');
    this.svg.setAttribute('focusable', 'false');
    
    // Create filter definition
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', this.filterId);
    filter.setAttribute('colorInterpolationFilters', 'sRGB');
    filter.setAttribute('x', '-20%');
    filter.setAttribute('y', '-20%');
    filter.setAttribute('width', '140%');
    filter.setAttribute('height', '140%');
    
    // Create optimized filter elements with reduced complexity
    filter.innerHTML = `
      <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="4" result="noise1" seed="1" />
      <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
        <animate attributeName="dy" values="700; 0" dur="8s" repeatCount="indefinite" calcMode="linear" />
      </feOffset>
      
      <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="4" result="noise2" seed="2" />
      <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
        <animate attributeName="dx" values="490; 0" dur="8s" repeatCount="indefinite" calcMode="linear" />
      </feOffset>
      
      <feComposite in="offsetNoise1" in2="offsetNoise2" result="combinedNoise" />
      <feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="20" xChannelSelector="R" yChannelSelector="G" />
    `;
    
    defs.appendChild(filter);
    this.svg.appendChild(defs);
    
    // Insert SVG as first child of the element (before layers)
    this.element.insertBefore(this.svg, this.element.firstChild);
  }
  
  updateAnimation() {
    if (!this.svg || !this.element) return;
    
    const rect = this.element.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    
    // Update optimized animations
    const dyAnim = this.svg.querySelector('feOffset > animate[attributeName="dy"]');
    if (dyAnim) {
      dyAnim.setAttribute('values', `${height}; 0`);
    }
    
    const dxAnim = this.svg.querySelector('feOffset > animate[attributeName="dx"]');
    if (dxAnim) {
      dxAnim.setAttribute('values', `${width}; 0`);
    }
    
    // Update duration based on speed with performance optimization
    const baseDur = 8; // Slower base duration for better performance
    const dur = Math.max(2, baseDur / (this.options.speed || 1)); // Minimum 2s duration
    const allAnims = [dyAnim, dxAnim].filter(Boolean);
    allAnims.forEach(anim => {
      anim.setAttribute('dur', `${dur}s`);
    });
    
    // Update displacement scale based on chaos (reduced for performance)
    const disp = this.svg.querySelector('feDisplacementMap');
    if (disp) {
      disp.setAttribute('scale', String(Math.min(20, 15 * (this.options.chaos || 1))));
    }
    
    // Update filter bounds (optimized)
    const filterEl = this.svg.querySelector(`#${this.filterId}`);
    if (filterEl) {
      filterEl.setAttribute('x', '-100%');
      filterEl.setAttribute('y', '-100%');
      filterEl.setAttribute('width', '300%');
      filterEl.setAttribute('height', '300%');
    }
    
    // Restart optimized animations
    requestAnimationFrame(() => {
      allAnims.forEach(anim => {
        try {
          if (typeof anim.beginElement === 'function') {
            anim.beginElement();
          }
        } catch (e) {
          console.warn('ElectricBorder: beginElement failed, this may be due to a browser limitation.');
        }
      });
    });
  }
  
  setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateAnimation();
      });
      this.resizeObserver.observe(this.element);
    }
  }
  
  setupScrollOptimization() {
    // Listen for scroll events to optimize performance
    const handleScroll = () => {
      if (!this.isScrolling) {
        this.isScrolling = true;
        // Reduce animation complexity during scrolling
        this.options.speed = this.originalSpeed * 0.3; // Slower animations
        this.options.chaos = this.originalChaos * 0.5; // Less chaos
        this.updateAnimation();
      }
      
      // Clear existing timeout
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      
      // Reset to normal after scrolling stops
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
        this.options.speed = this.originalSpeed;
        this.options.chaos = this.originalChaos;
        this.updateAnimation();
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.element.style.setProperty('--electric-border-color', this.options.color);
    this.element.style.setProperty('--eb-border-width', `${this.options.thickness}px`);
    this.updateAnimation();
  }
  
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.svg) {
      this.svg.remove();
    }
    
    // Clean up scroll optimization
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    // Remove the structure elements
    const layers = this.element.querySelector('.eb-layers');
    const content = this.element.querySelector('.eb-content');
    
    if (layers) {
      layers.remove();
    }
    
    if (content) {
      // Move content back to original element
      while (content.firstChild) {
        this.element.appendChild(content.firstChild);
      }
      content.remove();
    }
    
    this.element.classList.remove('electric-border');
  }
}

// Helper function to create electric border on elements
function createElectricBorder(selector, options = {}) {
  const elements = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
  const instances = [];
  
  elements.forEach(element => {
    if (element instanceof HTMLElement) {
      instances.push(new ElectricBorder(element, options));
    }
  });
  
  return instances.length === 1 ? instances[0] : instances;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ElectricBorder, createElectricBorder };
} else if (typeof window !== 'undefined') {
  window.ElectricBorder = ElectricBorder;
  window.createElectricBorder = createElectricBorder;
}