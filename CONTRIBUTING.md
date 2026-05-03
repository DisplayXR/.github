# Contributing to DisplayXR

DisplayXR is a multi-repo project. This page is the org-wide overview;
each repo's own `CONTRIBUTING.md` (where present) has the specifics.

## Where to file issues

| What | Where |
|------|-------|
| Runtime / compositor / driver / OpenXR extension bugs | [displayxr-runtime/issues](https://github.com/DisplayXR/displayxr-runtime/issues) |
| User-facing DisplayXR Shell bugs | [displayxr-shell-releases/issues](https://github.com/DisplayXR/displayxr-shell-releases/issues) — triaged into the private dev repo by maintainers |
| Unity plugin issues | [displayxr-unity/issues](https://github.com/DisplayXR/displayxr-unity/issues) |
| Unreal plugin issues | [displayxr-unreal/issues](https://github.com/DisplayXR/displayxr-unreal/issues) |
| Demo-specific bugs | The relevant `displayxr-demo-*` repo |

**One source of truth per issue.** Don't dual-create across repos.

## Branching + PR flow

All Tier 1 (active development) repos require pull requests against
`main` — direct pushes are blocked by branch protection.

1. **External contributors**: fork the repo, branch from `main`, push to your fork, open a PR against the upstream `main`.
2. **Org members**: branch directly from `main` in the source repo, push, open a PR.
3. Open the PR as a **draft** while iterating — CI doesn't run on drafts.
4. Click **Ready for review** when you want CI feedback.
5. A maintainer reviews. The repo's `CODEOWNERS` declares who is auto-requested.
6. Squash or rebase merge only — merge commits are disabled to keep history linear.

## CI cost-saver guards (where applicable)

Repos with CI workflows generally observe the following pattern:

- Drafts skip CI.
- Doc-only PRs skip CI (`paths-ignore: ['**.md', 'docs/**', ...]`).
- Cancel-in-progress: rapid pushes to the same PR cancel earlier runs so
  only the latest commit's CI completes.
- Direct pushes to feature branches are free (no CI).

## Code style

- Runtime / native code: clang-format 11+ via `git clang-format`.
- Plugin / engine code: each plugin's own conventions — see the per-repo `CONTRIBUTING.md`.

## Licensing

Most repos in this organization use **Boost Software License 1.0**
(see each repo's `LICENSE`). By contributing, you agree your work is
licensed under the repo's license.

## Vendor integration

Display vendors looking to add a new hardware target should start with
the [vendor integration guide](https://github.com/DisplayXR/displayxr-runtime/blob/main/docs/guides/vendor-integration.md)
in the runtime repo.
