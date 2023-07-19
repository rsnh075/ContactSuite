<script lang="ts" setup>
import * as uiComponents from './moduleComponents';
import * as uiElements from './uiElements';
import {coordsElementInViewport} from '@/use/helperFunctions';
import {computed, nextTick, onBeforeMount, ref} from 'vue';
import {useStore} from 'vuex';
import {handleArrayItems} from '@/components/scriptmanager/scriptHelperFunctions';

const store = useStore();
const props = defineProps(['branch', 'modnumber', 'selectedcustomerid', 'modulefunction']);
const emit = defineEmits(['propsopen']);
const propsOpen = ref(false);
const titleValue = ref('');
const arrowActive = ref(false);
const currentValue = ref('');
const propToggle = ref();
const moduleTitleField = ref<HTMLInputElement | null>(null);

const colWidth = type => {
    switch (type) {
        case 8:
        case 10:
        case 11:
            return 'col-large';
        default:
            return 'col-small';
    }
};

let totalColPercentage = 0;
const getWidthPercentage = uiitem => {
    if (colWidth(uiitem.UIElement) === 'col-large') return 100;
    const size = uiitem.ColumnSize.split(',');
    let res = size[0] / size[1] * 100 - 1;
    totalColPercentage += res;
    return res;
};
const getFillWidth = () => {
    const res = 100 - (totalColPercentage % 100);
    totalColPercentage = 0;
    return res;
};

const checkOptionalBtn = id => id === 105;

const positionProps = (srcEl, targetEl) => {
    if (!srcEl || !targetEl) return;
    let _pos;

    targetEl.classList.remove('fliped');
    _pos = coordsElementInViewport(srcEl, targetEl, 'fliped');
    targetEl.style.top = _pos.top + 'px';
    targetEl.style.left = _pos.left + 'px';
    targetEl.style.overflow = 'auto';
    targetEl.style.maxHeight = `${_pos.availableHeight}px`;

    targetEl.classList.add(_pos.className);
};

// element 9 and 16 are both the varbuilder component, but with slightly different behavior
const getComponent = (type) => uiComponents[`uiComponent_${type === 16 ? 9 : type}`];
const getUiElements = id => uiElements['UiElement_' + id];

const toggleProps = () => {
    // console.log('toggleProps');

    let _props = propToggle.value.querySelector('.scriptmodule__props');
    if (_props === null) {
        return; // no props to toggle
    }
    [].slice.call(document.querySelectorAll('.scriptmodule__props')).forEach(el => {
        if (el !== _props) el.style = '';
    });
    document.querySelector('.scriptmodule__modulepicker').classList.remove('scriptmodule__modulepicker--open');
    nextTick(() => {
        positionProps(propToggle.value, _props);
        if (_props.offsetHeight !== 0) {
            _props.style.display = 'none';
            store.commit('SET_SCRIPT_PROPS', {
                props: props.branch.ModuleParameters,
                name: props.branch.Name ?? props.modulefunction.Name,
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
    })
};

const propIsChanged = (uiitem) => {
    let _valParam = props.branch.ModuleParameters.find(param => param.IsModuleText);
    currentValue.value = (typeof _valParam !== 'undefined' && _valParam !== -1) ? _valParam.CurrentValue : currentValue.value;
    handleArrayItems(uiitem.ArrayId, props.branch.ModuleParameters);
    store.commit('SET_SCRIPT_PROPS', {
        props: props.branch.ModuleParameters,
        name: props.branch.Name ?? props.modulefunction.Name,
        numberToChange: props.modnumber,
        selectedLabel: titleValue.value
    });
};

const getTitleValue = val => {
    titleValue.value = val;
};

const closeProps = () => {
    toggleProps();
};
defineExpose({
    closeProps
});

// remove extra tab components, we want to send them to 1 component with multiple uiitems
const groupedBranchParameters = computed(() => {
    return props.branch.ModuleParameters.filter((obj, index, self) => {
        if (obj.UIElement === 11) {
            return index === self.findIndex((o) => o.UIElement === 11);
        }
        return true;
    });
});

const groupedByArrayParameters = computed(() => {
    let subArrays = [];

    // Initialize a counter for the sub-array index
    let subArrayIndex = 0;

    // Iterate through the uiitems array
    for (let i = 0; i < groupedBranchParameters.value.length; i++) {
        // Get the current uiitem and its ArrayId
        const uiitem = groupedBranchParameters.value[i];
        const arrayId = uiitem.ArrayId;

        // If the current ArrayId is null or different from the previous one,
        // create a new sub-array and increment the subArrayIndex counter
        if (arrayId !== groupedBranchParameters.value[i - 1]?.ArrayId) {
            subArrays[subArrayIndex] = [];
            subArrayIndex++;
        }

        // Add the current uiitem to the last sub-array in the subArrays array
        subArrays[subArrayIndex - 1].push(uiitem);
    }
    return subArrays;
});

const getUIItem = (uiitem) => {
    // if it's a tab component, get all tabs
    if (uiitem.UIElement !== 11) {
        return uiitem;
    }
    return props.branch.ModuleParameters.filter(e => e.TabId === uiitem.TabId).sort((a, b) => a.SubId - b.SubId);
};

onBeforeMount(() => {
    let _valParam = props.branch.ModuleParameters.find(param => param.IsModuleText);
    currentValue.value = (_valParam && _valParam !== -1) ? _valParam.CurrentValue : currentValue.value;
});

const dragImage = ref(null);
const onDragStart = (clientId, event) => {
    dragFromId.value = clientId;
    // set drag img, because the default is not the correct display
    event.dataTransfer.setDragImage(dragImage.value, 0, 0);
    event.dataTransfer.setData('text/plain', 'Drag item');
};

const onDrop = (dropToItem) => {
    if (dropToItem.CurrentValue === '' || dropToItem.ClientId === dragFromId.value) {
        resetDragDrop();
        return;
    }

    const newIx = props.branch.ModuleParameters.findIndex(i => i.ClientId === dropToItem.ClientId);
    const oldIx = props.branch.ModuleParameters.findIndex(i => i.ClientId === dragFromId.value);
    moveModuleParameterItem(dropToItem.ArrayId, oldIx, newIx);
    resetDragDrop();
};

const resetDragDrop = () => {
    dragFromId.value = '';
    highlightId.value = '';
};

const moveModuleParameterItem = (arrayId, currentIndex, newIndex) => {
    if (newIndex >= props.branch.ModuleParameters.length) {
        let k = newIndex - props.branch.ModuleParameters.length + 1;
        while (k--) {
            props.branch.ModuleParameters.push(undefined);
        }
    }
    props.branch.ModuleParameters.splice(newIndex, 0, props.branch.ModuleParameters.splice(currentIndex, 1)[0]);

    renumRows(arrayId);
};

const renumRows = (arrayId) => {
    let ix = 0;
    props.branch.ModuleParameters
        .filter((item) => item.ArrayId === arrayId)
        .forEach((item) => {
            item.RowId = ix++;
        });
};

const hasParameters = computed(() => props.branch.ModuleParameters.length > 0);
const dragFromId = ref('');
const highlightId = ref('');
const hasEmptyMandatory = computed(() => props.branch.ModuleParameters.some(item => item.Mandatory && item.CurrentValue === ''));
const moduleDescription = computed(() => props.branch?.Name ?? props.modulefunction?.Name ?? '');

</script>

<template>
    <div>
        <div ref="propToggle"
             :class="['scriptmodule__content', {'scriptmodule__content--hover' : arrowActive}, {'is-invalid' : hasEmptyMandatory }]"
             :data-modulenumber="branch.ModuleNumber" data-e2e="default-module">
            <div :class="{ 'clickable': hasParameters}" class="prop-header" @click.stop="toggleProps()">
                <!-- <span style="float: left;">{{ branch.ModuleNumber }}</span> -->
                <!-- ICON, TITLE AND SELECTED VALUE -->
                <span class="scriptmodule__icon child--js" v-html="modulefunction?.IconCode ?? ''"></span>
                <!-- OPTIONAL BTNS -->
                <div v-if="checkOptionalBtn(branch.ModuleId)" class="scriptmodule__optional-element--btn">
                    <component
                            :is="getUiElements(branch.ModuleId)"
                            :currentvalue="currentValue"
                            :selectedcustomerid="selectedcustomerid">
                    </component>
                </div>
                <div
                        :class="['scriptmodule__name-wrapper child--js', {'scriptmodule__name-wrapper--indent' : checkOptionalBtn(branch.ModuleId)}]">
                    <span class="scriptmodule__name child--js description-text" v-html="moduleDescription"></span>
                    <span v-if="titleValue !== ''" class="scriptmodule__name-label child--js"
                          v-html="titleValue"></span>
                </div>
            </div>

            <div v-if="hasParameters" class="scriptmodule__props">
                <div class="list-close">
                    <a @click.stop="toggleProps()"><span></span> <span></span></a>
                </div>

                <!-- MODULE PARAMS -->
                <!-- TITLE FIELD -->
                <div class="scriptform-row">
                    <div class="scriptform-unit--alpha">
                        <div class="scriptform__textfield">
                            <label class="scriptform-label" for="module-title">{{
                                store.state.settings.scriptmanager.modulename
                                }}</label>
                            <input ref="moduleTitleField"
                                   v-model="branch.Name"
                                   name="module-title"
                                   type="text"
                                   autofocus
                                   @keyup="propIsChanged">
                        </div>
                    </div>
                </div>

                <!-- MODULE PARAMS FIELDS -->
                <div class="scriptform-row module-container">
                    <div ref="dragImage" class="drag-img"></div>
                    <template v-for="itemArr in groupedByArrayParameters">
                        <template v-if="itemArr[0].ArrayId === null">
                            <template v-for="uiitem in itemArr" :key="uiitem.ClientId">
                                <component
                                        :is="getComponent(uiitem.UIElement)"
                                        v-if="uiitem.ShowField"
                                        :class="colWidth(uiitem.UIElement)"
                                        :params="getUIItem(uiitem)"
                                        :propsopen="propsOpen"
                                        :selectedcustomerid="selectedcustomerid"
                                        :showlabel="uiitem.ArrayId === null || uiitem.RowId === 0"
                                        :style="{ width: getWidthPercentage(uiitem) + '%' }"
                                        sortable="true/false"
                                        @propchanged="propIsChanged(uiitem)"
                                        @titlevalue="getTitleValue"></component>
                                <div v-if="uiitem.Fill"
                                     :style="getFillWidth()"></div>
                            </template>
                        </template>
                        <template v-else>
                            <div class="array-container">
                                <template v-for="uiitem in itemArr" :key="uiitem.ClientId">
                                    <div :class="{ dragover: highlightId === uiitem.ClientId && uiitem.CurrentValue !== '' }"
                                         :draggable="uiitem.CurrentValue !== ''"
                                         :style="{ width: getWidthPercentage(uiitem) + '%' }"
                                         class="drag-item"
                                         @dragstart="onDragStart(uiitem.ClientId, $event)"
                                         @dragover.prevent
                                         @dragenter.stop="highlightId = uiitem.ClientId"
                                         @drop.stop="onDrop(uiitem)">
                                        <div class="draghandle" style="display: inline-block;">
                                            <div class="scriptmodule__icon ">&#xF1DD;</div>
                                        </div>
                                        <component
                                                :is="getComponent(uiitem.UIElement)"
                                                v-if="uiitem.ShowField"
                                                :class="colWidth(uiitem.UIElement)"
                                                :params="getUIItem(uiitem)"
                                                :propsopen="propsOpen"
                                                :selectedcustomerid="selectedcustomerid"
                                                :showlabel="uiitem.ArrayId === null || uiitem.RowId === 0"
                                                style="display: inline-block; width: calc(100% - 36px);"
                                                @propchanged="propIsChanged(uiitem)"
                                                @titlevalue="getTitleValue"></component>
                                        <div v-if="uiitem.Fill"
                                             :style="getFillWidth()"></div>
                                    </div>
                                </template>
                            </div>
                        </template>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "@/scss/includes/globals";

.is-invalid {
  outline: 2px solid globals.$color-warning;
}

.drag-img {
  border: 1px dashed black;
  width: 280px;
  height: 40px;
  background-color: #EDEDED;
  position: absolute;
  left: -1000px;
  top: -1000px;
}

.drag-item {
  border: 1px dashed transparent;
}

.scriptmodule__props {
  overflow-y: auto;
  pointer-events: auto;
}

.dragover {
  border-color: black;
}

.clickable {
  cursor: pointer;
}

.draghandle:hover {
  cursor: grab;
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

.module-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-left: 20px !important;
  padding-right: 20px !important;
}

.array-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-left: 20px !important;
  padding-right: 20px !important;
  width: 100%;
}

.col-large {
  grid-column: 1 / 3;
}

@media only screen and (max-width: 768px) {
  .module-container {
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

.grid-row.buttons {
  margin-top: 10px;
  text-align: right;
}

.grid-row.buttons button:first-child {
  margin-right: 10px;
}
</style>