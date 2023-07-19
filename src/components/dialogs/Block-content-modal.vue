<template>
  <div :class="['dialog__modal', {'dialog__modal--open' : status}]" data-e2e="block-content-modal">
    <div :class="['dialog__window dialog__window--w500', {'dialog__window--open' : status}]">
      <div class="dialog__window-body">
        <div class="grid-row">
          <p v-html="content"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  
  export default {
    name: 'BlockContentModal',
    props: ['status', 'content'],
  }
</script>
