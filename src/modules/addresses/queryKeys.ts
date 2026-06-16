export const addressesQueryKeys = {
  all: ['addresses'] as const,
  list: () => [...addressesQueryKeys.all, 'list'] as const,
}
