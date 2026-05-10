const api = require('../../utils/api')
const locationUtil = require('../../utils/location')

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
    filters: null,
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
    const filters = this.data.filters || {
      category: '烧烤',
      budget: '70以内',
      distance: '3公里内',
      scene: '宿舍聚餐',
    }
    this.setData({ loading: true })

    locationUtil.getLocation().then(loc => {
      return api.post('/api/recommend/restaurants', {
        location: { lat: loc.latitude, lng: loc.longitude },
        category: filters.category,
        budget: filters.budget,
        distance: filters.distance,
        scene: filters.scene,
      })
    }).then(res => {
      const restaurants = res.list || []
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
      wx.navigateTo({ url: '/pages/detail/detail?id=' + r.restaurant_id + '&lat=' + r.lat + '&lng=' + r.lng })
    }
  },

  onToggleFilter() {
    this.setData({ showFilter: !this.data.showFilter })
  },

  onFilterChange(e) {
    this.setData({ filters: e.detail })
  },

  onSearch() {
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
      title: '去哪吃 - 附近餐厅地图',
      path: '/pages/map/map',
    }
  },
})
