import request from '@/utils/request2'

export function queryData(urlApi, data, method) {
  return request({
    url: urlApi,
    method: method,
    data: data
  })
}
