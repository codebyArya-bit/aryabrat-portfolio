// Web Worker for particle system calculations
class ParticleWorker {
    constructor() {
        this.particles = [];
        this.stars = [];
        this.time = 0;
        this.frameCount = 0;
        this.lastUpdateTime = 0;
        // Pre-calculate constants for better performance
        this.PI2 = Math.PI * 2;
        this.HALF_PI = Math.PI * 0.5;
        // Cache for trigonometric calculations
        this.sinCache = new Float32Array(360);
        this.cosCache = new Float32Array(360);
        for (let i = 0; i < 360; i++) {
            const rad = (i * Math.PI) / 180;
            this.sinCache[i] = Math.sin(rad);
            this.cosCache[i] = Math.cos(rad);
        }
    }
    
    initParticles(count, bounds) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * bounds.width - bounds.width / 2,
                y: Math.random() * bounds.height - bounds.height / 2,
                z: Math.random() * bounds.depth - bounds.depth / 2,
                vx: (Math.random() - 0.5) * 0.02,
                vy: (Math.random() - 0.5) * 0.02,
                vz: (Math.random() - 0.5) * 0.02,
                originalX: 0,
                originalY: 0,
                originalZ: 0
            });
            
            // Store original positions
            this.particles[i].originalX = this.particles[i].x;
            this.particles[i].originalY = this.particles[i].y;
            this.particles[i].originalZ = this.particles[i].z;
        }
    }
    
    initStars(count, bounds) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * bounds.width - bounds.width / 2,
                y: Math.random() * bounds.height - bounds.height / 2,
                z: Math.random() * bounds.depth - bounds.depth / 2,
                originalX: 0,
                originalY: 0,
                originalZ: 0,
                vibrationSpeed: Math.random() * 0.02 + 0.01,
                vibrationAmplitude: Math.random() * 0.3 + 0.1,
                rotationSpeed: Math.random() * 0.01 + 0.005,
                pulseSpeed: Math.random() * 0.02 + 0.01,
                mouseInfluence: Math.random() * 0.5 + 0.2,
                rotation: { x: 0, y: 0, z: 0 },
                scale: 1
            });
            
            // Store original positions
            this.stars[i].originalX = this.stars[i].x;
            this.stars[i].originalY = this.stars[i].y;
            this.stars[i].originalZ = this.stars[i].z;
        }
    }
    
    updateParticles(mouseX, mouseY, deltaTime) {
        this.time += deltaTime;
        this.frameCount++;
        const results = [];
        
        // Batch process particles for better performance
        const batchSize = Math.ceil(this.particles.length / 4);
        const currentBatch = this.frameCount % 4;
        const startIdx = currentBatch * batchSize;
        const endIdx = Math.min(startIdx + batchSize, this.particles.length);
        
        // Only update a subset of particles each frame
        for (let i = startIdx; i < endIdx; i++) {
            const particle = this.particles[i];
            
            // Update position with optimized velocity
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.z += particle.vz;
            
            // Optimized boundary wrapping using bitwise operations
            if (particle.x > 50) particle.x = -50;
            else if (particle.x < -50) particle.x = 50;
            if (particle.y > 50) particle.y = -50;
            else if (particle.y < -50) particle.y = 50;
            if (particle.z > 50) particle.z = -50;
            else if (particle.z < -50) particle.z = 50;
            
            results.push({
                index: i,
                x: particle.x,
                y: particle.y,
                z: particle.z
            });
        }
        
        // Update all particles every 4th frame for full update
        if (this.frameCount % 4 === 0) {
            for (let i = 0; i < this.particles.length; i++) {
                if (i < startIdx || i >= endIdx) {
                    const particle = this.particles[i];
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.z += particle.vz;
                    
                    if (particle.x > 50) particle.x = -50;
                    else if (particle.x < -50) particle.x = 50;
                    if (particle.y > 50) particle.y = -50;
                    else if (particle.y < -50) particle.y = 50;
                    if (particle.z > 50) particle.z = -50;
                    else if (particle.z < -50) particle.z = 50;
                }
            }
        }
        
        return results;
    }
    
    updateStars(mouseX, mouseY, deltaTime) {
        this.time += deltaTime;
        const results = [];
        
        // Pre-calculate normalized mouse coordinates
        const normalizedMouseX = (mouseX / (typeof window !== 'undefined' ? window.innerWidth : 1920)) * 2 - 1;
        const normalizedMouseY = -(mouseY / (typeof window !== 'undefined' ? window.innerHeight : 1080)) * 2 + 1;
        const mouseX15 = normalizedMouseX * 15;
        const mouseY15 = normalizedMouseY * 15;
        
        // Batch process stars for better performance
        const batchSize = Math.ceil(this.stars.length / 3);
        const currentBatch = this.frameCount % 3;
        const startIdx = currentBatch * batchSize;
        const endIdx = Math.min(startIdx + batchSize, this.stars.length);
        
        // Pre-calculate time-based values
        const timeVibration = this.time * 0.01;
        const timeVibrationSin = this.getCachedSin(timeVibration * 57.2958); // Convert to degrees
        const timeVibrationCos = this.getCachedCos(timeVibration * 57.2958);
        
        for (let i = startIdx; i < endIdx; i++) {
            const star = this.stars[i];
            
            // Optimized mouse distance calculation
            const dx = star.x - mouseX15;
            const dy = star.y - mouseY15;
            const distanceSq = dx * dx + dy * dy; // Use squared distance to avoid sqrt
            const influence = distanceSq < 144 ? Math.max(0, 1 - Math.sqrt(distanceSq) / 12) : 0;
            
            // Optimized vibration using cached trigonometric values
            const vibTimeX = (this.time * star.vibrationSpeed * 57.2958) % 360;
            const vibTimeY = (this.time * star.vibrationSpeed * 1.1 * 57.2958) % 360;
            const vibTimeZ = (this.time * star.vibrationSpeed * 0.9 * 57.2958) % 360;
            
            const vibrationX = this.getCachedSin(vibTimeX) * star.vibrationAmplitude;
            const vibrationY = this.getCachedCos(vibTimeY) * star.vibrationAmplitude;
            const vibrationZ = this.getCachedSin(vibTimeZ) * star.vibrationAmplitude * 0.5;
            
            // Mouse interaction with cached values
            const mouseOffsetX = influence * star.mouseInfluence * timeVibrationSin * 1.5;
            const mouseOffsetY = influence * star.mouseInfluence * timeVibrationCos * 1.5;
            
            // Update position
            star.x = star.originalX + vibrationX + mouseOffsetX;
            star.y = star.originalY + vibrationY + mouseOffsetY;
            star.z = star.originalZ + vibrationZ;
            
            // Update rotation with reduced frequency
            if (this.frameCount % 2 === 0) {
                star.rotation.x += star.rotationSpeed;
                star.rotation.y += star.rotationSpeed * 0.7;
                star.rotation.z += star.rotationSpeed * 0.3;
            }
            
            // Update scale using cached sin
            const pulseTime = (this.time * star.pulseSpeed * 57.2958) % 360;
            star.scale = 1 + this.getCachedSin(pulseTime) * 0.2;
            
            results.push({
                index: i,
                x: star.x,
                y: star.y,
                z: star.z,
                rotation: { ...star.rotation },
                scale: star.scale,
                opacity: 0.6 + influence * 0.4
            });
        }
        
        return results;
    }
    
    // Helper methods for cached trigonometric functions
    getCachedSin(degrees) {
        const index = Math.floor(Math.abs(degrees)) % 360;
        return degrees >= 0 ? this.sinCache[index] : -this.sinCache[index];
    }
    
    getCachedCos(degrees) {
        const index = Math.floor(Math.abs(degrees)) % 360;
        return this.cosCache[index];
    }
}

// Worker message handling
const worker = new ParticleWorker();

self.onmessage = function(e) {
    const { type, data } = e.data;
    
    switch (type) {
        case 'init-particles':
            worker.initParticles(data.count, data.bounds);
            self.postMessage({ type: 'particles-initialized' });
            break;
            
        case 'init-stars':
            worker.initStars(data.count, data.bounds);
            self.postMessage({ type: 'stars-initialized' });
            break;
            
        case 'update-particles':
            const particleResults = worker.updateParticles(data.mouseX, data.mouseY, data.deltaTime);
            self.postMessage({ type: 'particles-updated', data: particleResults });
            break;
            
        case 'update-stars':
            const starResults = worker.updateStars(data.mouseX, data.mouseY, data.deltaTime);
            self.postMessage({ type: 'stars-updated', data: starResults });
            break;
    }
};