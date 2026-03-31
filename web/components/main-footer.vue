<template>
  <footer class="bg-(--bg-secondary) border-t border-(--border-color)">
    <div class="mx-auto h-14 flex items-center justify-between p-3 pl-10 pr-10">
      <!-- 左侧：版权信息 -->
      <p class="text-xs text-(--text-muted)">
        &copy; {{ currentYear }} 帧观. 保留所有权利.
      </p>
      <!-- 右侧：法律信息 -->
      <div class="flex items-center gap-2">
        <button
          variant="text"
          size="small"
          class="px-1 text-xs text-(--text-secondary) hover:text-(--text-primary) transition-colors"
          @click="showDisclaimerModal = true"
        >
          免责声明
        </button>
        <button
          variant="text"
          size="small"
          class="px-1 text-xs text-(--text-secondary) hover:text-(--text-primary) transition-colors"
          @click="showCopyrightModal = true"
        >
          版权声明
        </button>
        <button
          variant="text"
          size="small"
          class="px-1 text-xs text-(--text-secondary) hover:text-(--text-primary) transition-colors"
          @click="showPrivacyModal = true"
        >
          隐私政策
        </button>
        <button
          variant="text"
          size="small"
          class="px-1 text-xs text-(--text-secondary) hover:text-(--text-primary) transition-colors"
          @click="showContactModal = true"
        >
          侵权投诉
        </button>
        <div class="w-px h-4 bg-(--border-color) mx-1"></div>
        <a
          href="https://github.com"
          target="_blank"
          class="text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          <dynamic-icon name="logo-github" size="16px" />
        </a>
      </div>
    </div>

    <!-- 免责声明弹窗 -->
    <div
      v-if="showDisclaimerModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showDisclaimerModal = false"
    >
      <div class="bg-(--bg-elevated) border border-(--border-color) rounded-xl w-150 max-h-[80vh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-(--text-primary) mb-4">免责声明</h3>
          <div class="text-sm text-(--text-secondary) space-y-4">
            <div class="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
              本网站为影视创作参考平台，请仔细阅读以下条款后使用。
            </div>
            <p>
              <strong class="text-(--text-primary)">一、平台性质</strong><br>
              帧观是一个影视镜头语言与动作设计参考资源聚合平台。我们仅提供视频内容的索引、分类和检索服务，不存储、上传或制作任何视频文件。
            </p>
            <p>
              <strong class="text-(--text-primary)">二、内容来源</strong><br>
              本网站展示的所有视频内容（包括但不限于缩略图、标题、描述、标签）均来自第三方平台的公开链接，通过自动化技术抓取和索引。我们不对原始内容的版权归属、准确性、完整性作出任何保证。
            </p>
            <p>
              <strong class="text-(--text-primary)">三、使用限制</strong><br>
              本网站内容仅供影视创作者个人学习、研究和创作参考使用。严禁将本网站内容用于任何商业用途，包括但不限于：商业放映、广告制作、付费教学、二次销售等。
            </p>
            <p>
              <strong class="text-(--text-primary)">四、用户责任</strong><br>
              用户在使用本网站内容时，应遵守《中华人民共和国著作权法》等相关法律法规，尊重知识产权。用户自行承担因使用本网站内容而产生的一切法律责任和风险。
            </p>
            <p>
              <strong class="text-(--text-primary)">五、免责条款</strong><br>
              本网站不对以下情况承担责任：第三方平台内容变更、删除或无法访问；用户不当使用内容导致的法律纠纷；因网络原因导致的服务中断或数据丢失。
            </p>
          </div>
          <div class="mt-6">
            <button
              class="w-full bg-primary hover:bg-primary-hover text-white font-medium rounded-lg py-2 transition-colors"
              @click="showDisclaimerModal = false"
            >
              我已阅读并理解
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 版权声明弹窗 -->
    <div
      v-if="showCopyrightModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showCopyrightModal = false"
    >
      <div class="bg-(--bg-elevated) border border-(--border-color) rounded-xl w-150 max-h-[80vh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-(--text-primary) mb-4">版权声明</h3>
          <div class="text-sm text-(--text-secondary) space-y-4">
            <p>
              <strong class="text-(--text-primary)">一、平台原创内容</strong><br>
              本网站（帧观）的界面设计、代码实现、品牌标识、文字描述、分类体系等原创内容，除特别注明外，版权归帧观所有。未经许可，任何个人或组织不得转载、摘编或利用其他方式使用。
            </p>
            <p>
              <strong class="text-(--text-primary)">二、第三方内容</strong><br>
              本网站展示的视频缩略图、标题、描述、标签等信息均来自第三方平台（如 YouTube、Bilibili 等），其版权归原作者所有。帧观仅提供索引服务，不代表拥有这些内容的所有权或使用权。
            </p>
            <p>
              <strong class="text-(--text-primary)">三、合理使用说明</strong><br>
              根据《中华人民共和国著作权法》第二十四条，为介绍、评论某一作品或者说明某一问题，在作品中适当引用他人已经发表的作品，可以不经著作权人许可，不向其支付报酬，但应当指明作者姓名或者名称、作品名称，并且不得影响该作品的正常使用，也不得不合理地损害著作权人的合法权益。
            </p>
            <p>
              <strong class="text-(--text-primary)">四、版权投诉</strong><br>
              如认为本网站展示的内容侵犯了您的版权，请通过"侵权投诉"渠道提交投诉，我们将在收到完整材料后 24 小时内进行处理。
            </p>
          </div>
          <div class="mt-6">
            <button
              class="w-full bg-primary hover:bg-primary-hover text-white font-medium rounded-lg py-2 transition-colors"
              @click="showCopyrightModal = false"
            >
              我知道了
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐私政策弹窗 -->
    <div
      v-if="showPrivacyModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showPrivacyModal = false"
    >
      <div class="bg-(--bg-elevated) border border-(--border-color) rounded-xl w-150 max-h-[80vh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-(--text-primary) mb-4">隐私政策</h3>
          <div class="text-sm text-(--text-secondary) space-y-4">
            <p>
              <strong class="text-(--text-primary)">一、信息收集范围</strong><br>
              我们收集的信息包括：<br>
              1. <strong>账户信息</strong>：手机号（用于登录验证和账户安全）<br>
              2. <strong>实名信息</strong>：真实姓名、身份证号（用于实名认证，符合相关法律法规要求）<br>
              3. <strong>使用数据</strong>：搜索关键词、浏览器类型、访问时间和页面（用于服务优化）<br>
              4. <strong>偏好设置</strong>：主题偏好、观看历史（用于提升用户体验）
            </p>
            <p>
              <strong class="text-(--text-primary)">二、Cookie 与本地存储</strong><br>
              我们使用 Cookie 和浏览器本地存储技术来改善用户体验，包括：记住用户的主题偏好、保存观看历史记录。用户可以随时在浏览器设置中清除这些数据。
            </p>
            <p>
              <strong class="text-(--text-primary)">三、数据安全</strong><br>
              我们采取合理的技术措施保护用户数据安全，使用 HTTPS 加密传输，定期备份数据，防止数据泄露、丢失或被滥用。
            </p>
            <p>
              <strong class="text-(--text-primary)">四、第三方服务</strong><br>
              本网站可能使用第三方统计服务来分析网站流量，这些服务可能会收集匿名使用数据（如页面访问量、访问时长），但不会识别个人身份。
            </p>
            <p>
              <strong class="text-(--text-primary)">五、政策更新</strong><br>
              我们保留随时更新本隐私政策的权利，更新后的政策将在本页面公布，重大变更将通过网站公告通知用户。
            </p>
          </div>
          <div class="mt-6">
            <button
              class="w-full bg-primary hover:bg-primary-hover text-white font-medium rounded-lg py-2 transition-colors"
              @click="showPrivacyModal = false"
            >
              同意并继续
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 侵权投诉弹窗 -->
    <div
      v-if="showContactModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showContactModal = false"
    >
      <div class="bg-(--bg-elevated) border border-(--border-color) rounded-xl w-600px max-w-[90vw] max-h-[80vh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-(--text-primary) mb-4">侵权投诉</h3>
          <div class="text-sm text-(--text-secondary) space-y-4">
            <div class="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              我们重视知识产权保护，请在确认以下内容后提交投诉。
            </div>
            <p>
              <strong class="text-(--text-primary)">投诉须知</strong><br>
              如果您认为本网站展示的内容侵犯了您的合法权益，请准备以下材料：
            </p>
            <ul class="list-disc list-inside space-y-1 ml-2">
              <li>您的身份证明（个人身份证或企业营业执照）</li>
              <li>版权权属证明（作品登记证书、授权书等）</li>
              <li>侵权内容的具体链接和说明</li>
              <li>联系方式（邮箱或电话）</li>
            </ul>
            <p>
              <strong class="text-(--text-primary)">处理流程</strong><br>
              我们将在收到完整投诉材料后 24 小时内进行核实，确认侵权后将立即删除相关内容，并通过邮件通知您处理结果。
            </p>
            <p>
              <strong class="text-(--text-primary)">联系方式</strong><br>
              请将投诉材料发送至：<span class="text-(--text-primary)">copyright@zhengguan.com</span>
            </p>
            <p class="text-xs text-(--text-muted)">
              注：请确保您的投诉真实有效，恶意投诉将承担相应法律责任。
            </p>
          </div>
          <div class="mt-6">
            <button
              class="w-full bg-primary hover:bg-primary-hover text-white font-medium rounded-lg py-2 transition-colors"
              @click="showContactModal = false"
            >
              我知道了
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
const showDisclaimerModal = ref(false);
const showCopyrightModal = ref(false);
const showPrivacyModal = ref(false);
const showContactModal = ref(false);
</script>
