const api = require('../../utils/api')
const reviewStore = require('../../utils/reviewStore')

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
      this.fetchDetail(options.id)
    }
  },

  fetchDetail(id, retryCount) {
    retryCount = retryCount || 0
    this.setData({ loading: true })
    api.get('/api/restaurants/' + id).then(res => {
      // 数组字段空值保护
      res.tags = res.tags || []
      res.risk_flags = res.risk_flags || []
      res.comment_highlights = res.comment_highlights || []
      res.caution_notes = res.caution_notes || []
      res.comment_overview = res.comment_overview || []
      res.reviews = res.reviews || []
      // 更新本地缓存
      reviewStore.setCount(id, res.review_count)
      // 修正：有评价时概要不应显示"没人留言"
      if (res.review_count > 0 && res.comment_overview && res.comment_overview.length > 0) {
        const first = res.comment_overview[0]
        if (first.includes('没人留言') || first.includes('还没有') || first.includes('暂无')) {
          res.comment_overview[0] = '已有' + res.review_count + '条评价'
        }
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
      // 404 或网络错误时重试（后端缓存可能尚未就绪）
      if ((err.statusCode === 404 || !err.statusCode) && retryCount < 2) {
        setTimeout(() => {
          this.fetchDetail(id, retryCount + 1)
        }, 1500 * (retryCount + 1))
        return
      }
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败，请返回重试', icon: 'none' })
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

  onModalContentTap() {},

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
    this._submitReview(restaurant.restaurant_id, reviewRating, reviewContent, 0)
  },

  _submitReview(restaurantId, rating, content, retryCount) {
    api.post('/api/reviews/feedback', {
      restaurant_id: restaurantId,
      rating: rating,
      content: content,
    }).then(() => {
      const restaurant = this.data.restaurant
      const newReview = { rating, content, created_at: '刚刚' }
      const reviews = [newReview].concat(restaurant.reviews || [])
      // 记录到本地存储
      reviewStore.addReview(restaurantId)
      this.setData({
        submitting: false,
        showReviewModal: false,
        'restaurant.reviews': reviews,
        'restaurant.review_count': (restaurant.review_count || 0) + 1,
      })
      wx.showToast({ title: '评价成功', icon: 'success' })
      // 刷新详情以获取最新的评价分析
      setTimeout(() => {
        this.fetchDetail(restaurantId)
      }, 500)
    }).catch(err => {
      // 网络错误重试一次
      if (!err.statusCode && retryCount < 1) {
        setTimeout(() => {
          this._submitReview(restaurantId, rating, content, retryCount + 1)
        }, 1000)
        return
      }
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
      title: r ? 'Where to Eat - ' + r.name : 'Where to Eat - 餐厅推荐',
      path: '/pages/detail/detail?id=' + (r ? r.restaurant_id : ''),
    }
  },
})
