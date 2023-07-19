<template>
    <aside :class="['aside-wrapper', {'aside-wrapper--open' : menuopen, 'aside-wrapper--closed' : menuItems.length === 0}]" :style="menuColorStyle" data-e2e="app-aside">
        <header class="aside__header">
            <div :class="['aside__header-label', {'aside__header-label--hidden' : !menuopen}]">{{  store.state.navigation.menuItems[selectedmainmenuitem].label[store.state.browserLanguage] }}</div>
            <arrow-button :class="['aside-toggler', {'aside-toggler--close' : !menuopen}]" :status="menuopen" @click="toggleAside"/>
        </header>
        <div :class="['aside__body', {'aside__body--scrollbarnotvisible' : !menuopen}]">
            <a v-for="(item, index) in menuItems" :key="index" :id="'asidemenu__item' + index"
            @click.stop="loadApp(item.url, index)"
            @mouseover="calcSubmenuTop(index, item.subMenu.length > 0)"
            @mouseleave="undoSubmenuTop(index, item.subMenu.length > 0)"
            :class="[
                'asidemenu__item', {'asidemenu__item--active' : (activeIndex === index && item.subMenu.length === 0),
                'asidemenu__item--hassub': item.subMenu.length > 0,
                'asidemenu__item--subactive': (activeIndex === index && item.subMenu.length > 0)}
            ]"
            >
                <div class="asidemenu__item-innerwrapper">
                    <menu-right v-if="item.subMenu.length > 0 && activeIndex !== index" class="submenuTracker" />
                    <menu-down v-else-if="item.subMenu.length > 0 && activeIndex === index" class="submenuTracker" />
                    <component :is="item.Icon" :style="(activeIndex === index && item.subMenu.length === 0) ? iconColorStyle : (activeIndex === index && item.subMenu.length !== 0) ? 'fill:#666' : ''" class="menuItemIcon"/>
                    <span :class="[{'active-label' : (activeIndex === index)}]" :style="(activeIndex === index && item.subMenu.length === 0) ? labelColorStyle : 'color:#666'">{{ item.label[store.state.browserLanguage] }}</span>
                </div>

                <div v-if="item.subMenu.length > 0" :class="['asidemenu__item-submenu', {'asidemenu__item-submenu-moretotheright' : menuopen}]">
                    <h2 class="asidemenu__item-submenu-header">{{ item.label[store.state.browserLanguage] }}</h2>
                    <a v-for="(subItem, index2) in item.subMenu" :key="index2"
                    @click.stop="loadApp(subItem.url, index, index2)"
                    :class="[
                        'asidemenu__item-submenu-item',
                        {'asidemenu__item-submenu-item--active' : activeSubIndex === `${index}-${index2}`}
                    ]"
                    >
                        <component :is="subItem.Icon" :style="(activeSubIndex === `${index}-${index2}`) ? iconColorStyle : ''" class="menuItemIcon menuItemIcon--submenu"/>
                        <span :class="[{'active-label' : activeSubIndex === `${index}-${index2}`}]" :style="(activeSubIndex === `${index}-${index2}`) ? labelColorStyle : ''">{{ subItem.label[store.state.browserLanguage] }}</span>
                    </a>
                </div>

            </a>
        </div>
    </aside>
</template>

<script lang="ts">

import { defineComponent, ref, watch, nextTick }         from 'vue';
import { useStore }           from 'vuex';
import { useRouter }          from 'vue-router';
import ArrowButton            from '../uielements/ArrowButton.vue';

import {
        Account, AccountMultiple, AccountSwitch, Dialpad, ClockOutline, DesktopMacDashboard,
        ChartLine, PhoneVoip, Domain, History, Airballoon, PhoneOutgoing, ViewGrid, ClockStart, Speedometer, Music, ClockTimeFourOutline, ClipboardTextOutline, CallSplit,
        AccountDetails, AccountArrowRight, ArrowDecision, Bullhorn, TuneVertical, TableLarge,
        ShieldAccount, PhoneClassic, DesktopTower, OfficeBuilding, CashMultiple, FormatListChecks, CloudOutline, TextSubject, Monitor, Certificate, Shield, Download, Tools, DatabaseCheck, BriefcaseEdit, EmailPlus, HelpCircle,
        ConsoleNetwork, Lock, LockAlert, Key, MenuRight, MenuDown, Binoculars, RecordCircleOutline
        }                      from 'mdue';

export default defineComponent({
    name: 'AppAside',
    props: {
        menuopen: {
            type : Boolean,
            default : true
        },
        selectedmainmenuitem : {
            type : Number,
            default : 0
        },
        selectedsidemenuitem : {
            type : Object,
            default: {
                sideMenuIx: -1,
                sideSubMenuIx: -1
            }
        }
    },
    components: {
        ArrowButton,
        Account,
        AccountMultiple,
        AccountSwitch,
        ClockStart,
        Speedometer,
        Dialpad,
        ClockOutline,
        DesktopMacDashboard,
        ChartLine,
        PhoneVoip,
        Domain,
        History,
        Airballoon,
        PhoneOutgoing,
        ViewGrid,
        AccountDetails,
        AccountArrowRight,
        ArrowDecision,
        Bullhorn,
        TuneVertical,
        TableLarge,
        Music,
        ShieldAccount,
        PhoneClassic,
        DesktopTower,
        OfficeBuilding,
        CashMultiple,
        FormatListChecks,
        CloudOutline,
        TextSubject,
        Monitor,
        Certificate,
        Shield,
        Download,
        Tools,
        DatabaseCheck,
        BriefcaseEdit,
        EmailPlus,
        HelpCircle,
        ClockTimeFourOutline,
        ClipboardTextOutline,
        CallSplit,
        ConsoleNetwork,
        Lock,
        LockAlert,
        Key,
        MenuRight,
        MenuDown,
        Binoculars,
        RecordCircleOutline
    },
    setup(props, { emit }) {
        const   store:object | any      = useStore(),
                router                  = useRouter(),
                menuIsOpen              = ref<Boolean>(props.menuopen),
                menuItems               = ref(store.state.navigation.menuItems[props.selectedmainmenuitem].appMenu),
                menuColorStyle          = ref(`border-left-color:#${store.state.navigation.menuItems[props.selectedmainmenuitem].appColor}`),
                iconColorStyle          = ref(`fill:#${store.state.navigation.menuItems[props.selectedmainmenuitem].appColor}`),
                labelColorStyle         = ref(`color:#${store.state.navigation.menuItems[props.selectedmainmenuitem].appColor}`),
                activeIndex             = ref(0),
                activeSubIndex          = ref('-1');

        const toggleAside = ():void => {
            menuIsOpen.value = !menuIsOpen.value;
            emit('statuschange', { status: menuIsOpen.value });
        };

        const loadApp = (url:string, index:number, subindex:number = -1):void => {
            activeIndex.value    = index;
            activeSubIndex.value = `${index}-${subindex}`;
            if (subindex === -1 && menuItems.value[index].subMenu.length > 0) {
                url = menuItems.value[index].subMenu[0].url;
                activeSubIndex.value = `${index}-0`; //set first sidesubmenu
            }
            router.push({path: url});
            store.commit('SET_NAV_ITEM', url);
            if (document.querySelector<HTMLElement>('#asidemenu__item' + index + ' .asidemenu__item-submenu')) {
                document.querySelector<HTMLElement>('#asidemenu__item' + index + ' .asidemenu__item-submenu').style.top = '0px';
            }
        };

        watch(() => props.menuopen, (newVal, oldVal) => {
            menuIsOpen.value = newVal;
        });

        watch(() => props.selectedmainmenuitem, (newVal, oldVal) => {
            if(newVal !== oldVal) {
                menuColorStyle.value  = `border-left-color:#${store.state.navigation.menuItems[props.selectedmainmenuitem].appColor}`;
                iconColorStyle.value  = `fill:#${store.state.navigation.menuItems[props.selectedmainmenuitem].appColor}`;
                labelColorStyle.value = `color:#${store.state.navigation.menuItems[props.selectedmainmenuitem].appColor}`,
                menuItems.value       = store.state.navigation.menuItems[newVal].appMenu;
                activeIndex.value     = 0; //set first sidemenu
                activeSubIndex.value  = `0--1`;
                if (menuItems.value[0]?.subMenu.length > 0) {
                    activeSubIndex.value = `0-0`; //set first sidesubmenu
                }
            }
        });

        watch(() => props.selectedsidemenuitem, (newVal, oldVal) => {
            activeIndex.value = newVal.sideMenuIx;
            activeSubIndex.value = newVal.sideSubmenuIx == -1 ? '-1' : `${activeIndex.value}-${newVal.sideSubmenuIx}`;
        });

        // watch(() => activeIndex.value, newVal => {
        //     console.log('activeIndex', newVal);
        // });

        const calcSubmenuTop = (elId:number, hasSumbmenu:boolean) => {
            if (!hasSumbmenu || elId == activeIndex.value) {
                return;
            }
            let _top = document.getElementById('asidemenu__item' + elId).getBoundingClientRect().top;
            document.querySelector<HTMLElement>('#asidemenu__item' + elId + ' .asidemenu__item-submenu').style.top = Math.floor(_top) + 'px';
            nextTick(() => {
                if (document.querySelector<HTMLElement>('#asidemenu__item' + elId + ' .asidemenu__item-submenu').getBoundingClientRect().bottom >
                    document.body.getBoundingClientRect().bottom)
                {
                    document.querySelector<HTMLElement>('#asidemenu__item' + elId + ' .asidemenu__item-submenu').style.top = Math.floor(_top) +
                    document.getElementById('asidemenu__item' + elId).clientHeight -
                    document.querySelector<HTMLElement>('#asidemenu__item' + elId + ' .asidemenu__item-submenu').clientHeight + 'px';
                }
            });
        };

        const undoSubmenuTop = (elId, hasSumbmenu) => {
            if (!hasSumbmenu) {
                return;
            }
            document.querySelector<HTMLElement>('#asidemenu__item' + elId + ' .asidemenu__item-submenu').style.top = '0px';
        }

        return {
            store,
            toggleAside, menuItems, menuColorStyle, iconColorStyle, labelColorStyle,
            activeIndex, activeSubIndex,
            calcSubmenuTop, undoSubmenuTop,
            loadApp
        }
    }
});

</script>

<style lang="scss" scoped>

@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

.aside-wrapper {
    position: absolute;
    top: 80px;
    left: 0;
    //bottom: 0;
    height: calc(100% - 80px);
    width: 80px;
    z-index: 300;
    border-right: 1px solid globals.$color-gray20;
    border-left: 3px solid transparent;
    background-color: globals.$color-white;
    transition: width .2s ease-in-out,
                left .3s ease-in-out;
    &--open {
        width: 246px;
    }
    &--closed {
        left: -3px;
        width: 0px;
    }
}

.aside__header {
    position: relative;
    display: block;
    height: 50px;
    line-height: 50px;
    padding: 0 40px 0 18px;
    font-size: 1.1em;
    color: globals.$color-gray80;
    @include font.font-medium();
    margin-left: 0;
    transition: margin-left .1s ease-in-out .1s;
    &:after {
        content: '';
        position: absolute;
        right: 15px;
        left: 15px;
        bottom: 0;
        height: 1px;
        background-color: globals.$color-gray10;
    }
}

.aside__body {
    overflow-y: auto;
    &--scrollbarnotvisible::-webkit-scrollbar {
        display: none;
    }
    height: calc(100% - 50px);
}

.aside__header-label {
    overflow: hidden;
    opacity: 1;
    transition: opacity .2s ease-in-out;
    &--hidden {
        opacity: 0;
    }
}

.asidemenu__item {
    position: relative;
    margin-left: 0;
    display: block;
    width: 100%;
    cursor: pointer;
    user-select: none;
}

.asidemenu__item-innerwrapper {
    position: relative;
    height: 45px;
    line-height: 45px;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.submenuTracker {
    position: absolute;
    top: 12px;
    left: -3px;
    width: 21px;
    height: 21px;
    fill: globals.$color-gray30;
}

.menuItemIcon {
    display: block;
    float: left;
    width: 21px;
    height: 21px;
    margin: 12px 10px 10px 16px;
    fill: globals.$color-gray30;
}

.aside-wrapper {
    .menuItemIcon {
        margin-left: 30px;
        // transition: margin-left .2s ease-in-out;
    }
    .submenuTracker {
        left: 7px;
        // transition: left .2s ease-in-out;
    }
    .asidemenu__item .asidemenu__item-innerwrapper {
        text-overflow: clip;
        span {
            opacity: 0;
            transition: opacity .2s ease-in-out;
        }
        .asidemenu__item-submenu .asidemenu__item-submenu-item {
            text-overflow: clip;
            span {
                opacity: 0;
            }
        }
    }
    &--open {
        .menuItemIcon {
            margin-left: 20px;
        }
        .submenuTracker {
            left: 2px;
        }
        .asidemenu__item .asidemenu__item-innerwrapper {
            span {
                opacity: 1;
            }
        }
    }
    &--closed .aside__header {
        margin-left: -50px;
    }

}

.asidemenu__item-submenu {
    position: fixed;
    top: 0;
    left: -3000px;
    border-radius: 0 3px 3px 3px;
    box-shadow: 0 0 10px 0 rgb(0, 0, 0, .2);
    background-color: globals.$color-white;
    z-index: 10;
    opacity: 0;
    overflow: hidden;
    transition: opacity .2s ease-in;
}

.asidemenu__item--hassub {
    position: relative;
    &:hover {
        .asidemenu__item-submenu {
            position:fixed;
            left: 80px;
            top: 10px;
            opacity: 1;
            z-index: 20;
            width: 300px;
            &-moretotheright {
                left: 220px;
            }
        }
    }
}

.asidemenu__item-submenu-header {
    @include font.font-medium();
    font-size: .9em;
    padding: 5px 0 0 10px;
    height: 35px;
    line-height: 35px;
}

.asidemenu__item-submenu-item {
    position: relative;
    display: block;
    height: 45px;
    line-height: 45px;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
    font-size: .9em;
    user-select: none;
    span {
        opacity: 1;
    }
    .menuItemIcon {
        margin-left: 10px;
        margin-top: 15px;
        width: 17px;
        height: 17px;
    }
    &:hover {
        background-color: globals.$color-gray5;
    }
    &--active {
        background-color: globals.$color-gray5;
    }
}

.asidemenu__item--subactive,
.asidemenu__item--subactive:hover {
    //background-color: globals.$color-gray5;
    cursor: default;
    .asidemenu__item-submenu {
        position: relative;
        left: 0;
        top: 0;
        opacity: 1;
        width: auto;
        box-shadow: none;
        border-radius: 0;
        background-color: globals.$color-gray2;
    }
    .asidemenu__item-submenu-item {
        padding-left: 16px;
        padding-right: 5px;
    }
    .asidemenu__item-submenu-header {
        display: none;
    }
}

.asidemenu__item--subactive .asidemenu__item-innerwrapper {
    background-color: globals.$color-gray5;
}

.aside-wrapper .asidemenu__item--subactive .asidemenu__item-submenu .asidemenu__item-submenu-item {
    text-overflow: clip;
    span {
        opacity: 0;
    }
    .menuItemIcon {
        margin-left: 15px;
        margin-right: 6px;
    }
}

.aside-wrapper--open .asidemenu__item--subactive .asidemenu__item-submenu .asidemenu__item-submenu-item {
    text-overflow: ellipsis;
    span {
        opacity: 1;
    }
}

.aside-toggler {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 10;
    cursor: pointer;
    margin: 5px;
    &--close {
        right: 12px;
    }
}

.active-label {
    @include font.font-medium();
}

</style>