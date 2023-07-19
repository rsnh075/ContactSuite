<script setup>

import { useStore } from 'vuex';
import { Send } from 'mdue';
import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';

const props = defineProps({
    label : {
        type    : String,
        default : 'Label',
    },
    scale : {
        type    : Array,
        default : [],
    },
    lowestMin : {
        type    : Number,
        default : 0,
    },
    highestMax : {
        type    : Number,
        default : 0,
    },
    selectedMin : {
        type    : Number,
        default : 0,
    },
    selectedMax : {
        type    : Number,
        default : 0,
    }
});
const emit = defineEmits(['sendrange']);

const sendRange = (type = 'slider') => {
    if (type == 'button' && selectedMinValue.value < props.lowestMin) {
        selectedMinValue.value = props.lowestMin;
    }
    if (type == 'button' && selectedMinValue.value > props.highestMax) {
        selectedMinValue.value = props.highestMax;
    }
    if (type == 'button' && selectedMaxValue.value < props.lowestMin) {
        selectedMaxValue.value = props.lowestMin;
    }
    if (type == 'button' && selectedMaxValue.value > props.highestMax) {
        selectedMaxValue.value = props.highestMax;
    }

    selectedMinHandle.value.style.cssText = styleHandle(getPointFromScaleByValue(selectedMinValue.value));
    selectedMaxHandle.value.style.cssText = styleHandle(getPointFromScaleByValue(selectedMaxValue.value));

    emit('sendrange', selectedMinValue.value, selectedMaxValue.value);
}

const _w         = window,
    _b           = document.body,
    _d           = document.documentElement,
    store = useStore(),
    slider = ref(null),
    sliderStepWidth = computed(() => slider.value && slider.value.getBoundingClientRect().width ? slider.value.getBoundingClientRect().width / 100 : 1),
    isDragging = ref(false),
    selectedMinHandle = ref(null),
    selectedMaxHandle = ref(null),
    selectedDragHandle = ref(''),
    currentPointMin = ref(-1),
    currentPointMax = ref(-1),
    selectedMinValue = ref(0),
    selectedMaxValue = ref(0);

const reset = () => {
    selectedMinHandle.value.style.cssText = styleHandle(getPointFromScaleByValue(props.lowestMin));
    selectedMaxHandle.value.style.cssText = styleHandle(getPointFromScaleByValue(props.highestMax));
}

defineExpose({reset});

const styleHandle = (x) => {
    return "display: block;\n transform: translate3d(" + x + "px, 0, 0)";
}

//-------------Scale

const getValueByPoint = (point) => {
    let _percentage = point / sliderStepWidth.value;
    let _remainingPerc = 0;
    let _value = props.scale.reduce((acc, obj) => {
        if (_percentage > obj.Percentage) {
            acc = acc + obj.To;
        }
        if (_percentage <= obj.Percentage && _percentage > obj.Percentage - obj.Itterations) {
            _remainingPerc = (_percentage - (obj.Percentage - obj.Itterations)) * obj.Step;
            acc = acc + _remainingPerc;
        }
        return acc;
    }, 0);
    _value = Math.round(_value);
    if (_value > props.highestMax) {
        _value = props.highestMax;
    }

    return Math.round(_value);
};

const getPointFromScaleByValue = (val) => {
    if (val <= 0) {
        return 0;
    }
    let _remainingVal = 0;
    let _percentage = props.scale.reduce((acc, obj) => {
        if (val > obj.To) {
            acc = acc + obj.Itterations;
        }
        if (val <= obj.To && val >= obj.From) {
            _remainingVal = (val - obj.From) / obj.Step;
            acc = acc + _remainingVal;
        }
        return acc;
    }, 0);
    return Math.round(_percentage * sliderStepWidth.value);
};

//--------------Position in DOM

const getPoint = (e) => {
    let scrollX = Math.max( 0, _w.pageXOffset || _d.scrollLeft || _b.scrollLeft || 0 ) - ( _d.clientLeft || 0 ),
    mousePointX  = e ? ( Math.max( 0, e.pageX || e.clientX || 0 ) - scrollX ) : 0,
    sliderPointLeft = slider.value.getBoundingClientRect().left,
    sliderPointRight = slider.value.getBoundingClientRect().right,
    pointX =
        mousePointX >= sliderPointLeft &&
        mousePointX <= sliderPointRight ?
            mousePointX - sliderPointLeft :
            selectedDragHandle.value == 'min' ?
                0 :
                sliderPointRight - sliderPointLeft;
    return Math.round(pointX);
}

//-----------------Watchers

watch(() => props.lowestMin, newVal => {
    selectedMinValue.value = newVal;
    selectedMinHandle.value.style.cssText = styleHandle(getPointFromScaleByValue(props.lowestMin));
});

watch(() => props.highestMax, newVal => {
    selectedMaxValue.value = newVal;
    selectedMaxHandle.value.style.cssText = styleHandle(getPointFromScaleByValue(props.highestMax));
});

watch(() => props.selectedMin, newVal => {
    selectedMinValue.value = newVal;
});

watch(() => props.selectedMax, newVal => {
    selectedMaxValue.value = newVal;
});

//----------------Drag

let requestAnimationId;

const stopDrag = () => {
    cancelAnimationFrame(requestAnimationId);
    selectedDragHandle.value = '';
    if (isDragging.value) {
        sendRange();
    }
    isDragging.value = false;
}

const dragMin = (e) => {
    selectedDragHandle.value = 'min';
    isDragging.value = true;
    currentPointMin.value = getPoint(e);
}

const dragMax = (e) => {
    selectedDragHandle.value = 'max';
    isDragging.value = true;
    currentPointMax.value = getPoint(e);
}

const lastPointMin = ref(-1);
const lastPointMax = ref(-1);

const validateDrag = (x, minmax) => {
    if (
        minmax == 'min' && lastPointMax.value == -1 ||
        minmax == 'max' && lastPointMin.value == -1 ||
        minmax == 'min' && x < lastPointMax.value ||
        minmax == 'max' && x > lastPointMin.value
    ) {
        return true;
    } else {
        return false;
    }
}

const drag = (e) => {
    const pointX = getPoint(e);
    if (selectedDragHandle.value == 'min' && validateDrag(pointX, 'min')) {
        lastPointMin.value = pointX;
        selectedMinValue.value = getValueByPoint(pointX);
        selectedMinHandle.value.style.cssText = styleHandle(pointX);
    }
    if (selectedDragHandle.value == 'max' && validateDrag(pointX, 'max')) {
        lastPointMax.value = pointX;
        selectedMaxValue.value = getValueByPoint(pointX);
        selectedMaxHandle.value.style.cssText = styleHandle(pointX);
    }
}

const handleDrag = (e) => {
    if (!isDragging.value) return;
    requestAnimationId = requestAnimationFrame(() => drag(e));
}

onMounted(() => {
    document.addEventListener('mouseup', stopDrag, false);
    slider.value.addEventListener('mousemove', handleDrag, false);
});

onBeforeUnmount(() => {
    document.removeEventListener('mouseup', stopDrag);
    slider.value.removeEventListener('mousemove', handleDrag, false);
})

</script>

<template>
    <div class="multirangeslider-container">
        <label class="multirangslider-header">{{ label }}</label>
        <div class="multirangslider-inputs">
            <input type="number" @keyup.enter="sendRange('button')" @blur="sendRange('button')" inputmode="numeric" name="htmlinput-min" v-model="selectedMinValue" :min="lowestMin" :max="highestMax - 1">
            <input type="number" @keyup.enter="sendRange('button')" @blur="sendRange('button')" inputmode="numeric" name="htmlinput-max" v-model="selectedMaxValue" :min="lowestMin + 1" :max="highestMax">
            <!-- <button type="button" class="sendbtn" @click="sendRange('button')"><Send /></button> -->
        </div>

        <div class="multirangeslider">
            <div class="multirangeslider-slider">
                <div class="multirangeslider-track" ref="slider">
                    <div class="multirangeslider-selectedrange"></div>

                    <div class="multirangeslider-firsthandle" ref="selectedMinHandle" @mousedown="dragMin">
                        <div :title="selectedMinValue" class="multirangeslider-firsthandle-input"></div>
                    </div>

                    <div class="multirangeslider-secondhandle" ref="selectedMaxHandle" @mousedown="dragMax">
                        <div :title="selectedMaxValue" class="multirangeslider-secondhandle-input"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<style lang="scss" scoped>

@use "@/scss/includes/functions";
@use "@/scss/includes/globals";

.multirangeslider-container {
    position: relative;
    margin-top: -8px;
}
.multirangslider-header {
    font-size: 0.7rem;
    color: globals.$color-gray30;
    font-family: 'Open Sans SemiBold', sans-serif;
}

.multirangslider-inputs {
    margin: 3px 0 0 0;
    width: 100%;
    display: flex;
    gap: 10px;
    input {
        flex: 1;
        border: none;
        border-bottom: 1px solid globals.$color-gray35;
        color: globals.$color-gray60;
        box-shadow: inset 0 -30px 0px 0px rgba(0, 0, 0, 0.025);
        font-size: 0.9rem;
        line-height: 1.6rem;
        padding: 5px 0 0 3px;
    }
    .sendbtn {
        width: 40px;
        height: 32px;
        line-height: 36px;
        // margin: 6px 0 0 auto;
        color: globals.$color-gray30;
        text-align: center;
        font-size: 1.1rem;
        cursor: pointer;
        border-radius: 3px;
        &:hover {
            color: globals.$color-white;
            background-color: globals.$color-green;
        }
    }
}

.multirangeslider {
    &-slider {
        padding: 0 6px 0 10px;
        overflow: hidden;
    }
    &-track {
        position: relative;
        height: 30px;
    }
    &-selectedrange {
        position: absolute;
        left: 0;
        right: 0;
        transform: translate3d(0,0,0);
        margin-top: 14px;
        margin-right: 0;
        margin-left: 0;
        height: 2px;
        z-index: 0;
        background: globals.$color-home;
    }
    &-firsthandle,
    &-secondhandle {
        position: absolute;
        z-index: 1;
        width: 26px;
        height: 26px;
        margin-top: 4px;
        cursor: pointer;
        user-select: none;
        &:before {
            position: absolute;
            z-index: 1;
            top: 10px;
            left: 75%;
            display: block;
            width: 9999px;
            height: 2px;
            content: "";
            background: globals.$color-gray15;
            cursor: default;
        }
        &-input {
            position: relative;
            width: 14px;
            height: 14px;
            margin-top: 5px;
            margin-left: 0.5em;
            background-color: globals.$color-home;
            border: 0;
            border-right: 0;
            border-radius: 2em;
            will-change: left;
            z-index: 2;

        }
    }
    &-firsthandle {
        // transform: translate3d(0px, 0px, 0px);
        margin-left: -1em;
        &:before {
            right: 65%;
            left: auto;
        }
    }
    &-secondhandle {
        // transform: translate3d(133px, 0px, 0px);
        margin-left: -1.1em;
        z-index: 4;
        &-input {
            z-index: 5;
        }
    }
}

  .range-field {
    position: relative;
    float: left;
    width: 100%;
    .range-label {
      display: block;
      margin-bottom: 10px;
      font-size: .7rem;
      font-family: 'Open Sans SemiBold', sans-serif;
    }
    input[type=range] {
      background: globals.$color-gray15; //globals.$color-home;
    }
  }

  .range-field__track--active {
    background: globals.$color-home;
  }

</style>