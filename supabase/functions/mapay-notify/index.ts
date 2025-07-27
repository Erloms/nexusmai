// supabase/functions/mapay-notify/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import md5 from "https://esm.sh/md5";

// 你的码支付密钥，用于验签
const MAPAY_KEY = "P2Z1q3PDtQptzkt38qp8ZZQ0XS1N1bNq";

serve(async (req) => {
  try {
    // 码支付的回调通知是通过URL参数 (GET请求) 发送的
    const url = new URL(req.url);
    const params = url.searchParams;

    console.log("收到码支付回调:", req.url);

    // 提取所有回调参数
    const pid = params.get('pid');
    const trade_no = params.get('trade_no'); // 码支付平台订单号
    const out_trade_no = params.get('out_trade_no'); // 你的商户订单号
    const type = params.get('type');
    const name = params.get('name');
    const money = params.get('money');
    const trade_status = params.get('trade_status');
    const sign = params.get('sign');
    
    // 1. 【核心安全步骤】验证签名
    // 签名规则: MD5(money=...&name=...&out_trade_no=...&pid=...&trade_no=...&trade_status=...&type=...{商户密匙})
    const signString = `money=${money}&name=${name}&out_trade_no=${out_trade_no}&pid=${pid}&trade_no=${trade_no}&trade_status=${trade_status}&type=${type}${MAPAY_KEY}`;
    const calculatedSign = md5(signString);

    if (sign !== calculatedSign) {
      console.error("签名验证失败!", {
        receivedSign: sign,
        calculatedSign: calculatedSign,
        signString: signString,
      });
      return new Response("fail: sign error", { status: 400 });
    }
    console.log("签名验证成功!");

    // 2. 处理业务逻辑
    if (trade_status === 'TRADE_SUCCESS') {
      // 使用 Service Role Key 创建一个有完全权限的Supabase客户端
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      // 查找订单
      const { data: order, error: findError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('order_number', out_trade_no)
        .single();

      if (findError || !order) {
        console.error("订单未找到:", out_trade_no, findError);
        return new Response("fail: order not found", { status: 404 });
      }

      // 如果订单状态不是 'paid'，才进行更新和激活操作，防止重复处理
      if (order.status !== 'paid') {
        console.log(`开始处理订单 ${out_trade_no}, 当前状态: ${order.status}`);
        
        // 更新订单状态为“已支付”
        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({ status: 'paid', payment_id: trade_no, updated_at: new Date().toISOString() })
          .eq('id', order.id);

        if (updateError) {
          throw new Error(`更新订单状态失败: ${updateError.message}`);
        }
        console.log("订单状态更新为 'paid' 成功!");

        // 【关键】调用数据库函数，为用户开通会员
        if (order.product_id) {
          const { error: rpcError } = await supabaseAdmin.rpc('activate_membership', {
            p_user_id: order.user_id,
            p_plan_id: order.product_id,
            p_order_id: order.id
          });

          if (rpcError) {
            console.error(`激活会员失败 (RPC 'activate_membership'):`, rpcError);
            // 即使激活失败，也应该返回success，避免码支付重复通知。但需要记录错误以便手动处理。
          } else {
            console.log(`用户 ${order.user_id} 的会员权限 ${order.product_id} 已成功激活!`);
          }
        }
      } else {
        console.log(`订单 ${out_trade_no} 已处理过，无需重复操作。`);
      }
    }
    
    // 3. 向上游返回“success”，告知码支付平台处理成功
    return new Response("success");

  } catch (error) {
    console.error("处理码支付回调时发生严重错误:", error);
    return new Response("fail: internal server error", { status: 500 });
  }
});