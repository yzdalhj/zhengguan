<template>
  <footer class="bg-(--bg-secondary) border-t border-(--border-color)" style="margin-left: 200px;">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 py-12">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">


        <div>
          <h4 class="text-sm font-medium text-(--text-primary) mb-4">导航</h4>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/search" class="text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors">
                搜索
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/tags" class="text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors">
                标签
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/collections" class="text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors">
                收藏
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-sm font-medium text-(--text-primary) mb-4">分类</h4>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/search?category=动作风格" class="text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors">
                动作风格
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/search?category=镜头语言" class="text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors">
                镜头语言
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/search?category=场景" class="text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors">
                场景
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-sm font-medium text-(--text-primary) mb-4">关于</h4>
          <p class="text-sm text-(--text-secondary) mb-4">
            所有内容均来自公开网络，仅供创作参考。
          </p>
          <button @click="showDisclaimer" class="text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors">
            免责声明
          </button>
        </div>
      </div>

      <div class="pt-8 border-t border-(--border-color) flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-(--text-muted)">
          &copy; {{ currentYear }} 帧观. All rights reserved.
        </p>
        <div class="flex items-center gap-4">
          <a href="#" class="text-(--text-muted) hover:text-(--text-primary) transition-colors">
            <UIcon name="i-simple-icons-github" class="w-5 h-5" />
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
        <div class="bg-(--bg-elevated) border border-(--border-color) rounded-2xl p-6 max-w-lg w-full">
          <h3 class="text-lg font-semibold text-(--text-primary) mb-4">免责声明</h3>
          <div class="text-sm text-(--text-secondary) space-y-3">
            <p>1. 本网站所有视频内容均来自第三方平台的公开链接，本网站不存储任何视频文件。</p>
            <p>2. 本网站仅提供视频索引和分类服务，所有内容版权归原作者或原平台所有。</p>
            <p>3. 如认为内容侵犯您的权益，请联系我们，我们将在24小时内删除相关内容。</p>
            <p>4. 本网站内容仅供创作参考学习使用，请勿用于商业用途。</p>
          </div>
          <button 
            @click="showDisclaimerModal = false"
            class="mt-6 w-full py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-colors"
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
