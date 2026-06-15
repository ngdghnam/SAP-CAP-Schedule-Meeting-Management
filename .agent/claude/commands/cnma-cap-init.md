# CAP Init - Initialize SAP CAP Project

> Initialize a new SAP CAP project following CNMA Clean Architecture structure

## Usage

`/cap-init [--variant] [--java] [--full] [--frontend react|ui5]`

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--variant` | Include VariantSettings table and handlers | false |
| `--java` | Use Java backend (default: Node.js TypeScript) | false |
| `--full` | Generate full CAP with UI (DB+SRV+UI) | false |
| `--frontend` | Frontend type: `react` (Flat + @cnma/react-ui), `ui5` | react |

## Arguments

If flags are not provided, the command will prompt for:

1. **Project Name** — e.g., `cnma_notification_service`
2. **Namespace** — e.g., `cnma.notification` (dot-separated lowercase)
3. **Backend Language** — Node.js TypeScript ★ or Java
4. **Project Type** — Full CAP (DB+SRV+UI) or Backend Only (DB+SRV)
5. **Frontend Type** — React v2 ★ or UI5 Freestyle (if Full CAP)
6. **Variant Management** — Yes/No

## Placeholder Mapping

| Placeholder | Replace With |
|-------------|--------------|
| `{{project_name}}` | Project's MTA name |
| `{{namespace}}` | Dot-notation namespace |
| `{{module_name}}` | Extracted from namespace (e.g., `notification`) |
| `{ServiceName}` | User-provided service name |
| `{{FeatureName}}` | Feature class name (PascalCase) |
| `{{feature_name}}` | Feature folder name (kebab-case) |

## CAP Standard Structure

```
{{project_name}}/
├── db/
│   ├── schema/
│   │   └── *.cds              # CDS schema (namespace: {{namespace}})
│   └── undeploy.json           # EMPTY before deployment
└── srv/
    ├── {ServiceName}.cds      # Service definition
    ├── src/                    # Domain-driven source
    │   ├── common/            # Interfaces, models, exceptions
    │   ├── domain/            # Feature-based (SRP)
    │   │   └── __feature__/
    │   │       ├── handler/   # Event registration (SRP)
    │   │       ├── events/   # Event logic (OnRead*, OnBefore*, OnAfter*)
    │   │       ├── model/
    │   │       ├── repository/
    │   │       └── service/
    │   └── infrastructure/    # External systems (DIP)
    ├── index.ts                # Module entry (Node.js)
    └── server.ts               # CAP bootstrap (Node.js)
```

## Architecture Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **domain/handler/** | `srv/src/domain/*/handler/` | Event registration only |
| **domain/events/** | `srv/src/domain/*/events/` | Event logic (OnRead*, OnBeforeCreate*, etc.) |
| **domain/service/** | `srv/src/domain/*/service/` | Business logic (DIP) |
| **domain/repository/** | `srv/src/domain/*/repository/` | Data access (CQN) |
| **infrastructure/database/** | `srv/src/infrastructure/database/` | DB operations |
| **infrastructure/integration/** | `srv/src/infrastructure/integration/` | External APIs |

## Examples

```bash
# Interactive mode
/cap-init

# Quick Node.js backend only
/cap-init --full

# Java backend with variant management
/cap-init --java --variant

# Full CAP with UI5 frontend
/cap-init --full --frontend ui5
```

## Notes

- **HDI Container Protection**: `db/undeploy.json` must be empty before deployment
- **Namespace Convention**: Always `cnma.{module_name}` (dot-separated lowercase)
- **UI Namespace**: Derived by replacing dots with `/` → `cnma/notification/app`