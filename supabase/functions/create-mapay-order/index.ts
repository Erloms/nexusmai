// supabase/functions/create-mapay-order/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import md5 from 'https://esm.sh/md5';

// ★★★ 1. 定义我们的“白名单” ★★★
const allowedOrigins = [
  'http://localhost:32100', // 允许本地开发
  'https://nexus.m7ai.top'  // 允许线上域名
];

// 你的“余宽云码支付”配置信息
const MAPAY_PID = "170343392";
const MAPAY_KEY = "P2Z1q3PDtQptzkt38qp8ZZQ0XS1N1bNq";
const MAPAY_API_URL = "https://zf.yk520.top/mapi.php";

serve(async (req) => {
  // ★★★ 2. 动态生成CORS头 ★★★
  const origin = req.headers.get("Origin") || "";
  const corsHeaders = {
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    // 检查请求来源是否在我们的白名单里
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[1] // 默认允许线上域名
  };

  // 处理浏览器的OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { productId } = await req.json();

    // 根据商品ID确定价格和名称
    let money = '0.01';
    let name = '测试商品';
    if (productId === '永久会员') {
        money = '399.00';
        name = '永久会员';
    } else if (productId === '年费会员') {
        money = '99.00';
        name = '年费会员';
    }

    const notify_url = `https://gwueqkusxarhomnabcrg.supabase.co/functions/v1/mapay-notify`;
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
    
    const paymentParams = new URLSearchParams({
      ...signParams,
      sign: sign,
      sign_type: 'MD5',
    });
    
    const paymentUrl = `${MAPAY_API_URL}?${paymentParams.toString()}`;

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