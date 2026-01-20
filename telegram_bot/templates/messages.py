from .emojis import EMOJI

# Registration messages
MESSAGE_NO_REFERRAL = f"""\
{EMOJI['WELCOME']} Добро пожаловать в VPN бот!

Мы не нашли ваш реферальный код. Вы можете:

{EMOJI['ADMIN']} Зарегистрироваться как администратор
{EMOJI['REFERRAL']} Ввести реферальный код

Пожалуйста, выберите действие ниже:
"""

MESSAGE_REFERRAL_FOUND = f"""\
{EMOJI['WELCOME']} Добро пожаловать в VPN бот!

{EMOJI['REFERRAL']} Вы присоединились по реферальной ссылке от: {{referrer_name}}

Вы можете:
{EMOJI['CHECK']} Подтвердить регистрацию с этим реферером
{EMOJI['REFERRAL']} Ввести другой реферальный код

Что вы хотите сделать?
"""

MESSAGE_REGISTRATION_SUCCESS = f"""\
{EMOJI['SUCCESS']} Регистрация успешно завершена!

{EMOJI['USER']} Добро пожаловать, {{first_name}}!

Теперь у вас есть полный доступ к функциям бота.

{EMOJI['MENU']} Используйте главное меню ниже для навигации:
"""

MESSAGE_INVALID_CODE = f"""\
{EMOJI['ERROR']} Неверный реферальный код

Код "{{code}}" не найден в системе.

Пожалуйста, проверьте код и попробуйте снова, или выберите другой вариант регистрации.
"""

MESSAGE_ENTER_REFERRAL_CODE = f"""\
{EMOJI['REFERRAL']} Введите реферальный код

Пожалуйста, отправьте реферальный код в чат.

{EMOJI['INFO']} Код должен быть в формате: ABCD1234
"""

MESSAGE_WELCOME_BACK = f"""\
{EMOJI['WELCOME']} С возвращением, {{first_name}}!

{EMOJI['MENU']} Вот ваше главное меню:
"""
