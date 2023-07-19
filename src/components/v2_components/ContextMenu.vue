<template>
  <div data-e2e="v2-context-menu">
    <div class="context-wrapper" ref="cmenu" @mouseleave="closeMenu">
      <div v-for="item in itemList">
        <slot v-if="item.active" :row="item" />
      </div>
    </div>
  </div>
</template>

<script>

  export default {
    name : 'ContextMenu',
    props : {
      visability : {
        type    : Boolean,
        default : false,
      },
      position : {
        type    : Object,
        default : () => ({
          x : 0,
          y : 0
        })
      },
      itemList  : {
        type    : Array,
        default : () => ([]),
      },
    },
    data: () => {
      return {
        cmenu  : null,
        width  : 0,
        height : 0,
      }
    },
    watch: {
      visability: function(newVal, oldVal) {
        if(!newVal) {
          this.cmenu.style      = '';
          this.cmenu.style.top  = '-3000px';
        }
      },
      position: function(newVal, oldVal) {
        this.setPosition();
      },
      itemList: function(newVal, oldVal) {
        this.setPosition();
      }
    },
    methods: {
      closeMenu() {
        this.$emit('mouseisout', {type:'mouseisout'});
      },
      setPosition() {
        this.cmenu.style      = '';
        if(this.position.x < (this.$store.state.windowSize._maxX - this.width) && this.position.y < (this.$store.state.windowSize._maxY - this.height)) { //TOP-LEFT
          this.cmenu.style.left  = this.position.x + 'px';
          this.cmenu.style.top   = this.position.y + 'px';
        } else if(this.position.x >= (this.$store.state.windowSize._maxX - this.width) && this.position.y < (this.$store.state.windowSize._maxY - this.height)) { // TOP-RIGHT
          this.cmenu.style.left  = this.position.x - this.width + 'px';
          this.cmenu.style.top   = this.position.y + 'px';
        } else if(this.position.x >= (this.$store.state.windowSize._maxX - this.width) && this.position.y >= (this.$store.state.windowSize._maxY - this.height)) { // BOTTOM-RIGHT
          this.cmenu.style.left  = this.position.x - this.width  + 'px';
          this.cmenu.style.top   = this.position.y - this.height + 'px';
        } else if(this.position.x < (this.$store.state.windowSize._maxX - this.width) && this.position.y >= (this.$store.state.windowSize._maxY - this.height)) { // BOTTOM-LEFT
          this.cmenu.style.left  = this.position.x + 'px';
          this.cmenu.style.top   = this.position.y - this.height + 'px';
        }
      }
    },
    mounted() {
      this.cmenu  = this.$refs.cmenu;
      this.width  = Math.round(this.cmenu.getBoundingClientRect().width);
      this.height = Math.round(this.cmenu.getBoundingClientRect().height);
    },
  }
</script>

<style lang="scss">

  @use "@/scss/includes/globals";

  .context-wrapper {
    position: fixed;
    display: block;
    top: -3000px;
    background-color: globals.$color-white;
    box-shadow: 0 2px 3px 0 rgba(0, 0, 0, .3);
    z-index: 10000;
  }

</style>