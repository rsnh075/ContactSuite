<script lang="ts">
/**
 * TabPage = 11
 *
 */
export default {
    name: 'uiComponent_11',
};
</script>
<script setup lang="ts">
import { ref, computed } from 'vue';
import TabBar from '@/components/uielements/TabBar.vue';
import * as uiComponents from './../moduleComponents';
import {handleArrayItems, prepareArrays} from '../../scriptHelperFunctions';

const emit = defineEmits(['propchanged']);
const props = defineProps({
    params: {type: Object, required: true},
    selectedcustomerid: {type: Number, required: false},
    showlabel: {type: Boolean, required: false, default: true}
});

const tabdata = ref([]);
const setTabData = () => {
    tabdata.value = [];
    props.params.forEach(uiitem => {
        tabdata.value.push({
          tablabel  : uiitem.DisplayText,
          isvisable : true,
          isactive  : false,
          isvalid   : true
        });
    });
}

const setActiveTab = ix => {
    tabdata.value.forEach(item => {
        item.isactive = false;
    });
    tabdata.value[ix].isactive = true;
}
const activeTabIx = computed(() => tabdata.value.findIndex(t => t.isactive));

setTabData();
setActiveTab(0);
props.params.forEach(uiitem => {
    if (uiitem.SubDefinition?.length > 0) {
        prepareArrays(uiitem.SubDefinition[0]);
    }
});

let totalColPercentage = 0;
const getWidthPercentage = uiitem => {
    if (colWidth(uiitem.UIElement) === 'col-large') return 100;
    const size = uiitem.ColumnSize.split(',');
    const res = size[0]/size[1] * 100 - 2;
    totalColPercentage += res;
    return res;
}
const getFillWidth = () => {
    const res = 100 - (totalColPercentage % 100);
    totalColPercentage = 0;
    return res;
}

const propIsChanged = (uiitem) => {
    if (uiitem.SubDefinition[0][0].ArrayId) {
        handleArrayItems(uiitem.SubDefinition[0][0].ArrayId, uiitem.SubDefinition[0]);
    }
    emit('propchanged')
};

const getComponent = (type) => uiComponents[`uiComponent_${type === 16 ? 9 : type}`];
const colWidth = type => {
    let _class: string;
    switch(type) {
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
}
</script>

<template>
    <div class="scriptform__textfield scriptform__tab" data-e2e="ui-tab-element">
        <TabBar
            :tabdata="tabdata"
            @switchtab="setActiveTab($event)"
          />
        <div class="scriptform-row module-container">
            &nbsp;
            <template v-for="(paramsList, index) in params">
                <div :class="colWidth(uiitem.UIElement)"
                     :style="{ width: getWidthPercentage(uiitem) + '%' }"
                     v-show="activeTabIx === index"
                     v-for="uiitem in paramsList.SubDefinition[0]"
                     style="position: relative; top: -40px;">
                    <component
                        v-if="uiitem.ShowField"
                        :showlabel="(showlabel && uiitem.ArrayId === null) || uiitem.RowId === 0"
                        :class="colWidth(uiitem.UIElement)"
                        :is="getComponent(uiitem.UIElement)"
                        :params="uiitem"
                        @propchanged="propIsChanged(paramsList)"
                        :selectedcustomerid="selectedcustomerid"></component>
                    <div v-if="uiitem.Fill"
                         :style="getFillWidth()"></div>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.tabs-wrapper {
    float: none;
    margin-bottom: 10px;
}
</style>