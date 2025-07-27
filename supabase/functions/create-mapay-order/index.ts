// supabase/functions/create-mapay-order/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import md5 from 'https://esm.sh/md5';

// 定义CORS头，允许前端调用
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

// 你的“余宽云码支付”配置信息
const MAPAY_PID = "170343392";
const MAPAY_KEY = "P2Z1q3PDtQptzkt38qp8ZZQ0XS1N1bNq";
const MAPAY_API_URL = "https://zf.yk520.top/mapi.php"; // 【注意】使用 mapi.php

serve(async (req) => {
  // 处理浏览器的OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { productId } = await req.json(); // 前端只需要传一个商品ID

    // 根据商品ID确定价格和名称 (你可以自己扩展)
    let money = '0.01'; // 默认测试价格
    let name = '测试商品';
    if (productId === '永久会员') {
        money = '399.00';
        name = '永久会员';
    } else if (productId === '年费会员') {
        money = '99.00';
        name = '年费会员';
    }

    // ★★★ 这里是你唯一需要修改的地方！★★★
    const notify_url = `https://gwueqkusxarhomnabcrg.supabase.co/functions/v1/mapay-notify`; // 异步通知地址
    const return_url = `https://nexus.m7ai.top/payment-success`; // 支付成功后跳转地址
    // ★★★ 请再次确认上面的 Supabase 项目ID 和你的网站域名是否正确！★★★

    const out_trade_no = `order_${Date.now()}`;
    const type = 'alipay';
    
    // 准备用于签名的参数 (根据码支付文档)
    const signParams = {
      money: money,
      name: name,
      notify_url: notify_url,
      out_trade_no: out_trade_no,
      pid: MAPAY_PID,
      return_url: return_url,
      type: type,
    };
    
    // 构建签名字符串 (按首字母排序后拼接)
    const sortedKeys = Object.keys(signParams).sort();
    let signString = sortedKeys.map(key => `${key}=${signParams[key as keyof typeof signParams]}`).join('&');
    signString += MAPAY_KEY;
    const sign = md5(signString);
    
    // 构建最终请求码支付的URL
    const paymentParams = new URLSearchParams({
      ...signParams,
      sign: sign,
      sign_type: 'MD5',
    });
    
    const paymentUrl = `${MAPAY_API_URL}?${paymentParams.toString()}`;

    // 直接返回支付URL给前端
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