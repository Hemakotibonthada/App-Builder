/**
 * Physics Engine
 * 
 * Provides spring-based, velocity-based, and inertia animations
 * for widget movements, snapping, and interactive drag experiences.
 * 
 * Features:
 * 1. Spring dynamics simulation
 * 2. Velocity tracking with decay
 * 3. Momentum-based scrolling
 * 4. Elastic boundaries
 * 5. Gravitational pull for snapping
 * 6. Friction and damping models
 * 7. Multi-body collision response
 * 8. Particle system for effects
 */

import { Point2D, Rect } from '@/types/canvas.types';

/** Mutable version of Point2D for physics simulation */
type MutablePoint = { x: number; y: number };

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export interface SpringConfig {
  readonly stiffness: number;
  readonly damping: number;
  readonly mass: number;
  readonly precision: number;
  readonly velocity: number;
  readonly clamp: boolean;
}

export interface VelocityState {
  readonly x: number;
  readonly y: number;
  readonly timestamp: number;
}

export interface PhysicsBody {
  readonly id: string;
  position: MutablePoint;
  velocity: MutablePoint;
  acceleration: MutablePoint;
  mass: number;
  friction: number;
  restitution: number;
  bounds: Rect;
  isStatic: boolean;
  isKinematic: boolean;
}

export interface Particle {
  id: string;
  position: MutablePoint;
  velocity: MutablePoint;
  acceleration: MutablePoint;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

export interface ParticleEmitterConfig {
  readonly position: Point2D;
  readonly rate: number;
  readonly maxParticles: number;
  readonly particleLife: [number, number];
  readonly speed: [number, number];
  readonly angle: [number, number];
  readonly size: [number, number];
  readonly colors: readonly string[];
  readonly gravity: Point2D;
  readonly fadeOut: boolean;
  readonly shrink: boolean;
}

export interface ForceField {
  readonly id: string;
  readonly type: 'gravity' | 'repulsion' | 'attraction' | 'wind' | 'vortex';
  readonly position: Point2D;
  readonly strength: number;
  readonly radius: number;
  readonly falloff: 'linear' | 'quadratic' | 'inverse-square';
}

export interface Constraint {
  readonly id: string;
  readonly type: 'distance' | 'spring' | 'pin' | 'hinge';
  readonly bodyA: string;
  readonly bodyB: string;
  readonly length: number;
  readonly stiffness: number;
  readonly damping: number;
}

/* ──────────────────────────────────────────────
 * Default Configs
 * ────────────────────────────────────────────── */

export const DEFAULT_SPRING: SpringConfig = {
  stiffness: 170,
  damping: 26,
  mass: 1,
  precision: 0.01,
  velocity: 0,
  clamp: false,
};

export const SPRING_PRESETS: Record<string, SpringConfig> = {
  default: DEFAULT_SPRING,
  gentle: { stiffness: 120, damping: 14, mass: 1, precision: 0.01, velocity: 0, clamp: false },
  wobbly: { stiffness: 180, damping: 12, mass: 1, precision: 0.01, velocity: 0, clamp: false },
  stiff: { stiffness: 210, damping: 20, mass: 1, precision: 0.01, velocity: 0, clamp: false },
  slow: { stiffness: 280, damping: 60, mass: 1, precision: 0.01, velocity: 0, clamp: false },
  molasses: { stiffness: 280, damping: 120, mass: 1, precision: 0.01, velocity: 0, clamp: false },
  snappy: { stiffness: 400, damping: 28, mass: 0.8, precision: 0.01, velocity: 0, clamp: false },
  bouncy: { stiffness: 600, damping: 10, mass: 1, precision: 0.01, velocity: 0, clamp: true },
  rubber: { stiffness: 100, damping: 8, mass: 2, precision: 0.01, velocity: 0, clamp: false },
};

/* ──────────────────────────────────────────────
 * Spring Simulation
 * ────────────────────────────────────────────── */

export class SpringSimulation {
  private position: number;
  private velocity: number;
  private target: number;
  private config: SpringConfig;
  private done: boolean = false;

  constructor(from: number, to: number, config: Partial<SpringConfig> = {}) {
    this.position = from;
    this.target = to;
    this.config = { ...DEFAULT_SPRING, ...config };
    this.velocity = this.config.velocity;
  }

  /**
   * Advances the simulation by dt seconds.
   * Uses a 4th-order Runge-Kutta integrator for accuracy.
   */
  step(dt: number): number {
    if (this.done) return this.target;

    const { stiffness, damping, mass, precision, clamp } = this.config;

    // RK4 integration for stability
    const k1v = this.computeAcceleration(this.position, this.velocity, stiffness, damping, mass);
    const k1x = this.velocity;

    const k2v = this.computeAcceleration(
      this.position + k1x * dt * 0.5,
      this.velocity + k1v * dt * 0.5,
      stiffness, damping, mass,
    );
    const k2x = this.velocity + k1v * dt * 0.5;

    const k3v = this.computeAcceleration(
      this.position + k2x * dt * 0.5,
      this.velocity + k2v * dt * 0.5,
      stiffness, damping, mass,
    );
    const k3x = this.velocity + k2v * dt * 0.5;

    const k4v = this.computeAcceleration(
      this.position + k3x * dt,
      this.velocity + k3v * dt,
      stiffness, damping, mass,
    );
    const k4x = this.velocity + k3v * dt;

    this.velocity += (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
    this.position += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);

    // Clamp if needed
    if (clamp) {
      const min = Math.min(this.position, this.target);
      const max = Math.max(this.position, this.target);
      if (this.position < min || this.position > max) {
        this.position = this.target;
        this.velocity = 0;
      }
    }

    // Check if spring is at rest
    const isAtRest =
      Math.abs(this.velocity) < precision &&
      Math.abs(this.position - this.target) < precision;

    if (isAtRest) {
      this.position = this.target;
      this.velocity = 0;
      this.done = true;
    }

    return this.position;
  }

  private computeAcceleration(
    position: number,
    velocity: number,
    stiffness: number,
    damping: number,
    mass: number,
  ): number {
    const displacement = position - this.target;
    const springForce = -stiffness * displacement;
    const dampingForce = -damping * velocity;
    return (springForce + dampingForce) / mass;
  }

  getValue(): number {
    return this.position;
  }

  getVelocity(): number {
    return this.velocity;
  }

  isDone(): boolean {
    return this.done;
  }

  setTarget(target: number): void {
    this.target = target;
    this.done = false;
  }

  reset(from: number, to: number): void {
    this.position = from;
    this.target = to;
    this.velocity = this.config.velocity;
    this.done = false;
  }
}

/* ──────────────────────────────────────────────
 * 2D Spring Animation
 * ────────────────────────────────────────────── */

export class Spring2D {
  private springX: SpringSimulation;
  private springY: SpringSimulation;

  constructor(from: Point2D, to: Point2D, config: Partial<SpringConfig> = {}) {
    this.springX = new SpringSimulation(from.x, to.x, config);
    this.springY = new SpringSimulation(from.y, to.y, config);
  }

  step(dt: number): Point2D {
    return {
      x: this.springX.step(dt),
      y: this.springY.step(dt),
    };
  }

  getValue(): Point2D {
    return {
      x: this.springX.getValue(),
      y: this.springY.getValue(),
    };
  }

  isDone(): boolean {
    return this.springX.isDone() && this.springY.isDone();
  }

  setTarget(target: Point2D): void {
    this.springX.setTarget(target.x);
    this.springY.setTarget(target.y);
  }
}

/* ──────────────────────────────────────────────
 * Velocity Tracker
 * ────────────────────────────────────────────── */

export class VelocityTracker {
  private samples: VelocityState[] = [];
  private maxSamples: number;
  private maxAge: number;

  constructor(maxSamples: number = 20, maxAge: number = 300) {
    this.maxSamples = maxSamples;
    this.maxAge = maxAge;
  }

  addSample(x: number, y: number): void {
    const now = performance.now();
    this.samples.push({ x, y, timestamp: now });

    // Remove old samples
    while (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }

    // Remove stale samples
    const cutoff = now - this.maxAge;
    this.samples = this.samples.filter(s => s.timestamp >= cutoff);
  }

  getVelocity(): Point2D {
    if (this.samples.length < 2) return { x: 0, y: 0 };

    const now = performance.now();
    const recent = this.samples.filter(s => s.timestamp >= now - 100);
    if (recent.length < 2) return { x: 0, y: 0 };

    const first = recent[0]!;
    const last = recent[recent.length - 1]!;
    const dt = (last.timestamp - first.timestamp) / 1000;

    if (dt === 0) return { x: 0, y: 0 };

    return {
      x: (last.x - first.x) / dt,
      y: (last.y - first.y) / dt,
    };
  }

  reset(): void {
    this.samples = [];
  }
}

/* ──────────────────────────────────────────────
 * Decay Animation (Momentum)
 * ────────────────────────────────────────────── */

export class DecayAnimation {
  private position: MutablePoint;
  private velocity: MutablePoint;
  private deceleration: number;
  private done: boolean = false;
  private startVelocity: MutablePoint;

  constructor(
    position: Point2D,
    velocity: Point2D,
    deceleration: number = 0.998,
  ) {
    this.position = { ...position };
    this.velocity = { ...velocity };
    this.startVelocity = { ...velocity };
    this.deceleration = deceleration;
  }

  step(dt: number): Point2D {
    if (this.done) return this.position;

    const steps = Math.max(1, Math.round(dt / 0.016));
    for (let i = 0; i < steps; i++) {
      this.velocity.x *= this.deceleration;
      this.velocity.y *= this.deceleration;
      this.position.x += this.velocity.x * 0.016;
      this.position.y += this.velocity.y * 0.016;
    }

    const speed = Math.sqrt(
      this.velocity.x * this.velocity.x +
      this.velocity.y * this.velocity.y,
    );

    if (speed < 0.5) {
      this.done = true;
    }

    return { ...this.position };
  }

  getValue(): Point2D {
    return { ...this.position };
  }

  isDone(): boolean {
    return this.done;
  }

  getProjectedEnd(): Point2D {
    // Calculate where the decay will end
    const factor = 1 / (1 - this.deceleration);
    return {
      x: this.position.x + this.startVelocity.x * 0.016 * factor,
      y: this.position.y + this.startVelocity.y * 0.016 * factor,
    };
  }
}

/* ──────────────────────────────────────────────
 * Physics World
 * ────────────────────────────────────────────── */

export class PhysicsWorld {
  private bodies: Map<string, PhysicsBody> = new Map();
  private constraints: Map<string, Constraint> = new Map();
  private forceFields: Map<string, ForceField> = new Map();
  private gravity: Point2D = { x: 0, y: 980 };
  private iterations: number = 10;
  private worldBounds: Rect | null = null;

  addBody(body: PhysicsBody): void {
    this.bodies.set(body.id, body);
  }

  removeBody(id: string): void {
    this.bodies.delete(id);
  }

  getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id);
  }

  addConstraint(constraint: Constraint): void {
    this.constraints.set(constraint.id, constraint);
  }

  removeConstraint(id: string): void {
    this.constraints.delete(id);
  }

  addForceField(field: ForceField): void {
    this.forceFields.set(field.id, field);
  }

  removeForceField(id: string): void {
    this.forceFields.delete(id);
  }

  setGravity(gravity: Point2D): void {
    this.gravity = gravity;
  }

  setWorldBounds(bounds: Rect): void {
    this.worldBounds = bounds;
  }

  /**
   * Advances the physics simulation by dt seconds.
   * Uses Verlet integration with position correction.
   */
  step(dt: number): void {
    const subDt = dt / this.iterations;

    for (let i = 0; i < this.iterations; i++) {
      this.applyForces(subDt);
      this.integrate(subDt);
      this.solveConstraints();
      this.detectAndResolveCollisions();
      this.enforceWorldBounds();
    }
  }

  private applyForces(dt: number): void {
    for (const body of this.bodies.values()) {
      if (body.isStatic || body.isKinematic) continue;

      // Apply gravity
      body.acceleration.x = this.gravity.x;
      body.acceleration.y = this.gravity.y;

      // Apply force fields
      for (const field of this.forceFields.values()) {
        const dx = field.position.x - body.position.x;
        const dy = field.position.y - body.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > field.radius || distance < 1) continue;

        let forceMagnitude: number;
        switch (field.falloff) {
          case 'linear':
            forceMagnitude = field.strength * (1 - distance / field.radius);
            break;
          case 'quadratic':
            forceMagnitude = field.strength * Math.pow(1 - distance / field.radius, 2);
            break;
          case 'inverse-square':
            forceMagnitude = field.strength / (distance * distance);
            break;
          default:
            forceMagnitude = field.strength;
        }

        const nx = dx / distance;
        const ny = dy / distance;

        switch (field.type) {
          case 'attraction':
          case 'gravity':
            body.acceleration.x += nx * forceMagnitude / body.mass;
            body.acceleration.y += ny * forceMagnitude / body.mass;
            break;
          case 'repulsion':
            body.acceleration.x -= nx * forceMagnitude / body.mass;
            body.acceleration.y -= ny * forceMagnitude / body.mass;
            break;
          case 'wind':
            body.acceleration.x += field.strength / body.mass;
            break;
          case 'vortex':
            body.acceleration.x += -ny * forceMagnitude / body.mass;
            body.acceleration.y += nx * forceMagnitude / body.mass;
            break;
        }
      }

      // Apply friction/drag
      body.acceleration.x -= body.velocity.x * body.friction;
      body.acceleration.y -= body.velocity.y * body.friction;
    }
  }

  private integrate(dt: number): void {
    for (const body of this.bodies.values()) {
      if (body.isStatic) continue;

      // Velocity Verlet integration
      body.velocity.x += body.acceleration.x * dt;
      body.velocity.y += body.acceleration.y * dt;
      body.position.x += body.velocity.x * dt;
      body.position.y += body.velocity.y * dt;
    }
  }

  private solveConstraints(): void {
    for (const constraint of this.constraints.values()) {
      const bodyA = this.bodies.get(constraint.bodyA);
      const bodyB = this.bodies.get(constraint.bodyB);
      if (!bodyA || !bodyB) continue;

      const dx = bodyB.position.x - bodyA.position.x;
      const dy = bodyB.position.y - bodyA.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) continue;

      const diff = (distance - constraint.length) / distance;
      const nx = dx / distance;
      const ny = dy / distance;

      const totalMass = bodyA.mass + bodyB.mass;
      const ratioA = bodyA.isStatic ? 0 : bodyB.mass / totalMass;
      const ratioB = bodyB.isStatic ? 0 : bodyA.mass / totalMass;

      const correction = diff * constraint.stiffness;

      if (!bodyA.isStatic) {
        bodyA.position.x += nx * correction * ratioA;
        bodyA.position.y += ny * correction * ratioA;
      }

      if (!bodyB.isStatic) {
        bodyB.position.x -= nx * correction * ratioB;
        bodyB.position.y -= ny * correction * ratioB;
      }
    }
  }

  private detectAndResolveCollisions(): void {
    const bodyList = Array.from(this.bodies.values());

    for (let i = 0; i < bodyList.length; i++) {
      for (let j = i + 1; j < bodyList.length; j++) {
        const a = bodyList[i]!;
        const b = bodyList[j]!;

        if (a.isStatic && b.isStatic) continue;

        if (this.aabbOverlap(a.bounds, b.bounds)) {
          this.resolveCollision(a, b);
        }
      }
    }
  }

  private aabbOverlap(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private resolveCollision(a: PhysicsBody, b: PhysicsBody): void {
    const dx = b.position.x - a.position.x;
    const dy = b.position.y - a.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const nx = dx / distance;
    const ny = dy / distance;

    const relVelX = b.velocity.x - a.velocity.x;
    const relVelY = b.velocity.y - a.velocity.y;
    const relVelNormal = relVelX * nx + relVelY * ny;

    if (relVelNormal > 0) return;

    const restitution = Math.min(a.restitution, b.restitution);
    const totalMass = a.mass + b.mass;

    const impulse = -(1 + restitution) * relVelNormal / totalMass;

    if (!a.isStatic) {
      a.velocity.x -= impulse * b.mass * nx;
      a.velocity.y -= impulse * b.mass * ny;
    }

    if (!b.isStatic) {
      b.velocity.x += impulse * a.mass * nx;
      b.velocity.y += impulse * a.mass * ny;
    }
  }

  private enforceWorldBounds(): void {
    if (!this.worldBounds) return;

    const { x: wx, y: wy, width: ww, height: wh } = this.worldBounds;

    for (const body of this.bodies.values()) {
      if (body.isStatic) continue;

      const bw = body.bounds.width;
      const bh = body.bounds.height;

      if (body.position.x < wx) {
        body.position.x = wx;
        body.velocity.x = Math.abs(body.velocity.x) * body.restitution;
      }
      if (body.position.x + bw > wx + ww) {
        body.position.x = wx + ww - bw;
        body.velocity.x = -Math.abs(body.velocity.x) * body.restitution;
      }
      if (body.position.y < wy) {
        body.position.y = wy;
        body.velocity.y = Math.abs(body.velocity.y) * body.restitution;
      }
      if (body.position.y + bh > wy + wh) {
        body.position.y = wy + wh - bh;
        body.velocity.y = -Math.abs(body.velocity.y) * body.restitution;
      }
    }
  }

  getAllBodies(): PhysicsBody[] {
    return Array.from(this.bodies.values());
  }

  clear(): void {
    this.bodies.clear();
    this.constraints.clear();
    this.forceFields.clear();
  }
}

/* ──────────────────────────────────────────────
 * Particle System
 * ────────────────────────────────────────────── */

export class ParticleSystem {
  private particles: Particle[] = [];
  private emitters: Map<string, ParticleEmitterConfig> = new Map();
  private nextParticleId: number = 0;
  private maxTotalParticles: number = 1000;

  addEmitter(id: string, config: ParticleEmitterConfig): void {
    this.emitters.set(id, config);
  }

  removeEmitter(id: string): void {
    this.emitters.delete(id);
  }

  emit(emitterId: string, count?: number): void {
    const config = this.emitters.get(emitterId);
    if (!config) return;

    const toEmit = count ?? Math.ceil(config.rate);

    for (let i = 0; i < toEmit; i++) {
      if (this.particles.length >= this.maxTotalParticles) break;

      const angle = this.randomBetween(config.angle[0], config.angle[1]) * (Math.PI / 180);
      const speed = this.randomBetween(config.speed[0], config.speed[1]);
      const life = this.randomBetween(config.particleLife[0], config.particleLife[1]);
      const size = this.randomBetween(config.size[0], config.size[1]);
      const color = config.colors[Math.floor(Math.random() * config.colors.length)] ?? '#ffffff';

      const particle: Particle = {
        id: `p_${this.nextParticleId++}`,
        position: { x: config.position.x, y: config.position.y },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        acceleration: { ...config.gravity },
        life,
        maxLife: life,
        size,
        color,
        opacity: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 200,
      };

      this.particles.push(particle);
    }
  }

  update(dt: number): void {
    // Emit from all active emitters
    for (const [id] of this.emitters) {
      this.emit(id);
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      p.velocity.x += p.acceleration.x * dt;
      p.velocity.y += p.acceleration.y * dt;
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.rotation += p.rotationSpeed * dt;

      // Age-based effects
      const ageRatio = 1 - p.life / p.maxLife;
      const config = Array.from(this.emitters.values())[0];

      if (config?.fadeOut) {
        p.opacity = 1 - ageRatio;
      }
      if (config?.shrink) {
        // Size shrinks linearly with age
        p.size = p.size * (1 - ageRatio * 0.5);
      }
    }
  }

  getParticles(): readonly Particle[] {
    return this.particles;
  }

  getParticleCount(): number {
    return this.particles.length;
  }

  clear(): void {
    this.particles = [];
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}

/* ──────────────────────────────────────────────
 * Easing Functions
 * ────────────────────────────────────────────── */

export const Easing = {
  linear: (t: number): number => t,
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => --t * t * t + 1,
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number): number => t * t * t * t,
  easeOutQuart: (t: number): number => 1 - --t * t * t * t,
  easeInOutQuart: (t: number): number =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  easeInQuint: (t: number): number => t * t * t * t * t,
  easeOutQuint: (t: number): number => 1 + --t * t * t * t * t,
  easeInOutQuint: (t: number): number =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
  easeInSine: (t: number): number => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t: number): number => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInExpo: (t: number): number => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  easeOutExpo: (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t: number): number => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  easeInCirc: (t: number): number => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: (t: number): number => Math.sqrt(1 - --t * t),
  easeInOutCirc: (t: number): number =>
    t < 0.5
      ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
      : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
  easeInBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  easeInElastic: (t: number): number => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number): number => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (t: number): number => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c5 = (2 * Math.PI) / 4.5;
    return t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
  easeInBounce: (t: number): number => 1 - Easing.easeOutBounce(1 - t),
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  easeInOutBounce: (t: number): number =>
    t < 0.5
      ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
      : (1 + Easing.easeOutBounce(2 * t - 1)) / 2,
} as const;

export type EasingFunction = keyof typeof Easing;

/* ──────────────────────────────────────────────
 * Animation Timeline
 * ────────────────────────────────────────────── */

export interface TimelineKeyframe {
  readonly time: number; // 0-1 normalized
  readonly value: number;
  readonly easing: EasingFunction;
}

export interface TimelineTrack {
  readonly id: string;
  readonly property: string;
  readonly keyframes: readonly TimelineKeyframe[];
}

export class AnimationTimeline {
  private tracks: Map<string, TimelineTrack> = new Map();
  private duration: number;
  private currentTime: number = 0;
  private playing: boolean = false;
  private loop: boolean = false;
  private speed: number = 1;
  private direction: 'forward' | 'reverse' | 'alternate' = 'forward';
  private iterationCount: number = 0;

  constructor(duration: number = 1000) {
    this.duration = duration;
  }

  addTrack(track: TimelineTrack): void {
    this.tracks.set(track.id, track);
  }

  removeTrack(id: string): void {
    this.tracks.delete(id);
  }

  play(): void {
    this.playing = true;
  }

  pause(): void {
    this.playing = false;
  }

  stop(): void {
    this.playing = false;
    this.currentTime = 0;
    this.iterationCount = 0;
  }

  seek(time: number): void {
    this.currentTime = Math.max(0, Math.min(time, this.duration));
  }

  setLoop(loop: boolean): void {
    this.loop = loop;
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  setDirection(direction: 'forward' | 'reverse' | 'alternate'): void {
    this.direction = direction;
  }

  update(dt: number): Record<string, number> {
    if (!this.playing) return this.evaluate();

    let effectiveSpeed = this.speed;
    if (this.direction === 'reverse') {
      effectiveSpeed = -effectiveSpeed;
    } else if (this.direction === 'alternate') {
      if (this.iterationCount % 2 === 1) {
        effectiveSpeed = -effectiveSpeed;
      }
    }

    this.currentTime += dt * effectiveSpeed;

    if (this.currentTime >= this.duration) {
      if (this.loop) {
        this.currentTime = this.currentTime % this.duration;
        this.iterationCount++;
      } else {
        this.currentTime = this.duration;
        this.playing = false;
      }
    } else if (this.currentTime < 0) {
      if (this.loop) {
        this.currentTime = this.duration + (this.currentTime % this.duration);
        this.iterationCount++;
      } else {
        this.currentTime = 0;
        this.playing = false;
      }
    }

    return this.evaluate();
  }

  private evaluate(): Record<string, number> {
    const values: Record<string, number> = {};
    const normalizedTime = this.currentTime / this.duration;

    for (const track of this.tracks.values()) {
      values[track.property] = this.evaluateTrack(track, normalizedTime);
    }

    return values;
  }

  private evaluateTrack(track: TimelineTrack, time: number): number {
    const keyframes = track.keyframes;
    if (keyframes.length === 0) return 0;
    if (keyframes.length === 1) return keyframes[0]!.value;

    // Find surrounding keyframes
    let prevKf = keyframes[0]!;
    let nextKf = keyframes[keyframes.length - 1]!;

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (time >= keyframes[i]!.time && time <= keyframes[i + 1]!.time) {
        prevKf = keyframes[i]!;
        nextKf = keyframes[i + 1]!;
        break;
      }
    }

    if (time <= prevKf.time) return prevKf.value;
    if (time >= nextKf.time) return nextKf.value;

    const segmentTime = (time - prevKf.time) / (nextKf.time - prevKf.time);
    const easedTime = Easing[nextKf.easing](segmentTime);

    return prevKf.value + (nextKf.value - prevKf.value) * easedTime;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getDuration(): number {
    return this.duration;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  getProgress(): number {
    return this.currentTime / this.duration;
  }
}

/* ──────────────────────────────────────────────
 * Bezier Curve
 * ────────────────────────────────────────────── */

export class CubicBezier {
  private cx: number;
  private bx: number;
  private ax: number;
  private cy: number;
  private by: number;
  private ay: number;

  constructor(p1x: number, p1y: number, p2x: number, p2y: number) {
    this.cx = 3 * p1x;
    this.bx = 3 * (p2x - p1x) - this.cx;
    this.ax = 1 - this.cx - this.bx;

    this.cy = 3 * p1y;
    this.by = 3 * (p2y - p1y) - this.cy;
    this.ay = 1 - this.cy - this.by;
  }

  sampleCurveX(t: number): number {
    return ((this.ax * t + this.bx) * t + this.cx) * t;
  }

  sampleCurveY(t: number): number {
    return ((this.ay * t + this.by) * t + this.cy) * t;
  }

  sampleCurveDerivativeX(t: number): number {
    return (3 * this.ax * t + 2 * this.bx) * t + this.cx;
  }

  solveCurveX(x: number, epsilon: number = 1e-6): number {
    let t = x;

    // Newton's method
    for (let i = 0; i < 8; i++) {
      const currentX = this.sampleCurveX(t) - x;
      if (Math.abs(currentX) < epsilon) return t;
      const derivative = this.sampleCurveDerivativeX(t);
      if (Math.abs(derivative) < 1e-6) break;
      t -= currentX / derivative;
    }

    // Bisection fallback
    let t0 = 0;
    let t1 = 1;
    t = x;

    while (t0 < t1) {
      const currentX = this.sampleCurveX(t);
      if (Math.abs(currentX - x) < epsilon) return t;
      if (x > currentX) t0 = t;
      else t1 = t;
      t = (t1 - t0) * 0.5 + t0;
    }

    return t;
  }

  solve(x: number): number {
    return this.sampleCurveY(this.solveCurveX(x));
  }
}

/* ──────────────────────────────────────────────
 * Interpolation Utilities
 * ────────────────────────────────────────────── */

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function inverseLerp(a: number, b: number, value: number): number {
  if (a === b) return 0;
  return (value - a) / (b - a);
}

export function remap(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
): number {
  const t = inverseLerp(fromMin, fromMax, value);
  return lerp(toMin, toMax, t);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function lerpPoint(a: Point2D, b: Point2D, t: number): Point2D {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}

export function distance(a: Point2D, b: Point2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function angle(a: Point2D, b: Point2D): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function normalize(v: Point2D): Point2D {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function dotProduct(a: Point2D, b: Point2D): number {
  return a.x * b.x + a.y * b.y;
}

export function crossProduct(a: Point2D, b: Point2D): number {
  return a.x * b.y - a.y * b.x;
}

export function rotatePoint(point: Point2D, center: Point2D, angleDeg: number): Point2D {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}
