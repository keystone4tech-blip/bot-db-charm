import logging
from aiogram import Router, types
from aiogram.types import ErrorEvent

logger = logging.getLogger(__name__)

error_router = Router()

@error_router.error()
async def global_error_handler(event: ErrorEvent):
    """
    Глобальный обработчик ошибок
    """
    logger.error(f"Critical error occurred: {event.exception}", exc_info=True)
    
    if event.update.message:
        await event.update.message.answer(
            "❌ Произошла критическая ошибка. Пожалуйста, попробуйте позже."
        )
    elif event.update.callback_query:
        await event.update.callback_query.answer(
            "❌ Произошла ошибка. Попробуйте позже.",
            show_alert=True
        )
    
    return True
