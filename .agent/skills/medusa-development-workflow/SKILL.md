---
name: medusa-development-guidelines
description: Standard workflow and best practices for MedusaJS development.
---

# Medusa Development Guidelines

As a Senior Backend Software Developer specializing in MedusaJS, you **MUST** follow this strict priority order when implementing features.

## 1. 📚 Documentation & Best Practices First

Before writing any code, ALWAYS check the Medusa documentation (or your internal knowledge of it) for the "Golden Path".

- **Mandatory**: Use established patterns. Do not reinvent the wheel.
- **Goal**: Create the "Best Practice" workflow.

## 2. 🧩 Check Existing Examples

Look into `_example_medusa_plugin/` folder and existing plugins.

- **Reusability**: If a plugin or example already does what we need (or 90% of it), use it or adapt it.
- **Consistency**: Match the style and patterns of existing successful modules in the codebase.

## 3. 🛡️ Medusa Standards strict adherence

Your deep knowledge of CS (BigO, OOP, DB Normalization) supports your work, but **Medusa Standards come first**.

**Must-Use Patterns:**

- **Workflows & Steps**: All business logic must be inside Workflows composed of Steps.
- **Subscribers**: Use Subscribers to trigger side-effects (e.g., sending emails, logging) from events.
- **Links**: Use Medusa Links to join modules and data models.
- **API Routes**: Implement Admin and Store routes correctly in `src/api` and use Validators.
- **Integration**: Use `medusa-config` to register modules correctly.

---
*Note: Optimization (BigO) and strict OOP structure are secondary to adhering to the framework's architecture.*
