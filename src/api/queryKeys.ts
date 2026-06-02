export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (params?: { offset?: number; limit?: number; nombre?: string }) =>
      [...queryKeys.products.all, 'list', params ?? {}] as const,
    detail: (id: number | string) => [...queryKeys.products.all, 'detail', id] as const,
  },

  categories: {
    all: ['categories'] as const,
    list: (params?: { offset?: number; limit?: number; nombre?: string }) =>
      [...queryKeys.categories.all, 'list', params ?? {}] as const,
    tree: () => [...queryKeys.categories.all, 'tree'] as const,
  },

  orders: {
    all: ['orders'] as const,
    list: (userId: number) => [...queryKeys.orders.all, 'list', userId] as const,
    detail: (id: number | string) => [...queryKeys.orders.all, 'detail', id] as const,
  },

  addresses: {
    all: ['addresses'] as const,
    list: () => [...queryKeys.addresses.all, 'list'] as const,
  },
}
