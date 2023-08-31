import { AtLeast } from './generic.types'

export interface MiroIssueResponse {
  card: AtLeast<MiroIssueCard, 'id'>
  tags: MiroIssueTag[]
}

export interface MiroIssuePostPayload {
  card: Pick<MiroIssueCard, 'data' | 'id'>
  tags: {
    remove: Pick<MiroIssueTag, 'id'>
    attach: Pick<MiroIssueTag, 'id'>
  }
}

export interface MiroIssueCard {
  id: string
  type: 'card'
  data: Data
  style: Style
  links: Links
  createdAt: Date
  createdBy: EdBy
  modifiedAt: Date
  modifiedBy: EdBy
}

export interface MiroIssueTag {
  id: string
  type: 'tag'
  title: string
  links: Links
  fillColor: string
}

export interface EdBy {
  id: string
  type: string
}

export interface Data {
  title: string
  description: string
}

export interface Links {
  self: string
}

export interface Style {
  cardTheme: string
}

export interface MiroWebhookRequestBody {
  eventType: string
  event: MiroEvent
  eventTime: Date
  appId: number
  users: number[]
}

export interface MiroEvent {
  boardId: string
  item: MiroIssueCard
  type: string
}
