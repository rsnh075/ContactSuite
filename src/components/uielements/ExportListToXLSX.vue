<script lang="ts">
export default {
    inheritAttrs: false,
    customOptions: {
        name: "ExportListToXLSX",
    },
    components: {
        FileExport,
        Close,
        MenuToggleList
    }
}
</script>

<script setup lang="ts">
/**
 * Filter list and exports data
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 1.0
 *
 * @todo
 *
 *
 */

import { ref } 						from '@vue/reactivity';
import { dynamicSortMultipleProps } from '../../use/sortFunctions';
import MenuToggleList               from '../dashboards/MenuToggleList.vue';
import { Close, FileExport }        from 'mdue';
import { useStore }					from 'vuex';
import { utils, writeFile }         from 'xlsx';
import { computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter }                from 'vue-router';

const props = defineProps({
    data: {
        type    : Array,
        default : () => [],
    },
    sortProps: {
        type    : Array,
        default : () => [],
    },
    customBtnStyles: {
        type: Object,
        default: () => {}
    },
    customWrapperStyles: {
        type: Object,
        default: () => {}
    }
});

const store:object | any    = useStore(),
    router                  = useRouter(),
    showExport              = ref(false),
    componentWrapper        = ref(null),
    viewportList            = computed(() => props.data),
    sortProps               = computed(() => props.sortProps),
    exportFileName          = ref(router.currentRoute.value.name),
    isMassxess              = computed(() => store.getters.getCustomerInfo().customerId === 1);

function toggleExport(evt) {
    evt.stopPropagation();
    showExport.value = !showExport.value;
}

const filterList = ref([]);
watch(() => viewportList.value, (newVal, oldVal) => {
    //only do this onetime when the list is first initialized containing
    if (filterList.value.length == 0 && newVal.length !== 0 && newVal !== oldVal) {
        filterList.value = getColumnList();
    }
}, {});

function getColumnList(): object[] {
    let _oneObjectArray = [];
    let _viewportItem = viewportList.value && viewportList.value.length > 0 ? viewportList.value[0] : {};
    _oneObjectArray.push(_viewportItem);
    let _listNames =  extractPropertyNames(flattenObjectsInList(_oneObjectArray));
    let _list = _listNames.reduce((acc, item, index, arr) => {
        if (acc.findIndex(obj => obj.Name == arr[index]) !== -1) return acc;
        let _item  = new Map();
        _item.set('Name', arr[index]);
        _item.set('Id', index);
        if (index <= _listNames.length) {
            _item.set('Active', true);
        }
        else {
            _item.set('Active', false);
        }
        return acc.concat(Object.fromEntries(_item));
    }, []);
    return _list;
};

function flattenObjectsInList(list) {
    let _flattenedList = list.reduce((acc, obj) => {
        const newObj = {};
        for (const key in obj) {
            const value = obj[key];
            if (obj.hasOwnProperty(key) && typeof value !== 'object' && value !== null && typeof value !== 'function') {
                newObj[key] = value;
            }
        }
        acc.push(newObj);
        return acc;
    },[]);
    return _flattenedList;
}

function extractPropertyNames(objects) {
    let propertyNames = [];
    objects.forEach(obj => {
        Object.keys(obj).forEach(key => {
            if (obj.hasOwnProperty(key)) {
                propertyNames.push(key);
            }
        });
    });
    return propertyNames;
};

function propChanged(list) {
    filterList.value = list;
};

function sortExportList(exportlist) {
    if (sortProps.value.length == 0) return exportlist;
    return exportlist.sort(dynamicSortMultipleProps(sortProps.value));
}

function reduceObjectsInListByProperties(list) {
    if (filterList.value.length == 0) return [];
    let _reducedList = list.reduce((acc, obj) => {
        const newObj = {};
        for (const key in obj) {
            const value = obj[key];
            if (
                obj.hasOwnProperty(key) &&
                typeof value !== 'object' &&
                value !== null &&
                typeof value !== 'function' &&
                filterList.value.findIndex(_obj => _obj.Name == key && _obj.Active) !== -1
            ) {
                newObj[key] = value;
            }
        }
        acc.push(newObj);
        return acc;
    },[]);
    return _reducedList;
}

function exportList() {
    const _listToExport = sortExportList(reduceObjectsInListByProperties(flattenObjectsInList(viewportList.value)));
    if (_listToExport && _listToExport.length == 0) return;
    const worksheet = utils.json_to_sheet(_listToExport);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
    writeFile(workbook, `${exportFileName.value}.xlsx`);
}

onMounted(() => {
    window.addEventListener('click', () => showExport.value = false, false);
});

onBeforeUnmount(() => {
    window.removeEventListener('click', () => showExport.value = false, false);
});

</script>

<template>
    <div class="export-list" v-if="isMassxess">
	    <button type="button" class="toggle-btn" :style="customBtnStyles" @click="toggleExport">
            <FileExport class="toggle-btn-icon" />
        </button>
        <div v-if="showExport" :style="customWrapperStyles" class="wrapper" ref="componentWrapper" @click.stop="() => {}">
            <div class="header">
                <h2>{{ store.state.settings.exportlist.header }}</h2>
                <Close @click="toggleExport" />
            </div>
            <div class="body grid-row">
                <div class="grid-unit--alpha grid-unit--alpha--flex">
                    <div class="form-textfield form-textfield--bground">
                        <input type="text" name="exportfilename" id="exportfilename" v-model="exportFileName">
                        <label for="exportfilename" class="form-label form-label--hidden">{{ store.state.settings.exportlist.exportfilenamelabel }}</label>
                    </div>
                    <MenuToggleList class="menu-toggle-list-container"
                        :parentWrapper = "componentWrapper"
                        :list="filterList"
                        @propChanged="propChanged"
                    />
                </div>
            </div>
            <div class="footer">
                <div class="grid-row">
                    <div class="grid-unit--alpha">
                        <button class="button-primary" type="button"
                            :disabled="viewportList.length == 0"
                            @click="exportList">
                            {{ store.state.settings.exportlist.exportlisttoxlsxbtn }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

.export-list {
    line-height: initial;
    position: absolute;
    inset: 0;
    pointer-events: none;
    .toggle-btn {
        pointer-events: all;
        position: absolute;
        width: 30px;
        height: 30px;
        margin: auto;
        color: globals.$color-gray30;
        font-size: 1.1rem;
        text-align: center;
        cursor: pointer;
        border-radius: 3px;
        padding-top: 3px;
        &:hover {
            color: globals.$color-white;
            background-color: globals.$color-green;
            box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);
            .toggle-btn-icon {
                color: globals.$color-white;
            }
        }
    }
    .toggle-btn-icon {
        color: globals.$color-gray60;
        font-size: 1.2rem;
    }
    .wrapper {
        pointer-events: all;
        position: absolute;
        width: 310px;
        min-height: 200px;
        z-index: 200;
        background-color: globals.$color-white;
        border-radius: 3px;
        box-shadow: 0 0 18px 0 rgba(0, 0, 0, 0.2);
    }

    .header {
        display: flex;
        padding: 1.5rem 1.5rem 0.5rem 1.5rem;
        h2 {
            color: globals.$color-gray80;
            font-size: 1.3rem;
            line-height: 1.3rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
        }
        svg {
            width: 35px;
            height: 35px;
            margin-top: -15px;
            margin-right: -15px;
            background-color: transparent;
            font-size: 2rem;
            position: relative;
            cursor: pointer;
            color: globals.$color-gray25;
        }
    }
    .footer {
        padding: 1rem 0 1.2rem 0.5rem;
        button {
            float: right;
        }
    }

    .menu-toggle-list-container {
        position: relative;
        margin: auto;
    }
}


</style>