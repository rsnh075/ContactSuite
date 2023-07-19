<template>
  <main :class="['main-wrapper', {'main-wrapper--menuopen' : (menuopen && asidevisible), 'main-wrapper--fullwidth' : !asidevisible}]" data-e2e="app-body">
    <router-view name="body"></router-view>
    <div class="snack-bar-view" v-if="$store.state.snackBarStatus.isVisible">
        <component :is='snackBarView'></component>
    </div>
  </main>
</template>

<script lang="ts">

  import {
           defineComponent,
           defineAsyncComponent
         }                 from 'vue';

  const CoachUser      = defineAsyncComponent(() => import('../snackbar/CoachUser.vue'));
  const SetUserStatus  = defineAsyncComponent(() => import('../snackbar/SetUserStatus.vue'));

  export default defineComponent({
    name: 'AppBody',
    props: {
      menuopen: {
        type : Boolean,
        default : false
      },
      asidevisible : {
        type : Boolean,
        default : true
      }
    },
    components: {
      CoachUser,
      SetUserStatus
    },
    data: () => {
      return {
        snackBarView          : null
      }
    },
    inject: ['showLoader'],
    methods: {
        loadSnackBar() {
        this.showLoader(true);
        this.snackBarView = null;
        let _d = this.$store.state.snackBarStatus;

        this.$nextTick().then(() => {
          if(_d.module) {
            this.snackBarView = _d.module;
            this.showLoader(false);
          } else {
            this.showLoader(false);
          }
        });
      }
    },
    mounted() {
        this.$store.watch(this.$store.getters.snackBarStatus, snackBarStatus => {
          this.loadSnackBar();
        });
    }
  });

</script>

<style lang="scss" scoped>
  @use "@/scss/includes/globals";
  .main-wrapper {
    position: absolute;
    top: 80px;
    right: 0;
    left: 80px;
    //bottom: 0;
    height: calc(100% - 80px);
    z-index: 100;
    // transition: left .2s ease-in-out;
    background-image: linear-gradient(#FAFAFA, #FAFAFA 160px, #F2F2F2 160px, #F2F2F2);
    transition: left 0.2s ease-in-out;
    &--menuopen {
      @media #{globals.$media_XL} {
        left: 246px;
      }
    }
    &--fullwidth {
      left: 0;
      @media #{globals.$media_XL} {
        left: 0;
      }
    }
  }

  .snack-bar-view {
      position: absolute;
      bottom: 0;
      z-index: 1250;
      display: block;
      width: 100%;
      min-height: 140px;
      background: white;
      border-top: 1px solid #ccc;
  }
</style>
