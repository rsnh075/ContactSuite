<script lang="ts">

/**
   *
   * @author Erik Rosenhart <rsnh075@gmail.com>
   *
   * @version 1.0
   *
   * @todo
   * requestNavigation to subnav item
   *
   *
   */

import { useStore }             from 'vuex';
import { useRouter }            from 'vue-router';
import { defineComponent,
         ref,
         watch,
         onMounted,
         onUnmounted,
         computed,
         inject,
         nextTick,
        }                       from 'vue';
import {
        Home,
        Headset,
        Tune,
        ChartLine,
        Filmstrip,
        DirectionsFork,
        HelpCircle,
        Cog,
        ChevronDown
       }                        from 'mdue';

export default defineComponent({

name: 'AppMainMenu',
components: {
	Home,
	Headset,
	Tune,
	ChartLine,
	Filmstrip,
	DirectionsFork,
	Cog,
	HelpCircle,
	ChevronDown
},
setup() {
	const store:object | any             = useStore(),
		router                           = useRouter(),
		// items                            = ref<Array<SVGElement>>([]),
		showHome:Function                = inject('showHome'),
		showInteraction:Function         = inject('showInteraction'),
		hasActiveLine                    = ref(computed(() => store.state.navigation.hasActiveLine)),
		setSelectedMainMenuItem:Function = inject('setSelectedMainMenuItem'),
		setSelectedSideMenuItem:Function = inject('setSelectedSideMenuItem');

	let activeLabel                 = ref<string>(''),
		activeCode                  = ref<string>(''),
		activeColor                 = ref<string>(''),
		mobilemenuOpen              = ref<boolean>(false);

	let onInteraction = false;
	const showPulse = (item: any): boolean => item.Code === 'ModuleInteractie' && hasActiveLine.value && !onInteraction;

	// see if another component wants to navigate somewhere
	watch(() => store.state.navigation.requestNavigation, (url) => {
        if (url === '') return;
		const parts = url.split('/').filter(i => i);
		const sidemenu = parts.length > 0 ? parts[1] : '';
		const sidesubmenu = parts.length > 1 ? parts[2] : '';
        loadApp(`/${parts[0]}/`, sidemenu, sidesubmenu);
		store.state.navigation.requestNavigation = '';
	});

	const setMenuActive = (itemIndex:number):void => {
		activeLabel.value    = store.state.navigation.menuItems[itemIndex].label[store.state.browserLanguage];
		activeCode.value     = store.state.navigation.menuItems[itemIndex].Code;
		activeColor.value    = store.state.navigation.menuItems[itemIndex].appColor;
		setSelectedMainMenuItem(itemIndex);
		mobilemenuOpen.value = false;
	};

	const loadApp = (url:string, sidemenu: string = '', sidesubmenu: string = '') => {
        // console.log('loadApp: ', url, sidemenu, sidesubmenu);

        let index = store.state.navigation.menuItems.findIndex(item => item.url === url);

		if(index === -1 || store.state.navigation.menuItems.length < (index + 1)) {
			console.error(`Can't navigate to url '${url}', (index ${index})`);
			return;
		}

		const navItem = store.state.navigation.menuItems[index];
		store.state.navigation.activeApp = index;
        setMenuActive(index); //NextTick ensures AppAside is working with the correct appMenu
        nextTick(() => {
            onInteraction = navItem.url === '/interaction/';

            if(navItem.url === '/home/') {
                showHome(true);
                showInteraction(false);
                router.push({path: '/home/'});
                resetSidemenuIndexObj();
            } else if(onInteraction) {
                showInteraction(true, 'maximized');
                router.push({path: navItem.url});
                resetSidemenuIndexObj();
            } else {
                //ToDo refactor
                const navHistory = store.getters.getNavHistory();
                const navHistoryIx = navHistory.findIndex(el => el.startsWith(navItem.url));
                let path;

                if (navHistoryIx > -1) { // been here before, open previous sidemenu
                    path = navHistory[navHistoryIx];

                    if (sidemenu === '') { // no requestNavigation => check if there is a sidemenu and or sidesubmenu
                        const menuItems = navHistory[navHistoryIx].slice(1, -1).split('/');
                        if (menuItems.length > 1) {
                            sidemenu = menuItems[1];
                            if (menuItems.length > 2) {
                                sidesubmenu = menuItems[2];
                            }
                        }
                        if (navItem.appMenu.length > 0) {
                            let sideIx    = navItem.appMenu.findIndex(s => s.url === `${url}${sidemenu}/`);
                            let sideSubIx = sideIx !== -1 && sidesubmenu !== '' ? navItem.appMenu[sideIx].subMenu.findIndex(s => s.url === `${url}${sidemenu}/${sidesubmenu}/`) : -1;
                            if (sideIx === -1) sideIx = 0;

                            setSelectedSideMenuItem(sideIx, sideSubIx);
                        }
                    } else { // requestNavigation
                        let sideIx    = navItem.appMenu.findIndex(s => s.url === `${url}${sidemenu}/`);
                        let sideSubIx = sideIx !== -1 && sidesubmenu !== '' ? navItem.appMenu[sideIx].subMenu.findIndex(s => s.url === `${url}${sidemenu}/${sidesubmenu}/`) : -1;
                        if (sideIx !== -1) path = `${url}${sidemenu}/`;
                        if (sideIx !== -1 && sidesubmenu !== '') path = `${url}${sidemenu}/${sidesubmenu}/`;

                        setSelectedSideMenuItem(sideIx, sideSubIx);
                    }


                } else { // not been here before, open first sidemenu or sidesubmenu;
                    path = navItem.url;

                    if (sidemenu === '') { // no requestNavigation => check if there is a sidemenu and or sidesubmenu
                        if (navItem.appMenu.length > 0) {
                            sidemenu = navItem.appMenu[0].url.slice(1, -1).split('/')[1];
                            path = navItem.appMenu[0].url;
                            if (navItem.appMenu[0].subMenu.length > 0) {
                                sidesubmenu = navItem.appMenu[0].subMenu[0].url.slice(1, -1).split('/')[2];
                                path = navItem.appMenu[0].subMenu[0].url;
                            }

                            let sideIx    = navItem.appMenu.findIndex(s => s.url === `${url}${sidemenu}/`);
                            let sideSubIx = sideIx !== -1 && sidesubmenu !== '' ? navItem.appMenu[sideIx].subMenu.findIndex(s => s.url === `${url}${sidemenu}/${sidesubmenu}/`) : -1;
                            sideIx = sideIx === -1 ? sideIx = 0 : sideIx;

                            setSelectedSideMenuItem(sideIx, sideSubIx);
                        }
                    } else { // requestNavigation
                        let sideIx    = navItem.appMenu.findIndex(s => s.url === `${url}${sidemenu}/`);
                        let sideSubIx = sideIx !== -1 && sidesubmenu !== '' ? navItem.appMenu[sideIx].subMenu.findIndex(s => s.url === `${url}${sidemenu}/${sidesubmenu}/`) : -1;
                        if (sideIx !== -1) path = `${url}${sidemenu}/`;
                        if (sideIx !== -1 && sidesubmenu !== '') path = `${url}${sidemenu}/${sidesubmenu}/`;

                        setSelectedSideMenuItem(sideIx, sideSubIx);
                    }

                }

                // console.log('sidemenu', sidemenu);
                // console.log('sidesubmenu', sidesubmenu);
                // console.log('path', path);

                showHome(false);
                showInteraction(false);
                router.push({path: path});
                store.commit('SET_NAV_ITEM', path);
            }
        });
	}

    const resetSidemenuIndexObj = () => {
        setSelectedSideMenuItem(-1, -1);
    };

	const onNavigate = (evt:MouseEvent):void => {
		let target = (evt.target !== evt.currentTarget) ? evt.currentTarget as HTMLAnchorElement : evt.target as HTMLAnchorElement;
		let url = target.getAttribute('data-url');
	};

	const setIconColor = (evt:MouseEvent, color:string = null):void => {
		let _target:HTMLAnchorElement         = (evt.target !== evt.currentTarget) ? evt.currentTarget as HTMLAnchorElement : evt.target as HTMLAnchorElement;
		if(!(_target.childNodes[2] as HTMLAnchorElement).classList.contains('menu-item__active-marker--active'))
		(_target.childNodes[0] as HTMLElement).style['fill'] = color ? `#${color}` : '';
	};

	const mobileMenuHandling = ():void => {
		mobilemenuOpen.value = !mobilemenuOpen.value;
	}

	const clickHandler = (evt:MouseEvent):void => {
		if(!(evt.target as HTMLElement).classList.contains('menu-toggle--js'))
		mobilemenuOpen.value = (evt.target as HTMLElement).classList.contains('menu--js');
	};

	const resizeHandler = ():void => {
		mobilemenuOpen.value = false;
	};

	onMounted(() => {
		setMenuActive(store.state.navigation.activeApp);
		window.addEventListener("click", clickHandler);
		window.addEventListener("resize", resizeHandler);
	});

	onUnmounted(() => {
		window.removeEventListener("click", clickHandler);
		window.removeEventListener("resize", resizeHandler);
	});

	return {
		store, hasActiveLine, showPulse,
		loadApp,
		activeLabel, activeCode, activeColor,
		setIconColor,
		// items,
		mobileMenuHandling, mobilemenuOpen
	}
}

});

</script>

<template>
	<div class="menu-selected-label menu-toggle--js" @click="mobileMenuHandling" data-e2e="app-main-menu">
		<!--<component :is="activeCode" class="menu-selected__icon menu-toggle--js" :style="'fill: #' + activeColor" />-->
		{{ activeLabel }}
		<button :class="['menu-selected__btn menu-toggle--js', {'menu-selected__btn--open' : mobilemenuOpen}]">
			<ChevronDown class="menu-toggle--js" />
		</button>
	</div>
	<nav :class="['menu-wrapper', 'menu--js', {'menu-wrapper--open' : mobilemenuOpen}]">
		<a v-for="item in store.state.navigation.menuItems" :key="item.url" class="menu-item menu--js" :data-e2e="item.url" @click.stop="loadApp(item.url)" @mouseover="setIconColor($event, item.appColor)" @mouseout="setIconColor($event)" :style="item.label[store.state.browserLanguage] === activeLabel ? 'color: #' + item.appColor : ''">
			<component :is="item.Icon" class="menu-item__icon menu--js" :style="item.label[store.state.browserLanguage] === activeLabel ? 'fill: #' + item.appColor : ''" />
			{{ item.label[store.state.browserLanguage] }}
			<div :class="['menu-item__active-marker menu--js', {'menu-item__active-marker--active' : (item.label[store.state.browserLanguage] === activeLabel || showPulse(item))}, { 'active-line' : showPulse(item) }]" :title="item.appColor" :style="'background-color: #' + item.appColor"></div>
		</a>
	</nav>
</template>

<style lang="scss" scoped>

  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";

    .active-line {
        animation: pulse linear 3s infinite;
        display: block;
    }
    @keyframes pulse {
        0% {
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        20% {
            opacity: 0;
        }
        30% {
            opacity: 1;
        }
        40% {
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
        60% {
            opacity: 0;
        }
        100% {
            opacity: 0;
        }
    }

  .menu-wrapper {
    display: none;
    flex-direction: column;
    flex-wrap: nowrap;
    float: left;
    width: 210px;
    margin-left: 80px;
    background-color: globals.$color-white;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.15);
    &--open {
      position: absolute;
      display: flex;
    }
    @media #{globals.$media_XL} {
      display: flex;
      width: auto;
      flex-direction: row;
      box-shadow: none;
      margin-left: 0;
    }
  }

  .menu-selected-label {
    position: relative;
    display:inline-block;
    width: 210px;
    height: 80px;
    line-height: 80px;
    font-size: 1.5em;
    color: globals.$color-home;
    padding-left: 12px;
    @include font.font-light();
    user-select: none;
    @media #{globals.$media_XL} {
      display: none;
    }
    &:after {
      content: '';
      position: absolute;
      top: 15px;
      right: 0;
      bottom: 15px;
      border-left: 1px solid globals.$color-gray30;
    }
  }

  .menu-selected__btn {
    position: absolute;
    display: block;
    right: 0;
    top: 0;
    height: 80px;
    width: 50px;
    background-color: globals.$color-white;
    svg {
      width: 36px;
      height: 36px;
      fill: globals.$color-gray40;
      margin-top: 8px;
    }
    &--open {
      transform: rotate(180deg);
      svg {
        margin-top: -3px;
      }
    }
  }

  .menu-item {
    position: relative;
    width: 210px;
    height: 45px;
    line-height: 45px;
    cursor: pointer;
    user-select: none;
    font-size: 1.1em;
    color: globals.$color-gray40;
    @media #{globals.$media_XL} {
      width: 96px;
      height: 80px;
      @include font.font-menu();
      text-align: center;
      font-size: .67em;
      letter-spacing: -0.1px;
      white-space: nowrap;
      padding-top: 54px;
      line-height: 1.25;
    }
    &:hover {
      background-color: globals.$color-gray2;
    }
  }

  .menu-item__icon,
  .menu-selected__icon {
    position: relative;
    margin: 0 5px 0 10px;
    fill: globals.$color-gray40;
    width: 22px;
    height: 22px;
    top: 4px;
    font-size: 2.2em;
    @media #{globals.$media_XL} {
      position: absolute;
      transform: translate(-50%, -50%);
      top: 32px;
      left: 50%;
      width: 28px;
      height: 28px;
      margin: 0;
      z-index: 10;
    }
  }

  .menu-selected__icon {
    width: 22px;
    height: 22px;
    top: 4px;
    margin: 0 3px 0 10px;
  }

  .menu-item__active-marker {
    display: none;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    z-index: 20;
    @media #{globals.$media_XL} {
      height: 3px;
      right: 0;
      top: auto;
      width: auto;
    }
    &--active {
      display: block;
    }
  }

  .menu-item:hover .menu-item__active-marker {
    display: block;
  }


</style>