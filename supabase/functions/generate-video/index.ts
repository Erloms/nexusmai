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
    const { image_url, prompt } = await req.json()

    if (!image_url && !prompt) {
      return new Response(
        JSON.stringify({ error: 'Either image_url or prompt is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 从 Supabase Secrets 中获取 API Key
    const API_KEY = Deno.env.get('VIDEO_API_KEY');
    if (!API_KEY) {
      throw new Error('VIDEO_API_KEY is not set in Supabase secrets.');
    }
    
    // Create video generation request
    const requestBody: any = {
      model: "cogvideox-flash",
      with_audio: true
    }

    if (image_url) {
      requestBody.image_url = image_url
    }
    
    if (prompt) {
      requestBody.prompt = prompt
    }

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/videos/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Video generation failed')
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Video generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})