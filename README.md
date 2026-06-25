# Vorathex

An event-sourced matching engine, written in TypeScript.

Vorathex is the core of an exchange: it keeps an order book, matches incoming
orders against resting ones by price-time priority, and produces trades. The
part that makes it worth building is _how_ it stores state. Most systems keep
the current state and overwrite it as things change. Vorathex doesn't store the
order book at all. It stores an append-only log of events, and the order book is
derived by replaying that log. State is a consequence of history, not a thing
that gets mutated in place.

That one decision is what the whole project is organized around.

## The idea

Every action becomes an event: an order placed, an order matched, a trade
executed, an order cancelled. These events are appended to a log and never
changed. To know what the order book looks like right now, you fold over the log
from the beginning. Kill the process, start it again, replay the events, and the
book rebuilds exactly as it was.

Because nothing is ever mutated and the matching logic is pure (state in, new
state out), the engine is deterministic: feed the same sequence of orders
through it twice and you get byte-identical trades. That guarantee is treated as
a hard rule. There's a test that runs a thousand orders through the engine
twice and fails the build if the output differs.

## What's in it

- A matching engine handling limit and market orders, full and partial fills,
  cancellations, and the empty-book and no-liquidity cases.
- An order book built as a projection over the event log, never stored directly.
- An event store with two interchangeable backends: in-memory for tests, and
  Postgres for durability so the log survives restarts.
- Redis Streams as an asynchronous ingestion queue between clients and the
  engine, with consumer groups for crash recovery.
- A reference HTTP server (Express, Zod-validated input, API-key auth on writes,
  Swagger docs) that wraps the engine over REST.

Around all of that: typed configuration, structured logging with correlation
IDs, graceful shutdown, health checks, and a real test suite.

## How a request flows

```
client  ->  Redis Stream  ->  ingestion worker  ->  matching engine
                                                          |
                                                   appends events
                                                          |
                                                   Postgres event log
                                                          |
                                            order book = fold(events)
```

The order book at the end is never written down as state. It's recomputed from
the events whenever it's needed, and rebuilt from scratch on startup.

## The AI layer

A second stage wraps the engine in a natural-language gateway and a
market-surveillance system. The rule governing all of it is strict: the model
never touches the matching path. An LLM is non-deterministic, and determinism is
the entire promise here, so the model is only allowed to do two things.

It can **propose**: a user types plain English, the model turns it into a
candidate order, and the existing validation schemas check it before the engine
ever sees it. A proposal that doesn't validate is rejected and never becomes a
trade.

It can **observe**: it reads the event log after the fact, out of band, to
answer questions about what happened to an order and to flag manipulation
patterns like spoofing and layering. Detection is plain code; the model only
explains the flags a deterministic rule already raised. A test asserts that the
engine's output is identical whether surveillance is running or not.

Everything sits behind a provider interface, so swapping models is a config
change and the core never moves.

## Status

This is a build in progress, not a finished release. It isn't on npm yet, and
the API is not stable. I'm building it in the open as a learning project, one
piece at a time.

Progress, write-ups, and the running build log are on:

- Blog log: https://blog.rehan.co.in/log
- LinkedIn: https://www.linkedin.com/in/rehanahmed-dev
- Twitter / X: https://x.com/RehanAhmed2003

## Running it locally

Requires Node.js (LTS), Postgres, and Redis.

```bash
git clone https://gitlab.com/rehanamd.dev/vorathex.git
cd vorathex
npm install
npm run dev
```

Setup details and configuration will be documented as the pieces stabilize.

## Why I'm building this

I wanted one project I could explain end to end and defend every choice in —
why event sourcing, why determinism matters, where I drew the line on the AI
layer and why I refused to cross it. The goal isn't to ship the most features.
It's to build something I actually understand.

## License

MIT.
