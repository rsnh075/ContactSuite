<script lang="ts" setup>
import * as uiComponents from './moduleComponents';
import * as uiElements from './uiElements';
import {MODULE_LABELS} from './moduleLabels';
import {coordsElementInViewport} from '../../../use/helperFunctions';
import {computed, nextTick, onUpdated, ref} from 'vue';
import {useStore} from 'vuex';
import {sortable as vSorter} from '../../../directives/sortable';

const store = useStore();
const props = defineProps(['branch', 'modnumber', 'selectedcustomerid', 'modulefunction']);
const emit = defineEmits(['propsopen']);
const propsOpen = ref(false);
const moduleLabels = ref(MODULE_LABELS);
const titleValue = ref('');
const currentValue = ref('');
const browserLanguage = ref('en');
const proptoggle = ref();
const setVarOpen = ref(false);
const moduleTitleField = ref<HTMLInputElement | null>(null);

const getTitleValue = val => {
    titleValue.value = val;
};

const colWidth = type => {
    let _class: string;
    switch (type) {
        case 8:
        case 10:
        case 11:
            _class = 'col-large';
            break;
        default:
            _class = 'col-small';
            break;
    }
    return _class;
};

let totalColPercentage = 0;
const getWidthPercentage = uiitem => {
    if (colWidth(uiitem.UIElement) === 'col-large') return 100;
    const size = uiitem.ColumnSize.split(',');
    const res = size[0] / size[1] * 100 - 1;
    totalColPercentage += res;
    return res;
};
const getFillWidth = () => {
    const res = 100 - (totalColPercentage % 100);
    totalColPercentage = 0;
    return res;
};
const checkOptionalBtn = id => id == 105;

const positionProps = (srcEl, targetEl) => {
    if (!srcEl || !targetEl) return;
    let _pos;

    targetEl.classList.remove('fliped');
    _pos = coordsElementInViewport(srcEl, targetEl, 'fliped');
    targetEl.style.top = _pos.top + 'px';
    targetEl.style.left = _pos.left + 'px';
    targetEl.style.maxHeight = `${_pos.availableHeight}px`;
    targetEl.classList.add(_pos.className);
};

// element 9 and 16 are both the varbuilder component, but with slightly different behavior
const getComponent = (type: number) => uiComponents[`uiComponent_${type === 16 ? 9 : type}`];
const getUiElements = id => uiElements['UiElement_' + id];

const toggleProps = () => { //Evaluate
    setVarOpen.value = false;
    let _props = proptoggle.value.querySelector('.scriptmodule__props');
    if (_props === null) {
        return; // no props to toggle
    }
    [].slice.call(document.querySelectorAll('.scriptmodule__props')).forEach(el => {
        if (el !== _props) el.style = '';
    });
    document.querySelector('.scriptmodule__modulepicker').classList.remove('scriptmodule__modulepicker--open');
    nextTick(() => {
        positionProps(proptoggle.value, _props);
        if (_props.offsetHeight !== 0) {
            _props.style.display = 'none';
            store.commit('SET_SCRIPT_PROPS', {
                props: props.branch.ModuleParameters,
                name: (props.branch.Name == moduleLabels.value[browserLanguage.value][props.branch.ModuleId]?.moduleBaseName) ? moduleLabels.value[browserLanguage.value][props.branch.ModuleId].moduleTitle : props.branch.Name,
                numberToChange: props.modnumber,
                selectedLabel: titleValue.value
            });
            propsOpen.value = false;
        } else {
            _props.style.display = 'block';
            propsOpen.value = true;
        }
        emit('propsopen', propsOpen.value);
        if (propsOpen.value && moduleTitleField.value) {
            moduleTitleField.value.focus();
        }
    });
};

const propIsChanged = () => {
    store.commit('SET_SCRIPT_PROPS', {
        props: props.branch.ModuleParameters,
        name: props.branch.Name,
        numberToChange: props.modnumber,
        selectedLabel: titleValue.value
    });
};

const closeProps = () => {
    toggleProps();
};
defineExpose({
    closeProps
});

const addVarToJson = (newVar: string) => {
    let vars = props.branch.ModuleParameters.find(m => m.SubDefinition.length > 0).SubDefinition;
    let newVarObj = JSON.parse(JSON.stringify(vars[vars.length - 1]));
    newVarObj.find(v => v.FieldName.toLowerCase() === 'variablename').CurrentValue = newVar;
    vars.unshift(newVarObj);
};

const removeVarFromJson = (ix: number) => {
    let vars = props.branch.ModuleParameters.find(m => m.SubDefinition.length > 0).SubDefinition;
    vars.splice(ix, 1);
};

const deleteVar = () => {
    if (currentSubDefinitionIx.value < 0) return;
    contextMenuVisible.value = false;
    removeVarFromJson(currentSubDefinitionIx.value);
};

const editVar = () => {
    if (currentSubDefinitionIx.value < 0) return;
    setVarOpen.value = true;
    contextMenuVisible.value = false;
};

const adding = ref(false);
const newVar = ref('');
const showAddVar = () => {
    newVar.value = '';
    addVarToJson(newVar.value);
    currentSubDefinitionIx.value = 0;
    adding.value = true;
    // focus on
    editVar();
};

const cancelAddVar = () => {
    if (adding.value) {
        deleteVar();
        adding.value = false;
    }
    currentSubDefinitionIx.value = 0;
    setVarOpen.value = false;
};

const saveVar = () => {
    adding.value = false;
    currentSubDefinitionIx.value = -1;
    setVarOpen.value = false;
    let _props = proptoggle.value.querySelector('.scriptmodule__props');
    if (_props === null) {
        return; // no props to toggle
    }
    positionProps(proptoggle.value, _props);
};

const varItems = computed(() => props.branch.ModuleParameters.find(m => m.SubDefinition.length > 0)?.SubDefinition ?? []);
const onSortEnd = (currentIndex, newIndex) => {
    const pVarItems = props.branch.ModuleParameters.find(m => m.SubDefinition.length > 0).SubDefinition;
    if (newIndex >= pVarItems.length) {
        let k = newIndex - pVarItems.length + 1;
        while (k--) {
            pVarItems.push(undefined);
        }
    }
    pVarItems.splice(newIndex, 0, pVarItems.splice(currentIndex, 1)[0]);
};

const contextMenuVisible = ref(false);
const contextMenuLocation = ref({x: 0, y: 0});
let currentSubDefinitionIx = ref(-1);

const openContextMenu = ($event: MouseEvent, subdefinitionIx: number) => {
    if (contextMenuVisible.value) return;
    currentSubDefinitionIx.value = subdefinitionIx;
    const location = ($event.target as HTMLAnchorElement).getBoundingClientRect();
    contextMenuLocation.value.x = location.left + 15;
    contextMenuLocation.value.y = location.top + 5;
    contextMenuVisible.value = true;
};

const getVariableName = (varItem): string => varItem.find(item => item.FieldName.toLowerCase() === 'variablename').CurrentValue;
const getKeyName = (varItem): string => `${getVariableName(varItem)}_${getVariableValue(varItem)}`;
const getVariableValue = (varItem): string => {
    const valFromVar = varItem.find(item => item.FieldName.toLowerCase() === 'usevalue').CurrentValue
    return valFromVar.length > 0 ? valFromVar : varItem.find(item => item.FieldName.toLowerCase() === 'usevaluefromvariable').CurrentValue;
}

onUpdated(() => {
    browserLanguage.value = store.getters.getLang();
});

browserLanguage.value = store.getters.getLang();
let _valParam = props.branch.ModuleParameters.find(param => param.IsModuleText);
currentValue.value = (_valParam && _valParam != -1) ? _valParam.CurrentValue : currentValue.value;
const hasParameters = computed(() => props.branch.ModuleParameters.length > 0);
const moduleDescription = computed(() => props.branch?.Name ?? props.modulefunction?.Name ?? '');

</script>

<template>
    <div ref="proptoggle"
         :data-modulenumber="branch.ModuleNumber"
         class="scriptform__textfield scriptform__lookup scriptmodule__content"
         data-e2e="set-var-module">
        <div :class="{ 'clickable': hasParameters}" class="prop-header" @click.stop="toggleProps()">
            <!-- <span style="float: left;">{{ branch.ModuleNumber }}</span> -->
            <!-- ICON, TITLE AND SELECTED VALUE -->
            <span class="scriptmodule__icon child--js" v-html="modulefunction?.IconCode ?? ''"></span>
            <!-- OPTIONAL BTNS -->
            <div v-if="checkOptionalBtn(branch.ModuleId)" class="scriptmodule__optional-element--btn">
                <component
                        :is="getUiElements(branch.ModuleId)"
                        :currentvalue="currentValue"
                        :selectedcustomerid="selectedcustomerid"
                        @propchanged="propIsChanged()">
                </component>
            </div>
            <div :class="['scriptmodule__name-wrapper child--js', {'scriptmodule__name-wrapper--indent' : checkOptionalBtn(branch.ModuleId)}]">
                <span class="scriptmodule__name child--js description-text" v-html="moduleDescription"></span>
                <span v-if="titleValue != ''" class="scriptmodule__name-label child--js" v-html="titleValue"></span>
            </div>
        </div>

        <div v-if="hasParameters" class="scriptmodule__props ">
            <div class="list-close">
                <a @click.stop="toggleProps()"><span></span> <span></span></a>
            </div>
            <!-- MODULE PARAMS -->
            <!-- TITLE FIELD -->
            <div class="scriptform-row">
                <div class="scriptform-unit--alpha">
                    <div class="scriptform__textfield">
                        <label class="scriptform-label"
                               for="moduletitle">{{ store.state.settings.scriptmanager.modulename }}</label>
                        <input ref="moduleTitleField"
                               autofocus
                               v-model="branch.Name"
                               name="moduletitle"
                               type="text"
                               @keyup="propIsChanged">
                    </div>
                </div>
            </div>

            <div class="scriptform-row var-list">
                <!-- Add var button -->
                <a id="add-var-btn" class="scriptform-contols scriptform__stepper-contols--plus" @click="showAddVar()">&#xF419</a>
                <div class="list-content" style="min-height: 50px;">
                    <!-- var header/labels -->
                    <div class="list-content--header" style="border-bottom: 1px solid grey">
                        <span class="list-content__row-cell list-content__row-cell--55">
                            {{ store.state.settings.scriptmanager.variable }}
                        </span>
                        <span class="list-content__row-cell list-content__row-cell--45">
                            {{ store.state.settings.scriptmanager.value }}
                        </span>
                    </div>
                    <!-- var rows -->
                    <ol v-sorter="{isSortable: true}"
                        @sortend="onSortEnd($event.detail.oldIndex, $event.detail.newIndex)">
                        <li v-for="(varItem, index) in varItems" v-if="varItems.length > 0"
                            v-show="getVariableName(varItem).trim() !== ''"
                            :key="getKeyName(varItem)" class="list-content__row">
                            <span class="scriptmodule__icon draghandle" sorterhandle>&#xF1DD;</span>
                            <span class="list-content__row-cell list-content__row-cell--50">{{
                                getVariableName(varItem)
                                }}</span>
                            <span class="list-content__row-cell list-content__row-cell--45">{{
                                getVariableValue(varItem)
                                }}</span>
                            <a class="button__icon" @mouseenter.stop="openContextMenu($event, index)">&#xF1D9;</a>
                        </li>
                    </ol>
                    <!-- Context menu -->
                    <div v-show="contextMenuVisible"
                         :style="{left: contextMenuLocation.x - 180 + 'px', top: contextMenuLocation.y -10 + 'px' }"
                         class="list-content__row-menu">
                        <ol @mouseleave="contextMenuVisible = false">
                            <li class="list-content__menu-item" @click="editVar()">
                                <span>&#xF3EB;</span>{{ store.state.settings.scriptmanager.edit }}
                            </li>
                            <li class="list-content__menu-item" @click="deleteVar()">
                                <span>&#xFA78;</span>{{ store.state.settings.scriptmanager.delete }}
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <!-- SETVAR MODULE MODAL -->
        <div v-if="setVarOpen" class="scriptform__modal scriptform__modal--visible">
            <div class="scriptform__lookup-select setvar-modal" style="max-height: 80vh; overflow-y: auto;">
                <div class="scriptform-row module-container">
                    <template v-for="(uiitem, index) in varItems[currentSubDefinitionIx]" :key="index">
                        <component
                                :is="getComponent(uiitem.UIElement)"
                                v-if="uiitem.ShowField"
                                :class="colWidth(uiitem.UIElement)"
                                :params="uiitem"
                                :propsopen="propsOpen"
                                :selectedcustomerid="selectedcustomerid"
                                :showlabel="uiitem.ArrayId === null || uiitem.RowId === 0"
                                :style="{ width: getWidthPercentage(uiitem) + '%' }"
                                @propchanged="propIsChanged()"
                                @titlevalue="getTitleValue"></component>
                        <div v-if="uiitem.Fill"
                             :style="getFillWidth()"></div>
                    </template>
                </div>
                <div class="footer">
                    <button v-show="adding" class="button-primary button-primary--gray" type="button"
                            @click="cancelAddVar()">
                        {{ store.state.settings.scriptbuilder.cancellbl }}
                    </button>
                    <button class="button-primary" type="button" @click="saveVar()">
                        {{ store.state.settings.scriptbuilder.acceptlbl }}
                    </button>
                </div>
            </div>
        </div>
        <!-- /SETVAR MODAL -->
    </div>
</template>

<style lang="css" scoped>
.module-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding-left: 20px !important;
    padding-right: 20px !important;
}

.scriptmodule__props {
    overflow-y: auto;
    pointer-events: auto;
}

.col-large {
    grid-column: 1 / 3;
}

.scriptform__checkbox {
    margin-top: 0;
}

@media only screen and (max-width: 768px) {
    .container {
        grid-template-columns: 1fr;
    }

    .col-large {
        grid-column: 1 / -1;
    }
}

.setvar-modal {
    background-color: #ededed !important;
    width: 700px;
}

.setvar-modal button {
    margin-right: 10px;
}

.clickable {
    cursor: pointer;
}

.list-close {
    width: 0;
    height: 40px;
    right: 10px;
    top: 0;
    background-color: transparent;
}

.list-close a {
    z-index: 100;
}

.scriptform__lookup-select {
    padding: 20px;
}

.scriptform__modal {
    z-index: 10001
}

.var-list {
    margin-top: 10px;

    padding-left: 20px !important;
    padding-right: 20px !important;
}

.var-list #add-var-btn {
    position: relative;
    top: 10px;
    width: 100%;
    display: block;
    text-align: right;
}

.grid-row.buttons {
    margin-top: 10px;
    text-align: right;
}

.grid-row.buttons button:first-child {
    margin-right: 10px;
}

.footer {
    text-align: right;
}

.list-content {
    overflow-y: hidden;
}

.list-content__row {
    height: 30px;
    line-height: 30px;
    font-size: 0.7rem;
}

.list-content__row .button__icon {
    height: 30px;
    width: 30px;
    line-height: 30px;
    font-size: 1rem;
    margin: 0;
}

.list-content__row .scriptmodule__icon {
    height: 30px;
    width: 30px;
    line-height: 30px;
}

.list-content__row .list-content__row-cell {
    height: 30px;
}
</style>