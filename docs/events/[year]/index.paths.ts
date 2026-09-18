import { getEventYears } from '../../.vitepress/schedule'

export default {
  async paths() {
    return getEventYears().map((year) => ({
      params: { year: String(year) }
    }))
  }
}
