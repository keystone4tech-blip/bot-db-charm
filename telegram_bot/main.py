import asyncio
import os
from dotenv import load_dotenv
from aiohttp import web
import json

# Загружаем переменные окружения
load_dotenv()

# Импортируем бота и диспетчер
from telegram_bot.bot_instance import bot
from telegram_bot.dispatcher import dp

# Импортируем роутеры
from telegram_bot.handlers import komanda_start_router

# Регистрируем роутеры
dp.include_router(komanda_start_router)

# Импортируем базу данных
from telegram_bot.database import database

# Создаем веб-приложение для API
app = web.Application()

# Обработчик для отправки аутентификационного кода
async def send_auth_code(request):
    try:
        data = await request.json()
        telegram_id = data.get('telegramId')
        auth_code = data.get('authCode')

        if not telegram_id or not auth_code:
            return web.json_response({'error': 'telegramId and authCode are required'}, status=400)

        # Отправляем сообщение пользователю с кодом
        message_text = f"Ваш код для входа в приложение: <b>{auth_code}</b>\n\nВведите этот код на сайте для входа в аккаунт."

        await bot.send_message(chat_id=telegram_id, text=message_text, parse_mode='HTML')

        return web.json_response({'success': True, 'message': 'Auth code sent successfully'})
    except Exception as e:
        print(f"Error in send_auth_code: {e}")
        return web.json_response({'error': str(e)}, status=500)

# Добавляем маршрут
app.router.add_post('/send-auth-code', send_auth_code)

async def main():
    """
    Основная функция запуска бота
    """
    # Подключаемся к базе данных
    await database.connect()

    # Запускаем веб-сервер для API в фоновом режиме
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, 'localhost', 3001)  # Используем порт 3001 для API бота
    await site.start()
    print("Bot API server started at http://localhost:3001")

    try:
        # Запускаем бота
        await dp.start_polling(bot)
    finally:
        # Закрываем соединение с базой данных при завершении
        await database.disconnect()
        await runner.cleanup()

if __name__ == "__main__":
    asyncio.run(main())