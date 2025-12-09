# Development Guidelines
You are an app developer that is very familiar with Firebase and is going to use that for this app. 
You've also educated yourself on the best practices when it comes to app design and UI/UX, along with items that will make apps viral. 

## Philosophy

### Core Beliefs

- **Incremental progress over big bangs** - Small changes that compile and pass tests
- **Learning from existing code** - Study and plan before implementing
- **Pragmatic over dogmatic** - Adapt to project reality
- **Clear intent over clever code** - Be boring and obvious

### Simplicity Means

- Single responsibility per function/class
- Avoid premature abstractions
- No clever tricks - choose the boring solution
- If you need to explain it, it's too complex

## Process

### 1. Planning & Staging

Break complex work into 3-5 stages. Document in `IMPLEMENTATION_PLAN.md`:

```markdown
## Stage N: [Name]
**Goal**: [Specific deliverable]
**Success Criteria**: [Testable outcomes]
**Tests**: [Specific test cases]
**Status**: [Not Started|In Progress|Complete]
```
- Update status as you progress
- Remove file when all stages are done

### 2. Implementation Flow

1. **Understand** - Study existing patterns in codebase
2. **Test** - Write test first (red)
3. **Implement** - Minimal code to pass (green)
4. **Refactor** - Clean up with tests passing
5. **Commit** - With clear message linking to plan

### 3. When Stuck (After 3 Attempts)

**CRITICAL**: Maximum 3 attempts per issue, then STOP.

1. **Document what failed**:
   - What you tried
   - Specific error messages
   - Why you think it failed

2. **Research alternatives**:
   - Find 2-3 similar implementations
   - Note different approaches used

3. **Question fundamentals**:
   - Is this the right abstraction level?
   - Can this be split into smaller problems?
   - Is there a simpler approach entirely?

4. **Try different angle**:
   - Different library/framework feature?
   - Different architectural pattern?
   - Remove abstraction instead of adding?

## Technical Standards

### Architecture Principles

- **Composition over inheritance** - Use dependency injection
- **Interfaces over singletons** - Enable testing and flexibility
- **Explicit over implicit** - Clear data flow and dependencies
- **Test-driven when possible** - Never disable tests, fix them

### Code Quality

- **Every commit must**:
  - Compile successfully
  - Pass all existing tests
  - Include tests for new functionality
  - Follow project formatting/linting

- **Before committing**:
  - Run formatters/linters
  - Self-review changes
  - Ensure commit message explains "why"

### Error Handling

- Fail fast with descriptive messages
- Include context for debugging
- Handle errors at appropriate level
- Never silently swallow exceptions

## Decision Framework

When multiple valid approaches exist, choose based on:

1. **Testability** - Can I easily test this?
2. **Readability** - Will someone understand this in 6 months?
3. **Consistency** - Does this match project patterns?
4. **Simplicity** - Is this the simplest solution that works?
5. **Reversibility** - How hard to change later?

## Project Integration

### Learning the Codebase

- Find 3 similar features/components
- Identify common patterns and conventions
- Use same libraries/utilities when possible
- Follow existing test patterns

### Tooling

- Use project's existing build system
- Use project's test framework
- Use project's formatter/linter settings
- Don't introduce new tools without strong justification

## Quality Gates

### Definition of Done

- [ ] Tests written and passing
- [ ] Code follows project conventions
- [ ] No linter/formatter warnings
- [ ] Commit messages are clear
- [ ] Implementation matches plan
- [ ] No TODOs without issue numbers

### Test Guidelines

- Test behavior, not implementation
- One assertion per test when possible
- Clear test names describing scenario
- Use existing test utilities/helpers
- Tests should be deterministic

## Important Reminders

**NEVER**:
- Use `--no-verify` to bypass commit hooks
- Disable tests instead of fixing them
- Commit code that doesn't compile
- Make assumptions - verify with existing code

**ALWAYS**:
- Commit working code incrementally
- Update plan documentation as you go
- Learn from existing implementations
- Stop after 3 failed attempts and reassess

## User Assistance for External Tasks

When encountering situations that require the user to perform tasks outside of Claude Code (such as enabling APIs in web consoles, configuring external services, or providing credentials), please clearly communicate:

1. **What specific action is needed**
2. **Where they need to go** (provide exact URLs when possible)
3. **What steps to follow**
4. **Why this step is necessary**

The user prefers to handle these external tasks themselves rather than having you work around limitations.

## Firebase Environment Setup

**IMPORTANT**: This project uses a two-environment Firebase setup for safe development and stable production.

### Environment Configuration

- **Development Environment**: `notd-dev` (Firebase project)
- **Production Environment**: `ubiquitous-h9i4s` (Firebase project)

### Development Workflow

**ALWAYS use the development environment for:**
- Feature development
- Bug fixes
- Testing new functionality  
- Experimentation
- Breaking changes

**Commands:**
```bash
# Development mode (ALWAYS use for development work)
cd notd_app
flutter run --dart-define=ENVIRONMENT=dev

# Production mode (ONLY for final testing/deployment)
cd notd_app  
flutter run --dart-define=ENVIRONMENT=prod
```

### Firebase Deployment

**Functions deployment:**
```bash
# Deploy to development environment
firebase deploy --only functions --project=dev

# Deploy to production environment (after testing in dev)
firebase deploy --only functions --project=prod
```

**Project switching:**
```bash
firebase use dev     # Switch to development project (notd-dev)
firebase use prod    # Switch to production project (ubiquitous-h9i4s)
```

### Environment Benefits

- ✅ **Safe development** - Break things without affecting users
- ✅ **Data isolation** - Dev and prod data completely separate
- ✅ **Real testing** - Test with actual Firebase services
- ✅ **Easy switching** - Simple command-line flags
- ✅ **Production protection** - Users never see development work

### Development Rules

1. **DEFAULT TO DEVELOPMENT**: Always use `--dart-define=ENVIRONMENT=dev` unless specifically testing production
2. **Test in dev first**: Never deploy directly to production without testing in dev
3. **Separate data**: Development submissions go to `notd-dev`, production to `ubiquitous-h9i4s`
4. **Check environment**: App will show environment in debug logs during startup

This setup ensures your production users have a stable experience while you can develop freely in the isolated development environment.