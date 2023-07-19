<script setup>
/**
 *
 * flyout with search and select
 * selectedvalues [] triggers default selected
 * --selected is triggered with selected property in options list
 * --disabled is triggered with disabled property in options list
 *
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 1.0
 *
 * @todo
 * Add vertical flip, depending on available space
 * Add horizontal flip, depending on available space, align left or right with inputbox
 *
 */

import VirtualListViewer from './VirtualListViewer.vue';
import { dynamicSort } from './../../use/sortFunctions'
import { useStore } from 'vuex';
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { Close } from 'mdue';
import { deepCopy } from '../../use/helperFunctions';

const store = useStore();
const props = defineProps({
    options: {
        type: Array,
        default: [],
    },
    labelproperty: {
        type: String,
        default: "",
    },
    valueproperty: {
        type: String,
        default: "",
    },
    iconproperty: {
        type: String,
        default: "",
    },
    defaultlabel: {
        type: String,
        default: "",
    },
    iconcolorproperty: {
        type: String,
        default: "",
    },
    iconsize: {
        type: String,
        default: "1em",
    },
    disabled: {
        default: false,
    }
});

const emit = defineEmits(['changed', 'resetselected']);

const selectSearchFlyOutWrapper = ref(null),
    optionsWrapper = ref(null),
    virtualListViewerWrapper = ref(null),
    maxHeightOptions = ref("300"),
    searchStr = ref(""),
    numberOfSelected = ref(0),
    rawOptions = ref([]),
    filteredOptions = ref([]);

const calcHeight = () => {
    maxHeightOptions.value = window.innerHeight - selectSearchFlyOutWrapper.value.getBoundingClientRect().top - 100;
    optionsWrapper.value.style["height"] = calcFlyoutHeight();
    virtualListViewerWrapper.value.style["height"] = calcVirtualListHeight();
}

const calcFlyoutHeight = () => {
    return `${
        Math.floor(maxHeightOptions.value) < filteredOptions.value.length * 35 + 70 ?
            Math.floor(maxHeightOptions.value) :
            filteredOptions.value.length * 35 + 70
    }px`;
}

const calcVirtualListHeight = () => {
    return `${
        Math.floor(maxHeightOptions.value) < filteredOptions.value.length * 35 + 70 ?
        Math.floor(maxHeightOptions.value - 70) :
        filteredOptions.value.length * 35
    }px`
}

const filterList = () => {
    if (searchStr.value != "") {
        filteredOptions.value = rawOptions.value.filter((item) => item[props.labelproperty].toLowerCase().indexOf(searchStr.value.toLowerCase()) != -1);
    } else {
        filteredOptions.value = rawOptions.value;
    }

    filteredOptions.value.sort(dynamicSort(props.labelproperty));
};

watch(() => props.options, (newVal, oldVal) => {
    if (!props.options) return;
    rawOptions.value = deepCopy(newVal);
    filteredOptions.value = [...rawOptions.value];
    filterList();
    numberOfSelected.value = rawOptions.value.reduce((total, option) => total + (option.selected ? 1 : 0), 0);
}, {deep:true, immediate:true});

const createLabel = (label, icon = null, color = null) => {
    let _stylestr = "";
    if (icon && !icon.startsWith("&#x")) icon = "&#x" + icon;

    _stylestr = color ? `font-size:${props.iconsize};color:${color}` : `font-size:${props.iconsize}`;

    return icon === null || icon === "null" ? label : `<span class="select--js" style="${_stylestr}">${icon}</span>${label}`;
};

const handleLiClick = (option) => {
    if (option === "null") {
        emit("changed", null);
    } else {
        emit("changed", option);
    }
};

const resetFilterList = () => {
    searchStr.value = "";
    filterList();
}

const handleToggle = (evt) => {
    if (evt.target.classList.contains("toggle--js") && !props.disabled) {
        calcHeight();

        nextTick(() => {
            if (optionsWrapper.value.classList.contains("select-search-fly-out__optionlist--open")) {
            } else {
                //first close all open select searches
                let _openinstances = [].slice.call(document.querySelectorAll(".select-search-fly-out__optionlist--open"));
                _openinstances.forEach((el) => {
                    el.classList.remove("select-search-fly-out__optionlist--open");
                });
            }
            toggleOptions();
        })
    }
};

const toggleOptions = () => {
    optionsWrapper.value.classList.toggle("select-search-fly-out__optionlist--open");
};

const closeFlyout = () => {
    if (optionsWrapper.value.classList.contains("select-search-fly-out__optionlist--open")) {
        optionsWrapper.value.classList.remove("select-search-fly-out__optionlist--open");
    }
};

const clickHandler = (evt) => {
    if (!evt.target.closest('.selectsearchflyout--js') && !evt.target.classList.contains('toggle--js')) {
        closeFlyout();
    }
};

const resetSelected = () => {
    emit("resetselected");
}

onMounted(() => {
    window.addEventListener('click', clickHandler, false);
});

onBeforeUnmount(() => {
    window.removeEventListener('click', clickHandler, false);
});

</script>

<template>
    <div class="select-search-fly-out__wrapper selectsearchflyout--js" ref="selectSearchFlyOutWrapper" @click="handleToggle($event)" data-e2e="select-search-flyout">
        <a :class="['select-search-fly-out__button', 'toggle--js', {'select-search-fly-out__button--disabled' : props.disabled}]"></a>
        <div
        :class="[
            'select-search-fly-out__selected', 'toggle--js',
            {'select-search-fly-out__selected--disabled' : props.disabled}
        ]"
        >
        <Close v-if="numberOfSelected > 0" class="select-search-fly-out__optionlist__clearselected" @click="resetSelected" />
        {{ numberOfSelected && numberOfSelected > 0 ?
            `${numberOfSelected} ${store.state.settings.multiselectsearchflyout.numberselected}` :
            props.defaultlabel }}
        </div>
        <div class="select-search-fly-out__optionlist" ref="optionsWrapper">
            <div class="select-search-fly-out__optionlist-search">
                <input type="text" v-model="searchStr" :placeholder="store.state.settings.selectsearchflyout.searchtxt" @keyup="filterList()" />
                <Close v-if="searchStr.length > 0" class="select-search-fly-out__optionlist-search__clear" @click="resetFilterList" />
            </div>
            <div class="select-search-fly-out__list-content" ref="virtualListViewerWrapper">
                <VirtualListViewer
                    class="select-search-fly-out__list-content__vlist"
                    :style="{height: calcVirtualListHeight()}"
                    v-if="filteredOptions && filteredOptions.length > 0"
                    :data = "filteredOptions"
                    rowClasses="select-search-fly-out__list-content__voption"
                >
                    <template v-slot="{ row, index }">
                        <div
                        :key="row[props.valueproperty]"
                        :class="[
                            'select-search-fly-out__option select--js',
                            {'select-search-fly-out__option--selected' : row.selected},
                            {'select-search-fly-out__option--disabled' : row.disabled}
                        ]"
                        :data-value="row[props.valueproperty]"
                        @click="handleLiClick(row)"
                        v-html="createLabel(row[props.labelproperty], row[props.iconproperty], row[props.iconcolorproperty])"
                        />
                    </template>
                </VirtualListViewer>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
@use "@/scss/includes/functions";
@use "@/scss/includes/globals";

.select-search-fly-out__wrapper {
    position: relative;
    width: 100%;
}

.select-search-fly-out__button {
    position: absolute;
    width: 30px;
    height: 40px;
    top: 12px;
    right: 0;
    cursor: pointer;
    &:before {
        content: "";
        position: absolute;
        width: 0;
        height: 0;
        top: calc(50% + 2px);
        left: calc(100% - 20px);
        border: 6px solid transparent;
        border-top-color: globals.$color-gray35;
        z-index: 2;
        pointer-events: none;
        user-select: none;
    }
    &--disabled {
        opacity: 0;
    }
}

.select-search-fly-out__selected {
    position: relative;
    display: block;
    float: left;
    border-bottom: 1px solid globals.$color-gray35;
    background-color: transparent;
    height: 40px;
    line-height: 40px;
    width: 100%;
    padding: 5px 30px 0 3px;
    color: globals.$color-gray60;
    font-size: 1rem;
    margin-top: 9px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: default;
    user-select: none;
    box-shadow: inset 0 -30px 0px 0px rgba(0,0,0,.025);
    &--disabled {
        border-bottom: none;
        box-shadow: none;
        color: #000;
        user-select: none;
        opacity: 1;
    }
    span {
        width: 30px;
        height: 40px;
        text-align: left;
        margin-right: 5px;
        // @include font-icon();
        font-family: "Material Design Icons";
        font-size: 0.9em;
        color: globals.$color-gray35;
        float: left;
    }
}

.select-search-fly-out__optionlist {
    position: absolute;
    top: 52px;
    left: 0;
    width: 100%;
    // height: auto;
    min-height: 70px;
    overflow: hidden;
    // overflow-x: hidden;
    // overflow-y: auto;
    list-style-type: none;
    padding: 5px;
    background-color: globals.$color-white;
    border: 1px solid globals.$color-gray20;
    z-index: 1000;
    display: none;
    &--open {
        display: block;
    }
    &__clearselected {
        position: relative;
        vertical-align: middle;
        font-size: 1rem;
        font-weight: normal;
        font-style: normal;
        cursor: pointer;
        color: globals.$color-gray40;
    }
    &-search {
        padding: 15px 10px 15px 10px;
        position: relative;
        &:before {
            content: "\F349";
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            font-family: "Material Design Icons";
            font-size: 1.2rem;
            font-weight: normal;
            font-style: normal;
            color: globals.$color-gray30;
        }
        input {
            text-indent: 20px;
            border: none;
            border-bottom: 1px solid globals.$color-gray30;
            width: 100%;
            color: globals.$color-gray60;
            font-size: 0.9rem;
            line-height: 1.6rem;
        }
        &__clear {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 1rem;
            font-weight: normal;
            font-style: normal;
            cursor: pointer;
            color: globals.$color-gray40;
        }
    }
}

.select-search-fly-out__list-content {
    min-height: 35px;
    position: relative;
    min-height: calc(100%);
    // overflow-x: hidden;
    // overflow-y: overlay;
    &__vlist {
        position: relative;
        height: calc(100%);
        min-height: calc(100% - 70px);
        overflow-x: hidden;
        overflow-y: overlay;
        &__voption {
            width: 100%;
        }
    }
}

.select-search-fly-out__option {
    height: 35px;
    line-height: 35px;
    width: calc(100% + 15px);
    margin-left: -5px;
    padding-right: 10px;
    padding-left: 10px;
    color: globals.$color-gray60;
    text-overflow: ellipsis;
    overflow: hidden;
    width: calc(100% + 15px);
    white-space: nowrap;
    cursor: default;
    span {
        width: 30px;
        height: 40px;
        text-align: left;
        margin-right: 5px;
        // @include font-icon();
        font-family: "Material Design Icons";
        font-size: 0.9em;
        color: globals.$color-gray35;
        float: left;
    }
    &:hover {
        background-color: globals.$color-gray10;
        color: globals.$color-gray60;
    }
    &--selected {
        background-color: functions.tint(globals.$color-help, 50%);
        color: globals.$color-white;
    }
    &--disabled {
        pointer-events: none;
        color: globals.$color-gray30;
        background-color: globals.$color-gray5;
    }
}
</style>