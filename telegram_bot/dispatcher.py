from aiogram import Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage

# Создаем хранилище состояний
storage = MemoryStorage()

# Создаем диспетчер
dp = Dispatcher(storage=storage)