# Vorathex Workflow

My operating manual for the 142-day bootcamp.
Written Day 6. Revise organically when reality diverges.

## Terminal

- App: Apple Terminal
- Shell: zsh
- Config: ~/.zshrc
- Key env vars: EDITOR=nvim, VISUAL=nvim
- Aliases I rely on daily:
  - gs → git status
  - ga → git add
  - gc → git commit
  - gcm → git commit -m
  - gp → git push
  - gl → git pull
  - glog → git log --oneline --graph --decorate -20
  - gd → git diff
  - gds → git diff --staged
  - gsw → git switch
  - vora → cd ~/vorathex
- History search: Ctrl-R for anything older than the last 2 commands.

## Editor

- Neovim (daily driver, locked in since Day 4)
- Config: ~/.config/nvim/
- How I open the repo to start a session:
  `vora && nvim .`
- Layout / plugins / keymaps: default config for now. Revisit and document
  here if I add anything load-bearing.

## Filesystem layout

- ~/vorathex/ — the bootcamp repo (Vol. I main project)
- ~/weekend-projects/ — Saturday/Sunday consolidation projects
- ~/experiments/ — scratch / throwaway code
- Notes: Notion (cross-platform, no local folder)

## Git habits

- I work on main directly during the bootcamp.
  Branches only when a deliverable explicitly instructs them.
  Reasoning: solo work, no parallel streams, no merge complexity needed yet.
  When the curriculum requires branches, switch then.

- Commit message format: Conventional Commits
  - feat: a new feature or capability
  - fix: a bug fix
  - docs: documentation only
  - chore: tooling, deps, config
  - test: adding or fixing tests
  - refactor: code change without behavior change

- When I commit: end of day, one batched commit per session.
  Tradeoff acknowledged: loses atomicity (can't revert one sub-topic
  cleanly), gains simplicity. Revisit when deliverables span multiple
  files / multiple concerns in Phase 4+.

- Before every commit:
  - `gs` to inspect what changed
  - `ga <specific files>` — never `git add .` blindly
  - `gds` to review staged diff before committing

- When I push: end of day, after the day's commit lands.

- Pulling: `gl` at session start, every session.
  Reason: building the habit before it becomes necessary. Once I'm working
  across two machines or with collaborators, this is non-negotiable; doing
  it now means the muscle memory is already wired.

- New repo setup (weekend projects):
  - `git init`, then immediately:
    `git config user.name "Rehan Ahmed"`
    `git config user.email "<email>"`
  - (I never set a global git config; every repo gets local config.)

## Daily session rhythm

Session start (5 min):

- `vora` → land in repo
- `gl` → pull
- `gs` → see if anything is mid-flight from yesterday
- `glog` → re-orient on recent commits
- Open Neovim, re-read yesterday's notes in Notion
- Paste today's curriculum row into LLM tutor, confirm day

Active work (4.5 hr):

- Sub-topic learning → notes in Notion → code experiments
- Build mode → type code into Neovim → run → fix
- Stage files as they're touched (`ga <file>`), don't accumulate blindly

Session end (15 min):

- `gs` → confirm working tree state
- `gds` → review the full staged diff
- One commit for the day with a meaningful message
- `gp` → push to GitLab
- Update BUGS.md if anything broke today
- Trigger EOD with tutor, paste handoff prompt into Notion for tomorrow

## Things I refuse to do

- No `git add .` (forces me to be intentional about what's staged)
- No committing with "wip" or "stuff" as the message
- No pasting code from the LLM — I type it myself
- No `--force` push without thinking three times first
- No editing `~/.zsh_history` to "clean up" — it's a record, not a draft

## Things to revise later

- Phase 7 will introduce tmux for juggling Postgres + Redis + worker + editor.
  Update this file then.
- When CI lands in Phase 9 / 11, add a "CI workflow" section.
- When collaborators / open-source contributors appear, branch + pull
  policies change. Revisit accordingly.
- Reconsider EOD-only commits when deliverables start spanning multiple files
  with distinct concerns (Phase 4+).
