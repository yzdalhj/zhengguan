<script setup lang="ts">
import { useSeoMeta } from '@vueuse/head';
import type { SEOMetadata } from '@/types';

const props = defineProps<{
  seo: SEOMetadata;
}>();

useSeoMeta({
  title: props.seo.title,
  description: props.seo.description,
});
</script>

<template>
</template>
