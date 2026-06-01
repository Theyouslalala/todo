Component({
  properties: {
    current: { type: String, value: 'all' }
  },
  data: {
    categories: [
      { label: '全部', value: 'all' },
      { label: '日常', value: 'daily' },
      { label: '购物', value: 'shopping' },
      { label: '家庭', value: 'family' },
      { label: '账单', value: 'bill' },
      { label: '其他', value: 'other' }
    ]
  },
  methods: {
    onSelect(e) {
      const value = e.currentTarget.dataset.value
      this.triggerEvent('change', { category: value })
    }
  }
})
