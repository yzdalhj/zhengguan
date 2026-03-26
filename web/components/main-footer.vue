<template>
  <footer class="bg-neutral-950 border-t border-neutral-800 lg:ml-44">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 py-12">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">


        <div>
          <h4 class="text-sm font-medium text-white mb-4">导航</h4>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/search" class="text-sm text-neutral-500 hover:text-white transition-colors">
                搜索
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/tags" class="text-sm text-neutral-500 hover:text-white transition-colors">
                标签
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/collections" class="text-sm text-neutral-500 hover:text-white transition-colors">
                收藏
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-sm font-medium text-white mb-4">分类</h4>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/search?category=动作风格" class="text-sm text-neutral-500 hover:text-white transition-colors">
                动作风格
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/search?category=镜头语言" class="text-sm text-neutral-500 hover:text-white transition-colors">
                镜头语言
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/search?category=场景" class="text-sm text-neutral-500 hover:text-white transition-colors">
                场景
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-sm font-medium text-white mb-4">关于</h4>
          <p class="text-sm text-neutral-500 mb-4">
            所有内容均来自公开网络，仅供创作参考。
          </p>
          <button @click="showDisclaimer" class="text-sm text-neutral-500 hover:text-white transition-colors">
            免责声明
          </button>
        </div>
      </div>

      <div class="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-neutral-600">
          &copy; {{ currentYear }} 帧观. All rights reserved.
        </p>
        <div class="flex items-center gap-4">
          <a href="#" class="text-neutral-600 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Disclaimer Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showDisclaimerModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="showDisclaimerModal = false">
        <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full">
          <h3 class="text-lg font-semibold text-white mb-4">免责声明</h3>
          <div class="text-sm text-neutral-400 space-y-3">
            <p>1. 本网站所有视频内容均来自第三方平台的公开链接，本网站不存储任何视频文件。</p>
            <p>2. 本网站仅提供视频索引和分类服务，所有内容版权归原作者或原平台所有。</p>
            <p>3. 如认为内容侵犯您的权益，请联系我们，我们将在24小时内删除相关内容。</p>
            <p>4. 本网站内容仅供创作参考学习使用，请勿用于商业用途。</p>
          </div>
          <button 
            @click="showDisclaimerModal = false"
            class="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
          >
            我知道了
          </button>
        </div>
      </div>
    </Transition>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentYear = new Date().getFullYear()
const showDisclaimerModal = ref(false)

const showDisclaimer = () => {
  showDisclaimerModal.value = true
}
</script>
