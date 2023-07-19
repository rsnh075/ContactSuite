<script lang="ts">
export default {
  name: 'RestapisView'
};
</script>

<script setup lang="ts">

import { ValidateDir as vValidate }	from "../../directives/validate";
import { sortable as vSorter} from './../../directives/sortable';
import { useStore } from "vuex";
import { computed, inject, nextTick, onMounted, ref, watch } from "@vue/runtime-core";
import { IPCCCData } from "../../ipccc/js/data";
import BoxProps, { ModalType } from "../../types/BoxProps";
import JSONFormatter    from "json-formatter-js";

const DATATYPE = { //only 1, 2 of 4
    // 'Unknown' : 0,
    'Int' : 1,
    'String' : 2,
    // 'Guid' : 3,
    'Bool' : 4,
    // 'DateTime' : 5,
    // 'Double' : 6
};

const props = defineProps({
        visibility: {
            type: Boolean,
            default: false,
        },
        data: {
            type: Object,
            default: null,
        }
    });

const emits = defineEmits(['save', 'delete', 'cancel']);

const store = useStore(),
    showLoader = inject('showLoader') as Function,
    showModalDialog	= inject('showModalDialog') as Function,
    sortoptions = {isSortable: true},
    itemData = ref(null),
    header = ref(""),
    showHelp = ref(false),
    canSave = ref(false),
    validationcontrol = ref(null),
    detailscreen = ref(null),
    modulename = 'rest-apis',
    METHODLIST = [
        {type : 'GET'},
        {type : 'POST'}
    ],
    TYPELIST = [
        {type : 'Variable'},
        {type : 'Contstant'}
    ],
    isNotMinusOne = '^((?!-1).)*$',
    availableResponseList = ref([]),
    hasAvailableResponseList = computed(() => availableResponseList.value.length > 0),
    canAddResponseParam = computed(() => itemData.value?.ResponseParams.length < availableResponseList.value.length);

const resetDetail = () => {
    showHelp.value = false;
    canSave.value = false;
    availableResponseList.value = [];
    let _event = new Event('reset');
    validationcontrol.value?.dispatchEvent(_event);
};

watch(() =>
    props.visibility, (newStatus, oldStatus) => {
        if (newStatus && oldStatus !== newStatus) {
            itemData.value = JSON.parse(JSON.stringify(props.data));
            header.value = itemData.value.Id !== -1 ? store.state.settings[modulename].headeredit : store.state.settings[modulename].headernew;
            availableResponseList.value = [];
            if(itemData.value.ResponseParams.length > 0) {
                itemData.value.ResponseParams.forEach(el => {
                    el.exampleValue = "";
                    availableResponseList.value.push(JSON.parse(JSON.stringify(el)))
                });
            }
        } else {
            resetDetail();
        }
    }, { immediate: true }
);

const unlocSave = () => {
    canSave.value = true;
};

defineExpose({unlocSave});

// const updateStartIp = (ip) => {
//     itemData.StartAdres = ip;
// };

// const updateEndIp = (ip) => {
//     itemData.EindAdres = ip;
// };

const displayHelp = () => {
    showHelp.value = !showHelp.value;
};

const shakeIt = () => {
    let _elm = detailscreen.value;
    _elm.classList.add("detailscreen--shake");
    setTimeout(() => {
        _elm.classList.remove("detailscreen--shake");
    }, 1000);
};

const saveItem = () => {
    resetDetail();
    emits("save", getSavingData());
};

const deleteItem = () => {
      resetDetail();
      emits("delete", itemData.value);
};

const closeItem = () => {
    resetDetail();
    emits("cancel");
};

const addRequestParam = () => {
    itemData.value.RequestParams.push({
        Fieldname : "",
        DataType : DATATYPE.String,
        Fieldvalue : "",
        RESTConfigId : itemData.value.Id,
        Variable : "",
    });
};

const addResponseParam = () => {
    itemData.value.ResponseParams.push({
        Fieldname : "-1",
        exampleValue : "",
        RESTConfigId : itemData.value.Id,
        Variable : "",
    });
};

const deleteResponseParam = (index, fieldname) => {
    itemData.value.ResponseParams.splice(index, 1);
};

const setExampleValue = (index, fieldname) => {
    let _index = availableResponseList.value.findIndex(el => el.Fieldname == fieldname);
    if(_index !== -1) {
        itemData.value.ResponseParams[index].exampleValue = availableResponseList.value[_index].exampleValue;
    }
};

const reorderLines = (evt) => {
    const _movedItem = itemData.value.ResponseParams.splice(evt.detail.oldIndex, 1)[0];
    itemData.value.ResponseParams.splice(evt.detail.newIndex, 0, _movedItem);
};

const getSavingData = () => {
    const minHardCodedVar = JSON.parse(JSON.stringify(itemData.value));
    minHardCodedVar.RequestParams.forEach(el => {
        //remove hardcodedvalue if variable not empty
        if(el.Variable.length > 0) {
            el.Fieldvalue = '';
        };
    });
    return minHardCodedVar;
}

const canTest = computed(() =>
    itemData.value &&
    itemData.value.Method.length > 0 &&
    itemData.value.Url.length > 0 && (
        itemData.value.RequestParams.length == 0 || (
            itemData.value.RequestParams.length > 0 &&
            requestParamsAreValid()
        )
    )
);

const requestParamsAreValid = () => {
    let _requestParamsAreValid = true;
    itemData.value.RequestParams.forEach(el => {
        if(el.Fieldname.length == 0 || el.Fieldvalue.length == 0) {
            _requestParamsAreValid = false;
        }
    });
    return _requestParamsAreValid;
}

const getTestingData = () => {
    const minVar = JSON.parse(JSON.stringify(itemData.value));
    minVar.RequestParams.forEach(el => {
        el.Variable = '';
    });
    return minVar;
}

const testRest = () => {
    showLoader(true);
    if(!requestParamsAreValid()) {
        showLoader(false);
        const _boxProps = new BoxProps(ModalType.Alert, store.state.settings[modulename].jsonisnotvalidheader, store.state.settings[modulename].jsonisnotvalidbody);
        _boxProps.buttonLabels.cancelLabel = '';
		showModalDialog(_boxProps);
        return;
    }

    if(!canTest.value) {
        showLoader(false);
        return;
    } else {
        IPCCCData.RequestData('RESTTEST', getTestingData())
        .then(result => {
            processRestTest(result);
        })
        .catch(error => {
            console.error(error);
            const _boxProps = new BoxProps(ModalType.Alert, store.state.settings[modulename].testerrorheader, `${error.Message ? error.Message : error} ${error.CodeNr ? error.CodeNr : ''}`);
            _boxProps.buttonLabels.cancelLabel = '';
            showModalDialog(_boxProps);
            showLoader(false);
        });
    }
};

const FORMAT_CONFIG = {
    hoverPreviewEnabled    : false,
    hoverPreviewArrayCount : 100,
    hoverPreviewFieldCount : 5,
    theme                  : '',
    animateOpen            : true,
    animateClose           : true,
    useToJSON              : true
};

const processRestTest = (result) => {
    const _json      = JSON.parse(result);
    const _formatter = new JSONFormatter(_json, 1, FORMAT_CONFIG);
    const _boxProps = new BoxProps(ModalType.Confirm, store.state.settings[modulename].testresultheader, '');
    _boxProps.buttonLabels.cancelLabel = '';
    showModalDialog(_boxProps);
    nextTick(() => {
        document.querySelector('.modal__window-body-message span').appendChild(_formatter.render());
    });
    setAvailableResponseList(_json);
}

const setAvailableResponseList = (jsondata) => {
    // itemData.value.ResponseParams = [];
    // availableResponseList.value = [];
    let _jsondata = jsondata;
    if(Array.isArray(jsondata)) _jsondata = jsondata[0];
    // if(_jsondata !== undefined && _jsondata !== null && _jsondata.length !== 0) {
    try {
        Object.keys(_jsondata).forEach((key) => {
            if (availableResponseList.value.findIndex(obj => obj.Fieldname == key) !== -1) return;
            let _obj = {};
            _obj.Fieldname = key;
            _obj.exampleValue = _jsondata[key];
            _obj.RESTConfigId = itemData.value.Id;
            _obj.Variable = "";
            availableResponseList.value.push(_obj);
        });
    } catch (error) {
        throw new Error('Test result couldn\'t be converted to Result parameters' + error);
    }
    showLoader(false);
}

function formatText(text) {
    return text.replace(/\n/g, "<br>");
}

onMounted(() => {
    showLoader(false);
});

</script>

<template>
    <div :class="['detailscreen-wrapper', { 'detailscreen-wrapper--visable': visibility }]" data-e2e="rest-ips-view">
        <div v-if="itemData != null" class="detailscreen" ref="detailscreen">
            <a :class="['button-help', { 'button-help--active': showHelp }]" @click="displayHelp">?</a>
            <div class="grid-row">
                <div class="grid-unit--gamma--double detailscreen-wrapper__title">
                    <span class="detailscreen__title">{{ header }}</span>
                </div>
                <span class="detailscreen__title detailscreen__title--right detailscreen__title--small">#{{ itemData.Id }}</span>
            </div>

            <form @valid="saveItem()" @notvalid="shakeIt()" v-validate="{ submitBtns: 'js-submitbtn' }">
                <input type="hidden" data-revalidate="" data-reset="" ref="validationcontrol">
                <div class="grid-row">
                    <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground">
                            <input type="text" name="itemTitle" id="itemTitle" v-model="itemData.Name" :placeholder="store.state.settings[modulename].titleplaceholder" data-validate="isNotEmpty" :data-message="store.state.settings[modulename].validatetitle" />
                            <label for="itemTitle" class="form-label form-label--hidden">{{ store.state.settings[modulename].titlelbl }}</label>
                            <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ store.state.settings[modulename].helptexttitle }}</div>
                        </div>
                    </div>
                    <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground">
                            <input type="text" name="itemDescription" id="itemDescription" v-model="itemData.Description" :placeholder="store.state.settings[modulename].descriptionplaceholder" />
                            <label for="itemDescription" class="form-label form-label--hidden">{{ store.state.settings[modulename].descriptionlbl }}</label>
                            <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ store.state.settings[modulename].helptextdescription }}</div>
                        </div>
                    </div>
                </div>
                <div class="grid-row">
                    <h2 class="detailscreen__fieldsetheader">{{ store.state.settings[modulename].requesth2 }}</h2>
                </div>
                <div class="grid-row">
                    <div class="grid-unit--beta">
                        <div class="form-selectfield form-selectfield--inline-bground">
                            <label class="form-label form-label--hidden form-label--lowered">{{ store.state.settings[modulename].methodlbl }}</label>
                            <select v-model="itemData.Method" data-validate="isNotEmpty" :data-message="store.state.settings[modulename].validatemethod">
                                <option value="">{{ store.state.settings[modulename].selectmethoddefault }}</option>
                                <option v-for="(method, index) in METHODLIST" :key="index" :value="method.type">{{ method.type }}</option>
                            </select>
                            <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ store.state.settings[modulename].helptextmethod }}</div>
                        </div>
                    </div>
                    <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground">
                            <input type="text" name="itemUri" id="itemUri" v-model="itemData.Url" :placeholder="store.state.settings[modulename].placeholderuri" data-validate="isNotEmpty" :data-message="store.state.settings[modulename].validateuri" />
                            <label for="itemUri" class="form-label form-label--hidden">{{ store.state.settings[modulename].urilbl }}</label>
                            <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ store.state.settings[modulename].helptexturi }}</div>
                        </div>
                    </div>
                </div>
                <div class="grid-row">
                    <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground">
                            <input type="text" name="itemPath" id="itemPath" v-model="itemData.Path" :placeholder="store.state.settings[modulename].pathlbl" />
                            <label for="itemPath" class="form-label form-label--hidden">{{ store.state.settings[modulename].pathlbl }}</label>
                            <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ store.state.settings[modulename].helptextpath }}</div>
                        </div>
                        <!-- <div class="form-textfield form-textfield--bground">
                            <input type="text" name="itemHost" id="itemHost" v-model="itemData.Host" :placeholder="store.state.settings[modulename].hostlbl" />
                            <label for="itemHost" class="form-label form-label--hidden">{{ store.state.settings[modulename].hostlbl }}</label>
                            <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ store.state.settings[modulename].helptexthost }}</div>
                        </div> -->
                    </div>
                    <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground">
                            <input type="text" name="itemAuthorization" id="itemAuthorization" v-model="itemData.Authorization" :placeholder="store.state.settings[modulename].authorizationplaceholder" />
                            <label for="itemAuthorization" class="form-label form-label--hidden">{{ store.state.settings[modulename].authorizationlbl }}</label>
                            <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ store.state.settings[modulename].helptextauthorization }}</div>
                        </div>
                    </div>
                </div>
                <div class="grid-row">
                    <h2 class="detailscreen__fieldsetheader">{{ store.state.settings[modulename].jsonh2 }}</h2>
                </div>
                <div class="grid-row">
                    <div class="grid-unit--alpha">
                        <div class="list-number-header list-number-header--comp-scrollbar">
                            <span class="list-number-header__field list-number-header__field--20width">{{ store.state.settings[modulename].requestjsonheaders[0] }}</span>
                            <span class="list-number-header__field list-number-header__field--20width">{{ store.state.settings[modulename].requestjsonheaders[1] }}</span>
                            <span class="list-number-header__field list-number-header__field--15width">{{ store.state.settings[modulename].requestjsonheaders[2] }}</span>
                            <span class="list-number-header__field list-number-header__field--20width">{{ store.state.settings[modulename].requestjsonheaders[3] }}</span>
                            <button type="button" class="list-number-header__button--add" @click="addRequestParam()">{{ store.state.settings[modulename].jsonaddlabel }}</button>
                        </div>
                        <ul class="list-number-wrapper">
                            <li v-for="(field, index) in itemData.RequestParams" :key="index" class="list-number-line list-number-line--nohandle">
                                <input type="text" class="list-number-line__field list-number-line__field--20width" v-model="field.Fieldname">
                                <select class="list-number-line__field list-number-line__field--20width" v-model="field.DataType">
                                    <option v-for="(type, _index) in Object.values(DATATYPE)" :key="_index" :value="type">{{ Object.keys(DATATYPE)[_index] }}</option>
                                </select>
                                <input type="text" class="list-number-line__field list-number-line__field--15width" v-model="field.Fieldvalue">
                                <input type="text" class="list-number-line__field list-number-line__field--20width" v-model="field.Variable">
                                <span class="list-number--icon">
                                    <a class="button__icon button__icon--delete" @click="itemData.RequestParams.splice(index, 1)">&#xF1C0;</a>
                                </span>
                            </li>
                        </ul>
                        <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]" v-html="formatText(store.state.settings[modulename].helptextrequestjson)"></div>
                    </div>
                </div>

                <div class="grid-row">
                    <div class="grid-unit--alpha">
                        <span>
                            <a :class="['button-primary', { 'button-primary--disabled': !canTest }]" @click="testRest()">{{ store.state.settings[modulename].testlbl }}</a>
                        </span>
                    </div>
                </div>

                <div class="grid-row" v-if="hasAvailableResponseList">
                    <h2 class="detailscreen__fieldsetheader">{{ store.state.settings[modulename].responseh2 }}</h2>
                </div>

                <div class="grid-row" v-if="hasAvailableResponseList">
                    <div class="grid-unit--alpha">
                        <div class="list-number-header list-number-header--comp-scrollbar">
                            <span class="list-number-header__field list-number-header__field--20width list-number-header__field--drag">{{ store.state.settings[modulename].responseheaders[0] }}</span>
                            <span class="list-number-header__field list-number-header__field--20width">{{ store.state.settings[modulename].responseheaders[1] }}</span>
                            <span class="list-number-header__field list-number-header__field--30width">{{ store.state.settings[modulename].responseheaders[2] }}</span>
                            <button type="button" class="list-number-header__button--add" @click="addResponseParam()">{{ store.state.settings[modulename].responseaddlabel }}</button>
                        </div>
                        <ul class="list-number-wrapper" v-sorter="sortoptions" @sortend="reorderLines($event)">
                            <li v-for="(item, index) in itemData.ResponseParams" :key="item.Fieldname" class="list-number-line">
                                <span sorterhandle class="scriptmodule__icon draghandle">&#xF1DD;</span>
                                <select class="list-number-line__field list-number-line__field--20width" id="" v-model="item.Fieldname" @change="setExampleValue(index, item.Fieldname)" :data-validate="isNotMinusOne" :data-message="store.state.settings[modulename].selectresponsefielddefault">
                                    <option value="-1" selected>{{ store.state.settings[modulename].selectresponsefielddefault }}</option>
                                    <option v-for="(newitem, _index) in availableResponseList" :key="_index" :value="newitem.Fieldname">{{ newitem.Fieldname }}</option>
                                </select>
                                <input type="text" class="list-number-line__field list-number-line__field--20width" disabled :value="item.exampleValue">
                                <input type="text" class="list-number-line__field list-number-line__field--30width" v-model="item.Variable">
                                <span class="list-number--icon">
                                    <a class="button__icon button__icon--delete" @click="deleteResponseParam(index, item.Fieldname)">&#xF1C0;</a>
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

            </form>
            <!-- BUTTONS -->
            <div class="detailscreen-footer detailscreen-footer--inside">
                <div class="grid-unit--alpha">
                    <span>
                        <a class="button-primary button-primary--delete" @click="deleteItem()">{{ store.state.settings[modulename].deletelbl }}</a>
                    </span>
                    <span class="grid--push">
                        <a class="button-primary button-primary--gray" @click="closeItem()">{{ store.state.settings[modulename].cancellbl }}</a>
                        <a :class="['button-primary js-submitbtn', { 'button-primary--disabled': !canSave }]">{{ store.state.settings[modulename].savelbl }}</a>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .list-number-wrapper {
        min-height: 120px;
        height: auto;
        .list-number-line__field {
            background-color: transparent;
        }
    }
    .list-number-line {
        overflow: hidden;
    }

</style>