# Documentation Guide

## A practical guide to writing clear, useful software documentation

This guide uses the **Divio Documentation System** as its core
structure. The central idea is simple:

> Documentation is not one thing. It has four different jobs.

The four types are:

1.  **Tutorials** --- help a beginner learn by doing.
2.  **How-to guides** --- help a user accomplish a specific task.
3.  **Reference** --- provide accurate technical information.
4.  **Explanation** --- build understanding and provide context.

The most important rule is to keep these purposes separate. A page
becomes harder to write, harder to maintain, and harder to use when it
tries to teach, instruct, describe, and explain at the same time.

------------------------------------------------------------------------

## 1. The Four Types at a Glance

  --------------------------------------------------------------------------
  Type              Main purpose      User's question   Style
  ----------------- ----------------- ----------------- --------------------
  Tutorial          Learning          "Can you teach me Guided lesson
                                      how to use this?" 

  How-to            Achieving a goal  "How do I do      Practical recipe
                                      this?"            

  Reference         Looking up        "What does this   Precise description
                    information       do?"              

  Explanation       Understanding     "Why does this    Discussion/context
                                      work this way?"   
  --------------------------------------------------------------------------

A useful mental model is:

``` text
                    UNDERSTANDING
                         ↑
                         |
              EXPLANATION
                         |
                         |
LEARNING ←───────────────┼──────────────→ INFORMATION
                         |
                         |
              REFERENCE
                         |
                         ↓
                       ACTION

         TUTORIAL          HOW-TO
```

Do not worry about making every document fit perfectly into a quadrant.
Use the system as a decision tool.

------------------------------------------------------------------------

# 2. Tutorials

## Purpose

A tutorial is a lesson for someone who is new to the project.

The reader should finish with a working result and enough practical
experience to understand the rest of the documentation.

A tutorial answers:

> "Can you take me through my first successful experience with this
> project?"

## Characteristics

A good tutorial:

-   assumes very little project-specific knowledge
-   gives the reader concrete actions
-   progresses from simple to more complex
-   produces visible results quickly
-   is tested from beginning to end
-   uses one coherent example
-   avoids unnecessary theory
-   gives the learner confidence

The tutorial is **learning-oriented**, not reference-oriented.

## Tutorial structure

``` markdown
# Build Your First <Project>

## What you will build

Briefly show the final result.

## Prerequisites

List only what the learner genuinely needs.

## 1. Create the project

Commands and actions.

## 2. Add the first feature

Commands and actions.

## 3. Connect the components

Commands and actions.

## 4. Run the project

Show the expected result.

## 5. Make a small change

Give the learner one useful modification.

## Next steps

Link to relevant how-to, reference, and explanation pages.
```

## Rules for tutorials

### 1. Let the user learn by doing

Do not begin with a long conceptual lecture.

Instead of:

``` text
FastAPI is a modern Python framework that...
```

prefer:

``` text
Create a file named main.py and add:
...
```

Then provide only the explanation necessary to understand the immediate
action.

### 2. Make every step produce something understandable

Avoid asking the learner to perform ten invisible setup operations
before showing any result.

A strong tutorial has frequent feedback:

``` text
Action → Result → Action → Result
```

### 3. Use concrete examples

Teach through one small, complete project rather than a collection of
unrelated fragments.

### 4. Do not optimize for experts

A beginner tutorial does not need to demonstrate the most sophisticated
or production-ready approach.

Its job is to get the learner started successfully.

### 5. Test the entire tutorial

Run it from a clean environment.

Check:

-   commands
-   package versions
-   file paths
-   screenshots
-   expected output
-   configuration
-   links
-   code
-   operating-system assumptions

If the tutorial fails for a new user, the tutorial has failed regardless
of how technically correct the individual instructions are.

### 6. Keep explanations short

If a concept needs substantial discussion, link to an Explanation page.

Example:

``` markdown
> For an explanation of why this authentication flow is designed this way,
> see [Authentication architecture](../explanation/authentication.md).
```

------------------------------------------------------------------------

# 3. How-to Guides

## Purpose

A how-to guide is a practical recipe for solving a specific problem.

It assumes that the reader already understands the basics.

A how-to answers:

> "I know what I want to accomplish. How do I do it?"

Examples:

-   How to add authentication
-   How to configure PostgreSQL
-   How to deploy the application
-   How to enable logging
-   How to reset a user's password

## Characteristics

A good how-to:

-   starts with a specific goal
-   contains actionable steps
-   assumes reasonable existing knowledge
-   focuses on the result
-   avoids unnecessary theory
-   allows reasonable variations
-   stops when the goal is achieved

## Naming

Good:

``` text
How to configure Google OAuth
How to deploy to production
How to reset a database
How to add a new API endpoint
```

Weak:

``` text
Authentication
Deployment
Database
API endpoints
```

The title should make the user's goal obvious.

## How-to structure

``` markdown
# How to <achieve a specific goal>

## Goal

One or two sentences describing the desired outcome.

## Before you start

Only necessary prerequisites.

## Steps

### 1. <Action>

Instructions.

### 2. <Action>

Instructions.

### 3. <Action>

Instructions.

## Verify

Explain how the reader knows it worked.

## Troubleshooting

Only include problems relevant to this procedure.

## Related

Links to reference and explanation pages.
```

## Important distinction

A how-to guide is **not a tutorial**.

Tutorial:

> "Let's build your first API."

How-to:

> "How to add rate limiting to an existing API."

The tutorial controls the learning path.

The how-to responds to a specific user goal.

## Avoid overloading how-to guides

Do not turn this:

``` text
How to enable Redis caching
```

into:

``` text
What Redis is
History of caching
All Redis data structures
Caching theory
Every Redis configuration option
How to benchmark Redis
How to deploy Redis
How to monitor Redis
How to enable Redis caching
```

Those topics belong elsewhere.

------------------------------------------------------------------------

# 4. Reference Documentation

## Purpose

Reference documentation is an accurate description of the system.

It answers:

> "What does this component, command, option, API, class, function, or
> configuration value do?"

Reference is **information-oriented**.

## Typical reference material

Examples:

``` text
API endpoints
CLI commands
Configuration options
Environment variables
Classes
Functions
Methods
Database schemas
Error codes
Events
Webhooks
File formats
Supported versions
```

## Reference structure

Reference should normally follow the structure of the software itself.

For example:

``` text
src/
├── auth/
│   ├── login.py
│   └── permissions.py
├── users/
│   └── service.py
└── payments/
    └── service.py
```

could have documentation structured similarly:

``` text
Reference
├── Authentication
│   ├── Login
│   └── Permissions
├── Users
│   └── User Service
└── Payments
    └── Payment Service
```

This makes the code and documentation easier to navigate together.

## Reference entry template

``` markdown
## `create_user()`

Creates a new user.

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | User's email address |
| `name` | string | Yes | Display name |
| `role` | string | No | User role |

### Returns

`User`

### Errors

- `ValidationError` — invalid input
- `ConflictError` — email already exists

### Example

```python
user = create_user(
    email="user@example.com",
    name="Example User"
)
```


    ## Rules for reference

    ### Be accurate

    Reference documentation should match the actual implementation.

    ### Be consistent

    Use the same format for similar objects.

    For example, every API endpoint should use the same ordering:

    ```text
    Purpose
    Method
    URL
    Authentication
    Parameters
    Request
    Response
    Errors
    Example

### Describe, do not teach

Reference can show a small example, but it should not become a tutorial.

### Avoid opinions

Do not put subjective architectural discussion into a reference entry.

Link to Explanation instead.

------------------------------------------------------------------------

# 5. Explanation

## Purpose

Explanation helps readers understand concepts, decisions, architecture,
trade-offs, and context.

It answers:

> "Why is this designed this way?"

Explanation is **understanding-oriented**.

## Good topics for Explanation

Examples:

``` text
Why the project uses JWT authentication
How the caching architecture works
Why the database uses this schema
How requests move through the system
Why the project chose PostgreSQL
Security model
Architecture decisions
Design trade-offs
Performance considerations
Background concepts
Known limitations
```

## Explanation structure

There is no single rigid template, but this structure works well:

``` markdown
# Authentication Architecture

## Overview

Explain the main idea.

## Why we use this approach

Explain the problem and constraints.

## How it works

Describe the system at a conceptual level.

## Alternatives considered

Compare reasonable alternatives.

## Trade-offs

Explain what this design improves and what it costs.

## Limitations

Explain where the approach is weaker.

## Related

Link to tutorials, how-to guides, and reference pages.
```

## Explanation should not become instruction

Avoid:

``` markdown
First, install Redis.
Then create redis.py.
Then add REDIS_URL.
```

That belongs in a how-to guide.

Instead:

``` markdown
The application uses Redis because frequently accessed data
does not need to be recomputed for every request.
```

Then link to:

``` text
How to configure Redis caching
```

------------------------------------------------------------------------

# 6. The Most Important Rule: Separate the Four Types

The same subject may require all four types.

For example, consider authentication.

### Tutorial

``` text
Build your first authenticated application
```

Teaches a beginner through a complete working example.

### How-to

``` text
How to add Google OAuth
```

Solves a specific task.

### Reference

``` text
POST /api/auth/login
```

Describes the endpoint precisely.

### Explanation

``` text
Authentication architecture
```

Explains why the system uses its authentication design.

These documents are related, but they have different jobs.

------------------------------------------------------------------------

# 7. How to Decide What Type of Page to Write

Before creating a page, ask one question:

``` text
What is the reader trying to do with this page?
```

Then classify it.

### If the reader needs to learn

Write a **Tutorial**.

``` text
"I am new. Show me how to get started."
```

### If the reader needs to accomplish a known task

Write a **How-to**.

``` text
"I need to accomplish X. How do I do it?"
```

### If the reader needs to look something up

Write **Reference**.

``` text
"What does X accept / return / mean?"
```

### If the reader needs deeper understanding

Write **Explanation**.

``` text
"Why does X work this way?"
```

## Quick decision tree

``` text
Does the reader need to learn the project?
        |
       YES
        ↓
    TUTORIAL

Does the reader have a specific problem to solve?
        |
       YES
        ↓
     HOW-TO

Does the reader need precise technical information?
        |
       YES
        ↓
    REFERENCE

Does the reader need context or understanding?
        |
       YES
        ↓
   EXPLANATION
```

------------------------------------------------------------------------

# 8. Recommended Documentation Structure

A practical project can use:

``` text
docs/
├── index.md
│
├── tutorials/
│   ├── getting-started.md
│   └── first-project.md
│
├── how-to/
│   ├── add-authentication.md
│   ├── configure-database.md
│   ├── deploy.md
│   └── troubleshoot.md
│
├── reference/
│   ├── api.md
│   ├── configuration.md
│   ├── cli.md
│   └── environment-variables.md
│
└── explanation/
    ├── architecture.md
    ├── authentication.md
    ├── database-design.md
    └── security.md
```

The exact folder names are not mandatory. The important thing is that
the purposes remain distinct.

------------------------------------------------------------------------

# 9. The Documentation Homepage

The homepage should help the reader choose the correct path.

A useful structure:

``` markdown
# Project Name

One-sentence description of the project.

## Get started

New to the project?

→ [Tutorial: Build your first project](tutorials/getting-started.md)

## Solve a problem

Looking for instructions for a specific task?

→ [How-to guides](how-to/)

## Look something up

Need technical details?

→ [Reference](reference/)

## Understand the system

Want to understand architecture and design decisions?

→ [Explanation](explanation/)
```

Do not turn the homepage into a giant information dump.

Its primary job is navigation.

------------------------------------------------------------------------

# 10. Linking Between Documentation Types

The four types should be separate, but connected.

For example:

``` text
Tutorial
   ↓
How-to
   ↓
Reference
   ↓
Explanation
```

These are not strict navigation rules. A reader may enter anywhere.

A how-to might say:

``` markdown
For the complete API definition, see the
[Authentication API reference](../reference/authentication-api.md).

For the reasoning behind this design, see
[Authentication architecture](../explanation/authentication.md).
```

A reference page might say:

``` markdown
For a practical example, see
[How to authenticate API requests](../how-to/authenticate.md).
```

Links let each page stay focused.

------------------------------------------------------------------------

# 11. Write for the Reader's Situation

Different readers arrive with different goals.

Typical situations:

``` text
New user
    ↓
Tutorial

Experienced user with a task
    ↓
How-to

Developer looking up details
    ↓
Reference

Developer trying to understand the system
    ↓
Explanation
```

Do not force every reader through the same document.

Good documentation lets the reader enter at the point they need.

------------------------------------------------------------------------

# 12. Keep Scope Small

A common documentation problem is trying to put everything into one
page.

Instead of:

``` text
Authentication
```

split it into:

``` text
Tutorial:
Build an authenticated API

How-to:
How to add OAuth

How-to:
How to reset authentication credentials

Reference:
Authentication API

Reference:
Authentication configuration

Explanation:
Authentication architecture
```

Smaller focused documents are easier to:

-   find
-   read
-   review
-   test
-   update
-   link to
-   reuse

------------------------------------------------------------------------

# 13. Page Titles

Titles should tell the reader exactly what they will get.

## Tutorials

Prefer:

``` text
Build Your First API
Create Your First Plugin
Build a Simple Chat Application
```

## How-to

Prefer:

``` text
How to Configure PostgreSQL
How to Add OAuth Login
How to Deploy to Production
```

## Reference

Prefer:

``` text
Authentication API
Configuration Reference
CLI Commands
Environment Variables
```

## Explanation

Prefer:

``` text
Authentication Architecture
Database Design
Caching Strategy
Deployment Architecture
```

Avoid vague titles such as:

``` text
Introduction
Notes
Miscellaneous
Things to Know
Technical Stuff
Other
```

unless the scope is genuinely clear from context.

------------------------------------------------------------------------

# 14. Code Examples

Code examples should be:

-   correct
-   minimal
-   runnable where practical
-   consistent with the current project
-   relevant to the surrounding text

Avoid unnecessarily large examples.

Bad:

``` text
500 lines of code
```

Better:

``` text
The smallest example that demonstrates the concept.
```

If an example depends on previous code, clearly state that.

For example:

``` markdown
The following assumes the `app` object from the previous section.
```

Do not silently depend on hidden setup.

------------------------------------------------------------------------

# 15. Commands

When documenting commands, show exactly what the reader should enter.

Example:

``` bash
npm install
npm run dev
```

Then show expected output when useful:

``` text
Local: http://localhost:3000
```

Clearly distinguish:

``` text
$ command typed by the user
output produced by the command
```

Avoid ambiguous placeholders.

Instead of:

``` bash
run-command
```

say:

``` bash
npm run build
```

If the user must replace a value:

``` bash
npm install <package-name>
```

Explain what `<package-name>` represents.

------------------------------------------------------------------------

# 16. Configuration Documentation

Configuration documentation should clearly distinguish:

``` text
Variable
Type
Required?
Default
Allowed values
Description
Example
```

Example:

``` markdown
## `DATABASE_URL`

| Property | Value |
|---|---|
| Type | String |
| Required | Yes |
| Default | None |

Database connection string.

Example:

```env
DATABASE_URL=postgresql://user:password@localhost/app
```


    Do not expose real secrets, API keys, passwords, tokens, or private credentials in documentation.

    Use obvious placeholders:

    ```text
    YOUR_API_KEY
    YOUR_DATABASE_PASSWORD
    example.com

------------------------------------------------------------------------

# 17. API Documentation

For every endpoint, keep a consistent format.

Recommended:

``` markdown
## Create User

`POST /api/users`

Creates a new user.

### Authentication

Requires an authenticated administrator.

### Request body

```json
{
  "name": "Example User",
  "email": "user@example.com"
}
```

### Response

`201 Created`

``` json
{
  "id": "123",
  "name": "Example User",
  "email": "user@example.com"
}
```

### Errors

-   `400` --- Invalid request
-   `401` --- Authentication required
-   `403` --- Insufficient permissions
-   `409` --- User already exists

```{=html}
<!-- -->
```

    Keep API reference factual.

    Put architectural reasoning in Explanation pages.

    ---

    # 18. Error and Troubleshooting Documentation

    Troubleshooting is usually a **How-to** function.

    A good troubleshooting entry follows:

    ```markdown
    ## Error: Connection refused

    ### Symptom

    The application reports:

    ```text
    Connection refused

### Cause

The database server is not running or the configured host/port is
incorrect.

### Fix

1.  Check that the database is running.
2.  Check `DATABASE_URL`.
3.  Restart the application.

### Verify

Run the application again and confirm that the connection succeeds.


    Avoid a huge list of random possible causes.

    Start with the most likely causes and provide clear checks.

    ---

    # 19. Screenshots and Diagrams

    Use visuals when they reduce cognitive effort.

    Good uses:

    - UI workflows
    - architecture
    - request flows
    - directory structures
    - complex relationships
    - configuration interfaces

    Do not add screenshots simply because you can.

    A screenshot should answer a question that text would answer less efficiently.

    For screenshots:

    - crop unnecessary UI
    - highlight the relevant area
    - keep terminology consistent
    - update screenshots when the UI changes
    - avoid showing secrets or personal information

    For architecture diagrams, keep the first diagram high-level.

    Example:

    ```text
    Client
      |
      v
    API
      |
      +----> Authentication
      |
      +----> Application Service
                  |
                  v
               Database

------------------------------------------------------------------------

# 20. Writing Style

Use simple, direct language.

Prefer:

``` text
Run the application.
```

over:

``` text
You should now proceed to execute the application.
```

Prefer:

``` text
The API returns a JSON object.
```

over:

``` text
It can be observed that the API is capable of returning...
```

## Use active voice

Prefer:

``` text
The server validates the token.
```

over:

``` text
The token is validated by the server.
```

Passive voice is not forbidden, but active voice is usually clearer.

## One idea per sentence

Avoid sentences containing several unrelated ideas.

## Use concrete words

Prefer:

``` text
Create the file.
```

over:

``` text
Proceed with the creation of the relevant file.
```

------------------------------------------------------------------------

# 21. Headings

Headings should create a useful navigation structure.

Good:

``` text
# Configure Authentication

## Prerequisites

## Create the OAuth application

## Add environment variables

## Test authentication

## Troubleshooting
```

Avoid excessive nesting:

``` text
# Topic
## Section
### Subsection
#### Sub-subsection
##### Another subsection
```

If a page requires many levels, consider splitting it.

------------------------------------------------------------------------

# 22. Lists and Tables

Use lists when readers need to scan information.

Use tables when comparing consistent properties.

Example:

``` markdown
| Option | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `HOST` | `localhost` | Server host |
| `DEBUG` | `false` | Enables debug mode |
```

Do not use tables for large paragraphs.

------------------------------------------------------------------------

# 23. Document the "Why" Separately

One of the most common documentation mistakes is mixing instructions
with reasoning.

For example:

``` markdown
## Configure Redis

Install Redis.

We selected Redis because...
Redis uses...
Caching has existed since...
```

This mixes how-to and explanation.

Better:

``` text
How-to:
How to configure Redis caching

Explanation:
Why this project uses Redis
```

Then connect them with links.

This keeps both pages focused.

------------------------------------------------------------------------

# 24. Document the Actual System

Documentation should describe reality, not intention.

If the code does:

``` text
JWT + refresh tokens
```

do not document:

``` text
Session-based authentication
```

If deployment uses:

``` text
Docker + PostgreSQL
```

do not document:

``` text
SQLite deployment
```

A documentation bug can be just as damaging as a code bug because users
may follow it literally.

------------------------------------------------------------------------

# 25. Keep Documentation Close to the Code

When possible:

``` text
Code change
    ↓
Documentation review
    ↓
Documentation update
```

Treat documentation as part of the product, not as an afterthought.

For a feature:

``` text
Feature implementation
        +
Tests
        +
Documentation
```

should be considered one unit of work.

------------------------------------------------------------------------

# 26. Documentation Review Checklist

Before publishing a page, ask:

## Purpose

-   What type is this?
-   Is its purpose obvious?
-   Does it have one primary job?

## Accuracy

-   Does every command work?
-   Does the code match the current project?
-   Are API details correct?
-   Are configuration values current?
-   Are links valid?

## Clarity

-   Can a reader understand the first step?
-   Are assumptions stated?
-   Are important terms defined or linked?
-   Are instructions unambiguous?

## Scope

-   Is unrelated information removed?
-   Is theory separated from instructions?
-   Is reference information separated from explanation?

## Navigation

-   Can the reader find related documents?
-   Are there links to the appropriate other documentation types?
-   Is the page easy to find from the documentation homepage?

## Maintenance

-   Will the page become outdated when the code changes?
-   Is the source of truth clear?
-   Are version-specific details identified?

------------------------------------------------------------------------

# 27. Tutorial Testing Checklist

Tutorials deserve extra testing.

Start from a clean environment and follow the tutorial exactly as a new
user would.

Check:

``` text
[ ] Prerequisites are correct
[ ] Installation works
[ ] Commands work
[ ] Code works
[ ] File paths are correct
[ ] Expected output is accurate
[ ] Environment variables are documented
[ ] Screenshots are current
[ ] Links work
[ ] Final result is achievable
[ ] No hidden knowledge is required
```

Do not test a tutorial only from memory.

The author already knows the solution, so memory can hide missing steps.

------------------------------------------------------------------------

# 28. How to Turn a Messy Page Into Good Documentation

Suppose you have a page containing:

``` text
What authentication is
How to configure JWT
JWT endpoint definitions
Why JWT was chosen
Troubleshooting
Security considerations
Example application
```

Do not simply rewrite it.

First classify each piece:

``` text
What authentication is
→ Explanation

How to configure JWT
→ How-to

JWT endpoint definitions
→ Reference

Why JWT was chosen
→ Explanation

Troubleshooting
→ How-to

Security considerations
→ Explanation / Reference depending on content

Example application
→ Tutorial
```

Then create focused pages and link them together.

This is one of the most useful applications of the Divio system.

------------------------------------------------------------------------

# 29. Documentation Planning Workflow

When starting documentation for a new project, use this process.

## Step 1 --- Understand the project

Identify:

``` text
What does the project do?
Who uses it?
What are the main workflows?
What are the major components?
How is it installed?
How is it configured?
How is it deployed?
What APIs/interfaces exist?
What design decisions matter?
```

## Step 2 --- Build a documentation map

Create four buckets:

``` text
Tutorials
How-to
Reference
Explanation
```

Put candidate topics into the correct bucket.

## Step 3 --- Prioritize

Start with:

``` text
1. Getting-started tutorial
2. Most common how-to guides
3. Core reference
4. Important explanations
```

Do not try to document everything at once.

## Step 4 --- Write the tutorial

Get a beginner from zero to a meaningful result.

## Step 5 --- Write the common how-to guides

Look at real tasks users will perform.

## Step 6 --- Build reference

Document the machinery systematically.

## Step 7 --- Add explanation

Document important concepts, architecture, trade-offs, and decisions.

## Step 8 --- Connect everything

Add links between related pages.

## Step 9 --- Test

Test tutorials and practical instructions.

## Step 10 --- Maintain

Update documentation whenever behavior changes.

------------------------------------------------------------------------

# 30. A Practical Documentation Matrix

Use this when planning pages.

  Reader need                    Documentation type   Example
  ------------------------------ -------------------- -------------------------------
  Learn the project              Tutorial             Build your first application
  Solve a task                   How-to               How to add authentication
  Find a parameter               Reference            `AUTH_TOKEN_EXPIRY`
  Understand architecture        Explanation          Authentication architecture
  Learn deployment               Tutorial             Deploy your first application
  Perform deployment             How-to               How to deploy to production
  Find deployment settings       Reference            Deployment configuration
  Understand deployment design   Explanation          Deployment architecture

If one page appears in multiple rows, it may be doing too many jobs.

------------------------------------------------------------------------

# 31. Common Documentation Failures

## Failure 1: The "Everything" page

One giant page contains installation, tutorial, API reference,
troubleshooting, and architecture.

### Fix

Split it by purpose.

------------------------------------------------------------------------

## Failure 2: Reference disguised as tutorial

The documentation lists every API option but never gets the beginner to
a working result.

### Fix

Create a real tutorial.

------------------------------------------------------------------------

## Failure 3: Tutorial disguised as reference

The API reference contains a long story about building an application.

### Fix

Move the practical lesson to a tutorial.

------------------------------------------------------------------------

## Failure 4: How-to contains a lecture

The user wants to enable a feature but has to read several paragraphs of
theory first.

### Fix

Move the theory to Explanation.

------------------------------------------------------------------------

## Failure 5: Explanation contains instructions

The architecture page becomes a step-by-step setup manual.

### Fix

Link to the relevant How-to.

------------------------------------------------------------------------

## Failure 6: Outdated examples

The codebase changes but documentation examples do not.

### Fix

Test examples and update documentation as part of feature changes.

------------------------------------------------------------------------

## Failure 7: Vague titles

Users cannot tell which page solves their problem.

### Fix

Use goal-oriented titles for tutorials and how-to guides.

------------------------------------------------------------------------

## Failure 8: Excessive completeness

Every page tries to mention every related fact.

### Fix

Optimize for the reader's immediate purpose. Link instead of dumping
information.

------------------------------------------------------------------------

# 32. Definition of Done for Documentation

A documentation page can be considered complete when:

``` text
[ ] The page has one clear purpose.
[ ] It belongs to the correct Divio category.
[ ] The title accurately describes the content.
[ ] The intended reader is clear.
[ ] Prerequisites are stated.
[ ] Instructions are complete where required.
[ ] Examples are correct.
[ ] Technical facts match the implementation.
[ ] Unnecessary information has been removed.
[ ] Related documentation is linked.
[ ] The page has been reviewed.
[ ] Practical instructions have been tested.
```

For tutorials, add:

``` text
[ ] Tested from a clean environment.
[ ] Beginner can complete it without hidden knowledge.
[ ] Results appear frequently.
[ ] Final result is meaningful.
```

------------------------------------------------------------------------

# 33. A Reusable Markdown Template

## Tutorial template

``` markdown
# Build <Something>

Briefly state what the reader will build.

## Prerequisites

- Requirement 1
- Requirement 2

## 1. <First action>

Instructions.

Expected result:

```text
...
```

## 2. `<Second action>`{=html}

Instructions.

## 3. `<Third action>`{=html}

Instructions.

## Verify

Explain how to confirm success.

## Next steps

-   [How to ...](../how-to/example.md)
-   [Reference](../reference/example.md)
-   [Explanation](../explanation/example.md)

```{=html}
<!-- -->
```

    ## How-to template

    ```markdown
    # How to <Achieve a Specific Goal>

    Briefly state the goal.

    ## Prerequisites

    Only necessary prerequisites.

    ## Steps

    ### 1. <Action>

    Instructions.

    ### 2. <Action>

    Instructions.

    ### 3. <Action>

    Instructions.

    ## Verify

    Explain how to confirm success.

    ## Troubleshooting

    ### <Problem>

    Cause and solution.

    ## Related

    - [Reference](../reference/example.md)
    - [Explanation](../explanation/example.md)

## Reference template

``` markdown
# <Component/API/Configuration> Reference

Brief description.

## <Item>

Description.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|

### Returns

Description.

### Errors

- Error 1
- Error 2

### Example

```text
...
```


    ## Explanation template

    ```markdown
    # <Topic>

    ## Overview

    Explain the main idea.

    ## Context

    Explain the background.

    ## How it works

    Explain the system conceptually.

    ## Design decisions

    Explain important choices.

    ## Alternatives

    Discuss relevant alternatives.

    ## Trade-offs

    Explain advantages and disadvantages.

    ## Limitations

    Explain important limitations.

    ## Related

    - [Tutorial](../tutorials/example.md)
    - [How-to](../how-to/example.md)
    - [Reference](../reference/example.md)

------------------------------------------------------------------------

# 34. The Core Mental Model

When writing documentation, think in four verbs:

``` text
TUTORIAL
→ LEARN

HOW-TO
→ DO

REFERENCE
→ LOOK UP

EXPLANATION
→ UNDERSTAND
```

If you remember only one thing from this guide, remember this:

> Do not ask "What should I put in the documentation?"
>
> Ask "What does the reader need to do, learn, look up, or understand?"

That question usually tells you both **what to write** and **where to
put it**.

------------------------------------------------------------------------

# 35. Final Quality Standard

Good documentation should allow a reader to:

``` text
Start
  ↓
Learn
  ↓
Perform tasks
  ↓
Look up details
  ↓
Understand the system
  ↓
Work independently
```

The Divio system is not a formatting rule. It is a way to match
documentation with the reader's situation.

Keep the four purposes distinct:

``` text
Tutorial     = learning by doing
How-to       = solving a specific problem
Reference    = accurate technical description
Explanation  = understanding context and reasons
```

When a page starts doing another job, move that material to the
appropriate documentation type and link to it.

That separation is the foundation of documentation that is easier to
write, easier to navigate, easier to test, and easier to maintain.

------------------------------------------------------------------------

## Sources

This guide is based primarily on the official Divio Documentation
System:

-   Divio Documentation System ---
    https://docs.divio.com/documentation-system/
-   Introduction ---
    https://docs.divio.com/documentation-system/introduction/
-   Tutorials --- https://docs.divio.com/documentation-system/tutorials/
-   How-to Guides ---
    https://docs.divio.com/documentation-system/how-to-guides/
-   Reference Guides ---
    https://docs.divio.com/documentation-system/reference/
-   Explanation ---
    https://docs.divio.com/documentation-system/explanation/
-   About the Structure ---
    https://docs.divio.com/documentation-system/structure/

The examples and templates in this guide are original practical
adaptations of the system rather than copied passages.
