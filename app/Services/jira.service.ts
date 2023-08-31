import BaseServiceInterface from './base.service'
import Env from '@ioc:Adonis/Core/Env'
import {
  GenericToJiraStatus,
  IssueJiraPostPayload,
  type IssueJiraResponse,
} from 'App/types/jira.types'
import {
  AtLeast,
  GenericIssue,
  GenericIssueStatus,
  GenericIssueStatusOptions,
} from 'App/types/generic.types'
import ApiService from './api.service'
import { GenericIssueService } from 'App/types/services.types'

type IssueServiceOriginLabel = `${GenericIssueService}_ID:${string}`

export default class JiraService
  implements Pick<BaseServiceInterface<any, IssueJiraResponse>, 'fromGeneric'>
{
  private JIRA_API_REST_URL = Env.get('JIRA_API_REST_URL')
  private JIRA_USER = Env.get('JIRA_USER')
  private JIRA_TOKEN = Env.get('JIRA_TOKEN')
  private JIRA_PROJECT_ID = Env.get('JIRA_PROJECT_ID')

  private ApiService = new ApiService(
    this.JIRA_API_REST_URL,
    `Basic ${Buffer.from(this.JIRA_USER + ':' + this.JIRA_TOKEN).toString('base64')}`
  )

  async findAccountIdByEmail(email: string): Promise<string> {
    const response = email
      ? await this.ApiService.fetch<[{ accountId: string }]>('GET', `/user/search?query=${email}`)
      : null
    return response?.data?.at(0)?.accountId ?? ''
  }

  generateOriginLabel(origin: GenericIssueService, id: string): IssueServiceOriginLabel {
    return `${origin}_ID:${id}`
  }

  async findIssueIdByLabel(issueServiceOrginLabel: IssueServiceOriginLabel): Promise<string> {
    const response = await this.ApiService.fetch<{ issues: IssueJiraResponse[] }>(
      'GET',
      `/search?jql=labels=${issueServiceOrginLabel}`
    )
    return response.data?.issues?.at(0)?.id ?? ''
  }

  async parseFromGeneric(
    genericIssue: GenericIssue
  ): Promise<{ id?: string; payload: AtLeast<IssueJiraPostPayload, 'fields' | 'update'> }> {
    const COMMON_ISSUE_TYPE_ID = '10021'
    const assigneeId = await this.findAccountIdByEmail(genericIssue.assigneeEmail)
    const issueOriginIdLabel = this.generateOriginLabel(genericIssue.origin, genericIssue.id)

    let response: { id?: string; payload: AtLeast<IssueJiraPostPayload, 'fields' | 'update'> } = {
      payload: {
        fields: {
          assignee: {
            id: assigneeId,
          },
          description: genericIssue.description,
          issuetype: {
            id: COMMON_ISSUE_TYPE_ID,
          },
          project: {
            id: this.JIRA_PROJECT_ID,
          },
          summary: genericIssue.title,
          duedate: '3000-01-01',
        },
        update: {
          labels: [
            {
              add: issueOriginIdLabel,
            },
          ],
        },
      },
    }

    const issueId = await this.findIssueIdByLabel(issueOriginIdLabel)
    if (issueId) {
      response.id = issueId
      const { error, transitionId } = await this.translateStatus(issueId, genericIssue.status)
      response.payload.transition = { id: transitionId }
      if (error) response.payload.fields.summary = `${error} ${response.payload.fields.summary}`
    }

    return response
  }

  async translateStatus(
    issueId: string,
    statusName: GenericIssueStatus
  ): Promise<{ error: string | false; transitionId: string }> {
    const response = await this.ApiService.fetch<{
      transitions: { id: string; name: string; to: { name: string } }[]
    }>('GET', `/issue/${issueId}/transitions`)
    function getTransitionId(genericIssueStatus: GenericIssueStatus) {
      return response?.data?.transitions?.find(
        (transition) =>
          transition.to.name.toUpperCase() ===
          GenericToJiraStatus[genericIssueStatus]?.toUpperCase()
      )?.id!
    }
    const transitionId = getTransitionId(statusName)
    const defaultTransitionId = getTransitionId(GenericIssueStatusOptions['2'])
    const error = !transitionId && '[⚠️ ERROR JIRAMIRO]'
    return { error, transitionId: transitionId ?? defaultTransitionId }
  }

  async fromGeneric(genericIssue: GenericIssue) {
    const jiraIssuePayload = await this.parseFromGeneric(genericIssue)
    const method = jiraIssuePayload?.id ? 'PUT' : 'POST'
    let path = '/issue'
    if (method === 'PUT') path += `/${jiraIssuePayload.id}`
    const response = await this.ApiService.fetch<IssueJiraResponse>(
      method,
      path,
      jiraIssuePayload.payload
    )
    if (jiraIssuePayload.payload?.transition) {
      const transitionsPath = path + '/transitions'
      await this.ApiService.fetch<IssueJiraResponse>(
        'POST',
        transitionsPath,
        (({ transition }: IssueJiraPostPayload) => ({ transition }))(
          jiraIssuePayload.payload as IssueJiraPostPayload
        )
      )
    }
    return response?.data!
  }

  /*   async toGeneric(issue: IssueJiraResponse) {
    return {
      title: issue.fields.summary,
      description: issue.fields.description.content
        .map((content) => content.content.map((text) => text?.text))
        .flat()
        .filter((text) => text)
        .join('\n'),
      assignee: issue.fields.assignee ? issue.fields.assignee.displayName : 'None',
      status: issue.fields.status.name as GenericIssueStatus,
    }
  } */
}
