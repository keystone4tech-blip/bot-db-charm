import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const url = new URL(req.url)
    const userId = url.searchParams.get('user_id')

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch balance
    const { data: balance } = await supabase
      .from('balances')
      .select('internal_balance, external_balance, total_earned, total_withdrawn')
      .eq('user_id', userId)
      .single()

    // Fetch referral stats
    const { data: referral_stats } = await supabase
      .from('referral_stats')
      .select('total_referrals, total_earnings, level_1_count, level_2_count, level_3_count, level_4_count, level_5_count')
      .eq('user_id', userId)
      .single()

    // Fetch subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('id, plan_name, status, expires_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Fetch VPN keys
    const { data: vpn_keys } = await supabase
      .from('vpn_keys')
      .select('id, server_location, status, expires_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Fetch bots
    const { data: bots } = await supabase
      .from('user_bots')
      .select('id, bot_name, is_active')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    return new Response(
      JSON.stringify({
        profile,
        balance: balance || null,
        referral_stats: referral_stats || null,
        subscriptions: subscriptions || [],
        vpn_keys: vpn_keys || [],
        bots: bots || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
