<template>
  <div class="max-w-7xl mx-auto px-5 py-8">
    <!-- 头部 Banner -->
    <div class="relative rounded-2xl overflow-hidden bg-linear-to-r from-purple-900 via-indigo-900 to-blue-900 p-8 mb-8">
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full filter blur-3xl"></div>
      </div>
      <div class="relative z-10">
        <h1 class="text-2xl font-bold text-white mb-2">升级会员，解锁全部提示词</h1>
        <p class="text-white/70 text-sm">每一条提示词都经过实测验证，让你的AI视频创作更专业</p>
        <div v-if="isVip && !isExpired" class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
          <Icon name="heroicons:shield-check" class="w-5 h-5 text-green-400" />
          <span class="text-white text-sm">{{ isSvip ? 'SVIP' : 'VIP' }}会员有效至 {{ expiresAtFormatted }}</span>
        </div>
      </div>
    </div>

    <!-- 会员方案对比 -->
    <div v-if="benefits" class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      <!-- Free -->
      <div class="rounded-xl border border-(--border-color) bg-(--bg-elevated) p-6">
        <div class="text-center mb-5">
          <h3 class="text-lg font-bold text-(--text-primary)">{{ benefits.free.label }}</h3>
          <div class="text-3xl font-bold text-(--text-primary) mt-2">免费</div>
        </div>
        <ul class="space-y-3">
          <li v-for="feature in benefits.free.features" :key="feature" class="flex items-center gap-2 text-sm text-(--text-secondary)">
            <Icon name="heroicons:check" class="w-4 h-4 text-green-400 shrink-0" />
            {{ feature }}
          </li>
        </ul>
        <div v-if="!isVip" class="mt-6 text-center">
          <span class="text-sm text-(--text-muted)">当前方案</span>
        </div>
      </div>

      <!-- VIP -->
      <div class="rounded-xl border-2 border-purple-500 bg-(--bg-elevated) p-6 relative shadow-lg shadow-purple-500/10">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
          推荐
        </div>
        <div class="text-center mb-5">
          <h3 class="text-lg font-bold text-(--text-primary)">{{ benefits.vip.label }}</h3>
          <div class="flex items-baseline justify-center gap-2 mt-2">
            <span class="text-3xl font-bold text-purple-500">&yen;29</span>
            <span class="text-sm text-(--text-muted)">/月起</span>
          </div>
        </div>
        <ul class="space-y-3 mb-6">
          <li v-for="feature in benefits.vip.features" :key="feature" class="flex items-center gap-2 text-sm text-(--text-secondary)">
            <Icon name="heroicons:check" class="w-4 h-4 text-purple-400 shrink-0" />
            {{ feature }}
          </li>
        </ul>
        <div class="space-y-2">
          <button
            v-for="plan in benefits.vip.plans"
            :key="plan.type"
            @click="handleSubscribe('vip', plan.type)"
            class="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
            :class="isVipPlanActive('vip', plan.type)
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 cursor-default'
              : 'bg-linear-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-sm shadow-purple-500/20 active:scale-[0.98]'"
            :disabled="isVipPlanActive('vip', plan.type)"
          >
            {{ plan.label }} &yen;{{ plan.price }}
            <span v-if="plan.type === 'yearly'" class="text-xs opacity-80">（省{{ (benefits.vip.plans[0].price * 12 - plan.price) }}元）</span>
          </button>
        </div>
      </div>

      <!-- SVIP -->
      <div class="rounded-xl border-2 border-amber-500 bg-(--bg-elevated) p-6 relative shadow-lg shadow-amber-500/10">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
          尊享
        </div>
        <div class="text-center mb-5">
          <h3 class="text-lg font-bold text-(--text-primary)">{{ benefits.svip.label }}</h3>
          <div class="flex items-baseline justify-center gap-2 mt-2">
            <span class="text-3xl font-bold text-amber-500">&yen;59</span>
            <span class="text-sm text-(--text-muted)">/月起</span>
          </div>
        </div>
        <ul class="space-y-3 mb-6">
          <li v-for="feature in benefits.svip.features" :key="feature" class="flex items-center gap-2 text-sm text-(--text-secondary)">
            <Icon name="heroicons:check" class="w-4 h-4 text-amber-400 shrink-0" />
            {{ feature }}
          </li>
        </ul>
        <div class="space-y-2">
          <button
            v-for="plan in benefits.svip.plans"
            :key="plan.type"
            @click="handleSubscribe('svip', plan.type)"
            class="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
            :class="isVipPlanActive('svip', plan.type)
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-default'
              : 'bg-linear-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-sm shadow-amber-500/20 active:scale-[0.98]'"
            :disabled="isVipPlanActive('svip', plan.type)"
          >
            {{ plan.label }} &yen;{{ plan.price }}
            <span v-if="plan.type === 'yearly'" class="text-xs opacity-80">（省{{ (benefits.svip.plans[0].price * 12 - plan.price) }}元）</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 支付弹窗 -->
    <UiDialog
      v-model:model-value="showPaymentDialog"
      title="扫码支付"
      size="md"
      :plain="true"
      :show-close="true"
      @close="closePaymentDialog"
    >
      <div class="p-6">
        <!-- 支付方式选择 -->
        <div class="flex gap-3 mb-6">
          <button
            @click="paymentMethod = 'wechat'"
            class="flex-1 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2"
            :class="paymentMethod === 'wechat'
              ? 'border-green-500 bg-green-500/10 text-green-600'
              : 'border-(--border-color) text-(--text-secondary) hover:border-green-500'"
          >
            <Icon name="simple-icons:wechat" class="w-5 h-5" />
            微信支付
          </button>
          <button
            @click="paymentMethod = 'alipay'"
            class="flex-1 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2"
            :class="paymentMethod === 'alipay'
              ? 'border-blue-500 bg-blue-500/10 text-blue-600'
              : 'border-(--border-color) text-(--text-secondary) hover:border-blue-500'"
          >
            <Icon name="simple-icons:alipay" class="w-5 h-5" />
            支付宝
          </button>
        </div>

        <!-- 支付信息 -->
        <div class="text-center mb-4">
          <p class="text-sm text-(--text-secondary)">支付金额</p>
          <p class="text-3xl font-bold text-(--text-primary) mt-1">&yen;{{ selectedPlanPrice }}</p>
          <p class="text-sm text-(--text-muted) mt-1">{{ selectedPlanLabel }}</p>
        </div>

        <!-- 二维码区域 -->
        <div v-if="paymentUrl && !paymentCompleted" class="flex flex-col items-center">
          <div class="w-48 h-48 bg-white rounded-xl p-3 mb-3">
            <!-- QR Code placeholder -->
            <div class="w-full h-full bg-gray-100 rounded flex items-center justify-center">
              <div class="text-center">
                <Icon name="heroicons:qr-code" class="w-24 h-24 text-gray-400 mx-auto" />
                <p class="text-xs text-gray-400 mt-1">请使用{{ paymentMethod === 'wechat' ? '微信' : '支付宝' }}扫码</p>
              </div>
            </div>
          </div>
          <p class="text-xs text-(--text-muted)">
            <Icon name="heroicons:clock" class="w-3 h-3 inline" />
            请在30分钟内完成支付
          </p>
        </div>

        <!-- 支付中状态 -->
        <div v-else-if="!paymentUrl && !paymentCompleted" class="flex flex-col items-center py-8">
          <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-sm text-(--text-muted)">正在生成支付二维码...</p>
        </div>

        <!-- 支付完成 -->
        <div v-else-if="paymentCompleted" class="flex flex-col items-center py-8">
          <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
            <Icon name="heroicons:check-circle" class="w-10 h-10 text-green-500" />
          </div>
          <p class="text-lg font-semibold text-green-500">支付成功</p>
          <p class="text-sm text-(--text-secondary) mt-1">会员已激活，享受全部权益</p>
          <button
            @click="closePaymentDialog"
            class="mt-4 px-6 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors"
          >
            开始使用
          </button>
        </div>
      </div>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

useHead({
  title: 'VIP会员 - 帧观 AI',
  meta: [
    { name: 'description', content: '开通帧观AI VIP会员，解锁全部AI视频提示词，享受专属权益。' }
  ]
})

const userStore = useUserStore()
const { isVip, isSvip, expiresAt, isExpired, fetchBenefits, createPayment, pollPaymentStatus } = useMembership()

const benefits = ref<any>(null)
const showPaymentDialog = ref(false)
const paymentMethod = ref<'wechat' | 'alipay'>('wechat')
const paymentUrl = ref('')
const paymentCompleted = ref(false)
const selectedLevel = ref<'vip' | 'svip'>('vip')
const selectedPlanType = ref<'monthly' | 'yearly'>('monthly')

const expiresAtFormatted = computed(() => {
  if (!expiresAt.value) return ''
  const date = new Date(expiresAt.value)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
})

const selectedPlanPrice = computed(() => {
  if (!benefits.value) return 0
  const plan = benefits.value[selectedLevel.value]?.plans?.find((p: any) => p.type === selectedPlanType.value)
  return plan?.price || 0
})

const selectedPlanLabel = computed(() => {
  if (!benefits.value) return ''
  const plan = benefits.value[selectedLevel.value]?.plans?.find((p: any) => p.type === selectedPlanType.value)
  return plan?.label || ''
})

const isVipPlanActive = (level: string, planType: string): boolean => {
  if (level === 'vip' && (isVip.value || isSvip.value)) return true
  if (level === 'svip' && isSvip.value) return true
  return false
}

// 会员类型映射：字符串 level -> 数值 ID
const MEMBERSHIP_TARGET_ID: Record<string, number> = {
  vip: 1,
  svip: 2,
}

const handleSubscribe = async (level: 'vip' | 'svip', planType: 'monthly' | 'yearly') => {
  if (!userStore.isAuthenticated) {
    navigateTo('/login')
    return
  }

  selectedLevel.value = level
  selectedPlanType.value = planType
  paymentUrl.value = ''
  paymentCompleted.value = false
  showPaymentDialog.value = true

  try {
    const result = await createPayment({
      type: 'membership',
      target_id: MEMBERSHIP_TARGET_ID[level] ?? 1,
      payment_method: paymentMethod.value,
      plan: planType,
    })
    paymentUrl.value = result.payment_url

    // 开始轮询支付状态
    pollPayment(result.order_no)
  } catch (error) {
    console.error('Failed to create payment:', error)
  }
}

const pollPayment = async (orderNo: string) => {
  const status = await pollPaymentStatus(orderNo)
  if (status === 'paid') {
    paymentCompleted.value = true
  }
}

const closePaymentDialog = () => {
  showPaymentDialog.value = false
  paymentUrl.value = ''
  paymentCompleted.value = false
}

// 切换支付方式时重新创建订单
watch(paymentMethod, async () => {
  if (showPaymentDialog.value && !paymentCompleted.value) {
    paymentUrl.value = ''
    try {
      const result = await createPayment({
        type: 'membership',
        target_id: MEMBERSHIP_TARGET_ID[selectedLevel.value] ?? 1,
        payment_method: paymentMethod.value,
        plan: selectedPlanType.value,
      })
      paymentUrl.value = result.payment_url
      pollPayment(result.order_no)
    } catch (error) {
      console.error('Failed to recreate payment:', error)
    }
  }
})

onMounted(async () => {
  benefits.value = await fetchBenefits()
})
</script>
