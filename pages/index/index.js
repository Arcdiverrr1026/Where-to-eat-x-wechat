const locationUtil = require('../../utils/location')

Page({
  data: {
    filters: null,
  },

  onShow() {
    // 预获取定位，点击推荐时可直接使用
    locationUtil.getLocation().catch(() => {})
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

    if (filters.budget_min != null && filters.budget_max != null && filters.budget_min > filters.budget_max) {
      wx.showToast({ title: '最低预算不能大于最高预算', icon: 'none' })
      return
    }

    wx.showLoading({ title: '定位中...' })

    locationUtil.getLocation().then(loc => {
      wx.hideLoading()
      const params = encodeURIComponent(JSON.stringify({
        location: { lat: loc.latitude, lng: loc.longitude },
        category: filters.category,
        budget: filters.budget,
        budget_min: filters.budget_min,
        budget_max: filters.budget_max,
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
      title: 'Where to Eat - 高校餐厅避雷助手',
      path: '/pages/index/index',
    }
  },
})
