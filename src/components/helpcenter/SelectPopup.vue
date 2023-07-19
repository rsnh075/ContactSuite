<template>
  <div v-if="status" class="popup-modal" :style="'left:' + leftpos" data-e2e="select-popup">
    <div class="popup-screen">
      <div class="grid-row">
        <a class="popup-modal-close" @click="closeThis">
          <span></span>
          <span></span>
        </a>
      </div>
      <div class="grid-row">
        <div class="selectlist-wrapper">
          <div v-for="item in theList" :data-value="JSON.stringify(item)" class="selectlist__item" @click="selectItem" >{{ item.label }}</div>
        </div>
      </div>
    </div>  
  </div>
</template>

<script>
  
  export default {
    name: 'SelectPopup',
    props: ['data', 'status', 'leftpos'],
    data: () => {
      return {
        theList : []
      }
    },
    watch: {
      'status' : function(newVal, oldVal) {
        if(newVal !== oldVal) {
          this.theList = JSON.parse(JSON.stringify(this.data));
        }
      },
    },
    methods: {
      closeThis() {
        this.$emit('onClose');
      },
      selectItem(evt) {
        this.$emit('onChange', JSON.parse(evt.target.getAttribute('data-value')));
        this.theList = [];
        this.$emit('onClose');
      },    
    },
    mounted() {
      
    }
  }

</script>

<style lang="scss">

  @use "@/scss/includes/globals";

  .popup-modal {
    position: fixed;
    top: 80px;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, .2);
    z-index: 100;
  }

  .popup-screen {
    position: relative;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 40px 20px 20px 20px;
    width: 100%;
    max-width: 512px;
    background-color: globals.$color-white;
    box-shadow: 0 0 10px 0 rgba(0,0,0,.2);
  }

  .popup-modal-close {
    position: absolute;
    top: -35px;
    right: -15px;
    width: 45px;
    height: 45px;
    display: block;
    z-index: 10001;
    cursor: pointer;
    span {
      content: "";
      position: absolute;
      background-color: globals.$color-gray25;
      width: 60%;
      height: 2px;
      border-radius: 2px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%)
                rotate(45deg);
      &:nth-child(2) {
        transform: translate(-50%, -50%)
                  rotate(-45deg);
      }
    }
  }

  .selectlist-wrapper {
    border: 1px solid globals.$color-gray10;
    padding: 5px;
    height: 30vh;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .selectlist__item {
    height: 35px;
    line-height: 35px;
    cursor: pointer;
    text-overflow: ellipsis;
    overflow: hidden; 
    width: 100%; 
    white-space: nowrap;

  }

</style>