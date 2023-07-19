<script lang="ts">

import { useStore } from 'vuex';
import {
        defineComponent,
        inject,
        computed,
         } from 'vue';
import {
        AccountCircle
        } from "mdue";
import { IPCCCCallControl } from '../../../ipccc/js/callcontrol';


export default defineComponent({
    name: 'InteractionCard',
    components: {
        AccountCircle
    },
    props: {
        linedata : {
            type     : Object,
            default  : {}
        },
        hide : {
            type : Boolean,
            default : false
        },
    },
    setup(props) {
        const store:object | any     = useStore(),
            getFrameClass:Function   = inject('getFrameClass'),
            supervisor               = inject('supervisor'),
            cardLayout               = computed(() => {
            let _class = 'interaction-card';
            //   _class += (getFrameClass().indexOf('LM') !== -1 && !props.linedata.isConnected) ? ' interaction-card--minimized--active' : '';
            //   _class += (getFrameClass().indexOf('LM') !== -1 && props.linedata.isConnected)  ? ' interaction-card--minimized'         : '';
            _class += (props.linedata.isConnected)            ? ' interaction-card--active'            : '';
            _class += (props.linedata.isPBX)                  ? ' interaction-card--pbx-active'        : '';
            _class += (!store.state.commands.Wissel)          ? ' interaction-card--active'            : '';
            return _class;
        });

        const switchLine = () => {
            if (store.state.commands.Wissel) {
                if (!props.linedata.isConnected) {
                    IPCCCCallControl.CallWait();
                }
            }
        };

        const checkEmpty = (str) => {
            if(str) {
                str = str.trim();
                return (str == '') ? '-' : str;
            } else {
                return '-';
            }
        }

        const checkLineDataNumber = (number) => {
            if (number && number !== '' && props.linedata.number == store.state.loginSession.PhoneNumber.split('@')[0]) {
                return store.state.settings.interactioncard.iscallinglabel;
            } else {
                return checkEmpty(number);
            }
        }

        const getInitials = (fullName) => {
            let _initials  = '';
            if(fullName) {
                let _parts     = fullName.split(' '),
                    _l         = _parts.length;

                _initials += _parts[0].charAt(0).toUpperCase() + _parts[_l - 1].charAt(0).toUpperCase();
            } else {
                _initials = '';
            }

            return _initials;
        }

        return {
            store,
            cardLayout,
            switchLine, getInitials, checkLineDataNumber, checkEmpty,
            supervisor
        }
    }
});

</script>

<template>
    <div v-if="!hide && ((supervisor && linedata.index !== 1) || !supervisor)" :class="cardLayout" @click="switchLine" data-e2e="interaction-card">
        <!-- <div class="interaction-card--minipart" data-e2e="interaction-card-icon">
            <i class="interaction-card-icon">{{ getInitials(linedata.name) }}</i>
            <div class="interaction-card-time">{{ linedata.time }}</div>
        </div> -->
        <div class="interaction-card--bigpart">
            <AccountCircle class="interaction-card-icon" />
            <span v-if="linedata.isOutbound" class="interaction-card-number" data-e2e="interaction-card-dnis">{{ checkEmpty(linedata.dnis) }}</span>
            <span v-else class="interaction-card-number" data-e2e="interaction-number">{{ checkLineDataNumber(linedata.number) }}</span>
            <span class="interaction-card-time" data-e2e="interaction-card-time">{{ linedata.time }}</span>
            <span class="interaction-card-name" data-e2e="interaction-card-name">{{ checkEmpty(linedata.name) }}</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>

  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";
  @use "@/scss/includes/mixins";

.interaction-card {
  position: relative;
  padding: 20px 10px;
  border-bottom: 1px solid globals.$color-gray20;
  background-color: globals.$color-gray10;
  cursor: pointer;
  &-icon {
    position: absolute;
    width: 40px;
    height: 40px;
    display: block;
    color: globals.$color-gray80;
    // &:before {
    //   content: '\F120';
    //   position: absolute;
    //   @include font.font-icon();
    //   top: 50%;
    //   left: 50%;
    //   transform: translate(-50%, -50%);
    //   width: 40px;
    //   height: 40px;
    //   line-height: 38px;
    //   text-indent: 0px;
    //   overflow: hidden;
    //   color: tint(globals.$color-interaction, 50%);
    //   font-size: 38px;
    // }
  }
  &-number {
    display: block;
    float: left;
    padding-left: 42px;
    @include font.font-medium();
    color: globals.$color-gray80;
    font-size: .8rem;
    @include mixins.chopToLongText(80%);
    padding-bottom: 5px;
  }
  &-time {
    display: block;
    float: left;
    width: 20%;
    @include font.font-bold();
    font-size: .8rem;
    text-align: right;
    padding-bottom: 5px;
    color: globals.$color-interaction;
  }
  &-name {
    display: block;
    padding-left: 42px;
    color: globals.$color-gray60;
    font-size: 0.7rem;
    @include mixins.chopToLongText(100%);
  }
  .interaction-card--minipart {
    display: none;
  }
  .interaction-card--bigpart {
    position: relative;
  }
}

// .interaction-card--minimized {
//   width: 50px;
//   .interaction-card--minipart {
//     position: relative;
//     display: block;
//     width: 40px;
//     height: 40px;
//     margin-left: calc(360px - 58px);
//     .interaction-card-icon {
//       width: 40px;
//       height: 40px;
//       // :before {
//       //   text-indent: 2px;
//       // }
//     }
//     .interaction-card-time {
//       width: 100%;
//       color: globals.$color-gray60;
//       @include font.font-normal();
//       margin-top: 40px;
//       text-align: center;
//       font-size: 0.7rem;
//     }
//   }
//   .interaction-card--bigpart {
//     position: absolute;
//     top: 10px;
//     left: 380px;
//     width: 320px;
//     padding: 25px 15px;
//     border-bottom: none;
//     background-color: globals.$color-white;
//     box-shadow: 0 2px 3px 0 rgba(0,0,0,.3);
//     // &:before {
//     //   content: '';
//     //   position: absolute;
//     //   right: 100%;
//     //   top: 2px;
//     //   width: 0;
//     //   height: 0;
//     //   border-style: solid;
//     //   border-width: 0 30px 30px 0;
//     //   border-color: transparent globals.$color-black transparent transparent;
//     //   z-index: -1;
//     //   filter: blur(2px);
//     //   opacity: .2;
//     // }
//     &:after {
//       content: '';
//       position: absolute;
//       right: 100%;
//       top: 0;
//       width: 0;
//       height: 0;
//       border-style: solid;
//       border-width: 0 30px 30px 0;
//       border-color: transparent globals.$color-white transparent transparent;
//       z-index: 10;
//     }
//   }
//   &--active {
//     padding : 0;
//     .interaction-card-time {
//       padding-right: 11px;
//       padding-top: 50px;
//       padding-bottom: 0;
//     }
//     .interaction-card {
//       position: relative;
//     }
//     .interaction-card-icon {
//       right: 3px;
//       top: 10px;
//     }
//   }
// }

.interaction-card--active {
  background-color: globals.$color-white;
  cursor: default;
//   &-icon {
    // &:before {
    //   content: '\F3E4';
    // }
//   }
  &-time {
    color: globals.$color-secondary;
  }
  &-name {
    @include font.font-bold();
  }
}

.interaction-card--pbx-active {
  .interaction-card-icon {
    color: functions.tint(globals.$color-interaction, 50%);
  }
}

.interaction-card:not(.interaction-card--active) {
  .interaction-card-icon:before {
    color: globals.$color-gray35;
  }
  .interaction-card-time {
    color: globals.$color-gray35;
  }
  .interaction-card-number {
   color: globals.$color-gray35;
  }
  .interaction-card-name {
    color: globals.$color-gray35;
  }
}

</style>