<script lang="ts">
/**
 * Int up/down stepper
 * IntStepper = 2,
 *
 * Min, Max values
 */
export default {
    name: 'uiComponent_2'
};
</script>
<script lang="ts" setup>
import {useStore} from 'vuex';
import {ref, onUpdated, onMounted} from 'vue';

const props = defineProps({
    params: {type: Object, required: true},
    selectedcustomerid: {type: Number, required: false},
    showlabel: {type: Boolean, required: false, default: true}
});
const emit = defineEmits(['propchanged']);

const uid = ref('_' + Math.random().toString(32).substring(2, 11));
const browserLanguage = ref('en');
let changeTimer = null;

const modifyVal = evt => {
    evt.stopPropagation();
    let _target = evt.target;
    let _add = (_target.classList.contains('scriptform__stepper-contols--minus')) ? -1 : 1;

    props.params.CurrentValue = (props.params.CurrentValue === '') ? props.params.MinValue : props.params.CurrentValue;
    let _currentVal = parseInt(props.params.CurrentValue);

    if (_add < 0 && _currentVal > props.params.MinValue) {
        props.params.CurrentValue = _currentVal + _add;
    }

    if (_add > 0 && _currentVal < props.params.MaxValue) {
        props.params.CurrentValue = _currentVal + _add;
    }

    emit('propchanged');
};

const checkVal = evt => {
    evt = (evt) ? evt : window.event;
    let charCode = (evt.which) ? evt.which : evt.keyCode;
    if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 45) {
        evt.preventDefault();
    }
};

const pasteNumber = currentVal => {
    setTimeout(() => {
        if (isNaN(currentVal))
            props.params.CurrentValue = props.params.MinValue;
    });
};

const validateInput = evt => {
    if (props.params.CurrentValue.length === 0)
        return;

    clearTimeout(changeTimer);
    changeTimer = setTimeout(() => {
        let _currentVal = parseInt(props.params.CurrentValue),
            _evt = evt || window.evt,
            _key = _evt.keyCode || _evt.which,
            _ctrlDown = _evt.ctrlKey || _evt.metaKey;

        if (_ctrlDown && _key === 86 || _ctrlDown && _key === 65 || _ctrlDown && _key === 67) {
            pasteNumber(_currentVal);
        }

        if (isNaN(_currentVal) || !Number.isInteger(_currentVal)) {
            props.params.CurrentValue = props.params.MinValue;
        }

        if (_currentVal < props.params.MinValue) {
            props.params.CurrentValue = props.params.MinValue;
        }

        if (_currentVal > props.params.MaxValue) {
            props.params.CurrentValue = props.params.MaxValue;
        }
    }, 200);
};

const store = useStore();
onUpdated(() => {
    browserLanguage.value = store.getters.getLang();
});

onMounted(() => {
    browserLanguage.value = store.getters.getLang();

    if (props.params.CurrentValue === '')
        props.params.CurrentValue = props.params.DefaultValue;
});
</script>

<template>
    <div class="scriptform__textfield scriptform__stepper" data-e2e="num-stepper">
        <label v-if="showlabel" :for="uid" class="scriptform-label">{{
            params.DisplayText
            }}&nbsp;({{ params.MinValue }}&nbsp-&nbsp{{ params.MaxValue }})</label>
        <input :id="uid" v-model="params.CurrentValue" :max="params.MaxValue" :min="params.MinValue" :name="uid"
               type="number" @keypress="checkVal" @keyup="validateInput">
        <a class="scriptform-contols scriptform__stepper-contols--minus" @click="modifyVal">&#xF377</a>
        <a class="scriptform-contols scriptform__stepper-contols--plus" @click="modifyVal">&#xF419</a>
    </div>
</template>
