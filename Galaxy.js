import { Renderer, Program, Mesh, Geometry, Transform } from "ogl";

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      
      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);
  
  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

export default class Galaxy {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = {
      focal: [0.5, 0.5],
      rotation: [1.0, 0.0],
      starSpeed: 0.5,
      density: 1,
      hueShift: 140,
      disableAnimation: false,
      speed: 1.0,
      mouseInteraction: true,
      glowIntensity: 1.2,
      saturation: 0.0,
      mouseRepulsion: true,
      repulsionStrength: 2,
      twinkleIntensity: 0.3,
      rotationSpeed: 0.1,
      autoCenterRepulsion: 0,
      transparent: true,
      ...options
    };

    this.targetMousePos = { x: 0.5, y: 0.5 };
    this.smoothMousePos = { x: 0.5, y: 0.5 };
    this.targetMouseActive = 0.0;
    this.smoothMouseActive = 0.0;
    this.startTime = Date.now();
    
    // Performance optimization properties
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.performanceMode = false;
    this.frameSkipCounter = 0;
    this.targetFPS = 60;
    this.lastFrameTime = 0;
    this.frameInterval = 1000 / this.targetFPS;
    
    // Adaptive quality settings
    this.qualitySettings = {
      high: { density: this.options.density, layers: 4, skipFrames: 0 },
      medium: { density: this.options.density * 0.7, layers: 3, skipFrames: 1 },
      low: { density: this.options.density * 0.5, layers: 2, skipFrames: 2 }
    };
    this.currentQuality = 'high';

    this.init();
  }

  init() {
    // Create renderer
    this.renderer = new Renderer({
      canvas: this.canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: this.options.transparent,
      premultipliedAlpha: false
    });

    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);

    // Create geometry (fullscreen quad)
    const geometry = new Geometry(this.gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) }
    });

    // Create program with shaders
    this.program = new Program(this.gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [window.innerWidth, window.innerHeight, 1] },
        uFocal: { value: this.options.focal },
        uRotation: { value: this.options.rotation },
        uStarSpeed: { value: this.options.starSpeed },
        uDensity: { value: this.options.density },
        uHueShift: { value: this.options.hueShift },
        uSpeed: { value: this.options.speed },
        uMouse: { value: [0.5, 0.5] },
        uGlowIntensity: { value: this.options.glowIntensity },
        uSaturation: { value: this.options.saturation },
        uMouseRepulsion: { value: this.options.mouseRepulsion },
        uTwinkleIntensity: { value: this.options.twinkleIntensity },
        uRotationSpeed: { value: this.options.rotationSpeed },
        uRepulsionStrength: { value: this.options.repulsionStrength },
        uMouseActiveFactor: { value: 0 },
        uAutoCenterRepulsion: { value: this.options.autoCenterRepulsion },
        uTransparent: { value: this.options.transparent }
      }
    });

    // Create scene and mesh
    this.scene = new Transform();
    this.mesh = new Mesh(this.gl, { geometry, program: this.program });
    this.mesh.setParent(this.scene);

    // Setup event listeners
    this.setupEventListeners();

    // Start render loop
    this.render();
  }

  setupEventListeners() {
    // Mouse movement with throttling
    if (this.options.mouseInteraction) {
      let mouseTicking = false;
      
      const handleMouseMove = (e) => {
        if (!mouseTicking) {
          requestAnimationFrame(() => {
            const rect = this.canvas.getBoundingClientRect();
            this.targetMousePos.x = (e.clientX - rect.left) / rect.width;
            this.targetMousePos.y = 1.0 - (e.clientY - rect.top) / rect.height;
            this.targetMouseActive = 1.0;
            mouseTicking = false;
          });
          mouseTicking = true;
        }
      };

      const handleMouseLeave = () => {
        this.targetMouseActive = 0.0;
      };

      this.canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
      this.canvas.addEventListener('mouseleave', handleMouseLeave, { passive: true });
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // Resize with throttling
    let resizeTicking = false;
    const handleResize = () => {
      if (!resizeTicking) {
        requestAnimationFrame(() => {
          this.renderer.setSize(window.innerWidth, window.innerHeight);
          this.program.uniforms.uResolution.value = [window.innerWidth, window.innerHeight, 1];
          resizeTicking = false;
        });
        resizeTicking = true;
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
  }

  render() {
    if (!this.options.disableAnimation) {
      requestAnimationFrame(() => this.render());
    }

    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    
    // Adaptive frame rate limiting
    if (deltaTime < this.frameInterval) {
      return; // Skip frame to maintain target FPS
    }
    
    // Frame skipping for performance optimization
    const currentSettings = this.qualitySettings[this.currentQuality];
    if (currentSettings.skipFrames > 0) {
      this.frameSkipCounter++;
      if (this.frameSkipCounter <= currentSettings.skipFrames) {
        return; // Skip this frame
      }
      this.frameSkipCounter = 0;
    }
    
    this.lastFrameTime = now;
    const currentTime = (Date.now() - this.startTime) / 1000;

    // Smooth mouse interpolation with adaptive responsiveness
    const lerpFactor = this.isScrolling ? 0.04 : 0.08; // Slower during scrolling
    this.smoothMousePos.x += (this.targetMousePos.x - this.smoothMousePos.x) * lerpFactor;
    this.smoothMousePos.y += (this.targetMousePos.y - this.smoothMousePos.y) * lerpFactor;
    this.smoothMouseActive += (this.targetMouseActive - this.smoothMouseActive) * lerpFactor;

    // Update uniforms with performance considerations
    this.program.uniforms.uTime.value = currentTime;
    this.program.uniforms.uMouse.value = [this.smoothMousePos.x, this.smoothMousePos.y];
    this.program.uniforms.uMouseActiveFactor.value = this.smoothMouseActive;
    
    // Update density based on current quality
    this.program.uniforms.uDensity.value = currentSettings.density;

    // Render
    this.renderer.render({ scene: this.scene });
  }

  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    
    // Update uniforms
    Object.keys(newOptions).forEach(key => {
      const uniformKey = 'u' + key.charAt(0).toUpperCase() + key.slice(1);
      if (this.program.uniforms[uniformKey]) {
        this.program.uniforms[uniformKey].value = newOptions[key];
      }
    });
  }
  
  // Performance optimization methods
  setScrolling(isScrolling) {
    this.isScrolling = isScrolling;
    
    // Clear existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    if (isScrolling) {
      // Switch to medium quality during scrolling
      this.setQuality('medium');
    } else {
      // Return to high quality after scrolling stops
      this.scrollTimeout = setTimeout(() => {
        this.setQuality('high');
        this.isScrolling = false;
      }, 150);
    }
  }
  
  setQuality(quality) {
    if (this.qualitySettings[quality] && this.currentQuality !== quality) {
      this.currentQuality = quality;
      const settings = this.qualitySettings[quality];
      
      // Update frame rate based on quality
      switch (quality) {
        case 'low':
          this.targetFPS = 30;
          break;
        case 'medium':
          this.targetFPS = 45;
          break;
        case 'high':
        default:
          this.targetFPS = 60;
          break;
      }
      
      this.frameInterval = 1000 / this.targetFPS;
    }
  }
  
  // Performance monitoring
  enablePerformanceMode() {
    this.performanceMode = true;
    this.setQuality('low');
  }
  
  disablePerformanceMode() {
    this.performanceMode = false;
    this.setQuality('high');
  }

  destroy() {
    // Clear timeouts
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    // Clean up resources
    if (this.mesh) {
      this.mesh.geometry.remove();
    }
    if (this.program) {
      this.program.remove();
    }
  }
}

// Initialize galaxy when DOM is loaded
function initGalaxy() {
  const canvas = document.getElementById('galaxy-canvas');
  if (canvas) {
    const galaxy = new Galaxy(canvas, {
      hueShift: 140,
      density: 2.5,
      glowIntensity: 0.8,
      twinkleIntensity: 0.6,
      rotationSpeed: 0.1,
      transparent: false,
      speed: 1.2,
      saturation: 1.0,
      starSpeed: 1.0,
      repulsionStrength: 1.5
    });
    
    // Make galaxy globally accessible for debugging
    window.galaxy = galaxy;
  }
}

// Auto-initialize when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGalaxy);
} else {
  initGalaxy();
}