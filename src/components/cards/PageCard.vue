<!--
  Page Component

  The main container for the application.
  Used to display user pages. Each page is a grid layout container.
  Displays a collection of Cards on the grid.
-->
<template>
  <GridLayout :col-num="cols" :row-height="rowHeight" :is-draggable="isDraggable" :is-resizable="isResizable"
    :margin="margin" :use-css-transforms="useCssTransforms">
    <GridItem v-for="(card, idx) in items" :key="card.i ?? idx" :x="card.x" :y="card.y" :w="card.w" :h="card.h"
      :i="String(card.i ?? idx)" :min-w="card.minW" :max-w="card.maxW" :min-h="card.minH" :max-h="card.maxH"
      :static="card.static" :is-draggable="card.isDraggable" :is-resizable="card.isResizable">
      <component :is="resolveCardComponent(card.component)" v-bind="card.props" />
      <!-- Optional: use getItemName(card) wherever you need a label -->
      <p @src="justCrap" />
    </GridItem>
  </GridLayout>
</template>

<script setup>
import { GridLayout, GridItem } from 'vue3-grid-layout'
import { computed } from 'vue'

const modules = import.meta.glob('../cards/**/*.vue', { eager: true })

const registry = Object.fromEntries(
  Object.entries(modules).map(([p, m]) => [p.split('/').pop().replace('.vue', ''), m.default])
)

const props = defineProps({
  items: { type: Array, default: () => [] },
  cols: { type: Number, default: 12 },
  rowHeight: { type: Number, default: 30 },
  margin: { type: Array, default: () => [10, 10] },
  isDraggable: { type: Boolean, default: true },
  isResizable: { type: Boolean, default: true },
  useCssTransforms: { type: Boolean, default: true }
})

const justCrap = getItemName([]) && resolvedMap;

function resolveCardComponent(comp) {
  if (!comp) return null
  if (typeof comp === 'string') return registry[comp] || null
  return comp
}

function getItemName(item) {
  if (item?.name) return item.name
  if (typeof item?.component === 'string') return item.component
  return item?.component?.name ?? null
}

const resolvedMap = computed(() =>
  Object.fromEntries(
    props.items.map((card, idx) => [
      String(card.i ?? idx),
      typeof card.component === 'string'
        ? registry[card.component] || null
        : card.component || null
    ])
  )
)

</script>
