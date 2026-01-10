// Supabase Edge Function для работы с тикетами поддержки
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// Настройка CORS заголовков
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
}

serve(async (req) => {
  // Обработка CORS preflight запросов
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Определение метода запроса
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const ticketId = pathParts[pathParts.length - 1] // Последняя часть URL - ID тикета
    const isTicketSpecific = pathParts.length > 3 && ticketId && ticketId !== 'support-tickets'

    if (req.method === 'POST') {
      // Создание нового тикета
      const { user_id, category, subject, message } = await req.json()

      if (!user_id || !category || !subject || !message) {
        return new Response(
          JSON.stringify({ error: 'Отсутствуют обязательные поля: user_id, category, subject, message' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        )
      }

      // Проверяем, существует ли пользователь
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user_id)
        .single()

      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'Пользователь не найден' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 404 
          }
        )
      }

      // Создаем тикет
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{
          user_id,
          category,
          subject,
          message,
          status: 'open',
          priority: 'medium'
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

      return new Response(
        JSON.stringify({ success: true, ticket: data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      )
    } else if (req.method === 'GET' && isTicketSpecific) {
      // Получение конкретного тикета
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
    } else if (req.method === 'GET' && !isTicketSpecific) {
      // Получение всех тикетов пользователя
      const userId = url.searchParams.get('user_id')
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Необходим параметр user_id' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        )
      }

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
    } else if (req.method === 'PUT' && isTicketSpecific) {
      // Обновление статуса тикета
      const { status } = await req.json()

      if (!status) {
        return new Response(
          JSON.stringify({ error: 'Необходим параметр status' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        )
      }

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
        JSON.stringify({ error: 'Метод не поддерживается' }),
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