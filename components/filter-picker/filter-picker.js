const config = require('../../utils/config')

Component({
  properties: {
    initialCategory: { type: String, value: '' },
    initialBudget: { type: String, value: '' },
    initialDistance: { type: String, value: '' },
    initialScene: { type: String, value: '' },
  },

  data: {
    categories: config.CATEGORIES,
    budgets: config.BUDGETS,
    distances: config.DISTANCES,
    scenes: config.SCENES,
    selectedCategory: '',
    selectedBudget: '',
    selectedDistance: '',
    selectedScene: '',
  },

  lifetimes: {
    attached() {
      this.setData({
        selectedCategory: this.properties.initialCategory || this.data.categories[0],
        selectedBudget: this.properties.initialBudget || this.data.budgets[0],
        selectedDistance: this.properties.initialDistance || this.data.distances[0],
        selectedScene: this.properties.initialScene || this.data.scenes[0],
      })
      this.emitChange()
    },
  },

  methods: {
    onCategoryTap(e) {
      this.setData({ selectedCategory: e.currentTarget.dataset.value })
      this.emitChange()
    },
    onBudgetTap(e) {
      this.setData({ selectedBudget: e.currentTarget.dataset.value })
      this.emitChange()
    },
    onDistanceTap(e) {
      this.setData({ selectedDistance: e.currentTarget.dataset.value })
      this.emitChange()
    },
    onSceneTap(e) {
      this.setData({ selectedScene: e.currentTarget.dataset.value })
      this.emitChange()
    },
    emitChange() {
      this.triggerEvent('change', {
        category: this.data.selectedCategory,
        budget: this.data.selectedBudget,
        distance: this.data.selectedDistance,
        scene: this.data.selectedScene,
      })
    },
  },
})
