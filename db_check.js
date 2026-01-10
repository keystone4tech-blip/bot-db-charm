// Скрипт для проверки структуры базы данных
import { createClient } from '@supabase/supabase-js';

// Инициализация Supabase клиента
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Необходимо определить SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в переменных окружения');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

async function checkDatabaseStructure() {
  console.log('Проверка структуры базы данных...\n');

  try {
    // Проверяем, существует ли таблица support_tickets
    const { data: tableCheck, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .ilike('table_name', '%support%');

    if (tableError) {
      console.error('Ошибка при проверке таблиц:', tableError);
      return;
    }

    console.log('Таблицы, содержащие "support":');
    tableCheck.forEach(table => console.log(`- ${table.table_name}`));
    console.log('');

    // Проверяем структуру таблицы support_tickets, если она существует
    if (tableCheck.some(table => table.table_name === 'support_tickets')) {
      console.log('Структура таблицы support_tickets:');
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'support_tickets')
        .order('ordinal_position');

      if (columnsError) {
        console.error('Ошибка при получении структуры колонок:', columnsError);
      } else {
        columns.forEach(col => {
          console.log(`- ${col.column_name}: ${col.data_type}${col.is_nullable === 'YES' ? ' (nullable)' : ''}${col.column_default ? ` (default: ${col.column_default})` : ''}`);
        });
      }
      console.log('');
    }

    // Проверяем, существует ли таблица profiles
    if (tableCheck.some(table => table.table_name === 'profiles')) {
      console.log('Структура таблицы profiles (первые 5 колонок):');
      const { data: profileColumns, error: profileColumnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'profiles')
        .order('ordinal_position')
        .limit(5); // Ограничиваем для краткости

      if (profileColumnsError) {
        console.error('Ошибка при получении структуры колонок profiles:', profileColumnsError);
      } else {
        profileColumns.forEach(col => {
          console.log(`- ${col.column_name}: ${col.data_type}${col.is_nullable === 'YES' ? ' (nullable)' : ''}${col.column_default ? ` (default: ${col.column_default})` : ''}`);
        });
      }
      console.log('');
    }

    // Проверяем, есть ли пользователи в таблице profiles
    const { count: userCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Ошибка при подсчете пользователей:', countError);
    } else {
      console.log(`Количество пользователей в системе: ${userCount}`);
    }

    // Проверяем, есть ли тикеты в системе
    if (tableCheck.some(table => table.table_name === 'support_tickets')) {
      const { count: ticketCount, error: ticketCountError } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true });

      if (ticketCountError) {
        console.error('Ошибка при подсчете тикетов:', ticketCountError);
      } else {
        console.log(`Количество тикетов в системе: ${ticketCount}`);
      }
    }

    console.log('\nПроверка структуры базы данных завершена.');
  } catch (error) {
    console.error('Неожиданная ошибка:', error);
  }
}

// Запуск проверки
checkDatabaseStructure();