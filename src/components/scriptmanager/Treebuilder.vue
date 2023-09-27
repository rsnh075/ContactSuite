<script setup>
import {computed, inject, onBeforeUnmount, onMounted, provide, ref} from 'vue';
import Tree from './Tree.vue';
import {calculateMaxHeight, coordsElementInViewport, transitionEnd} from '@/use/helperFunctions';
import {useStore} from 'vuex';
import {useScriptBuilderStore} from '@/store/cmScriptBuilderStore';
import { Close } from 'mdue';
import { currentLocalDateTimeISO }  from '@/use/dateFunctions';
import { Logging } from '../../ipccc/lib/logging';

const browserLanguage = ref('nl');

const store = useStore();
const showLoader = inject('showLoader');
const props = defineProps(['treedata', 'isstatic', 'functionlist', 'selectedcustomerid', 'exitParams', 'pasteboard']);
const COLLAPST_MODULE_HEIGHT = 41;
const ischild = ref(false); //Firsttime always false
const islast = ref(false); //Cannot be lastchild if it is not a child itself?
const contextMenuVisibility = ref(false);
const exits = ref([]);
const propsOpen = ref(false);
const scriptStore = useScriptBuilderStore();

let moduleMnu = null;
let parentModule = null;
let selectedExit = null;
let selectedExitAlt = null;

const onremovemodule = inject('onremovemodule');
const oncutmodule = inject('oncutmodule');
const oncopymodule = inject('oncopymodule');
const onpastemodule = inject('onpastemodule');
const onaddmodule = inject('onaddmodule');
const handelexit = inject('handelexit');
const setredirectexit = inject('setredirectexit');

const cutModule = () => {
    oncutmodule(contextMenuBranch.value.ModuleNumber);
    closeModuleMenu();
};

const copyModule = () => {
    oncopymodule(contextMenuBranch.value.ModuleNumber);
    closeModuleMenu();
};

const pasteModule = () => {
    if (props.pasteboard.length > 0 && contextMenuBranch.value.ParentModule !== '') {
        onpastemodule(contextMenuBranch.value.ParentModule, contextMenuBranch.value.exitType, contextMenuBranch.value.exitTypeAlt);
    }
    closeModuleMenu();
};

const positionMenu = (srcEl, targetEl) => {
    let _pos = coordsElementInViewport(srcEl, targetEl, 'hfliped');
    targetEl.style.left = _pos.left + 'px';
    targetEl.style.top = _pos.top + 'px';
    targetEl.style.maxHeight = _pos.maxHeight + 'px'; // in case menu falls outside viewport
    targetEl.classList.add(_pos.className);
};

const catchClick = evt => {
    contextMenuVisibility.value = false;
    // evt.stopPropagation();
    let _target = evt.target,
        _trigger = [..._target.classList].find(cls => cls.indexOf('--js') !== -1);

    if (_trigger === 'child--js') {
        _target = evt.target.parentElement;
        _trigger = [..._target.classList].find(cls => cls.indexOf('--js') !== -1);
    }

    switch (_trigger) {
        //ADD MODULE NR AT PARENT NR (*)
        case 'newmodule--js':
            if (branchToInsert.value === null) {
                addNewModule(scriptStore.addModuleId, parentModule, selectedExit, selectedExitAlt);
            } else {
                insertNewModule(scriptStore.addModuleId);
            }
            scriptStore.addModuleId = -1;
            break;
        //SHOW MENU OPTIONAL EXITS (*)
        case 'exit--js':
            parentModule = parseInt(_target.getAttribute('data-modnr'));
            showOptionalExitMenu(_target);
            break;
        case 'remove--js':
            closeModuleMenu();
            let _mNr = _target.getAttribute('data-modnr');
            if (_mNr !== '' && parseInt(_mNr) >= 0) {
                removeNode(_target.getAttribute('data-modnr'));
            } else {
                removeExitPlaceholder(_target);
            }
            break;
        default:
            //
            break;
    }
};

const moduleMenuEscListener = evt => {
    if (evt.keyCode === 27) {
        closeModuleMenu();
    }
};
const closeModuleMenu = () => {
    contextMenuBranch.value = null;
    branchToInsert.value = null;
    moduleMnu.classList.remove('scriptmodule__modulepicker--open');
    document.removeEventListener('keydown', moduleMenuEscListener);
};

provide('closeModuleMenu', closeModuleMenu);

const showModuleMenu = (scrEl, modnr, exittype, exittypeAlt) => {
    // console.log('showModuleMenu');
    //REMEMBER PARENT MODULE NR AND EXIT SO WE KNOW IT WHEN WE ADD THE MODULE LATER
    parentModule = modnr;
    selectedExit = exittype;
    selectedExitAlt = exittypeAlt;

    positionMenu(scrEl, moduleMnu);
    moduleMnu.classList.toggle('scriptmodule__modulepicker--open');
    document.getElementById('searchField').focus();
    document.addEventListener('keydown', moduleMenuEscListener);
};

provide('showModuleMenu', showModuleMenu);

const branchToInsert = ref(null);
const openInsertModuleMenu = (branch, scrEl) => {
    toggleContextMenu(null);
    positionMenu(scrEl, moduleMnu);
    moduleMnu.classList.toggle('scriptmodule__modulepicker--open');
    branchToInsert.value = branch; //same as contextMenuBranch but with different name and state
    document.addEventListener('keydown', moduleMenuEscListener);
};

const exitPlaceholder = exitType => {
    handelexit({
        modNr: contextMenuBranch.value.ModuleNumber,
        exit: exitType,
        additem: true
    });
    closeExitsMenu();
};

const removeExitPlaceholder = branch => {
    handelexit({
        modNr: branch.ParentModule,
        exit: branch.exitType,
        additem: false
    });
};

const addNewModule = (moduleId = 0, insertAfter = 100, atExitType, exitTypeAlt) => {
    closeModuleMenu();
    onaddmodule(moduleId, insertAfter, atExitType, exitTypeAlt);
};

const insertNewModule = (moduleId = 0) => {
    showLoader(true);
    scriptStore.insertModuleActive = true;
    try {
        oncutmodule(branchToInsert.value.ModuleNumber);
        onaddmodule(moduleId, branchToInsert.value.ParentModule, branchToInsert.value.exitType, branchToInsert.value.exitTypeAlt)
            .then((newModuleNumber) => {
                onpastemodule(newModuleNumber, 'ExitSuccess', 'ExitSuccess');
                closeModuleMenu();
                scriptStore.insertModuleActive = false;
                showLoader(false);
            })
            .catch(() => {
                scriptStore.insertModuleActive = false;
                showLoader(false);
            });
    } catch (e) {
        Logging.WriteAlways(`[${currentLocalDateTimeISO()}] Treebuilder insertNewModule try/catch error: ${e}`);
        scriptStore.insertModuleActive = false;
        showLoader(false);
        console.error(e);
    }
};

const removeNode = modnr => {
    onremovemodule(modnr);
};

const removeModule = (mNr, branch) => {
    closeModuleMenu();
    // also remove possible redirecting status
    store.commit('SET_MODULE_REDIRECT_FROM', {modnr: -1, exittype: ''});
    if (mNr !== '' && parseInt(mNr) >= 0) {
        onremovemodule(mNr);
    } else {
        removeExitPlaceholder(branch); // see in Tree.vue
    }
};

const setRedirectDestination = mNr => {
    setredirectexit({
        modNr: parentModule,
        exit: selectedExit,
        destnr: mNr
    });
};

const checkOptionals = b => {
    if (b != null)
        return b.Exits.length < b.ExitParameters.length;
    else
        return false;
};

const deletable = computed(() => {
    return function (name) {
        return name !== 'Mandatory';
    };
});

const availableExits = computed(() => {
    if (contextMenuBranch.value === null) return exits.value;

    return exits.value.filter(exitA => !contextMenuBranch.value.Exits.some(exitB => exitB.exitType === exitA.Name));
})

const contextMenuBranch = ref(null);
const contextMenuLocation = ref(null);
const contextMenuStyle = computed(() => {
    return {
        left: `${contextMenuLocation.value?.right ?? -1000}px`,
        top: `${contextMenuLocation.value?.top - 20 ?? -1000}px`,
        display: exits.value.length > 0 ? 'none' : 'block'
    };
});
const toggleContextMenu = menuData => {
    if (menuData === null ||
        (contextMenuBranch.value !== null && menuData.branch.ModuleNumber === contextMenuBranch.value.ModuleNumber)
    ) {
        contextMenuBranch.value = null;
        contextMenuLocation.value = null;
        return;
    }

    if (propsOpen.value) {
        return; // can't open menu when props are open
    }

    contextMenuBranch.value = menuData.branch;
    contextMenuLocation.value = menuData.location;
};

const exitsMenuStyle = computed(() => {
    return {
        left: `${contextMenuLocation.value?.right ?? -1000}px`,
        top: `${contextMenuLocation.value?.top - 20 ?? -1000}px`,
        width: '250px'
    };
});
const openOptionalExitsMenu = () => {
    // console.log('openOptionalExitsMenu');
    exits.value = contextMenuBranch.value.ExitParameters;
};

const closeExitsMenu = () => {
    // console.log('closeExitsMenu');
    exits.value = [];
    toggleContextMenu(null);
};

const closeAllMenus = () => {
    toggleContextMenu(null);
    closeExitsMenu();
    closeModuleMenu();
    //and reset redirect setFrom
    store.commit('SET_MODULE_REDIRECT_FROM', { modnr: -1, exittype: '' });
};

const isExit = computed(() => contextMenuBranch.value !== null && contextMenuBranch.value.ModuleNumber === '');
const isRedirect = computed(() => contextMenuBranch.value !== null && contextMenuBranch.value.Name == 'Redirect');
const showPasteMenuItem = computed(() => contextMenuBranch.value !== null && contextMenuBranch.value.ModuleNumber === '');

onMounted(() => {
    moduleMnu = document.querySelector('#moduleMnu');

    // document.querySelector('.detailscreen-wrapper').addEventListener('scroll', closeModuleMenu,false);
    document.querySelector('.detailscreen-wrapper').addEventListener('click', closeAllMenus, false);
});

onBeforeUnmount(() => {
    // document.querySelector('.detailscreen-wrapper').removeEventListener('scroll', closeModuleMenu,false);
    document.querySelector('.detailscreen-wrapper').removeEventListener('click', closeAllMenus, false);
    closeModuleMenu();
});

defineExpose({
    closeModuleMenu
});
</script>

<template>
    <div class="scripttree--start" data-e2e="tree-builder" @click="catchClick($event)">
        <!-- CONTEXT MENU -->
        <div v-if="contextMenuBranch !== null" :style="contextMenuStyle" class="list-content__row-menu">
            <ol>
                <li v-if="!isExit && !isRedirect" class="list-content__menu-item" @click.stop="cutModule()"><span>&#xF190</span>
                    {{ store.state.settings.scriptmanager.contextmenu.cut }}
                </li>
                <li v-if="!isExit && !isRedirect" class="list-content__menu-item" @click.stop="copyModule()"><span>&#xF18F</span>
                    {{ store.state.settings.scriptmanager.contextmenu.copy }}
                </li>
                <li v-if="showPasteMenuItem" :class="{ inactive: true}" class="list-content__menu-item"
                    @click.stop="pasteModule()"><span>&#xF192</span>
                    {{ store.state.settings.scriptmanager.contextmenu.paste }}
                </li>
                <li v-if="checkOptionals(contextMenuBranch)" class="list-content__menu-item" @click.stop="openOptionalExitsMenu();">
                    <span>&#xF490</span> {{ store.state.settings.scriptmanager.contextmenu.addoptionalexit }}
                </li>
                <li v-if="!isExit && !isRedirect" class="list-content__menu-item" @click.stop="openInsertModuleMenu(contextMenuBranch, $event.target);">
                    <span>&#xF490</span> {{ store.state.settings.scriptmanager.contextmenu.addmodule }}
                </li>
                <li v-if="!isstatic && deletable(contextMenuBranch.Name)" class="list-content__menu-item"
                    @click.stop="removeModule(contextMenuBranch.ModuleNumber, contextMenuBranch)"><span>&#xFA78</span>
                    {{ store.state.settings.scriptmanager.contextmenu.remove }}
                </li>
            </ol>
        </div>

        <!-- EXITS MENU -->
        <div v-if="exits.length > 0" :style="exitsMenuStyle" class="list-content__row-menu">
            <ol>
                <li class="scriptmodule__exitpicker-header">
                    {{ store.state.settings.scriptmanager.addexit }}
                    <button type="button" @click.stop="closeExitsMenu()" class="scriptmodule__exitpicker-header--close">
                        <Close />
                    </button>
                </li>
                <li v-for="(exit, index) in availableExits" :key="index" class="list-content__menu-item"
                    @click.stop="exitPlaceholder(exit.Name)">
                    <span :style="{ color: exit.Color, fontsize: exit.Size }"
                          v-html="exit.IconCode"></span>{{ exit.DisplayText }}
                </li>
            </ol>
        </div>
        <Tree
                :currentexits="exits"
                :functionlist="functionlist"
                :ischild="ischild"
                :islast="islast"
                :isstatic="isstatic"
                :selectedcustomerid="selectedcustomerid"
                :tree="treedata"
                @setPropsOpen="propsOpen = $event"
                @toggleContextMenu="toggleContextMenu($event)"
        />
    </div>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/functions";
@use "@/scss/includes/globals";

.list-content__row-menu {
  position: fixed;
  z-index: 101;
  min-width: 200px;
  max-width: 255px;
  width: fit-content;
}

.contextmenu-wrapper {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 120px;
  min-height: 30px;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, .3);
  background-color: globals.$color-white;
  z-index: 10000;

  &--visible {
    display: block;
  }
}

.contextmenu__menuitem {
  position: relative;
  float: left;
  width: 100%;
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
  cursor: pointer;
  font-size: .75rem;
  color: globals.$color-gray60;

  &:hover {
    color: globals.$color-black;
    background-color: globals.$color-gray5;
  }

  span {
    font-family: 'Material Design Icons';
    padding-right: 5px;
    pointer-events: none;
  }
}

</style>