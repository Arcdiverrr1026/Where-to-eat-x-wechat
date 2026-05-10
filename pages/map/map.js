const api = require('../../utils/api')
const locationUtil = require('../../utils/location')
const config = require('../../utils/config')

Page({
  data: {
    latitude: 31.2304,
    longitude: 121.4737,
    scale: 15,
    markers: [],
    restaurants: [],
    selectedRestaurant: null,
    loading: false,
    showFilter: false,
    filters: {
      category: config.CATEGORIES[0],
      budget: config.BUDGETS[0],
      distance: config.DISTANCES[0],
      scene: config.SCENES[0],
    },
  },

  onLoad() {
    this.moveToCurrentLocation()
  },

  onShow() {
    if (this.data.restaurants.length === 0) {
      this.loadNearbyRestaurants()
    }
  },

  moveToCurrentLocation() {
    locationUtil.getLocation().then(loc => {
      this.setData({
        latitude: loc.latitude,
        longitude: loc.longitude,
      })
    }).catch(() => {})
  },

  loadNearbyRestaurants() {
    const filters = this.data.filters
    this.setData({ loading: true })

    locationUtil.getLocation().then(loc => {
      return api.post('/api/recommend/restaurants', {
        location: { lat: loc.latitude, lng: loc.longitude },
        category: filters.category,
        budget: filters.budget,
        budget_min: filters.budget_min,
        budget_max: filters.budget_max,
        distance: filters.distance,
        scene: filters.scene,
      })
    }).then(res => {
      const restaurants = (res.list || []).filter(r => r.lat && r.lng).map(r => {
        r.tags = r.tags || []
        r.risk_flags = r.risk_flags || []
        return r
      })
      const markers = restaurants.map((r, i) => ({
        id: i,
        latitude: r.lat,
        longitude: r.lng,
        title: r.name,
        callout: {
          content: r.name + '\n' + r.price_text,
          display: 'BYCLICK',
          borderRadius: 8,
          padding: 8,
          fontSize: 14,
          bgColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#FF6B35',
        },
      }))
      this.setData({ restaurants, markers, loading: false })
    }).catch(err => {
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
      console.error('loadNearbyRestaurants error:', err)
    })
  },

  onMarkerTap(e) {
    const markerId = e.markerId
    const restaurant = this.data.restaurants[markerId]
    if (restaurant) {
      this.setData({ selectedRestaurant: restaurant })
    }
  },

  onCalloutTap(e) {
    const markerId = e.markerId
    const restaurant = this.data.restaurants[markerId]
    if (restaurant) {
      this.setData({ selectedRestaurant: restaurant })
    }
  },

  onTapMap() {
    this.setData({ selectedRestaurant: null })
  },

  goToDetail() {
    const r = this.data.selectedRestaurant
    if (r) {
      wx.navigateTo({ url: '/pages/detail/detail?id=' + r.restaurant_id })
    }
  },

  onToggleFilter() {
    this.setData({ showFilter: !this.data.showFilter })
  },

  onFilterChange(e) {
    this.setData({ filters: e.detail })
  },

  onSearch() {
    const filters = this.data.filters
    if (filters && filters.budget_min != null && filters.budget_max != null && filters.budget_min > filters.budget_max) {
      wx.showToast({ title: '最低预算不能大于最高预算', icon: 'none' })
      return
    }
    this.setData({ showFilter: false, selectedRestaurant: null })
    this.loadNearbyRestaurants()
  },

  onRecenter() {
    locationUtil.getLocation().then(loc => {
      this.setData({
        latitude: loc.latitude,
        longitude: loc.longitude,
        scale: 15,
      })
    }).catch(() => {
      wx.showToast({ title: '无法获取位置', icon: 'none' })
    })
  },

  onShareAppMessage() {
    return {
      title: 'Where to Eat - 附近餐厅地图',
      path: '/pages/map/map',
    }
  },
})
