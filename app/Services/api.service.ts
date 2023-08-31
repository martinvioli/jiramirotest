export type fetchApiResponse<RESPONSE> = Promise<
  { data: null; error: typeof Error } | { data: RESPONSE; error: null }
>

export default class ApiService {
  private baseUrl: string
  private authorization: string

  constructor(baseUrl: string, authorization: string) {
    this.baseUrl = baseUrl
    this.authorization = authorization
  }

  public async fetch<RESPONSE>(
    method: 'GET' | 'PUT' | 'POST',
    path: string,
    body?: any
  ): fetchApiResponse<RESPONSE> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          'Authorization': this.authorization,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        method,
      })

      const data = await res.json()

      if (Array.isArray(data.errorMessages)) throw new Error(data.errorMessages[0])
      if (data.error) throw new Error(data.error)
      if (res.status >= 400) throw new Error('Ocurrio un error con la API')

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }
}
