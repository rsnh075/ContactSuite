<script>
/**
 * PromptBuilder = 10
 *
 */
export default {
    name: 'uiComponent_10'
};
</script>
<script setup>
import {useStore} from 'vuex';
import {ref, onUpdated, onBeforeMount, computed, watch} from 'vue';
import PromptSelector from '../uielements/PromptSelector.vue';
import {sortable as vSorter} from '@/directives/sortable';
import {generateQuickGuid} from '@/use/guid';

const props = defineProps({
    params: {type: Object, required: true},
    selectedcustomerid: {type: Number, required: false},
    showlabel: {type: Boolean, required: false, default: true}
});
const emit = defineEmits(['propchanged']);
const playDay = ref(false);
const playYear = ref(false);
const playTomorrow = ref(false);
const browserLanguage = ref('en');
const localParams = ref([]);
const sortoptions = ref({isSortable: true});

const filledPromptsCount = computed(() => localParams.value.CurrentValue?.filter(p => p.PromptId !== -1 || p.VariableName.trim() !== '').length ?? 0);
watch(
    () => filledPromptsCount.value,
    () => {
        checkPromptsCount();
    }
);
watch(
    () => playDay.value,
    () => {
        updateDateSettings();
    }
);
watch(
    () => playYear.value,
    () => {
        updateDateSettings();
    }
);
watch(
    () => playTomorrow.value,
    () => {
        updateDateSettings();
    }
);

const hasDatePromptType = ref(false);
watch(
    () => localParams.value.CurrentValue,
    () => {
        // something changed to/from a date type?
        hasDatePromptType.value = localParams.value.CurrentValue?.find(p => p.PromptType === 3 || p.PromptType === 8) !== undefined ?? false;
        emitPropsChanged();
    }
);

const emitPropsChanged = () => {
    props.params.CurrentValue = JSON.stringify(localParams.value.CurrentValue.filter(p => p.PromptId !== -1 || p.VariableName !== '')); // only emit filled prompts
    emit('propchanged');
};

const updateDateSettings = () => {
    localParams.value.CurrentValue.forEach(prompt => {
        prompt.PlayDay = playDay.value;
        prompt.PlayYear = playYear.value;
        prompt.PlayTomorrow = playTomorrow.value;
    });
    emitPropsChanged();
};

const checkPromptsCount = () => {
    if (filledPromptsCount.value >= 1 && localParams.value.CurrentValue.length === filledPromptsCount.value) {
        addEmptyPrompt();
    }
};

const deleteIntention = ref(false);
const selectedPromptIx = ref(-1);
const deleteSelectedPrompt = () => {
    if (selectedPromptIx.value === localParams.value.CurrentValue.length - 1) return;

    localParams.value.CurrentValue.splice(selectedPromptIx.value, 1);
    emitPropsChanged();
};

const store = useStore();
onUpdated(() => {
    browserLanguage.value = store.getters.getLang();
});

const updateVal = (ix, newValue) => {
    localParams.value.CurrentValue[ix] = newValue;
    selectedPromptIx.value = ix;
    emitPropsChanged();
};

const sortPrompts = (oldIx, newIx) => {
    const movedItem = localParams.value.CurrentValue.splice(oldIx, 1)[0];
    localParams.value.CurrentValue.splice(newIx, 0, movedItem);
};

const addEmptyPrompt = () => {
    localParams.value.CurrentValue.push({
        'PromptId': -1,
        'VariableName': '',
        'PromptType': -1,
        'PlayDay': playDay.value,
        'PlayYear': playYear.value,
        'PlayTomorrow': playTomorrow.value,
        'GeneratedId': generateQuickGuid()
    });
};

const isJsonString = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

onBeforeMount(() => {
    browserLanguage.value = store.getters.getLang();
    let _currentValue = isJsonString(props.params.CurrentValue) ? JSON.parse(props.params.CurrentValue) : props.params.CurrentValue;
    if (!Array.isArray(_currentValue)) {
        localParams.value.CurrentValue = [];
    } else {
        localParams.value.CurrentValue = _currentValue;
    }

    localParams.value.CurrentValue.forEach(prompt => {
        prompt.GeneratedId = generateQuickGuid();
    });

    // display at least 1 empty prompt
    while (localParams.value.CurrentValue.length === 0) {
        addEmptyPrompt();
    }

    // Currently all date settings are the same for each prompt, so take the first:
    playDay.value = localParams.value.CurrentValue[0].PlayDay;
    playYear.value = localParams.value.CurrentValue[0].PlayYear;
    playTomorrow.value = localParams.value.CurrentValue[0].PlayTomorrow;
});
</script>

<template>
    <div class="scriptform__textarea" data-e2e="ui-prompt-builder">
        <div class="wrap delbtn">
            <a class="button__icon button__icon--delete" @mouseover="deleteIntention = true" @mouseout="deleteIntention = false" @click="deleteSelectedPrompt()">&#xF1C0;</a>
        </div>
        <div class="wrap header">
            <div></div>
            <label class="scriptform-label">{{ store.state.settings.scriptmanager.prompt }}</label>
            <label class="scriptform-label">{{ store.state.settings.scriptmanager.prompttype }}</label>
        </div>
        <div class="promptlist">
            <ul v-sorter="sortoptions" @sortend="sortPrompts($event.detail.oldIndex, $event.detail.newIndex)">
                <li class="wrap" v-for="(prompt, ix) in localParams.CurrentValue"
                    @click="selectedPromptIx = ix"
                    :key="prompt.GeneratedId"
                    :class="{ selected: ix === selectedPromptIx, todelete: ix === selectedPromptIx && deleteIntention }">
                    <span sorterhandle v-if="ix < localParams.CurrentValue.length - 1"
                          class="scriptmodule__icon draghandle">&#xF1DD;</span>
                    <span v-else></span>
                    <PromptSelector
                        :showlabel="showlabel"
                        :params="params"
                        :modelValue="localParams.CurrentValue[ix]"
                        @update:modelValue="updateVal(ix, $event)"
                        :selectedcustomerid="selectedcustomerid"/>
                </li>
            </ul>
        </div>
        <div class="wrap" v-show="hasDatePromptType">
            <div></div>
            <label class="scriptform-label date-options">{{ store.state.settings.scriptmanager.dateoptions }}</label>
        </div>
        <div class="date-options" v-show="hasDatePromptType">
            <div></div>
            <div class="scriptform__checkbox" data-e2e="ui-checkbox">
                <input type="checkbox" name="playday" id="playday" v-model="playDay">
                <label for="playday">{{ store.state.settings.scriptmanager.playday }}</label>
            </div>
            <div class="scriptform__checkbox" data-e2e="ui-checkbox">
                <input type="checkbox" name="playyear" id="playyear" v-model="playYear">
                <label for="playyear">{{ store.state.settings.scriptmanager.playyear }}</label>
            </div>
            <div class="scriptform__checkbox" data-e2e="ui-checkbox">
                <input type="checkbox" name="playtomorrow" id="playtomorrow" v-model="playTomorrow">
                <label for="playtomorrow">{{ store.state.settings.scriptmanager.playtomorrow }}</label>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "@/scss/includes/globals";

li {
    padding: 2px 4px 0 4px;
    border: 1px dotted transparent;
}
li.selected {
    background-color: #e0e0e0;
}
li.todelete {
    border-color: globals.$color-unavailable !important;
}
.wrap.header {
    display: grid;
    grid-template-columns: 1fr 20fr 20fr;
    gap: 10px;
    margin-bottom: 3px;
}

.promptlist .wrap {
    display: grid;
    grid-template-columns: 1fr 40fr;
    gap: 10px;
    margin-bottom: 3px;
}

.wrap label {
    padding-left: 10px;
    padding-right: 10px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.promptlist {
    max-height: 190px;
    overflow-y: auto;
}

.date-options {
    margin-top: 10px;
}

.scriptform__checkbox {
    margin-top: 0;
    display: inline-block;
    width: auto;
    margin-left: 32px;
}

.delbtn {
    height: 20px;
}

.delbtn a {
    position: absolute;
    right: 0;
    top: -5px;
}
.button__icon--delete:hover {
    background-color: transparent !important;
}
.wrap .scriptmodule__icon {
    pointer-events: all;
    cursor: move;
    width: 0;
}
</style>