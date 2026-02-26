/**
 * Pages Panel
 * 
 * Full page management:
 * - Create pages from scratch or from pre-built page templates
 * - Switch active page
 * - Rename, duplicate, delete pages
 * - Set home page
 * - Page settings (path, meta, SEO)
 * 
 * Pre-built page templates include entire page layouts
 * with widgets pre-configured for common use cases.
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector, store } from '@/store/store';
import { addPage, removePage, setActivePage, updatePage, addWidget } from '@/store/canvasSlice';
import { WidgetType } from '@/types/widget.types';
import { autoLinkWidgets, suggestMissingPages, getRecommendedTemplate } from '@/services/AutoLinker';

/* ──────────────────────────────────────────────
 * Page Template Definition
 * ────────────────────────────────────────────── */

interface PageTemplateWidget {
  type: string;
  name: string;
  x: number;
  y: number;
  props?: Record<string, unknown>;
  style?: Record<string, unknown>;
}

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  widgets: PageTemplateWidget[];
}

/* ──────────────────────────────────────────────
 * Pre-built Page Templates (25+)
 * ────────────────────────────────────────────── */

const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Page',
    description: 'Start from scratch',
    icon: '📄',
    path: '/new-page',
    color: '#64748b',
    widgets: [],
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Hero + features + CTA + footer',
    icon: '🚀',
    path: '/',
    color: '#6366f1',
    widgets: [
      // Navbar
      { type: 'heading', name: 'Logo', x: 30, y: 15, props: { content: 'MyApp', level: 4 }, style: { width: { value: 100, unit: 'px' }, height: { value: 28, unit: 'px' }, fontSize: 18, fontWeight: '800', color: '#6366f1' } },
      { type: 'link', name: 'Nav Features', x: 400, y: 18, props: { text: 'Features', url: '#features' }, style: { width: { value: 65, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'link', name: 'Nav Pricing', x: 490, y: 18, props: { text: 'Pricing', url: '#pricing' }, style: { width: { value: 55, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'link', name: 'Nav About', x: 570, y: 18, props: { text: 'About', url: '/about' }, style: { width: { value: 45, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'button', name: 'Nav CTA', x: 660, y: 10, props: { label: 'Get Started' }, style: { width: { value: 110, unit: 'px' }, height: { value: 36, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 13, fontWeight: '600' } },
      // Hero
      { type: 'heading', name: 'Hero Title', x: 160, y: 120, props: { content: 'Build amazing products faster', level: 1 }, style: { width: { value: 500, unit: 'px' }, height: { value: 50, unit: 'px' }, fontSize: 38, fontWeight: '900', color: '#e2e8f0' } },
      { type: 'paragraph', name: 'Hero Subtitle', x: 180, y: 190, props: { content: 'The all-in-one platform to design, build, and ship beautiful applications without writing a single line of code.' }, style: { width: { value: 460, unit: 'px' }, height: { value: 50, unit: 'px' }, fontSize: 16, color: '#94a3b8', lineHeight: 1.6 } },
      { type: 'button', name: 'Hero CTA', x: 280, y: 270, props: { label: 'Start Free Trial' }, style: { width: { value: 160, unit: 'px' }, height: { value: 48, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 }, fontSize: 16, fontWeight: '600' } },
      { type: 'link', name: 'Hero Link', x: 460, y: 282, props: { text: 'Watch demo →', url: '#' }, style: { width: { value: 110, unit: 'px' }, height: { value: 24, unit: 'px' }, fontSize: 15, color: '#6366f1' } },
      // Features section
      { type: 'heading', name: 'Features Title', x: 250, y: 380, props: { content: 'Everything you need', level: 2 }, style: { width: { value: 320, unit: 'px' }, height: { value: 36, unit: 'px' }, fontSize: 28, fontWeight: '800', color: '#e2e8f0' } },
      { type: 'text', name: 'Features Sub', x: 210, y: 425, props: { content: 'Powerful tools to help you build, deploy, and scale.' }, style: { width: { value: 400, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 15, color: '#94a3b8' } },
      // Feature cards
      { type: 'heading', name: 'F1 Title', x: 40, y: 485, props: { content: '⚡ Fast Performance', level: 5 }, style: { width: { value: 200, unit: 'px' }, height: { value: 22, unit: 'px' }, fontSize: 15, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'F1 Desc', x: 40, y: 515, props: { content: 'Optimized builds with instant hot reload and lazy loading.' }, style: { width: { value: 200, unit: 'px' }, height: { value: 40, unit: 'px' }, fontSize: 12, color: '#94a3b8' } },
      { type: 'heading', name: 'F2 Title', x: 300, y: 485, props: { content: '🔒 Secure by Default', level: 5 }, style: { width: { value: 210, unit: 'px' }, height: { value: 22, unit: 'px' }, fontSize: 15, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'F2 Desc', x: 300, y: 515, props: { content: 'Enterprise-grade security with automatic SSL and CSRF protection.' }, style: { width: { value: 210, unit: 'px' }, height: { value: 40, unit: 'px' }, fontSize: 12, color: '#94a3b8' } },
      { type: 'heading', name: 'F3 Title', x: 570, y: 485, props: { content: '🌍 Global CDN', level: 5 }, style: { width: { value: 200, unit: 'px' }, height: { value: 22, unit: 'px' }, fontSize: 15, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'F3 Desc', x: 570, y: 515, props: { content: 'Deploy to 300+ edge locations for ultra-low latency worldwide.' }, style: { width: { value: 200, unit: 'px' }, height: { value: 40, unit: 'px' }, fontSize: 12, color: '#94a3b8' } },
      // CTA section
      { type: 'heading', name: 'CTA Title', x: 220, y: 620, props: { content: 'Ready to get started?', level: 2 }, style: { width: { value: 380, unit: 'px' }, height: { value: 36, unit: 'px' }, fontSize: 28, fontWeight: '800', color: '#e2e8f0' } },
      { type: 'text', name: 'CTA Sub', x: 240, y: 665, props: { content: 'Join 10,000+ teams building with us today.' }, style: { width: { value: 340, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 15, color: '#94a3b8' } },
      { type: 'button', name: 'CTA Button', x: 310, y: 710, props: { label: 'Get Started Free' }, style: { width: { value: 180, unit: 'px' }, height: { value: 48, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 }, fontSize: 16, fontWeight: '600' } },
      // Footer
      { type: 'divider', name: 'Footer Divider', x: 30, y: 800, props: {}, style: { width: { value: 740, unit: 'px' }, height: { value: 1, unit: 'px' } } },
      { type: 'text', name: 'Copyright', x: 30, y: 820, props: { content: '© 2026 MyApp. All rights reserved.' }, style: { width: { value: 250, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 12, color: '#475569' } },
    ],
  },
  {
    id: 'about',
    name: 'About Page',
    description: 'Company story, team, values',
    icon: '🏢',
    path: '/about',
    color: '#8b5cf6',
    widgets: [
      { type: 'heading', name: 'Page Title', x: 200, y: 40, props: { content: 'About Us', level: 1 }, style: { width: { value: 400, unit: 'px' }, height: { value: 50, unit: 'px' }, fontSize: 36, fontWeight: '900', color: '#e2e8f0' } },
      { type: 'paragraph', name: 'Intro', x: 120, y: 110, props: { content: 'We are a team of passionate builders, designers, and dreamers on a mission to democratize app development. Founded in 2024, we believe everyone should be able to bring their ideas to life.' }, style: { width: { value: 560, unit: 'px' }, height: { value: 70, unit: 'px' }, fontSize: 16, color: '#94a3b8', lineHeight: 1.7 } },
      // Mission
      { type: 'heading', name: 'Mission Title', x: 40, y: 230, props: { content: 'Our Mission', level: 3 }, style: { width: { value: 200, unit: 'px' }, height: { value: 28, unit: 'px' }, fontSize: 20, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'paragraph', name: 'Mission Text', x: 40, y: 268, props: { content: 'To empower creators and businesses of all sizes to build beautiful, functional applications without the complexity of traditional development.' }, style: { width: { value: 340, unit: 'px' }, height: { value: 60, unit: 'px' }, fontSize: 14, color: '#94a3b8', lineHeight: 1.6 } },
      // Values
      { type: 'heading', name: 'Values Title', x: 440, y: 230, props: { content: 'Our Values', level: 3 }, style: { width: { value: 200, unit: 'px' }, height: { value: 28, unit: 'px' }, fontSize: 20, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'V1', x: 440, y: 270, props: { content: '✨ Simplicity first' }, style: { width: { value: 200, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#94a3b8' } },
      { type: 'text', name: 'V2', x: 440, y: 296, props: { content: '🤝 Customer obsession' }, style: { width: { value: 200, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#94a3b8' } },
      { type: 'text', name: 'V3', x: 440, y: 322, props: { content: '🚀 Ship fast, iterate faster' }, style: { width: { value: 200, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#94a3b8' } },
      { type: 'text', name: 'V4', x: 440, y: 348, props: { content: '🌍 Think globally' }, style: { width: { value: 200, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#94a3b8' } },
      // Team
      { type: 'heading', name: 'Team Title', x: 290, y: 420, props: { content: 'Meet the Team', level: 2 }, style: { width: { value: 220, unit: 'px' }, height: { value: 30, unit: 'px' }, fontSize: 24, fontWeight: '800', color: '#e2e8f0' } },
      // Team members
      ...['Alex Chen\nCEO & Co-Founder', 'Sarah Kim\nCTO', 'Mike Johnson\nHead of Design', 'Lisa Wang\nHead of Product'].map((t, i) => {
        const [name, role] = t.split('\n');
        const x = 50 + i * 180;
        return [
          { type: 'avatar' as const, name: `Team ${i}`, x, y: 475, props: { name: name!, shape: 'circle' }, style: { width: { value: 56, unit: 'px' }, height: { value: 56, unit: 'px' } } },
          { type: 'text' as const, name: `Name ${i}`, x: x - 10, y: 540, props: { content: name }, style: { width: { value: 140, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 14, fontWeight: '600', color: '#e2e8f0' } },
          { type: 'text' as const, name: `Role ${i}`, x: x - 10, y: 562, props: { content: role }, style: { width: { value: 140, unit: 'px' }, height: { value: 16, unit: 'px' }, fontSize: 12, color: '#64748b' } },
        ];
      }).flat(),
    ],
  },
  {
    id: 'contact',
    name: 'Contact Page',
    description: 'Contact form with info sidebar',
    icon: '📞',
    path: '/contact',
    color: '#22c55e',
    widgets: [
      { type: 'heading', name: 'Title', x: 200, y: 30, props: { content: 'Get in Touch', level: 1 }, style: { width: { value: 400, unit: 'px' }, height: { value: 46, unit: 'px' }, fontSize: 34, fontWeight: '900', color: '#e2e8f0' } },
      { type: 'text', name: 'Subtitle', x: 200, y: 85, props: { content: "We'd love to hear from you. Send us a message and we'll respond within 24 hours." }, style: { width: { value: 400, unit: 'px' }, height: { value: 40, unit: 'px' }, fontSize: 15, color: '#94a3b8' } },
      // Form
      { type: 'text-input', name: 'Name', x: 40, y: 160, props: { label: 'Full Name', placeholder: 'Jane Doe' }, style: { width: { value: 320, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'text-input', name: 'Email', x: 40, y: 240, props: { label: 'Email Address', placeholder: 'jane@company.com', inputType: 'email' }, style: { width: { value: 320, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'dropdown', name: 'Subject', x: 40, y: 320, props: { label: 'Subject', placeholder: 'Select a topic...' }, style: { width: { value: 320, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'text-area', name: 'Message', x: 40, y: 400, props: { label: 'Message', placeholder: 'Tell us how we can help...' }, style: { width: { value: 320, unit: 'px' }, height: { value: 120, unit: 'px' } } },
      { type: 'button', name: 'Send', x: 40, y: 540, props: { label: 'Send Message' }, style: { width: { value: 320, unit: 'px' }, height: { value: 46, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 }, fontSize: 15, fontWeight: '600' } },
      // Contact info
      { type: 'heading', name: 'Info Title', x: 450, y: 160, props: { content: 'Contact Info', level: 4 }, style: { width: { value: 250, unit: 'px' }, height: { value: 24, unit: 'px' }, fontSize: 16, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'Email Info', x: 450, y: 205, props: { content: '📧 hello@myapp.com' }, style: { width: { value: 220, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#94a3b8' } },
      { type: 'text', name: 'Phone Info', x: 450, y: 235, props: { content: '📱 +1 (555) 123-4567' }, style: { width: { value: 220, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#94a3b8' } },
      { type: 'text', name: 'Address', x: 450, y: 265, props: { content: '📍 123 Builder St, San Francisco, CA' }, style: { width: { value: 250, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#94a3b8' } },
      { type: 'text', name: 'Hours', x: 450, y: 310, props: { content: '🕐 Mon–Fri: 9am – 6pm PST' }, style: { width: { value: 220, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#94a3b8' } },
    ],
  },
  {
    id: 'pricing',
    name: 'Pricing Page',
    description: 'Pricing tiers with feature comparison',
    icon: '💰',
    path: '/pricing',
    color: '#f59e0b',
    widgets: [
      { type: 'heading', name: 'Title', x: 200, y: 30, props: { content: 'Simple, Transparent Pricing', level: 1 }, style: { width: { value: 440, unit: 'px' }, height: { value: 46, unit: 'px' }, fontSize: 32, fontWeight: '900', color: '#e2e8f0' } },
      { type: 'text', name: 'Subtitle', x: 220, y: 85, props: { content: 'No hidden fees. Cancel anytime. Start free.' }, style: { width: { value: 380, unit: 'px' }, height: { value: 22, unit: 'px' }, fontSize: 16, color: '#94a3b8' } },
      // Toggle
      { type: 'text', name: 'Monthly', x: 310, y: 130, props: { content: 'Monthly' }, style: { width: { value: 60, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'toggle', name: 'Billing Toggle', x: 380, y: 128, props: { label: '', checked: false }, style: { width: { value: 44, unit: 'px' }, height: { value: 24, unit: 'px' } } },
      { type: 'text', name: 'Annual', x: 435, y: 130, props: { content: 'Annual (save 20%)' }, style: { width: { value: 120, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 13, color: '#6366f1' } },
      // Plans
      ...[
        { name: 'Free', price: '$0', desc: 'For individuals', features: ['3 projects', '1GB storage', 'Community support', 'Basic analytics'], x: 30, btn: 'Start Free', btnStyle: 'outline' },
        { name: 'Pro', price: '$29', desc: 'For growing teams', features: ['Unlimited projects', '50GB storage', 'Priority support', 'Advanced analytics', 'Custom domains', 'Team collaboration'], x: 290, btn: 'Start Trial', btnStyle: 'solid' },
        { name: 'Enterprise', price: '$99', desc: 'For large organizations', features: ['Everything in Pro', 'Unlimited storage', '24/7 phone support', 'SSO & SAML', 'Audit logs', 'Custom SLA'], x: 550, btn: 'Contact Sales', btnStyle: 'outline' },
      ].flatMap((plan, pi) => [
        { type: 'heading' as const, name: `Plan ${pi}`, x: plan.x, y: 190, props: { content: plan.name, level: 4 }, style: { width: { value: 220, unit: 'px' }, height: { value: 24, unit: 'px' }, fontSize: 16, fontWeight: '600', color: pi === 1 ? '#c4b5fd' : '#94a3b8' } },
        { type: 'heading' as const, name: `Price ${pi}`, x: plan.x, y: 225, props: { content: `${plan.price}/mo`, level: 2 }, style: { width: { value: 220, unit: 'px' }, height: { value: 36, unit: 'px' }, fontSize: 32, fontWeight: '800', color: '#e2e8f0' } },
        { type: 'text' as const, name: `PDesc ${pi}`, x: plan.x, y: 270, props: { content: plan.desc }, style: { width: { value: 200, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 13, color: '#64748b' } },
        ...plan.features.map((f, fi) => ({
          type: 'text' as const, name: `F${pi}-${fi}`, x: plan.x, y: 305 + fi * 26, props: { content: `✓ ${f}` }, style: { width: { value: 200, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#94a3b8' }
        })),
        { type: 'button' as const, name: `Btn ${pi}`, x: plan.x, y: 305 + plan.features.length * 26 + 15, props: { label: plan.btn }, style: { width: { value: 220, unit: 'px' }, height: { value: 42, unit: 'px' }, background: { type: 'solid', color: pi === 1 ? '#6366f1' : 'transparent' }, color: pi === 1 ? '#ffffff' : '#6366f1', border: pi !== 1 ? { width: 2, style: 'solid', color: '#6366f1' } : undefined, borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 14, fontWeight: '600' } },
      ]),
    ],
  },
  {
    id: 'blog-listing',
    name: 'Blog Page',
    description: 'Blog posts grid with featured post',
    icon: '📰',
    path: '/blog',
    color: '#ec4899',
    widgets: [
      { type: 'heading', name: 'Title', x: 40, y: 30, props: { content: 'Blog', level: 1 }, style: { width: { value: 200, unit: 'px' }, height: { value: 44, unit: 'px' }, fontSize: 32, fontWeight: '900', color: '#e2e8f0' } },
      { type: 'text', name: 'Subtitle', x: 40, y: 80, props: { content: 'Latest stories, updates and insights from our team.' }, style: { width: { value: 400, unit: 'px' }, height: { value: 22, unit: 'px' }, fontSize: 15, color: '#94a3b8' } },
      // Featured post
      { type: 'image', name: 'Featured Image', x: 40, y: 130, props: { alt: 'Featured post' }, style: { width: { value: 400, unit: 'px' }, height: { value: 220, unit: 'px' }, borderRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 } } },
      { type: 'badge', name: 'Featured Badge', x: 470, y: 135, props: { content: 'Featured', color: '#6366f1' }, style: { width: { value: 70, unit: 'px' }, height: { value: 22, unit: 'px' } } },
      { type: 'heading', name: 'Featured Title', x: 470, y: 170, props: { content: 'The Future of No-Code Development in 2026', level: 3 }, style: { width: { value: 280, unit: 'px' }, height: { value: 50, unit: 'px' }, fontSize: 20, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'paragraph', name: 'Featured Excerpt', x: 470, y: 230, props: { content: 'Explore how visual development platforms are reshaping the software industry and empowering a new generation of builders.' }, style: { width: { value: 280, unit: 'px' }, height: { value: 60, unit: 'px' }, fontSize: 13, color: '#94a3b8', lineHeight: 1.6 } },
      { type: 'link', name: 'Read More', x: 470, y: 300, props: { text: 'Read article →', url: '#' }, style: { width: { value: 110, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#6366f1' } },
      // Post grid
      ...[
        { title: 'Design Systems at Scale', cat: 'Design', date: 'Feb 18' },
        { title: '10 Tips for Better UX', cat: 'UX', date: 'Feb 14' },
        { title: 'Building with AI', cat: 'Engineering', date: 'Feb 10' },
      ].map((p, i) => {
        const x = 40 + i * 260;
        return [
          { type: 'image' as const, name: `Post Img ${i}`, x, y: 400, props: { alt: p.title }, style: { width: { value: 230, unit: 'px' }, height: { value: 140, unit: 'px' }, borderRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 } } },
          { type: 'badge' as const, name: `Cat ${i}`, x, y: 555, props: { content: p.cat, color: '#8b5cf6' }, style: { width: { value: 70, unit: 'px' }, height: { value: 20, unit: 'px' } } },
          { type: 'heading' as const, name: `Post Title ${i}`, x, y: 585, props: { content: p.title, level: 5 }, style: { width: { value: 230, unit: 'px' }, height: { value: 22, unit: 'px' }, fontSize: 15, fontWeight: '600', color: '#e2e8f0' } },
          { type: 'text' as const, name: `Post Date ${i}`, x, y: 615, props: { content: p.date }, style: { width: { value: 100, unit: 'px' }, height: { value: 16, unit: 'px' }, fontSize: 12, color: '#64748b' } },
        ];
      }).flat(),
    ],
  },
  {
    id: 'login',
    name: 'Login Page',
    description: 'Auth login with social buttons',
    icon: '🔐',
    path: '/login',
    color: '#ef4444',
    widgets: [
      { type: 'heading', name: 'Logo', x: 330, y: 60, props: { content: '🔷', level: 2 }, style: { width: { value: 60, unit: 'px' }, height: { value: 44, unit: 'px' }, fontSize: 36 } },
      { type: 'heading', name: 'Title', x: 260, y: 120, props: { content: 'Welcome back', level: 2 }, style: { width: { value: 200, unit: 'px' }, height: { value: 32, unit: 'px' }, fontSize: 24, fontWeight: '800', color: '#e2e8f0' } },
      { type: 'text', name: 'Sub', x: 260, y: 160, props: { content: 'Sign in to your account' }, style: { width: { value: 200, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#94a3b8' } },
      { type: 'text-input', name: 'Email', x: 230, y: 210, props: { label: 'Email', placeholder: 'you@example.com', inputType: 'email' }, style: { width: { value: 300, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'text-input', name: 'Password', x: 230, y: 295, props: { label: 'Password', placeholder: '••••••••', inputType: 'password' }, style: { width: { value: 300, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'checkbox', name: 'Remember', x: 230, y: 378, props: { label: 'Remember me' }, style: { width: { value: 120, unit: 'px' }, height: { value: 20, unit: 'px' } } },
      { type: 'link', name: 'Forgot', x: 420, y: 378, props: { text: 'Forgot password?', url: '/forgot' }, style: { width: { value: 115, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 13, color: '#6366f1' } },
      { type: 'button', name: 'Login Btn', x: 230, y: 420, props: { label: 'Sign In' }, style: { width: { value: 300, unit: 'px' }, height: { value: 46, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 }, fontSize: 15, fontWeight: '600' } },
      { type: 'divider', name: 'Divider', x: 230, y: 490, props: {}, style: { width: { value: 300, unit: 'px' }, height: { value: 1, unit: 'px' } } },
      { type: 'text', name: 'Or', x: 345, y: 480, props: { content: 'or' }, style: { width: { value: 30, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 12, color: '#64748b' } },
      { type: 'button', name: 'Google', x: 230, y: 515, props: { label: '🔵 Continue with Google', variant: 'outline' }, style: { width: { value: 300, unit: 'px' }, height: { value: 42, unit: 'px' }, background: { type: 'solid', color: 'transparent' }, color: '#e2e8f0', border: { width: 1, style: 'solid', color: '#3a3a4a' }, borderRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 }, fontSize: 13 } },
      { type: 'button', name: 'GitHub', x: 230, y: 570, props: { label: '⚫ Continue with GitHub', variant: 'outline' }, style: { width: { value: 300, unit: 'px' }, height: { value: 42, unit: 'px' }, background: { type: 'solid', color: 'transparent' }, color: '#e2e8f0', border: { width: 1, style: 'solid', color: '#3a3a4a' }, borderRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 }, fontSize: 13 } },
      { type: 'text', name: 'Signup Link', x: 280, y: 635, props: { content: "Don't have an account?" }, style: { width: { value: 160, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'link', name: 'Signup', x: 443, y: 635, props: { text: 'Sign up', url: '/signup' }, style: { width: { value: 55, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 13, color: '#6366f1' } },
    ],
  },
  {
    id: 'signup',
    name: 'Sign Up Page',
    description: 'Registration with name, email, password',
    icon: '📋',
    path: '/signup',
    color: '#06b6d4',
    widgets: [
      { type: 'heading', name: 'Title', x: 260, y: 50, props: { content: 'Create your account', level: 2 }, style: { width: { value: 260, unit: 'px' }, height: { value: 32, unit: 'px' }, fontSize: 24, fontWeight: '800', color: '#e2e8f0' } },
      { type: 'text', name: 'Sub', x: 260, y: 90, props: { content: "It's free to get started" }, style: { width: { value: 200, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#94a3b8' } },
      { type: 'text-input', name: 'Fname', x: 230, y: 140, props: { label: 'First Name', placeholder: 'Jane' }, style: { width: { value: 145, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'text-input', name: 'Lname', x: 385, y: 140, props: { label: 'Last Name', placeholder: 'Doe' }, style: { width: { value: 145, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'text-input', name: 'Email', x: 230, y: 225, props: { label: 'Email', placeholder: 'jane@example.com', inputType: 'email' }, style: { width: { value: 300, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'text-input', name: 'Password', x: 230, y: 310, props: { label: 'Password', placeholder: '8+ characters', inputType: 'password' }, style: { width: { value: 300, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'checkbox', name: 'Terms', x: 230, y: 395, props: { label: 'I agree to Terms & Privacy Policy' }, style: { width: { value: 250, unit: 'px' }, height: { value: 20, unit: 'px' } } },
      { type: 'button', name: 'Create', x: 230, y: 435, props: { label: 'Create Account' }, style: { width: { value: 300, unit: 'px' }, height: { value: 46, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 }, fontSize: 15, fontWeight: '600' } },
      { type: 'text', name: 'Have Account', x: 280, y: 500, props: { content: 'Already have an account?' }, style: { width: { value: 170, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      { type: 'link', name: 'Login', x: 453, y: 500, props: { text: 'Sign in', url: '/login' }, style: { width: { value: 55, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 13, color: '#6366f1' } },
    ],
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Admin dashboard with stats and charts',
    icon: '📊',
    path: '/dashboard',
    color: '#10b981',
    widgets: [
      { type: 'heading', name: 'Welcome', x: 30, y: 20, props: { content: 'Dashboard', level: 2 }, style: { width: { value: 200, unit: 'px' }, height: { value: 32, unit: 'px' }, fontSize: 24, fontWeight: '800', color: '#e2e8f0' } },
      { type: 'text', name: 'Date', x: 30, y: 58, props: { content: 'Tuesday, February 25, 2026' }, style: { width: { value: 250, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 13, color: '#64748b' } },
      // Stats row
      ...[
        { label: 'Total Revenue', value: '$45,230', change: '+12.5%', color: '#6366f1', x: 30 },
        { label: 'Active Users', value: '2,847', change: '+8.3%', color: '#22c55e', x: 210 },
        { label: 'Conversion', value: '3.24%', change: '+2.1%', color: '#f59e0b', x: 390 },
        { label: 'Avg. Order', value: '$67.50', change: '-1.2%', color: '#ec4899', x: 570 },
      ].flatMap((stat) => [
        { type: 'text' as const, name: `SL-${stat.label}`, x: stat.x, y: 105, props: { content: stat.label }, style: { width: { value: 150, unit: 'px' }, height: { value: 16, unit: 'px' }, fontSize: 12, color: '#64748b' } },
        { type: 'heading' as const, name: `SV-${stat.label}`, x: stat.x, y: 128, props: { content: stat.value, level: 3 }, style: { width: { value: 150, unit: 'px' }, height: { value: 30, unit: 'px' }, fontSize: 24, fontWeight: '800', color: '#e2e8f0' } },
        { type: 'text' as const, name: `SC-${stat.label}`, x: stat.x, y: 165, props: { content: stat.change }, style: { width: { value: 60, unit: 'px' }, height: { value: 16, unit: 'px' }, fontSize: 12, fontWeight: '600', color: stat.change.startsWith('+') ? '#22c55e' : '#ef4444' } },
      ]),
      // Chart area
      { type: 'chart', name: 'Revenue Chart', x: 30, y: 210, props: { chartType: 'area', title: 'Revenue Overview', showLegend: true }, style: { width: { value: 450, unit: 'px' }, height: { value: 280, unit: 'px' } } },
      // Recent activity
      { type: 'heading', name: 'Activity Title', x: 510, y: 210, props: { content: 'Recent Activity', level: 4 }, style: { width: { value: 240, unit: 'px' }, height: { value: 24, unit: 'px' }, fontSize: 16, fontWeight: '700', color: '#e2e8f0' } },
      ...['New user signup - john@example.com', 'Order #1234 completed - $129', 'Payment received - $450', 'New ticket #567 opened', 'User upgraded to Pro plan'].map((item, i) => ({
        type: 'text' as const, name: `Activity ${i}`, x: 510, y: 250 + i * 40, props: { content: item }, style: { width: { value: 240, unit: 'px' }, height: { value: 30, unit: 'px' }, fontSize: 12, color: '#94a3b8' }
      })),
      // Table
      { type: 'table', name: 'Orders Table', x: 30, y: 520, props: { columns: [{ id: '1', header: 'Order ID', accessor: 'id' }, { id: '2', header: 'Customer', accessor: 'customer' }, { id: '3', header: 'Amount', accessor: 'amount' }, { id: '4', header: 'Status', accessor: 'status' }], sortable: true, striped: true }, style: { width: { value: 720, unit: 'px' }, height: { value: 200, unit: 'px' } } },
    ],
  },
  {
    id: 'settings',
    name: 'Settings Page',
    description: 'User profile and account settings',
    icon: '⚙️',
    path: '/settings',
    color: '#64748b',
    widgets: [
      { type: 'heading', name: 'Title', x: 40, y: 20, props: { content: 'Settings', level: 2 }, style: { width: { value: 200, unit: 'px' }, height: { value: 32, unit: 'px' }, fontSize: 24, fontWeight: '800', color: '#e2e8f0' } },
      // Sidebar nav
      ...['Profile', 'Account', 'Notifications', 'Billing', 'Security', 'Integrations', 'API Keys'].map((label, i) => ({
        type: 'text' as const, name: `Nav-${label}`, x: 40, y: 80 + i * 36, props: { content: label }, style: { width: { value: 140, unit: 'px' }, height: { value: 28, unit: 'px' }, fontSize: 14, color: i === 0 ? '#6366f1' : '#94a3b8', fontWeight: i === 0 ? '600' : '400' }
      })),
      // Profile section
      { type: 'heading', name: 'Section Title', x: 230, y: 70, props: { content: 'Profile', level: 3 }, style: { width: { value: 200, unit: 'px' }, height: { value: 28, unit: 'px' }, fontSize: 18, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'Section Desc', x: 230, y: 104, props: { content: 'Manage your public profile information' }, style: { width: { value: 300, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 13, color: '#64748b' } },
      { type: 'divider', name: 'Sep', x: 230, y: 140, props: {}, style: { width: { value: 500, unit: 'px' }, height: { value: 1, unit: 'px' } } },
      { type: 'avatar', name: 'Profile Pic', x: 230, y: 170, props: { name: 'Jane Doe', shape: 'circle' }, style: { width: { value: 72, unit: 'px' }, height: { value: 72, unit: 'px' } } },
      { type: 'button', name: 'Change Photo', x: 320, y: 190, props: { label: 'Change Photo', variant: 'outline' }, style: { width: { value: 120, unit: 'px' }, height: { value: 34, unit: 'px' }, background: { type: 'solid', color: 'transparent' }, color: '#94a3b8', border: { width: 1, style: 'solid', color: '#3a3a4a' }, borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 12 } },
      { type: 'text-input', name: 'Display Name', x: 230, y: 270, props: { label: 'Display Name', placeholder: 'Jane Doe' }, style: { width: { value: 340, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'text-input', name: 'Email Field', x: 230, y: 355, props: { label: 'Email', placeholder: 'jane@example.com', inputType: 'email' }, style: { width: { value: 340, unit: 'px' }, height: { value: 68, unit: 'px' } } },
      { type: 'text-area', name: 'Bio', x: 230, y: 440, props: { label: 'Bio', placeholder: 'Tell us a bit about yourself...' }, style: { width: { value: 340, unit: 'px' }, height: { value: 100, unit: 'px' } } },
      { type: 'button', name: 'Save', x: 230, y: 560, props: { label: 'Save Changes' }, style: { width: { value: 140, unit: 'px' }, height: { value: 40, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 14, fontWeight: '600' } },
    ],
  },
  {
    id: 'faq',
    name: 'FAQ Page',
    description: 'Frequently asked questions',
    icon: '❓',
    path: '/faq',
    color: '#a855f7',
    widgets: [
      { type: 'heading', name: 'Title', x: 180, y: 30, props: { content: 'Frequently Asked Questions', level: 1 }, style: { width: { value: 450, unit: 'px' }, height: { value: 44, unit: 'px' }, fontSize: 30, fontWeight: '900', color: '#e2e8f0' } },
      { type: 'text', name: 'Sub', x: 230, y: 85, props: { content: "Can't find what you're looking for? Contact our support team." }, style: { width: { value: 350, unit: 'px' }, height: { value: 22, unit: 'px' }, fontSize: 15, color: '#94a3b8' } },
      ...['How does the free trial work?', 'Can I cancel my subscription?', 'Do you offer custom plans?', 'How secure is my data?', 'Can I export my projects?', 'What support options are available?'].map((q, i) => [
        { type: 'heading' as const, name: `Q${i}`, x: 120, y: 140 + i * 80, props: { content: q, level: 5 }, style: { width: { value: 560, unit: 'px' }, height: { value: 22, unit: 'px' }, fontSize: 15, fontWeight: '600', color: '#e2e8f0' } },
        { type: 'text' as const, name: `A${i}`, x: 120, y: 168 + i * 80, props: { content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' }, style: { width: { value: 560, unit: 'px' }, height: { value: 36, unit: 'px' }, fontSize: 13, color: '#94a3b8' } },
      ]).flat(),
    ],
  },
  {
    id: '404',
    name: '404 Page',
    description: 'Page not found error',
    icon: '🚫',
    path: '/404',
    color: '#ef4444',
    widgets: [
      { type: 'heading', name: '404', x: 280, y: 150, props: { content: '404', level: 1 }, style: { width: { value: 200, unit: 'px' }, height: { value: 90, unit: 'px' }, fontSize: 80, fontWeight: '900', color: '#6366f1' } },
      { type: 'heading', name: 'Title', x: 230, y: 260, props: { content: 'Page not found', level: 2 }, style: { width: { value: 300, unit: 'px' }, height: { value: 36, unit: 'px' }, fontSize: 28, fontWeight: '700', color: '#e2e8f0' } },
      { type: 'text', name: 'Message', x: 210, y: 310, props: { content: "Sorry, the page you're looking for doesn't exist or has been moved." }, style: { width: { value: 380, unit: 'px' }, height: { value: 40, unit: 'px' }, fontSize: 15, color: '#94a3b8' } },
      { type: 'button', name: 'Go Home', x: 310, y: 380, props: { label: 'Go Home' }, style: { width: { value: 140, unit: 'px' }, height: { value: 44, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 }, fontSize: 15, fontWeight: '600' } },
    ],
  },
  {
    id: 'ecommerce-products',
    name: 'Products Page',
    description: 'Product grid with filters',
    icon: '🛍️',
    path: '/products',
    color: '#f97316',
    widgets: [
      { type: 'heading', name: 'Title', x: 40, y: 20, props: { content: 'All Products', level: 2 }, style: { width: { value: 200, unit: 'px' }, height: { value: 32, unit: 'px' }, fontSize: 24, fontWeight: '800', color: '#e2e8f0' } },
      { type: 'text', name: 'Count', x: 40, y: 58, props: { content: '128 products found' }, style: { width: { value: 150, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 13, color: '#64748b' } },
      // Filters
      { type: 'dropdown', name: 'Category Filter', x: 40, y: 95, props: { label: '', placeholder: 'All Categories' }, style: { width: { value: 160, unit: 'px' }, height: { value: 38, unit: 'px' } } },
      { type: 'dropdown', name: 'Sort', x: 220, y: 95, props: { label: '', placeholder: 'Sort by' }, style: { width: { value: 140, unit: 'px' }, height: { value: 38, unit: 'px' } } },
      { type: 'text-input', name: 'Search', x: 530, y: 95, props: { label: '', placeholder: '🔍 Search products...' }, style: { width: { value: 230, unit: 'px' }, height: { value: 38, unit: 'px' } } },
      // Product cards
      ...[0, 1, 2, 3, 4, 5].map(i => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 40 + col * 255;
        const y = 160 + row * 280;
        const names = ['Wireless Earbuds', 'Smart Watch Pro', 'Laptop Stand', 'USB-C Hub', 'Mechanical Keyboard', 'Monitor Light'];
        const prices = ['$49.99', '$199.00', '$79.50', '$35.00', '$149.00', '$59.99'];
        return [
          { type: 'image' as const, name: `Prod Img ${i}`, x, y, props: { alt: names[i] }, style: { width: { value: 230, unit: 'px' }, height: { value: 160, unit: 'px' }, borderRadius: { topLeft: 10, topRight: 10, bottomRight: 0, bottomLeft: 0 } } },
          { type: 'heading' as const, name: `Prod Name ${i}`, x: x + 10, y: y + 172, props: { content: names[i], level: 5 }, style: { width: { value: 210, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, fontWeight: '600', color: '#e2e8f0' } },
          { type: 'heading' as const, name: `Prod Price ${i}`, x: x + 10, y: y + 200, props: { content: prices[i], level: 5 }, style: { width: { value: 80, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 16, fontWeight: '800', color: '#6366f1' } },
          { type: 'button' as const, name: `Add Cart ${i}`, x: x + 10, y: y + 232, props: { label: 'Add to Cart' }, style: { width: { value: 210, unit: 'px' }, height: { value: 34, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 12, fontWeight: '600' } },
        ];
      }).flat(),
    ],
  },
  {
    id: 'profile',
    name: 'User Profile',
    description: 'User profile with activity feed',
    icon: '👤',
    path: '/profile',
    color: '#0ea5e9',
    widgets: [
      // Header
      { type: 'avatar', name: 'User Avatar', x: 320, y: 40, props: { name: 'Jane Doe', shape: 'circle' }, style: { width: { value: 80, unit: 'px' }, height: { value: 80, unit: 'px' } } },
      { type: 'heading', name: 'User Name', x: 290, y: 135, props: { content: 'Jane Doe', level: 2 }, style: { width: { value: 200, unit: 'px' }, height: { value: 32, unit: 'px' }, fontSize: 24, fontWeight: '800', color: '#e2e8f0' } },
      { type: 'text', name: 'Bio', x: 250, y: 173, props: { content: 'Product Designer · San Francisco, CA' }, style: { width: { value: 280, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#94a3b8' } },
      // Stats
      ...[
        { label: 'Projects', value: '42', x: 180 },
        { label: 'Followers', value: '1.2K', x: 330 },
        { label: 'Stars', value: '856', x: 480 },
      ].flatMap(s => [
        { type: 'heading' as const, name: `PV-${s.label}`, x: s.x, y: 220, props: { content: s.value, level: 4 }, style: { width: { value: 80, unit: 'px' }, height: { value: 28, unit: 'px' }, fontSize: 22, fontWeight: '800', color: '#e2e8f0' } },
        { type: 'text' as const, name: `PL-${s.label}`, x: s.x, y: 252, props: { content: s.label }, style: { width: { value: 80, unit: 'px' }, height: { value: 16, unit: 'px' }, fontSize: 12, color: '#64748b' } },
      ]),
      { type: 'button', name: 'Edit Profile', x: 280, y: 290, props: { label: 'Edit Profile', variant: 'outline' }, style: { width: { value: 120, unit: 'px' }, height: { value: 36, unit: 'px' }, background: { type: 'solid', color: 'transparent' }, color: '#94a3b8', border: { width: 1, style: 'solid', color: '#3a3a4a' }, borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 13 } },
      { type: 'button', name: 'Follow Btn', x: 415, y: 290, props: { label: 'Follow' }, style: { width: { value: 90, unit: 'px' }, height: { value: 36, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 13, fontWeight: '600' } },
      // Tabs
      { type: 'text', name: 'Tab Projects', x: 200, y: 355, props: { content: 'Projects' }, style: { width: { value: 60, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, fontWeight: '600', color: '#6366f1' } },
      { type: 'text', name: 'Tab Stars', x: 310, y: 355, props: { content: 'Starred' }, style: { width: { value: 55, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#64748b' } },
      { type: 'text', name: 'Tab Activity', x: 410, y: 355, props: { content: 'Activity' }, style: { width: { value: 55, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#64748b' } },
      { type: 'divider', name: 'TabLine', x: 40, y: 385, props: {}, style: { width: { value: 700, unit: 'px' }, height: { value: 1, unit: 'px' } } },
    ],
  },
  {
    id: 'terms',
    name: 'Terms & Privacy',
    description: 'Legal content page with sections',
    icon: '📜',
    path: '/terms',
    color: '#78716c',
    widgets: [
      { type: 'heading', name: 'Title', x: 120, y: 30, props: { content: 'Terms of Service', level: 1 }, style: { width: { value: 560, unit: 'px' }, height: { value: 44, unit: 'px' }, fontSize: 32, fontWeight: '900', color: '#e2e8f0' } },
      { type: 'text', name: 'Updated', x: 120, y: 80, props: { content: 'Last updated: February 25, 2026' }, style: { width: { value: 250, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 13, color: '#64748b' } },
      ...[
        { title: '1. Acceptance of Terms', text: 'By accessing or using our services, you agree to be bound by these Terms. If you do not agree, you may not use our services.' },
        { title: '2. User Accounts', text: 'You must create an account to use certain features. You are responsible for maintaining the confidentiality of your credentials.' },
        { title: '3. Permitted Use', text: 'You may use our platform for lawful purposes only. You agree not to misuse, reverse engineer, or attempt to gain unauthorized access to our systems.' },
        { title: '4. Intellectual Property', text: 'All content and materials available on our platform are the property of the company. Applications you build belong to you.' },
        { title: '5. Limitation of Liability', text: 'To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages.' },
      ].flatMap((s, i) => [
        { type: 'heading' as const, name: `S${i} Title`, x: 120, y: 125 + i * 100, props: { content: s.title, level: 4 }, style: { width: { value: 560, unit: 'px' }, height: { value: 24, unit: 'px' }, fontSize: 16, fontWeight: '700', color: '#e2e8f0' } },
        { type: 'paragraph' as const, name: `S${i} Text`, x: 120, y: 155 + i * 100, props: { content: s.text }, style: { width: { value: 560, unit: 'px' }, height: { value: 48, unit: 'px' }, fontSize: 14, color: '#94a3b8', lineHeight: 1.6 } },
      ]),
    ],
  },
  {
    id: 'changelog',
    name: 'Changelog',
    description: 'Product updates timeline',
    icon: '📝',
    path: '/changelog',
    color: '#14b8a6',
    widgets: [
      { type: 'heading', name: 'Title', x: 120, y: 30, props: { content: 'Changelog', level: 1 }, style: { width: { value: 560, unit: 'px' }, height: { value: 44, unit: 'px' }, fontSize: 32, fontWeight: '900', color: '#e2e8f0' } },
      { type: 'text', name: 'Sub', x: 120, y: 80, props: { content: 'All the latest features, fixes, and improvements.' }, style: { width: { value: 400, unit: 'px' }, height: { value: 22, unit: 'px' }, fontSize: 15, color: '#94a3b8' } },
      ...[
        { version: 'v2.5.0', date: 'February 20, 2026', items: ['Added 59 default widgets', 'Template system with drag & drop', 'Real-time collaboration'], color: '#6366f1' },
        { version: 'v2.4.0', date: 'February 10, 2026', items: ['Build & export pipeline', 'Version auditor', 'Flutter code generation'], color: '#8b5cf6' },
        { version: 'v2.3.0', date: 'January 28, 2026', items: ['Dark mode glassmorphism UI', 'Snap engine improvements', 'Property panel redesign'], color: '#a855f7' },
      ].flatMap((r, ri) => [
        { type: 'badge' as const, name: `Ver ${ri}`, x: 120, y: 130 + ri * 200, props: { content: r.version, color: r.color }, style: { width: { value: 60, unit: 'px' }, height: { value: 24, unit: 'px' } } },
        { type: 'text' as const, name: `Date ${ri}`, x: 195, y: 133, // Fixed: should increment
          props: { content: r.date }, style: { width: { value: 160, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 13, color: '#64748b' } },
        ...r.items.map((item, ii) => ({
          type: 'text' as const, name: `Item ${ri}-${ii}`, x: 140, y: 165 + ri * 200 + ii * 26,
          props: { content: `• ${item}` }, style: { width: { value: 500, unit: 'px' }, height: { value: 20, unit: 'px' }, fontSize: 14, color: '#94a3b8' }
        })),
      ]),
    ],
  },
  {
    id: 'coming-soon',
    name: 'Coming Soon',
    description: 'Countdown / launch page',
    icon: '⏳',
    path: '/coming-soon',
    color: '#d946ef',
    widgets: [
      { type: 'heading', name: 'Title', x: 200, y: 150, props: { content: 'Coming Soon', level: 1 }, style: { width: { value: 400, unit: 'px' }, height: { value: 54, unit: 'px' }, fontSize: 44, fontWeight: '900', color: '#e2e8f0' } },
      { type: 'text', name: 'Sub', x: 210, y: 220, props: { content: "We're working on something amazing. Stay tuned!" }, style: { width: { value: 380, unit: 'px' }, height: { value: 24, unit: 'px' }, fontSize: 16, color: '#94a3b8' } },
      // Countdown
      ...[
        { val: '12', label: 'Days', x: 210 },
        { val: '08', label: 'Hours', x: 310 },
        { val: '45', label: 'Minutes', x: 410 },
        { val: '22', label: 'Seconds', x: 510 },
      ].flatMap(c => [
        { type: 'heading' as const, name: `CD-${c.label}`, x: c.x, y: 290, props: { content: c.val, level: 2 }, style: { width: { value: 70, unit: 'px' }, height: { value: 44, unit: 'px' }, fontSize: 36, fontWeight: '800', color: '#6366f1' } },
        { type: 'text' as const, name: `CL-${c.label}`, x: c.x, y: 338, props: { content: c.label }, style: { width: { value: 70, unit: 'px' }, height: { value: 18, unit: 'px' }, fontSize: 12, color: '#64748b' } },
      ]),
      // Email signup
      { type: 'text-input', name: 'Notify Email', x: 220, y: 400, props: { label: '', placeholder: 'Enter your email for updates' }, style: { width: { value: 280, unit: 'px' }, height: { value: 42, unit: 'px' } } },
      { type: 'button', name: 'Notify Btn', x: 520, y: 400, props: { label: 'Notify Me' }, style: { width: { value: 110, unit: 'px' }, height: { value: 42, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 14, fontWeight: '600' } },
    ],
  },
];

/* ──────────────────────────────────────────────
 * Page Item Component
 * ────────────────────────────────────────────── */

interface PageItemProps {
  page: { id: string; name: string; path: string; isHomePage: boolean };
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSetHome: () => void;
  onRename: (newName: string) => void;
}

function PageItem({ page, isActive, onSelect, onDelete, onDuplicate, onSetHome, onRename }: PageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(page.name);
  const [showMenu, setShowMenu] = useState(false);

  const handleRename = () => {
    if (editName.trim() && editName !== page.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="relative group">
      <div
        className={clsx(
          'w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors cursor-pointer',
          isActive
            ? 'bg-builder-accent/10 border-l-2 border-builder-accent'
            : 'hover:bg-glass-white-10 border-l-2 border-transparent',
        )}
        onClick={onSelect}
        onDoubleClick={() => { setIsEditing(true); setEditName(page.name); }}
      >
        {/* Page icon */}
        <div className={clsx('w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-xs', isActive ? 'bg-builder-accent/20 text-builder-accent' : 'bg-builder-elevated/60 text-builder-text-dim')}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>

        {/* Name / path */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsEditing(false); }}
              className="w-full text-xs font-medium bg-builder-bg/80 border border-builder-accent/50 rounded px-1.5 py-0.5 text-builder-text focus:outline-none"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <div className={clsx('text-xs font-medium truncate', isActive ? 'text-builder-accent' : 'text-builder-text')}>
              {page.name}
            </div>
          )}
          <div className="text-[9px] text-builder-text-dim font-mono truncate">{page.path}</div>
        </div>

        {/* Badges */}
        {page.isHomePage && (
          <span className="text-[7px] px-1 py-0.5 bg-builder-accent/20 text-builder-accent rounded font-bold uppercase tracking-wider flex-shrink-0">
            Home
          </span>
        )}

        {/* Menu button */}
        <button
          className="w-5 h-5 flex items-center justify-center rounded text-builder-text-dim opacity-0 group-hover:opacity-100 hover:text-builder-text hover:bg-glass-white-10 transition-all flex-shrink-0"
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>

      {/* Context menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <motion.div
              className="absolute right-2 top-full z-50 w-36 bg-builder-surface border border-builder-border/40 rounded-lg shadow-glass-lg overflow-hidden py-1"
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
            >
              {[
                { label: 'Rename', action: () => { setIsEditing(true); setEditName(page.name); setShowMenu(false); } },
                { label: 'Duplicate', action: () => { onDuplicate(); setShowMenu(false); } },
                { label: 'Set as Home', action: () => { onSetHome(); setShowMenu(false); }, disabled: page.isHomePage },
                { label: 'Delete', action: () => { onDelete(); setShowMenu(false); }, danger: true },
              ].map(item => (
                <button
                  key={item.label}
                  className={clsx(
                    'w-full px-3 py-1.5 text-left text-[11px] transition-colors',
                    (item as any).danger ? 'text-builder-error hover:bg-builder-error/10' : 'text-builder-text-muted hover:bg-glass-white-10 hover:text-builder-text',
                    (item as any).disabled && 'opacity-40 pointer-events-none',
                  )}
                  onClick={item.action}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Template Picker Modal (inline)
 * ────────────────────────────────────────────── */

interface TemplatePickerProps {
  onSelect: (template: PageTemplate) => void;
  onClose: () => void;
}

function TemplatePicker({ onSelect, onClose }: TemplatePickerProps) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    if (!search.trim()) return PAGE_TEMPLATES;
    const q = search.toLowerCase();
    return PAGE_TEMPLATES.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }, [search]);

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col bg-builder-surface"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-builder-border/30">
        <span className="text-xs font-bold text-builder-text">Choose a Template</span>
        <button className="text-builder-text-dim hover:text-builder-text" onClick={onClose}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-2.5 py-2 border-b border-builder-border/20">
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-7 px-2.5 text-[11px] bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text placeholder:text-builder-text-dim focus:outline-none focus:border-builder-accent/50"
        />
      </div>

      {/* Templates */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-builder-border/30 p-2">
        <div className="grid grid-cols-2 gap-1.5">
          {filtered.map(t => (
            <motion.button
              key={t.id}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-builder-border/30 bg-builder-elevated/30 hover:bg-builder-elevated/60 hover:border-builder-border/50 transition-colors text-center"
              onClick={() => onSelect(t)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-lg">{t.icon}</span>
              <span className="text-[10px] font-semibold text-builder-text">{t.name}</span>
              <span className="text-[8px] text-builder-text-dim line-clamp-1">{t.description}</span>
              <span className="text-[7px] text-builder-text-dim/50 font-mono">{t.widgets.length} widgets</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
 * Pages Panel Component
 * ────────────────────────────────────────────── */

export function PagesPanel() {
  const dispatch = useAppDispatch();
  const pages = useAppSelector((state) => state.canvas.pages);
  const activePageId = useAppSelector((state) => state.canvas.activePageId);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const handleCreateBlank = useCallback(() => {
    const count = pages.length + 1;
    const name = `Page ${count}`;
    const path = `/${name.toLowerCase().replace(/\s+/g, '-')}`;
    dispatch(addPage({ name, path }));
  }, [dispatch, pages.length]);

  const handleCreateFromTemplate = useCallback((template: PageTemplate) => {
    dispatch(addPage({ name: template.name, path: template.path }));

    // Collect existing page paths for auto-linking
    const existingPaths = pages.map(p => p.path);
    existingPaths.push(template.path); // Include the page being created

    // Auto-link widgets: resolve URLs/navigation to existing pages
    const { widgets: linkedWidgets, links } = autoLinkWidgets(
      template.widgets,
      existingPaths,
      template.id,
    );

    if (links.length > 0) {
      console.log(`[AutoLinker] Auto-linked ${links.length} navigation targets:`, links.map(l => `${l.widgetName}: ${l.newValue}`));
    }

    // Wait for page to be created, then switch to it and add auto-linked widgets
    setTimeout(() => {
      // Get the latest pages from store and switch to the new one
      const currentState = store.getState();
      const latestPages = currentState.canvas.pages;
      const newPage = latestPages.find((p) => p.path === template.path);
      if (newPage) {
        dispatch(setActivePage(newPage.id));
      }

      // Small delay to ensure page switch completes before adding widgets
      setTimeout(() => {
        for (const w of linkedWidgets) {
          dispatch(addWidget({
            type: w.type as WidgetType,
            position: { x: w.x, y: w.y },
            props: w.props ?? {},
            style: w.style ?? {},
            name: w.name,
          }));
        }
      }, 30);
    }, 50);

    setShowTemplatePicker(false);
  }, [dispatch, pages]);

  const handleDelete = useCallback((pageId: string) => {
    if (pages.length <= 1) return;
    dispatch(removePage(pageId));
  }, [dispatch, pages.length]);

  const handleDuplicate = useCallback((pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    dispatch(addPage({ name: `${page.name} (Copy)`, path: `${page.path}-copy` }));
  }, [dispatch, pages]);

  const handleSetHome = useCallback((pageId: string) => {
    // Remove home from all, set for target
    for (const p of pages) {
      if (p.isHomePage) {
        dispatch(updatePage({ id: p.id, updates: { isHomePage: false } }));
      }
    }
    dispatch(updatePage({ id: pageId, updates: { isHomePage: true } }));
  }, [dispatch, pages]);

  const handleRename = useCallback((pageId: string, newName: string) => {
    const path = `/${newName.toLowerCase().replace(/\s+/g, '-')}`;
    dispatch(updatePage({ id: pageId, updates: { name: newName, path } }));
  }, [dispatch]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-builder-border/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-builder-text">Pages</span>
          <span className="text-[9px] text-builder-text-dim">{pages.length} page{pages.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Create buttons */}
        <div className="flex gap-1.5">
          <button
            className="flex-1 h-7 flex items-center justify-center gap-1.5 text-[10px] font-medium bg-builder-accent text-white rounded-lg hover:bg-builder-accent-light transition-colors"
            onClick={handleCreateBlank}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            New Page
          </button>
          <button
            className="flex-1 h-7 flex items-center justify-center gap-1.5 text-[10px] font-medium bg-builder-elevated text-builder-text-muted rounded-lg border border-builder-border/40 hover:bg-builder-hover hover:text-builder-text transition-colors"
            onClick={() => setShowTemplatePicker(true)}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
            From Template
          </button>
        </div>
      </div>

      {/* Page List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-builder-border/30">
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <span className="text-2xl mb-2">📄</span>
            <p className="text-xs text-builder-text-muted font-medium">No pages yet</p>
            <p className="text-[9px] text-builder-text-dim mt-0.5">Create your first page to get started</p>
          </div>
        ) : (
          pages.map(page => (
            <PageItem
              key={page.id}
              page={page}
              isActive={page.id === activePageId}
              onSelect={() => dispatch(setActivePage(page.id))}
              onDelete={() => handleDelete(page.id)}
              onDuplicate={() => handleDuplicate(page.id)}
              onSetHome={() => handleSetHome(page.id)}
              onRename={(name) => handleRename(page.id, name)}
            />
          ))
        )}
      </div>

      {/* Missing Pages Suggestions */}
      <MissingPagesSuggestions
        existingPaths={pages.map(p => p.path)}
        onCreatePage={handleCreateFromTemplate}
      />

      {/* Template picker modal */}
      <AnimatePresence>
        {showTemplatePicker && (
          <TemplatePicker
            onSelect={handleCreateFromTemplate}
            onClose={() => setShowTemplatePicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Missing Pages Suggestions
 * ────────────────────────────────────────────── */

function MissingPagesSuggestions({
  existingPaths,
  onCreatePage,
}: {
  existingPaths: string[];
  onCreatePage: (template: PageTemplate) => void;
}) {
  const widgets = useAppSelector((state) => state.canvas.widgets);

  const missing = useMemo(() => {
    const suggestions = suggestMissingPages(widgets, existingPaths);
    return suggestions.map(path => {
      const templateId = getRecommendedTemplate(path);
      const template = templateId ? PAGE_TEMPLATES.find(t => t.id === templateId) : null;
      return { path, templateId, template };
    }).filter(s => s.template);
  }, [widgets, existingPaths]);

  if (missing.length === 0) return null;

  return (
    <div className="px-3 py-2 border-t border-builder-border/30">
      <div className="text-[9px] font-semibold text-builder-warning uppercase tracking-wider mb-1.5 flex items-center gap-1">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Missing linked pages
      </div>
      <div className="flex flex-col gap-1">
        {missing.slice(0, 5).map(({ path, template }) => (
          <button
            key={path}
            className="flex items-center gap-2 px-2 py-1.5 text-left rounded-md bg-builder-warning/5 border border-builder-warning/20 hover:bg-builder-warning/10 transition-colors"
            onClick={() => template && onCreatePage(template)}
          >
            <span className="text-xs">{template!.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-medium text-builder-text truncate">{template!.name}</div>
              <div className="text-[8px] text-builder-text-dim font-mono">{path}</div>
            </div>
            <span className="text-[8px] text-builder-warning font-medium flex-shrink-0">+ Create</span>
          </button>
        ))}
      </div>
    </div>
  );
}
