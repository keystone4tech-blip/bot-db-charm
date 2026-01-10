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

    if (req.method === 'POST') {
      // Create support ticket
      const { user_id, category, subject, message } = await req.json()

      if (!user_id || !category || !subject || !message) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Insert the ticket
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{ 
          user_id, 
          category, 
          subject, 
          message, 
          status: 'open' 
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating support ticket:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, ticket: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else if (req.method === 'GET') {
      // Get support tickets for user
      const url = new URL(req.url)
      const userId = url.pathname.split('/')[3] // /tickets/:userId
      const status = url.searchParams.get('status') // Optional status filter

      let query = supabase.from('support_tickets').select('*').eq('user_id', userId)
      
      if (status) {
        query = query.eq('status', status)
      }
      
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching support tickets:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, tickets: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else if (req.method === 'PUT') {
      // Update ticket status
      const url = new URL(req.url)
      const ticketId = url.pathname.split('/')[3] // /tickets/:ticketId
      const { status } = await req.json()

      const { data, error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId)
        .select()
        .single()

      if (error) {
        console.error('Error updating support ticket:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, ticket: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

  } catch (error) {
    console.error('Error in support-tickets function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})