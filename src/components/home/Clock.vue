<template>
  <div class="clock-wrapper" data-e2e="clock">
    <div class="clock__time" v-html="theTime"></div>
    <div class="clock__date">{{ theDate }}</div>
  </div>
</template>

<script lang="ts">

import { defineComponent,
        onMounted,
        ref,
        watch }         from 'vue';
import { useStore }       from 'vuex';

export default defineComponent({
    name: 'Clock',
    props: {
      activate: {
        type : Boolean,
        default : true
      }
    },
    setup(props) {
        const store         = useStore(),
            theTime         = ref('00:00:00'),
            theDate         = ref('--');

        let timer   = 0;

        const currentTime = ():void => {
            const _date = new Date();
            let _h:number|string    = _date.getHours(),
                _m:number|string    = _date.getMinutes(),
                _s:number|string    = _date.getSeconds();

            _h = (_h < 10) ? `0${_h}` : _h;
            _m = (_m < 10) ? `0${_m}` : _m;
            _s = (_s < 10) ? `0${_s}` : _s;

            theTime.value = `${_h}:${_m}<span>:${_s}</span>`;

            timer = setTimeout(currentTime, 1000);
        }

      watch(() => props.activate, (newVal, oldVal) => {
        newVal !== oldVal && props.activate ? currentTime() : clearInterval(timer);
      })

      onMounted(() => {
        currentTime();
        theDate.value = new Date().toLocaleDateString(store.state.browserLanguage, {
                weekday : 'long',
                year    : 'numeric',
                month   : 'long',
                day     : 'numeric'
            });
      })

      return {
        theTime, theDate
      }

    }
  });

</script>

<style lang="scss" scoped>

  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";

  .clock-wrapper {
    margin: 0 auto;
    padding: 0 10px;
    width: 100%;
    max-width: 980px;
  }

  .clock__time {
    position: relative;
    text-align: right;
    color: globals.$color-gray40;
    padding-top: 4.5rem;
    font-size: 48px;
    @include font.font-light();
    user-select: none;
  }
  .clock__date {
    position: relative;
    text-align: right;
    color: globals.$color-gray40;
    font-size: 16px;
    @include font.font-normal();
    user-select: none;
  }

</style>

<style lang="scss">
  @use "@/scss/includes/font";

  .clock__time span  {
    font-size: 24px;
    vertical-align: super;
    @include font.font-normal();
  }

</style>