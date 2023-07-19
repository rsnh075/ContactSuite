<template>
  <div data-e2e="change-password">
    <div class="detailscreen-wrapper detailscreen-wrapper--visable">
      <div class="detailscreen detailscreen--smaller">
        <div class="detailscreen__title detailscreen__title--medium">{{ $store.state.settings.pwdchange.dialogheader }}</div>
        <div class="separator-horizontal--full"></div>
        <p> {{ $store.state.settings.pwdchange.dialogbody }}</p>
        <div class="separator-horizontal--full"></div>
        <a class="userstatusmenu__list-last userstatusmenu__list-last--dialog" @click="logOut">{{ $store.state.settings.pwdchange.btnlabel }}</a>
      </div> 
    </div>  
    </div>
</template>

<script>
  
  export default {
    name: 'ChangePwd',
    inject: ["showLoader"],
    methods: {
      logOut() {
        this.$router.push({path : '/logout/'});
      }
    },
    mounted() {
      this.showLoader(false);
    }
  }
</script>

<style lang="scss" scoped>

  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions" as fn;

.userstatusmenu__list-last {
  position: relative;
  width: 100%;
  height: 40px;
  line-height: 40px; 
  display: block;
  padding-left: 1.4rem;
  color: globals.$color-unavailable;
  text-decoration: none;
  font-size: 15px;
  background-color: globals.$color-white;
  &:hover, &:active {
    background-color: globals.$color-gray5;
  }
  &:before {
    content: '';
    position: absolute;
    left: 10px;
    top: 0;
    right: 10px;
    height: 1px;
    display: block;
    border-top: 1px solid globals.$color-gray10;
    z-index: 10;
  }
  &:after {
    content: "\F425";
    position: relative;
    float: right;
    @include font.font-icon();
    width: 40px;
    height: 40px;
    margin-right: 10px;
    display: inline-block;
    color: globals.$color-unavailable;
    text-align: center;
    vertical-align: middle;
    font-size: 1.6rem;
  } 
  &--disabled {
    color: globals.$color-gray35;
    background-color: globals.$color-gray10;
    cursor: default;
    &:after {
      color: globals.$color-gray35;
    }
  }
  &--dialog {
    color: globals.$color-unavailable;
    border-top: none;
    cursor: pointer;
    float: right;
    width: auto;
    height: 40px;
    line-height: 40px;
    padding-left: 0;
    margin-right: -14px;
    &:hover {
      border-top: none;
      background-color: transparent;
      color: fn.tint(globals.$color-unavailable, 30%);
      &:after {
        color: fn.tint(globals.$color-unavailable, 30%);
      }
    }
    &:before {
      border-top: none;
    }
  }
}

</style>
