<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
onMounted(() => game.loadPurchaseLog())
</script>

<template>
  <RouterView />
</template>
