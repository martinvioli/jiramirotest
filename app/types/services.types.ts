export const GenericIssueServiceOptions = ['JIRA', 'MIRO'] as const

export type GenericIssueService = (typeof GenericIssueServiceOptions)[number]
