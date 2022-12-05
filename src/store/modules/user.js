import { getToken, setToken, delToken } from '@/utils/storage'

export default {
  namespaced: true,
  state () {
    return {
      token: getToken()
    }
  },
  mutations: {
    setUserToken (state, payload) {
      state.token = payload
      setToken(payload)
    },
    logout (state) {
      state.token = null
      delToken()
    }
  }
}
