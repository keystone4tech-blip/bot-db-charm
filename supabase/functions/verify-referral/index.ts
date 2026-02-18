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
    const { referralCode } = await req.json()

    if (!referralCode) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Реферальный код не указан' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data: referrer, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, telegram_username, avatar_url, referral_code')
      .eq('referral_code', referralCode.toUpperCase())
      .single()

    if (error || !referrer) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Реферальный код не найден' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ valid: true, referrer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in verify-referral:', error)
    return new Response(
      JSON.stringify({ valid: false, message: 'Ошибка проверки' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
