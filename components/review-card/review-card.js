Component({
  properties: {
    review: { type: Object, value: {} },
  },

  data: {
    expanded: false,
  },

  methods: {
    toggleExpand() {
      this.setData({ expanded: !this.data.expanded })
    },
  },
})
