export const productsQueryKeys = {
  all: ['products'] as const,
  list: (params?: { offset?: number; limit?: number; nombre?: string; categoria_id?: number }) =>
    [...productsQueryKeys.all, 'list', params ?? {}] as const,
  detail: (id: number | string) => [...productsQueryKeys.all, 'detail', id] as const,
}
