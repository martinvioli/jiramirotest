import {
  GenericIssue,
  GenericIssueStatus,
  GenericIssueStatusOptions,
} from 'App/types/generic.types'
import BaseServiceInterface from './base.service'
import {
  MiroIssueCard,
  MiroIssueResponse,
  MiroIssueTag,
  MiroWebhookRequestBody,
} from 'App/types/miro.types'
import Env from '@ioc:Adonis/Core/Env'
import fetch from 'cross-fetch'
import ApiService from './api.service'

export default class MiroService
  implements Pick<BaseServiceInterface<MiroWebhookRequestBody, any>, 'toGeneric'>
{
  private MIRO_API_REST_URL = Env.get('MIRO_API_REST_URL')
  private MIRO_TOKEN = Env.get('MIRO_TOKEN')

  private ApiService = new ApiService(
    Env.get('MIRO_API_REST_URL'),
    `Bearer ${Env.get('MIRO_TOKEN')}`
  )

  async toGeneric(webhookRequestBody: MiroWebhookRequestBody): Promise<GenericIssue> {
    const {
      event: {
        boardId,
        item: { id: itemId, type: itemType },
      },
    } = webhookRequestBody
    this.filterHookItemType(itemType)
    const issueTags = await this.getIssueTags(boardId, itemId)
    this.filterHookIssueOwner(issueTags)
    const issueCard = await this.getIssueCard(boardId, itemId)
    const miroIssue: MiroIssueResponse = { card: issueCard, tags: issueTags }
    const genericIssue = this.parseToGeneric(miroIssue)
    return genericIssue
  }

  private parseToGeneric(issue: MiroIssueResponse): GenericIssue {
    const { description, assigneeEmail } = this.deregexifyDescription(issue.card?.data?.description)
    return {
      title: issue.card?.data?.title ?? '',
      description,
      status:
        (issue.tags
          .find((tag) =>
            GenericIssueStatusOptions.some((status) => status === tag.title.toUpperCase())
          )
          ?.title?.toUpperCase() as Uppercase<GenericIssueStatus>) ??
        GenericIssueStatusOptions['2'],
      assigneeEmail,
      origin: 'MIRO',
      id: issue.card.id,
    }
  }

  private deregexifyDescription(description: string = ''): {
    description: string
    assigneeEmail: string
  } {
    const ASSIGNEE_REGEX = /%%?(.*?)%?%/g
    const assigneeMail = description?.match(ASSIGNEE_REGEX)?.at(0) ?? ''
    return {
      description: description?.replace(assigneeMail ?? '', ''),
      assigneeEmail: assigneeMail?.replaceAll('%', ''),
    }
  }

  private filterHookItemType(itemType: 'card') {
    if (itemType !== 'card') throw new Error('El item no es un issue')
  }

  private async getIssueTags(boardId: string, itemId: string): Promise<MiroIssueTag[]> {
    const response = await this.ApiService.fetch<{ tags: MiroIssueTag[] }>(
      'GET',
      `/${boardId}/items/${itemId}/tags`
    )
    return response.data?.tags ?? []
  }

  private filterHookIssueOwner(issueTags: MiroIssueTag[]) {
    if (!issueTags.some((tag) => tag.title === 'GEN-IT')) {
      throw new Error('El issue no pertenece a GEN-IT')
    }
  }

  private async getIssueCard(boardId: string, itemId: string): Promise<MiroIssueCard> {
    try {
      const res = await fetch(`${this.MIRO_API_REST_URL}/${boardId}/cards/${itemId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.MIRO_TOKEN}`,
          Accept: 'application/json',
        },
      })

      const data = await res.json()

      if (Array.isArray(data.errorMessages)) throw new Error(data.errorMessages[0])
      if (data.error) throw new Error(data.error)
      if (res.status >= 400) throw new Error('Ocurrio un error con la API de Miro')

      return data
    } catch (err) {
      throw new Error(err)
    }
  }
}
