// supabase/functions/mapay-notify/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import md5 from "https://esm.sh/md5";

// ★★★ 新增的部分 ★★★
// 虽然回调通常是服务器到服务器，但加上CORS头是一个好习惯
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 回调通常不涉及浏览器跨域，用 '*' 即可
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
};
// ★★★ 新增结束 ★★★

// 你的码支付密钥，用于验签
const MAPAY_KEY = "P2Z1q3PDtQptzkt38qp8ZZQ0XS1N1bNq";

serve(async (req) => {
  // ★★★ 新增的部分 ★★★
  // 即使是回调，也最好处理一下OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  // ★★★ 新增结束 ★★★

  try {
    // 码支付的回调通知是通过URL参数 (GET请求) 发送的
    const url = new URL(req.url);
    const params = url.searchParams;

    console.log("收到码支付回调:", req.url);

    // ... (你下面所有的代码都完全正确，一行都不用改！)
    // ... (从这里开始，到最后的所有代码，都保持原样)
    const pid = params.get('pid');
    const trade_no = params.get('trade_no');
    const out_trade_no = params.get('out_trade_no');
    const type = params.get('type');
    const name = params.get('name');
    const money = params.get('money');
    const trade_status = params.get('trade_status');
    const sign = params.get('sign');
    
    const signString = `money=${money}&name=${name}&out_trade_no=${out_trade_no}&pid=${pid}&trade_no=${trade_no}&trade_status=${trade_status}&type=${type}${MAPAY_KEY}`;
    const calculatedSign = md5(signString);

    if (sign !== calculatedSign) {
      console.error("签名验证失败!");
      return new Response("fail: sign error", { status: 400, headers: corsHeaders });
    }
    console.log("签名验证成功!");

    if (trade_status === 'TRADE_SUCCESS') {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const { data: order, error: findError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('order_number', out_trade_no)
        .single();

      if (findError || !order) {
        console.error("订单未找到:", out_trade_no, findError);
        return new Response("fail: order not found", { status: 404, headers: corsHeaders });
      }

      if (order.status !== 'paid') {
        console.log(`开始处理订单 ${out_trade_no}, 当前状态: ${order.status}`);
        
        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({ status: 'paid', payment_id: trade_no, updated_at: new Date().toISOString() })
          .eq('id', order.id);

        if (updateError) {
          throw new Error(`更新订单状态失败: ${updateError.message}`);
        }
        console.log("订单状态更新为 'paid' 成功!");

        if (order.product_id) {
          const { error: rpcError } = await supabaseAdmin.rpc('activate_membership', {
            p_user_id: order.user_id,
            p_plan_id: order.product_id,
            p_order_id: order.id
          });

          if (rpcError) {
            console.error(`激活会员失败 (RPC 'activate_membership'):`, rpcError);
          } else {
            console.log(`用户 ${order.user_id} 的会员权限 ${order.product_id} 已成功激活!`);
          }
        }
      } else {
        console.log(`订单 ${out_trade_no} 已处理过，无需重复操作。`);
      }
    }
    
    // 在返回的响应中也加上CORS头
    return new Response("success", { headers: corsHeaders });

  } catch (error) {
    console.error("处理码支付回调时发生严重错误:", error);
    return new Response("fail: internal server error", { status: 500, headers: corsHeaders });
  }
});