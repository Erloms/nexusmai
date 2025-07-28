// supabase/functions/create-mapay-order/index.ts

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
    const { productId } = await req.json(); // 前端只需要传一个商品ID

    // 根据前端传来的productId，写死价格和名称
    let money = '';
    let name = '';
    if (productId === 'annual') { // 对应你前端的 'annual'
        money = '99.00';
        name = '年费会员';
    } else if (productId === 'lifetime') { // 对应你前端的 'lifetime'
        money = '399.00';
        name = '永久会员';
    } else if (productId === 'agent') { // 对应你前端的 'agent'
        money = '1999.00';
        name = '代理商';
    } else {
        // 如果传来一个未知的ID，就报错
        throw new Error(`未知的商品ID: ${productId}`);
    }

    // ★★★ 确保这里的回调函数名，和你文件夹里的名字一致！★★★
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
    
    const paymentParams = new URLSearchParams({
      ...signParams,
      sign: sign,
      sign_type: 'MD5',
    });
    
    const paymentUrl = `${MAPAY_API_URL}?${paymentParams.toString()}`;

    // 直接返回拼接好的支付URL给前端
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