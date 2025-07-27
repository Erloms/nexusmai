// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.9";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    // @ts-ignore
    Deno.env.get('SUPABASE_URL') ?? '',
    // @ts-ignore
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role key for admin operations
    {
      auth: {
        persistSession: false,
      },
    },
  );

  try {
    if (req.method === 'POST') {
      const { 
        alipay_app_id, 
        alipay_private_key, 
        alipay_public_key, 
        app_public_key, // New field
        alipay_gateway_url, 
        notify_url, 
        return_url,
        is_sandbox // New field
      } = await req.json();

      // Always upsert (insert or update) a single config entry
      const { data, error } = await supabaseClient
        .from('payment_configs')
        .upsert({
          id: 'alipay_config', // Use a fixed ID for a single config entry
          alipay_app_id,
          alipay_private_key,
          alipay_public_key,
          app_public_key, // Save new field
          alipay_gateway_url,
          notify_url,
          return_url,
          is_sandbox, // Save new field
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ message: 'Configuration saved successfully', data }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    } else if (req.method === 'GET') {
      const { data, error } = await supabaseClient
        .from('payment_configs')
        .select('*')
        .eq('id', 'alipay_config')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error;
      }

      return new Response(
        JSON.stringify(data || {}), // Return empty object if no config found
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    } else {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: corsHeaders,
      });
    }
  } catch (error) {
    console.error('Payment config error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});