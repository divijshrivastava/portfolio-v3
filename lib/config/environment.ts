/**
 * Environment Detection Utility
 *
 * Detects which environment the application is running in:
 * - qa: QA environment (divij-qa.tech)
 * - production: Production environment (divij.tech)
 * - development: Local development
 */

export type Environment = 'qa' | 'production' | 'development';

/**
 * Get the current environment
 *
 * Detection strategy:
 * 1. Check browser hostname (client-side)
 * 2. Check NEXT_PUBLIC_APP_URL (server-side)
 * 3. Default to development
 */
export function getEnvironment(): Environment {
  // Client-side detection
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    if (hostname === 'divij-qa.tech' || hostname === 'www.divij-qa.tech') {
      return 'qa';
    }

    if (hostname === 'divij.tech' || hostname === 'www.divij.tech') {
      return 'production';
    }

    // Vercel preview deployments for QA project
    if (hostname.includes('portfolio-v2-qa') && hostname.includes('vercel.app')) {
      return 'qa';
    }

    // Vercel preview deployments for production project
    if (hostname.includes('vercel.app') && !hostname.includes('portfolio-v2-qa')) {
      return 'production';
    }
  }

  // Server-side detection
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (appUrl?.includes('divij-qa.tech')) {
    return 'qa';
  }

  if (appUrl?.includes('divij.tech')) {
    return 'production';
  }

  // Default to development
  return 'development';
}

/**
 * Check if running in QA environment
 */
export function isQA(): boolean {
  return getEnvironment() === 'qa';
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

/**
 * Check if running in development environment
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

/**
 * Get environment display name
 */
export function getEnvironmentName(): string {
  const env = getEnvironment();

  switch (env) {
    case 'qa':
      return 'QA';
    case 'production':
      return 'Production';
    case 'development':
      return 'Development';
    default:
      return 'Unknown';
  }
}

/**
 * Get environment badge color (for UI display)
 */
export function getEnvironmentColor(): string {
  const env = getEnvironment();

  switch (env) {
    case 'qa':
      return 'bg-yellow-500 text-yellow-900'; // Yellow for QA
    case 'production':
      return 'bg-green-500 text-green-900'; // Green for Production
    case 'development':
      return 'bg-blue-500 text-blue-900'; // Blue for Development
    default:
      return 'bg-gray-500 text-gray-900';
  }
}

/**
 * Validate required environment variables
 * Throws error if any required variables are missing
 */
export function validateEnvironment(): void {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    const env = getEnvironment();
    throw new Error(
      `Missing required environment variables in ${env} environment:\n` +
      missing.map(v => `  - ${v}`).join('\n') +
      '\n\nPlease check your Vercel environment variables configuration.'
    );
  }
}

/**
 * Get configuration for current environment
 */
export interface EnvironmentConfig {
  environment: Environment;
  name: string;
  color: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  appUrl: string;
  isProduction: boolean;
  isQA: boolean;
  isDevelopment: boolean;
}

export function getConfig(): EnvironmentConfig {
  const environment = getEnvironment();

  return {
    environment,
    name: getEnvironmentName(),
    color: getEnvironmentColor(),
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || '',
    isProduction: environment === 'production',
    isQA: environment === 'qa',
    isDevelopment: environment === 'development',
  };
}

/**
 * Log environment information (useful for debugging)
 */
export function logEnvironmentInfo(): void {
  if (typeof window === 'undefined') {
    // Server-side logging
    console.log('Environment:', getEnvironmentName());
    console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL || 'Not set');
  } else {
    // Client-side logging
    console.log('Environment:', getEnvironmentName());
    console.log('Hostname:', window.location.hostname);
  }
}
