/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please configure Supabase connection.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get API key from Supabase
export const getApiKey = async (serviceName: string): Promise<string> => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('api_key')
    .eq('service_name', serviceName)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to retrieve ${serviceName} API key: ${error.message}`);
  }

  if (!data?.api_key) {
    throw new Error(`${serviceName} API key not found in database`);
  }

  return data.api_key;
};

// Function to update API key in Supabase
export const updateApiKey = async (serviceName: string, apiKey: string): Promise<void> => {
  const { error } = await supabase
    .from('api_keys')
    .upsert({
      service_name: serviceName,
      api_key: apiKey,
      updated_at: new Date().toISOString()
    });

  if (error) {
    throw new Error(`Failed to update ${serviceName} API key: ${error.message}`);
  }
};