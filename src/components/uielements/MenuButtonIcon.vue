<template>
  <div class="menubuttonicon__item" @click="clickedIconButton" data-e2e="menu-button-icon">
    <div class="menubuttonicon__item-icon" :class="iconClass"></div>
    <div v-if="icontitle" class="menubuttonicon__item-title">{{ icontitle }}</div>
    <div v-if="iconparagraph" class="menubuttonicon__item-paragraph">{{ iconparagraph }}</div>
  </div>
</template>

<script>
  /**
   *
   * Menu button
   * menubuttonicon__item-icon-- + iconclass
   *
   * @author Erik Rosenhart <rsnh075@gmail.com>
   *
   * @version 1.0
   *
   * @todo
   *
   *
   */


  export default {
    name: 'MenuButtonIcon',
    props : {
      iconclass : {
        type    : String,
        default : '',
      },
      icontitle : {
        type    : String,
        default : '',
      },
      iconparagraph : {
        type    : String,
        default : '',
      }
    },
    data: () => {
      return {
      }
    },
    computed: {
      iconClass() {
        return 'menubuttonicon__item-icon--' + this.iconclass;
      }
    },
    methods: {
      clickedIconButton() {
        this.$emit('clickediconbutton', this.iconclass);
      }
    },
    mounted() {
    }
  }
</script>

<style lang="scss" scoped>
  @use "@/scss/includes/menubuttonicon";
</style>