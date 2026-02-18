import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { profileId, publicView } = await req.json()

    if (!profileId) {
      return new Response(
        JSON.stringify({ error: 'profileId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // If publicView, only return public profile info (for referrer viewing)
    if (publicView) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, telegram_username, avatar_url, referral_code, created_at')
        .eq('id', profileId)
        .single()

      if (profileError) {
        return new Response(
          JSON.stringify({ error: 'Profile not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ profile }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch all user data in parallel
    const [profileRes, balanceRes, referralStatsRes, vpnRes, channelsRes, botsRes, subscriptionsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', profileId).single(),
      supabase.from('balances').select('*').eq('user_id', profileId).maybeSingle(),
      supabase.from('referral_stats').select('*').eq('user_id', profileId).maybeSingle(),
      supabase.from('vpn_keys').select('*').eq('user_id', profileId).order('created_at', { ascending: false }).limit(1),
      supabase.from('telegram_channels').select('*').eq('user_id', profileId).order('created_at', { ascending: false }).limit(1),
      supabase.from('user_bots').select('*').eq('user_id', profileId).order('created_at', { ascending: false }).limit(1),
      supabase.from('subscriptions').select('*').eq('user_id', profileId).order('created_at', { ascending: false }).limit(1),
    ])

    if (profileRes.error) {
      console.error('Error fetching profile:', profileRes.error)
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch referrer info if available
    let referrerInfo = null
    if (profileRes.data?.referred_by) {
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, telegram_username, avatar_url, referral_code, created_at')
        .eq('id', profileRes.data.referred_by)
        .single()
      referrerInfo = referrer
    }

    return new Response(
      JSON.stringify({
        profile: profileRes.data,
        balance: balanceRes.data,
        referralStats: referralStatsRes.data,
        vpnKey: vpnRes.data?.[0] || null,
        channel: channelsRes.data?.[0] || null,
        userBot: botsRes.data?.[0] || null,
        subscription: subscriptionsRes.data?.[0] || null,
        referrerInfo,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in user-profile-data:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})