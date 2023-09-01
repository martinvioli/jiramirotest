import { test } from '@japa/runner'
import { mockPostIssue, mockUser } from '../mocks/jira.mock'
import JiraService from 'App/Services/jira.service'

test('from generic', async ({ assert }) => {
  const TASK_ID_JIRA = '10252'
  const PROJECT_ID = '10292'

  const jiraService = new JiraService()

  mockUser('Camilo Di Paolo')

  assert.deepEqual(
    await jiraService.fromGeneric({
      title: 'TEST',
      description: 'TEST DESC',
      status: 'DONE',
      assignee: 'Camilo Di Paolo',
    }),
    {
      fields: {
        assignee: {
          id: '63e14473614cb4ba5301bb98',
        },
        description: {
          content: [
            {
              content: [],
              type: 'paragraph',
            },
          ],
          type: 'doc',
          version: 1,
        },
        issuetype: {
          id: TASK_ID_JIRA,
        },
        project: {
          id: PROJECT_ID,
        },
        reporter: {
          id: '63e14473614cb4ba5301bb98',
        },
        summary: 'TEST',
      },
    }
  )
})

test('to generic', async ({ client, assert }) => {
  const jiraService = new JiraService()

  assert.deepEqual(
    jiraService.toGeneric({
      expand: 'renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations',
      id: '49941',
      self: 'https://genfree.atlassian.net/rest/api/3/issue/49941',
      key: 'PM-1',
      fields: {
        summary: 'prueba',
        description: {
          version: 1,
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'TRABAJANDO',
                },
              ],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'O NO?',
                },
              ],
            },
          ],
        },
        assignee: {
          self: 'https://genfree.atlassian.net/rest/api/3/user?accountId=63e14473614cb4ba5301bb98',
          accountId: '63e14473614cb4ba5301bb98',
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
          accountType: 'atlassian',
        },
        status: {
          self: 'https://genfree.atlassian.net/rest/api/3/status/10404',
          description: '',
          iconUrl: 'https://genfree.atlassian.net/',
          name: 'Tareas por hacer',
          id: '10404',
          statusCategory: {
            self: 'https://genfree.atlassian.net/rest/api/3/statuscategory/2',
            id: 2,
            key: 'new',
            colorName: 'blue-gray',
            name: 'Por hacer',
          },
        },
      },
    }),
    {
      title: 'prueba',
      assignee: 'Camilo Di Paolo',
      status: 'Tareas por hacer',
      description: 'TRABAJANDO\nO NO?',
    }
  )
})

test('push to jira', async ({ assert }) => {
  const jiraService = new JiraService()

  mockPostIssue()
  mockUser('Camilo Di Paolo')

  const res = await jiraService.push({
    title: 'TEST',
    description: 'TEST DESC',
    status: 'DONE',
    assignee: 'Camilo Di Paolo',
  })

  assert.deepEqual(res, {
    data: {
      id: '49983',
      key: 'TEST-1',
      self: 'https://genfree.atlassian.net/rest/api/3/issue/49983',
    },
    error: null,
  })
})
