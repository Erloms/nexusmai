// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.9"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, voice, readingMode } = await req.json()

    if (!text || !voice) {
      return new Response(
        JSON.stringify({ error: 'Text and voice are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const POLLINATIONS_API_KEY = Deno.env.get('POLLINATIONS_API_KEY');
    if (!POLLINATIONS_API_KEY) {
      throw new Error('POLLINATIONS_API_KEY is not set in Supabase secrets.');
    }

    let audioGenerationPrompt = text;
    if (readingMode === 'strict') {
      audioGenerationPrompt = `请严格地、不加任何修改地朗读以下文本：${text}`;
    } else if (readingMode === 'interpretive') {
      audioGenerationPrompt = text; // Pollinations.ai will interpret expressively by default
    }

    const audioUrl = `https://text.pollinations.ai/${encodeURIComponent(audioGenerationPrompt)}?model=openai-audio&voice=${voice}&nologo=true`;

    const response = await fetch(audioUrl, {
      headers: {
        'Authorization': `Bearer ${POLLINATIONS_API_KEY}`, // Pass API key as Bearer token
        'Referer': 'https://auria-ai-nexus.lovable.dev' // Add a referrer if required by Pollinations.ai
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Pollinations.ai API error: ${response.status} - ${errorBody}`);
    }

    // Stream the audio directly back to the client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000' // Cache audio for better performance
      },
      status: 200
    });

  } catch (error) {
    console.error('Voice synthesis error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})