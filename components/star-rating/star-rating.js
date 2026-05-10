Component({
  properties: {
    rating: { type: Number, value: 0 },
  },

  data: {
    stars: [false, false, false, false, false],
  },

  observers: {
    rating(val) {
      const stars = []
      for (let i = 0; i < 5; i++) {
        stars.push(i < val)
      }
      this.setData({ stars })
    },
  },
})
