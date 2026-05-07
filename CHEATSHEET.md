# Neovim Cheatsheet — TS/Node Work

Personal reference for the Vorathex build. Leader key is `Space`.

## File Navigation (Telescope)

- `<Space>ff` — Find files in project
- `<Space>fg` — Live grep across all files
- `<Space>fb` — Switch between open buffers
- `<Space>fs` — Search symbols in current file (functions, classes, vars)

Inside Telescope:

- `Enter` — Open selection
- `Ctrl-n` / `Ctrl-p` — Next / previous result
- `Esc` — Close

## LSP (TypeScript)

- `gd` — Go to definition
- `K` — Hover info (type, docs)
- `<Space>e` — Show diagnostic for current line in floating window
- `[d` — Previous diagnostic
- `]d` — Next diagnostic

## File Tree (NERDTree)

- `Ctrl-n` — Toggle file tree
- `<Space>n` — Reveal current file in tree

## Editing Essentials

- `:w` — Save (also triggers Prettier format-on-save for TS/JS/JSON/MD)
- `:q` — Quit
- `:wq` — Save and quit
- `:q!` — Quit, discard changes
- `u` — Undo
- `Ctrl-r` — Redo

## Completion (blink.cmp)

- Popup appears automatically while typing in insert mode
- `Tab` / `Shift-Tab` — Next / previous suggestion
- `Enter` — Accept
- `Esc` — Dismiss

## Terminal

- `:terminal` — Open terminal in current buffer
- `Ctrl-\ Ctrl-n` — Exit terminal-mode back to normal mode
- `:bd!` — Close terminal buffer (run from normal mode)

## Window & Buffer Management

- `:split` / `:sp` — Horizontal split
- `:vsplit` / `:vsp` — Vertical split
- `Ctrl-w h/j/k/l` — Move between splits (left/down/up/right)
- `Ctrl-w q` — Close current split
- `:bn` / `:bp` — Next / previous buffer
- `:bd` — Close current buffer

## Modes

- `i` — Insert mode (start typing)
- `Esc` — Back to normal mode
- `v` — Visual mode (select chars)
- `V` — Visual line mode (select whole lines)
- `:` — Command mode

## Misc

- `:checkhealth` — Run all health checks (debug missing tools)
- `:checkhealth vim.lsp` — LSP-specific health
- `:Lazy` — Open plugin manager UI
- `:Lazy sync` — Update all plugins
