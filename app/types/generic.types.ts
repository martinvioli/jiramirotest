import { GenericIssueService } from './services.types'

export type GenericIssue = {
  title: string
  description: string
  assigneeEmail: string
  status: GenericIssueStatus
  origin: GenericIssueService
  id: string
}

export const GenericIssueStatusOptions = [
  'TO DO',
  'IN PROGRESS',
  'BLOCKED',
  'READY FOR QA',
  'IN REVIEW',
  'READY FOR PROD',
  'DONE',
] as const

export type GenericIssueStatus = (typeof GenericIssueStatusOptions)[number]

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>
