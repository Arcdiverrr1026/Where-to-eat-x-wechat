const api = require('../../utils/api')
const reviewStore = require('../../utils/reviewStore')

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
    // 从详情页返回时，用本地缓存更新评价数（不发 API 请求）
    if (this.data.restaurants.length > 0) {
      const list = reviewStore.mergeReviewCounts(this.data.restaurants)
      this.setData({ restaurants: list })
    }
  },

  fetchRecommendations(params) {
    this.setData({ loading: true })
    api.post('/api/recommend/restaurants', {
      location: params.location,
      category: params.category,
      budget: params.budget,
      budget_min: params.budget_min,
      budget_max: params.budget_max,
      distance: params.distance,
      scene: params.scene,
    }).then(res => {
      const rawList = (res.list || []).map(r => {
        r.tags = r.tags || []
        r.risk_flags = r.risk_flags || []
        return r
      })
      // 缓存 API 返回的评价数
      reviewStore.updateCountCache(rawList)
      const list = reviewStore.mergeReviewCounts(rawList)
      this.setData({
        restaurants: list,
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
      title: 'Where to Eat - 餐厅推荐',
      path: '/pages/index/index',
    }
  },
})
