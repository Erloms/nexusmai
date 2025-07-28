// 文件路径: supabase/functions/create-mapay-order/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import md5 from 'https://esm.sh/md5';

// CORS配置，允许你的线上网站和本地环境访问
const allowedOrigins = [
  'http://localhost:32100',
  'https://nexus.m7ai.top'
];

// 你的“余宽云码支付”配置信息
const MAPAY_PID = "170343392";
const MAPAY_KEY = "P2Z1q3PDtQptzkt38qp8ZZQ0XS1N1bNq";
const MAPAY_API_URL = "https://zf.yk520.top/mapi.php";

serve(async (req) => {
  // 动态处理CORS
  const origin = req.headers.get("Origin") || "";
  const corsHeaders = {
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[1]
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { productId } = await req.json();

    if (!productId) {
      throw new Error("请求中缺少 productId 参数");
    }

    // ★★★ 这里的逻辑，现在可以正确处理价格了！★★★
    let money = '';
    let name = '';
    if (productId === 'annual') {
        money = '99.00';
        name = '年费会员';
    } else if (productId === 'lifetime') {
        money = '399.00';
        name = '永久会员';
    } else if (productId === 'agent') {
        money = '1999.00';
        name = '代理商';
    } else {
        throw new Error(`未知的商品ID: ${productId}`);
    }

    const notify_url = `https://gwueqkusxarhomnabcrg.supabase.co/functions/v1/alipay-notify`;
    const return_url = `https://nexus.m7ai.top/payment-success`;

    const out_trade_no = `order_${Date.now()}`;
    const type = 'alipay';
    
    const signParams = {
      money: money,
      name: name,
      notify_url: notify_url,
      out_trade_no: out_trade_no,
      pid: MAPAY_PID,
      return_url: return_url,
      type: type,
    };
    
    const sortedKeys = Object.keys(signParams).sort();
    let signString = sortedKeys.map(key => `${key}=${signParams[key as keyof typeof signParams]}`).join('&');
    signString += MAPAY_KEY;
    const sign = md5(signString);
    
    const paymentUrl = `${MAPAY_API_URL}?${new URLSearchParams({ ...signParams, sign, sign_type: 'MD5' }).toString()}`;

    return new Response(
      JSON.stringify({ paymentUrl: paymentUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});