import request from '@/utils/request'

export const login = ({ username, password }) => {
  return request.post('/auth/login', {
    username,
    password
  })
}

export const getUser = () => {
  return request.get('/auth/currentUser')
}
