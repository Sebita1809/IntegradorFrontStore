export const categoriesQueryKeys = {
  all: ['categories'] as const,
  list: (params?: { offset?: number; limit?: number; nombre?: string }) =>
    [...categoriesQueryKeys.all, 'list', params ?? {}] as const,
  tree: () => [...categoriesQueryKeys.all, 'tree'] as const,
}
