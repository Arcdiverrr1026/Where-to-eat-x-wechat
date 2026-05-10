const locationUtil = require('../../utils/location')

Page({
  data: {
    filters: null,
  },

  onFilterChange(e) {
    this.setData({ filters: e.detail })
  },

  onSearch() {
    const filters = this.data.filters
    if (!filters) {
      wx.showToast({ title: '请选择筛选条件', icon: 'none' })
      return
    }

    wx.showLoading({ title: '定位中...' })

    locationUtil.getLocation().then(loc => {
      wx.hideLoading()
      const params = encodeURIComponent(JSON.stringify({
        location: { lat: loc.latitude, lng: loc.longitude },
        category: filters.category,
        budget: filters.budget,
        distance: filters.distance,
        scene: filters.scene,
      }))
      wx.navigateTo({
        url: '/pages/recommendations/recommendations?params=' + params,
      })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '需要定位权限才能推荐', icon: 'none' })
    })
  },

  onShareAppMessage() {
    return {
      title: '去哪吃 - 高校餐厅避雷助手',
      path: '/pages/index/index',
    }
  },
})
