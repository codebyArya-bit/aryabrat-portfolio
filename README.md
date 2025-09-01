# 🌌 Aryabrat Mishra - Interactive 3D Portfolio

A stunning, performance-optimized 3D portfolio website featuring interactive galaxy backgrounds, particle systems, and modern web technologies.

## 🚀 Live Demo

**🌐 GitHub Pages**: [https://codebyarya-bit.github.io/aryabrat-portfolio/](https://codebyarya-bit.github.io/aryabrat-portfolio/)

## ✨ Features

### 🎨 Visual Effects
- **Interactive Galaxy Background** - Dynamic 3D galaxy with spiral arms and black hole effects
- **Particle Systems** - Optimized particle animations with WebGL rendering
- **Electric Borders** - Animated electric border effects on UI elements
- **Shiny Text Effects** - Gradient text animations with shimmer effects
- **Split Text Animations** - Character-by-character text reveal animations

### 🛠️ Technical Features
- **3D Graphics** - Three.js powered 3D scenes and animations
- **WebGL Optimization** - Hardware-accelerated rendering for smooth performance
- **Responsive Design** - Mobile-first approach with cross-device compatibility
- **Performance Monitoring** - Built-in FPS and memory usage tracking
- **Browser Compatibility** - ES Module Shims for universal import map support

### 📱 User Experience
- **Smooth Scrolling** - Optimized scroll performance with throttling
- **Interactive Elements** - Mouse-responsive animations and hover effects
- **Loading Optimization** - Resource preloading and lazy loading strategies
- **Accessibility** - Keyboard navigation and screen reader support

## 🏗️ Architecture

### Core Technologies
- **HTML5** - Semantic markup with modern web standards
- **CSS3** - Advanced animations, transforms, and responsive layouts
- **JavaScript ES6+** - Modern JavaScript with modules and async/await
- **Three.js** - 3D graphics and WebGL rendering
- **OGL Library** - Lightweight WebGL framework for galaxy effects

### File Structure
```
├── index.html              # Main HTML file with optimized loading
├── Galaxy.js               # Galaxy background animation system
├── Galaxy.css              # Galaxy-specific styling
├── ElectricBorder.js       # Electric border effect component
├── ElectricBorder.css      # Electric border styling
├── ShinyText.js            # Text shimmer animation system
├── ShinyText.css           # Shiny text effects styling
├── SplitText.js            # Text splitting animation utility
├── SplitText.css           # Split text animation styles
├── particle-worker.js      # Web Worker for particle calculations
├── package.json            # Project dependencies and scripts
└── assets/                 # Images, PDFs, and media files
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser with ES6+ support
- Git for version control

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/codebyArya-bit/aryabrat-portfolio.git
   cd aryabrat-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start local server**
   ```bash
   npx serve . -p 5500
   ```

4. **Open in browser**
   ```
   http://localhost:5500
   ```

## 🚀 Deployment

### GitHub Pages Deployment

This project is automatically deployed to GitHub Pages from the `main` branch.

**Deployment Process:**
1. Push changes to the `main` branch
2. GitHub Actions automatically builds and deploys
3. Site is available at: `https://codebyarya-bit.github.io/aryabrat-portfolio/`

### Manual Deployment Steps

1. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Select "Deploy from a branch"
   - Choose `main` branch and `/ (root)` folder

2. **Push your changes**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

## ⚡ Performance Optimizations

### Implemented Optimizations

1. **Particle System Optimization**
   - Reduced particle count from 800 to 300
   - Optimized rendering loops and calculations
   - Implemented object pooling for particles

2. **Animation Throttling**
   - Mouse events throttled to 33ms intervals
   - Scroll events optimized with 16-25ms delays
   - RequestAnimationFrame optimization

3. **Resource Loading**
   - Preconnect to external CDNs
   - DNS prefetching for faster resource loading
   - Lazy loading for non-critical assets

4. **CSS Performance**
   - Reduced backdrop-filter blur values (2-8px)
   - GPU-accelerated transforms
   - Optimized animation timing functions

5. **Memory Management**
   - Efficient cleanup of WebGL contexts
   - Garbage collection optimization
   - Memory usage monitoring in development

## 🌐 Browser Compatibility

### Supported Browsers
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Compatibility Features
- **ES Module Shims** - Polyfill for import maps in older browsers
- **WebGL Fallbacks** - Graceful degradation for unsupported features
- **Progressive Enhancement** - Core functionality works without JavaScript

## 🛠️ Development Features

### Performance Monitoring
```javascript
// Built-in FPS monitoring (development only)
if (window.location.hostname === 'localhost') {
    // FPS counter and memory usage tracking
    // Performance bottleneck detection
}
```

### Debug Mode
- Console logging for development environment
- Performance metrics display
- Animation frame rate monitoring

## 📦 Dependencies

### Core Libraries
- **Three.js** (r128) - 3D graphics and WebGL
- **OGL** - Lightweight WebGL framework
- **GSAP** - High-performance animations
- **Font Awesome** - Icon library

### Development Tools
- **Serve** - Local development server
- **ES Module Shims** - Import maps polyfill

## 🎯 Key Implementation Details

### Galaxy Background System
- **GLSL Shaders** - Custom vertex and fragment shaders
- **Spiral Arms** - Mathematical spiral generation
- **Black Hole Effect** - Gravitational lensing simulation
- **Performance Scaling** - Adaptive quality based on device capabilities

### Particle System
- **Web Workers** - Offloaded calculations for smooth performance
- **Object Pooling** - Efficient memory management
- **Collision Detection** - Optimized spatial partitioning

### Animation Framework
- **GSAP Integration** - Professional-grade animations
- **Custom Easing** - Tailored animation curves
- **Timeline Management** - Coordinated animation sequences

## 🔍 Troubleshooting

### Common Issues

1. **Galaxy background not visible**
   - Ensure ES Module Shims polyfill is loaded
   - Check browser console for import errors
   - Verify WebGL support in browser

2. **Performance issues**
   - Reduce particle count in Galaxy.js
   - Disable debug mode in production
   - Check for memory leaks in browser dev tools

3. **Mobile compatibility**
   - Test on actual devices, not just browser dev tools
   - Verify touch event handling
   - Check viewport meta tag configuration

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Aryabrat Mishra**
- Portfolio: [https://codebyarya-bit.github.io/aryabrat-portfolio/](https://codebyarya-bit.github.io/aryabrat-portfolio/)
- GitHub: [@codebyArya-bit](https://github.com/codebyArya-bit)
- Email: jobsforarya2023@gmail.com

## 🙏 Acknowledgments

- Three.js community for excellent 3D graphics library
- OGL library for lightweight WebGL framework
- GSAP for professional animation tools
- GitHub Pages for free hosting

---

⭐ **Star this repository if you found it helpful!**