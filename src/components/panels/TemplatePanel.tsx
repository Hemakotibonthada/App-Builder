/**
 * Template Panel
 * 
 * Pre-built, drag-ready templates that users can drop
 * directly onto the canvas. Each template creates
 * multiple widgets at once forming a complete layout.
 * 
 * Users can modify them freely after dropping.
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAppDispatch } from '@/store/store';
import { addWidget } from '@/store/canvasSlice';
import { WidgetType } from '@/types/widget.types';

/* ──────────────────────────────────────────────
 * Template Definition
 * ────────────────────────────────────────────── */

export interface TemplateWidget {
  type: string;
  name?: string;
  x: number;
  y: number;
  props?: Record<string, unknown>;
  style?: Record<string, unknown>;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  preview: string; // Emoji or icon key
  width: number;
  height: number;
  widgets: TemplateWidget[];
}

export type TemplateCategory =
  | 'hero'
  | 'navigation'
  | 'cards'
  | 'forms'
  | 'pricing'
  | 'features'
  | 'testimonials'
  | 'footer'
  | 'cta'
  | 'stats'
  | 'content'
  | 'auth'
  | 'dashboard'
  | 'ecommerce'
  | 'mobile';

const CATEGORY_INFO: Record<TemplateCategory, { label: string; icon: string }> = {
  hero: { label: 'Hero Sections', icon: '🦸' },
  navigation: { label: 'Navigation', icon: '🧭' },
  cards: { label: 'Card Layouts', icon: '🃏' },
  forms: { label: 'Forms', icon: '📝' },
  pricing: { label: 'Pricing', icon: '💰' },
  features: { label: 'Features', icon: '⭐' },
  testimonials: { label: 'Testimonials', icon: '💬' },
  footer: { label: 'Footers', icon: '🦶' },
  cta: { label: 'Call to Action', icon: '📢' },
  stats: { label: 'Statistics', icon: '📊' },
  content: { label: 'Content', icon: '📄' },
  auth: { label: 'Authentication', icon: '🔐' },
  dashboard: { label: 'Dashboard', icon: '📈' },
  ecommerce: { label: 'E-Commerce', icon: '🛒' },
  mobile: { label: 'Mobile Screens', icon: '📱' },
};

/* ──────────────────────────────────────────────
 * All Templates
 * ────────────────────────────────────────────── */

const TEMPLATES: Template[] = [
  /* ═══ HERO SECTIONS ═══ */
  {
    id: 'hero-centered',
    name: 'Centered Hero',
    description: 'Hero with centered heading, paragraph, and CTA buttons',
    category: 'hero',
    preview: '🦸',
    width: 800, height: 400,
    widgets: [
      { type: 'heading', name: 'Hero Title', x: 150, y: 60, props: { content: 'Build Something Amazing', level: 1 }, style: { width: { value: 500, unit: 'px' }, height: { value: 50, unit: 'px' }, fontSize: 36, fontWeight: '800', color: '#e2e8f0' } },
      { type: 'paragraph', name: 'Hero Subtitle', x: 150, y: 130, props: { content: 'Create beautiful, responsive applications in minutes with our drag-and-drop builder. No coding required.' }, style: { width: { value: 500, unit: 'px' }, height: { value: 60, unit: 'px' }, fontSize: 16, color: '#94a3b8', lineHeight: 1.6 } },
      { type: 'button', name: 'Primary CTA', x: 250, y: 220, props: { label: 'Get Started Free' }, style: { width: { value: 160, unit: 'px' }, height: { value: 44, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 }, fontSize: 15, fontWeight: '600' } },
      { type: 'button', name: 'Secondary CTA', x: 430, y: 220, props: { label: 'Watch Demo', variant: 'outline' }, style: { width: { value: 140, unit: 'px' }, height: { value: 44, unit: 'px' }, background: { type: 'solid', color: 'transparent' }, color: '#6366f1', border: { width: 2, style: 'solid', color: '#6366f1' }, borderRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 }, fontSize: 15, fontWeight: '600' } },
    ],
  },
  {
    id: 'hero-split',
    name: 'Split Hero',
    description: 'Hero with text on left, image on right',
    category: 'hero',
    preview: '🖼️',
    width: 800, height: 400,
    widgets: [
      { type: 'heading', name: 'Hero Heading', x: 40, y: 60, props: { content: 'The Modern Way to Build Apps', level: 1 }, style: { width: { value: 350, unit: 'px' }, height: { value: 80, unit: 'px' }, fontSize: 32, fontWeight: '800', color: '#e2e8f0' } },
      { type: 'paragraph', name: 'Hero Text', x: 40, y: 160, props: { content: 'Streamline your development workflow with our powerful visual editor and component library.' }, style: { width: { value: 340, unit: 'px' }, height: { value: 50, unit: 'px' }, fontSize: 15, color: '#94a3b8' } },
      { type: 'button', name: 'CTA Button', x: 40, y: 240, props: { label: 'Start Building' }, style: { width: { value: 150, unit: 'px' }, height: { value: 44, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 }, fontSize: 15, fontWeight: '600' } },
      { type: 'image', name: 'Hero Image', x: 430, y: 40, props: { alt: 'Product screenshot' }, style: { width: { value: 340, unit: 'px' }, height: { value: 280, unit: 'px' }, borderRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 } } },
    ],
  },
  {
    id: 'hero-gradient',
    name: 'Gradient Hero',
    description: 'Bold gradient background hero with badge',
    category: 'hero',
    preview: '🌈',
    width: 800, height: 350,
    widgets: [
      { type: 'badge', name: 'Announcement', x: 320, y: 30, props: { content: '✨ New Release v2.0' }, style: { width: { value: 140, unit: 'px' }, height: { value: 28, unit: 'px' } } },
      { type: 'heading', name: 'Title', x: 140, y: 80, props: { content: 'Supercharge Your Workflow', level: 1 }, style: { width: { value: 520, unit: 'px' }, height: { value: 50, unit: 'px' }, fontSize: 40, fontWeight: '900', color: '#ffffff' } },
      { type: 'text', name: 'Subtitle', x: 200, y: 150, props: { content: 'Join 10,000+ developers who ship faster.' }, style: { width: { value: 400, unit: 'px' }, height: { value: 24, unit: 'px' }, fontSize: 16, color: '#c4b5fd' } },
      { type: 'text-input', name: 'Email Input', x: 200, y: 210, props: { placeholder: 'Enter your email', label: '' }, style: { width: { value: 280, unit: 'px' }, height: { value: 44, unit: 'px' } } },
      { type: 'button', name: 'Subscribe', x: 500, y: 210, props: { label: 'Subscribe' }, style: { width: { value: 110, unit: 'px' }, height: { value: 44, unit: 'px' }, background: { type: 'solid', color: '#ffffff' }, color: '#6366f1', borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontWeight: '700' } },
    ],
  },

  /* ═══ NAVIGATION ═══ */
  {
    id: 'navbar-standard',
    name: 'Standard Navbar',
    description: 'Logo + links + CTA button',
    category: 'navigation',
    preview: '🧭',
    width: 800, height: 56,
    widgets: [
      { type: 'heading', name: 'Logo', x: 20, y: 12, props: { content: 'AppLogo', level: 4 }, style: { width: { value: 100, unit: 'px' }, height: { value: 32, unit: 'px' }, fontSize: 18, fontWeight: '800', color: '#6366f1' } },
      { type: 'link', name: 'Nav Home', x: 250, y: 16, props: { text: 'Home', url: '/' }, style: { width: { value: 50, unit: 'px' }, height: { value: 24, unit: 'px' }, color: '#e2e8f0', fontSize: 14 } },
      { type: 'link', name: 'Nav Features', x: 320, y: 16, props: { text: 'Features', url: '/features' }, style: { width: { value: 70, unit: 'px' }, height: { value: 24, unit: 'px' }, color: '#94a3b8', fontSize: 14 } },
      { type: 'link', name: 'Nav Pricing', x: 410, y: 16, props: { text: 'Pricing', url: '/pricing' }, style: { width: { value: 60, unit: 'px' }, height: { value: 24, unit: 'px' }, color: '#94a3b8', fontSize: 14 } },
      { type: 'link', name: 'Nav About', x: 490, y: 16, props: { text: 'About', url: '/about' }, style: { width: { value: 50, unit: 'px' }, height: { value: 24, unit: 'px' }, color: '#94a3b8', fontSize: 14 } },
      { type: 'button', name: 'Nav CTA', x: 660, y: 8, props: { label: 'Sign Up' }, style: { width: { value: 100, unit: 'px' }, height: { value: 36, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 13, fontWeight: '600' } },
    ],
  },

  /* ═══ CARD LAYOUTS ═══ */
  {
    id: 'cards-3col',
    name: '3-Column Cards',
    description: 'Three feature cards side by side',
    category: 'cards',
    preview: '🃏',
    width: 800, height: 250,
    widgets: [
      // Card 1
      { type: 'icon', name: 'Icon 1', x: 50, y: 30, props: { name: 'Zap', size: 28, color: '#6366f1' }, style: { width: { value: 28, unit: 'px' }, height: { value: 28, unit: 'px' } } },
      { type: 'heading', name: 'Card Title 1', x: 30, y: 70, props: { content: 'Lightning Fast', level: 4 }, style: { width: { value: 200, unit: 'px' }, height: { value: 28, unit: 'px' }, fontSize: 16, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'Card Desc 1', x: 30, y: 105, props: { content: 'Optimized for speed with instant previews and real-time editing.' }, style: { width: { value: 200, unit: 'px' }, height: { value: 60, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      // Card 2
      { type: 'icon', name: 'Icon 2', x: 320, y: 30, props: { name: 'Shield', size: 28, color: '#22c55e' }, style: { width: { value: 28, unit: 'px' }, height: { value: 28, unit: 'px' } } },
      { type: 'heading', name: 'Card Title 2', x: 300, y: 70, props: { content: 'Secure by Default', level: 4 }, style: { width: { value: 200, unit: 'px' }, height: { value: 28, unit: 'px' }, fontSize: 16, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'Card Desc 2', x: 300, y: 105, props: { content: 'Built-in security features protect your data and users.' }, style: { width: { value: 200, unit: 'px' }, height: { value: 60, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      // Card 3
      { type: 'icon', name: 'Icon 3', x: 590, y: 30, props: { name: 'Globe', size: 28, color: '#f59e0b' }, style: { width: { value: 28, unit: 'px' }, height: { value: 28, unit: 'px' } } },
      { type: 'heading', name: 'Card Title 3', x: 570, y: 70, props: { content: 'Global Scale', level: 4 }, style: { width: { value: 200, unit: 'px' }, height: { value: 28, unit: 'px' }, fontSize: 16, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'Card Desc 3', x: 570, y: 105, props: { content: 'Deploy globally with edge computing and CDN support.' }, style: { width: { value: 200, unit: 'px' }, height: { value: 60, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
    ],
  },
  {
    id: 'cards-profile',
    name: 'Profile Card',
    description: 'User profile card with avatar and stats',
    category: 'cards',
    preview: '👤',
    width: 320, height: 280,
    widgets: [
      { type: 'avatar', name: 'Profile Avatar', x: 130, y: 20, props: { name: 'Jane Smith', shape: 'circle' }, style: { width: { value: 64, unit: 'px' }, height: { value: 64, unit: 'px' } } },
      { type: 'heading', name: 'Profile Name', x: 90, y: 95, props: { content: 'Jane Smith', level: 4 }, style: { width: { value: 140, unit: 'px' }, height: { value: 24, unit: 'px' }, fontSize: 18, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'Profile Role', x: 100, y: 125, props: { content: 'Product Designer' }, style: { width: { value: 120, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'text', name: 'Stat 1', x: 30, y: 175, props: { content: '1.2K' }, style: { width: { value: 70, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 18, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'Stat Label 1', x: 30, y: 198, props: { content: 'Followers' }, style: { width: { value: 70, unit: 'px' }, height: { value: 16, unit: 'px' }, fontSize: 11, color: '#64748b' } },
      { type: 'text', name: 'Stat 2', x: 130, y: 175, props: { content: '384' }, style: { width: { value: 60, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 18, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'Stat Label 2', x: 130, y: 198, props: { content: 'Projects' }, style: { width: { value: 60, unit: 'px' }, height: { value: 16, unit: 'px' }, fontSize: 11, color: '#64748b' } },
      { type: 'text', name: 'Stat 3', x: 220, y: 175, props: { content: '56' }, style: { width: { value: 60, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 18, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'Stat Label 3', x: 220, y: 198, props: { content: 'Awards' }, style: { width: { value: 60, unit: 'px' }, height: { value: 16, unit: 'px' }, fontSize: 11, color: '#64748b' } },
      { type: 'button', name: 'Follow Btn', x: 90, y: 234, props: { label: 'Follow' }, style: { width: { value: 140, unit: 'px' }, height: { value: 36, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 13, fontWeight: '600' } },
    ],
  },

  /* ═══ FORMS ═══ */
  {
    id: 'form-contact',
    name: 'Contact Form',
    description: 'Name, email, message, and submit button',
    category: 'forms',
    preview: '📝',
    width: 400, height: 380,
    widgets: [
      { type: 'heading', name: 'Form Title', x: 20, y: 10, props: { content: 'Contact Us', level: 3 }, style: { width: { value: 200, unit: 'px' }, height: { value: 32, unit: 'px' }, fontSize: 22, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text-input', name: 'Name Field', x: 20, y: 60, props: { label: 'Full Name', placeholder: 'John Doe' }, style: { width: { value: 360, unit: 'px' }, height: { value: 64, unit: 'px' } } },
      { type: 'text-input', name: 'Email Field', x: 20, y: 135, props: { label: 'Email', placeholder: 'john@example.com', inputType: 'email' }, style: { width: { value: 360, unit: 'px' }, height: { value: 64, unit: 'px' } } },
      { type: 'text-area', name: 'Message Field', x: 20, y: 210, props: { label: 'Message', placeholder: 'Tell us how we can help...' }, style: { width: { value: 360, unit: 'px' }, height: { value: 100, unit: 'px' } } },
      { type: 'button', name: 'Submit Btn', x: 20, y: 325, props: { label: 'Send Message', fullWidth: true }, style: { width: { value: 360, unit: 'px' }, height: { value: 44, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 }, fontSize: 15, fontWeight: '600' } },
    ],
  },
  {
    id: 'form-newsletter',
    name: 'Newsletter Signup',
    description: 'Inline email + subscribe button',
    category: 'forms',
    preview: '📧',
    width: 500, height: 130,
    widgets: [
      { type: 'heading', name: 'CTA Title', x: 20, y: 10, props: { content: 'Stay in the loop', level: 4 }, style: { width: { value: 300, unit: 'px' }, height: { value: 28, unit: 'px' }, fontSize: 18, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'CTA Desc', x: 20, y: 42, props: { content: 'Get the latest updates delivered to your inbox.' }, style: { width: { value: 300, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'text-input', name: 'Email', x: 20, y: 78, props: { label: '', placeholder: 'your@email.com' }, style: { width: { value: 320, unit: 'px' }, height: { value: 42, unit: 'px' } } },
      { type: 'button', name: 'Subscribe', x: 355, y: 78, props: { label: 'Subscribe' }, style: { width: { value: 120, unit: 'px' }, height: { value: 42, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 14, fontWeight: '600' } },
    ],
  },

  /* ═══ PRICING ═══ */
  {
    id: 'pricing-3tier',
    name: '3-Tier Pricing',
    description: 'Basic, Pro, and Enterprise pricing cards',
    category: 'pricing',
    preview: '💰',
    width: 900, height: 350,
    widgets: [
      // Tier 1
      { type: 'heading', name: 'Tier 1 Name', x: 30, y: 20, props: { content: 'Starter', level: 4 }, style: { width: { value: 220, unit: 'px' }, height: { value: 24, unit: 'px' }, fontSize: 16, fontWeight: '600', color: '#94a3b8' } },
      { type: 'heading', name: 'Tier 1 Price', x: 30, y: 55, props: { content: '$9/mo', level: 2 }, style: { width: { value: 220, unit: 'px' }, height: { value: 36, unit: 'px' }, fontSize: 32, fontWeight: '800', color: '#e2e8f0' } },
      { type: 'text', name: 'Tier 1 F1', x: 30, y: 110, props: { content: '✓ 5 Projects' }, style: { width: { value: 200, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'text', name: 'Tier 1 F2', x: 30, y: 135, props: { content: '✓ 1GB Storage' }, style: { width: { value: 200, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'text', name: 'Tier 1 F3', x: 30, y: 160, props: { content: '✓ Email Support' }, style: { width: { value: 200, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'button', name: 'Tier 1 CTA', x: 30, y: 210, props: { label: 'Choose Starter', variant: 'outline' }, style: { width: { value: 220, unit: 'px' }, height: { value: 42, unit: 'px' }, background: { type: 'solid', color: 'transparent' }, color: '#6366f1', border: { width: 2, style: 'solid', color: '#6366f1' }, borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 14, fontWeight: '600' } },
      // Tier 2 (recommended)
      { type: 'badge', name: 'Popular Badge', x: 380, y: 8, props: { content: 'Most Popular' }, style: { width: { value: 100, unit: 'px' }, height: { value: 22, unit: 'px' } } },
      { type: 'heading', name: 'Tier 2 Name', x: 320, y: 32, props: { content: 'Professional', level: 4 }, style: { width: { value: 240, unit: 'px' }, height: { value: 24, unit: 'px' }, fontSize: 16, fontWeight: '600', color: '#c4b5fd' } },
      { type: 'heading', name: 'Tier 2 Price', x: 320, y: 67, props: { content: '$29/mo', level: 2 }, style: { width: { value: 240, unit: 'px' }, height: { value: 36, unit: 'px' }, fontSize: 32, fontWeight: '800', color: '#e2e8f0' } },
      { type: 'text', name: 'Tier 2 F1', x: 320, y: 122, props: { content: '✓ Unlimited Projects' }, style: { width: { value: 220, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'text', name: 'Tier 2 F2', x: 320, y: 147, props: { content: '✓ 50GB Storage' }, style: { width: { value: 220, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'text', name: 'Tier 2 F3', x: 320, y: 172, props: { content: '✓ Priority Support' }, style: { width: { value: 220, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'button', name: 'Tier 2 CTA', x: 320, y: 222, props: { label: 'Choose Pro' }, style: { width: { value: 240, unit: 'px' }, height: { value: 42, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 14, fontWeight: '600' } },
      // Tier 3
      { type: 'heading', name: 'Tier 3 Name', x: 630, y: 20, props: { content: 'Enterprise', level: 4 }, style: { width: { value: 230, unit: 'px' }, height: { value: 24, unit: 'px' }, fontSize: 16, fontWeight: '600', color: '#94a3b8' } },
      { type: 'heading', name: 'Tier 3 Price', x: 630, y: 55, props: { content: '$99/mo', level: 2 }, style: { width: { value: 230, unit: 'px' }, height: { value: 36, unit: 'px' }, fontSize: 32, fontWeight: '800', color: '#e2e8f0' } },
      { type: 'text', name: 'Tier 3 F1', x: 630, y: 110, props: { content: '✓ Everything in Pro' }, style: { width: { value: 220, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'text', name: 'Tier 3 F2', x: 630, y: 135, props: { content: '✓ Unlimited Storage' }, style: { width: { value: 220, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'text', name: 'Tier 3 F3', x: 630, y: 160, props: { content: '✓ 24/7 Phone Support' }, style: { width: { value: 220, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'button', name: 'Tier 3 CTA', x: 630, y: 210, props: { label: 'Contact Sales', variant: 'outline' }, style: { width: { value: 230, unit: 'px' }, height: { value: 42, unit: 'px' }, background: { type: 'solid', color: 'transparent' }, color: '#94a3b8', border: { width: 1, style: 'solid', color: '#4a4a5a' }, borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 14, fontWeight: '600' } },
    ],
  },

  /* ═══ FEATURES ═══ */
  {
    id: 'features-grid',
    name: 'Features Grid',
    description: '2x3 features grid with icons',
    category: 'features',
    preview: '⭐',
    width: 700, height: 350,
    widgets: [
      { type: 'heading', name: 'Section Title', x: 200, y: 10, props: { content: 'Everything you need', level: 2 }, style: { width: { value: 300, unit: 'px' }, height: { value: 36, unit: 'px' }, fontSize: 28, fontWeight: '800', color: '#e2e8f0' } },
      ...[
        { label: 'Analytics', desc: 'Detailed insights into performance', x: 30, y: 75 },
        { label: 'Automation', desc: 'Automate repetitive tasks', x: 260, y: 75 },
        { label: 'Integrations', desc: 'Connect with 100+ tools', x: 490, y: 75 },
        { label: 'Security', desc: 'Enterprise-grade protection', x: 30, y: 210 },
        { label: 'Collaboration', desc: 'Work together in real-time', x: 260, y: 210 },
        { label: 'API Access', desc: 'Full REST and GraphQL API', x: 490, y: 210 },
      ].flatMap((f, i) => [
        { type: 'heading' as const, name: `Feature ${i + 1}`, x: f.x, y: f.y, props: { content: f.label, level: 5 }, style: { width: { value: 190, unit: 'px' }, height: { value: 22, unit: 'px' }, fontSize: 15, fontWeight: '700', color: '#e2e8f0' } },
        { type: 'text' as const, name: `Feature Desc ${i + 1}`, x: f.x, y: f.y + 30, props: { content: f.desc }, style: { width: { value: 190, unit: 'px' }, height: { value: 40, unit: 'px' }, fontSize: 12, color: '#94a3b8' } },
      ]),
    ],
  },

  /* ═══ TESTIMONIALS ═══ */
  {
    id: 'testimonial-single',
    name: 'Testimonial Card',
    description: 'Single customer quote with avatar',
    category: 'testimonials',
    preview: '💬',
    width: 450, height: 200,
    widgets: [
      { type: 'text', name: 'Quote', x: 30, y: 20, props: { content: '"This tool has completely transformed our development process. We ship 3x faster now."' }, style: { width: { value: 390, unit: 'px' }, height: { value: 60, unit: 'px' }, fontSize: 16, color: '#e2e8f0', fontWeight: '500' } },
      { type: 'avatar', name: 'Customer Avatar', x: 30, y: 110, props: { name: 'Sarah Chen', shape: 'circle' }, style: { width: { value: 40, unit: 'px' }, height: { value: 40, unit: 'px' } } },
      { type: 'text', name: 'Customer Name', x: 85, y: 112, props: { content: 'Sarah Chen' }, style: { width: { value: 120, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, fontWeight: '600', color: '#e2e8f0' } },
      { type: 'text', name: 'Customer Title', x: 85, y: 135, props: { content: 'CTO, TechCorp' }, style: { width: { value: 120, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 12, color: '#64748b' } },
    ],
  },

  /* ═══ FOOTER ═══ */
  {
    id: 'footer-standard',
    name: 'Standard Footer',
    description: '4-column footer with links and copyright',
    category: 'footer',
    preview: '🦶',
    width: 800, height: 250,
    widgets: [
      // Col 1
      { type: 'heading', name: 'Brand', x: 30, y: 20, props: { content: 'AppBuilder', level: 4 }, style: { width: { value: 140, unit: 'px' }, height: { value: 24, unit: 'px' }, fontSize: 16, fontWeight: '700', color: '#6366f1' } },
      { type: 'text', name: 'Brand Desc', x: 30, y: 50, props: { content: 'Build apps visually.' }, style: { width: { value: 140, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 12, color: '#64748b' } },
      // Col 2
      { type: 'text', name: 'Col2 Title', x: 230, y: 20, props: { content: 'Product' }, style: { width: { value: 100, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, fontWeight: '600', color: '#e2e8f0' } },
      ...['Features', 'Pricing', 'Changelog', 'Docs'].map((t, i) => ({ type: 'link' as const, name: `PLink ${i}`, x: 230, y: 50 + i * 24, props: { text: t, url: '#' }, style: { width: { value: 100, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 12, color: '#64748b' } })),
      // Col 3
      { type: 'text', name: 'Col3 Title', x: 420, y: 20, props: { content: 'Company' }, style: { width: { value: 100, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, fontWeight: '600', color: '#e2e8f0' } },
      ...['About', 'Blog', 'Careers', 'Press'].map((t, i) => ({ type: 'link' as const, name: `CLink ${i}`, x: 420, y: 50 + i * 24, props: { text: t, url: '#' }, style: { width: { value: 100, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 12, color: '#64748b' } })),
      // Col 4
      { type: 'text', name: 'Col4 Title', x: 610, y: 20, props: { content: 'Legal' }, style: { width: { value: 100, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, fontWeight: '600', color: '#e2e8f0' } },
      ...['Privacy', 'Terms', 'Cookies'].map((t, i) => ({ type: 'link' as const, name: `LLink ${i}`, x: 610, y: 50 + i * 24, props: { text: t, url: '#' }, style: { width: { value: 100, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 12, color: '#64748b' } })),
      // Copyright
      { type: 'divider', name: 'Divider', x: 30, y: 180, props: {}, style: { width: { value: 740, unit: 'px' }, height: { value: 1, unit: 'px' } } },
      { type: 'text', name: 'Copyright', x: 30, y: 200, props: { content: '© 2026 AppBuilder. All rights reserved.' }, style: { width: { value: 300, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 12, color: '#475569' } },
    ],
  },

  /* ═══ CTA ═══ */
  {
    id: 'cta-banner',
    name: 'CTA Banner',
    description: 'Full-width call-to-action banner',
    category: 'cta',
    preview: '📢',
    width: 700, height: 180,
    widgets: [
      { type: 'heading', name: 'CTA Title', x: 100, y: 30, props: { content: 'Ready to get started?', level: 2 }, style: { width: { value: 500, unit: 'px' }, height: { value: 36, unit: 'px' }, fontSize: 28, fontWeight: '800', color: '#e2e8f0' } },
      { type: 'text', name: 'CTA Subtitle', x: 140, y: 80, props: { content: 'Start your free trial today. No credit card required.' }, style: { width: { value: 420, unit: 'px' }, height: { value: 22, unit: 'px' }, fontSize: 15, color: '#94a3b8' } },
      { type: 'button', name: 'CTA Btn', x: 220, y: 120, props: { label: 'Start Free Trial' }, style: { width: { value: 160, unit: 'px' }, height: { value: 44, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 }, fontSize: 15, fontWeight: '600' } },
      { type: 'link', name: 'Learn More', x: 400, y: 130, props: { text: 'Learn more →', url: '#' }, style: { width: { value: 110, unit: 'px' }, height: { value: 24, unit: 'px' }, color: '#6366f1', fontSize: 14 } },
    ],
  },

  /* ═══ STATS ═══ */
  {
    id: 'stats-row',
    name: 'Stats Row',
    description: '4-column statistics display',
    category: 'stats',
    preview: '📊',
    width: 800, height: 120,
    widgets: [
      ...[
        { val: '10K+', label: 'Users', x: 40 },
        { val: '50M+', label: 'API Calls', x: 230 },
        { val: '99.9%', label: 'Uptime', x: 420 },
        { val: '150+', label: 'Countries', x: 610 },
      ].flatMap(s => [
        { type: 'heading' as const, name: `Stat ${s.label}`, x: s.x, y: 20, props: { content: s.val, level: 2 }, style: { width: { value: 140, unit: 'px' }, height: { value: 40, unit: 'px' }, fontSize: 32, fontWeight: '800', color: '#6366f1' } },
        { type: 'text' as const, name: `Label ${s.label}`, x: s.x, y: 68, props: { content: s.label }, style: { width: { value: 140, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#94a3b8' } },
      ]),
    ],
  },

  /* ═══ AUTH ═══ */
  {
    id: 'auth-login',
    name: 'Login Form',
    description: 'Email + password login with social options',
    category: 'auth',
    preview: '🔐',
    width: 380, height: 420,
    widgets: [
      { type: 'heading', name: 'Login Title', x: 30, y: 20, props: { content: 'Welcome back', level: 3 }, style: { width: { value: 200, unit: 'px' }, height: { value: 30, unit: 'px' }, fontSize: 22, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'Login Subtitle', x: 30, y: 55, props: { content: 'Sign in to your account' }, style: { width: { value: 200, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'text-input', name: 'Email', x: 30, y: 95, props: { label: 'Email', placeholder: 'you@example.com', inputType: 'email' }, style: { width: { value: 320, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'text-input', name: 'Password', x: 30, y: 175, props: { label: 'Password', placeholder: '••••••••', inputType: 'password' }, style: { width: { value: 320, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'checkbox', name: 'Remember Me', x: 30, y: 255, props: { label: 'Remember me', checked: false }, style: { width: { value: 130, unit: 'px' }, height: { value: 20, unit: 'px' } } },
      { type: 'link', name: 'Forgot PW', x: 240, y: 255, props: { text: 'Forgot password?', url: '#' }, style: { width: { value: 115, unit: 'px' }, height: { value: 20, unit: 'px' }, color: '#6366f1', fontSize: 13 } },
      { type: 'button', name: 'Sign In', x: 30, y: 295, props: { label: 'Sign In' }, style: { width: { value: 320, unit: 'px' }, height: { value: 44, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 }, fontSize: 15, fontWeight: '600' } },
      { type: 'divider', name: 'Separator', x: 30, y: 355, props: {}, style: { width: { value: 320, unit: 'px' }, height: { value: 1, unit: 'px' } } },
      { type: 'text', name: 'No Account', x: 100, y: 375, props: { content: "Don't have an account?" }, style: { width: { value: 150, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'link', name: 'Sign Up Link', x: 255, y: 375, props: { text: 'Sign up', url: '#' }, style: { width: { value: 60, unit: 'px' }, height: { value: 18, unit: 'px' }, color: '#6366f1', fontSize: 13 } },
    ],
  },
  {
    id: 'auth-signup',
    name: 'Sign Up Form',
    description: 'Registration with name, email, password',
    category: 'auth',
    preview: '📋',
    width: 380, height: 450,
    widgets: [
      { type: 'heading', name: 'Title', x: 30, y: 15, props: { content: 'Create account', level: 3 }, style: { width: { value: 200, unit: 'px' }, height: { value: 30, unit: 'px' }, fontSize: 22, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text-input', name: 'Name', x: 30, y: 65, props: { label: 'Full Name', placeholder: 'Jane Doe' }, style: { width: { value: 320, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'text-input', name: 'Email', x: 30, y: 145, props: { label: 'Email', placeholder: 'jane@example.com', inputType: 'email' }, style: { width: { value: 320, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'text-input', name: 'Password', x: 30, y: 225, props: { label: 'Password', placeholder: '8+ characters', inputType: 'password' }, style: { width: { value: 320, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'checkbox', name: 'Terms', x: 30, y: 310, props: { label: 'I agree to Terms & Privacy' }, style: { width: { value: 220, unit: 'px' }, height: { value: 20, unit: 'px' } } },
      { type: 'button', name: 'Create Btn', x: 30, y: 350, props: { label: 'Create Account' }, style: { width: { value: 320, unit: 'px' }, height: { value: 44, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 }, fontSize: 15, fontWeight: '600' } },
      { type: 'text', name: 'Login Link Text', x: 100, y: 412, props: { content: 'Already have an account?' }, style: { width: { value: 170, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'link', name: 'Login Link', x: 270, y: 412, props: { text: 'Sign in', url: '#' }, style: { width: { value: 55, unit: 'px' }, height: { value: 18, unit: 'px' }, color: '#6366f1', fontSize: 13 } },
    ],
  },

  /* ═══ DASHBOARD ═══ */
  {
    id: 'dashboard-header',
    name: 'Dashboard Header',
    description: 'Welcome banner with stats',
    category: 'dashboard',
    preview: '📈',
    width: 700, height: 180,
    widgets: [
      { type: 'heading', name: 'Welcome', x: 30, y: 20, props: { content: 'Good morning, Jane 👋', level: 3 }, style: { width: { value: 350, unit: 'px' }, height: { value: 32, unit: 'px' }, fontSize: 22, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'Sub', x: 30, y: 58, props: { content: "Here's what's happening with your projects today." }, style: { width: { value: 350, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#94a3b8' } },
      ...[
        { val: '2,847', label: 'Total Visitors', x: 30, clr: '#6366f1' },
        { val: '$12,430', label: 'Revenue', x: 200, clr: '#22c55e' },
        { val: '184', label: 'New Users', x: 370, clr: '#f59e0b' },
        { val: '4.8/5', label: 'Rating', x: 540, clr: '#ec4899' },
      ].flatMap(s => [
        { type: 'heading' as const, name: s.label, x: s.x, y: 100, props: { content: s.val, level: 4 }, style: { width: { value: 130, unit: 'px' }, height: { value: 28, unit: 'px' }, fontSize: 22, fontWeight: '800', color: s.clr } },
        { type: 'text' as const, name: `L-${s.label}`, x: s.x, y: 132, props: { content: s.label }, style: { width: { value: 130, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 12, color: '#64748b' } },
      ]),
    ],
  },

  /* ═══ E-COMMERCE ═══ */
  {
    id: 'ecom-product-card',
    name: 'Product Card',
    description: 'Product image, name, price, add to cart',
    category: 'ecommerce',
    preview: '🛒',
    width: 280, height: 380,
    widgets: [
      { type: 'image', name: 'Product Image', x: 0, y: 0, props: { alt: 'Product' }, style: { width: { value: 280, unit: 'px' }, height: { value: 200, unit: 'px' }, borderRadius: { topLeft: 12, topRight: 12, bottomRight: 0, bottomLeft: 0 } } },
      { type: 'badge', name: 'Sale Badge', x: 12, y: 12, props: { content: 'SALE', color: '#ef4444' }, style: { width: { value: 50, unit: 'px' }, height: { value: 24, unit: 'px' } } },
      { type: 'heading', name: 'Product Name', x: 16, y: 215, props: { content: 'Premium Wireless Headphones', level: 5 }, style: { width: { value: 250, unit: 'px' }, height: { value: 24, unit: 'px' }, fontSize: 15, fontWeight: '600', color: '#e2e8f0' } },
      { type: 'text', name: 'Product Desc', x: 16, y: 245, props: { content: 'High-quality sound with active noise cancellation' }, style: { width: { value: 250, unit: 'px' }, height: { value: 36, unit: 'px' }, fontSize: 12, color: '#94a3b8' } },
      { type: 'heading', name: 'Price', x: 16, y: 290, props: { content: '$79.99', level: 4 }, style: { width: { value: 100, unit: 'px' }, height: { value: 28, unit: 'px' }, fontSize: 20, fontWeight: '800', color: '#e2e8f0' } },
      { type: 'text', name: 'Old Price', x: 120, y: 296, props: { content: '$129.99' }, style: { width: { value: 80, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 14, color: '#64748b' } },
      { type: 'button', name: 'Add to Cart', x: 16, y: 330, props: { label: 'Add to Cart' }, style: { width: { value: 248, unit: 'px' }, height: { value: 40, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 14, fontWeight: '600' } },
    ],
  },

  /* ═══ CONTENT ═══ */
  {
    id: 'content-blog-post',
    name: 'Blog Post Preview',
    description: 'Blog card with image, title, excerpt, author',
    category: 'content',
    preview: '📄',
    width: 350, height: 350,
    widgets: [
      { type: 'image', name: 'Cover', x: 0, y: 0, props: { alt: 'Blog cover' }, style: { width: { value: 350, unit: 'px' }, height: { value: 170, unit: 'px' }, borderRadius: { topLeft: 12, topRight: 12, bottomRight: 0, bottomLeft: 0 } } },
      { type: 'badge', name: 'Category', x: 16, y: 185, props: { content: 'Design', color: '#8b5cf6' }, style: { width: { value: 60, unit: 'px' }, height: { value: 22, unit: 'px' } } },
      { type: 'heading', name: 'Post Title', x: 16, y: 218, props: { content: '10 Design Principles for Better UX', level: 4 }, style: { width: { value: 320, unit: 'px' }, height: { value: 24, unit: 'px' }, fontSize: 16, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'Excerpt', x: 16, y: 252, props: { content: 'Learn the fundamental principles that separate good interfaces from great ones...' }, style: { width: { value: 320, unit: 'px' }, height: { value: 40, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'avatar', name: 'Author Avatar', x: 16, y: 305, props: { name: 'Alex Kim', shape: 'circle' }, style: { width: { value: 32, unit: 'px' }, height: { value: 32, unit: 'px' } } },
      { type: 'text', name: 'Author Name', x: 56, y: 307, props: { content: 'Alex Kim' }, style: { width: { value: 80, unit: 'px' }, height: { value: 16, unit: 'px' }, fontSize: 13, fontWeight: '500', color: '#e2e8f0' } },
      { type: 'text', name: 'Post Date', x: 56, y: 325, props: { content: 'Feb 20, 2026 · 5 min read' }, style: { width: { value: 160, unit: 'px' }, height: { value: 14, unit: 'px' }, fontSize: 11, color: '#64748b' } },
    ],
  },

  /* ═══ MOBILE ═══ */
  {
    id: 'mobile-app-bar',
    name: 'Mobile App Bar',
    description: 'Status bar + title + actions',
    category: 'mobile',
    preview: '📱',
    width: 375, height: 56,
    widgets: [
      { type: 'icon', name: 'Back', x: 12, y: 16, props: { name: 'ChevronLeft', size: 24, color: '#e2e8f0' }, style: { width: { value: 24, unit: 'px' }, height: { value: 24, unit: 'px' } } },
      { type: 'heading', name: 'Screen Title', x: 140, y: 14, props: { content: 'Settings', level: 5 }, style: { width: { value: 100, unit: 'px' }, height: { value: 28, unit: 'px' }, fontSize: 17, fontWeight: '600', color: '#e2e8f0' } },
      { type: 'icon', name: 'More', x: 335, y: 16, props: { name: 'MoreVertical', size: 24, color: '#94a3b8' }, style: { width: { value: 24, unit: 'px' }, height: { value: 24, unit: 'px' } } },
    ],
  },
  {
    id: 'mobile-bottom-tab',
    name: 'Mobile Tab Bar',
    description: 'Bottom navigation with 5 tabs',
    category: 'mobile',
    preview: '📲',
    width: 375, height: 70,
    widgets: [
      { type: 'bottom-nav', name: 'Tab Bar', x: 0, y: 0, props: { items: [{ label: 'Home', icon: 'Home' }, { label: 'Search', icon: 'Search' }, { label: 'Add', icon: 'Plus' }, { label: 'Messages', icon: 'MessageCircle' }, { label: 'Profile', icon: 'User' }], activeIndex: 0 }, style: { width: { value: 375, unit: 'px' }, height: { value: 64, unit: 'px' } } },
    ],
  },
];

/* ──────────────────────────────────────────────
 * Template Helpers
 * ────────────────────────────────────────────── */

function getTemplatesByCategory(): Map<TemplateCategory, Template[]> {
  const m = new Map<TemplateCategory, Template[]>();
  for (const t of TEMPLATES) {
    const list = m.get(t.category) ?? [];
    list.push(t);
    m.set(t.category, list);
  }
  return m;
}

function searchTemplates(query: string): Template[] {
  const lower = query.toLowerCase().trim();
  if (!lower) return TEMPLATES;
  return TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lower) ||
    t.description.toLowerCase().includes(lower) ||
    t.category.includes(lower),
  );
}

/* ──────────────────────────────────────────────
 * Template Card
 * ────────────────────────────────────────────── */

interface TemplateCardProps {
  template: Template;
  onUse: () => void;
}

function TemplateCard({ template, onUse }: TemplateCardProps) {
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('application/template', JSON.stringify(template));
    e.dataTransfer.effectAllowed = 'copy';
  }, [template]);

  return (
    <motion.div
      className={clsx(
        'relative flex flex-col rounded-lg overflow-hidden border border-builder-border/30',
        'bg-builder-elevated/40 hover:bg-builder-elevated/70 hover:border-builder-border/50',
        'cursor-grab active:cursor-grabbing transition-colors group',
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      draggable
      onDragStart={handleDragStart as any}
      onClick={onUse}
    >
      {/* Preview */}
      <div className="h-24 flex items-center justify-center bg-builder-bg/60 relative overflow-hidden">
        {/* Mini visual representation */}
        <div className="relative" style={{ width: '80%', height: '80%' }}>
          {template.widgets.slice(0, 6).map((w, i) => {
            const scale = 0.12;
            return (
              <div
                key={i}
                className="absolute rounded-sm"
                style={{
                  left: `${(w.x / template.width) * 100}%`,
                  top: `${(w.y / template.height) * 100}%`,
                  width: `${Math.min(50, ((w.style?.width as any)?.value ?? 80) * scale)}%`,
                  height: `${Math.min(60, ((w.style?.height as any)?.value ?? 24) * scale * 3)}px`,
                  background: w.type === 'button' ? '#6366f1' : w.type === 'heading' ? '#475569' : w.type === 'image' ? '#1e293b' : '#334155',
                  opacity: 0.9 - i * 0.05,
                }}
              />
            );
          })}
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-builder-accent/0 group-hover:bg-builder-accent/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="text-[10px] font-medium text-builder-accent bg-builder-bg/80 px-2 py-1 rounded">
            Drag or Click
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{template.preview}</span>
          <span className="text-[11px] font-semibold text-builder-text truncate">{template.name}</span>
        </div>
        <p className="text-[9px] text-builder-text-dim mt-0.5 line-clamp-1">{template.description}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[8px] text-builder-text-dim/60 font-mono">{template.widgets.length} widgets</span>
          <span className="text-[8px] text-builder-text-dim/60 font-mono">{template.width}×{template.height}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
 * Template Panel
 * ────────────────────────────────────────────── */

export function TemplatePanel() {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCats, setExpandedCats] = useState<Set<TemplateCategory>>(
    new Set(['hero', 'navigation', 'cards', 'forms', 'auth']),
  );

  const templatesByCategory = useMemo(() => getTemplatesByCategory(), []);
  const searchResults = useMemo(() => searchTemplates(searchQuery), [searchQuery]);
  const isSearching = searchQuery.trim().length > 0;

  const toggleCategory = useCallback((cat: TemplateCategory) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }, []);

  const handleUseTemplate = useCallback((template: Template) => {
    for (const w of template.widgets) {
      dispatch(addWidget({
        type: w.type as WidgetType,
        position: { x: 100 + (w.x ?? 0), y: 100 + (w.y ?? 0) },
        props: w.props ?? {},
        style: w.style ?? {},
        name: w.name,
      }));
    }
  }, [dispatch]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-2.5 border-b border-builder-border/30">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-builder-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7 pl-8 pr-7 text-[11px] bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text placeholder:text-builder-text-dim focus:outline-none focus:border-builder-accent/50 focus:ring-1 focus:ring-builder-accent/20 transition-colors"
          />
          {searchQuery && (
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-builder-text-dim hover:text-builder-text" onClick={() => setSearchQuery('')}>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-builder-border/30">
        {isSearching ? (
          <div className="p-2.5">
            <div className="text-[10px] text-builder-text-dim px-1 pb-2">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {searchResults.map(t => (
                <TemplateCard key={t.id} template={t} onUse={() => handleUseTemplate(t)} />
              ))}
            </div>
          </div>
        ) : (
          Array.from(templatesByCategory.entries()).map(([category, templates]) => (
            <div key={category} className="border-b border-builder-border/20 last:border-0">
              {/* Category Header */}
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-builder-text-dim hover:text-builder-text-muted hover:bg-glass-white-10/50 transition-colors"
                onClick={() => toggleCategory(category)}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">{CATEGORY_INFO[category].icon}</span>
                  {CATEGORY_INFO[category].label}
                  <span className="text-[8px] font-normal text-builder-text-dim/60 normal-case tracking-normal">
                    ({templates.length})
                  </span>
                </span>
                <motion.svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  animate={{ rotate: expandedCats.has(category) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>

              <AnimatePresence initial={false}>
                {expandedCats.has(category) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-2 px-2.5 pb-2.5">
                      {templates.map(t => (
                        <TemplateCard key={t.id} template={t} onUse={() => handleUseTemplate(t)} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-builder-border/30 text-[9px] text-builder-text-dim flex justify-between">
        <span>{TEMPLATES.length} templates</span>
        <span>Drag to canvas</span>
      </div>
    </div>
  );
}
