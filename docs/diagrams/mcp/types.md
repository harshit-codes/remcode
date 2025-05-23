# types Entity Relationship Diagram

```mermaid
classDiagram
  class ParameterValidation {
    <<interface>>
    pattern: string
    minLength: number
    maxLength: number
    min: number
    max: number
  }
  class ParameterDefinition {
    <<interface>>
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    required: boolean
    description: string
    default: any
    enum: string[]
    validation: ParameterValidation
    sensitive: boolean
    properties: Record<string, any>
  }
  class AIGuidance {
    <<interface>>
    whenToUse: string
    scenarios: string[]
    dependencies: string[]
    suggestedFollowUp: string[]
  }
  class ResponseFormat {
    <<interface>>
    [key: string]: {
    type: string
    description: string
  }
  class EnhancedMCPTool {
    <<interface>>
    name: string
    description: string
    category: 'setup-configuration' | 'repository-management' | 'code-search-analysis' | 'processing-workflows' | 'ai-swe-assistance' | 'external-integrations'
    tags: string[]
    priority: 'critical' | 'high' | 'medium' | 'low'
    aiGuidance: AIGuidance
    parameters: Record<string, ParameterDefinition>
    responseFormat: ResponseFormat
    estimatedDuration: string
    rateLimit: string
  }

  %% Inheritance relationships

  %% Usage relationships

  %% Style and notes
  note "Generated from folder: types" as Note1
```
