# notifications Entity Relationship Diagram

```mermaid
classDiagram
  class NotificationService {
    config: NotificationConfig
    sendNotification(): Promise<
    if()
    catch()
    String()
    if()
    catch()
    String()
    if()
    catch()
    String()
    sendSlackNotification(): Promise<void>
    if()
    Error()
    fetch()
    if()
    Error()
    notification()
    sendEmailNotification(): Promise<void>
    Promise()
    createGitHubIssue(): Promise<void>
    Promise()
    getSlackColor(): string
    switch()
    getSlackEmoji(): string
    switch()
    createWorkflowNotification(): NotificationPayload
    if()
    createHealthNotification(): NotificationPayload
    if()
  }
  class NotificationConfig {
    <<interface>>
    slack: {
    webhook: string
    channel: string
    username: string
    email: {
    enabled: boolean
    recipients: string[]
    smtpConfig: {
    host: string
    port: number
    username: string
    password: string
    github: {
    createIssue: boolean
    assignees: string[]
    labels: string[]
  }
  class NotificationPayload {
    <<interface>>
    type: 'success' | 'failure' | 'warning' | 'info'
    title: string
    message: string
    repository: string
    runId: number
    url: string
    metadata: Record<string, any>
  }

  %% Inheritance relationships

  %% Usage relationships

  %% Style and notes
  note "Generated from folder: notifications" as Note1
```
