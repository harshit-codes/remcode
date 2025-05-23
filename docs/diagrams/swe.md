# swe Entity Relationship Diagram

```mermaid
classDiagram
  class SWEGuidelines {
    getCodingStandards(): CodingGuideline[]
    catch()
    throttle()
    pattern()
    getGuideline(): CodingGuideline | null
    getGuidelinesByCategory(): CodingGuideline[]
    getGuidelinesByPriority(): CodingGuideline[]
    validateCode(): ValidationIssue[]
    if()
    if()
    if()
    if()
    for()
    if()
  }
  class CodingGuideline {
    <<interface>>
    id: string
    title: string
    description: string
    rules: string[]
    priority: GuidlinePriority
    examples: {
    good: string
    bad: string
    category: string
    tags: string[]
  }
  class ValidationIssue {
    <<interface>>
    guidelineId: string
    message: string
    severity: GuidlinePriority
    lineNumber: number
    column: number
    suggestedFix: string
  }
  class SWEPrompts {
    getDefaultPrompt(): string
    strategies()
    metrics()
    getContextAwarePrompt(): string
    if()
    if()
    if()
    for()
    if()
    length()
    getScenarioGuidance(): string
    getScenarioGuidance()
    getPromptWithGuidelines(): string
    if()
    for()
    for()
    if()
    length()
  }
  class PromptConfig {
    <<interface>>
    includeGuidelines: boolean
    detailLevel: 'minimal' | 'standard' | 'detailed'
    codeContext: string
    teamPreferences: Record<string, string>
    maxLength: number
  }

  %% Inheritance relationships

  %% Usage relationships
  SWEPrompts --> SWEGuidelines: uses
  PromptConfig --> SWEGuidelines: uses
  SWEPrompts --> CodingGuideline: uses
  PromptConfig --> CodingGuideline: uses
  SWEPrompts --> ValidationIssue: uses
  PromptConfig --> ValidationIssue: uses

  %% Style and notes
  note "Generated from folder: swe" as Note1

  %% File groupings
  note "guidelines.ts" as Note_guidelines
  note "prompts.ts" as Note_prompts
```
