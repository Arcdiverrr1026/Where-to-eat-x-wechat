App({
  globalData: {
    location: null,
    locationTimestamp: 0,
  },

  onLaunch() {
    // 版本更新时清除旧缓存
    const CACHE_VERSION = 'v2'
    try {
      if (wx.getStorageSync('cache_version') !== CACHE_VERSION) {
        wx.removeStorageSync('review_count_cache')
        wx.removeStorageSync('user_reviews')
        wx.setStorageSync('cache_version', CACHE_VERSION)
      }
    } catch (e) {}
  },
})
