<template>
  <div class="switchabletextarea-wrapper" data-e2e="switch-table-text-area">
    <div class="form-textarea form-textarea--description form-textarea--description-long">
      <label>{{ label }}</label>
      <textarea v-model="theValue" :disabled="!isActive"></textarea>
    </div>
    <div class="form-togglefield">
      <input type="checkbox" :name="uiFormName" :id="uiFormName" v-model="isActive"/>
      <label :for="uiFormName"></label>
    </div>
  </div>  
</template>

<script>
  export default {
    name : 'SwitchableTextArea',
    props : {
      label : {
        type : String,
        default : ''
      },
      value : {
        type : String,
        default : ''
      },
      active : {
        type : Boolean,
        default : true
      }
    },
    data: () => {
      return {
        uiFormName : 'toggle',
        isActive   : true,
        theValue   : '',
      }
    },
    watch: {
      value: function(newVal, oldVal) {
        if(newVal !== oldVal) {
          this.isActive   = this.active;
          this.theValue   = this.value;
        }
      },
      active: function(newVal, oldVal) {
        if(newVal !== oldVal) {
          this.isActive   = this.active;
          this.theValue   = this.value;
        }
      },
      theValue: function(newVal, oldVal) {
        if(newVal !== oldVal) {
          this.$emit('onchange', {
            active : this.isActive,
            value  : this.theValue
          });
        }
      },
      isActive: function(newVal, oldVal) {
        if(newVal !== oldVal) {
          this.$emit('onchange', {
            active : this.isActive,
            value  : this.theValue
          });
        }
      }
    },
    computed: {
      
    },
    methods: {
      getGIUD() {
        return '_' + Math.random().toString(32).substring(2, 11);
      }
    },
    mounted() {
      this.uiFormName = this.uiFormName + this.getGIUD();
    },
  }
</script>

<style lang="scss" scoped>

  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals";
  
  .switchabletextarea-wrapper {
    position: relative;
    float: left;
    width: 100%;
    textarea:disabled {
      border-bottom: 1px solid #bfbfbf;
      color: #a6a6a6;
      user-select: none;
    }
    .form-textarea {
      float: left;
      width: calc(100% - 90px);
    }
    .form-togglefield {
      position: absolute;
      top:50%;
      right: 0;
      width: 60px;
      transform: translateY(-50%);

    }

  }

</style>