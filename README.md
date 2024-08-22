# Bartender

Bartender is a Discord bot created for the discord server [Bistro Tech](https://discord.gg/bistro-tech-687640485984206871). The goal of this bot is to manage the server and to provide some useful tools for the members.

## Contributing

The database details can be found [here](./docs/DATABASE.md).

## Usage

### Prerequisites

-   [bun](https://bun.sh/) - Bun is a simple command line tool to manage npm packages. We use v1.1.20.

### Installing

```bash
# Clone the repository
git clone git@github.com:bistro-tech/bartender.git

# Install dependencies
bun install --frozen-lockfile
```

### Configuration

Use the `.env.example` file to create a `.env` file.

### Running

```bash
# Run the bot
bun run dev
```
