/**
 * Code Generator Service
 * 
 * Generates clean, commented, production-ready source code
 * from the canvas widget tree. Supports React/Next.js (web),
 * Flutter (mobile), and follows Clean Code / SOLID principles.
 */

import {
  WidgetConfig,
  WidgetType,
  WidgetStyle,
  ButtonVariant,
  FlexDirection,
  DisplayType,
  FontWeight,
} from '@/types/widget.types';
import {
  GeneratedFile,
  GeneratedFileType,
  CodeGenOptions,
  BuildConfig,
} from '@/types/build.types';
import { AppPage } from '@/types/canvas.types';
import { TargetPlatform } from '@/types/project.types';

/* ──────────────────────────────────────────────
 * Code Generator
 * ────────────────────────────────────────────── */

export class CodeGenerator {
  private widgets: Record<string, WidgetConfig>;
  private pages: readonly AppPage[];
  private options: CodeGenOptions;
  private generatedFiles: GeneratedFile[] = [];
  private componentNames: Map<string, string> = new Map();

  constructor(
    widgets: Record<string, WidgetConfig>,
    pages: readonly AppPage[],
    options: CodeGenOptions,
  ) {
    this.widgets = widgets;
    this.pages = pages;
    this.options = options;
  }

  /**
   * Generates all files for the project.
   */
  generate(): readonly GeneratedFile[] {
    this.generatedFiles = [];
    this.componentNames.clear();

    switch (this.options.platform) {
      case TargetPlatform.Web:
        this.generateWebProject();
        break;
      case TargetPlatform.Android:
      case TargetPlatform.IOS:
        this.generateFlutterProject();
        break;
      default:
        this.generateWebProject();
    }

    return this.generatedFiles;
  }

  /* ──────────────────────────────────────────
   * Web (React/Next.js) Generation
   * ────────────────────────────────────────── */

  private generateWebProject(): void {
    // Package.json
    this.addFile({
      path: 'package.json',
      content: this.generatePackageJson(),
      language: 'json',
      type: GeneratedFileType.Package,
      sourceWidgetIds: [],
      generated: true,
      overwritable: false,
    });

    // tsconfig.json
    this.addFile({
      path: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          plugins: [{ name: 'next' }],
          paths: { '@/*': ['./src/*'] },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules'],
      }, null, 2),
      language: 'json',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: false,
    });

    // next.config.js
    this.addFile({
      path: 'next.config.js',
      content: `/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  reactStrictMode: true,\n  swcMinify: true,\n};\n\nmodule.exports = nextConfig;\n`,
      language: 'javascript',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: false,
    });

    // Global styles
    this.addFile({
      path: 'src/app/globals.css',
      content: this.generateGlobalCSS(),
      language: 'css',
      type: GeneratedFileType.Style,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // Layout
    this.addFile({
      path: 'src/app/layout.tsx',
      content: this.generateRootLayout(),
      language: 'typescript',
      type: GeneratedFileType.Layout,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // Generate pages
    for (const page of this.pages) {
      this.generateWebPage(page);
    }

    // Generate reusable components
    this.generateWebComponents();

    // tailwind.config.js
    this.addFile({
      path: 'tailwind.config.js',
      content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
`,
      language: 'javascript',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // postcss.config.js
    this.addFile({
      path: 'postcss.config.js',
      content: `module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\n`,
      language: 'javascript',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // .gitignore
    this.addFile({
      path: '.gitignore',
      content: `# dependencies\n/node_modules\n/.pnp\n.pnp.js\n\n# testing\n/coverage\n\n# next.js\n/.next/\n/out/\n\n# production\n/build\n\n# misc\n.DS_Store\n*.pem\n\n# debug\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n\n# env\n.env*.local\n\n# typescript\n*.tsbuildinfo\nnext-env.d.ts\n`,
      language: 'yaml',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // .env.example
    this.addFile({
      path: '.env.example',
      content: `# Environment Variables\n# Copy this file to .env.local and fill in your values\n\n# API Base URL\nNEXT_PUBLIC_API_URL=http://localhost:3000/api\n\n# Add your keys here\n`,
      language: 'yaml',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // public/favicon.ico placeholder info
    this.addFile({
      path: 'public/robots.txt',
      content: `# Generated by AppBuilder\nUser-agent: *\nAllow: /\n`,
      language: 'html',
      type: GeneratedFileType.Asset,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // README
    this.addFile({
      path: 'README.md',
      content: this.generateReadme(),
      language: 'html',
      type: GeneratedFileType.README,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });
  }

  private generatePackageJson(): string {
    const pkg = {
      name: 'generated-app',
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
      },
      dependencies: {
        next: '^15.1.0',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        'framer-motion': '^11.12.0',
        'lucide-react': '^0.460.0',
        clsx: '^2.1.1',
      },
      devDependencies: {
        '@types/node': '^22.10.0',
        '@types/react': '^19.0.0',
        '@types/react-dom': '^19.0.0',
        typescript: '^5.7.2',
        tailwindcss: '^3.4.16',
        autoprefixer: '^10.4.20',
        postcss: '^8.4.49',
      },
    };
    return JSON.stringify(pkg, null, 2);
  }

  private generateGlobalCSS(): string {
    return `/* 
 * Global Styles
 * Generated by AppBuilder
 */

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 15, 23, 42;
  --background-rgb: 248, 250, 252;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}
`;
  }

  private generateRootLayout(): string {
    return `/**
 * Root Layout
 * 
 * Wraps all pages with global providers, fonts, and metadata.
 * Generated by AppBuilder.
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Generated App',
  description: 'Application built with AppBuilder',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white antialiased">
        {children}
      </body>
    </html>
  );
}
`;
  }

  private generateWebPage(page: AppPage): void {
    const pageName = this.sanitizeComponentName(page.name);
    const rootWidgets = page.rootWidgetIds
      .map(id => this.widgets[id])
      .filter(Boolean) as WidgetConfig[];

    const imports = new Set<string>();
    imports.add("import React from 'react';");

    // Collect component imports
    const componentImports: string[] = [];
    const collectImports = (widget: WidgetConfig) => {
      const compName = this.getComponentName(widget);
      if (!componentImports.includes(compName)) {
        componentImports.push(compName);
      }
      for (const childId of widget.childIds) {
        const child = this.widgets[childId];
        if (child) collectImports(child);
      }
    };

    for (const w of rootWidgets) {
      collectImports(w);
    }

    // Generate JSX
    const jsx = rootWidgets
      .map(w => this.widgetToJSX(w, 2))
      .join('\n');

    const content = `/**
 * ${pageName} Page
 * 
 * Route: ${page.path}
 * Generated by AppBuilder
 */

'use client';

import React from 'react';

/**
 * ${pageName} page component.
 * 
 * @returns The rendered page with all configured widgets.
 */
export default function ${pageName}Page() {
  return (
    <main className="min-h-screen">
${jsx}
    </main>
  );
}
`;

    const pagePath = page.isHomePage
      ? 'src/app/page.tsx'
      : `src/app/${page.path.replace(/^\//, '')}/page.tsx`;

    this.addFile({
      path: pagePath,
      content,
      language: 'typescript',
      type: GeneratedFileType.Page,
      sourceWidgetIds: page.rootWidgetIds as string[],
      generated: true,
      overwritable: true,
    });
  }

  private generateWebComponents(): void {
    // Generate shared component files for each widget type used
    const usedTypes = new Set<WidgetType>();
    for (const widget of Object.values(this.widgets)) {
      usedTypes.add(widget.type);
    }

    // Button component
    if (usedTypes.has(WidgetType.Button)) {
      this.addFile({
        path: 'src/components/Button.tsx',
        content: `/**
 * Button Component
 * 
 * Reusable button with multiple variants and sizes.
 * Follows SOLID principles with single responsibility.
 */

'use client';

import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual variant */
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button spans full width */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon element to display */
  icon?: React.ReactNode;
  /** Icon position relative to text */
  iconPosition?: 'left' | 'right';
}

const variantClasses: Record<string, string> = {
  solid: 'bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700 shadow-md shadow-indigo-500/20',
  outline: 'border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-50 active:bg-indigo-100',
  ghost: 'text-indigo-500 hover:bg-indigo-50 active:bg-indigo-100',
  link: 'text-indigo-500 hover:underline p-0',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-lg',
};

/**
 * A versatile button component supporting multiple visual variants.
 * 
 * @example
 * <Button variant="solid" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 */
export function Button({
  children,
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
}
`,
        language: 'typescript',
        type: GeneratedFileType.Component,
        sourceWidgetIds: [],
        generated: true,
        overwritable: true,
      });
    }

    // Container / Card component
    if (usedTypes.has(WidgetType.Container) || usedTypes.has(WidgetType.Card)) {
      this.addFile({
        path: 'src/components/Container.tsx',
        content: `/**
 * Container Component
 * 
 * Flexible layout container supporting flex/grid modes.
 * Used as the primary building block for page layouts.
 */

import React from 'react';
import { clsx } from 'clsx';

interface ContainerProps {
  children: React.ReactNode;
  /** Flex direction */
  direction?: 'row' | 'column';
  /** Gap between children (in pixels) */
  gap?: number;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * A flexible container component for organizing child elements.
 * Supports row/column direction with configurable spacing.
 */
export function Container({
  children,
  direction = 'column',
  gap = 8,
  className,
  style,
}: ContainerProps) {
  return (
    <div
      className={clsx('flex', direction === 'row' ? 'flex-row' : 'flex-col', className)}
      style={{ gap: \`\${gap}px\`, ...style }}
    >
      {children}
    </div>
  );
}
`,
        language: 'typescript',
        type: GeneratedFileType.Component,
        sourceWidgetIds: [],
        generated: true,
        overwritable: true,
      });
    }

    // Input component
    if (usedTypes.has(WidgetType.TextInput)) {
      this.addFile({
        path: 'src/components/TextInput.tsx',
        content: `/**
 * TextInput Component
 * 
 * Styled text input with label, helper text, and validation support.
 */

'use client';

import React from 'react';
import { clsx } from 'clsx';

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Error message (overrides helper text) */
  error?: string;
  /** Input size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Leading icon */
  leadingIcon?: React.ReactNode;
}

/**
 * A styled text input with optional label and validation feedback.
 * 
 * @example
 * <TextInput label="Email" type="email" placeholder="you{'@'}example.com" />
 */
export function TextInput({
  label,
  helperText,
  error,
  size = 'md',
  leadingIcon,
  className,
  id,
  ...props
}: TextInputProps) {
  const inputId = id || label?.toLowerCase().replace(/\\s+/g, '-');
  const hasError = Boolean(error);

  const sizeClasses: Record<string, string> = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4',
  };

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leadingIcon}
          </div>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full rounded-lg border bg-white transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            sizeClasses[size],
            leadingIcon && 'pl-10',
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20',
          )}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <p className={clsx('text-xs', hasError ? 'text-red-500' : 'text-gray-500')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
`,
        language: 'typescript',
        type: GeneratedFileType.Component,
        sourceWidgetIds: [],
        generated: true,
        overwritable: true,
      });
    }
  }

  /* ──────────────────────────────────────────
   * Flutter Generation
   * ────────────────────────────────────────── */

  private generateFlutterProject(): void {
    const isAndroid = this.options.platform === TargetPlatform.Android;
    const isIOS = this.options.platform === TargetPlatform.IOS;

    // pubspec.yaml
    this.addFile({
      path: 'pubspec.yaml',
      content: this.generatePubspec(),
      language: 'yaml',
      type: GeneratedFileType.Package,
      sourceWidgetIds: [],
      generated: true,
      overwritable: false,
    });

    // Main entry point
    this.addFile({
      path: 'lib/main.dart',
      content: this.generateFlutterMain(),
      language: 'dart',
      type: GeneratedFileType.Component,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // App widget
    this.addFile({
      path: 'lib/app.dart',
      content: this.generateFlutterApp(),
      language: 'dart',
      type: GeneratedFileType.Component,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // Generate screens
    for (const page of this.pages) {
      this.generateFlutterScreen(page);
    }

    // analysis_options.yaml
    this.addFile({
      path: 'analysis_options.yaml',
      content: `include: package:flutter_lints/flutter.yaml\n\nlinter:\n  rules:\n    prefer_const_constructors: true\n    prefer_const_declarations: true\n    avoid_print: true\n`,
      language: 'yaml',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // .gitignore
    this.addFile({
      path: '.gitignore',
      content: `# Flutter
.dart_tool/
.packages
build/
.flutter-plugins
.flutter-plugins-dependencies
*.iml
.idea/
.DS_Store
*.lock
`,
      language: 'yaml',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // Android-specific files
    if (isAndroid || !isIOS) {
      this.generateAndroidFiles();
    }

    // iOS-specific files
    if (isIOS || !isAndroid) {
      this.generateIOSFiles();
    }

    // README
    this.addFile({
      path: 'README.md',
      content: this.generateReadme(),
      language: 'html',
      type: GeneratedFileType.README,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });
  }

  /* ──────────────────────────────────────────
   * Android Project Files
   * ────────────────────────────────────────── */

  private generateAndroidFiles(): void {
    const bundleId = this.options.bundleId || 'com.example.generated_app';
    const appName = this.options.appName || 'Generated App';
    const bundlePath = bundleId.replace(/\./g, '/');

    // android/build.gradle (project-level)
    this.addFile({
      path: 'android/build.gradle',
      content: `// Top-level build file - Generated by AppBuilder
buildscript {
    ext.kotlin_version = '1.9.22'
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:\$kotlin_version"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.buildDir = "../build"
subprojects {
    project.buildDir = "\${rootProject.buildDir}/\${project.name}"
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register("clean", Delete) {
    delete rootProject.buildDir
}
`,
      language: 'javascript',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: false,
    });

    // android/app/build.gradle
    this.addFile({
      path: 'android/app/build.gradle',
      content: `// App-level build file - Generated by AppBuilder
plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
}

def localProperties = new Properties()
def localPropertiesFile = rootProject.file("local.properties")
if (localPropertiesFile.exists()) {
    localPropertiesFile.withReader("UTF-8") { reader ->
        localProperties.load(reader)
    }
}

def flutterVersionCode = localProperties.getProperty("flutter.versionCode")
if (flutterVersionCode == null) flutterVersionCode = "1"

def flutterVersionName = localProperties.getProperty("flutter.versionName")
if (flutterVersionName == null) flutterVersionName = "1.0"

android {
    namespace "${bundleId}"
    compileSdk 34
    ndkVersion flutter.ndkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = "1.8"
    }

    sourceSets {
        main.java.srcDirs += "src/main/kotlin"
    }

    defaultConfig {
        applicationId "${bundleId}"
        minSdk 21
        targetSdk 34
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
    }

    buildTypes {
        release {
            signingConfig signingConfigs.debug
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
        }
    }
}

flutter {
    source "../.."
}

dependencies {}
`,
      language: 'javascript',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: false,
    });

    // android/settings.gradle
    this.addFile({
      path: 'android/settings.gradle',
      content: `// Settings - Generated by AppBuilder
pluginManagement {
    def flutterSdkPath = {
        def properties = new Properties()
        file("local.properties").withInputStream { properties.load(it) }
        def flutterSdkPath = properties.getProperty("flutter.sdk")
        assert flutterSdkPath != null, "flutter.sdk not set in local.properties"
        return flutterSdkPath
    }()

    includeBuild("\$flutterSdkPath/packages/flutter_tools/gradle")

    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    id "dev.flutter.flutter-plugin-loader" version "1.0.0"
    id "com.android.application" version "8.2.2" apply false
    id "org.jetbrains.kotlin.android" version "1.9.22" apply false
}

include ":app"
`,
      language: 'javascript',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: false,
    });

    // android/gradle.properties
    this.addFile({
      path: 'android/gradle.properties',
      content: `org.gradle.jvmargs=-Xmx4G -XX:MaxMetaspaceSize=2G -XX:+HeapDumpOnOutOfMemoryError
android.useAndroidX=true
android.enableJetifier=true
`,
      language: 'yaml',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: false,
    });

    // android/gradle/wrapper/gradle-wrapper.properties
    this.addFile({
      path: 'android/gradle/wrapper/gradle-wrapper.properties',
      content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.5-all.zip
`,
      language: 'yaml',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: false,
    });

    // AndroidManifest.xml
    this.addFile({
      path: 'android/app/src/main/AndroidManifest.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<!-- Generated by AppBuilder -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>

    <application
        android:label="${appName}"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="true"
        android:supportsRtl="true"
        android:theme="@style/LaunchTheme"
        android:hardwareAccelerated="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:taskAffinity=""
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:windowSoftInputMode="adjustResize">
            <meta-data
                android:name="io.flutter.embedding.android.NormalTheme"
                android:resource="@style/NormalTheme"/>
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
        <meta-data
            android:name="flutterEmbedding"
            android:value="2"/>
    </application>
    <queries>
        <intent>
            <action android:name="android.intent.action.PROCESS_TEXT"/>
            <data android:mimeType="text/plain"/>
        </intent>
    </queries>
</manifest>
`,
      language: 'xml',
      type: GeneratedFileType.Manifest,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // MainActivity.kt
    this.addFile({
      path: `android/app/src/main/kotlin/${bundlePath}/MainActivity.kt`,
      content: `package ${bundleId}

import io.flutter.embedding.android.FlutterActivity

/**
 * Main Activity - Generated by AppBuilder
 *
 * Entry point for the Android application.
 * Extends FlutterActivity to host the Flutter engine.
 */
class MainActivity: FlutterActivity()
`,
      language: 'dart',
      type: GeneratedFileType.Component,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // styles.xml - Launch Theme
    this.addFile({
      path: 'android/app/src/main/res/values/styles.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<!-- Generated by AppBuilder -->
<resources>
    <style name="LaunchTheme" parent="@android:style/Theme.Light.NoTitleBar">
        <item name="android:windowBackground">@drawable/launch_background</item>
    </style>
    <style name="NormalTheme" parent="@android:style/Theme.Light.NoTitleBar">
        <item name="android:windowBackground">?android:colorBackground</item>
    </style>
</resources>
`,
      language: 'xml',
      type: GeneratedFileType.Style,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // launch_background.xml
    this.addFile({
      path: 'android/app/src/main/res/drawable/launch_background.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<!-- Generated by AppBuilder -->
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@android:color/white"/>
</layer-list>
`,
      language: 'xml',
      type: GeneratedFileType.Asset,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // proguard-rules.pro
    this.addFile({
      path: 'android/app/proguard-rules.pro',
      content: `# Generated by AppBuilder
# Flutter-specific ProGuard rules
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }
-dontwarn io.flutter.embedding.**
`,
      language: 'yaml',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });
  }

  /* ──────────────────────────────────────────
   * iOS Project Files
   * ────────────────────────────────────────── */

  private generateIOSFiles(): void {
    const bundleId = this.options.bundleId || 'com.example.generatedApp';
    const appName = this.options.appName || 'Generated App';

    // ios/Runner/Info.plist
    this.addFile({
      path: 'ios/Runner/Info.plist',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<!-- Generated by AppBuilder -->
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>${appName}</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${appName}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>$(FLUTTER_BUILD_NAME)</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleVersion</key>
    <string>$(FLUTTER_BUILD_NUMBER)</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIMainStoryboardFile</key>
    <string>Main</string>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>CADisableMinimumFrameDurationOnPhone</key>
    <true/>
    <key>UIApplicationSupportsIndirectInputEvents</key>
    <true/>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
</dict>
</plist>
`,
      language: 'xml',
      type: GeneratedFileType.Manifest,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // ios/Runner/AppDelegate.swift
    this.addFile({
      path: 'ios/Runner/AppDelegate.swift',
      content: `import Flutter
import UIKit

/// AppDelegate - Generated by AppBuilder
///
/// Entry point for the iOS application.
/// Configures the Flutter engine and plugins.
@main
@objc class AppDelegate: FlutterAppDelegate {
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        GeneratedPluginRegistrant.register(with: self)
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }
}
`,
      language: 'dart',
      type: GeneratedFileType.Component,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // ios/Runner.xcodeproj/project.pbxproj (simplified)
    this.addFile({
      path: 'ios/Runner.xcodeproj/project.pbxproj',
      content: this.generateXcodeProject(bundleId, appName),
      language: 'javascript',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: false,
    });

    // ios/Runner/Assets.xcassets/AppIcon.appiconset/Contents.json
    this.addFile({
      path: 'ios/Runner/Assets.xcassets/AppIcon.appiconset/Contents.json',
      content: JSON.stringify({
        images: [
          { size: '20x20', idiom: 'iphone', filename: 'Icon-App-20x20@2x.png', scale: '2x' },
          { size: '20x20', idiom: 'iphone', filename: 'Icon-App-20x20@3x.png', scale: '3x' },
          { size: '29x29', idiom: 'iphone', filename: 'Icon-App-29x29@2x.png', scale: '2x' },
          { size: '29x29', idiom: 'iphone', filename: 'Icon-App-29x29@3x.png', scale: '3x' },
          { size: '40x40', idiom: 'iphone', filename: 'Icon-App-40x40@2x.png', scale: '2x' },
          { size: '40x40', idiom: 'iphone', filename: 'Icon-App-40x40@3x.png', scale: '3x' },
          { size: '60x60', idiom: 'iphone', filename: 'Icon-App-60x60@2x.png', scale: '2x' },
          { size: '60x60', idiom: 'iphone', filename: 'Icon-App-60x60@3x.png', scale: '3x' },
          { size: '1024x1024', idiom: 'ios-marketing', filename: 'Icon-App-1024x1024@1x.png', scale: '1x' },
        ],
        info: { version: 1, author: 'AppBuilder' },
      }, null, 2),
      language: 'json',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // ios/Runner/LaunchScreen.storyboard
    this.addFile({
      path: 'ios/Runner/Base.lproj/LaunchScreen.storyboard',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by AppBuilder -->
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0"
          toolsVersion="32700.99.1234" targetRuntime="AppleSDK">
    <scenes>
        <scene sceneID="EHf-IW-A2E">
            <objects>
                <viewController id="01J-lp-oVM" sceneMemberID="viewController">
                    <view key="view" contentMode="scaleToFill" id="Ze5-6b-2t3">
                        <rect key="frame" x="0.0" y="0.0" width="375" height="667"/>
                        <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
                        <subviews>
                            <imageView contentMode="scaleAspectFit" image="LaunchImage"
                                       translatesAutoresizingMaskIntoConstraints="NO" id="YRO-k0-Ey4"/>
                        </subviews>
                        <color key="backgroundColor" red="1" green="1" blue="1" alpha="1" colorSpace="custom"
                               customColorSpace="sRGB"/>
                    </view>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="iYj-Kq-Ea1"
                             userLabel="First Responder" sceneMemberID="firstResponder"/>
            </objects>
            <point key="canvasLocation" x="53" y="375"/>
        </scene>
    </scenes>
    <resources>
        <image name="LaunchImage" width="168" height="185"/>
    </resources>
</document>
`,
      language: 'xml',
      type: GeneratedFileType.Layout,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // ios/Runner/Main.storyboard
    this.addFile({
      path: 'ios/Runner/Base.lproj/Main.storyboard',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by AppBuilder -->
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0"
          toolsVersion="32700.99.1234" targetRuntime="AppleSDK">
    <scenes>
        <scene sceneID="tne-QT-ifu">
            <objects>
                <viewController id="BYZ-38-t0r" customClass="FlutterViewController"
                                customModuleProvider="" sceneMemberID="viewController">
                    <view key="view" contentMode="scaleToFill" id="8bC-Xf-vdC">
                        <rect key="frame" x="0.0" y="0.0" width="390" height="844"/>
                        <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
                        <color key="backgroundColor" white="1" alpha="1" colorSpace="custom"
                               customColorSpace="genericGamma22GrayColorSpace"/>
                    </view>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="dkx-z0-nzr"
                             sceneMemberID="firstResponder"/>
            </objects>
            <point key="canvasLocation" x="53" y="375"/>
        </scene>
    </scenes>
</document>
`,
      language: 'xml',
      type: GeneratedFileType.Layout,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });

    // ios/Podfile
    this.addFile({
      path: 'ios/Podfile',
      content: `# Generated by AppBuilder
platform :ios, '13.0'

# CocoaPods analytics
ENV['COCOAPODS_DISABLE_STATS'] = 'true'

project 'Runner', {
  'Debug' => :debug,
  'Profile' => :release,
  'Release' => :release,
}

def flutter_root
  generated_xcode_build_settings_path = File.expand_path(File.join('..', 'Flutter', 'Generated.xcconfig'), __FILE__)
  unless File.exist?(generated_xcode_build_settings_path)
    raise "Generated.xcconfig must exist."
  end
  File.foreach(generated_xcode_build_settings_path) do |line|
    matches = line.match(/FLUTTER_ROOT\\=(.*)/)
    return matches[1].strip if matches
  end
  raise "FLUTTER_ROOT not found in Generated.xcconfig."
end

require File.expand_path(File.join('packages', 'flutter_tools', 'bin', 'podhelper'), flutter_root)

flutter_ios_podfile_setup

target 'Runner' do
  use_frameworks!
  use_modular_headers!
  flutter_install_all_ios_pods File.dirname(File.realpath(__FILE__))
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
  end
end
`,
      language: 'yaml',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: false,
    });

    // ios/Runner/GeneratedPluginRegistrant.swift
    this.addFile({
      path: 'ios/Runner/GeneratedPluginRegistrant.swift',
      content: `//
//  Generated by AppBuilder - do not modify
//
import FlutterMacOS
import Foundation

func RegisterGeneratedPlugins(registry: FlutterPluginRegistry) {
    // Plugin registration will be added here automatically
}
`,
      language: 'dart',
      type: GeneratedFileType.Config,
      sourceWidgetIds: [],
      generated: true,
      overwritable: true,
    });
  }

  private generateXcodeProject(bundleId: string, appName: string): string {
    return `// !$*UTF8*$!
// Simplified Xcode project - Generated by AppBuilder
// This is a Flutter project. Run "flutter build ios" to build.
{
  archiveVersion = 1;
  classes = {};
  objectVersion = 54;
  objects = {
    // Build configuration
    97C146ED1CF9000F007C117D = {
      isa = PBXGroup;
      children = ();
      sourceTree = "<group>";
    };
  };
  rootObject = 97C146E61CF9000F007C117D;
}
// Note: This is a placeholder project file.
// For a complete Xcode project, run: flutter create --org ${bundleId.split('.').slice(0, -1).join('.')} ${appName.toLowerCase().replace(/\s+/g, '_')}
// Then copy your lib/ folder into the created project.
`;
  }

  private generatePubspec(): string {
    return `# Generated by AppBuilder
name: generated_app
description: A Flutter application built with AppBuilder
version: 1.0.0+1
publish_to: none

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
  provider: ^6.1.2
  go_router: ^14.6.0
  google_fonts: ^6.2.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
`;
  }

  private generateFlutterMain(): string {
    return `/// Main entry point for the Flutter application.
///
/// Initializes the app and runs the root widget.
/// Generated by AppBuilder.

import 'package:flutter/material.dart';
import 'app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const GeneratedApp());
}
`;
  }

  private generateFlutterApp(): string {
    const homeRoute = this.pages.find(p => p.isHomePage);
    const homeScreen = homeRoute
      ? this.sanitizeComponentName(homeRoute.name) + 'Screen'
      : 'HomeScreen';

    return `/// Root application widget.
///
/// Configures Material theme, routing, and global providers.
/// Generated by AppBuilder.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class GeneratedApp extends StatelessWidget {
  const GeneratedApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Generated App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.light,
        ),
        textTheme: GoogleFonts.interTextTheme(),
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 0,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.dark,
        ),
        textTheme: GoogleFonts.interTextTheme(
          ThemeData.dark().textTheme,
        ),
      ),
      themeMode: ThemeMode.system,
      home: const Scaffold(
        body: Center(
          child: Text('Generated App'),
        ),
      ),
    );
  }
}
`;
  }

  private generateFlutterScreen(page: AppPage): void {
    const className = this.sanitizeComponentName(page.name) + 'Screen';
    const rootWidgets = page.rootWidgetIds
      .map(id => this.widgets[id])
      .filter(Boolean) as WidgetConfig[];

    const widgetCode = rootWidgets
      .map(w => this.widgetToDart(w, 4))
      .join(',\n');

    const content = `/// ${page.name} Screen
///
/// Route: ${page.path}
/// Generated by AppBuilder.

import 'package:flutter/material.dart';

/// Screen widget for the ${page.name} page.
class ${className} extends StatelessWidget {
  const ${className}({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
${widgetCode}
            ],
          ),
        ),
      ),
    );
  }
}
`;

    this.addFile({
      path: `lib/screens/${page.path.replace(/^\//, '').replace(/\//g, '_') || 'home'}_screen.dart`,
      content,
      language: 'dart',
      type: GeneratedFileType.Page,
      sourceWidgetIds: page.rootWidgetIds as string[],
      generated: true,
      overwritable: true,
    });
  }

  /* ──────────────────────────────────────────
   * Widget → JSX Conversion
   * ────────────────────────────────────────── */

  private widgetToJSX(widget: WidgetConfig, indent: number): string {
    const pad = ' '.repeat(indent * 2);
    const style = this.styleToReactCSS(widget.style);
    const styleStr = Object.keys(style).length > 0
      ? ` style={${JSON.stringify(style)}}`
      : '';

    switch (widget.type) {
      case WidgetType.Button:
        return `${pad}<button className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"${styleStr}>\n${pad}  ${(widget.props.label as string) ?? 'Button'}\n${pad}</button>`;

      case WidgetType.Text:
      case WidgetType.Paragraph:
        return `${pad}<p${styleStr}>${(widget.props.content as string) ?? 'Text'}</p>`;

      case WidgetType.Heading: {
        const level = (widget.props.level as number) ?? 2;
        const tag = `h${level}`;
        return `${pad}<${tag} className="font-bold"${styleStr}>${(widget.props.content as string) ?? 'Heading'}</${tag}>`;
      }

      case WidgetType.Image:
        return `${pad}<img src="${(widget.props.src as string) ?? '/placeholder.jpg'}" alt="${(widget.props.alt as string) ?? ''}" className="object-cover rounded-lg"${styleStr} />`;

      case WidgetType.TextInput:
        return `${pad}<div className="flex flex-col gap-1.5"${styleStr}>\n${pad}  ${(widget.props.label as string) ? `<label className="text-sm font-medium text-gray-700">${widget.props.label}</label>` : ''}\n${pad}  <input type="${(widget.props.inputType as string) ?? 'text'}" placeholder="${(widget.props.placeholder as string) ?? ''}" className="h-10 px-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />\n${pad}</div>`;

      case WidgetType.Container:
      case WidgetType.Row:
      case WidgetType.Column:
      case WidgetType.Stack: {
        const dir = widget.type === WidgetType.Row ? 'flex-row' : 'flex-col';
        const gap = widget.style.gap ?? 8;
        const children = widget.childIds
          .map(id => {
            const child = this.widgets[id];
            return child ? this.widgetToJSX(child, indent + 1) : '';
          })
          .filter(Boolean)
          .join('\n');
        return `${pad}<div className="flex ${dir}" style={{ gap: '${gap}px' }}${styleStr ? ` ${styleStr}` : ''}>\n${children}\n${pad}</div>`;
      }

      case WidgetType.Card: {
        const children = widget.childIds
          .map(id => {
            const child = this.widgets[id];
            return child ? this.widgetToJSX(child, indent + 1) : '';
          })
          .filter(Boolean)
          .join('\n');
        return `${pad}<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"${styleStr}>\n${children}\n${pad}</div>`;
      }

      case WidgetType.Divider:
        return `${pad}<hr className="border-t border-gray-200" />`;

      case WidgetType.Spacer:
        return `${pad}<div className="h-6" />`;

      case WidgetType.Checkbox:
        return `${pad}<label className="flex items-center gap-2 text-sm cursor-pointer">\n${pad}  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500" />\n${pad}  ${(widget.props.label as string) ?? 'Checkbox'}\n${pad}</label>`;

      case WidgetType.Toggle:
        return `${pad}<label className="flex items-center gap-2 text-sm cursor-pointer">\n${pad}  <div className="relative w-10 h-5 rounded-full bg-gray-300 transition-colors">\n${pad}    <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform" />\n${pad}  </div>\n${pad}  ${(widget.props.label as string) ?? 'Toggle'}\n${pad}</label>`;

      case WidgetType.Badge:
        return `${pad}<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">${(widget.props.content as string) ?? 'Badge'}</span>`;

      case WidgetType.Alert:
        return `${pad}<div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50">\n${pad}  <div>\n${pad}    ${(widget.props.title as string) ? `<p className="font-semibold text-sm text-blue-800">${widget.props.title}</p>` : ''}\n${pad}    <p className="text-sm text-blue-700">${(widget.props.message as string) ?? 'Alert message'}</p>\n${pad}  </div>\n${pad}</div>`;

      default:
        return `${pad}{/* ${widget.type}: ${widget.name} */}`;
    }
  }

  /* ──────────────────────────────────────────
   * Widget → Dart Conversion
   * ────────────────────────────────────────── */

  private widgetToDart(widget: WidgetConfig, indent: number): string {
    const pad = ' '.repeat(indent);

    switch (widget.type) {
      case WidgetType.Button:
        return `${pad}ElevatedButton(\n${pad}  onPressed: () {},\n${pad}  child: Text('${(widget.props.label as string) ?? 'Button'}'),\n${pad})`;

      case WidgetType.Text:
      case WidgetType.Paragraph:
        return `${pad}Text(\n${pad}  '${(widget.props.content as string) ?? 'Text'}',\n${pad}  style: TextStyle(fontSize: ${widget.style.fontSize ?? 14}),\n${pad})`;

      case WidgetType.Heading:
        return `${pad}Text(\n${pad}  '${(widget.props.content as string) ?? 'Heading'}',\n${pad}  style: Theme.of(context).textTheme.headlineMedium,\n${pad})`;

      case WidgetType.Image:
        return `${pad}Image.network(\n${pad}  '${(widget.props.src as string) ?? 'https://via.placeholder.com/200'}',\n${pad}  fit: BoxFit.cover,\n${pad})`;

      case WidgetType.TextInput:
        return `${pad}TextField(\n${pad}  decoration: InputDecoration(\n${pad}    labelText: '${(widget.props.label as string) ?? 'Label'}',\n${pad}    hintText: '${(widget.props.placeholder as string) ?? 'Enter text...'}',\n${pad}    border: const OutlineInputBorder(),\n${pad}  ),\n${pad})`;

      case WidgetType.Container:
      case WidgetType.Column: {
        const children = widget.childIds
          .map(id => {
            const child = this.widgets[id];
            return child ? this.widgetToDart(child, indent + 2) : '';
          })
          .filter(Boolean)
          .join(',\n');
        return `${pad}Column(\n${pad}  crossAxisAlignment: CrossAxisAlignment.start,\n${pad}  children: [\n${children}\n${pad}  ],\n${pad})`;
      }

      case WidgetType.Row: {
        const children = widget.childIds
          .map(id => {
            const child = this.widgets[id];
            return child ? this.widgetToDart(child, indent + 2) : '';
          })
          .filter(Boolean)
          .join(',\n');
        return `${pad}Row(\n${pad}  children: [\n${children}\n${pad}  ],\n${pad})`;
      }

      case WidgetType.Card: {
        const children = widget.childIds
          .map(id => {
            const child = this.widgets[id];
            return child ? this.widgetToDart(child, indent + 2) : '';
          })
          .filter(Boolean)
          .join(',\n');
        return `${pad}Card(\n${pad}  child: Padding(\n${pad}    padding: const EdgeInsets.all(16),\n${pad}    child: Column(\n${pad}      children: [\n${children}\n${pad}      ],\n${pad}    ),\n${pad}  ),\n${pad})`;
      }

      case WidgetType.Divider:
        return `${pad}const Divider()`;

      case WidgetType.Spacer:
        return `${pad}const SizedBox(height: 24)`;

      default:
        return `${pad}// ${widget.type}: ${widget.name}`;
    }
  }

  /* ──────────────────────────────────────────
   * Helpers
   * ────────────────────────────────────────── */

  private styleToReactCSS(style: WidgetStyle): Record<string, string | number> {
    const css: Record<string, string | number> = {};
    if (style.width) css.width = style.width.unit === 'px' ? style.width.value : `${style.width.value}${style.width.unit}`;
    if (style.height) css.height = style.height.unit === 'px' ? style.height.value : `${style.height.value}${style.height.unit}`;
    if (style.fontSize) css.fontSize = style.fontSize;
    if (style.fontWeight) css.fontWeight = style.fontWeight;
    if (style.color) css.color = style.color;
    if (style.background?.color) css.backgroundColor = style.background.color;
    if (style.borderRadius) css.borderRadius = `${style.borderRadius.topLeft}px`;
    if (style.opacity !== undefined) css.opacity = style.opacity;
    return css;
  }

  private sanitizeComponentName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');
  }

  private getComponentName(widget: WidgetConfig): string {
    if (this.componentNames.has(widget.id)) {
      return this.componentNames.get(widget.id)!;
    }
    const name = this.sanitizeComponentName(widget.name);
    this.componentNames.set(widget.id, name);
    return name;
  }

  private generateReadme(): string {
    return `# Generated Application

This application was generated by **AppBuilder** — a Low-Code/No-Code application builder.

## Getting Started

### Web (Next.js)
\`\`\`bash
npm install
npm run dev
\`\`\`

### Flutter
\`\`\`bash
flutter pub get
flutter run
\`\`\`

## Architecture

- **Clean Code**: Following SOLID principles
- **Component-based**: Each UI element is an isolated, reusable component
- **Type-safe**: Full TypeScript/Dart type coverage
- **Responsive**: Built with responsive design in mind

## Project Structure

\`\`\`
src/
├── app/          # Next.js app router pages
├── components/   # Reusable UI components
├── lib/          # Utility functions
└── styles/       # Global styles
\`\`\`

## License

Generated code is free to use without restrictions.
`;
  }

  private addFile(file: GeneratedFile): void {
    this.generatedFiles.push(file);
  }
}

/* ──────────────────────────────────────────────
 * Factory Function
 * ────────────────────────────────────────────── */

/**
 * Creates a CodeGenerator and generates all files.
 */
export function generateProjectCode(
  widgets: Record<string, WidgetConfig>,
  pages: readonly AppPage[],
  options: Partial<CodeGenOptions> = {},
): readonly GeneratedFile[] {
  const defaultOptions: CodeGenOptions = {
    platform: TargetPlatform.Web,
    language: 'typescript',
    framework: 'next',
    styling: 'tailwind',
    stateManagement: 'context',
    testing: false,
    comments: true,
    formatCode: true,
    generateTypes: true,
    cleanArchitecture: true,
  };

  const generator = new CodeGenerator(
    widgets,
    pages,
    { ...defaultOptions, ...options },
  );

  return generator.generate();
}
