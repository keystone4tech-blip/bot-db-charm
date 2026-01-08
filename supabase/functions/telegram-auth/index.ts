import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

interface TelegramInitData {
  user?: TelegramUser
  auth_date: number
  hash: string
  query_id?: string
  start_param?: string
}

async function hmacSha256(key: ArrayBuffer | string, data: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const keyData = typeof key === 'string' ? encoder.encode(key).buffer : key
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(data)
  )
  
  return signature
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function validateTelegramInitData(initData: string, botToken: string): Promise<TelegramInitData | null> {
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    
    if (!hash) {
      console.error('No hash in initData')
      return null
    }
    
    // Remove hash from params for validation
    params.delete('hash')
    
    // Sort parameters and create data check string
    const dataCheckArr: string[] = []
    params.sort()
    params.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`)
    })
    const dataCheckString = dataCheckArr.join('\n')
    
    // Create secret key using HMAC-SHA256
    const secretKey = await hmacSha256('WebAppData', botToken)
    
    // Calculate hash
    const calculatedHashBuffer = await hmacSha256(secretKey, dataCheckString)
    const calculatedHash = bufferToHex(calculatedHashBuffer)
    
    if (calculatedHash !== hash) {
      console.error('Hash mismatch:', { calculated: calculatedHash, received: hash })
      return null
    }
    
    // Check auth_date (allow 24 hours)
    const authDate = parseInt(params.get('auth_date') || '0')
    const now = Math.floor(Date.now() / 1000)
    if (now - authDate > 86400) {
      console.error('Auth data expired')
      return null
    }
    
    // Parse user data
    const userStr = params.get('user')
    if (!userStr) {
      console.error('No user in initData')
      return null
    }
    
    const user = JSON.parse(userStr) as TelegramUser
    
    return {
      user,
      auth_date: authDate,
      hash,
      query_id: params.get('query_id') || undefined,
      start_param: params.get('start_param') || undefined,
    }
  } catch (error) {
    console.error('Error validating initData:', error)
    return null
  }
}

function generateReferralCode(telegramId: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  const seed = telegramId.toString()
  for (let i = 0; i < 8; i++) {
    const charIndex = (parseInt(seed[i % seed.length]) + i * 7) % chars.length
    code += chars[charIndex]
  }
  return code
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured')
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const { initData, referralCode: bodyReferralCode } = await req.json()
    
    if (!initData) {
      return new Response(
        JSON.stringify({ error: 'initData is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Validating Telegram initData...')
    
    // Validate Telegram initData
    const validatedData = await validateTelegramInitData(initData, botToken)
    
    if (!validatedData || !validatedData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid Telegram data' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get referral code from multiple sources: body, start_param from initData
    const startParamCode = validatedData.start_param
    const referralCode = bodyReferralCode || startParamCode || null
    
    console.log('Referral info:', { 
      bodyReferralCode, 
      startParamCode, 
      finalReferralCode: referralCode 
    })
    
    const telegramUser = validatedData.user
    console.log('Telegram user validated:', telegramUser.id, telegramUser.first_name)
    
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Check if user exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError)
      throw fetchError
    }
    
    let profile = existingProfile
    
    if (!profile) {
      console.log('Creating new profile for Telegram user:', telegramUser.id)
      
      // Find referrer if referral code provided
      let referrerId: string | null = null
      if (referralCode) {
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', referralCode.toUpperCase())
          .single()
        
        if (referrer) {
          referrerId = referrer.id
          console.log('Found referrer:', referrerId)
        }
      }
      
      // Generate unique referral code for new user
      const newReferralCode = generateReferralCode(telegramUser.id)
      
      // Create profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          telegram_id: telegramUser.id,
          telegram_username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          avatar_url: telegramUser.photo_url,
          referral_code: newReferralCode,
          referred_by: referrerId,
          referral_level: referrerId ? 1 : 0,
        })
        .select()
        .single()
      
      if (createError) {
        console.error('Error creating profile:', createError)
        throw createError
      }
      
      profile = newProfile
      console.log('Profile created:', profile.id)
      
      // Create balance record
      const { error: balanceError } = await supabase
        .from('balances')
        .insert({
          user_id: profile.id,
          internal_balance: 0,
          external_balance: 0,
          total_earned: 0,
          total_withdrawn: 0,
        })
      
      if (balanceError) {
        console.error('Error creating balance:', balanceError)
      }
      
      // Create user stats record
      const { error: statsError } = await supabase
        .from('user_stats')
        .insert({
          user_id: profile.id,
          total_logins: 1,
          last_login_at: new Date().toISOString(),
        })
      
      if (statsError) {
        console.error('Error creating user stats:', statsError)
      }
      
      // Create referral stats record
      const { error: refStatsError } = await supabase
        .from('referral_stats')
        .insert({
          user_id: profile.id,
          total_referrals: 0,
          total_earnings: 0,
        })
      
      if (refStatsError) {
        console.error('Error creating referral stats:', refStatsError)
      }
      
      // Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: profile.id,
          role: 'user',
        })
      
      if (roleError) {
        console.error('Error creating user role:', roleError)
      }
      
      // If user was referred, create referral records
      if (referrerId) {
        // Create direct referral (level 1) (idempotent)
        const { error: referralInsertError } = await supabase
          .from('referrals')
          .upsert(
            {
              referrer_id: referrerId,
              referred_id: profile.id,
              level: 1,
              is_active: true,
            },
            { onConflict: 'referrer_id,referred_id' }
          )

        if (referralInsertError) {
          console.error('Error creating referral row:', referralInsertError)
        }

        // Ensure referrer's referral_stats exists and increment counters
        const { data: currentStats, error: statsFetchError } = await supabase
          .from('referral_stats')
          .select('user_id,total_referrals,level_1_count')
          .eq('user_id', referrerId)
          .maybeSingle()

        if (statsFetchError) {
          console.error('Error fetching referral_stats for referrer:', statsFetchError)
        }

        const nextTotal = (currentStats?.total_referrals || 0) + 1
        const nextLevel1 = (currentStats?.level_1_count || 0) + 1

        const { error: statsUpsertError } = await supabase
          .from('referral_stats')
          .upsert(
            {
              user_id: referrerId,
              total_referrals: nextTotal,
              level_1_count: nextLevel1,
              total_earnings: 0,
            },
            { onConflict: 'user_id' }
          )

        if (statsUpsertError) {
          console.error('Error upserting referral_stats for referrer:', statsUpsertError)
        }

        console.log('Referral created for:', referrerId)
      }
    } else {
      console.log('Existing user logged in:', profile.id)
      
      // Update profile info
      await supabase
        .from('profiles')
        .update({
          telegram_username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          avatar_url: telegramUser.photo_url || profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
      
      // Get current user stats and update login stats
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('total_logins')
        .eq('user_id', profile.id)
        .single()
      
      await supabase
        .from('user_stats')
        .update({
          total_logins: (currentStats?.total_logins || 0) + 1,
          last_login_at: new Date().toISOString(),
        })
        .eq('user_id', profile.id)
    }
    
    // Get user's balance
    const { data: balance } = await supabase
      .from('balances')
      .select('*')
      .eq('user_id', profile.id)
      .single()
    
    // Get user's referral stats
    const { data: referralStats } = await supabase
      .from('referral_stats')
      .select('*')
      .eq('user_id', profile.id)
      .single()
    
    // Get user's role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', profile.id)
      .single()
    
    console.log('Auth successful for user:', profile.id)
    
    return new Response(
      JSON.stringify({
        success: true,
        profile,
        balance,
        referralStats,
        role: userRole?.role || 'user',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error: unknown) {
    console.error('Error in telegram-auth:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
