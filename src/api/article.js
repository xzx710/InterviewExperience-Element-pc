import request from '@/utils/request'

export const getArticleList = data => {
  return request.get('/admin/interview/query', {
    params: data
  })
}
export const createArticle = data => {
  return request.post('/admin/interview/create', data)
}

export const removeArticle = id => {
  return request.delete('/admin/interview/remove', {
    data: {
      id
    }
  })
}

export const getArticleDetail = id => {
  return request.get('/admin/interview/show', {
    params: {
      id
    }
  })
}

export const updateArticle = data => {
  return request.put('/admin/interview/update', data)
}
