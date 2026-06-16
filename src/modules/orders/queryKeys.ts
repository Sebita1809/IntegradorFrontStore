export const ordersQueryKeys = {
  all: ['orders'] as const,
  list: (userId: number) => [...ordersQueryKeys.all, 'list', userId] as const,
  detail: (id: number | string) => [...ordersQueryKeys.all, 'detail', id] as const,
}
