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
    switch()
    testing()
    complexity()
    requirements()
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
  class SWEScenarios {
    getAvailableScenarios(): Scenario[]
    detectScenario(): Scenario | null
    for()
    if()
    detectScenarioWithConfidence(): ScenarioDetectionResult | null
    for()
    for()
    if()
    if()
    for()
    if()
    if()
    if()
    if()
    if()
    getScenarioById(): Scenario | null
    getScenariosByDifficulty(): Scenario[]
    getScenariosByTags(): Scenario[]
  }
  class Scenario {
    <<interface>>
    id: string
    name: string
    description: string
    triggers: string[]
    negativePatterns: string[]
    tools: string[]
    difficulty: DifficultyLevel
    promptType: PromptType
    estimatedTime: string
    requiredSkills: string[]
    examples: string[]
    tags: string[]
  }
  class ScenarioDetectionResult {
    <<interface>>
    scenario: Scenario
    confidence: number; // 0-1 confidence score
    matchedTriggers: string[]
    matchedNegatives: string[]
  }

  %% Inheritance relationships

  %% Usage relationships
  SWEPrompts --> SWEGuidelines: uses
  PromptConfig --> SWEGuidelines: uses
  SWEPrompts --> CodingGuideline: uses
  PromptConfig --> CodingGuideline: uses
  SWEPrompts --> ValidationIssue: uses
  PromptConfig --> ValidationIssue: uses
  SWEScenarios --> SWEPrompts: uses
  Scenario --> SWEPrompts: uses
  ScenarioDetectionResult --> SWEPrompts: uses
  SWEScenarios --> PromptConfig: uses
  Scenario --> PromptConfig: uses
  ScenarioDetectionResult --> PromptConfig: uses

  %% Style and notes
  note "Generated from folder: swe" as Note1

  %% File groupings
  note "guidelines.ts" as Note_guidelines
  note "prompts.ts" as Note_prompts
  note "scenarios.ts" as Note_scenarios
```
