---
name: example-skill
description: A template skill to demonstrate how to add new agent skills
---

# Example Skill Instructions

This is a template skill file. To add your own skill:

1. Create a new folder in `.agent/skills/` (e.g., `my-new-skill`).
2. Create a `SKILL.md` file inside that folder.
3. Add YAML frontmatter at the top:

    ```yaml

   ---
    name: my-new-skill
    description: Describe what your skill does
   ---
    ```
4.  Write detailed instructions in markdown below the frontmatter.

## What goes here?

You can include:

- Instructions for the agent on how to perform tasks related to this skill.
- Links to other files in the skill folder (e.g., scripts, templates).
- Examples of how to use the skill.

## Example Usage

When the user asks about this topic, the agent will refer to these instructions to guide its actions.
