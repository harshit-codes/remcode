# manager.test.ts

**File Path:** `vectorizers/chunkers/manager.test.ts`

## Overview

A simple example class

## Dependencies

- `./manager`
- `somewhere`

## Classes

### `ExampleClass`

**Class Definition:**

```typescript
export class ExampleClass {
  private value: string;
  
  constructor(value: string) {
    this.value = value;
  }
  
  /**
   * Gets the value
   */
  getValue(): string {
    return this.value;
  }
  
  /**
   * Sets the value
   */
  setValue(newValue: string): void {
    this.value = newValue;
  }
}
```

**Methods:**

- `getValue()`
- `setValue()`

## Functions

### `doSomething()`

**Function Signature:**

```typescript
export function doSomething(input: string): string {
```

**Full Function:**

```typescript
export function doSomething(input: string): string {
  return 'Modified: ' + input;
}
```

