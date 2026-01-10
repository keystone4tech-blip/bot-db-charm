// Supabase Edge Function для работы с сообщениями чата поддержки
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    const ticketId = pathParts[2] // /support/chat-messages/:ticketId

    if (req.method === 'POST') {
      // Create new chat message
      const { ticket_id, sender_id, sender_type, message, file_url, file_type, file_name } = await req.json()

      if (!ticket_id || !sender_id || !sender_type || !message) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: ticket_id, sender_id, sender_type, message' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        )
      }

      // Check if ticket exists and belongs to user
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .select('id')
        .eq('id', ticket_id)
        .single()

      if (ticketError || !ticket) {
        console.error('Ticket not found:', { ticket_id, ticketError });
        return new Response(
          JSON.stringify({ error: 'Ticket not found' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 404 
          }
        )
      }

      console.log('Creating message for ticket:', ticket_id);

      // Create the message
      const { data, error } = await supabase
        .from('ticket_messages')
        .insert([{
          ticket_id,
          sender_id,
          sender_type,
          message,
          file_url,
          file_type,
          file_name
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating support chat message:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }

      // Update ticket status to 'in_progress'
      await supabase
        .from('support_tickets')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', ticket_id)

      console.log('Message created successfully:', data.id);

      return new Response(
        JSON.stringify({ success: true, message: data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      )
    } else if (req.method === 'GET' && ticketId) {
      // Get chat messages for specific ticket
      console.log('Fetching messages for ticket:', ticketId);
      
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching support chat messages:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, messages: data }),
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
    console.error('Unexpected error in support-chat-messages function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})