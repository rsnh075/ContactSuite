<script setup>
import {computed, inject, nextTick, onBeforeUnmount, onMounted, provide, ref} from 'vue';
import ScriptManager from './Scriptmanager.vue';
import ConfirmBox from '../dialogs/Confirm-box.vue';
import {dynamicSort} from '@/use/sortFunctions';
import {calculateMaxHeight, scrollTo} from '@/use/helperFunctions';
import VirtualListViewer    from './../uielements/VirtualListViewer.vue';
import {IPCCCConfigurator} from '@/ipccc/js/configurator';
import BoxProps, {ModalType} from '../../types/BoxProps';
import {useStore} from 'vuex';
import {useScriptBuilderStore} from '@/store/cmScriptBuilderStore';
import {getUniqueId, prepareArrays} from '@/components/scriptmanager/scriptHelperFunctions';

const store = useStore();
const MTUNKNOWN = {
    Name: '',
    Description: '',
    GUIMemory: '{}',
    Editable: true,
    ModuleId: -1,
    ModuleNumber: 0,
    ModuleType: 'MTUNKNOWN',
    Parameters: [],
    ParentModule: 0,
    Timeout: 0,
    WFMStatusId: 0,
    ExitSuccess: 0,
    ExitError: 0,
    ExitGorilla: 0,
    ExitTimeout: 0,
    Exit0: 0,
    Exit1: 0,
    Exit2: 0,
    Exit3: 0,
    Exit4: 0,
    Exit5: 0,
    Exit6: 0,
    Exit7: 0,
    Exit8: 0,
    Exit9: 0,
    ExitPound: 0,
    ExitStar: 0,
    ModuleParameters: [],
    ExitParameters: [],
};

const orderedList = ref([]);
const searchStr = ref('');
const totalScripts = ref(0);
const scriptManagerVisible = ref(false);
const isStatic = ref(false);
const selectedScript = ref({});
const selectedCustomerId = ref(1);
const functionList = ref([]);
const showDialog = ref(false);
const dialogText = ref('');
const pasteBoard = ref([]);
const contextMenu = ref();
const listContentWrapper = ref();
const scriptStore = useScriptBuilderStore();
const showFlash = ref(false);

let unSubscribe = null;
let unOrderedList = [];
let sortSetting = {};
let selectedDataIndex = -1;
let idsToMutate = {};
let mutationAction = 'save';
let flowLineToEdit = null;

const updateScript = (moduleId, insertAfter, atExitType, exitTypeAlt) => {
    // console.log('onaddmodule modnr', insertAfter);

    if (moduleId < 0) {
        placeRedirectOnExit({
            modNr: parseInt(insertAfter),
            exit: atExitType,
        });
        return;
    }

    return getModuleFromLibrary(
        moduleId,
        insertAfter,
        atExitType,
        exitTypeAlt
    ).then(
        (_nwObj) => {
            if (
                selectedScript.value.ScriptFlow.Mainflow.length === 0
            ) {
                //FIRST MODULE
                selectedScript.value.ScriptFlow.Mainflow = [];
                selectedScript.value.ScriptFlow.Mainflow.push(
                    Object.assign({}, MTUNKNOWN)
                );
                _nwObj.ModuleNumber = 1;
                selectedScript.value.ScriptFlow.Mainflow.push(
                    Object.assign({}, _nwObj)
                );
            } else {
                //GET PARENT WHERE MODULE IS PLACED UNDER
                let _parent =
                        selectedScript.value.ScriptFlow.Mainflow.findIndex(
                            (m) =>
                                parseInt(m.ModuleNumber) ===
                                parseInt(_nwObj.ParentModule)
                        ),
                    nextModuleNumber = getNextIndex();
                //SET NIEUW INDEX ON NIEUW MODULE
                _nwObj.ModuleNumber = nextModuleNumber;

                //SET EXIT ON PARENT
                selectedScript.value.ScriptFlow.Mainflow[_parent][_nwObj.exitType] = nextModuleNumber;
                //PLACE NEW MODULE AT THE END
                selectedScript.value.ScriptFlow.Mainflow.push(
                    Object.assign({}, _nwObj)
                );
            }
            return _nwObj.ModuleNumber;
        },
        (err) => {
            console.error(err);
            return -1;
        }
    );
}

provide('onaddmodule', updateScript);

const removeModules = moduleNumber => {
    // console.log('onremovemodule modnr', moduleNumber);
    let _modulesToRemove = [],
        _indexIndexFlat =
            selectedScript.value.ScriptFlow.Mainflow.findIndex(
                (module) =>
                    parseInt(module.ModuleNumber) ===
                    parseInt(moduleNumber)
            ),
        _moduleToDelete =
            selectedScript.value.ScriptFlow.Mainflow[_indexIndexFlat],
        _list = [];

    _modulesToRemove.push(_moduleToDelete.ModuleNumber);

    _list = _modulesToRemove.concat(
        getTreePath(_moduleToDelete, [])
    );

    if (_indexIndexFlat !== 1) {
        let _resultScript =
                selectedScript.value.ScriptFlow.Mainflow.filter(
                    (module) =>
                        _list.indexOf(parseInt(module.ModuleNumber)) ==
                        -1
                ),
            _parentNumber = _moduleToDelete.ParentModule,
            _parentModuleIndex =
                selectedScript.value.ScriptFlow.Mainflow.findIndex(
                    (mod) =>
                        parseInt(mod.ModuleNumber) ===
                        parseInt(_parentNumber)
                ),
            _parentModule =
                selectedScript.value.ScriptFlow.Mainflow[
                    _parentModuleIndex
                    ],
            _parentExit,
            _defaultExitVal;

        for (const [key, value] of Object.entries(_parentModule)) {
            if (
                key.indexOf('Exit') !== -1 &&
                value == _moduleToDelete.ModuleNumber
            ) {
                _parentExit = key;
            }
        }

        _resultScript.forEach((module) => {
            for (const [key, value] of Object.entries(module)) {
                if (
                    key.indexOf('Exit') !== -1 &&
                    Math.abs(value) == _moduleToDelete.ModuleNumber
                ) {
                    module[key] = REDIRECT_EXIT;
                }
            }
        });

        _defaultExitVal = selectedScript.value.ScriptFlow.Mainflow[
            _parentModuleIndex
            ].ExitParameters.find((exparam) => exparam.Name === _parentExit)
            .Mandatory
            ? MANDATORY_EXIT
            : 0;

        selectedScript.value.ScriptFlow.Mainflow[_parentModuleIndex][
            _parentExit
            ] = _defaultExitVal;

        selectedScript.value.ScriptFlow.Mainflow = [..._resultScript];
    } else {
        selectedScript.value.ScriptFlow.Mainflow = [];
    }
}
provide('onremovemodule', removeModules);

const handleOptionalExit = params => {
    let _index = selectedScript.value.ScriptFlow.Mainflow.findIndex(
        (m) => parseInt(m.ModuleNumber) === parseInt(params.modNr)
    );
    let _moduleToEdit = selectedScript.value.ScriptFlow.Mainflow[_index];

    if (parseInt(_moduleToEdit[params.exit]) >= 0) {
        _moduleToEdit[params.exit] = params.additem ? OPTIONAL_EXIT : 0;
    } else {
        _moduleToEdit[params.exit] = MANDATORY_EXIT;
    }
    _moduleToEdit.ExitParameters[
        _moduleToEdit.ExitParameters.findIndex(
            (ep) => ep.Name === params.exit
        )
        ].used = !!params.additem;

    selectedScript.value.ScriptFlow.Mainflow.splice(_index, 1);
    selectedScript.value.ScriptFlow.Mainflow.splice(
        _index,
        0,
        Object.assign({}, _moduleToEdit)
    );
}
provide('handelexit', handleOptionalExit);

const handleRedirectExit = params => {
    let _index = selectedScript.value.ScriptFlow.Mainflow.findIndex(
            (m) => parseInt(m.ModuleNumber) === parseInt(params.modNr)
        ),
        _moduleToEdit = selectedScript.value.ScriptFlow.Mainflow[_index];

    _moduleToEdit[params.exit] =
        typeof params.destnr !== 'undefined'
            ? parseInt(params.destnr) * -1
            : parseInt(_moduleToEdit[params.exit]) >= 0
                ? OPTIONAL_EXIT
                : MANDATORY_EXIT;

    selectedScript.value.ScriptFlow.Mainflow.splice(_index, 1);
    selectedScript.value.ScriptFlow.Mainflow.splice(
        _index,
        0,
        Object.assign({}, _moduleToEdit)
    );
}
provide('setredirectexit', handleRedirectExit);

const handleCutModule = mNr => {
    let _modulesToCut = [],
        _indexIndexFlat =
            selectedScript.value.ScriptFlow.Mainflow.findIndex(
                (module) =>
                    parseInt(module.ModuleNumber) === parseInt(mNr)
            ),
        _moduleToCut =
            selectedScript.value.ScriptFlow.Mainflow[_indexIndexFlat],
        _listToCut = [];

    pasteBoard.value = [];

    _modulesToCut.push(_moduleToCut.ModuleNumber);
    _listToCut = _modulesToCut.concat(
        getTreePath(_moduleToCut, [])
    );

    if (_indexIndexFlat !== 1) {
        let _resultScript = [],
            _parentNumber = _moduleToCut.ParentModule,
            _parentModuleIndex =
                selectedScript.value.ScriptFlow.Mainflow.findIndex(
                    (mod) =>
                        parseInt(mod.ModuleNumber) ===
                        parseInt(_parentNumber)
                ),
            _parentModule =
                selectedScript.value.ScriptFlow.Mainflow[
                    _parentModuleIndex
                    ],
            _parentExit,
            _defaultExitVal;

        selectedScript.value.ScriptFlow.Mainflow.forEach((module) => {
            if (
                _listToCut.indexOf(parseInt(module.ModuleNumber)) !== -1
            ) {
                pasteBoard.value.push(module);
            } else {
                _resultScript.push(module);
            }
        });

        for (const [key, value] of Object.entries(_parentModule)) {
            if (
                key.indexOf('Exit') !== -1 &&
                value == _moduleToCut.ModuleNumber
            ) {
                _parentExit = key;
            }
        }

        _resultScript.forEach((module) => {
            for (const [key, value] of Object.entries(module)) {
                if (
                    key.indexOf('Exit') !== -1 &&
                    _listToCut.indexOf(Math.abs(value)) !== -1
                ) {
                    module[key] = REDIRECT_EXIT;
                }
            }
        });

        _defaultExitVal = selectedScript.value.ScriptFlow.Mainflow[
            _parentModuleIndex
            ].ExitParameters.find((exparam) => exparam.Name === _parentExit)
            .Mandatory
            ? MANDATORY_EXIT
            : 0;

        selectedScript.value.ScriptFlow.Mainflow[_parentModuleIndex][
            _parentExit
            ] = _defaultExitVal;

        selectedScript.value.ScriptFlow.Mainflow = [..._resultScript];
    } else {
        selectedScript.value.ScriptFlow.Mainflow.shift();
        pasteBoard.value = [];
        pasteBoard.value = JSON.parse(
            JSON.stringify(selectedScript.value.ScriptFlow.Mainflow)
        );
        selectedScript.value.ScriptFlow.Mainflow = [];
    }
}

const onCutModule = modnr => {
    // console.log('onCutModule modnr', modnr);
    modnr !== -1 && handleCutModule(modnr);
}
provide('oncutmodule', onCutModule);

const handleCopyModule = mNr => {
    let _modulesToCopy = [],
        _indexIndexFlat =
            selectedScript.value.ScriptFlow.Mainflow.findIndex(
                (module) =>
                    parseInt(module.ModuleNumber) === parseInt(mNr)
            ),
        _moduleToCopy =
            selectedScript.value.ScriptFlow.Mainflow[_indexIndexFlat],
        _listToCopy = [];

    pasteBoard.value = [];

    _modulesToCopy.push(_moduleToCopy.ModuleNumber);
    _listToCopy = _modulesToCopy.concat(
        getTreePath(_moduleToCopy, [])
    );

    if (_indexIndexFlat !== 1) {
        selectedScript.value.ScriptFlow.Mainflow.forEach((module) => {
            if (
                _listToCopy.indexOf(parseInt(module.ModuleNumber)) !==
                -1
            ) {
                pasteBoard.value.push(module);
            }
        });
    } else {
        pasteBoard.value = [];
        pasteBoard.value = JSON.parse(
            JSON.stringify(selectedScript.value.ScriptFlow.Mainflow)
        );
        pasteBoard.value.shift();
    }
}
const onCopyModule = modnr => {
    modnr !== -1 && handleCopyModule(modnr)
}
provide('oncopymodule', onCopyModule);

const handlePasteModule = (modnr, exit, exitalt) => {
    if (selectedScript.value.ScriptFlow.Mainflow.length === 0) {
        //FIRST MODULE
        selectedScript.value.ScriptFlow.Mainflow = [];
        selectedScript.value.ScriptFlow.Mainflow.push(
            Object.assign({}, MTUNKNOWN)
        );
        //REINDEX PASTEBOARD
        reIndexPasteBoard();
        pasteBoard.value[0].ParentModule = 0;
        //PASTE AT THE END
        selectedScript.value.ScriptFlow.Mainflow =
            selectedScript.value.ScriptFlow.Mainflow.concat(
                JSON.parse(JSON.stringify(pasteBoard.value))
            );
    } else {
        //REINDEX PASTEBOARD
        reIndexPasteBoard();
        //GET PARENT WHERE MODULE IS PLACED UNDER
        let _parent = selectedScript.value.ScriptFlow.Mainflow.findIndex(
            (m) => parseInt(m.ModuleNumber) === parseInt(modnr)
        );
        //SET EXIT ON PARENT
        selectedScript.value.ScriptFlow.Mainflow[_parent][exit] =
            pasteBoard.value[0].ModuleNumber;
        pasteBoard.value[0].exitTypeAlt = exitalt;
        pasteBoard.value[0].GUIMemory.altExitType = exitalt;
        pasteBoard.value[0].ParentModule =
            selectedScript.value.ScriptFlow.Mainflow[
                _parent
                ].ModuleNumber;
        //PLACE NEW MODULE AT THE END
        selectedScript.value.ScriptFlow.Mainflow =
            selectedScript.value.ScriptFlow.Mainflow.concat(
                JSON.parse(JSON.stringify(pasteBoard.value))
            );
    }

    selectedScript.value.ScriptFlow.Mainflow.forEach((module) => {
        for (const [key, value] of Object.entries(module)) {
            if (key.indexOf('Exit') !== -1 && value < 0) {

                // module[key] = REDIRECT_EXIT; //module.ExitParameters.find(exparam => exparam.Name === key).Mandatory ? MANDATORY_EXIT : 0;
                module[key] = value;
            }
        }
    });
}
const onPasteModule = (modnr, exit, exitalt) => {
    // console.log('onPasteModule modnr', modnr);
    pasteBoard.value !== -1 && handlePasteModule(modnr, exit, exitalt)
}
provide('onpastemodule', onPasteModule);

const showLoader = inject('showLoader');
const showModalDialog = inject('showModalDialog');

const hoverRow = evt => {
    evt.stopPropagation();

    selectedDataIndex = evt.target.getAttribute('data-index');
    contextMenu.value.style.top = '';
    contextMenu.value.style.left = '';

    setTimeout(() => {
        let _target = evt.target,
            _targetProps = _target.getBoundingClientRect(),
            _menuProps = contextMenu.value.getBoundingClientRect(),
            _listWrapper = listContentWrapper.value,
            _listWrapperProps = _listWrapper.getBoundingClientRect();

        if (
            _targetProps.top -
            _listWrapperProps.top +
            _menuProps.height >
            _listWrapper.scrollTop + _listWrapperProps.height
        ) {
            contextMenu.value.style.top =
                _targetProps.top +
                _targetProps.height -
                _menuProps.height +
                'px';
            contextMenu.value.classList.add(
                'list-content__row-menu--flip'
            );
        } else {
            contextMenu.value.style.top = _targetProps.top + 'px';
            contextMenu.value.classList.remove(
                'list-content__row-menu--flip'
            );
        }

        contextMenu.value.style.left =
            _targetProps.left - _menuProps.width + 'px';
    });
}

const closeContextMenu = evt => {
    evt.stopPropagation();
    contextMenu.value.style.left = '';
    contextMenu.value.style.top = '';
    contextMenu.value.classList.remove(
        'list-content__row-menu--flip'
    );
}

const okConfirm = () => {
    showLoader(true);
    showDialog.value = false;
    mutateVersionList(idsToMutate, mutationAction);
};

const cancelConfirm = () => {
    idsToMutate = {};
    mutationAction = '';
    showDialog.value = false;
}

const showConfirm = () => {
    let _workProcess = orderedList.value.find(
            (wp) => wp.Id == idsToMutate.WorkprocessId
        ),
        _flowVersion = _workProcess.Versions.find(
            (fv) => fv.Id == idsToMutate.VersionId
        );

    dialogText.value =
        mutationAction === 'save'
            ? `<p><b>${_flowVersion.Description}</b><br><br>${store.state.settings.scriptmanager.confirmmessageactivate}</p>`
            : `<p><b>${_flowVersion.Description}</b><br><br>${store.state.settings.scriptmanager.confirmmessagedelete}</p>`;
    showDialog.value = true;
}

const activeId = wp => {
    return wp.Versions[wp.ActiveIndex] && wp.ActiveIndex !== -1
        ? wp.Versions[wp.ActiveIndex].Id
        : -1;
}

const modifiedDate = d => {
    return new Date(d).toISOString().substring(0, 10);
}

const setVersionDescription = script => {
    return script.ActiveIndex != -1
        ? script.Versions[script.ActiveIndex].Description
        : `<span style="color:#C00">${store.state.settings.scriptmanager.noactiveversion}</span>`;
}

const getData = async (cId, sId = '') => {
    return new Promise((resolve, reject) => {
        let _dataoperation =
                sId === -1
                    ? 'readnew'
                    : sId === ''
                        ? 'readall'
                        : 'readone',
            _function =
                sId === '' || sId === -1 ? 'workprocess' : 'script';

        IPCCCConfigurator.Request(
            cId,
            _function,
            _dataoperation,
            null,
            sId
        )
        .then((response) => {
            if (sId === '') {
                unOrderedList = [...response];
                unOrderedList.forEach((s) => {
                    s.sortTime = Date.parse(s.DateModified);
                    s.DateModified = new Date(s.DateModified)
                    .toISOString()
                    .substring(0, 10);
                    s.aDescription = setVersionDescription(s);
                });
                // orderedList.value = [...unOrderedList];
                orderedList.value = unOrderedList.filter(script => script.ScriptType !== "Flash");
                totalScripts.value = orderedList.value.length;
                filterList();
                resolve();
            } else {
                resolve(response);
            }
        })
        .catch((error) => {
            reject(error);
        });
    });
}

const getFunctions = commType => {
    return new Promise((resolve, reject) => {
        IPCCCConfigurator.Request(
            selectedCustomerId.value,
            'scriptfunctions',
            'readall',
            null,
            commType
        )
        .then((result) => {
            // console.log('getFunctions', commType, 'result:', result);
            resolve(result);
        })
        .catch((error) => {
            reject(error);
        });
    });
}

//=========================================================== START DISPLAY LIST METHODS
const filterList = () => {
    orderedList.value = filterListOnString(
        unOrderedList,
        searchStr.value.toLowerCase()
    );
    totalScripts.value = orderedList.value.length;
    sortColumn();
}

const filterListOnString = (list, str) => {
    if (str != '') {
        let _rawList = [...list];
        return _rawList.filter((item) => {
            if (
                item['Name'].toLowerCase().indexOf(str) != -1 ||
                item['aDescription'].toLowerCase().indexOf(str) != -1 ||
                item['DateModified'].toLowerCase().indexOf(str) != -1 ||
                item['ScriptType'].toLowerCase().indexOf(str) !== -1
            ) {
                return item;
            }
        });
    } else {
        return [...list];
    }
}

const sortColumn = (key, e = null) => {
    let _order,
        _t,
        _openId = -1;

    if (e != null) {
        _t = e.target;
        _order = _t.getAttribute('data-sortOrder');
        document
        .querySelectorAll('[data-sortorder]')
        .forEach((a) => a.setAttribute('data-sortorder', 'NONE'));
        sortSetting = {
            key: key,
            order: _order,
        };
    } else {
        _order = sortSetting.order;
        key = sortSetting.key;
    }

    switch (_order) {
        case 'NONE':
            orderedList.value.sort(dynamicSort(key));
            if (e != null) _t.setAttribute('data-sortOrder', 'ASC');
            break;
        case 'ASC':
            orderedList.value.sort(dynamicSort('-' + key));
            if (e != null) _t.setAttribute('data-sortOrder', 'DES');
            break;
        case 'DES':
            orderedList.value = filterListOnString(
                unOrderedList,
                searchStr.value.toLowerCase()
            );
            totalScripts.value = orderedList.value.length;
            if (e != null) _t.setAttribute('data-sortOrder', 'NONE');
            break;
    }

    nextTick(() => {
        if (_openId > 0) {
            let _elmToOpen = document.querySelector(
                    '[data-qid="' + _openId + '"]'
                ),
                _nrOffVersions =
                    _elmToOpen.querySelectorAll('LI').length,
                _lineHeight =
                    _elmToOpen.querySelector('LI').scrollHeight;

            _elmToOpen.style.height =
                _nrOffVersions * _lineHeight + 8 + 'px';
            _elmToOpen.classList.add('list-subwrapper--open');
        }
    });
}

const updateVersionDimentions = wId => {
    let _versionWrapper = document.querySelector(`[data-qid="${wId}"]`);
    if (!_versionWrapper) return;
    let _wpIndex =
            _versionWrapper.parentElement.getAttribute('data-index'),
        _nrOffVersions = orderedList.value[_wpIndex]?.Versions.length + 1 ?? 0, //incl. header
        _lineHeight = _versionWrapper.querySelector('LI').scrollHeight;

    _versionWrapper.style.height =
        _nrOffVersions * _lineHeight + 8 + 'px';
    _versionWrapper.classList.add('list-subwrapper--open');

    showLoader(false);
}
//=========================================================== END DISPLAY LIST METHODS

const clickedOnList = async evt => {
    evt.stopPropagation();
    let _target = evt.target.parentElement;
    console.log('clickedOnList', _target);

    if (_target.classList.contains('delete--js')) {
        deleteFlow(
            _target.getAttribute('data-wpid'),
            _target.getAttribute('data-id')
        );
    } else if (_target.classList.contains('activate--js')) {
        setFlowActive(
            _target.getAttribute('data-wpid'),
            _target.getAttribute('data-id')
        );
    } else if (_target.classList.contains('opensublist--js')) {
        openVersionList(
            listContentWrapper.value.querySelector(
                '[data-index="' + selectedDataIndex + '"] > DIV'
            )
        );
    } else {
        // _target = evt.target.closest('LI');
        // _target = evt.target.closest('LI');
        if (
            _target &&
            _target.classList.contains('list-subwrapper__line') &&
            !_target.classList.contains('activeflow--js')
        ) {
            flowLineToEdit = _target;
        } else {
            flowLineToEdit = null;
        }
        if (_target && _target.classList.contains('activeflow--js') && (!_target.classList.contains('isflashscript') || store.getters.getEnvIsDev())) {
            await openScript(_target.getAttribute('data-id'));
        }
    }
}

const openDraft = () => {
    if (!userHasDraft.value) return;
    openScript(userDraftVersion.value.Id);
}
const deleteDraft = () => {
    if (!userHasDraft.value) return;
    deleteFlow(userDraftScript.value.Id, userDraftVersion.value.Id);
}

//=========================================================== OPEN FLOW
const openScript = async selectedScriptId => {
    if (selectedScriptId > 0) {
        showLoader(true);
        await getData(
            selectedCustomerId.value,
            selectedScriptId
        ).then(
            async (response) => {
                await scriptStore.init(selectedCustomerId.value, response.ScriptFlow?.UsedVariables);
                selectedScript.value = Object.assign({}, response);
                // All array variables are condensed in a single var,
                // We must move them into an array again for the modules to display them correctly
                selectedScript.value?.ScriptFlow?.Mainflow?.forEach(module => {
                    prepareArrays(module.ModuleParameters);
                    module.ModuleParameters?.forEach(param => param.ClientId = getUniqueId())
                });
                isStatic.value = false; //(parseInt(elm.getAttribute('data-index')) % 2) == 0;

                //Comunicatie ID default for now 1 == 'phone'
                let _commType =
                    selectedScript.value.Id == -1
                        ? 1
                        : selectedScript.value.CommType;

                getFunctions(_commType).then(
                    (result) => {
                        functionList.value = [...result];
                        showLoader(false);
                    },
                    (error) => {
                        console.error(error);
                        showLoader(false);
                    }
                );

                // console.log('openScript:', selectedScript.value);

                scriptManagerVisible.value = true;
            },
            (error) => {
                showLoader(false);
                console.error('Error: ' + error);
            }
        );
    }
}

const openVersionList = elm => {
    let _sublist = elm.nextElementSibling,
        _mainListRow = elm.parentElement,
        _mainList = elm.parentElement.parentElement.parentElement,
        _viewHeight = _mainList.offsetHeight;

    if (_sublist.classList.contains('list-subwrapper--open')) {
        _sublist.removeAttribute('style');
        _sublist.classList.remove('list-subwrapper--open');
    } else {
        let _elmentTopPos = _mainListRow.offsetTop,
            _scrollPos = _mainList.scrollTop,
            _subHeight = calculateMaxHeight(_sublist) + 4;

        _sublist.style.height = calculateMaxHeight(_sublist) + 4 + 'px';
        _sublist.classList.add('list-subwrapper--open');

        if (
            _elmentTopPos + _subHeight > _scrollPos + _viewHeight &&
            _subHeight <= _viewHeight - 80
        ) {
            scrollTo(_mainList, _scrollPos + _subHeight + 10, 300);
        }
    }
}

const closeVersions = evt => {
    let _list = evt.currentTarget.parentElement.parentElement;
    if (_list.classList.contains('list-subwrapper--open')) {
        _list.removeAttribute('style');
        _list.classList.remove('list-subwrapper--open');
    } else {
        _list.style.height = calculateMaxHeight(_list) + 4 + 'px';
        _list.classList.add('list-subwrapper--open');
    }
}

const setFlowActive = (wpId, vId) => {
    idsToMutate = {
        WorkprocessId: wpId,
        VersionId: vId,
    };
    mutationAction = 'save';

    showConfirm();
}

const deleteFlow = (wpId, vId) => {
    // console.log('deleteFlow wpId:', wpId, 'vId:', vId);
    idsToMutate = {
        WorkprocessId: wpId,
        VersionId: vId,
    };
    mutationAction = 'delete';
    showConfirm();
}

const addScriptToList = responseObject => {
    let scriptObject = responseObject.response;

    scriptObject.sortTime = Date.parse(scriptObject.DateModified);
    scriptObject.DateModified = new Date(
        scriptObject.DateModified
    ).toLocaleDateString('nl', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
    scriptObject.aDescription =
        setVersionDescription(scriptObject);

    let _isNew = unOrderedList.find(
            (s) => s.Id == scriptObject.Id
        ),
        _activeEdited;

    if (!_isNew) {
        unOrderedList.push(scriptObject);
        _activeEdited = true;
    } else {
        //edit
        let _indexToUpdate = unOrderedList.findIndex(
            (s) => s.Id == scriptObject.Id
        );
        _activeEdited =
            unOrderedList[_indexToUpdate].Versions.length !=
            scriptObject.Versions.length;
        unOrderedList[_indexToUpdate] = scriptObject;
    }

    orderedList.value = [...unOrderedList];
    totalScripts.value = orderedList.value.length;

    filterList();

    nextTick(() => {
        if (_activeEdited) {
            updateVersionDimentions(scriptObject.Id);
        }
        hightLightFlow(responseObject.Id);
    });

    showLoader(false);
    scriptManagerVisible.value = false;
}

const hightLightFlow = id => {
    [
        ...document.querySelectorAll('.list-subwrapper__line--mutated'),
    ].forEach((line) => {
        if (line !== flowLineToEdit) {
            line.classList.remove('list-subwrapper__line--mutated');
        }
    });

    if (flowLineToEdit === null) {
        flowLineToEdit = document.querySelector(
            '.list-subwrapper__line[data-id=\'' + id + '\']'
        );
    }

    flowLineToEdit.classList.add('list-subwrapper__line--mutated');
}

const mutateVersionList = (idsToMutate, dataoperation) => {
    let _workprocess = unOrderedList.find(
            (script) =>
                script.Id === parseInt(idsToMutate.WorkprocessId)
        ),
        _isLastFlow = _workprocess.Versions.length === 1;

    // console.log(`mutateVersionList 'workprocess' dataoperation: ${dataoperation} idsToMutate: ${idsToMutate}`);
    IPCCCConfigurator.Request(
        selectedCustomerId.value,
        'workprocess',
        dataoperation,
        idsToMutate,
        null
    )
    .then((response) => {
        // console.log(response);
        updateList(
            response.WorkprocessId,
            response.VersionId,
            dataoperation,
            _isLastFlow
        );
    })
    .catch((error) => {
        //EVEN NETJES AFHANDELEN ER IS IETS MIST GEGAAN MET HET ACTIVEREN
        showLoader(false);
        showModalDialog(
            new BoxProps(
                ModalType.Alert,
                store.state.settings.dialog.dialogalertheader,
                store.state.settings.scriptmanager.errormsg.exit
            )
        );
        console.error('Script activation error ', error);
    });
}

const updateList = (wId, vId, action, isLastFlow = false) => {
    let _wpindex,
        _index,
        _oldIndex = -1;

    let _script = unOrderedList.find((script, index) => {
        if (script.Id == wId) {
            _wpindex = index;

            script.Versions.forEach((version, index) => {
                if (version.Id == vId) _index = index;
                if (version.Active) _oldIndex = index;
            });

            return script;
        }
    });

    if (action === 'save') {
        _script.ActiveIndex = _index;
        _script.aDescription = _script.Versions[_index].Description;
        _script.Versions[_index].Active = true;
        if (_oldIndex != -1) _script.Versions[_oldIndex].Active = false;

        unOrderedList[_wpindex].ActiveIndex = unOrderedList[
            _wpindex
            ].Versions.findIndex((v) => v.Active);
    } else {
        //delete
        if (isLastFlow) {
            unOrderedList.splice(_wpindex, 1);
        } else {
            unOrderedList[_wpindex].Versions.splice(_index, 1);
            updateVersionDimentions(wId);
        }
        [
            ...document.querySelectorAll(
                '.list-subwrapper__line--mutated'
            ),
        ].forEach((line) => {
            line.classList.remove('list-subwrapper__line--mutated');
        });
    }

    orderedList.value = [...unOrderedList];
    totalScripts.value = orderedList.value.length;

    filterList();

    showLoader(false);
}

//=========================================================== ADD FLOW
const addFlow = async () => {
    showLoader(true);
    getData(selectedCustomerId.value, -1).then(
        async (response) => {
            await scriptStore.init(selectedCustomerId.value, [])
            selectedScript.value = Object.assign({}, response);

            // console.log('addFlow', selectedScript.value);
            //isStatic.value       = true;

            //Comunicatie ID default for now 1 == 'phone'
            getFunctions(1).then(
                (result) => {
                    functionList.value = [...result];
                    scriptManagerVisible.value = true;
                    showLoader(false);
                },
                (error) => {
                    console.error('->', error);
                    showLoader(false);
                }
            );
        },
        (error) => {
            showLoader(false);
            console.error('Error: ' + error);
        }
    );
}

const closeScriptmanager = () => {
    scriptManagerVisible.value = false;
}

const getNextIndex = () => {
    let _index = -1;
    selectedScript.value.ScriptFlow.Mainflow.forEach((mod) => {
        _index =
            _index < parseInt(mod.ModuleNumber)
                ? parseInt(mod.ModuleNumber)
                : _index;
    });
    return _index + 1;
}

const getModuleFromLibrary = (
    moduleId,
    moduleInsertAfter,
    atExitType,
    exitTypeAlt
) => {
    return new Promise((resolve, reject) => {
        try {
            let _flowObj;
            IPCCCConfigurator.Request(
                selectedCustomerId.value,
                'scriptfunctions',
                'readone',
                null,
                moduleId
            )
            .then((result) => {
                _flowObj = result;
                _flowObj.ParentModule = parseInt(moduleInsertAfter);
                _flowObj.exitType = atExitType;
                _flowObj.GUIMemory = {altExitType: exitTypeAlt};

                const _isExitMandatory = (k) => {
                    let _result = false;
                    _flowObj.ExitParameters.find((exit) => {
                        if (exit.Name == k && exit.Mandatory) {
                            _result = true;
                        }
                    });
                    return _result;
                };

                for (const [key, value] of Object.entries(
                    _flowObj
                )) {
                    if (
                        key.indexOf('Exit') !== -1 &&
                        _isExitMandatory(key)
                    ) {
                        _flowObj[key] = MANDATORY_EXIT;
                    }
                }

                _flowObj.exitTypeAlt = exitTypeAlt;
                resolve(_flowObj);
            })
            .catch((error) => {
                console.error(error);
                reject(error);
            });
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}

const placeRedirectOnExit = params => {
    let _index = selectedScript.value.ScriptFlow.Mainflow.findIndex(
            (m) => parseInt(m.ModuleNumber) === parseInt(params.modNr)
        ),
        _moduleToEdit = selectedScript.value.ScriptFlow.Mainflow[_index];
    _moduleToEdit[params.exit] = REDIRECT_EXIT;
    selectedScript.value.ScriptFlow.Mainflow.splice(_index, 1);
    selectedScript.value.ScriptFlow.Mainflow.splice(
        _index,
        0,
        Object.assign({}, _moduleToEdit)
    );
}

const getTreePath = (module, acc) => {
    let _numbersToCut = [...acc];

    for (const [key, value] of Object.entries(module)) {
        if (
            key.indexOf('Exit') !== -1 &&
            parseInt(value) > 1 &&
            parseInt(value) < MANDATORY_EXIT
        ) {
            let __index =
                selectedScript.value.ScriptFlow.Mainflow.findIndex(
                    (mod) =>
                        parseInt(mod.ModuleNumber) ===
                        parseInt(module[key])
                );
            _numbersToCut.push(parseInt(module[key]));
            _numbersToCut = getTreePath(
                selectedScript.value.ScriptFlow.Mainflow[__index],
                _numbersToCut
            );
        }
    }
    return _numbersToCut;
}

const reIndexPasteBoard = () => {
    let _startIndex = getNextIndex(),
        _toReIndexed = [],
        _dirtyBits = [];

    _toReIndexed = JSON.parse(JSON.stringify(pasteBoard.value));

    _toReIndexed.forEach((module, index) => {
        let _oldModuleNumber = module.ModuleNumber;

        module.ModuleNumber = _startIndex;

        _toReIndexed.forEach((_module, _index) => {
            //CHECK DIRTYBIT, CREATE EMPTY ARRAY IF NOT EXISTS
            if (typeof _dirtyBits[_index] === 'undefined') {
                _dirtyBits[_index] = [];
            }
            //CHECK PARENT FOR OLD NUMBER, IF TRUE UPDATE AND SET DIRTYBIT
            if (
                _module.ParentModule == _oldModuleNumber &&
                _dirtyBits[_index].indexOf('ParentModule') === -1
            ) {
                _module.ParentModule = _startIndex;
                _dirtyBits[_index].push('ParentModule');
            }
            //CHECK EXITS FOR OLDNUMBER, IF TRUE UPDATE AND SET DIRTYBIT
            for (const [key, value] of Object.entries(_module)) {
                if (
                    key.indexOf('Exit') !== -1 &&
                    value === _oldModuleNumber &&
                    _dirtyBits[_index].indexOf(key) === -1
                ) {
                    _module[key] = _startIndex;
                    _dirtyBits[_index].push(key);
                }
            }
        });

        _startIndex += 1;
    });

    pasteBoard.value = [];
    pasteBoard.value = JSON.parse(JSON.stringify(_toReIndexed));

    // console.log('_dirtyBits', _dirtyBits);
    // console.log('_toReIndexed', _toReIndexed);
};


onMounted(() => {
    selectedCustomerId.value =
        store.getters.getCustomerInfo().selectedCustomerId;
    if (selectedCustomerId.value !== -1) {
        getData(selectedCustomerId.value, '').then(
            () => {
                showLoader(false);
            },
            (error) => {
                console.error('Error: ' + error);
                showLoader(false);
            }
        );
    }

    unSubscribe = store.watch(
        store.getters.getCustomerInfo,
        (cObj) => {
            if (cObj.selectedCustomerId != -1) {
                showLoader(true);
                selectedCustomerId.value = cObj.selectedCustomerId;
                closeScriptmanager();
                getData(selectedCustomerId.value, '').then(
                    () => {
                        showLoader(false);
                    },
                    (error) => {
                        console.error('Error: ' + error);
                        showLoader(false);
                    }
                );
            }
        }
    );
});

const userDraftScript = computed(() => {
    const draftScript = orderedList.value.find((item) => item.IsDraft);
    return draftScript ?? null;
});

const userDraftVersion = computed(() => {
    if (!userDraftScript.value) return null;

    const draftVersion = userDraftScript.value?.Versions.find((item) => item.IsDraft) ?? null;
    return !!draftVersion ? draftVersion : null;
})

const userHasDraft = computed(() => !!userDraftScript.value);

onBeforeUnmount(() => {
    unSubscribe();
});
</script>

<template>
    <div data-e2e="script-library">
        <!-- DIALOG CONFIRM -->
        <Confirm-Box :acceptLabel="store.state.settings.scriptmanager.acceptlbl" :bodyContent="dialogText"
                     :cancelLabel="store.state.settings.scriptmanager.cancellbl"
                     :header="store.state.settings.scriptmanager.confirmheader" :status="showDialog"
                     @accepted="okConfirm" @canceled="cancelConfirm"/>

        <!-- CONTEXT MENU -->
        <div ref="contextMenu" class="list-content__row-menu" @click="clickedOnList($event)"
             @mouseleave="closeContextMenu($event)">
            <a class="button__icon">&#xF1D9;</a>
            <ol>
                <li class="list-content__menu-item opensublist--js">
                    <span>&#xF150;</span>{{store.state.settings.scriptbuilder.rowlbls[0]}}
                </li>
            </ol>
        </div>

        <!-- SCRIPT LIST SCREEN -->
        <div v-if="!scriptManagerVisible" class="list-wrapper">
            <div class="list-topbar">
                <div class="list-topbar__content">
                    <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
                        <input v-model="searchStr" :placeholder="store.state.settings.scriptbuilder.searchtxt"
                               type="text" @keyup="filterList()"/>
                    </div>
                    <div class="typo-tabletitle">
                        {{totalScripts + ' ' + store.state.settings.scriptbuilder.scriptcountlabel}}
                    </div>
                    <div class="grid--push">
                        <div class="form-button__secondary form-button__secondary--add grid--push">
                            <button @click="addFlow()">{{store.state.settings.scriptbuilder.addscriptlabel}}</button>
                        </div>
                    </div>
                    <div class="form-checkbox form-checkbox--large showflashscripts-container">
                        <input id="showflashscripts" v-model="showFlash" name="showflashscripts" type="checkbox"/>
                        <label for="showflashscripts">{{store.state.settings.scriptbuilder.showflashlabel}}</label>
                    </div>
                </div>
            </div>
            <div class="list-content-wrapper">
                <div class="list-content--back">
                    <div v-if="userHasDraft" class="unsaved-scripts">
                        <p>You have an unsaved script. user: {{store.getters.getUserId()}}</p>
                        <div>
                            <button class="button-primary" @click="openDraft()">
                                {{store.state.settings.scriptmanager.edit}}
                            </button>&nbsp;
                            <button class="button-primary button-primary--delete"
                                    @click="deleteDraft()">
                                {{store.state.settings.scriptmanager.delete}}
                            </button>
                        </div>
                    </div>
                    <div v-else class="list-content--back-continued">
                        <div class="list-content--header">
                            <div class="list-content__row--header">
                                <span class="list-content__row-cell list-content__row-cell--20" data-sortorder="NONE"
                                      @click="sortColumn('Name', $event)"
                                      v-html="store.state.settings.scriptbuilder.scolheads[0]"></span>
                                <span class="list-content__row-cell list-content__row-cell--35"
                                      v-html="store.state.settings.scriptbuilder.scolheads[1]"></span>
                                <span class="list-content__row-cell list-content__row-cell--20" data-sortorder="NONE"
                                      @click="sortColumn('ScriptType', $event)"
                                      v-html="store.state.settings.scriptbuilder.scolheads[5]"></span>
                                <span class="list-content__row-cell list-content__row-cell--15" data-sortorder="NONE"
                                      @click="sortColumn('sortTime', $event)"
                                      v-html="store.state.settings.scriptbuilder.scolheads[2]"></span>
                                <span class="list-content__row-cell list-content__row-cell--15" data-sortorder="NONE"
                                      @click="sortColumn('DeployedNumberCount', $event)"
                                      v-html="store.state.settings.scriptbuilder.scolheads[3]"></span>
                            </div>
                        </div>
                        <VirtualListViewer
                            ref="listContentWrapper"
                            class="list-content"
                            rowClasses="list-content__row--virtual list-content__row--clickable"
                            :data="orderedList"
                            @click="clickedOnList($event)"
                        >
                            <template v-slot="{ row, index }">
                                <div v-show="row.ScriptType !== 'Flash' || showFlash" :key="index"
                                    :class="[
                                        // 'list-content__row list-content__row--clickable',
                                        'list-content__row--hover-action', 'activeflow--js',
                                        { 'isflashscript': row.ScriptType == 'Flash' },
                                        'list-row',
                                        { 'list__row--zebra' : index % 2 == 0 },
                                        { 'list__row--selected' : row.selectedRow }
                                    ]"
                                    :data-id="activeId(row)"
                                    :data-index="index"
                                >
                                    <span class="list-content__row-cell list-content__row-cell--20" :title="row.Name"
                                          v-html="row.Name"></span>
                                    <span class="list-content__row-cell list-content__row-cell--35" :title="row.aDescription"
                                          v-html="row.aDescription"></span>
                                    <span class="list-content__row-cell list-content__row-cell--20"
                                          v-html="row.ScriptType"></span>
                                    <span class="list-content__row-cell list-content__row-cell--15"
                                          v-html="row.DateModified"></span>
                                    <span class="list-content__row-cell list-content__row-cell--15"
                                          v-html="row.DeployedNumberCount"></span>
                                    <div class="list-content__row-cell list-content__row-cell--icons sublist--js">
                                        <a :data-index="index" class="button__icon list-content__row-hover"
                                           @mouseenter="hoverRow($event)">&#xF1D9;</a>
                                    </div>
                                    <ol :data-qId="row.Id" class="list-subwrapper">
                                        <li class="list-subwrapper__line list-subwrapper__line--header">
                                            <span class="list-subwrapper__cell-icon"></span>
                                            <span class="list-subwrapper__cell-desc">{{
                                                    store.state.settings.scriptbuilder.scolheads[1]
                                                }}</span>
                                            <span class="list-subwrapper__cell-date">{{
                                                    store.state.settings.scriptbuilder.scolheads[2]
                                                }}</span>
                                            <span class="list-subwrapper__cell-user">{{
                                                    store.state.settings.scriptbuilder.scolheads[4]
                                                }}</span>
                                            <a class="list-subwrapper__cell-close" @click="closeVersions($event)">{{
                                                    store.state.settings.scriptbuilder.closelbl


                                                }}&nbsp;<i>&#xF156;</i></a>
                                        </li>
                                        <li v-for="(version, index) in row.Versions" :key="index"
                                            :class="['list-subwrapper__line activeflow--js', { 'isflashscript': row.ScriptType == 'Flash' }]"
                                            :data-id="version.Id">
                                            <span v-if="index == row.ActiveIndex"
                                                  class="list-subwrapper__cell-icon list-subwrapper__cell-icon--active">&#xF134;</span>
                                            <span v-else :data-id="version.Id" :data-wpid="row.Id"
                                                  class="list-subwrapper__cell-icon activate--js">&#xF130;</span>
                                            <span class="list-subwrapper__cell-desc">{{version.Description}}</span>
                                            <span class="list-subwrapper__cell-date"
                                                  v-html="modifiedDate(version.DateModified)"></span>
                                            <span class="list-subwrapper__cell-name"
                                                  v-html="version.ModifierName"></span>
                                            <span v-if="!version.Active" :data-id="version.Id" :data-wpid="row.Id"
                                                  class="list-subwrapper__cell-lasticon delete--js">&#xFA78;</span>
                                        </li>
                                    </ol>

                                </div>
                            </template>
                        </VirtualListViewer>
                    </div>
                </div>
            </div>
        </div>

        <ScriptManager ref="scriptview" :functionlist="functionList" :isstatic="isStatic"
                       :isvisible="scriptManagerVisible" :pasteboard="pasteBoard"
                       :rawscript="selectedScript" :selectedcustomerid="selectedCustomerId"
                       @closeManager="closeScriptmanager" @scriptcreated="addScriptToList"/>
    </div>
</template>

<style lang="scss" scoped>
@use "@/scss/includes/globals" as g;

.showflashscripts-container {
    position: relative;
    float: right;
    // display: inline-block;
    width: auto;
    margin-right: 30px;
    padding-top: 14px;
    font-size: 0.9rem;
}

.isflashscript {
    font-style: italic;
    cursor: auto;

    .activate--js,
    .delete--js {
        cursor: pointer;
    }

    span {
        color: g.$color-gray40;
    }
}

.unsaved-scripts {
    text-align: center;
}

.unsaved-scripts p {
    margin: 20px 0 10px 0;
}
</style>
