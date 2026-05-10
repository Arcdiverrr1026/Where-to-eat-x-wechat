const REVIEW_COUNT_KEY = 'review_count_cache'
const USER_REVIEW_KEY = 'user_reviews'

function getCache() {
  try {
    return wx.getStorageSync(REVIEW_COUNT_KEY) || {}
  } catch (e) {
    return {}
  }
}

function setCache(cache) {
  try {
    wx.setStorageSync(REVIEW_COUNT_KEY, cache)
  } catch (e) {}
}

// 缓存推荐接口返回的评价数（只记录大于0的值，避免缓存0）
function updateCountCache(restaurants) {
  const cache = getCache()
  restaurants.forEach(r => {
    const current = r.review_count || 0
    if (current > 0) {
      const cached = cache[r.restaurant_id] || 0
      if (current > cached) {
        cache[r.restaurant_id] = current
      }
    }
  })
  setCache(cache)
}

// 手动设置某餐厅的评价数
function setCount(restaurantId, count) {
  if (count > 0) {
    const cache = getCache()
    const cached = cache[restaurantId] || 0
    if (count > cached) {
      cache[restaurantId] = count
      setCache(cache)
    }
  }
}

// 记录用户提交了评价
function addReview(restaurantId) {
  // 更新用户评价计数
  try {
    const userStore = wx.getStorageSync(USER_REVIEW_KEY) || {}
    userStore[restaurantId] = (userStore[restaurantId] || 0) + 1
    wx.setStorageSync(USER_REVIEW_KEY, userStore)
  } catch (e) {}
  // 同步更新缓存
  const cache = getCache()
  cache[restaurantId] = (cache[restaurantId] || 0) + 1
  setCache(cache)
}

// 合并缓存评价数到餐厅列表（取较大值）
function mergeReviewCounts(restaurants) {
  const cache = getCache()
  return restaurants.map(r => {
    const cached = cache[r.restaurant_id] || 0
    if (cached > (r.review_count || 0)) {
      r.review_count = cached
    }
    // 修正：有评价时 comment_tone 不应显示"没人留言"
    if (r.review_count > 0 && r.comment_tone && (r.comment_tone.includes('没人留言') || r.comment_tone.includes('还没有'))) {
      r.comment_tone = '共' + r.review_count + '条评价'
    }
    return r
  })
}

// 获取某餐厅的缓存评价数
function getCount(restaurantId) {
  const cache = getCache()
  return cache[restaurantId] || 0
}

module.exports = {
  updateCountCache,
  addReview,
  mergeReviewCounts,
  getCount,
  setCount,
}
