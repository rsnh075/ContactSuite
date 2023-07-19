<script lang="ts">

/**
 *
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 1.0
 *
 * @todo
 * add a condition for Push.Enable. And a notification when notification is not granted.
 *
 */

import { Support }              from '../../ipccc/lib/support.js';
import {
        defineComponent,
        inject,
        onMounted,
        onUnmounted,
        ref
        }                        from 'vue';
import { useStore }             from 'vuex';
import Clock                    from './Clock.vue';
import IdentityWidget           from './widgets/IdentityWidget.vue';
import DeviceWidget             from './widgets/DeviceWidget.vue';
import NumberWidget             from './widgets/NumberWidget.vue';
import AgentWidget              from './widgets/AgentWidget.vue';
import AsrWidget                from './widgets/AsrWidget.vue';
import CallBarWidget            from './widgets/CallBarWidget.vue';

export default defineComponent({
    name: 'Home',
    components: {
        Clock,
        IdentityWidget,
        DeviceWidget,
        NumberWidget,
        AgentWidget,
        AsrWidget,
        CallBarWidget
    },
    setup() {
        const store:object | any       = useStore(),
            grid                     = ref(null),
            showLoader               = inject('showLoader') as Function;

        let   fillGaps:boolean         = false;

        const fitMasonryItems = () => {
            let _gridRowHeight     = parseInt(window.getComputedStyle(grid.value).getPropertyValue('grid-auto-rows')),
                _gridCollWidthVal  = window.getComputedStyle(grid.value).getPropertyValue('grid-auto-columns'),
                _gridCollWidth     = parseInt( _gridCollWidthVal),
                _gridRowGap        = parseInt(window.getComputedStyle(grid.value).getPropertyValue('grid-row-gap')),
                _leftPosGrid       = parseInt(grid.value.getBoundingClientRect().left),
                _lastspan          = 0;

            Array.from(grid.value.children).forEach((item:HTMLElement, count) => {
                let _gridRowSpan  =  Math.ceil((item.children[0].getBoundingClientRect().height+_gridRowGap)/(_gridRowHeight+_gridRowGap));

                if(fillGaps) {
                    if(parseInt(item.getBoundingClientRect().left) - _leftPosGrid === 0) {
                        item.style['grid-row-end'] = `span ${_gridRowSpan}`;
                        _lastspan = _gridRowSpan;
                    } else {
                        if(_lastspan < _gridRowSpan) { // not first item in row
                            item.style['grid-row-end'] = `span ${_gridRowSpan}`;
                            grid.value.children[count-1].style['grid-row-end'] = `span ${_gridRowSpan}`;
                            if(parseInt(grid.value.children[count-1].getBoundingClientRect().left) - _leftPosGrid > 0) { // is it the 3th one do also the first
                                grid.value.children[count-2].style['grid-row-end'] = `span ${_gridRowSpan}`;
                            }
                            _lastspan = _gridRowSpan;
                        } else if(_lastspan > _gridRowSpan) {
                            item.style['grid-row-end'] = `span ${_lastspan}`;
                        } else {
                            _lastspan = 0;
                        }
                    }

                    if(_gridCollWidthVal.indexOf('%')) {
                        let _w        = (_gridCollWidth / 100) * grid.value.offsetWidth,
                            _cw       = Math.ceil((item.children[0].getBoundingClientRect().width));

                        if(_w < _cw) {
                            item.style['grid-column-end'] = `span ${Math.ceil(_cw / _w)}`;
                        }
                    }
                } else {
                    item.style['grid-row-end'] = `span ${_gridRowSpan}`;
                }

            });
        }

        const handleKeyDown = (evt:KeyboardEvent):void => {
            if(evt.altKey && evt.key === 'a')
            fillGaps = !fillGaps;

            fitMasonryItems();
        }

      onMounted(() => {
        Support.SetLocation("CS: Home page");
        if(
            store.getters.getPermission('ModuleInteractie') ||
            store.getters.getPermission('Servicenummers') ||
            store.getters.getPermission('ASRProviderWidget')
        ) {
            fitMasonryItems();
            document.addEventListener('keydown', handleKeyDown, false);
        }
        showLoader(false);
      });

        onUnmounted(() => {
            if(
                store.getters.getPermission('ModuleInteractie') ||
                store.getters.getPermission('Servicenummers') ||
                store.getters.getPermission('ASRProviderWidget')
            ) {
                document.removeEventListener('keydown', handleKeyDown, false);
            }
        });

        return {
            store, grid
        }

    }
});

</script>

<template>
    <div :class="['home-wrapper', {'home-wrapper--isactive' : store.getters.getHomeState()}]" data-e2e="home">
        <clock :activate="store.getters.getHomeState()" />
        <div class="widget-grid-wrapper">
            <ol class="widget-grid" ref="grid">
                <li class="widget-container widget-container--settings" v-if="store.getters.getPermission('ModuleInteractie')">
                    <identity-widget />
                </li>
                <li class="widget-container widget-container--call-bar" v-if="store.getters.getPermission('ModuleInteractie')">
                    <call-bar-widget />
                </li>
                <li class="widget-container widget-container--settings" v-if="store.getters.getPermission('ModuleInteractie')">
                    <device-widget />
                </li>
                <li v-if="store.getters.getPermission('Servicenummers')" class="widget-container widget-container--availability">
                    <number-widget />
                </li>
                <li class="widget-container widget-container--agent">
                    <agent-widget />
                </li>
                <li v-if="store.getters.getPermission('ASRProviderWidget')" class="widget-container widget-container--asr">
                    <asr-widget />
                </li>
            </ol>
        </div>
    </div>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

.home-wrapper {
    position: absolute;
    top: 80px;
    left: -100px;
    bottom: 0;
    right: 110%;
    z-index: 450;
    background-image: linear-gradient(#FAFAFA, #FAFAFA 160px, #F2F2F2 160px, #F2F2F2);
    text-align: center;
    overflow: hidden;
    &--isactive {
        left: 0;
        right: 0;
        overflow: visible;
    }
}

.widget-grid-wrapper {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 20px;
    height: calc(100% - 180px);
    overflow-y: overlay;
    padding-right: 20px;
    width: min(64ch, 100% - 4rem);
    margin: 20px auto 20px auto;
    @media #{globals.$media_M} {
        width: 670px;
        margin: initial;
    }
    @media #{globals.$media_L} {
        width: 1000px;
        margin: initial;
    }
    max-width: 1000px;
}
.widget-grid {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-auto-rows: 20px;
    grid-auto-columns: 33.333%;
    grid-auto-flow: row dense;
}

.widget-container {
    position: relative;
    float: left;
    background-color: globals.$color-white;
    border-radius: 3px;
    box-shadow: 0 2px 3px 0 rgba(0,0,0,.15);
    grid-column-end: span 1;

    &:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 5px;
        border-radius: 3px 0 0 3px;
        z-index: 1;
    }

    &--settings:after {
        background-color: globals.$color-settings;
    }

    &--call-bar:after {
        background-color: globals.$color-interaction;
    }

    &--availability:after {
        background-color: globals.$color-availability;
    }

    &--agent:after {
        background-color: globals.$color-performance;
    }

    &--asr:after {
        background-color: globals.$color-reporting;
    }

    div {
        float: left;
        padding: 8px 15px;
        text-align: left;
    }
}

</style>