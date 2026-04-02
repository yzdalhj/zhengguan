<template>
  <div class="flex w-full h-full min-h-460px rounded-2xl overflow-hidden">
    <div class="w-[55%] relative">
      <div class="overflow-hidden rounded-l-2xl w-full h-full">
        <video
          autoplay
          muted
          loop
          playsinline
          class="w-full h-full object-cover border-0 outline-none bg-transparent"
        >
          <source src="https://v4-kling.kechuangai.com/kcdn/cdn-kcdn112452/login/zh.mp4" type="video/mp4">
        </video>
      </div>
    </div>

    <div class="w-[45%] shrink-0 relative bg-(--bg-elevated) px-10 py-12 flex flex-col justify-center">
      <div class="text-center mb-8">
        <h2 class="text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-(--text-primary) mb-2">{{ mode === 'login' ? '欢迎登录' : '注册账号' }}</h2>
      </div>

      <div v-if="mode === 'login'" class="flex mb-8 border-b border-(--border-color)">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          @click="activeTab = tab.value"
          class="relative px-4 pb-3 text-base whitespace-nowrap"
          :class="activeTab === tab.value ? 'text-(--text-primary) font-medium' : 'text-(--text-secondary)'"
        >
          {{ tab.label }}
          <div v-if="activeTab === tab.value" class="absolute bottom-0 left-0 right-0 h-0.5 bg-(--text-primary)"></div>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6 flex-1">
        <!-- 扫码登录 -->
        <div v-if="activeTab === 'qrcode'" class="flex flex-col items-center justify-center py-12">
          <div class="w-20 h-20 bg-(--bg-secondary) border border-(--border-color) rounded-2xl flex items-center justify-center mb-6">
            <Icon name="mdi:qrcode-scan" class="text-(--text-muted)" size="40" />
          </div>
          <h3 class="text-lg font-medium text-(--text-primary) mb-2">扫码登录</h3>
          <p class="text-(--text-secondary) text-sm mb-1">请使用微信扫码登录</p>
          <div class="mt-4 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p class="text-amber-500 text-sm flex items-center gap-2">
              <Icon name="mdi:clock-outline" size="16" />
              <span>即将上线，敬请期待</span>
            </p>
          </div>
        </div>

        <!-- 手机号登录 -->
        <template v-else>
          <div class="relative">
            <div class="flex items-center px-5 py-4 bg-(--bg-secondary) border border-(--border-color) rounded-xl">
              <span class="text-(--text-primary) text-base whitespace-nowrap">+86</span>
              <span class="mx-3 text-(--border-color)">|</span>
              <input
                v-model="phone"
                type="tel"
                required
                class="flex-1 bg-transparent text-(--text-primary) text-base placeholder:text-(--text-muted) focus:outline-none"
                placeholder="请输入手机号"
              />
              <button v-if="phone" type="button" @click="phone = ''" class="ml-2 text-(--text-muted) hover:text-(--text-secondary) cursor-pointer">
                <Icon name="mdi:close" size="18" />
              </button>
            </div>
          </div>

          <div v-if="mode === 'login'" class="flex gap-4 mb-2">
            <button
              type="button"
              @click="loginMethod = 'code'"
              class="flex-1 py-2 px-4 rounded-lg text-center font-medium transition-colors"
              :class="loginMethod === 'code' ? 'bg-primary text-white' : 'bg-(--bg-secondary) text-(--text-secondary) hover:bg-(--bg-elevated)'"
            >
              验证码登录
            </button>
            <button
              type="button"
              @click="loginMethod = 'password'"
              class="flex-1 py-2 px-4 rounded-lg text-center font-medium transition-colors"
              :class="loginMethod === 'password' ? 'bg-primary text-white' : 'bg-(--bg-secondary) text-(--text-secondary) hover:bg-(--bg-elevated)'"
            >
              密码登录
            </button>
          </div>

          <div v-if="mode === 'login' && loginMethod === 'code'" class="flex flex-col items-center justify-center py-6">
            <div class="w-16 h-16 bg-(--bg-secondary) border border-(--border-color) rounded-2xl flex items-center justify-center mb-4">
              <Icon name="mdi:message-text-outline" class="text-(--text-muted)" size="32" />
            </div>
            <p class="text-(--text-secondary) text-sm mb-1">验证码登录</p>
            <div class="mt-3 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p class="text-amber-500 text-sm flex items-center gap-2">
                <Icon name="mdi:clock-outline" size="16" />
                <span>即将上线，敬请期待</span>
              </p>
            </div>
          </div>

          <div v-if="mode === 'login' && loginMethod === 'password'">
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-5 py-4 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) text-base placeholder:text-(--text-muted) transition-all duration-200 focus:outline-none focus:border-(--text-secondary) focus:ring-0 pr-16"
                placeholder="请输入密码"
              />
              <button
                type="button"
                @click="togglePassword"
                class="absolute right-6 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-secondary) transition-colors duration-200 cursor-pointer"
              >
                <Icon v-if="!showPassword" name="mdi:eye-outline" size="20" />
                <Icon v-else name="mdi:eye-off-outline" size="20" />
              </button>
            </div>
          </div>
        </template>

        <div v-if="mode === 'register'">
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="6"
              class="w-full px-5 py-4 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) text-base placeholder:text-(--text-muted) transition-all duration-200 focus:outline-none focus:border-(--text-secondary) focus:ring-0 pr-16"
              placeholder="请输入密码（至少6位）"
            />
            <button
              type="button"
              @click="togglePassword"
              class="absolute right-6 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-secondary) transition-colors duration-200 cursor-pointer"
            >
              <Icon v-if="!showPassword" name="mdi:eye-outline" size="20" />
              <Icon v-else name="mdi:eye-off-outline" size="20" />
            </button>
          </div>
          <div class="flex mt-6">
            <input
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full px-5 py-4 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) text-base placeholder:text-(--text-muted) transition-all duration-200 focus:outline-none focus:border-(--text-secondary) focus:ring-0"
              placeholder="确认密码"
            />
          </div>
        </div>

        <div class="flex items-center text-sm">
          <span class="text-(--text-secondary)">{{ mode === 'login' ? '登录即代表同意' : '注册即代表同意' }}</span>
          <a href="#" class="ml-2 text-green-500 hover:underline">《用户协议》</a>
          <span class="mx-2 text-(--text-secondary)">和</span>
          <a href="#" class="text-green-500 hover:underline">《隐私政策》</a>
        </div>

        <div v-if="error" class="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <p class="text-red-400 text-sm">{{ error }}</p>
        </div>

        <button
          type="submit"
          :disabled="loading || !canSubmit"
          class="w-full flex justify-center items-center py-4 px-6 rounded-xl text-xl font-semibold transition-colors disabled:cursor-not-allowed"
          :class="canSubmit ? 'bg-primary text-white hover:bg-primary-hover' : 'text-(--text-muted) bg-(--bg-secondary)'"
        >
          <Icon v-if="loading" name="mdi:loading" class="animate-spin -ml-1 mr-2" :class="canSubmit ? 'text-white' : 'text-(--text-muted)'" size="20" />
          {{ loading ? (mode === 'login' ? '登录中...' : '注册中...') : (mode === 'login' ? '立即登录' : '立即注册') }}
        </button>

        <div class="text-center pt-2 text-base">
          <span class="text-(--text-secondary)">{{ mode === 'login' ? '还没有账号？' : '已有账号？' }}</span>
          <button
            type="button"
            @click="emit('switch-mode')"
            class="ml-1 text-(--text-primary) font-medium hover:underline transition-colors cursor-pointer"
          >{{ mode === 'login' ? '立即注册' : '立即登录'}}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, computed } from 'vue'

interface Props {
  onSuccess?: () => void
  mode?: 'login' | 'register'
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
  (e: 'switch-mode'): void
}

const props = withDefaults(defineProps<Props>(), {
  onSuccess: undefined,
  mode: 'login',
})
const emit = defineEmits<Emits>()

const router = useRouter()
const userStore = useUserStore()
const { $api } = useNuxtApp()

const tabs = [
  { label: '手机登录', value: 'phone' },
  { label: '扫码登录', value: 'qrcode' },
]

const activeTab = ref('phone')
const account = ref('')
const email = ref('')
const phone = ref('')
const code = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const countdown = ref(0)
const loginMethod = ref<'code' | 'password'>('password')
let timer: number | null = null

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const canSubmit = computed(() => {
  // 扫码登录和验证码登录功能暂未开放，禁用提交
  if (props.mode === 'login' && activeTab.value === 'qrcode') return false
  if (props.mode === 'login' && loginMethod.value === 'code') return false
  
  // 手机号登录/注册需要手机号
  if (!phone.value) return false
  
  if (props.mode === 'login') {
    if (loginMethod.value === 'password' && !password.value) return false
  }
  
  if (props.mode === 'register' && (!password.value || !confirmPassword.value)) return false
  if (props.mode === 'register' && password.value !== confirmPassword.value) return false
  return true
})

const sendCode = async () => {
  if (!phone.value) {
    error.value = '请输入手机号'
    return
  }
  
  try {
    await $api.post('/auth/sms/send', { phone: phone.value })
    countdown.value = 60
    timer = window.setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (timer) clearInterval(timer)
      }
    }, 1000)
  } catch (err: any) {
    error.value = err.error || '发送验证码失败'
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    if (props.mode === 'login') {
      // 登录逻辑
      // 手机号密码登录
      await userStore.loginByPhone(phone.value, password.value)
      
      // 登录成功
      emit('success')
      emit('close')
      if (props.onSuccess) {
        props.onSuccess()
      }
      router.push('/collections')
    } else {
      // 注册逻辑 - 使用手机号注册
      if (!phone.value) {
        error.value = '请输入手机号'
        loading.value = false
        return
      }
      
      if (password.value !== confirmPassword.value) {
        error.value = '两次输入的密码不一致'
        loading.value = false
        return
      }
      
      if (password.value.length < 6) {
        error.value = '密码至少需要6位'
        loading.value = false
        return
      }
      
      const username = phone.value
      const email = ''
      await userStore.register(username, email, password.value, phone.value)
      
      // 注册成功，切换到登录模式
      emit('switch-mode')
      error.value = ''
    }
  } catch (err: any) {
    error.value = err.error || (props.mode === 'login' ? '登录失败，请检查信息' : '注册失败，请检查信息')
  } finally {
    loading.value = false
  }
}
</script>
