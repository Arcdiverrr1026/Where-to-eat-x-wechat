const config = require('./config')

function request(method, path, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.API_BASE + path,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject({
            statusCode: res.statusCode,
            data: res.data,
          })
        }
      },
      fail(err) {
        reject(err)
      },
    })
  })
}

module.exports = {
  get(path) {
    return request('GET', path)
  },
  post(path, data) {
    return request('POST', path, data)
  },
  patch(path, data) {
    return request('PATCH', path, data)
  },
}
