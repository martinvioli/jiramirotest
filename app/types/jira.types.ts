export interface IssueJiraResponse {
  expand: string
  id: string
  self: string
  key: string
  fields: Fields
  transitions: Transition[]
}

export interface JiraUser {
  self: string
  accountId: string
  accountType: string
  emailAddress: string
  avatarUrls: AvatarUrls
  displayName: string
  active: boolean
  timeZone: string
  locale: string
}

export interface IssueJiraPostPayload {
  fields: {
    summary: string
    description: string | Description
    assignee: {
      id: string
    }
    issuetype: {
      id: string
    }
    project: {
      id: string
    }
    duedate: string
  }
  update: {
    labels: UpdateLabels[]
  }
  transition: { id: string }
}

type UpdateLabels = { add: string } | { remove: string }

interface Fields {
  summary: string
  description: Description
  assignee: Assignee
  status: Status
}

interface Assignee {
  self: string
  accountId: string
  emailAddress: string
  avatarUrls: AvatarUrls
  displayName: string
  active: boolean
  timeZone: string
  accountType: string
}

interface AvatarUrls {
  '48x48': string
  '24x24': string
  '16x16': string
  '32x32': string
}

interface Description {
  version: number
  type: string
  content: DescriptionContent[]
}

interface DescriptionContent {
  type: string
  content: ContentContent[]
  attrs?: PurpleAttrs
}

interface PurpleAttrs {
  layout: string
}

interface ContentContent {
  type: string
  text?: string
  attrs?: FluffyAttrs
}

interface FluffyAttrs {
  id: string
  type: string
  collection: string
  width: number
  height: number
}

interface Status {
  self: string
  description: string
  iconUrl: string
  name: string
  id: string
  statusCategory: StatusCategory
}

interface StatusCategory {
  self: string
  id: number
  key: string
  colorName: string
  name: string
}

export enum GenericToJiraStatus {
  'TO DO' = 'Tareas por haacer',
  'IN PROGRESS' = 'En progreso',
  'BLOCKED' = 'Bloqueada',
  'READY FOR QA' = 'Ready for QA',
  'IN REVIEW' = 'In Review',
  'READY FOR PROD' = 'Ready For Prod',
  'DONE' = 'Finished',
}

export interface Transition {
  id: string
  name: string
  to: Status
  hasScreen: boolean
  isGlobal: boolean
  isInitial: boolean
  isAvailable: boolean
  isConditional: boolean
  isLooped: boolean
}
