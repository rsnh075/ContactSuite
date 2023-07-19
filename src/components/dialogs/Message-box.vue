<template>
  <div :class="dialogStatus" data-e2e="message-box">
    <div :class="windowStatus" id="dialog-window">
      <div v-if="headerContent" class="dialog__window-header dialog__window-header--important dialog__window-header--transparent">
        <span>{{ headerContent }}</span>
      </div>
      <div v-if="bodyContent" class="dialog__window-body">
        <div class="grid-row" v-html="bodyContent"></div>
      </div>
      <div v-if="hasAccept || hasCancel" class="grid-unit--alpha dialog__window-footer dialog__window-footer--message">
        <a v-if="hasAccept" class="button-primary dialog__window-accept" @click="doAccept">{{ acceptLabel }}</a>
        <a v-if="hasCancel" class="button-primary dialog__window-cancel" @click="doCanceled">{{ cancelLabel }}</a>
      </div>
    </div>
  </div>
</template>

<script>
  
  export default {
    name: 'MessageBox',
    props: ['status', 'headerContent', 'bodyContent', 'acceptLabel', 'cancelLabel'],
    data: () => {
      return {
        
      }
    },
    computed: {
      dialogStatus() {
        let _class = 'dialog__modal';
        if(this.$props.status)
          _class += ' dialog__modal--open';

        return _class;
      },
      windowStatus() {
        let _class = 'dialog__window dialog__window--w500';
        if(this.$props.status)
          _class += ' dialog__window--open';

        return _class;
      },
      hasAccept() {
        return (this.acceptLabel == '') ? false : true;
      },
      hasCancel() {
        return (this.cancelLabel == '') ? false : true;
      },
    },
    methods: {
      doAccept() {
        this.$emit('accepted');
      },
      doCanceled() {
        this.$emit('canceled');
      },
    },
    mounted() {

    }
  }
</script>
