// Supabase Edge Function для работы с тикетами поддержки
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(part => part !== '')
    const ticketId = pathParts[1] // /support-tickets/:ticketId

    if (req.method === 'POST') {
      // Create new support ticket
      const { user_id, category, subject, message } = await req.json()

      if (!user_id || !category || !subject || !message) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: user_id, category, subject, message' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        )
      }

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user_id)
        .single()

      if (userError || !user) {
        console.error('User not found:', { user_id, userError });
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 404 
          }
        )
      }

      console.log('Creating ticket for user:', user_id);

      // Create the ticket
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
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }

      console.log('Ticket created successfully:', data.id);

      return new Response(
        JSON.stringify({ success: true, ticket: data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      )
    } else if (req.method === 'GET' && ticketId) {
      // Get specific ticket
      console.log('Fetching ticket:', ticketId);
      
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single()

      if (error) {
        console.error('Error fetching ticket:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, ticket: data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      )
    } else if (req.method === 'GET' && !ticketId) {
      // Get all tickets for user (or all tickets for admin)
      const userId = url.searchParams.get('user_id')
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'user_id parameter is required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        )
      }

      console.log('Fetching tickets for user:', userId);
      
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user tickets:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, tickets: data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      )
    } else if (req.method === 'PUT' && ticketId) {
      // Update ticket status
      const { status } = await req.json()

      if (!status) {
        return new Response(
          JSON.stringify({ error: 'status parameter is required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        )
      }

      console.log('Updating ticket status:', { ticketId, status });
      
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId)
        .select()
        .single()

      if (error) {
        console.error('Error updating ticket status:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, ticket: data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 405 
        }
      )
    }
  } catch (error) {
    console.error('Unexpected error in support-tickets function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})