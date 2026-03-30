<template>
  <Teleport to="body">
    <Transition name="dialog-overlay">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-saturate-150 backdrop-blur-sm"
        :style="{ padding: top ? `${top}px 1rem 1rem 1rem` : '1rem' }"
        @click.self="handleOverlayClick"
      >
        <Transition
          name="dialog-content"
          :enter-from-class="center ? 'dialog-content-enter-from-center' : 'dialog-content-enter-from'"
          :leave-to-class="center ? 'dialog-content-leave-to-center' : 'dialog-content-leave-to'"
        >
          <div
            v-if="modelValue"
            class="relative w-full overflow-hidden"
            :class="[
              sizeClass,
              plain
                ? 'bg-transparent border-none shadow-none'
                : 'bg-(--bg-elevated) border border-(--border-color) rounded-xl shadow-xl',
              {
                'max-h-[calc(100vh-2rem)]': hasScrollbar,
                'dialog-align-top': top,
              }
            ]"
          >
            <template v-if="!plain">
              <!-- Header -->
              <div v-if="hasTitleSlot || showClose" class="flex items-center justify-between px-5 py-4 border-b border-(--border-color)">
                <div class="flex-1">
                  <slot name="title">
                    <h3 v-if="title" class="text-lg font-semibold text-(--text-primary)">{{ title }}</h3>
                  </slot>
                </div>
                <button
                  v-if="showClose"
                  @click="handleClose"
                  class="shrink-0 p-1.5 rounded-lg text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary) transition-colors"
                  :aria-label="closeOnClickOverlay ? '关闭' : undefined"
                >
                  <dynamic-icon name="x" size="18px" />
                </button>
              </div>

              <!-- Body -->
              <div
                class="dialog-body"
                :class="{ 'overflow-y-auto': hasScrollbar }"
              >
                <slot></slot>
              </div>

              <!-- Footer -->
              <div v-if="hasFooterSlot || showCancelButton || showConfirmButton" class="px-5 py-4 border-t border-(--border-color) bg-(--bg-secondary/50)">
                <slot name="footer">
                  <div class="flex justify-end gap-2">
                    <button
                      v-if="showCancelButton"
                      @click="handleCancel"
                      class="px-4 py-2 text-sm font-medium text-(--text-secondary) bg-transparent border border-(--border-color) rounded-lg hover:text-(--text-primary) hover:bg-(--bg-secondary) transition-colors"
                    >
                      {{ cancelButtonText }}
                    </button>
                    <button
                      v-if="showConfirmButton"
                      @click="handleConfirm"
                      class="px-4 py-2 text-sm font-medium text-white bg-primary border border-primary rounded-lg hover:bg-(--primary-hover) transition-colors"
                      :disabled="confirmDisabled"
                      :class="{ 'opacity-50 cursor-not-allowed': confirmDisabled }"
                    >
                      {{ confirmButtonText }}
                    </button>
                  </div>
                </slot>
              </div>
            </template>

            <template v-else>
              <!-- Plain mode - only body content -->
              <div
                class="dialog-body-plain"
                :class="{ 'overflow-y-auto': hasScrollbar }"
              >
                <slot></slot>
              </div>
            </template>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  top?: number
  width?: string
  closeOnClickOverlay?: boolean
  showClose?: boolean
  showCancelButton?: boolean
  showConfirmButton?: boolean
  cancelButtonText?: string
  confirmButtonText?: string
  confirmDisabled?: boolean
  center?: boolean
  draggable?: boolean
  plain?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'cancel'): void
  (e: 'confirm'): void
  (e: 'opened'): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closeOnClickOverlay: true,
  showClose: true,
  showCancelButton: false,
  showConfirmButton: false,
  cancelButtonText: '取消',
  confirmButtonText: '确定',
  confirmDisabled: false,
  center: false,
  draggable: false,
  plain: false,
})
const emit = defineEmits<Emits>()

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'max-w-sm'
    case 'md': return 'max-w-lg'
    case 'lg': return 'max-w-3xl'
    case 'xl': return 'max-w-5xl'
    case 'full': return 'max-w-[90vw] h-[90vh]'
    default: return 'max-w-lg'
  }
})

const hasTitleSlot = computed(() => {
  return !!useSlots().title
})

const hasFooterSlot = computed(() => {
  return !!useSlots().footer
})

const hasScrollbar = computed(() => {
  return props.size !== 'full'
})

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    handleClose()
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  if (!props.showConfirmButton && !hasFooterSlot.value) {
    emit('update:modelValue', false)
  }
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.dialog-overlay-enter-active,
.dialog-overlay-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.dialog-overlay-enter-from,
.dialog-overlay-leave-to {
  opacity: 0;
}

.dialog-content-enter-active,
.dialog-content-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.dialog-content-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}
.dialog-content-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}
.dialog-content-enter-from-center {
  opacity: 0;
  transform: scale(0.9);
}
.dialog-content-leave-to-center {
  opacity: 0;
  transform: scale(0.9);
}

.dialog-body {
  padding: 1.25rem 1.25rem;
}

.dialog-body-plain {
  padding: 0;
}

.dialog-align-top {
  align-items: flex-start;
}

.with-scrollbar {
  max-height: calc(100vh - 2rem);
}

.with-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.with-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.with-scrollbar::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.with-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
