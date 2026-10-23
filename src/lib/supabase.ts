import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// Create Supabase client with fallback dummy client if unconfigured to prevent runtime crashes
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit'
      }
    })
  : (null as any);

/**
 * Checks live with the Supabase Auth server whether Google OAuth provider is actively enabled
 */
export const checkGoogleProviderStatus = async (): Promise<{ enabled: boolean; error?: string; raw?: any }> => {
  if (!isSupabaseConfigured || !supabaseUrl || !supabaseKey) {
    return { enabled: false, error: 'Supabase URL or Key is missing in environment variables.' };
  }

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      return { enabled: false, error: `Supabase Auth settings returned status ${res.status}` };
    }

    const data = await res.json();
    const isGoogleEnabled = Boolean(data?.external?.google);
    return { enabled: isGoogleEnabled, raw: data };
  } catch (err: any) {
    console.warn('Unable to query Supabase settings API directly:', err);
    // In case of network error, do not block the attempt
    return { enabled: true };
  }
};

/**
 * Initiates Google OAuth authentication via Supabase with popup / top-level fallback
 */
export const signInWithGoogle = async (): Promise<{ 
  error?: string; 
  providerNotEnabled?: boolean; 
  started?: boolean;
}> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      error: 'Supabase configuration is missing. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are defined in .env.'
    };
  }

  try {
    // 1. Check live provider status first to prevent raw 400 JSON popup errors
    const providerCheck = await checkGoogleProviderStatus();
    if (!providerCheck.enabled) {
      return {
        error: 'Google provider is not enabled or not saved in your Supabase project (tvxbwejebrnhylvqpikz).',
        providerNotEnabled: true
      };
    }

    const redirectUrl = window.location.origin;

    // 2. Request OAuth authorization URL from Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account'
        }
      }
    });

    if (error) {
      const isProviderNotEnabled = 
        error.message?.toLowerCase().includes('provider is not enabled') ||
        error.message?.toLowerCase().includes('unsupported provider') ||
        (error as any)?.code === 400 ||
        (error as any)?.error_code === 'validation_failed';

      if (isProviderNotEnabled) {
        return {
          error: 'Google provider is not enabled in your Supabase dashboard yet.',
          providerNotEnabled: true
        };
      }
      return { error: error.message };
    }

    if (data?.url) {
      // 3. AI Studio preview runs inside an iframe. Google OAuth blocks being rendered inside iframes
      // due to X-Frame-Options: DENY. Open the auth URL directly in a centered popup window.
      const width = 520;
      const height = 660;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.url,
        'supabase_google_auth',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // If popup was blocked by browser, try top-level redirect as fallback
        window.location.href = data.url;
      }
      return { started: true };
    }

    return { error: 'Failed to retrieve Google authentication URL from Supabase.' };
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.toLowerCase().includes('provider is not enabled') || msg.toLowerCase().includes('unsupported provider')) {
      return {
        error: 'Google provider is not enabled in your Supabase dashboard yet.',
        providerNotEnabled: true
      };
    }
    return { error: msg || 'Error occurred while initiating Google Sign In.' };
  }
};

/**
 * Sign out current user from Supabase session
 */
export const signOutSupabase = async () => {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
  }
};

