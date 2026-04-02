import { useUserStore } from '~/stores/user'
import type { MembershipBenefits } from '~/types'

export const useMembership = () => {
  const { $api } = useNuxtApp()
  const userStore = useUserStore()
  const benefits = ref<MembershipBenefits | null>(null)
  const loading = ref(false)

  const isVip = computed(() => {
    const level = userStore.user?.level
    return level === 'vip' || level === 'svip'
  })

  const isSvip = computed(() => {
    return userStore.user?.level === 'svip'
  })

  const levelLabel = computed(() => {
    const level = userStore.user?.level
    if (level === 'svip') return 'SVIP'
    if (level === 'vip') return 'VIP'
    return ''
  })

  const expiresAt = computed(() => {
    return userStore.user?.level_expires_at
  })

  const isExpired = computed(() => {
    if (!expiresAt.value) return false
    return new Date(expiresAt.value) < new Date()
  })

  const fetchBenefits = async () => {
    if (benefits.value) return benefits.value
    try {
      const response = await $api.get('/memberships/benefits')
      benefits.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch membership benefits:', error)
    }
  }

  const fetchStatus = async () => {
    try {
      const response = await $api.get('/memberships/status')
      return response.data
    } catch (error) {
      console.error('Failed to fetch membership status:', error)
    }
  }

  /**
   * 会员类型映射：字符串 level -> 数值 ID
   */
  const MEMBERSHIP_TARGET_ID: Record<string, number> = {
    vip: 1,
    svip: 2,
  }

  const createPayment = async (params: {
    type: 'prompt' | 'membership'
    target_id: number | string
    payment_method: 'wechat' | 'alipay'
    plan?: 'monthly' | 'yearly'
  }) => {
    loading.value = true
    try {
      // 会员类型转换为数值 ID
      const targetId = params.type === 'membership' && typeof params.target_id === 'string'
        ? (MEMBERSHIP_TARGET_ID[params.target_id] || parseInt(params.target_id))
        : params.target_id

      const response = await $api.post('/payments/create', {
        ...params,
        target_id: targetId,
      })
      return response.data as {
        order_no: string
        amount: number
        payment_method: string
        payment_url: string
        expire_at: string
      }
    } catch (error) {
      console.error('Failed to create payment:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const pollPaymentStatus = async (orderNo: string, maxAttempts: number = 60, interval: number = 3000): Promise<'paid' | 'expired' | 'timeout'> => {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, interval))
      try {
        const response = await $api.get(`/payments/${orderNo}`)
        if (response.data.status === 'paid') {
          // 刷新用户信息
          await userStore.fetchUser()
          return 'paid'
        }
        if (response.data.status === 'expired') {
          return 'expired'
        }
      } catch {
        // 继续轮询
      }
    }
    return 'timeout'
  }

  return {
    isVip,
    isSvip,
    levelLabel,
    expiresAt,
    isExpired,
    benefits,
    loading,
    fetchBenefits,
    fetchStatus,
    createPayment,
    pollPaymentStatus,
  }
}
