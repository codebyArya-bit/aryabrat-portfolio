// SplitText Animation Class for Vanilla JavaScript
class SplitTextAnimation {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            delay: options.delay || 100,
            duration: options.duration || 0.6,
            ease: options.ease || "power3.out",
            splitType: options.splitType || "chars",
            from: options.from || { opacity: 0, y: 40 },
            to: options.to || { opacity: 1, y: 0 },
            threshold: options.threshold || 0.1,
            rootMargin: options.rootMargin || "-100px",
            onComplete: options.onComplete || null,
            ...options
        };
        
        this.splitter = null;
        this.timeline = null;
        this.scrollTrigger = null;
        this.animationCompleted = false;
        
        this.init();
    }
    
    init() {
        if (!this.element || !this.element.textContent.trim()) {
            console.warn('SplitText: No element or text content found');
            return;
        }
        
        // Register GSAP plugins
        if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
            gsap.registerPlugin(ScrollTrigger);
        }
        
        this.setupSplitText();
    }
    
    setupSplitText() {
        const absoluteLines = this.options.splitType === "lines";
        if (absoluteLines) {
            this.element.style.position = "relative";
        }
        
        // Add split-parent class
        this.element.classList.add('split-parent');
        
        try {
            // Custom split text implementation since SplitText is a premium plugin
            this.splitter = this.createCustomSplitter();
        } catch (error) {
            console.error('Failed to create SplitText:', error);
            return;
        }
        
        this.getTargets();
        this.setupAnimation();
    }
    
    createCustomSplitter() {
        const text = this.element.textContent;
        const splitType = this.options.splitType;
        
        // Store original content
        const originalHTML = this.element.innerHTML;
        
        let elements = [];
        
        if (splitType === 'chars') {
            // Split by characters
            const chars = text.split('');
            this.element.innerHTML = '';
            
            chars.forEach((char, index) => {
                if (char === ' ') {
                    const space = document.createTextNode(' ');
                    this.element.appendChild(space);
                } else {
                    const span = document.createElement('span');
                    span.textContent = char;
                    span.style.display = 'inline-block';
                    span.classList.add('split-char', 'enhanced');
                    this.element.appendChild(span);
                    elements.push(span);
                }
            });
        } else if (splitType === 'words') {
            // Split by words
            const words = text.split(/\s+/);
            this.element.innerHTML = '';
            
            words.forEach((word, index) => {
                const span = document.createElement('span');
                span.textContent = word;
                span.style.display = 'inline-block';
                span.classList.add('split-word', 'enhanced');
                this.element.appendChild(span);
                elements.push(span);
                
                // Add space after word (except last)
                if (index < words.length - 1) {
                    const space = document.createTextNode(' ');
                    this.element.appendChild(space);
                }
            });
        } else if (splitType === 'lines') {
            // Simple line splitting (basic implementation)
            const words = text.split(' ');
            this.element.innerHTML = '';
            
            const line = document.createElement('div');
            line.classList.add('split-line');
            line.textContent = text;
            this.element.appendChild(line);
            elements.push(line);
        }
        
        return {
            chars: splitType === 'chars' ? elements : [],
            words: splitType === 'words' ? elements : [],
            lines: splitType === 'lines' ? elements : [],
            revert: () => {
                this.element.innerHTML = originalHTML;
            }
        };
    }
    
    getTargets() {
        switch (this.options.splitType) {
            case "lines":
                this.targets = this.splitter.lines;
                break;
            case "words":
                this.targets = this.splitter.words;
                break;
            case "chars":
                this.targets = this.splitter.chars;
                break;
            default:
                this.targets = this.splitter.chars;
        }
        
        if (!this.targets || this.targets.length === 0) {
            console.warn('No targets found for SplitText animation');
            this.destroy();
            return;
        }
        
        // Optimize for performance with batched operations
        if (this.targets.length > 50) {
            // For large text blocks, reduce animation complexity
            this.options.delay = Math.max(20, this.options.delay / 2);
            this.options.duration = Math.min(0.4, this.options.duration);
        }
        
        // Batch DOM operations
        requestAnimationFrame(() => {
            this.targets.forEach(target => {
                target.style.willChange = 'transform, opacity';
                target.style.backfaceVisibility = 'hidden';
            });
        });
    }
    
    setupAnimation() {
        const startPct = (1 - this.options.threshold) * 100;
        const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(this.options.rootMargin);
        const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
        const marginUnit = marginMatch ? (marginMatch[2] || "px") : "px";
        const sign = marginValue < 0 ? `-=${Math.abs(marginValue)}${marginUnit}` : `+=${marginValue}${marginUnit}`;
        const start = `top ${startPct}%${sign}`;
        
        // Batch DOM operations for better performance
        gsap.set(this.targets, {
            ...this.options.from,
            willChange: 'transform, opacity',
            force3D: true,
            immediateRender: false
        });
        
        this.timeline = gsap.timeline({
            scrollTrigger: {
                trigger: this.element,
                start: start,
                toggleActions: "play none none none",
                once: true,
                fastScrollEnd: true,
                preventOverlaps: true,
                onToggle: (self) => {
                    this.scrollTrigger = self;
                }
            },
            onComplete: () => {
                this.animationCompleted = true;
                // Batch cleanup operations
                requestAnimationFrame(() => {
                    gsap.set(this.targets, {
                        ...this.options.to,
                        clearProps: "willChange",
                        immediateRender: true
                    });
                });
                if (this.options.onComplete) {
                    this.options.onComplete();
                }
            }
        });
        
        // Highly optimized animation with adaptive stagger
        const maxStagger = this.targets.length > 100 ? 0.02 : 0.03; // Reduce stagger for large texts
        const optimizedStagger = Math.min(this.options.delay / 1000, maxStagger);
        const maxDuration = this.targets.length > 50 ? 0.3 : this.options.duration;
        
        this.timeline.to(this.targets, {
            ...this.options.to,
            duration: maxDuration,
            ease: this.options.ease,
            stagger: {
                amount: Math.min(optimizedStagger * this.targets.length, 1.5), // Cap total stagger time
                from: "start"
            },
            force3D: true,
            lazy: false // Disable lazy rendering for better performance
        });
    }
    
    destroy() {
        if (this.timeline) {
            this.timeline.kill();
            this.timeline = null;
        }
        
        if (this.scrollTrigger) {
            this.scrollTrigger.kill();
            this.scrollTrigger = null;
        }
        
        if (this.targets) {
            gsap.killTweensOf(this.targets);
        }
        
        if (this.splitter) {
            this.splitter.revert();
            this.splitter = null;
        }
        
        if (this.element) {
            this.element.classList.remove('split-parent');
        }
    }
    
    // Static method to initialize multiple elements
    static initAll(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        const instances = [];
        
        elements.forEach(element => {
            const instance = new SplitTextAnimation(element, options);
            instances.push(instance);
        });
        
        return instances;
    }
}

// Auto-initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize split text animations for elements with data-split-text attribute
    const splitTextElements = document.querySelectorAll('[data-split-text]');
    
    splitTextElements.forEach(element => {
        const options = {};
        
        // Parse options from data attributes
        if (element.dataset.splitType) options.splitType = element.dataset.splitType;
        if (element.dataset.delay) options.delay = parseInt(element.dataset.delay);
        if (element.dataset.duration) options.duration = parseFloat(element.dataset.duration);
        if (element.dataset.ease) options.ease = element.dataset.ease;
        if (element.dataset.threshold) options.threshold = parseFloat(element.dataset.threshold);
        if (element.dataset.rootMargin) options.rootMargin = element.dataset.rootMargin;
        
        new SplitTextAnimation(element, options);
    });
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.SplitTextAnimation = SplitTextAnimation;
}