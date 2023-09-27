<script setup>
/**
 *
 * flyout with search and select
 * selectedvalue === null || "null" triggers default selected
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

import { dynamicSort } from './../../use/sortFunctions'
import { useStore } from 'vuex';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

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
    selectedvalue: {
        default: null,
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

const emit = defineEmits(['changed']);

const currentLabel = ref(""),
    currentValue = ref(null),
    selectSearchFlyOutWrapper = ref(null),
    optionsWrapper = ref(null),
    maxHeightOptions = ref("300"),
    searchStr = ref(""),
    filteredOptions = ref([]);

function isIterable(input) {
  if (input === null || input === undefined) {
    return false;
  }
  return typeof input[Symbol.iterator] === 'function';
}

watch(() => props.options, (newVal, oldVal) => {
    filteredOptions.value = isIterable(newVal) ? [...newVal] : [];
    if (!props.selectedvalue || !newVal) {
        currentValue.value = props.selectedvalue;
        currentLabel.value = props.defaultlabel;
    } else {
        currentValue.value  = props.selectedvalue;
        let _selOption     = newVal.find(opt => opt[props.valueproperty] == props.selectedvalue);
        if(_selOption) {
            currentLabel.value  = createLabel(_selOption[props.labelproperty], _selOption[props.iconproperty]);
        }
    }
    emit("changed", currentValue.value);
});

watch(() => props.selectedvalue, (newVal, oldlal) => {
    if (newVal && newVal !== '' && newVal !== "null") {
        currentValue.value = newVal;
        let _selOption = props.options ? props.options.find((opt) => opt[props.valueproperty] == newVal) : null;
        if (_selOption) {
            currentLabel.value = createLabel(_selOption[props.labelproperty], _selOption[props.iconproperty]);
        } else {
            currentLabel.value = props.defaultlabel;
        }
    } else {
        currentValue.value = "null";
        currentLabel.value = props.defaultlabel;
    }
});

const createLabel = (label, icon = null, color = null) => {
    let _stylestr = "";
    if (icon && !icon.startsWith("&#x")) icon = "&#x" + icon;

    _stylestr = color ? `font-size:${props.iconsize};color:${color}` : `font-size:${props.iconsize}`;

    return icon === null || icon === "null" ? label : `<span class="select--js" style="${_stylestr}">${icon}</span>${label}`;
};

const setCurrentLabel = () => {
    let _selOption = props.options.find((opt) => opt[props.valueproperty] == currentValue.value);
    if (_selOption) {
        currentLabel.value = createLabel(_selOption[props.labelproperty], _selOption[props.iconproperty], _selOption[props.iconcolorproperty]);
    } else {
        //return default selectedvalue because _selOption was not found in optionlist
        currentLabel.value = props.defaultlabel;
        currentValue.value = "null";
        emit("changed", currentValue.value);
    }
};

const selectValue = (evt) => {
    let _target = evt.target,
        _option = [..._target.classList].find((cls) => cls.indexOf("--js") != -1);

    if (_option === "select--js") {
        currentValue.value = _target.getAttribute("data-value") ? _target.getAttribute("data-value") : _target.parentElement.getAttribute("data-value");
        if (currentValue.value != "null") {
            [...optionsWrapper.value.querySelectorAll("LI")].forEach((option) => option.classList.remove("select-search-fly-out__option--selected"));
            _target.classList.add("select-search-fly-out__option--selected");
            setTimeout(setCurrentLabel);
            emit("changed", currentValue.value);
        } else {
            currentLabel.value = props.defaultlabel;
            [...optionsWrapper.value.querySelectorAll("LI")].forEach((option) => option.classList.remove("select-search-fly-out__option--selected"));
            emit("changed", currentValue.value);
        }
    }
    toggleOptions();
};

const filterList = () => {
    if (searchStr.value != "") {
        filteredOptions.value = props.options.filter((item) => item[props.labelproperty].toLowerCase().indexOf(searchStr.value.toLowerCase()) != -1);
    } else {
        filteredOptions.value = props.options;
    }

    filteredOptions.value.sort(dynamicSort(props.labelproperty));
};

const handleToggle = (evt) => {
    if (evt.target.classList.contains("toggle--js") && !props.disabled) {
        if (optionsWrapper.value.classList.contains("select-search-fly-out__optionlist--open")) {
        } else {
            //first close all open select searches
            let _openinstances = [].slice.call(document.querySelectorAll(".select-search-fly-out__optionlist--open"));
            _openinstances.forEach((el) => {
                el.classList.remove("select-search-fly-out__optionlist--open");
            });
        }
        toggleOptions();
    }
};

const toggleOptions = () => {
    maxHeightOptions.value = window.innerHeight - selectSearchFlyOutWrapper.value.getBoundingClientRect().top - 100;
    optionsWrapper.value.style["max-height"] = maxHeightOptions.value + "px";

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

onMounted(() => {
    if (props.selectedvalue !== null) {
        currentValue.value = props.selectedvalue;
        setCurrentLabel();
    } else {
        currentLabel.value = props.defaultlabel;
    }
    filteredOptions.value = [...props.options];

    window.addEventListener('click', clickHandler, false);
});

onBeforeUnmount(() => {
    window.removeEventListener('click', clickHandler, false);
});

</script>

<template>
    <div class="select-search-fly-out__wrapper selectsearchflyout--js" ref="selectSearchFlyOutWrapper" @click="handleToggle($event)" data-e2e="select-search-flyout">
        <a :class="['select-search-fly-out__button', 'toggle--js', {'select-search-fly-out__button--disabled' : props.disabled}]"></a>
        <div :class="['select-search-fly-out__selected', 'toggle--js', {'select-search-fly-out__selected--disabled' : props.disabled}]" v-html="currentLabel"></div>
        <div class="select-search-fly-out__optionlist" ref="optionsWrapper">
            <div class="select-search-fly-out__optionlist-search">
                <input type="text" v-model="searchStr" :placeholder="store.state.settings.selectsearchflyout.searchtxt" @keyup="filterList()" />
            </div>
            <ul @click="selectValue($event)" :data-selectedval="currentValue">
                <li class="select-search-fly-out__option select--js" data-value="null" v-html="props.defaultlabel"></li>
                <li v-for="option in filteredOptions" :key="option[props.valueproperty]" class="select-search-fly-out__option select--js" :data-value="option[props.valueproperty]" v-html="createLabel(option[props.labelproperty], option[props.iconproperty], option[props.iconcolorproperty])"></li>
            </ul>
        </div>
    </div>
</template>

<style lang="scss" scoped>
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
    height: auto;
    min-height: 120px;
    overflow: hidden;
    overflow-y: auto;
    list-style-type: none;
    padding: 5px;
    background-color: globals.$color-white;
    border: 1px solid globals.$color-gray20;
    z-index: 1000;
    display: none;
    &--open {
        display: block;
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
        span {
            color: globals.$color-white;
        }
    }
}
</style>