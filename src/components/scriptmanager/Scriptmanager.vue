<script setup>
import Treebuilder from './Treebuilder.vue';
import { ValidateDir as vValidate } from './../../directives/validate';
import { IPCCCConfigurator } from '@/ipccc/js/configurator';
import BoxProps, { ModalType } from '../../types/BoxProps';
import { computed, inject, onBeforeUnmount, onMounted, onUpdated, provide, ref, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const props = defineProps({
    rawscript: {},
    isvisible: { type: Boolean },
    isstatic: {},
    functionlist: {},
    selectedcustomerid: {},
    pasteboard: {}
});

const emit = defineEmits(['closeManager', 'scriptcreated']);
const showHelp = ref(false);
const scriptData = ref([]);
const treeroot = ref(null);
const showCompact = ref(false);
let unSubscribe = null;
let MTUNKNOWN = {};
let updatePropsTimer = null;
let isScrolling = false;
const autoSaveInterval = 60000; // 60 seconds for now

let alternateModules = [170, 110];

const highlightModule = modnr => {
    [].slice.call(document.querySelectorAll('.scriptmodule__content--highlight')).forEach(el => el.classList.remove('scriptmodule__content--highlight'));
    document.querySelector('div[data-modulenumber="' + modnr + '"]')?.classList.add('scriptmodule__content--highlight');
};
provide('highlightModule', highlightModule);

const showLoader = inject('showLoader');
const showModalDialog = inject('showModalDialog');

const rawScriptCount = ref(0);
watch(
    () => props.rawscript,
    () => {
        rawScriptCount.value++;
        if (props.rawscript && props.rawscript.ScriptFlow) {

            scriptData.value = [...convertToTreeObject(props.rawscript.ScriptFlow.Mainflow)];

            if (props.rawscript.Versions[props.rawscript.ActiveIndex]) {
                //this checks if the script is an active script (props.rawscript.ScriptFlowId == props.rawscript.Versions[props.rawscript.ActiveIndex].Id)
                //an active script is always saved with an new ScriptFlowId
                //an inactive script is saved with the same ScriptFlowId (if you change the ScriptDescription the ScriptFlowId will be a new one)
                props.rawscript.ScriptDescription = (props.rawscript.ScriptFlowId === props.rawscript.Versions[props.rawscript.ActiveIndex].Id) ?
                    props.rawscript.ScriptDescription === props.rawscript.Versions[props.rawscript.ActiveIndex].Description ? ''
                        : props.rawscript.ScriptDescription : props.rawscript.ScriptDescription;
            }
        }
    },
    { deep: true },
    { immediate: true }
);

const showSaveIndicator = ref(false);
const autoSave = () => {
    //saveScript(true); // save as draft
}

const scriptCopy = ref(null);
const hasChanges = computed(() => JSON.stringify(props.rawscript) !== scriptCopy.value);
const scriptNameField = ref(null);
let autoSaveTimer;
watch(
    () => props.isvisible,
    () => {
        if (!props.isvisible) {
            clearInterval(autoSaveTimer);
        } else {
            if (scriptNameField.value !== null) {
                scriptNameField.value.focus();
            }
            scriptCopy.value = JSON.stringify(props.rawscript);
            autoSaveTimer = setInterval(autoSave, autoSaveInterval);
        }
    },
    { immediate: true }
);

const scriptName = computed(() => (props.rawscript.Name === '') ? store.state.settings.scriptmanager.newname : props.rawscript.Name);

const triggerArrow = evt => {
    let _target = evt.target;

    if ((_target.classList.contains('detailscreen-wrapper') && evt.type === 'click') ||
        (_target.classList.contains('detailscreen') && evt.type === 'click') ||
        (_target.classList.contains('scripttree-wrapper') && evt.type === 'click')) {
        // treeroot.value.clearArrow();
    }

    if (_target.classList.contains('detailscreen') && evt.type === 'mouseover') {
        // treeroot.value.showArrow();
    }

    if (_target.classList.contains('detailscreen-wrapper') && evt.type === 'mouseover') {
        //   treeroot.value.hideArrow();
    }
};

const shakeIt = () => {
    treeroot.value.closeModuleMenu();
    let _elm = document.querySelector('#detailscreen');
    _elm.classList.add('detailscreen--shake');
    setTimeout(() => {
        _elm.classList.remove('detailscreen--shake');

    }, 1000);
};

const hideValidation = () => {
    let _valmes = document.querySelectorAll('.detailscreen-wrapper--visable [data-name="validMessage"]');
    for (const validmessage of _valmes) {
        validmessage.style.display = 'none';
    }
};

const displayHelp = () => {
    showHelp.value = !showHelp.value;
};

const backToList = () => {
    hideValidation();
    scriptData.value = [];
    treeroot.value.closeModuleMenu();
    emit('closeManager');
};

const validateScript = () => {
    let _isValid = true,
        _msgs = [];

    //CHECK REDIRECTS
    props.rawscript.ScriptFlow.Mainflow.forEach(module => {
        for (const [key, value] of Object.entries(module)) {
            if (key.indexOf('Exit') !== -1 && key !== 'ExitParameters') {
                if (value === REDIRECT_EXIT) {
                    _isValid = false;
                    _msgs.push(store.state.settings.scriptmanager.errormsg.redirect);
                }
            }
        }
    });

    return {
        isValid: _isValid,
        message: _msgs
    };
};

// Some modules have array items, which means elements are be repeated when filled by the user
// Example: SMS has 2 elements with ArrayId: 1 => a var element and en empty element
// If the user fills the var, the client creates a new 'row' (combination of var and empty element) so the user can fill another row
// Backend only works with 'definitions' of a module, and doesn't understand these extra rows.
// So we remove these extra rows and store the data in row 0
const reduceArrays = (mainFlowItems) => {
    mainFlowItems.forEach(flowItem => {
        const arrayElements = flowItem.ModuleParameters.filter(item => item.ArrayId !== null);
        if (arrayElements.length !== 0) {
            // if any of the items are arrays, squash them: back-end expects 1 array element with ;-separated values
            const uniqueArrayIds = [...new Set(arrayElements.map(item => item.ArrayId))];
            uniqueArrayIds.forEach(arrayId => {
                squashArray(flowItem.ModuleParameters, arrayId);
            });
        }

        // if any item has a subdefinition, it also needs to squash any arrays in there
        flowItem.ModuleParameters.forEach(moduleParam => {
            if (moduleParam.SubDefinition.length > 0) {
                const subArrayElements = moduleParam.SubDefinition[0].filter(item => item.ArrayId !== null);
                if (subArrayElements.length !== 0) {
                    const uniqueSubArrayIds = [...new Set(subArrayElements.map(item => item.ArrayId))];
                    uniqueSubArrayIds.forEach(arrayId => {
                        squashArray(moduleParam.SubDefinition[0], arrayId);
                    });
                }
            }
        });
    });
};

const squashArray = (items, arrayId) => {
    const elementsInRow = items.filter(item => item.ArrayId === arrayId && item.RowId === 0).length;
    const elementsInArray = items.filter(item => item.ArrayId === arrayId);
    const firstIx = items.findIndex(item => item.ArrayId === arrayId); // first element
    // move all items' currentvalues into first row
    for (let i = elementsInRow; i < elementsInArray.length; i++) {
        const ix = (i % elementsInRow) + firstIx;
        items[ix].CurrentValue += `;${elementsInArray[i].CurrentValue}`;
    }
    // remove all rows with rowId > 1
    const lastIx = items.findLastIndex(item => item.ArrayId === arrayId);
    const lastInitialRowIx = items.findLastIndex(item => item.ArrayId === arrayId && item.RowId === 0);
    for (let i = lastIx; i > lastInitialRowIx; i--) {
        items.splice(i, 1);
    }
};

const isSaving = ref(false);
const saveScript = (isDraft = false) => {
    if (props.rawscript.ScriptType == 'Flash'
        || (isDraft && !hasChanges.value)
        || isSaving.value) return;

    props.rawscript.IsDraft = isDraft;
    const validationResult = validateScript();
    if (validationResult.isValid || isDraft) {
        if (scriptData.value.length !== 0) {
            if (!isDraft) showLoader(true);

            props.rawscript.ScriptFlow.Mainflow.forEach(mod => {
                if (mod.GUIMemory !== null && mod.GUIMemory !== '')
                    mod.GUIMemory = JSON.stringify(mod.GUIMemory);
            });

            reduceArrays(props.rawscript.ScriptFlow.Mainflow);
            isSaving.value = true;
            showSaveIndicator.value = true;

            // console.log(`saveScript ScriptFlowId: ${props.rawscript.ScriptFlowId}, draft: ${isDraft}, hasChanges: ${hasChanges.value}`);

            IPCCCConfigurator.Request(props.selectedcustomerid, 'script', 'save', props.rawscript, null)
                .then(response => {
                    if (isDraft) {
                        // Take the new ScriptFlowId, else a new Version is created for every autosave
                        props.rawscript.ScriptFlowId = response.ScriptFlowId;
                    } else {
                        hideValidation();
                        scriptData.value = [];
                        emit('scriptcreated', {
                            response: response,
                            Id: compareArrayOfObjects(props.rawscript.Versions, response.Versions)[0].Id
                        });
                    }
                    scriptCopy.value = JSON.stringify(props.rawscript);

                    // console.log(`saveScript result: ${response}`);
                })
                .catch(error => {
                    alert(error);
                    showLoader(false);
                    console.error(error);
                }).
                finally(() => {
                    isSaving.value = false;
                    setTimeout(() => {
                        showSaveIndicator.value = false;
                    }, 1000);
                });
        }
    } else {
        showModalDialog(new BoxProps(ModalType.Alert, store.state.settings.dialog.dialogalertheader, validationResult.message[0]));
        console.error('Script is niet valide: ', validationResult.message[0]);
    }
};

const compareArrayOfObjects = (oldA, newA) =>
    newA.reduce((acc, obj) => {
        let __index = oldA.findIndex(item => JSON.stringify(item) === JSON.stringify(obj));

        if (__index === -1)
            acc.push(obj);

        return acc;

    }, []);

//HAPPIER LITTLE TREES
const objectToBoilerPlate = module => {
    module.ExitParameters.forEach(exitParam => {
        exitParam.used = (module[exitParam.Name] !== 0);
    });

    return {
        ModuleType: module.ModuleType,
        Description: module.Description,
        Editable: module.Editable,
        ModuleId: module.ModuleId,
        ModuleNumber: module.ModuleNumber,
        Name: module.Name,
        ParentModule: module.ParentModule,
        Timeout: module.Timeout,
        WFMStatusId: module.WFMStatusId,
        Parameters: [...module.Parameters],
        ModuleParameters: [...module.ModuleParameters],
        ExitParameters: modifyExitParameters(module.ExitParameters, module.ModuleId),
        exitTypeAlt: module.GUIMemory.altExitType,
        Exits: [
            { ExitSuccess: module.ExitSuccess },
            { Exit0: module.Exit0 },
            { Exit1: module.Exit1 },
            { Exit2: module.Exit2 },
            { Exit3: module.Exit3 },
            { Exit4: module.Exit4 },
            { Exit5: module.Exit5 },
            { Exit6: module.Exit6 },
            { Exit7: module.Exit7 },
            { Exit8: module.Exit8 },
            { Exit9: module.Exit9 },
            { ExitPound: module.ExitPound },
            { ExitStar: module.ExitStar },
            { ExitTimeout: module.ExitTimeout },
            { ExitGorilla: module.ExitGorilla },
            { ExitError: module.ExitError }
        ],
        GUIMemory: module.GUIMemory
    };
};

const modifyExitParameters = (params, moduleId) => {
    return params.map(p => {
        return {
            ...p,
            NameAlt: p.Name + addModuleId(moduleId)
        };
    });
};

const getRedirectLabel = index => {
    const _index = props.rawscript.ScriptFlow.Mainflow.findIndex(mod => parseInt(mod.ModuleNumber) === parseInt(Math.abs(index)));
    const _targetModule = props.rawscript.ScriptFlow.Mainflow[_index];
    const _name = (typeof _targetModule !== 'undefined') ? _targetModule.Name : '';
    const _label = (typeof _targetModule !== 'undefined' && _targetModule.GUIMemory.hasOwnProperty('selectedLabel')) ? '' + _targetModule.GUIMemory.selectedLabel : '';
    return (typeof _targetModule !== 'undefined') ? (_name + ' ' + _label) : '';
};

const addModuleId = id => {
    return (alternateModules.indexOf(id) !== -1) ? ('_' + id) : '';
};

const stripModulesFromObject = module => {
    const _module = JSON.parse(JSON.stringify(module));
    _module.Exits = _module.Exits.filter(exit => {
        if (Object.values(exit)[0] !== 0) {
            if (Object.values(exit)[0] === OPTIONAL_EXIT) {
                exit.exitType = Object.keys(exit)[0];
                exit.exitTypeAlt = Object.keys(exit)[0] + addModuleId(_module.ModuleId);
                exit.Name = 'Optional';
                exit.RedirectIndex = '';
                exit.RedirectLabel = '';
                exit.ModuleNumber = '';
                exit.Exits = [];
                exit.ParentModule = _module.ModuleNumber;
                exit.ModuleParameters = [];
                exit.Parameters = [];
                exit.ExitParameters = [];
                delete exit[Object.keys(exit)[0]];
            }
            if (Object.values(exit)[0] === MANDATORY_EXIT) {
                exit.exitType = Object.keys(exit)[0];
                exit.exitTypeAlt = Object.keys(exit)[0] + addModuleId(_module.ModuleId);
                exit.Name = 'Mandatory';
                exit.RedirectIndex = '';
                exit.RedirectLabel = '';
                exit.ModuleNumber = '';
                exit.Exits = [];
                exit.ParentModule = _module.ModuleNumber;
                exit.ModuleParameters = [];
                exit.Parameters = [];
                exit.ExitParameters = [];
                delete exit[Object.keys(exit)[0]];
            }
            if (Object.values(exit)[0] < 0) {
                exit.exitType = Object.keys(exit)[0];
                exit.exitTypeAlt = Object.keys(exit)[0] + addModuleId(_module.ModuleId);
                exit.Name = 'Redirect';
                exit.RedirectIndex = Math.abs(Object.values(exit)[0]);
                exit.RedirectLabel = (Object.values(exit)[0] !== REDIRECT_EXIT) ? getRedirectLabel(Object.values(exit)[0]) : '';
                exit.ModuleNumber = REDIRECT_EXIT;
                exit.Exits = [];
                exit.ParentModule = _module.ModuleNumber;
                exit.ModuleParameters = [];
                exit.Parameters = [];
                exit.ExitParameters = [];
                delete exit[Object.keys(exit)[0]];
            }
            return exit;
        }
    });
    return _module;
};

const objectToTree = stripedScript => {
    const _rootModules = [],
        _srcScript = [...stripedScript];

    if (stripedScript.length > 1) {
        stripedScript.forEach((module, index) => {

            if (module.ParentModule === 0) {
                _rootModules.push(index);
            } else {

                let _index = -1,
                    _parentIndex = _srcScript.findIndex(mod => parseInt(mod.ModuleNumber) === parseInt(module.ParentModule)),
                    _parentExits = _parentIndex !== -1 ? stripedScript[_parentIndex].Exits : [];

                _parentExits.forEach((exit, index) => { //Look for yourself in the parent exit
                    if (Object.values(exit)[0] === module.ModuleNumber) _index = index;
                });

                if (_index !== -1) { //NOT ALWAYS IN PARENT SO...
                    let _exitType = Object.keys(_parentExits[_index])[0];
                    _parentExits[_index] = Object.assign(module, { exitType: _exitType });
                }
            }
        });
        return stripedScript.filter(module => _rootModules.indexOf(module.ModuleNumber) > -1 && module.ModuleType !== 'MTUNKNOWN');
    } else {
        return stripedScript;
    }

};

const convertToTreeObject = flatScript => {
    flatScript.forEach(mod => {
        if (typeof mod.GUIMemory === 'object') {
            //;
        } else {
            mod.GUIMemory = JSON.parse(mod.GUIMemory);
        }
    });
    const _boilerScript = flatScript.map(objectToBoilerPlate);
    const _stripedScript = _boilerScript.map(stripModulesFromObject);
    return objectToTree(_stripedScript);
};
//THE END OF HAPPIER LITTLE TREES
//END MUTATE THE TREE

const toggleShowCompact = () => {
    showCompact.value = !showCompact.value;
};

const updateProps = (number, modprops, name, selLabel) => {
    clearTimeout(updatePropsTimer);

    let _index = props.rawscript.ScriptFlow.Mainflow.findIndex(mod => mod.ModuleNumber === number);
    updatePropsTimer = setTimeout(() => {

        let _modToMutate = props.rawscript.ScriptFlow.Mainflow[_index];
        _modToMutate.Name = name;
        _modToMutate.ModuleParameters = [...modprops];
        _modToMutate.GUIMemory.selectedLabel = selLabel;

        const setRedirectLbl = (modExits, numberToUpdate) => {
            modExits.forEach(exit => {
                if (exit.RedirectIndex === numberToUpdate) {
                    exit.RedirectLabel = name + ' ' + _modToMutate.GUIMemory.selectedLabel;
                }
                if (exit.Exits.length > 0) {
                    setRedirectLbl(exit.Exits, numberToUpdate);
                }
            });
        };

        setRedirectLbl(scriptData.value[0].Exits, _modToMutate.ModuleNumber);
    }, 500);
};


onMounted(() => {
    unSubscribe = store.watch(() => store.getters.getScriptProps(), moduleProps => {
        updateProps(moduleProps.numberToChange, moduleProps.props, moduleProps.name, moduleProps.selectedLabel);
    });
});

onBeforeUnmount(() => {
    unSubscribe();
});
</script>

<template>
    <div :class="['detailscreen-wrapper', { 'detailscreen-wrapper--visable': isvisible }]" data-e2e="script-manager" @mouseover="triggerArrow">
        <div id="detailscreen" class="detailscreen detailscreen--stretch" @click="triggerArrow">
            <form v-validate="{ 'submitBtns': 'js-submitbtn' }" @notvalid="shakeIt()" @valid="saveScript()">
                <a :class="['button-help', { 'button-help--active': showHelp }]" @click="displayHelp">?</a>
                <div class="grid-row">
                    <div class="grid-unit--alpha detailscreen-wrapper__title newscript-title">
                        <span class="detailscreen__title">{{ scriptName }}</span>
                        <!-- <span class="compact-toggle">
                            <ToggleField :model-value="showCompact" @change="toggleShowCompact()" class="webrtc-constraints-togglefield" />
                            <label class="form-label">{{store.state.settings.scriptmanager.compactlbl}}</label>
                        </span> -->
                    </div>
                </div>
                <div class="grid-row">
                    <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground">
                            <input id="script-name" ref="scriptNameField" v-model="rawscript.Name"
                                :data-message="store.state.settings.forms.messagescriptname"
                                :placeholder="store.state.settings.scriptmanager.formscriptnamelabel" autofocus data-validate="isNotEmpty"
                                name="script-name" type="text" />
                            <label class="form-label form-label--hidden" for="script-name">{{
                                store.state.settings.scriptmanager.formscriptnamelabel
                            }}</label>
                            <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">
                                {{ store.state.settings.scriptmanager.helptextscriptname }}
                            </div>
                        </div>
                    </div>
                    <div class="grid-unit--beta">
                        <div char-count="{'fieldName' : 'script-description', 'maxChars' : 110, 'targetClass' : 'form-textfield__feedback-inline'}"
                            class="form-textfield form-textfield--bground">
                            <input id="script-description" v-model="rawscript.ScriptDescription"
                                :data-message="store.state.settings.forms.messagescriptdescription"
                                :placeholder="store.state.settings.scriptmanager.formscriptdescriptionlabel" data-validate="isNotEmpty"
                                name="script-description" type="text" />
                            <label class="form-label form-label--hidden" for="script-description">{{
                                store.state.settings.scriptmanager.formscriptdescriptionlabel
                            }}</label>
                            <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">
                                {{ store.state.settings.scriptmanager.helptextscriptdescription }}
                            </div>
                        </div>
                    </div>
                </div>
                <!-- TREE -->
                <div class="grid-row">
                    <div ref="treewrapper" :class="['grid-unit--alpha', 'scripttree-wrapper', { 'scripttree-wrapper--static': isstatic === 1 }]"
                        @click="triggerArrow">
                        <Treebuilder ref="treeroot" :functionlist="functionlist" :isstatic="isstatic" :pasteboard="pasteboard"
                            :selectedcustomerid="selectedcustomerid" :treedata="scriptData" />
                    </div>
                </div>
                <!-- BUTTONS -->
                <div class="detailscreen-footer detailscreen-footer--inside">
                    <span class="grid--push">
                        <div v-show="showSaveIndicator" class="save-indicator"></div>
                        <a class="button-primary button-primary--gray" @click="backToList">{{
                            store.state.settings.scriptmanager.backtolist }}</a>
                        <a
                            :class="['button-primary', 'js-submitbtn', { 'button-primary--disabled': scriptData.length === 0 || rawscript.ScriptType == 'Flash' }]">{{
                                store.state.settings.scriptmanager.savelbl
                            }}</a>
                    </span>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.newscript-title {
    display: grid;
    grid-template-columns: 1fr 150px;
    grid-column-gap: 5px;
}

.detailscreen__title,
.compact-toggle {
    white-space: nowrap;
    line-height: 40px;
    margin-top: 0;
}

.compact-toggle {
    text-align: right;
}

.compact-toggle .togglefield-button {
    display: inline-block;
}

.compact-toggle label {
    font-size: 0.7rem;
    display: inline-block;
    vertical-align: top;
    width: auto;
    margin-left: 5px;
}

.save-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid red;
    display: inline-block;
    margin-right: 10px;
    opacity: 0.5;
    transition: visibility 1s ease-in-out;
}
</style>
