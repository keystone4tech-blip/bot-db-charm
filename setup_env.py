#!/usr/bin/env python3
"""
Скрипт для настройки виртуального окружения и установки пакетов
для Telegram бота и всего проекта
"""

import subprocess
import sys
import os
from pathlib import Path

def create_virtual_environment():
    """Создает виртуальное окружение для проекта"""
    print("Создание виртуального окружения...")
    
    # Создаем виртуальное окружение
    result = subprocess.run([sys.executable, "-m", "venv", ".venv"], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✓ Виртуальное окружение успешно создано")
        return True
    else:
        print(f"✗ Ошибка при создании виртуального окружения: {result.stderr}")
        return False

def install_packages():
    """Устанавливает необходимые пакеты в виртуальное окружение"""
    print("Установка пакетов...")
    
    # Определяем путь к pip в виртуальном окружении
    if os.name == 'nt':  # Windows
        pip_path = os.path.join(".venv", "Scripts", "pip.exe")
    else:  # Unix/Linux/macOS
        pip_path = os.path.join(".venv", "bin", "pip")
    
    # Устанавливаем пакеты
    packages = [
        "aiogram==3.16.0",
        "asyncpg==0.30.0",
        "python-dotenv==1.0.1",
        "requests",
        "aiohttp",
        "@supabase/supabase-js"
    ]
    
    for package in packages:
        print(f"Установка {package}...")
        result = subprocess.run([pip_path, "install", package], capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✓ {package} успешно установлен")
        else:
            print(f"✗ Ошибка при установке {package}: {result.stderr}")

def main():
    """Основная функция настройки окружения"""
    print("Настройка виртуального окружения для проекта...")
    print("="*50)
    
    # Создаем виртуальное окружение
    if not create_virtual_environment():
        print("Не удалось создать виртуальное окружение. Завершение.")
        sys.exit(1)
    
    # Устанавливаем пакеты
    install_packages()
    
    print("="*50)
    print("Настройка виртуального окружения завершена!")
    print("\nДля активации виртуального окружения используйте:")
    
    if os.name == 'nt':  # Windows
        print("  .venv\\Scripts\\activate")
    else:  # Unix/Linux/macOS
        print("  source .venv/bin/activate")
    
    print("\nПосле активации окружения вы можете запустить бота командой:")
    print("  python -m telegram_bot.main")

if __name__ == "__main__":
    main()