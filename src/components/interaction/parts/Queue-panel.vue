<template>
    <div data-e2e="queue-panel">
        <div class="interaction__queue" ref="desc">
            <a class="interaction__queue-icon" data-e2e="queue-panel-toggle" @click="accordeonStatus($event)">&#xF143;</a>
            <div class="interaction__queue-total">
                <span class="interaction__queue-total__icon">&#xF848;</span>
                <span class="interaction__queue-total__label">{{ $store.state.settings.queue.totalqueuelabel }}</span>
                <span class="interaction__queue-total__time">{{ maxQueueTime }}</span>
                <span class="interaction__queue-total__count">{{ totalCount }}</span>
            </div>
            <div class="interaction__queue-header">
                <span class="interaction__queue-header__icon" data-e2e="queue-panel-icon">&#xF00e;</span>
                <span class="interaction__queue-header__label" data-e2e="queue-panel-label">{{ $store.state.settings.queue.routinggroupheader }}</span>
                <span class="interaction__queue-header__time" data-e2e="queue-panel-time">{{ $store.state.settings.queue.maxtimeheader }}</span>
                <span class="interaction__queue-header__count" data-e2e="queue-panel-count">{{ $store.state.settings.queue.queueheader }}</span>
            </div>
            <div v-for="info in routingGroupInfoList" class="interaction__queue-subtotal" :key="info.RoutinggroupId">
                <span class="interaction__queue-subtotal__icon" v-html="getQueueIcon(info.IsOverflowFromGroupId)"></span>
                <span class="interaction__queue-subtotal__label">{{ info.RoutinggroupName }}</span>
                <span class="interaction__queue-subtotal__time">{{ showTime(info.QueuedMaxSec) }}</span>
                <span class="interaction__queue-subtotal__count">{{ info.QueueCount }}</span>
            </div>
        </div>
    </div>
</template>

<script>

/**
 *
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 1.0
 *
 * @todo
 * Test subscription order
 *
 */

import { defineComponent } from 'vue';
import { IPCCCDashboard } from '../../../ipccc/js/dashboard';
import { durationTime  }  from './../../../use/dateFunctions';

export default defineComponent({
    name: 'Queue-panel',
    props: [],
    data: () => {
        return {
        panelOpen            : false,
        queueCount           : 0,
        routingroupSubscribe : null,
        routingGroupInfoList : [],
        totalCount           : 0,
        maxQueueTime         : '00:00',
        arrowUp              : '&#xF143',
        arrowDown            : '&#xF140'
        }
    },
    watch: {
        '$route' (to, from) {
            if(to.path !== '/interaction/') {
                this.cleanUp();
            } else {
                this.subscribeToQueueCount();
            }
        },
        totalCount: function(val) {
            if(this.panelOpen)
                this.$refs.desc.style.maxHeight = this.mesureHeight(this.$refs.desc);
        }
    },
    methods: {
        subscribeToQueueCount() {
            IPCCCDashboard.Subscribe('DASHBOARD', this.queueCountSubscribe);
        },
        queueCountSubscribe(data) {
            this.routingGroupInfoList = data.Routinggroups.reduce((acc, rg) => {
                if(rg.QueueCount !== 0 && acc.findIndex(accrg => accrg.RoutinggroupId == rg.RoutinggroupId) == -1 )
                acc = [...acc, rg];
                return acc;
            }, []);
            this.countTotal();
            this.getMaxQueueTime();
        },
        showTime(t) {
            return durationTime(t, "mm:ss");
        },
        cleanUp() {
            IPCCCDashboard.Desubscribe('DASHBOARD', this.queueCountSubscribe);
        },
        getMaxQueueTime() {
            this.maxQueueTime = 0;

            this.routingGroupInfoList.forEach(el => {
                if(el.QueuedMaxSec > this.maxQueueTime)
                this.maxQueueTime = el.QueuedMaxSec;
            });

            this.maxQueueTime = durationTime(this.maxQueueTime, "mm:ss");
        },
        countTotal() {
            this.totalCount = this.routingGroupInfoList.reduce((acc, el) => acc + parseInt(el.QueueCount), 0);
        },
        mesureHeight(o) {
            o.style.position  = "absolute";
            o.style.width     = "316px";
            o.style.left      = "-10000px";
            o.style.maxHeight = "6000px";
            let _h            = o.scrollHeight;
            o.style.position  = "";
            o.style.left      = "";
            o.style.width     = "";
            return _h;
        },
        accordeonStatus(evt) {
        let _target   = evt.target;
            if(_target.tagName.toLowerCase() === 'a') {
                let _isOpen   = _target.parentElement.parentElement.querySelector('.interaction__queue').classList.contains('interaction__queue--open'),
                _descopen     = document.querySelectorAll('.interaction__queue--open');

                _descopen.forEach(desc => {
                    desc.removeAttribute("style");
                    desc.classList.remove('interaction__queue--open');
                    desc.parentElement.querySelector('.interaction__queue-icon').innerHTML = this.arrowUp;
                });

                if(!_isOpen) {
                    this.interActionQueEl = _target.parentElement.parentElement.querySelector('.interaction__queue')
                    this.$refs.desc.classList.add('interaction__queue--open');
                    this.panelOpen = true;
                    this.$refs.desc.style.maxHeight = this.mesureHeight(this.$refs.desc) + 60 + "px";
                    _target.innerHTML = this.arrowDown;
                } else {
                    this.panelOpen = false;
                }
            }
        },
        getQueueIcon(isOverflowFromGroupId) {
            return isOverflowFromGroupId > -1 ? '&#xF010' : '&#xF00e';
        },
    },
    mounted() {
        this.subscribeToQueueCount();
    },
    beforeUnmount() {
        this.cleanUp();
    }
});

</script>

<style lang="scss">

  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";

  .interaction__queue {
    border-top: 1px solid globals.$color-gray20;
    max-height: 53px;
    position: absolute;
    left: 8px;
    right: 8px;
    padding: 1rem 3px 0 3px;
    bottom: 0;
    transition: max-height .3s ease-in, padding .3s ease-in-out;
    background-color: globals.$color-white;
    &:before {
      background-color: globals.$color-white;
      top: -20px;
      content: "";
      position: absolute;
      left: 50%;
      width: 30px;
      transform: translate(-50%, 50%);
      height: 20px;
    }
    &--open {
      height: auto;
    }
    &-icon {
      position: absolute;
      top: -15px;
      right: 0;
      left: 0;
      height: 30px;
      text-align: center;
      line-height: 30px;
      cursor: pointer;
      font-family: 'Material Design Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 1.6rem;
      color: globals.$color-gray35;
    }
    .interaction__queue-total,
    .interaction__queue-header,
    .interaction__queue-subtotal {
      span {
        line-height: 1.75rem;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      &__icon {
        float: left;
        width: 10%;
        color: globals.$color-gray35;
        font-family: 'Material Design Icons';
        font-weight: normal;
        font-style: normal;
        font-size: 1.4rem;
      }
      &__label {
        float: left;
        width: 60%;
      }
      &__time {
        width: 20%;
        float: left;
      }
      &__count {
        width: 10%;
        float: right;
        text-align: right;
      }
    }
    &-total {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      padding: 0 4px 12px 4px;
      background-color: white;
      &__icon {
      }
      &__label {
        font-size: 1rem;
        font-family: 'Open Sans Bold', sans-serif;
        color: globals.$color-gray60;
      }
      &__time {
        font-family: 'Open Sans SemiBold', sans-serif;
        color: globals.$color-gray80;
        font-size: 0.9rem;
      }
      &__count {
        font-family: 'Open Sans SemiBold', sans-serif;
        color: globals.$color-gray80;
      }
    }
    &-header {
      width: 100%;
      padding: 0 1px 11px 2px;
      float: left;
      span {
        font-size: 0.9rem;
        font-family: 'Open Sans SemiBold', sans-serif;
        color: globals.$color-gray80;
      }
    }
    &-subtotal {
      width: 100%;
      padding: 0 1px 11px 2px;
      float: left;
      &__count {
          font-size: 0.9rem;
        font-family: 'Open Sans SemiBold', sans-serif;
        color: globals.$color-gray60;
        min-width: 26px;
        text-align: right;
      }
      &__time {
        font-size: 0.8rem;
      }
      &__label {
        font-size: 0.8rem;
        color: globals.$color-gray60;
      }
    }
    .interaction__queue-subtotal:last-of-type {
      margin-bottom: 40px;
    }
  }
</style>