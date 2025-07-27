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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { out_trade_no, trade_status } = await req.json();

    console.log('验证支付状态:', { out_trade_no, trade_status });

    // 查找订单
    const { data: orderData, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .or(`order_number.eq.${out_trade_no},payment_id.eq.${out_trade_no}`)
      .single();

    if (orderError || !orderData) {
      throw new Error('订单不存在');
    }

    // 检查订单状态
    let orderStatus = orderData.status;

    // 如果提供了交易状态，可以进一步验证
    if (trade_status && (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED')) {
      if (orderData.status !== 'paid') {
        // 更新订单状态
        await supabaseClient
          .from('orders')
          .update({ 
            status: 'paid',
            updated_at: new Date().toISOString() 
          })
          .eq('id', orderData.id);

        orderStatus = 'paid';

        // 激活会员权限
        if (orderData.product_id) {
          try {
            await supabaseClient
              .rpc('activate_membership', {
                p_user_id: orderData.user_id,
                p_plan_id: orderData.product_id,
                p_order_id: orderData.id
              });
          } catch (error) {
            console.error('激活会员失败:', error);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: orderStatus,
        order_number: orderData.order_number,
        amount: orderData.amount,
        created_at: orderData.created_at,
        updated_at: orderData.updated_at
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('验证支付失败:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : '验证失败' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})