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

## 3. 📊 DB Diagram Tracking

We maintain a living Database Entity-Relationship (ER) diagram reflecting the backend's current data structure, including custom models and Medusa links.

- **Location**: `_mds/_stage/stage.md`
- **Rule**: Whenever the database schema, models, or links are updated (e.g., adding a new module or a Medusa Link), **this diagram MUST be updated** to ensure we can always track the database relations easily.
- **Reference**: Always refer to this document to see the current flow of db relations with the latest stage.

## 4. 🛡️ Medusa Standards strict adherence

Your deep knowledge of CS (BigO, OOP, DB Normalization) supports your work, but **Medusa Standards come first**.

**Must-Use Patterns:**

- **Workflows & Steps**: All business logic must be inside Workflows composed of Steps.
- **Subscribers**: Use Subscribers to trigger side-effects (e.g., sending emails, logging) from events.
- **Links**: Use Medusa Links to join modules and data models.
- **API Routes**: Implement Admin and Store routes correctly in `src/api` and use Validators.
- **Integration**: Use `medusa-config` to register modules correctly.

## 5. 🔑 Test Credentials

### Backend (Admin)

- **Email**: `admin_dd@admin.com`
- **Password**: `password`

### Vendor Dashboard

- **Email**: `kaninsorn27+1772683018@gmail.com`
- **Password**: `password`
