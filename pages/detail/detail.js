const api = require('../../utils/api')

Page({
  data: {
    restaurant: null,
    loading: true,
    markers: [],
    showReviewModal: false,
    reviewRating: 5,
    reviewContent: '',
    submitting: false,
  },

  onLoad(options) {
    if (options.id) {
      const lat = options.lat ? parseFloat(options.lat) : null
      const lng = options.lng ? parseFloat(options.lng) : null
      this.fetchDetail(options.id, lat, lng)
    }
  },

  fetchDetail(id, lat, lng) {
    this.setData({ loading: true })
    api.get('/api/restaurants/' + id).then(res => {
      // 使用传入的坐标（详情 API 不返回经纬度）
      if (lat && lng) {
        res.lat = lat
        res.lng = lng
      }
      const markers = []
      if (res.lat && res.lng) {
        markers.push({
          id: 0,
          latitude: res.lat,
          longitude: res.lng,
          callout: {
            content: res.name,
            display: 'ALWAYS',
            borderRadius: 8,
            padding: 8,
          },
        })
      }
      this.setData({
        restaurant: res,
        markers: markers,
        loading: false,
      })
      wx.setNavigationBarTitle({ title: res.name })
    }).catch(err => {
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
      console.error('fetchDetail error:', err)
    })
  },

  onNavigate() {
    const r = this.data.restaurant
    if (r && r.lat && r.lng) {
      wx.openLocation({
        latitude: r.lat,
        longitude: r.lng,
        name: r.name,
        address: r.address,
      })
    }
  },

  onWriteReview() {
    this.setData({ showReviewModal: true, reviewRating: 5, reviewContent: '' })
  },

  onCloseModal() {
    this.setData({ showReviewModal: false })
  },

  onModalContentTap() {
    // 阻止事件冒泡，防止点击内容区关闭弹窗
  },

  onRatingTap(e) {
    this.setData({ reviewRating: e.currentTarget.dataset.rating })
  },

  onReviewInput(e) {
    this.setData({ reviewContent: e.detail.value })
  },

  onSubmitReview() {
    const { reviewRating, reviewContent, restaurant, submitting } = this.data
    if (submitting) return

    if (reviewContent.length < 2) {
      wx.showToast({ title: '评价至少2个字', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    api.post('/api/reviews/feedback', {
      restaurant_id: restaurant.restaurant_id,
      rating: reviewRating,
      content: reviewContent,
    }).then(() => {
      // 立即将用户评价添加到列表顶部
      const newReview = {
        rating: reviewRating,
        content: reviewContent,
        created_at: '刚刚',
      }
      const reviews = [newReview].concat(restaurant.reviews || [])
      this.setData({
        submitting: false,
        showReviewModal: false,
        'restaurant.reviews': reviews,
        'restaurant.review_count': (restaurant.review_count || 0) + 1,
      })
      wx.showToast({ title: '评价成功', icon: 'success' })
      // 后台刷新详情数据
      this.fetchDetail(restaurant.restaurant_id)
    }).catch(err => {
      this.setData({ submitting: false })
      if (err.statusCode === 429) {
        wx.showToast({ title: '评价太频繁，请稍后再试', icon: 'none' })
      } else {
        wx.showToast({ title: '提交失败，请重试', icon: 'none' })
      }
      console.error('submitReview error:', err)
    })
  },

  onShareAppMessage() {
    const r = this.data.restaurant
    return {
      title: r ? '去哪吃 - ' + r.name : '去哪吃 - 餐厅推荐',
      path: '/pages/detail/detail?id=' + (r ? r.restaurant_id : ''),
    }
  },
})
