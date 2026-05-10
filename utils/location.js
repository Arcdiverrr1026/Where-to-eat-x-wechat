const app = getApp()

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// 默认位置（上海人民广场附近）
const DEFAULT_LOCATION = {
  latitude: 31.2304,
  longitude: 121.4737,
}

function getLocation() {
  return new Promise((resolve, reject) => {
    const cached = app.globalData.location
    const timestamp = app.globalData.locationTimestamp

    if (cached && Date.now() - timestamp < CACHE_DURATION) {
      resolve(cached)
      return
    }

    wx.getLocation({
      type: 'gcj02',
      success(res) {
        const loc = {
          latitude: res.latitude,
          longitude: res.longitude,
        }
        app.globalData.location = loc
        app.globalData.locationTimestamp = Date.now()
        resolve(loc)
      },
      fail() {
        // 定位失败时使用默认位置，确保功能可用
        wx.showToast({ title: '定位失败，使用默认位置', icon: 'none', duration: 2000 })
        app.globalData.location = DEFAULT_LOCATION
        app.globalData.locationTimestamp = Date.now()
        resolve(DEFAULT_LOCATION)
      },
    })
  })
}

module.exports = {
  getLocation,
}
