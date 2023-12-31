import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Adapter from 'App/Services/adapter.service'
import JiraService from 'App/Services/jira.service'
import MiroService from 'App/Services/miro.service'

export default class WebhookController {
  async jiraWebhook(ctx: HttpContextContract) {
    const body = ctx.request.body()
    console.log('Info del webhook de jira: ', body)
    return body
  }

  async miroWebhook(ctx: HttpContextContract) {
    const body = ctx.request.body()
	console.log(JSON.stringify(ctx.request.headers()))
    try {
      const adapter = new Adapter<MiroService, JiraService>(MiroService, JiraService)
      await adapter.connect(body)
    } catch (err) {
      console.error(err)
    }
    return body
  }
}
