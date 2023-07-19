<script lang="ts" setup>
import {useStore} from 'vuex';
import {useScriptBuilderStore} from '../../../../store/cmScriptBuilderStore';
import {computed, inject, onMounted, onUpdated, ref, watch} from 'vue';
import TabBar from '@/components/uielements/TabBar.vue';

const props = defineProps({
    params: {type: Object, required: true},
    selectedcustomerid: {type: Number, required: false},
    showlabel: {type: Boolean, required: false, default: true},
    showprompt: {type: Boolean, required: false, default: true},
    hidesystemvars: {type: Boolean, required: false, default: false}
});
const emit = defineEmits(['titlevalue', 'propchanged', 'promptvalue', 'varvalue']);

const scriptStore = useScriptBuilderStore();
const uid = ref('_' + Math.random().toString(32).substring(2, 11));
const modalOpen = ref(false);
const addVarModalOpen = ref(false);
const promptListContent = ref([]);
const selectedLbl = ref('');
const searchStr = ref('');
const browserLanguage = ref('en');
const newVarInput = ref<HTMLInputElement | null>(null);

let rawListContent = [];

const showLoader = inject('showLoader') as Function;

const getListData = (newVal, oldVal) => {
    searchStr.value = '';
    if (newVal && newVal !== oldVal) {
        filterList();
    }
};
watch(modalOpen, (newVal, oldVal) => {
    getListData(newVal, oldVal);
});

const isPromptSelected = (itemVal, currentVal) => itemVal === currentVal;

const composePromptLabel = (label, characteristic = '') =>
    (characteristic !== null && characteristic !== '') ? `<span class="scriptform__lookup-option--characteristic">${characteristic}</span>${label}` : label;

const filterList = () => {
    promptListContent.value = rawListContent.filter(item => {
        if (item[props.params.LookupLabel].toLowerCase().indexOf(searchStr.value.toLowerCase()) != -1) {
            return item;
        }
    });
};

const createValidVar = () => {
    if (!scriptStore.isValidVar(newVar.value)) {
        newVar.value = newVar.value.slice(1, -1);
    }
};

const browse = evt => {
    evt.stopPropagation();
    if (evt.target.classList.contains('scriptform__modal') || evt.target.classList.contains('scriptform__lookup-contol')) {
        modalOpen.value = !modalOpen.value;
        if (modalOpen.value) {
            searchfield.value.focus();
        }
    }
};

const onSelectPrompt = evt => {
    evt.stopPropagation();
    let _target = evt.target,
        _val = _target.getAttribute('data-value'),
        _icon = _target.getAttribute('data-icon');

    props.params.CurrentValue = _val;
    selectedLbl.value = composePromptLabel(promptListContent.value.find(item => item[props.params.LookupValue] == _val)[props.params.LookupLabel], _icon);

    if (props.params.IsModuleText)
        emit('titlevalue', selectedLbl.value);

    emit('promptvalue', _val);
    emit('propchanged');
    modalOpen.value = false;
};

const getVariables = async () => {
    if (props.params.IsVariable) {
        selectedLbl.value = props.params.CurrentValue;
    }
};

const varListContent = computed(() => {
    const searchableVars = props.hidesystemvars ? scriptStore.vars.filter(item => !item.startsWith('$')) : scriptStore.vars;
    return searchableVars.filter(item => item.toLowerCase().indexOf(searchStr.value.toLowerCase()) !== -1);
});

const getProps = async () => {
    const response = await scriptStore.fetchListResults(props.selectedcustomerid, props.params.LookupFunction);
    rawListContent = [...response];
    filterList();

    let _lookup = response.find(item => String(item[props.params.LookupValue]) == String(props.params.CurrentValue));
    if (typeof _lookup !== 'undefined') {
        let _lbl = _lookup[props.params.LookupLabel],
            _icon = _lookup.Icon;

        if (!props.params.IsVariable) {
            selectedLbl.value = composePromptLabel(_lbl, _icon);
        }
        if (props.params.IsModuleText)
            emit('titlevalue', selectedLbl.value);
    }
};

const store = useStore();
onUpdated(() => {
    browserLanguage.value = store.getters.getLang();
});

const newVar = ref('');
const searchfield = ref<HTMLInputElement | null>(null);
const closeVarModal = () => {
    addVarModalOpen.value = false;
    modalOpen.value = true; // only if var not filled
    searchfield.value.focus();
};

const openNewVarModal = () => {
    modalOpen.value = false;
    addVarModalOpen.value = true;
    newVarInput.value.focus();
}

const saveNewVar = () => {
    if (!scriptStore.isNewVarAllowed(newVar.value)) return;
    newVar.value = newVar.value.trim();
    scriptStore.addUserVar(newVar.value);
    addVarModalOpen.value = false;
    onSelectVar(newVar.value); // auto select the new var
};

const onSelectVar = myVar => {
    selectedLbl.value = myVar;
    emit('varvalue', myVar);
    emit('propchanged');
    modalOpen.value = false;
};

const tabdata = ref([{
    tablabel: 'Prompt',
    isvisable: true,
    isactive: true,
    isvalid: true
}, {
    tablabel: 'Var',
    isvisable: true,
    isactive: false,
    isvalid: true
}]);

const curTab = ref(0);
const switchTab = (ix) => {
    curTab.value = ix;
    tabdata.value[ix].isactive = true;
    tabdata.value[ix === 1 ? 0 : 1].isactive = false;
};

onMounted(() => {
    browserLanguage.value = store.getters.getLang();
    getVariables();
    if (props.showprompt) {
        getProps();
    } else {
        curTab.value = 1;
    }
});
const highlight = computed(() => props.params.Mandatory && props.params.CurrentValue === '');
</script>

<template>
    <div class="scriptform__textfield scriptform__lookup" data-e2e="lookupcombo">
        <template v-if="showlabel">
            <label :for="uid" class="scriptform-label">{{ params.DisplayText }}
                <span v-if="params.Mandatory"
                      class="form-field--mandatory">*</span></label>
        </template>
        <!--<input v-model="params.CurrentValue" type="hidden">-->
        <div :class="highlight ? 'highlight' : ''" class="scriptform__lookup-selected" v-html="selectedLbl"></div>
        <a v-if="params.CurrentValue"
           :class="{nolabeldelete: !showlabel}"
           class="scriptform-contols scriptform__lookup-contol button__icon button__icon--delete"
           @click.stop="onSelectVar('')">&#xF1C0;</a>
        <a :class="{nolabel: !showlabel}" class="scriptform-contols scriptform__lookup-contol"
           @click="browse">&#xFB69</a>

        <!-- MODAL: LIST OF AVAILABLE VARS -->
        <div :class="['scriptform__modal', {'scriptform__modal--visible' : modalOpen}]" @click="browse">
            <div class="scriptform__lookup-select">
                <div class="grid-row">
                    <TabBar
                            v-show="showprompt"
                            :tabdata="tabdata"
                            @switchtab="switchTab($event)"
                    />
                </div>
                <div class="grid-row"></div>
                <div class="grid-row">
                    <div class="grid-unit--alpha wrap">
                        <div class="scriptform__textfield form-textfield--search">
                            <input v-model="searchStr"
                                   ref="searchfield"
                                   autofocus
                                   :placeholder="store.state.settings.scriptbuilder.searchtxt"
                                   type="text" @keyup="filterList()">
                        </div>
                        <div v-show="curTab === 1" class="add">
                            <a class="scriptform-contols scriptform__stepper-contols--plus"
                               @click="openNewVarModal()">&#xF419</a>
                        </div>
                    </div>
                </div>
                <div class="grid-row">
                    <div class="grid-unit--alpha">
                        <ol v-if="curTab === 0" class="scriptform__lookup-list">
                            <li v-for="(item, index) in promptListContent"
                                :key="index"
                                :data-icon="item.Icon"
                                :data-selected="isPromptSelected(item[params.LookupValue], params.CurrentValue)"
                                :data-value="item[params.LookupValue]"
                                class="scriptform__lookup-list-item"
                                @click="onSelectPrompt"
                                v-html="composePromptLabel(item[params.LookupLabel], item.Icon)"></li>
                        </ol>
                        <ol v-else class="scriptform__lookup-list">
                            <li v-for="(myVar, index) in varListContent"
                                :key="index"
                                class="scriptform__lookup-list-item"
                                @click="onSelectVar(myVar)"
                            >{{ myVar }}
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
        <!-- MODAL -->

        <!-- MODAL: ADD NEW USER VAR -->
        <div :class="{'scriptform__modal--visible' : addVarModalOpen}" class="scriptform__modal">
            <div class="scriptform__lookup-select var-selector">
                <div class="grid-row">
                    <div class="detailscreen__title">
                        {{ store.state.settings.scriptbuilder.newvariable }}
                    </div>
                </div>
                <div class="grid-row">
                    <input ref="newVarInput" autofocus v-model="newVar" type="text" @input="createValidVar">
                </div>
                <div class="grid-row buttons">
                    <button class="button-primary button-primary--gray" type="button" @click="closeVarModal()">
                        {{ store.state.settings.scriptbuilder.cancellbl }}
                    </button>
                    <button :class="{ 'button-primary--gray': !scriptStore.isNewVarAllowed(newVar)}"
                            :disabled="!scriptStore.isNewVarAllowed(newVar)"
                            class="button-primary button-save"
                            type="button"
                            @click="saveNewVar()">{{ store.state.settings.scriptbuilder.savelbl }}
                    </button>
                </div>
            </div>
        </div>
        <!-- /ADD VAR MODAL -->
    </div>
</template>

<style lang="scss" scoped>
@use "@/scss/includes/globals" as g;

.add a {
  padding-right: 8px;
}

.button__icon--delete {
  right: 30px;
  font-size: 1.2rem;
  top: 32px;
}

.button__icon--delete:hover {
  color: g.$color-warning;
}

.scriptform_selectedfield a {
  flex: 0 0 0;
  top: 0 !important;
}

.nolabel {
  top: 20px;
}

.nolabeldelete {
  top: 17px;
}

.wrap {
  display: grid;
  grid-template-columns: 10fr 1fr;
  gap: 10px;
  height: 45px;
}

.wrap a {
  position: absolute;
  top: 20px;
}

.var-selector {
  padding-left: 20px;
  padding-right: 20px;
  min-height: 160px;
}

.buttons {
  position: absolute;
  bottom: 10px;
  text-align: right;
}

.button-primary--gray {
  margin-right: 10px;
}

.button-save {
  margin-right: 40px;
}

.button-primary--gray.button-save {
  pointer-events: none;
}
</style>