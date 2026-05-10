Component({
  properties: {
    restaurant: { type: Object, value: {} },
  },

  methods: {
    onTap() {
      const r = this.properties.restaurant
      wx.navigateTo({
        url: '/pages/detail/detail?id=' + r.restaurant_id,
      })
    },
  },
})
