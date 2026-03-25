<template>
  <footer class="bg-gray-50 border-t mt-12">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 class="text-lg font-semibold mb-4">关于 帧观</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            帧观 - 每一帧，都是灵感。帮助视频创作者快速找到高质量分镜、动作、打斗画面参考，为AI视频创作提供灵感。
          </p>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-4">快速链接</h3>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/search" class="text-gray-600 hover:text-primary">搜索素材</router-link></li>
            <li><router-link to="/tags" class="text-gray-600 hover:text-primary">标签分类</router-link></li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-4">版权声明</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            本站所有视频链接均来自公开网络，仅供创作参考。如侵犯您的权益，请联系我们删除。
          </p>
        </div>
      </div>
      <div class="border-t mt-8 pt-6 text-center text-gray-500 text-sm">
        &copy; {{ currentYear }} 帧观 · 每一帧，都是灵感.
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>
