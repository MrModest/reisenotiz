# Contributing

Thanks for wanting to help. Please read this before writing code: **only
maintainers can open pull requests in this repository.** It's how the project
works, not a judgement on anyone's skill.

## Why only maintainers open pull requests

Writing code is no longer the expensive part. A good description turns into a
working diff in minutes.

The expensive part is knowing that the diff is right:

- reading every line and checking it fits the rest of the codebase
- running it against the test suites of both the app and the sync server
- making sure existing installs upgrade cleanly: stored trips, synced documents, settings
- testing the change by hand in the running app, offline and synced, beyond what the suites cover

A pull request skips none of that. Verifying someone else's diff, written
without the context of where the project is going, costs more than generating
the same change from a clear spec and verifying that. So the code in a PR isn't what's valuable. The understanding
behind it is, and that fits better in an issue.

## How to contribute

Open an [issue](https://github.com/MrModest/reisenotiz/issues/new). The
most useful issue is one precise enough to paste into a coding agent as its
prompt. If an agent could build the right thing from it with no follow-up
questions, it's a great issue.

### Feature requests and changes

Write it as a prompt for an agent, in three parts:

- **Goal.** What you're trying to do, and why. One or two sentences.
- **Behaviour.** What happens today and what should happen instead. Name
  screens, fields or settings exactly; be concrete about labels, defaults and
  what you see on a phone versus a desktop. Mention the files involved if you
  know them.
- **Acceptance.** Steps a person could follow to check it's done and what
  they'd see at the end. Include edge cases (empty states, long trips, time
  zones, offline use, trips created before the change) and what this should
  *not* change.

A short example:

```markdown
**Goal:** See how long a trip is without opening it.

**Behaviour:** Trip cards in the list show the title and dates; the number of
days is only visible inside the trip. Trip cards should show "5 days" next to
the dates, and "1 day" for a single-day trip. Trips without dates show nothing.

**Acceptance:** Create a trip from 3 to 7 March and one without dates. The
first card shows "5 days"; the second shows no count. Trips created before
this change show a count too. Sorting or filtering by length is out of scope.
```

### Bug reports

Include:

- the version you run
- how you run it: Docker or from source, and with or without the sync server
- steps to reproduce, from a fresh page load
- what you expected and what happened instead
- relevant logs, with tokens and personal data removed

### Already wrote the code?

Link your fork or branch in the issue. Working code is a useful reference for
the spec, but the change will be reimplemented rather than merged.
