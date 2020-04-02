import request from '@/utils/request2'

export function queryData(urlApi, data, method) {
  return request({
    url: urlApi,
    method: method,
    data: data
  })
}

export function loginBy(data) {
  return request({
    url: 'client/login',
    method: 'post',
    data: data
  })
}