# Welcome to your Lovable project

## Project info

**GitHub Repository**: https://github.com/keystone4tech-blip/bot-db-charm

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/keystone4tech-blip/bot-db-charm.git

# Step 2: Navigate to the project directory.
cd bot-db-charm

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment

For deployment instructions, see [DEPLOY.md](DEPLOY.md)

Quick installation:
```bash
curl -sSL https://raw.githubusercontent.com/keystone4tech-blip/bot-db-charm/main/install.sh | bash
```

## Configuration

Before running the project, make sure to configure your `.env` file with the following settings:
- `BOT_TOKEN`: Your Telegram bot token from @BotFather
- `DB_PASSWORD`: Password for PostgreSQL database (default is 2046)
- `WEBAPP_URL`: Your domain URL (e.g., https://keystone-tech.ru)

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Node.js
- Python (Aiogram)
- PostgreSQL (local database)
- Docker
- Docker Compose
