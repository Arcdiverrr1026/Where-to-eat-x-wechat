Component({
  properties: {
    tone: { type: String, value: '' },
  },

  data: {
    toneClass: 'tone-unknown',
  },

  observers: {
    tone(val) {
      if (!val) {
        this.setData({ toneClass: 'tone-unknown' })
        return
      }
      const positive = ['好评', '推荐', '不错', '好吃', '推荐去']
      const negative = ['差评', '避雷', '踩雷', '难吃', '不推荐']
      const lower = val.toLowerCase()
      if (positive.some(k => lower.includes(k))) {
        this.setData({ toneClass: 'tone-positive' })
      } else if (negative.some(k => lower.includes(k))) {
        this.setData({ toneClass: 'tone-negative' })
      } else {
        this.setData({ toneClass: 'tone-neutral' })
      }
    },
  },
})
