# Drafts never enter the store

New and edited entities live in local form state until they are validated and saved; only complete, valid entities are written to an Automerge document. Create and edit are separate routes with separate pages sharing one form component, rather than one page switching on a `mode` flag.

With sync enabled this is not just tidiness: anything written to a document propagates to the user's other devices immediately, so a half-typed trip would sync as real data.

## Consequences

Forms never fetch, navigate, or know whether they are creating or editing — pages orchestrate that. Invariants are validated in the store's mutation hook as the last line of defence, not only in the form.
