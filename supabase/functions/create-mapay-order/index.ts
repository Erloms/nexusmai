// 文件路径: supabase/functions/create-mapay-order/index.ts
// 这是融合了所有正确逻辑的最终生产版本

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
    console.log("Function received a new request.");
    const { productId } = await req.json();
    console.log("Successfully parsed request body. ProductId:", productId);

    if (!productId) {
      throw new Error("请求中缺少 productId 参数");
    }

    // 1. 创建Supabase客户端，用来查询数据库
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 2. 根据前端传来的 productId，动态地从数据库里查找套餐信息
    const { data: plan, error: planError } = await supabaseAdmin
      .from('membership_plans')
      .select('name, price')
      .eq('type', productId)
      .single();

    if (planError || !plan) {
      console.error("在数据库中找不到套餐:", productId, planError);
      throw new Error(`找不到ID为 ${productId} 的会员套餐`);
    }
    console.log(`Successfully fetched plan from DB: ${plan.name} for ${plan.price}`);
    
    // 3. 从数据库里动态地获取价格和名称
    const money = (plan.price as number).toFixed(2);
    const name = plan.name;

    const notify_url = `https://gwueqkusxarhomnabcrg.supabase.co/functions/v1/alipay-notify`;
    const return_url = `https://nexus.m7ai.top/payment-success`;
    const out_trade_no = `order_${Date.now()}`;
    const type = 'alipay';
    
    // 4. 准备签名和请求参数
    const signParams = {
      money: money, name: name, notify_url: notify_url, out_trade_no: out_trade_no,
      pid: MAPAY_PID, return_url: return_url, type: type,
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
    
    const mapayRequestUrl = `${MAPAY_API_URL}?${paymentParams.toString()}`;
    console.log("Generated MaPay request URL.");

    // 5. 【关键】请求码支付平台，获取返回的JSON数据
    const mapayResponse = await fetch(mapayRequestUrl);
    if (!mapayResponse.ok) {
      throw new Error(`请求码支付平台失败，状态码: ${mapayResponse.status}`);
    }

    const mapayData = await mapayResponse.json();
    console.log("Received data from MaPay:", mapayData);

    // 6. 【关键】从JSON数据中提取真正的支付链接
    if (mapayData.code === 1 && mapayData.qrcode) {
      // 7. 把提取出来的支付宝二维码URL，返回给前端
      return new Response(
        JSON.stringify({ paymentUrl: mapayData.qrcode }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // 如果码支付返回了错误，也把它告诉前端
      throw new Error(mapayData.msg || "码支付平台返回了未知的错误");
    }

  } catch (error) {
    console.error("!!! Error inside serve handler:", error.message);
    return new Response(
      JSON.stringify({ error: `函数内部错误: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});