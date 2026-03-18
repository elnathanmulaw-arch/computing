# AGENTS.md

## Cursor Cloud specific instructions

This repository (`computing`) is currently empty — it contains only a `README.md` placeholder. There are no application services, dependencies, build tools, test frameworks, or CI/CD pipelines configured.

### Current state

- **Language/Framework:** None yet.
- **Package manager:** None yet.
- **Services:** None to start.
- **Lint/Test/Build:** No commands available.

### When code is added

Once application code and a package manifest (e.g., `package.json`, `requirements.txt`, `go.mod`, etc.) are added, future agents should:

1. Install dependencies using the appropriate package manager.
2. Update the VM environment update script accordingly via `SetupVmEnvironment`.
3. Run lint, test, and build commands as documented in the repo's README or contributing guide.
