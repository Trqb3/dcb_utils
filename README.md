# DCB Utils

![npm](https://img.shields.io/npm/v/@trqb3/dcb-utils)
![npm downloads](https://img.shields.io/npm/dm/@trqb3/dcb-utils)
![license](https://img.shields.io/npm/l/@trqb3/dcb-utils)
![node](https://img.shields.io/badge/Node-24-43853D)
![typescript](https://img.shields.io/badge/TypeScript-Ready-3178C6)
![discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2)

A modular JavaScript/TypeScript toolkit for Discord bot development, focused on Hypixel SkyBlock automation and reusable bot infrastructure.

DCB Utils provides the foundational utilities needed to build event-driven Discord applications with less boilerplate: SkyBlock time handling, command/event registration, environment validation, logging, file access, and database helpers.

## Overview

Built for modern Discord.js projects, DCB Utils reduces repetitive setup logic and standardizes the operational layer of a bot application.

It is especially useful for:

- Hypixel SkyBlock bot systems
- Automated event notifications and pings
- Shared command/event bootstrap patterns
- Reliable environment checks and centralized logging

## Features

- SkyBlock time conversion and calendar simulation
- Real-time `change` event tracking for in-game time updates
- Automated Discord event and command registration
- Environment validation utilities
- Structured logger abstraction
- File and directory management helpers
- Database utility layer
- Type declarations for TypeScript integration

## Installation

npm:

```bash
npm install @trqb3/dcb-utils
```

Yarn:

```bash
yarn add @trqb3/dcb-utils
```

## Quick Start

```js
const { Client, GatewayIntentBits } = require('discord.js');
const { Time, EventHandler, validateEnv, Logger } = require('@trqb3/dcb-utils');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const logger = new Logger();
const skyblockTime = new Time();

skyblockTime.on('change', (time) => {
  console.log(`SkyBlock time updated: ${time.month} ${time.day}, ${time.year} - ${time.string}`);
});

new EventHandler({
  dir: process.cwd(),
  client,
  logger,
  devs: ['123456789012345678'],
  testServer: '123456789012345678'
});

client.login(validateEnv(process.env.DISCORD_TOKEN, 'DISCORD_TOKEN'));
```

## API Reference

### Time

Compute SkyBlock time from a native JavaScript `Date` object.

```js
const { Time } = require('@trqb3/dcb-utils');

const timer = new Time();
const current = timer.get(new Date());

console.log({
  year: current.year,
  month: current.month,
  day: current.day,
  hour: current.hour,
  minute: current.minute,
  value: current.string
});
```

Behavior:

- tracks the current SkyBlock time internally
- emits a `change` event when the SkyBlock time advances
- supports relative recalculation via `recalculate()`

### Events

Define event conditions and evaluate them against a computed SkyBlock time.

```js
const { Events, Time } = require('@trqb3/dcb-utils');

const event = new Events({
  day: 1,
  month: 'Spring',
  year: null,
  hour: 12,
  minute: 0
});

const current = new Time().get(new Date());
const shouldTrigger = event.check(current);

console.log(shouldTrigger);
```

### EventHandler

Register and manage Discord events and command lifecycle logic from a structured project layout.

```js
const { EventHandler } = require('@trqb3/dcb-utils');

new EventHandler({
  dir: __dirname,
  client,
  logger,
  useDefaultCommandInteractionHandler: true
});
```

This abstraction keeps event registration clean while maintaining a consistent interaction flow.

### validateEnv

Validate required environment variables before startup.

```js
const { validateEnv } = require('@trqb3/dcb-utils');

const token = validateEnv(process.env.DISCORD_TOKEN, 'DISCORD_TOKEN');
```

If the value is undefined, the helper throws a structured DCB error.

## Project Structure

```text
project/
├── src/
│   ├── discord/
│   ├── errors/
│   ├── skyblock/
│   └── util/
├── typings/
├── package.json
├── tsconfig.json
├── LICENSE
├── README.md
└── node_modules/
```

## Production Use Cases

DCB Utils is well-suited for:

- Hypixel SkyBlock alert systems
- Time-based trigger logic and event scheduling
- Shared Discord bot infrastructure across services
- Command/event architectures built around reusable modules
- Internal utility layers for Discord-facing applications

## License

MIT License

## Author

Trqb3

## Notes

This package is designed as a reusable infrastructure layer. For production systems, it is recommended to combine it with project-specific command logic, database access patterns, and service orchestration.
