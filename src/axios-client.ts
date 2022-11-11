import { AxiosError } from 'axios'

export class AxiosClient {
  handleError(err: any) {
    if (err instanceof AxiosError) {
      console.error(`code: ${err.response?.status}, body: ${err.response?.data}`)
    } else {
      console.error('[non axios error]: ', err)
    }
  }
} 