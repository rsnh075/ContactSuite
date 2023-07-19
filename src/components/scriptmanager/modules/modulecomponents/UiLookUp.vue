<script>
/**
 * Dropdown met lookup waarden
 * LookupDropDown = 5
 *
 *
 * @author Wim Jurriaans <wjurriaans@contactmakers.nl>
 *
 * @version 1.0
 *
 * @todo
 * - all
 *
 */
export default {
    name: 'uiComponent_5'

}
</script>
<script setup>
import {useStore} from 'vuex';
import {ref, onUpdated, onMounted, inject, watch, computed} from 'vue';
import {useScriptBuilderStore} from "@/store/cmScriptBuilderStore";

const scriptStore = useScriptBuilderStore();
const props = defineProps({
    params: {type: Object, required: true},
    selectedcustomerid: {required: false},
    showlabel: {type: Boolean, required: false, default: true}
});
const emit = defineEmits(['titlevalue', 'propchanged', 'propvalue']);

const uid = ref('_' + Math.random().toString(32).substring(2, 11));
const modalOpen = ref(false);
const listContent = ref([]);
const selectedLbl = ref('');
const searchStr = ref('');
const browserLanguage = ref('en');
let rawListContent = [];

const showLoader = inject('showLoader');

const getListData = (newVal, oldVal) => {
    searchStr.value = '';
    if (newVal && newVal !== oldVal) {
        filterList();
    }
}
watch(modalOpen, (newVal, oldVal) => {
    getListData(newVal, oldVal);
});

const isSelected = (itemVal, currentVal) => itemVal === currentVal;

const composeLabel = (label, characteristic = '') =>
    (characteristic !== null && characteristic !== '') ? `<span class="scriptform__lookup-option--characteristic">${characteristic}</span>${label}` : label;

const filterList = () => {
    listContent.value = rawListContent.filter(item => {
        if (item[props.params.LookupLabel]?.toLowerCase().indexOf(searchStr.value.toLowerCase()) !== -1) {
            return item;
        }
    });
}

const browse = evt => {
    evt.stopPropagation();
    if (evt.target.classList.contains('scriptform__modal') || evt.target.classList.contains('scriptform__lookup-contol')) {
        modalOpen.value = !modalOpen.value;
    }
}

const onSelect = evt => {
    evt.stopPropagation();
    let _target = evt.target,
        _val = _target.getAttribute('data-value'),
        _icon = _target.getAttribute('data-icon');

    props.params.CurrentValue = _val;
    selectedLbl.value = composeLabel(listContent.value.find(item => item[props.params.LookupValue] == _val)[props.params.LookupLabel], _icon);

    if (props.params.IsModuleText)
        emit('titlevalue', selectedLbl.value);

    emit('propchanged');
    emit('propvalue', _val);
    modalOpen.value = false;
}

const store = useStore();
onUpdated(() => {
    browserLanguage.value = store.getters.getLang();
});

onMounted(async () => {
    browserLanguage.value = store.getters.getLang();
    const response = await scriptStore.fetchListResults(props.selectedcustomerid, props.params.LookupFunction);
    rawListContent = [...response];
    filterList();

    let _lookup = response.find(item => String(item[props.params.LookupValue]) == String(props.params.CurrentValue));
    if (typeof _lookup !== 'undefined') {
        let _lbl = _lookup[props.params.LookupLabel],
            _icon = _lookup.Icon;

        selectedLbl.value = composeLabel(_lbl, _icon);

        if (props.params.IsModuleText)
            emit('titlevalue', selectedLbl.value);
    }

    showLoader(false);
});
const highlight = computed(() => props.params.Mandatory && props.params.CurrentValue === '');
</script>

<template>
    <div class="scriptform__textfield scriptform__lookup" data-e2e="lookup">
        <template v-if="showlabel">
            <label :for="uid" class="scriptform-label">{{ params.DisplayText }}<span v-if="params.Mandatory"
                                                                                     class="form-field--mandatory">*</span></label>
        </template>
        <input v-model="params.CurrentValue" type="hidden">
        <div :class="highlight ? 'highlight' : ''" class="scriptform__lookup-selected" v-html="selectedLbl"></div>
        <a :class="{nolabel: !showlabel}" class="scriptform-contols scriptform__lookup-contol"
           @click="browse">&#xFB69</a>

        <!-- MODAL -->
        <div :class="['scriptform__modal', {'scriptform__modal--visible' : modalOpen}]" @click="browse">
            <div class="scriptform__lookup-select">
                <div class="grid-row">
                    <h2 class="detailscreen__fieldsetheader">{{ params.DisplayText }}</h2>
                </div>
                <div class="grid-row"></div>
                <div class="grid-row">
                    <div class="grid-unit--alpha">
                        <div class="scriptform__textfield form-textfield--search">
                            <input v-model="searchStr" :placeholder="store.state.settings.scriptbuilder.searchtxt"
                                   type="text" @keyup="filterList()">
                        </div>
                    </div>
                </div>
                <div class="grid-row">
                    <div class="grid-unit--alpha">
                        <ol class="scriptform__lookup-list">
                            <li v-for="(item, index) in listContent" :key="index" :data-icon="item.Icon"
                                :data-selected="isSelected(item[params.LookupValue], params.CurrentValue)"
                                :data-value="item[params.LookupValue]"
                                class="scriptform__lookup-list-item"
                                @click="onSelect" v-html="composeLabel(item[params.LookupLabel], item.Icon)"></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
        <!-- MODAL -->
    </div>
</template>

<style scoped>
.nolabel {
    top: 17px;
}

.highlight {

}
</style>