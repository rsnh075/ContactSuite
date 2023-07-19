<template>
    <div>
        <div :class="['app-wrapper', {'app-wrapper--hidden' : !isLoggedIn}]" data-e2e="main-app-wrapper">

            <!-- CONNECTION DIALOG MESSAGE -->
            <MessageBox
                :status       = "showDialog"
                :bodyContent  = "messageBody"
                :acceptLabel  = "acceptLabel"
                :cancelLabel  = "cancelLabel"
                @accepted     = "acceptedFunctionCall"
                @canceled     = "hideMessage"
            />
            <!-- CONNECTION DIALOG MESSAGE -->

            <div class="header-wrapper">
                <figure class="header-branding header-branding--dashboard-app">
                    <img :src="logoUrl">
                </figure>
            </div>

            <div class="appgrid-bodywrapper">
                <component
                    :is="thecomponent"
                    :active="true"
                    :isdashboardwindow="true"
                />
            </div>
        </div>

        <preloader :isvisible="showPreloader" :message="preloaderMessage" />
    </div>
</template>

<script lang="ts">

// declare const window            : any;

declare global {
    interface Window {
        debugState: boolean;
        siteroot: string;
        dashcomp: string;
        dashboardWinRef: object | any;
    }
}

window.siteroot = window.location .protocol + "//" + window.location.host + import.meta.env.BASE_URL || import.meta.env.BASE_URL;

import { IPCCC }               from './ipccc/js/ipccc.js';

import { ref,
          onMounted,
          provide,
          defineComponent,
          shallowRef,
          watch
        }                        from 'vue';

import { useStore }             from 'vuex';
import Axios                    from 'axios';

import { getLangSettings,
          switchTheLang
        }                       from './helpers/languageLib';

import preloader                from './components/preloader/Preloader.vue';
import MessageBox               from './components/dialogs/Message-box.vue';

import { LANGUAGE }             from './settings/langlabels';
import Agents           from './components/dashboards/AgentDashboard.vue';

export default defineComponent({
name: 'App',
components: {
    MessageBox,
    preloader,
    Agents,
},
setup() {
    const store:object | any          = useStore(),
          logoUrl                     = './assets/images/cs_logo.svg',
          thecomponent                = ref(shallowRef(null)),
          url:string                  = './assets/settings/custom_settings.json',
          showPreloader               = ref<boolean>(false),
          preloaderMessage            = ref<string>('Loading'),
          isLoggedIn                  = ref<boolean>(false);

    let customdata:object | any       = ref({});

    //PRELOADER GLOBAL FN
    const showLoader = (status:boolean, message:string = ''):void => {
      showPreloader.value = status;
      if(message !== '') {
        preloaderMessage.value = message;
      }
    };
    provide('showLoader', showLoader);

    //CONNECTION SHIZZLE
    const showDialog = ref(false),
        messageBody = ref(''),
        acceptLabel = ref(''),
        cancelLabel = ref('');

    const hideMessage = () => {
        showDialog.value = false;
        messageBody.value = '';
    }

    const isReloadCS = ref(false),
        csIsOnline = ref(true);

    const reloadCS = () => {
    // TEST REMOVE
        console.log('reloadCS', );
        window.location.reload();
    }

    const tryReconnect = () => {
        console.log('tryReconnect');
        isReloadCS.value = true;

        if(csIsOnline.value) {
            acceptLabel.value = store.state.settings.internetcondialog.btnacceptlabel;
        } else {
            console.log('connection lost');
        }
    }

    const acceptedFunctionCall = () => {
        console.log('acceptedFunctionCall: ', isReloadCS.value);
        if(isReloadCS.value)
            reloadCS();
    }

    watch(() => store.getters.getInteractionState(), (newVal, oldVal) => {
        if(newVal) {
            hideMessage();
        }
    });

    store.watch(store.getters.getInternetConStatus, status => {
        switch(status) {
            case 'Connected':
                break;
            case 'Reconnecting':
                messageBody.value = `<div class="dialog__window-body--message">
                                        <span>${store.state.settings.internetcondialog.messagelostconnection}</span>
                                    </div>`;
                acceptLabel.value = '';
                cancelLabel.value = '';
                showDialog.value = true;
                break;
            case 'Disconnected':
                messageBody.value = `<div class="dialog__window-body--message">
                                        <span>${store.state.settings.internetcondialog.messagereloadcs}</span>
                                    </div>`;
                showDialog.value = true;
                tryReconnect();
                break;
            case 'Reconnected':
                setTimeout(() => {
                    showDialog.value = false;
                }, 500);
                break;
        }
    });

    //END CONNECTION SHIZZLE

    const switchLang = (lang:string):void => {
      store.commit('SET_LANG', lang);
      store.commit('SET_SETTINGS_UPDATE', { data: Object.assign({}, switchTheLang(lang, LANGUAGE), customdata.value) });
    }

    const getUrlParameter = (name) => {
      let pageUrl      = window.location.search.substring(1),
          urlVariables = pageUrl.split('&'),
          _param       = '';
      urlVariables.forEach(urlVar => {
        let parameter = urlVar.split('=');
        if (parameter[0].toString().toLowerCase() == name.toLowerCase())
          _param = parameter[1];
      });
      return _param;
    }

    const dashboardIsLoaded = () => {
      showLoader(false);
      window.addEventListener('unload', () => {
        delete window.opener.dashboardWinRef;
      });
    };

    //IS IPCCC SETSESSION ACCEPTED
    const setCopiedSessionId = () => {
        let _sid        = getUrlParameter('sessionId'),
            _lang       = getUrlParameter('lang');
        window.dashcomp = getUrlParameter('dashcomp');
        IPCCC.SetConfig(customdata.value.ipcccConfig, customdata.value.idserverConfig);
        IPCCC.SetSessionId(_sid, '')
        .then(success => {
            isLoggedIn.value      = true;
            thecomponent.value    = Agents;

            store.dispatch('SET_LOGIN_SESSION', success)
            .then(() => {
                getLangSettings().then(lang => {
                    switchLang(lang);

                    IPCCC.Reconnecting.addHandler(():void => {
                        console.log('Reconnecting');
                        store.commit('SET_INTERNETCON_STATUS', 'Reconnecting');
                    });

                    IPCCC.Reconnected.addHandler(():void => {
                        console.log('Reconnected');
                        store.commit('SET_INTERNETCON_STATUS', 'Reconnected');
                        showLoader(false);
                    });

                    IPCCC.Disconnected.addHandler(():void => {
                        console.log('Disconnected');
                        store.commit('SET_INTERNETCON_STATUS', 'Disconnected');
                        showLoader(false);
                    });

                    dashboardIsLoaded();
                })
                .catch(error =>{
                    console.error(error);
                });
            })
            .catch(error =>{
                console.error(error);
            });
        })
        .catch(error => {
            console.error(error.Message, 'Failed establishing connection with session on the IPCCCGUIServer');
        })
    };

    onMounted((): void => {
        showLoader(true, 'ContactSuite is loading');
        // LOAD CUSTOM SETTINGS
        Axios.get(url).then(response => {
            customdata.value = response.data;
            setCopiedSessionId();
        }).catch(error => {
            console.error('Error: ' , error);
        });

        window.addEventListener("offline", (e) => {
            console.log("offline");
            csIsOnline.value = false;
        }, false);

        window.addEventListener("online", (e) => {
            console.log("online");
            csIsOnline.value = true;
            tryReconnect();
        }, false);

    });

    return {
      store,
      isLoggedIn, showPreloader, preloaderMessage,
      logoUrl, thecomponent,
      showDialog, messageBody, acceptLabel, cancelLabel, acceptedFunctionCall, hideMessage
    }
  }
})

</script>

<style lang="scss" scoped>
@use "@/scss/includes/globals" as g;

.app-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  opacity: 1;
  transition: all 1s ease-in;
  &--hidden {
    opacity: 0;
  }
}

//external dashboard
.header-wrapper {
  position: absolute;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, .15);
  background-color: g.$color-white;
  top: 0;
  right: 0;
  left: 0;
  font-size: 1.2rem;
  height: 80px;
  user-select: none;
  z-index: 5000;
}

.header-branding {
  position: relative;
  float: left;
  height: g.$header-height;
}

.header-branding {
  overflow: hidden;
  width: g.$header-height;
  cursor: pointer;
  @media #{g.$media_L} {
    width: g.$submenu-width;
  }
  transition: width .2s ease-in-out;
  &:after {
    content: "";
    position: absolute;
    top: 10px;
    right: 0;
    bottom: 10px;
    border-left: 1px solid g.$color-gray20;
  }
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 330px;
    @media #{g.$media_L} {
      left: -80px;
    }
  }
  &--dashboard-app {
    width: 250px;
    img {
      left: -80px;
      width: 330px;
    }
  }
}
.appgrid-bodywrapper {
  position: absolute;
  top: 80px;
  right: 0;
  bottom: 0;
  left: 0;
  background-image: linear-gradient(#FAFAFA, #FAFAFA 160px, #F2F2F2 160px, #F2F2F2);
  overflow: hidden;
  z-index: 1000;
}
//

.appgrid-interaction-wrapper {
  position: absolute;
  top: 100%;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  // transition: left .2s ease-in-out;
  z-index: g.$level-interaction;
  &--active {
    top: 80px;
  }
  &--minimized {
    right: 100%;
    bottom: 100%;
    overflow: visible;
    //SORRY ITS A LITTLE MIXED WITH INTERACTION.SCSS AND AGENTCONTROLS.SCSS
    .interaction-outer-wrapper {
      position: fixed;
      width: #{(g.$agentpanel-height * 3) + 30px};
      height: g.$agentpanel-height;
      box-shadow: 0 2px 4px 0px rgba(0,0,0,.25);
      overflow: hidden;
      top: calc(100% - 210px);
      left: 75%;
      transform: translateX(-50%);
      .interaction-wrapper {
        top: 0;
        left: -330px;
      }
      .agentcontrols-wrapper {
        display: block;
        border-bottom: none;
      }
      .agentcontrols-checkboxbar__back,
      .interaction__toolbar--wide {
        left: 360px !important;
      }
    }
  }
  &--minimized-webphone .interaction-outer-wrapper {
    width: #{(g.$agentpanel-height * 2) + 30px};
    .interaction-wrapper {
      left: -690px;
    }
  }
}

</style>
