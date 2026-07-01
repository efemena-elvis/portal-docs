const STORAGE_KEY = 'vsc_admin_token'

const _isAdmin = ref(false)
const _checking = ref(false)
let _initialized = false

export function useAdmin() {
  function getToken(): string | null {
    if (import.meta.server) return null
    return localStorage.getItem(STORAGE_KEY)
  }

  function setToken(token: string) {
    localStorage.setItem(STORAGE_KEY, token)
    _isAdmin.value = true
  }

  function clearToken() {
    localStorage.removeItem(STORAGE_KEY)
    _isAdmin.value = false
  }

  async function verify(): Promise<boolean> {
    const token = getToken()
    if (!token) {
      _isAdmin.value = false
      return false
    }
    try {
      await $fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${token}` },
      })
      _isAdmin.value = true
      return true
    } catch {
      clearToken()
      return false
    }
  }

  async function init() {
    if (_initialized || import.meta.server) return
    _initialized = true
    _checking.value = true
    await verify()
    _checking.value = false
  }

  async function login(code: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await $fetch<{ token: string }>('/api/admin/login', {
        method: 'POST',
        body: { code },
      })
      setToken(res.token)
      return { ok: true }
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Login failed'
      return { ok: false, error: msg }
    }
  }

  function logout() {
    clearToken()
    _initialized = false
    navigateTo('/')
  }

  function authHeaders(): Record<string, string> {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  return {
    isAdmin: readonly(_isAdmin),
    checking: readonly(_checking),
    init,
    login,
    logout,
    authHeaders,
    getToken,
  }
}
