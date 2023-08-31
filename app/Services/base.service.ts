import { GenericIssue } from 'App/types/generic.types'

export default interface BaseServiceInterface<WebhookRequestBody, ServiceResponse> {
  fromGeneric(issue: GenericIssue): Promise<ServiceResponse>
  toGeneric(webhookRequestBody: WebhookRequestBody): Promise<GenericIssue>
}
