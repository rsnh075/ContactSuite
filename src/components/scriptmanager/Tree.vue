<script lang="ts" setup>
import * as modules from './modules';
import {EXIT_LABELS} from './modules/exitLabels';
import {MODULE_LABELS} from './modules/moduleLabels';
import {computed, inject, onBeforeUnmount, onBeforeUpdate, onMounted, ref, watch} from 'vue';
import {useStore} from 'vuex';
import {useScriptBuilderStore} from '../../store/cmScriptBuilderStore';
import { PlusCircleOutline, MinusCircleOutline, Close } from 'mdue';

const store = useStore();
const props = defineProps(['tree', 'ischild', 'islast', 'isstatic', 'functionlist', 'selectedcustomerid', 'currentexits']);
const emit = defineEmits(['toggleContextMenu', 'setPropsOpen']);

let browserLanguage = store.state.browserLanguage;
let currentBranch = null;
const propsOpen = ref(false);
const redirectExitId = ref(REDIRECT_EXIT);
const propScreens = ref([]);
const searchStr = ref('');
const scriptStore = useScriptBuilderStore();
const searchField = ref<HTMLElement | null>(null);
const closeModuleMenu = inject<Function>('closeModuleMenu');
const showModuleMenu = inject<Function>('showModuleMenu');

const branchType = computed(() => {
    return function (isChild, isLast, isstatic) {
        if (isChild) {
            if (isLast) {
                return (isstatic) ? 'scripttree-branch scripttree-branch--static scripttree-branch--end' : 'scripttree-branch scripttree-branch--end';
            } else {
                return (isstatic) ? 'scripttree-branch scripttree-branch--static' : 'scripttree-branch';
            }
        } else {
            return (isstatic) ? 'scripttree-branch scripttree-branch--static scripttree-branch--start' : 'scripttree-branch--start';
        }
    };
});

// add watch on functionlist
watch(() => props.functionlist, () => {
    if (props.functionlist.length > 0 && searchField.value !== null) {
        searchField.value.focus();
    }
});

const exitStyle = computed(() => {
    return function (type, typeAlt) {
        let _type = typeAlt && type !== typeAlt ? typeAlt : type;
        return EXIT_LABELS[browserLanguage][_type] ? `color:${EXIT_LABELS[browserLanguage][_type].color};font-size:${EXIT_LABELS[browserLanguage][_type].size}` : `color:#C00;font-size:1.2em;`;
    };
});

const moduleName = computed(() => {
    return function (id) {
        return MODULE_LABELS[browserLanguage][id] ? MODULE_LABELS[browserLanguage][id].moduleTitle : '-';
    };
});

const moduleIcon = computed(() => {
    return function (id) {
        return MODULE_LABELS[browserLanguage][id] ? MODULE_LABELS[browserLanguage][id].moduleIcon : '&#xFFE5';
    };
});

const createTooltip = type => {
    const text = EXIT_LABELS[browserLanguage][type] ? EXIT_LABELS[browserLanguage][type].name : 'Exit';
    return  `<span class="tooltip tooltip--right">${text}</span>`;
};

const propsToggle = status => {
    propsOpen.value = status;
    // context should always be closed after both open and close props
    if (status) {
        emit('toggleContextMenu', null); // close context menu
    }
    emit('setPropsOpen', status);
};

const checkForBranches = b => !(b.Exits.length > 0);

const isObject = branch => {
    if (currentBranch === null) currentBranch = branch;
    return (isNaN(parseInt(Object.values(branch)[0])) || Object.values(branch)[0] >= 0);
};

const getModuleType = b => {
    if (b.Name.toLowerCase().indexOf('mandatory') !== -1) {
        return modules.MandatoryModule;
    }
    if (b.Name.toLowerCase().indexOf('optional') !== -1) {
        return modules.OptionalModule;
    }
    if (b.ModuleId === 125) {
        return modules.SetVarModule;
    }
    if (parseInt(b.ModuleNumber) === REDIRECT_EXIT) {
        return modules.RedirectModule;
    }

    return modules.DefaultModule;
};

const isRedirecting = ref(false);
const redirectFrom = ref(null);
watch(() => store.getters.getScriptRedirectFrom(), (source) => {
    redirectFrom.value = source;
    isRedirecting.value = source.modnr > -1;
    if (isRedirecting.value) {
        emit('toggleContextMenu', null);
    }
});

const minimizedBranches = ref([]);
const toggleNode = (index) => {
    const i = minimizedBranches.value.indexOf(index);
    if (i === -1) {
        minimizedBranches.value.push(index);
    } else {
        minimizedBranches.value.splice(i, 1);
    }
};

const setredirectexit:Function = inject('setredirectexit');
const setRedirectLocation = (destination) => {
    setredirectexit({
        modNr: redirectFrom.value.modnr,
        exit: redirectFrom.value.exittype,
        destnr: destination // currentBranch.ModuleNumber
    });
    // stop showing redirect radio buttons
    store.commit('SET_MODULE_REDIRECT_FROM', {modnr: -1, exittype: ''});
};

const exitIcon = exitType => {
    let exit = props.currentexits?.find(e => e.Name === exitType);
    if (exit) {
        return exit.IconCode;
    }
    return EXIT_LABELS[browserLanguage][exitType] ? EXIT_LABELS[browserLanguage][exitType].icon : '&#xFFE5';
};

const btns = ref([]);
const toggleContextMenu = (branch, index) => {
    emit('toggleContextMenu', {branch: branch, location: btns.value[index].getBoundingClientRect()});
};

const cancelRedirect = () => {
    store.commit('SET_MODULE_REDIRECT_FROM', {modnr: -1, exittype: ''});
};

onMounted(() => {
    browserLanguage = store.getters.getLang() ?? 'nl';
});

onBeforeUpdate(() => {
    propScreens.value = [];
});

const closeProperties = (id) => {
    if (propScreens.value[id]?.closeProps !== undefined) {
        propScreens.value[id].closeProps();
    }
};

const getFunction = (branch) => props.functionlist.find(f => f.Id === branch.ModuleId);
const groupedFunctions = computed(() => {
    if (props.functionlist.length <= 0) return props.functionlist;
    const filteredList = props.functionlist.filter(f => f.Name.toLowerCase().includes(searchStr.value.toLowerCase()));
    const groups = [];
    for (let i = 0; i < filteredList.length; i++) {
        if (groups.findIndex(g => g.GroupName === filteredList[i].GroupName) === -1) {
            groups.push({
                GroupName: filteredList[i].GroupName,
                GroupId: filteredList[i].GroupId,
                functionlist: []
            });
        }
        const group = groups.find(g => g.GroupName === filteredList[i].GroupName);
        group.functionlist.push(filteredList[i]);
    }
    return groups.sort((a, b) => a.GroupId - b.GroupId);
});


// 'unique' should be unique enough,
// else we're going to have to keep track of levels and sub-levels
const unique = Math.floor(Math.random() * 999999);

onBeforeUnmount(() => {
    closeProperties(unique);
});

</script>

<template>
    <div data-e2e="tree" class="scripttree-branch-wrapper">
        <!-- FUNCTION MENU PLACE ONLY ONCE-->
        <div v-if="functionlist" id="moduleMnu" class="scriptmodule__modulepicker">
            <div class="scriptmodule__modulepicker-header">
                {{ store.state.settings.scriptmanager.addmodule }}
                <button type="button" @click="closeModuleMenu()" class="scriptmodule__modulepicker-header--close">
                    <Close />
                </button>
            </div>
            <div class="module-search">
                <div class="scriptform__textfield form-textfield--search">
                    <input v-model="searchStr"
                        id="searchField"
                        autofocus
                        :placeholder="store.state.settings.scriptbuilder.searchtxt"
                        type="text"
                    >
                </div>
            </div>

            <div v-if="tree.length !== 0" class="newmodule--js" data-moduleid="-1">
                <span style="color:#538BE0" v-html="moduleIcon(redirectExitId)"></span>{{ moduleName(redirectExitId) }}
            </div>
            <template v-for="group in groupedFunctions">
                <div class="scriptmodule__modulepicker-subheader">
                    {{ group.GroupName }}
                </div>
                <template v-for="(f, index) in group.functionlist">
                    <div v-if="moduleName(f.Id) !== '-' || !store.getters.getEnvIsLive()"
                        :key="index"
                        :data-moduleid="f.Id"
                        class="newmodule--js"
                        @click="scriptStore.addModuleId = f.Id; searchStr = '';">
                        <span v-html="f?.IconCode ?? ''"></span>{{ f.Name }}
                    </div>
                </template>
            </template>
        </div>

        <div :class="branchType(ischild, islast, isstatic)">
            <div v-if="tree.length === 0" class="scripttree__leaf--open scripttree__leaf--first">
                <a
                    ref=""
                    class="scriptmodule__controls-addmodule openmodulemenu--js"
                    @click.stop="showModuleMenu($el, 0, 'ExitSuccess', null)"
                    data-exittype="ExitSuccess"
                    data-modnr="0"
                >
                    {{ store.state.settings.scriptmanager.addmodulelbl }}
                </a>
            </div>

            <!-- ADD EXITS OR MANDATORY EXITS -->
            <template v-for="(branch, index) in tree" v-else :key="index">
                <div
                    class="scripttree__leaf scripttree__leaf--open"
                    :data-closed="minimizedBranches.includes(index) ? '1' : '0'"
                    :class="`type-${branch.Name?.toLowerCase()}`"
                >
                    <!-- toggle open close -->
                    <button
                        type="button"
                        v-if="isObject(branch) && branch.Exits?.length > 0"
                        class="scriptmodule-toggle"
                        @click.stop="toggleNode(index)"
                    >
                        <PlusCircleOutline v-if="minimizedBranches.indexOf(index) > -1" />
                        <MinusCircleOutline v-else />
                    </button>
                    <!--START CONTENT-->
                    <div class="scriptmodule">
                        <!-- Exittype -->
                        <div v-if="ischild" :style="exitStyle(branch.exitType, branch.exitTypeAlt)"
                             class="scriptmodule__exittype tooltip__parent"
                             v-html="exitIcon(branch.exitType) + createTooltip(branch.exitType)"></div>
                        <!-- module -->
                        <component
                                :is="getModuleType(branch)"
                                :ref="el => { propScreens[unique] = el }"
                                :branch="branch"
                                :modnumber="branch.ModuleNumber"
                                :modulefunction="getFunction(branch)"
                                :selectedcustomerid="selectedcustomerid"
                                @propsopen="propsToggle">
                        </component>

                        <!-- REDIRECT BUTTON -->
                        <template v-if="isRedirecting && branch.ModuleId">
                            <input v-if="branch.Name !== 'Redirect'" :id="`redirect-id-${branch.ModuleId}`"
                                   class="redirect"
                                   name="redirect"
                                   type="radio"
                                   @click="setRedirectLocation(branch.ModuleNumber)">
                            <div v-if="branch.ParentModule === redirectFrom.modnr && branch.exitType === redirectFrom.exittype"
                                 class="redirect cancel"
                                 @click="cancelRedirect()">
                                <span>&#xF159;</span>
                            </div>
                        </template>

                        <!-- CTA's SETTINGS -->
                        <a v-else :ref="el => { btns[index] = el }"
                           :class="['scriptmodule__controls--settings props--js', {'scriptmodule__controls--settings-active' : propsOpen}]"
                           :data-modnr="branch.ModuleNumber"
                           :title="propsOpen ? 'open' : 'closed'"
                           @click.stop="toggleContextMenu(branch, index)">&#xF1D9</a>
                    </div>
                    <!--END CONTENT-->

                    <Tree v-if="isObject(branch) && branch.Exits.length > 0"
                          :currentexits="branch.ExitParameters"
                          :functionlist="functionlist"
                          :ischild="true"
                          :islast="checkForBranches(branch)"
                          :isstatic="isstatic"
                          :selectedcustomerid="selectedcustomerid"
                          :tree="branch.Exits"
                          @setPropsOpen="emit('setPropsOpen', $event)"
                          @toggleContextMenu="emit('toggleContextMenu', $event)"/>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>

button {
    user-select: none;
}
.form-textfield--search:before {
    color: #ccc;
    top: 50%;
    left: 15px;
}

#moduleMnu {
    overflow-y: auto;
    /* -ms-overflow-style: none;  /* IE and Edge */
    /* scrollbar-width: none;  /* Firefox */
}

#moduleMnu::-webkit-scrollbar {
    /* Hide scrollbar for Chrome, Safari and Opera */
    width: 6px;
}

#moduleMnu::-webkit-scrollbar-track {
    background: #e6e6e6;
}

#moduleMnu::-webkit-scrollbar-thumb {
    background: #ccc;
}

#moduleMnu::-webkit-scrollbar-thumb:hover {
    background: #555;
}

.redirect {
    font-weight: bold;
    position: absolute;
    right: 10px;
    top: 10px;
    height: 18px;
    width: 18px;
}

.cancel .svg {
    width: 22px;
    height: 22px;
    vertical-align: bottom;
}

.list-content__row-menu {
    position: absolute;
    right: -210px;
    top: 0;
    padding: 0;
}

.list-content__row-menu ol {
    margin: 0;
}

.module-search:hover {
    background-color: transparent !important;
}

.type-redirect {
    overflow: visible;
}

.inactive {
    color: rgba(200, 200, 200, 0.8) !important;
    cursor: default !important;
}
</style>