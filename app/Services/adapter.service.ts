import BaseServiceInterface from './base.service'
export type Newable<T> = new (...args: any[]) => T

export default class Adapter<
  InputService extends Pick<BaseServiceInterface<any, any>, 'toGeneric'>,
  OutputService extends Pick<BaseServiceInterface<any, any>, 'fromGeneric'>,
> {
  private inputService: InputService
  private outputService: OutputService

  constructor(inputService: Newable<InputService>, outputService: Newable<OutputService>) {
    this.inputService = new inputService()
    this.outputService = new outputService()
  }

  async connect(body) {
    const generic = await this.inputService.toGeneric(body)
    await this.outputService.fromGeneric(generic)
  }
}
