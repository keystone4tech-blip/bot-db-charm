"""
Вспомогательные функции для работы с базой данных
"""
import asyncpg
import logging

logger = logging.getLogger(__name__)

async def ensure_columns_exist(connection, table_name: str, columns_to_check: dict):
    """
    Проверяет и добавляет отсутствующие столбцы в таблицу
    
    Args:
        connection: Соединение с базой данных
        table_name: Название таблицы
        columns_to_check: Словарь с описанием столбцов {имя: определение}
    """
    for col_name, col_def in columns_to_check.items():
        column_exists = await connection.fetchval(f"""
            SELECT EXISTS (
                SELECT FROM information_schema.columns
                WHERE table_name = '{table_name}' AND column_name = '{col_name}'
            );
        """)
        
        if not column_exists:
            logger.info(f"Добавляем столбец {col_name} в таблицу {table_name}...")
            
            if col_name == 'id':
                # Для первичного ключа создаем отдельно
                await connection.execute(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_def.split('PRIMARY')[0]}")
                await connection.execute(f"ALTER TABLE {table_name} ADD CONSTRAINT pk_{table_name}_{col_name} PRIMARY KEY ({col_name})")
            elif 'REFERENCES' in col_def:
                # Для внешних ключей сначала добавляем столбец, потом создаем связь
                ref_part = col_def.split('REFERENCES')[1].split('ON')[0].strip()
                await connection.execute(f"ALTER TABLE {table_name} ADD COLUMN {col_name} UUID{' NOT NULL' if 'NOT NULL' in col_def else ''}")
                await connection.execute(f"ALTER TABLE {table_name} ADD FOREIGN KEY ({col_name}) REFERENCES {ref_part}")
            else:
                await connection.execute(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_def.replace('PRIMARY KEY', '')}")


async def ensure_table_exists(connection, table_name: str, table_definition: str, indexes: list = None):
    """
    Проверяет существование таблицы и создает её при необходимости
    
    Args:
        connection: Соединение с базой данных
        table_name: Название таблицы
        table_definition: Определение таблицы (SQL)
        indexes: Список определений индексов
    """
    table_exists = await connection.fetchval(f"""
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = '{table_name}'
        );
    """)

    if not table_exists:
        logger.info(f"Создаем таблицу {table_name}...")
        await connection.execute(table_definition)
        
        # Создаем индексы, если они указаны
        if indexes:
            for index_def in indexes:
                await connection.execute(index_def)
    else:
        logger.info(f"Таблица {table_name} уже существует")