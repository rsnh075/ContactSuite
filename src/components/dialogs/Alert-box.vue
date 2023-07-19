<template>
  <div :class="dialogStatus" data-e2e="alert-box">
    <div :class="windowStatus" id="dialog-window">
      <div v-if="headercontent" class="dialog__window-header dialog__window-header--important dialog__window-header--transparent">
        <span>{{ headercontent }}</span>
      </div>
      <div v-if="bodycontent" class="dialog__window-body">
        <div class="grid-row">
          <div class="dialog__window-body--message">
            <p>{{ bodycontent}}</p>
          </div>
        </div>
      </div>
      <div class="grid-unit--alpha dialog__window-footer dialog__window-footer--message">
        <a class="button-primary dialog__window-accept" @click="doAccept">{{ acceptlabel }}</a>
      </div>
    </div>
  </div>
</template>

<script>
  
  export default {
    name: 'AlertBox',
    props: ['status', 'headercontent', 'bodycontent', 'acceptlabel'],
    data: () => {
      return {

      }
    },
    computed: {
      dialogStatus() {
        let _class = 'dialog__modal dialog__modal--fixed';
        if(this.$props.status)
          _class += ' dialog__modal--open';

        return _class;
      },
      windowStatus() {
        let _class = 'dialog__window dialog__window--w400';
        if(this.$props.status)
          _class += ' dialog__window--open';

        return _class;
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
