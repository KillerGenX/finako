// Enhanced composable for standardized API operations
// Provides consistent patterns for CRUD operations across all views

import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import apiService from '@/services/api'

export function useApiCrud(resourceName, apiMethods = {}) {
  const userStore = useUserStore()
  
  // State
  const items = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const searchTerm = ref('')
  const currentItem = ref(null)
  const isEditMode = ref(false)

  // Computed
  const filteredItems = computed(() => {
    if (!searchTerm.value) return items.value
    const term = searchTerm.value.toLowerCase()
    return items.value.filter(item => {
      // Default search in name field, can be customized
      return item.name?.toLowerCase().includes(term) ||
             item.title?.toLowerCase().includes(term) ||
             item.description?.toLowerCase().includes(term)
    })
  })

  const itemsCount = computed(() => items.value.length)
  const hasItems = computed(() => items.value.length > 0)

  // Default API methods (can be overridden)
  const defaultMethods = {
    getAll: () => apiService.get(`/${resourceName}`),
    create: (data) => apiService.post(`/${resourceName}`, data),
    update: (id, data) => apiService.put(`/${resourceName}/${id}`, data),
    delete: (id) => apiService.delete(`/${resourceName}/${id}`)
  }

  const api = { ...defaultMethods, ...apiMethods }

  // Actions
  async function fetchItems(params = {}) {
    return withLoading(loading, async () => {
      try {
        userStore.validateMembership()
        const data = await api.getAll(params)
        items.value = Array.isArray(data) ? data : []
        return data
      } catch (error) {
        console.error(`Error fetching ${resourceName}:`, error)
        items.value = []
        throw error
      }
    })
  }

  async function createItem(itemData) {
    return withLoading(saving, async () => {
      try {
        userStore.validateMembership()
        const newItem = await api.create(itemData)
        items.value.unshift(newItem)
        userStore.showNotification(`${resourceName} berhasil ditambahkan`, 'success')
        return newItem
      } catch (error) {
        console.error(`Error creating ${resourceName}:`, error)
        throw error
      }
    })
  }

  async function updateItem(id, itemData) {
    return withLoading(saving, async () => {
      try {
        userStore.validateMembership()
        const updatedItem = await api.update(id, itemData)
        const index = items.value.findIndex(item => item.id === id)
        if (index !== -1) {
          items.value[index] = updatedItem
        }
        userStore.showNotification(`${resourceName} berhasil diperbarui`, 'success')
        return updatedItem
      } catch (error) {
        console.error(`Error updating ${resourceName}:`, error)
        throw error
      }
    })
  }

  async function deleteItem(id) {
    return withLoading(deleting, async () => {
      try {
        userStore.validateMembership()
        await api.delete(id)
        items.value = items.value.filter(item => item.id !== id)
        userStore.showNotification(`${resourceName} berhasil dihapus`, 'success')
      } catch (error) {
        console.error(`Error deleting ${resourceName}:`, error)
        throw error
      }
    })
  }

  // Form helpers
  function startCreate(defaultData = {}) {
    isEditMode.value = false
    currentItem.value = { id: null, ...defaultData }
  }

  function startEdit(item) {
    isEditMode.value = true
    currentItem.value = { ...item }
  }

  function resetForm() {
    currentItem.value = null
    isEditMode.value = false
  }

  async function saveItem() {
    if (!currentItem.value) return

    try {
      if (isEditMode.value && currentItem.value.id) {
        await updateItem(currentItem.value.id, currentItem.value)
      } else {
        await createItem(currentItem.value)
      }
      resetForm()
    } catch (error) {
      throw error
    }
  }

  // Utility function for loading states
  async function withLoading(loadingRef, operation) {
    loadingRef.value = true
    try {
      return await operation()
    } finally {
      loadingRef.value = false
    }
  }

  // Search helpers
  function setSearchTerm(term) {
    searchTerm.value = term
  }

  function clearSearch() {
    searchTerm.value = ''
  }

  // Pagination helpers (for future use)
  const pagination = ref({
    page: 1,
    limit: 50,
    total: 0
  })

  function nextPage() {
    if (pagination.value.page * pagination.value.limit < pagination.value.total) {
      pagination.value.page++
    }
  }

  function prevPage() {
    if (pagination.value.page > 1) {
      pagination.value.page--
    }
  }

  function setPage(page) {
    pagination.value.page = Math.max(1, page)
  }

  return {
    // State
    items,
    loading,
    saving,
    deleting,
    searchTerm,
    currentItem,
    isEditMode,
    pagination,

    // Computed
    filteredItems,
    itemsCount,
    hasItems,

    // Actions
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    saveItem,

    // Form helpers
    startCreate,
    startEdit,
    resetForm,

    // Search helpers
    setSearchTerm,
    clearSearch,

    // Pagination helpers
    nextPage,
    prevPage,
    setPage,

    // Utility
    withLoading
  }
}

// Specialized composables for common use cases

export function useProducts() {
  return useApiCrud('products', {
    getAll: (params) => apiService.getProducts(params),
    create: (data) => apiService.createProduct(data),
    update: (id, data) => apiService.updateProduct(id, data),
    delete: (id) => apiService.deleteProduct(id)
  })
}

export function useCustomers() {
  return useApiCrud('customers', {
    getAll: (params) => apiService.getCustomers(params),
    create: (data) => apiService.createCustomer(data),
    update: (id, data) => apiService.updateCustomer(id, data),
    delete: (id) => apiService.deleteCustomer(id)
  })
}

export function useSales() {
  return useApiCrud('sales', {
    getAll: (params) => apiService.getSales(params),
    create: (data) => apiService.createSale(data),
    update: (id, data) => apiService.updateSale(id, data),
    delete: (id) => apiService.deleteSale(id)
  })
}

export function useExpenses() {
  return useApiCrud('expenses', {
    getAll: (params) => apiService.getExpenses(params),
    create: (data) => apiService.createExpense(data),
    update: (id, data) => apiService.updateExpense(id, data),
    delete: (id) => apiService.deleteExpense(id)
  })
}

export function useExpenseCategories() {
  return useApiCrud('expense-categories', {
    getAll: (params) => apiService.getExpenseCategories(params),
    create: (data) => apiService.createExpenseCategory(data),
    update: (id, data) => apiService.updateExpenseCategory(id, data),
    delete: (id) => apiService.deleteExpenseCategory(id)
  })
}

export function useTransactions() {
  return useApiCrud('transactions', {
    getAll: (params) => apiService.getTransactions(params),
    create: (data) => apiService.createTransaction(data)
  })
}

export function useStocks() {
  return useApiCrud('stocks', {
    getAll: (params) => apiService.getStocks(params),
    update: (id, data) => apiService.updateStock(id, data)
  })
}
