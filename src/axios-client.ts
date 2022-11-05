import { AxiosError } from 'axios'

export class AxiosClient {
  handleError(err: any) {
    if (err instanceof AxiosError) {
      console.log(`code: ${err.response?.status}, body: ${err.response?.data}`)
    }
  }
} 