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
    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Fetch all stats in parallel
    const [
      usersResult,
      botsResult,
      subscriptionsResult,
      vpnKeysResult,
      transactionsResult,
    ] = await Promise.all([
      supabase.from('profiles').select('id, telegram_username, created_at').order('created_at', { ascending: false }),
      supabase.from('user_bots').select('id, user_id, created_at').eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('id, user_id, created_at, status').eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('vpn_keys').select('id, user_id, activated_at, status').eq('status', 'active').order('activated_at', { ascending: false }),
      supabase.from('transactions').select('id, amount, type, created_at, status').eq('status', 'completed').order('created_at', { ascending: false }),
    ])

    // Calculate monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: revenueData } = await supabase
      .from('transactions')
      .select('amount')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .in('type', ['subscription_payment', 'vpn_payment', 'deposit'])

    const monthlyRevenue = revenueData?.reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0

    const stats = {
      totalUsers: usersResult.data?.length || 0,
      activeBots: botsResult.data?.length || 0,
      activeSubscriptions: subscriptionsResult.data?.length || 0,
      activeVpnKeys: vpnKeysResult.data?.length || 0,
      monthlyRevenue,
      totalTransactions: transactionsResult.data?.length || 0,
    }

    // Build recent activity list
    const activities: any[] = []

    // Add recent users
    usersResult.data?.slice(0, 5).forEach((user: any) => {
      activities.push({
        id: `user-${user.id}`,
        action: 'Новый пользователь',
        user: user.telegram_username ? `@${user.telegram_username}` : 'Аноним',
        created_at: user.created_at,
        type: 'user',
      })
    })

    // Add recent subscriptions with user info
    if (subscriptionsResult.data && subscriptionsResult.data.length > 0) {
      const subUserIds = subscriptionsResult.data.slice(0, 5).map((s: any) => s.user_id)
      const { data: subProfiles } = await supabase
        .from('profiles')
        .select('id, telegram_username')
        .in('id', subUserIds)
      
      const profileMap = new Map(subProfiles?.map((p: any) => [p.id, p.telegram_username]) || [])
      
      subscriptionsResult.data.slice(0, 5).forEach((sub: any) => {
        const username = profileMap.get(sub.user_id)
        activities.push({
          id: `sub-${sub.id}`,
          action: 'Оплата подписки',
          user: username ? `@${username}` : 'Аноним',
          created_at: sub.created_at,
          type: 'subscription',
        })
      })
    }

    // Add recent bots with user info
    if (botsResult.data && botsResult.data.length > 0) {
      const botUserIds = botsResult.data.slice(0, 5).map((b: any) => b.user_id)
      const { data: botProfiles } = await supabase
        .from('profiles')
        .select('id, telegram_username')
        .in('id', botUserIds)
      
      const profileMap = new Map(botProfiles?.map((p: any) => [p.id, p.telegram_username]) || [])
      
      botsResult.data.slice(0, 5).forEach((bot: any) => {
        const username = profileMap.get(bot.user_id)
        activities.push({
          id: `bot-${bot.id}`,
          action: 'Создан бот',
          user: username ? `@${username}` : 'Аноним',
          created_at: bot.created_at,
          type: 'bot',
        })
      })
    }

    // Add recent VPN activations with user info
    if (vpnKeysResult.data && vpnKeysResult.data.length > 0) {
      const vpnWithActivation = vpnKeysResult.data.filter((v: any) => v.activated_at).slice(0, 5)
      if (vpnWithActivation.length > 0) {
        const vpnUserIds = vpnWithActivation.map((v: any) => v.user_id)
        const { data: vpnProfiles } = await supabase
          .from('profiles')
          .select('id, telegram_username')
          .in('id', vpnUserIds)
        
        const profileMap = new Map(vpnProfiles?.map((p: any) => [p.id, p.telegram_username]) || [])
        
        vpnWithActivation.forEach((vpn: any) => {
          const username = profileMap.get(vpn.user_id)
          activities.push({
            id: `vpn-${vpn.id}`,
            action: 'VPN ключ активирован',
            user: username ? `@${username}` : 'Аноним',
            created_at: vpn.activated_at,
            type: 'vpn',
          })
        })
      }
    }

    // Sort activities by date (newest first) and limit to 10
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const recentActivity = activities.slice(0, 10)

    return new Response(
      JSON.stringify({ stats, recentActivity }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error fetching platform stats:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch platform stats' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})