<script lang="ts">
export default {
    name : 'inputselectfield'
};
</script>

<script setup lang="ts">
/**
 *
 * select not for primitive arrays
 *
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 1.0
 *
 * @todo
 *
 */

import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import InputSelectProps from '../../types/InputSelectProps';

const props = defineProps({
    inputselectfield : {
        type     : InputSelectProps,
        default  : new InputSelectProps(),
        required : false
    }
});

const emits = defineEmits(['changevalue', 'inputfocus']);

let inputIsFocused = ref(false);

const optionsWrapper = ref(null),
    showInputOptions = ref(false),
    pickedIndex = ref(-1);

const toggleInputDropdown = () => {
    showInputOptions.value = !showInputOptions.value;
};

const changeValue = (val:string):void => {
    emits('changevalue', val);
};

const OptionsListIsClicked = (evt) => {
    let _selectedValue = evt.target.attributes['data-value'].value,
        _selectedIndex = props.inputselectfield.options.findIndex(o => o.value == _selectedValue);
    optionIsClicked(_selectedValue, _selectedIndex);
};

const optionIsClicked = (selected:string, selectedindex:number):void => { //ANCHOR CLICK
    let _list: any    = optionsWrapper.value;
    if (pickedIndex.value != -1) {
        _list.children[pickedIndex.value].removeAttribute('style');
    }
    _list.children[selectedindex].setAttribute('style', 'background-color: #09F;color:#FFF');
    pickedIndex.value = selectedindex;

    changeValue(selected)
    showInputOptions.value    = false;
};

const searchInOptions = (str:string):object => {
    if (!str) return null;
    let _containsInputStr = props.inputselectfield.options.find(item => {
        if (props.inputselectfield.inputtolowercase ? item.label.toLowerCase().startsWith(str) : item.label.startsWith(str)) {
            return item;
        }
        if (props.inputselectfield.searchoptionsalsoby && item[props.inputselectfield.searchoptionsalsoby].toLowerCase().startsWith(str)) {
            return item;
        }
    });
    return _containsInputStr ? _containsInputStr : null;
};

const handleKeyDown = (evt:any):void => {
    let _currentIndex         = pickedIndex.value,
        _listLength           = props.inputselectfield.options.length,
        _list: any            = optionsWrapper.value;

    if (evt.key == 'Enter' && pickedIndex.value > -1) {
        evt.preventDefault();
        showInputOptions.value = false;
        changeValue(props.inputselectfield.options[pickedIndex.value].value);
    }

    if (evt.key == 'Escape') {
        showInputOptions.value = false;
    }

    if (evt.key == 'Backspace' && pickedIndex.value > -1 && showInputOptions.value == true) {
        changeValue(props.inputselectfield.options[pickedIndex.value].value);
    }

    if (evt.key == 'ArrowUp' && pickedIndex.value > -1) {
        pickedIndex.value--;
        showInputOptions.value = true;
    }

    if (evt.key == 'ArrowDown' && pickedIndex.value < _listLength-1) {
        pickedIndex.value++;
        showInputOptions.value = true;
    }

    if (_currentIndex !== pickedIndex.value && pickedIndex.value > -1) {
        if (evt.key == 'ArrowDown' || evt.key == 'ArrowUp') {
            changeValue(props.inputselectfield.options[pickedIndex.value].value);
        }
        if (_currentIndex > -1) {
            _list.children[_currentIndex].removeAttribute('style');
        }
        _list.children[pickedIndex.value].setAttribute('style', 'background-color: #09F;color:#FFF');
    }
}

const handleKeyUp = (evt:any):void => {
    let _inputVal: string  = props.inputselectfield.inputtolowercase ? String(evt.target.value).toLowerCase() : String(evt.target.value),
        _list: any         = optionsWrapper.value,
        _selected: any     = searchInOptions(_inputVal);

    if (_selected && (evt.key !== 'Enter' || evt.key !== 'Escape' || evt.key !== 'ArrowDown' || evt.key !== 'ArrowUp')) {
        let _index                  = props.inputselectfield.options.indexOf(_selected);

        _list.parentNode.scrollTop  = _list.children[_index].offsetTop - 10;

        if (_selected.value == _inputVal) {
            changeValue(_selected.value);
        }

        if (pickedIndex.value > -1) {
            _list.children[pickedIndex.value].removeAttribute('style');
        }
        pickedIndex.value           = _index;
        _list.children[pickedIndex.value].setAttribute('style', 'background-color: #09F;color:#FFF');
    }

    if (!_selected && (evt.key !== 'Enter' || evt.key !== 'Escape' || evt.key !== 'ArrowDown' || evt.key !== 'ArrowUp')) {
        if (pickedIndex.value > -1) {
            _list.children[pickedIndex.value].removeAttribute('style');
        }
        pickedIndex.value       = -1;
        showInputOptions.value = false;
        changeValue(_inputVal);
    }
}

onMounted(() => {
    document.addEventListener('click', () => showInputOptions.value = false, false);
});

onUnmounted(() => {
    document.removeEventListener('click', () => showInputOptions.value = false, false);
});

</script>

<template>
    <div :class="['inputselectfield', {'inputselectfield--showarrow' : !inputIsFocused}]" data-e2e="input-select">
        <input type="text" :title="inputselectfield.currentvalue" :value="inputselectfield.currentvalue"
            @click.stop.prevent="toggleInputDropdown()"
            @keydown="handleKeyDown($event)"
            @keyup="handleKeyUp($event)"
            @focus="$emit('inputfocus', $event), inputIsFocused = true"
            @blur="inputIsFocused = false"
            autocomplete="off"
        >
        <div ref="optionsWrapper" class="options-wrapper" :class="{'optionsisopen' : showInputOptions}" @click="OptionsListIsClicked($event)">
            <div v-for="option in inputselectfield.options" :title="option.label" class="optionrow" :key="option.value" :data-value="option.value">{{ option.label }}</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

.inputselectfield {
    position: relative;
    background-color: transparent;
    padding-bottom: 13px;
    &--showarrow {
        &:before {
            content: "";
            position: absolute;
            width: 0;
            height: 0;
            top: calc(50% + 4px);
            right: 5px;
            border: 6px solid transparent;
            border-top-color: globals.$color-gray35;
            z-index: 2;
            pointer-events:none;
            user-select: none;
        }
    }
    input[type='text'] {
        border: none;
        border-bottom: 1px solid globals.$color-gray35;
        background-color: transparent;
        height: 40px;
        line-height: 40px;
        width: 100%;
        color: globals.$color-gray60;
        font-size: 1rem;
        margin-top: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-top: 7px;
        padding-left: 3px;
    }
    .options-wrapper {
        display: none;
        position: absolute;
        margin-top: -1px;
        z-index: 3;
        width: 100%;
        height: minmax(min-content, calc(80px + ((100vh - 365px)/2)));
        // height: 0;
        // max-height: calc(80px + ((100vh - 365px)/2));
        font-size: 1rem;
        line-height: 22px;
        overflow-y: auto;
        overflow-x: visible;
        text-overflow: ellipsis;
        white-space: nowrap;
        background-color: globals.$color-white;
        &.optionsisopen {
            display: block;
            height: auto;
            border: 1px solid globals.$color-gray60;
        }
        .optionrow {
            display: block;
            color: globals.$color-gray60;
            min-width: fit-content;
            &:hover {
                cursor: pointer;
                color: globals.$color-white;
                background-color: globals.$color-primary;
            }
        }
    }
}
</style>