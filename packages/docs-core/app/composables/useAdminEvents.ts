// Simple module-level event bus so any component can trigger a nav refresh
// without prop-drilling or component coupling.
const _refreshSignal = ref(0)

export function useAdminEvents() {
  function triggerRefresh() {
    _refreshSignal.value++
  }

  return {
    refreshSignal: readonly(_refreshSignal),
    triggerRefresh,
  }
}
