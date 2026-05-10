const api = require('../../utils/api')

Page({
  data: {
    filters: null,
    restaurants: [],
    total: 0,
    loading: true,
  },

  onLoad(options) {
    if (options.params) {
      const params = JSON.parse(decodeURIComponent(options.params))
      this.setData({ filters: params })
      this.fetchRecommendations(params)
    }
  },

  onShow() {
    // 从详情页返回时刷新数据（评价数可能已更新）
    if (this.data.filters && this.data.restaurants.length > 0) {
      this.fetchRecommendations(this.data.filters)
    }
  },

  fetchRecommendations(params) {
    this.setData({ loading: true })
    api.post('/api/recommend/restaurants', {
      location: params.location,
      category: params.category,
      budget: params.budget,
      distance: params.distance,
      scene: params.scene,
    }).then(res => {
      this.setData({
        restaurants: res.list || [],
        total: res.total || 0,
        loading: false,
      })
      wx.stopPullDownRefresh()
    }).catch(err => {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
      wx.showToast({ title: '请求失败，请重试', icon: 'none' })
      console.error('fetchRecommendations error:', err)
    })
  },

  onPullDownRefresh() {
    if (this.data.filters) {
      this.fetchRecommendations(this.data.filters)
    }
  },

  onShareAppMessage() {
    return {
      title: '去哪吃 - 我找到了这些餐厅推荐',
      path: '/pages/index/index',
    }
  },
})
