import nock from 'nock'
import Env from '@ioc:Adonis/Core/Env'

const JIRA_API_REST_URL = Env.get('JIRA_API_REST_URL')

export function mockPostIssue() {
  return nock(JIRA_API_REST_URL)
    .post('/issue')
    .reply(201, (_, _requestBody) => {
      return {
        id: '49983',
        key: 'TEST-1',
        self: 'https://genfree.atlassian.net/rest/api/3/issue/49983',
      }
    })
}

export function mockUser(displayName: string) {
  return nock(JIRA_API_REST_URL)
    .get(`/user/search?query=${displayName.split(' ').join('&query=')}`)
    .reply(201, (_, _requestBody) => {
      return [
        {
          self: 'https://genfree.atlassian.net/rest/api/3/user?accountId=63e14473614cb4ba5301bb98',
          accountId: '63e14473614cb4ba5301bb98',
          accountType: 'atlassian',
          emailAddress: 'cdipaolo@gen-it.com.ar',
          avatarUrls: {
            '48x48':
              'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/63e14473614cb4ba5301bb98/6b53e17a-2b89-4df7-a413-0a168bc5d4d2/48',
            '24x24':
              'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/63e14473614cb4ba5301bb98/6b53e17a-2b89-4df7-a413-0a168bc5d4d2/24',
            '16x16':
              'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/63e14473614cb4ba5301bb98/6b53e17a-2b89-4df7-a413-0a168bc5d4d2/16',
            '32x32':
              'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/63e14473614cb4ba5301bb98/6b53e17a-2b89-4df7-a413-0a168bc5d4d2/32',
          },
          displayName: 'Camilo Di Paolo',
          active: true,
          timeZone: 'America/Argentina/Buenos_Aires',
          locale: 'es_ES',
        },
      ]
    })
}
