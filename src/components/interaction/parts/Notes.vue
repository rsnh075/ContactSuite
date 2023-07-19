<script lang="ts">

/**
 *
 * Call history
 *
 *
 * @project ContactSuite
 * @version 1.0
 * @author Erik Rosenhart
 * @copyright 2017
 * @licence MIT
 *
 * @date 10-12-2021
 * @modified
 *
 * @todo
 *
 */

import	{	useStore	}				from 'vuex';
import	{
	computed,
        	defineComponent, inject,
			nextTick,
			onMounted,
			reactive, ref,
			watch
    	}                        		from 'vue';
// import 		ArrowButton             	from '../../uielements/ArrowButton.vue';
import 	{ 	IPCCCConfigurator	}   	from '../../../ipccc/js/configurator';
import 	{ 	ISOdateTimetoDate,
			diffTwoISOsToMillisec,
      		dateToLocalTimeHHMMSS,
            currentLocalDateTimeISO
		}							    from '../../../use/dateFunctions';
import 	{ 	useExportNotes		}       from '../../../use/exportNotesFunctions';
import 		VirtualListViewer     		from '../../uielements/VirtualListViewer.vue';
import 	{ 	dynamicSort,
			dynamicSortMultiple }    	from '../../../use/sortFunctions';
import 	{	DEFAULTNOTETEMPLATE	} 		from './note-parts/Defaultnotetemplate';
import  {	FilterData }               	from '../../../types/Notes';
import 	Notepopup        		   		from './note-parts/Notepopup.vue';
import 	NotesFilters        		    from './note-parts/NotesFilters.vue';
import 	NotesAddNote        		    from './note-parts/NotesAddNote.vue';
import { Note }                 		from './../../../types/Notes';
import { deepCopy }                 	from '../../../use/helperFunctions';

export default defineComponent({
	name : 'Notes',
	// inheritAttrs: false,
	components: {
    	// ArrowButton,
		VirtualListViewer,
		NotesFilters,
		NotesAddNote,
		Notepopup
	},
	props: {
      tabprops : {
        type    : Object,
        default : {}
      },
      isactive : {
        type : Boolean,
        default : false
      }
    },
	setup() {
		const 	store:object | any       	= useStore(),
				toggleLoader:Function    	= inject('toggleLoader'),
				getFrameClass:Function   	= inject('getFrameClass'),
				requiredNote                = inject('requiredNote'),
                lastInboundLineInfo         = inject('lastInboundLineInfo'),
				exportNotesFn:Object 		= useExportNotes(),
				rawList                     = ref([]),
				searchValueNotes            = ref(''),
				noteDetail					= ref(null),
				selectedNoteTemplate		= ref(null),
				popUpStatus					= ref('closed'),
				hasEditableTemplateFields	= ref(false),
				filterData                  = reactive({
					SearchValue             : '',
					From                    : '',
					Till                    : '',
					OnlyEmpty               : false
        		}) as FilterData,
				currentNote                 = ref<Note>(new Note);

        const DEFAULTDAYSAGO = 182;

		//requiredNote
		watch(requiredNote.value, (newVal, oldVal) => {
			if (Object.keys(newVal).length > 0 && currentNote.value.caseId !== newVal.caseId) {
				currentNote.value = deepCopy(newVal);
				setDefaultFilterValues();
				filterData.SearchValue = String(currentNote.value.number);
				getNotes('incommingNumber')
				.then(() => {
                    if (!store.getters.getSupervisorIsListening()) {
                        handleNote('incommingNumber')
                    }
				})
				.catch((e) => {console.error(e)})
			}
		});

        watch(() => lastInboundLineInfo.value.nvpData, (newVal, oldVal) => {
            if(newVal && newVal.length > 0 && !lastInboundLineInfo.value.ShowConversationNote) {
                handleNewNvpData(newVal, lastInboundLineInfo.value.name);
            }
        }, {immediate:true});

        const stripSip = (rawNr) => {
            return rawNr?.indexOf('@') ? rawNr.split('@')[0] : rawNr;
        }

        const handleNewNvpData = (nvpdata, routinggroup) => {
            let _nvpcontact = nvpdata.reduce((acc, el) => {
                if(el.Name == '!CONTACT') {
                    let _contact = {};
                    el.Tuples.forEach(tuple => {
                        _contact[tuple.Name] = tuple.Value;
                    });
                    _contact.Phonenumber = stripSip(_contact.Phonenumber);
                    acc = _contact;
                }
                return acc;
            }, {});
            if (_nvpcontact && _nvpcontact.Phonenumber !== '') {
                setFilterData(_nvpcontact.Phonenumber, routinggroup);
            }

        }

        //23678 when nvp data and no requirednote then set filterdata
        const setFilterData = (number, routinggroup) => {
            filterData.SearchValue = number;
            let _rgindex = userRGTemplateList.value.findIndex(el => el.RoutingGroup == routinggroup)
            if(routinggroup && routinggroup !== '' && _rgindex !== -1) {
                if (userRGTemplateList.value[_rgindex].Id !== selectedRGId.value) {
                    setSelectedRGId(userRGTemplateList.value[_rgindex].RoutingGroupId);
                }
            }
        }

        //23688 when user closes nvp data then reset filterdata
        const resetFilterData = () => {
            if (store.state.unsavedNote.NoteId > 0) {
                //has unsaved note do nothing
            } else {
                setSelectedRGId(-1);
                setDefaultFilterValues(); //only default noteslist
                getNotes('default')
                .catch((e) => {console.error(e)})
            }
        };

        store.watch(store.getters.getUserResetInboundLineInfo, bool => {
            if(bool) {
                if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] user reset inbound line info');
				resetFilterData();
			}
		});

		const exportList = () => {
			toggleLoader(true);
			// let _nr = (moduleparams.incommingNumber === '') ? filterData.SearchValue : moduleparams.incommingNumber;
			IPCCCConfigurator.Request(store.getters.getCustomerInfo().customerId, 'ConversationNotes', 'export', filterData, null)
			.then(response => {
				let _processedList       = processListData(response),
					_processedSortedList = sortExportList(_processedList),
					_file                = new Blob([exportNotesFn.createJSON2CSV(_processedSortedList)], {type: 'text/plain', endings: 'native'}),
					// _nr                  = (moduleparams.incommingNumber === '') ? filterData.SearchValue :  moduleparams.incommingNumber,
					_link                = document.createElement("a"),
					_date                = ISOdateTimetoDate( new Date() );

				// _link.download = store.state.settings.notes.title + '_' + _nr + '_' + _date + '.csv';
				_link.download = store.state.settings.notes.title + '_' + '_nr' + '_' + _date + '.csv';
				if(window.webkitURL != null) {
					_link.href          = window.webkitURL.createObjectURL(_file);
				} else {
					_link.href          = window.URL.createObjectURL(_file);
					_link.style.display = "none";
					document.body.appendChild(_link);
				}
				_link.click();
				toggleLoader(false);
			})
			.catch(error => {
				console.error('error:', error);
				toggleLoader(false);
			});
			toggleLoader(false);
		}

		const sortExportList = (exportlist) => {
			return exportlist.sort(dynamicSortMultiple('TemplateId', 'dateInMilliseconds'));
		}

		const totalNotes  = ref(0);
		const orderedList = ref([]);
		const filterList = () => {
			orderedList.value   = filterListOnString(rawList.value, searchValueNotes.value.toLowerCase());
			totalNotes.value    = orderedList.value.length;
			sortColumn(null);
		}

		const filterListOnString = (list, str) => {
			if(str != '') {
				let _rawList = [...list];
				return _rawList.filter(item => {
				if(item['screenDate'].toLowerCase().indexOf(str) != -1 ||
					item['Name'].toLowerCase().indexOf(str) != -1 ||
					item['durationForCaller'].toString().indexOf(str) != -1 ||
					item['Agent'].toLowerCase().indexOf(str) != -1) {
					return item;
				};
				});
			} else {
				return [...list];
			}
		}

		const sortSetting = reactive({
          order : 'ASC',
          key   : 'Date'
        });

		const sortColumn = (key, e = null) => {
			let _order,
				_t;

			if(e != null) {
				_t     = e.target;
				_order = _t.getAttribute('data-sortOrder');
				document.querySelectorAll('.notes__list-header > span').forEach( a => a.setAttribute('data-sortorder', 'NONE'));
				sortSetting.key   = key;
				sortSetting.order = _order;
			} else {
				_order = sortSetting.order;
				key    = sortSetting.key;
			}

			switch(_order) {
				case 'NONE':
				orderedList.value.sort(dynamicSort(key));
				if(e != null)
					_t.setAttribute('data-sortOrder', 'ASC');
				break;
				case 'ASC':
				orderedList.value.sort(dynamicSort('-' + key));
				if(e != null)
					_t.setAttribute('data-sortOrder', 'DES');
				break;
				case 'DES':
				orderedList.value = filterListOnString(rawList.value, searchValueNotes.value.toLowerCase());
				totalNotes.value  = orderedList.value.length;
				if(e != null)
					_t.setAttribute('data-sortOrder', 'NONE');
				break;
			}
		}

		const handleNote = (initiator, id = null) => {
			toggleLoader(true);
			if(id !== null && (initiator == 'listisclicked' || initiator == 'unsavednote')) { // edit note
				IPCCCConfigurator.Request(store.getters.getCustomerInfo().customerId, 'ConversationNotes', 'readone', null, id)
				.then(response => {
					if((response.Note == '' && response.TemplateId > -1) || ((response.Note == '' || response.Note == '{\"Note\":\"\"}') && response.TemplateId == -1)) {
						hasEditableTemplateFields.value = true; //is empty thus handle as new note but set popupStatus to edit because if you save the note it is saved with comment 'notitie aangepast'
					} else {
						hasEditableTemplateFields.value = false;
					}
					if(response.TemplateId == -1) {
						selectedNoteTemplate.value = DEFAULTNOTETEMPLATE;
						noteDetail.value           = {...response};
						noteDetail.value.Note      = IsJsonString(noteDetail.value.Note) ? JSON.parse(noteDetail.value.Note) : {'Note' : noteDetail.value.Note};
						popUpStatus.value          = 'edit';
					} else {
						getNoteTemplate(response.TemplateId).then((template) => {
							selectedNoteTemplate.value = template;
							noteDetail.value           = {...response};
							noteDetail.value.Note      = IsJsonString(noteDetail.value.Note) ? JSON.parse(noteDetail.value.Note) : {'Note' : noteDetail.value.Note};
							nextTick(() => popUpStatus.value          = 'edit');
						});
					}
                    if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] start edit note (listisclicked || unsavednote)', noteDetail.value);
				})
				.catch(error => {
					console.error('error:', error);
				});
				toggleLoader(false);
				return;
			}
			if((initiator == 'incommingNumber')) { // new note
				let _template = currentNote.value.conversationNoteTemplate;
				if(!_template) {
					_template = DEFAULTNOTETEMPLATE;
				}
				filterData.SearchValue = currentNote.value.number === '' ? filterData.SearchValue : currentNote.value.number;
				IPCCCConfigurator.Request(store.getters.getCustomerInfo().customerId, 'ConversationNotes', 'readnew', _template.Id, filterData.SearchValue)
				.then(response => {
					setUnsavedNote(response[0].Id, response[0].TemplateId);
					hasEditableTemplateFields.value     = true;
					selectedNoteTemplate.value          = _template;
					selectedNoteTemplate.value.Template = IsJsonString(_template.Template) ? JSON.parse(_template.Template) : _template.Template;
					noteDetail.value                    = Object.assign({}, response[0]);
					noteDetail.value.Note               = {};
					noteDetail.value.incommingNumber    = filterData.SearchValue;
					filterData.SearchValue        		= currentNote.value.number;
                    if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] start new note (incommingNumber)', noteDetail.value);
					popUpStatus.value                   = 'new';
				})
				.catch(error => {
					console.error('error:', error);
					toggleLoader(false);
				});
				toggleLoader(false);
				return;
			}
			if(initiator == 'notesaddbtn') { // new note
				IPCCCConfigurator.Request(store.getters.getCustomerInfo().customerId, 'ConversationNotes', 'readnew', selectedNoteTemplate.value.Id, filterData.SearchValue)
				.then(response => {
					hasEditableTemplateFields.value   = true;
					noteDetail.value                  = Object.assign({}, response[0]);
					noteDetail.value.Note             = {};
					noteDetail.value.incommingNumber  = filterData.SearchValue;
                    if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] start new note (notesaddbtn)', noteDetail.value);
					popUpStatus.value                 = 'new';
				})
				.catch(error => {
					console.error('error:', error);
					toggleLoader(false);
				});
				toggleLoader(false);
				return;
			}
		}

		const saveNote = (noteData) => {
			toggleLoader(false);
            if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] saveNote', noteData);
			IPCCCConfigurator.Request(store.getters.getCustomerInfo().customerId, 'ConversationNotes', 'save', noteData, null)
			.then(response => {
				setUnsavedNote(-1, -1);
				let _id      = response.Id,
					_dateISO = new Date(response.Date),
					_index   = rawList.value.findIndex(note => note.Id == _id);

				response.screenDate                    = ISOdateTimetoDate(_dateISO);//startdatum 1e agent
				response.screenTime                    = dateToLocalTimeHHMMSS(_dateISO);//starttijd 1e agent
				response.durationForCaller             = calcDuration('durationForCaller', response.ServiceAgentNumber, response.Date, response.StartServiceAgentCall, response.EndServiceAgentCall);
				response.durationServiceAgentCall      = calcDuration('durationServiceAgentCall', response.ServiceAgentNumber, response.Date, response.StartServiceAgentCall, response.EndServiceAgentCall);
				response.durationServiceAgentCallInSec = calcDuration('durationServiceAgentCallInSec', response.ServiceAgentNumber, response.Date, response.StartServiceAgentCall, response.EndServiceAgentCall);

				if(_index != -1) {
				    rawList.value.splice(_index, 1, response);
				} else {
				    rawList.value.push(response);
				}
				filterList();
				noteDetail.value = null;
				popUpStatus.value = 'closed';
				toggleLoader(false);
			})
			.catch(error => {
				console.error('error:', error);
				popUpStatus.value = 'closed';
				toggleLoader(false);
			});
		}

		const deleteNote = (noteToDelete) => {
			toggleLoader(true);
			IPCCCConfigurator.Request(store.getters.getCustomerInfo().customerId, 'ConversationNotes', 'delete', noteToDelete, null)
			.then(response => {
				setUnsavedNote(-1, -1);
				let _id      = response.Id,
					_index   = rawList.value.findIndex(note => note.Id == _id);

				if(_index != -1) {
				rawList.value.splice(_index, 1);
				}

				filterList();
				noteDetail.value  = null;
				popUpStatus.value = 'closed';
				toggleLoader(false);
			})
			.catch(error => {
				console.error('error:', error);
				toggleLoader(false);
			});
		}

		const cancelNote = () => {
			noteDetail.value  = null;
			popUpStatus.value = 'closed';
		}

		const processListData = (list) => {
			let _list = list.reduce((mutatedlist, note) => {
				let _dateISO                       = new Date(note.Date);
				note.dateInMilliseconds            = _dateISO.getTime();
				note.screenDate                    = ISOdateTimetoDate(_dateISO);
				note.screenTime                    = dateToLocalTimeHHMMSS(_dateISO);
				//note.durationForCaller = calcDuration('durationForCaller', note.ReferredTo, note.Date, note.StartServiceAgentCall, note.EndServiceAgentCall);
				//note.durationServiceAgentCall = calcDuration('durationServiceAgentCall', note.ReferredTo, note.Date, note.StartServiceAgentCall, note.EndServiceAgentCall);
				//note.durationServiceAgentCallInSec = calcDuration('durationServiceAgentCallInSec', note.ReferredTo, note.Date, note.StartServiceAgentCall, note.EndServiceAgentCall);
				note.durationForCaller             = calcDuration('durationForCaller', note.ServiceAgentNumber, note.Date, note.StartServiceAgentCall, note.EndServiceAgentCall);
				note.durationServiceAgentCall      = calcDuration('durationServiceAgentCall', note.ServiceAgentNumber, note.Date, note.StartServiceAgentCall, note.EndServiceAgentCall);
				note.durationServiceAgentCallInSec = calcDuration('durationServiceAgentCallInSec', note.ServiceAgentNumber, note.Date, note.StartServiceAgentCall, note.EndServiceAgentCall);

				note.Note       = IsJsonString(note.Note) ? JSON.parse(note.Note) : {'Note' : note.Note};
				mutatedlist.push(note);
				return mutatedlist;
			}, []);
			return _list;
		}

		const setUnsavedNote = (noteid, templateid) => {
			let _unsavedNote        = store.getters.getUnsavedNote();
			_unsavedNote.NoteId     = noteid;
			_unsavedNote.TemplateId = templateid;
			store.commit('SET_UNSAVEDNOTE', _unsavedNote);
		}

		const getUserRGTemplates = () => {
			return new Promise((resolve, reject) => {
				toggleLoader(true);
				IPCCCConfigurator.Request(store.getters.getCustomerInfo().customerId, "ConversationNotes", "routinggrouptemplate", null, -1)
				.then(response => {
					resolve(response);
				})
				.catch(error => {
					reject(error);
				});
				toggleLoader(false);
			});
		}

		const getNotes = (identifier) => {
			return new Promise((resolve, reject) => {
				toggleLoader(true);
				let _filterdata = Object.assign({}, filterData);
				_filterdata.SearchValue = identifier == 'default' ? '%' + _filterdata.SearchValue + '%' : _filterdata.SearchValue;
				if(filterData.From == '') {
					console.error('Filterdata.From is not set');
				}
				if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] _filterdata for ConversationNotes search Request: ', _filterdata);
				IPCCCConfigurator.Request(store.getters.getCustomerInfo().customerId, 'ConversationNotes', 'search', _filterdata, null)
				.then(response => {
					rawList.value = processListData(response);
					filterList();
					resolve();
				})
				.catch(error => {
					reject(error);
				});
				toggleLoader(false);
			});
		}

		const getNoteTemplate = (id) => {
			return new Promise((resolve, reject) => {
				toggleLoader(true);
				IPCCCConfigurator.Request(store.getters.getCustomerInfo().customerId, 'ConversationNoteTemplate', 'readone', null, id)
				.then(response => {
					if(IsJsonString(response.Template)) response.Template = JSON.parse(response.Template);
					resolve(response);
				})
				.catch(error => {
					reject(error);
				});
				toggleLoader(false);
			});
		}

		const IsJsonString = (str) => {
			try {
				JSON.parse(str);
			} catch (e) {
				return false;
			}
			return true;
		}

		const timeInHourMinSec = (sec) => {
			return new Date(sec * 1000).toISOString().substring(11, 19);
		}

		const calcDuration = (type, referredto, startforcaller, startserviceagentcall, endserviceagentcall) => {
			let _duration = '';
			switch(type) {
				case 'durationForCaller':
				if(referredto.length > 0 && startforcaller && startforcaller != '' && endserviceagentcall && endserviceagentcall != '') _duration = timeInHourMinSec(diffTwoISOsToMillisec(startforcaller, endserviceagentcall) / 1000);
				else _duration = store.state.settings.notes.durationforcallerunknown;
				break;
				case 'durationServiceAgentCall':
				if(referredto.length > 0 && startserviceagentcall && startserviceagentcall != '' && endserviceagentcall && endserviceagentcall != '') _duration = timeInHourMinSec(diffTwoISOsToMillisec(startserviceagentcall, endserviceagentcall) / 1000);
				else _duration = store.state.settings.notes.durationforcallerunknown;
				break;
				case 'durationServiceAgentCallInSec':
				if(referredto.length > 0 && startserviceagentcall && startserviceagentcall != '' && endserviceagentcall && endserviceagentcall != '') _duration = `${Math.round((diffTwoISOsToMillisec(startserviceagentcall, endserviceagentcall) / 1000)).toString()}`;
				else _duration = store.state.settings.notes.durationforcallerunknown;
				break;
				default:
				_duration = store.state.settings.notes.durationforcallerunknown;
			}
			return _duration;
		}

		const setDefaultFilterValues = () => {
			let _defaultDaysAgoInMs       = new Date().setDate( new Date().getDate() - DEFAULTDAYSAGO );
			let _defaultDaysAgoParts      = new Date(_defaultDaysAgoInMs).toLocaleString('nl', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute : '2-digit' }).split(' ');
			let _defaultDaysDateParts     = _defaultDaysAgoParts[0].split('-');
			let _currentDateTimeParts   = new Date().toLocaleString('nl', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute : '2-digit' }).split(' ');
			let _currentDateParts       = _currentDateTimeParts[0].split('-');
			filterData.From             = _defaultDaysDateParts[2] + '-' + _defaultDaysDateParts[1] + '-' + _defaultDaysDateParts[0] + 'T' + _defaultDaysAgoParts[1];
			filterData.Till             = _currentDateParts[2] + '-' + _currentDateParts[1] + '-' + _currentDateParts[0] + 'T' + '23:59:59';
			filterData.SearchValue      = '';
			filterData.OnlyEmpty        = false;
		}

		const getFilteredNoteList = (obj) => {
			filterData.SearchValue = obj.SearchValue;
			filterData.From        = obj.From;
			filterData.Till        = obj.Till;
			filterData.OnlyEmpty   = obj.OnlyEmpty;
			getNotes('default')
			.then(() => {})
			.catch((e) => {console.error(e)})
		}

		const addNoteVisibleStatus = ref(false);
		const filterVisibleStatus  = ref(false);
		const toggleNotesFilters = () => {
			if(addNoteVisibleStatus.value) addNoteVisibleStatus.value = false;
			filterVisibleStatus.value = !filterVisibleStatus.value;
		}
		const toggleAddNote = () => {
			if(filterVisibleStatus.value) filterVisibleStatus.value = false;
			addNoteVisibleStatus.value = true;
		}

		const selectedRGId = ref(-1);
		const setSelectedRGId = (id) => {
			selectedRGId.value = id;
		}

		const userRGTemplateList = ref([]);
		const addNote = (val) => {
			toggleLoader(true);
			filterData.SearchValue            = val;
			addNoteVisibleStatus.value        = false;
			let _selectedNoteTemplate         = userRGTemplateList.value.find(template => template.RoutingGroupId == selectedRGId.value);
			if(!_selectedNoteTemplate || _selectedNoteTemplate == 'undefined') {
				selectedNoteTemplate.value    = DEFAULTNOTETEMPLATE
				console.error('selectedNoteTemplate is undefined. Defaultnotetemplate is returned');
			} else {
				selectedNoteTemplate.value          = _selectedNoteTemplate;
				selectedNoteTemplate.value.Template = IsJsonString(_selectedNoteTemplate.Template) ? JSON.parse(_selectedNoteTemplate.Template) : _selectedNoteTemplate.Template;
			}
			getNotes('notesaddbtn')
			.then(() => {
				handleNote('notesaddbtn');
			})
			.catch((e) => {console.error(e)});
		}

		onMounted(() => {
			getUserRGTemplates().then((rgtmpllist:any) => {
				userRGTemplateList.value   = rgtmpllist;
			}).catch((e) => {console.error(e)})

			if(store.getters.getUnsavedNote().NoteId !== -1) { //unsaved required note not saved
				setDefaultFilterValues();
				getNotes('default')
				.then(() => {
					handleNote('unsavednote', store.getters.getUnsavedNote().NoteId)
				}).catch((e) => {console.error(e)})
			} else {
				setDefaultFilterValues(); //only default noteslist
				getNotes('default')
				.catch((e) => {console.error(e)})
			}

			//set DefaultRightTab to SmartId

			// setActiveRightTab(4);
		});

		toggleLoader(false);

		return {
			store,
			getFrameClass,
			rawList, orderedList,
			handleNote, toggleAddNote, filterVisibleStatus, addNoteVisibleStatus, getFilteredNoteList, toggleNotesFilters, setDefaultFilterValues, searchValueNotes, filterData, filterList, totalNotes,
			sortColumn,
			exportList, userRGTemplateList, selectedRGId, setSelectedRGId, addNote,
			popUpStatus, selectedNoteTemplate, noteDetail, hasEditableTemplateFields,
			deleteNote, saveNote, cancelNote,
			requiredNote, currentNote, resetFilterData
		}
	}
});
</script>

<template>
    <div>
        <Notepopup
            :notedata="noteDetail"
            :visible="popUpStatus"
            :selectedtemplate="selectedNoteTemplate"
            :haseditabletemplatefields="hasEditableTemplateFields"
            @delete="deleteNote"
            @save="saveNote"
            @cancel="cancelNote"
        />
        <section :class="['notes-wrapper', {'preventclicklayer' : noteDetail}]" data-e2e="notes">

            <header class="notes-header">
                <NotesAddNote
                    :visible="addNoteVisibleStatus"
                    :rgtemplatelist="userRGTemplateList"
                    :selectedrgid="selectedRGId"
                    :searchvalue="filterData.SearchValue"
                    @close="addNoteVisibleStatus = false"
                    @setroutinggroupid="setSelectedRGId"
                    @addnote="addNote"
                />
                <NotesFilters
                    :visible="filterVisibleStatus"
                    :filterdata="filterData"
                    @close="filterVisibleStatus = false"
                    @getfilterednotelist="getFilteredNoteList"
                    @resetfilters="resetFilterData"
                />
                <div class="notes-header__titlebar">
                    <div class="notes-header__titlebar__title">{{ store.state.settings.notes.title }}</div>
                    <div class="form-button__secondary form-button__secondary--add notes-addbtn">
                        <button @click="toggleAddNote">{{ store.state.settings.notes.addlbl }}</button>
                    </div>
                </div>
                <div class="notes-header__searchbar">
                    <div class="form-textfield notes__search-number">
                        <a :class="['button-primary', 'button-primary--gray', 'notes-openfiltersbtn', {'notes-openfiltersbtn--isopen' : filterVisibleStatus}]" @click="toggleNotesFilters()">{{ store.state.settings.notes.openfiltersbtn }}</a>
                    </div>
                    <div v-show="rawList.length > 0" class="form-textfield notes__search">
                        <input type="text" v-model="searchValueNotes" :placeholder="store.state.settings.notes.searchlbl" @keyup="filterList()">
                    </div>
                    <div v-if="getFrameClass().indexOf('RM') !== -1 && rawList.length > 0" class="typo-tabletitle typo-tabletitle--mod">
                        {{totalNotes + " " + store.state.settings.notes.totallbl}}
                    </div>
                </div>
            </header>
            <div :class="['notes__list-wrapper', {'notes__list-wrapper--wide' : getFrameClass().indexOf('RM') !== -1}]" ref="notesList">
                <div :class="['notes__list-header', {'notes__list-header--small' : getFrameClass().indexOf('RM') === -1}]">
                    <span class="status--visible"                                          					@click="sortColumn('Date', $event)"              data-sortorder="NONE">{{ store.state.settings.notes.headerlbls[0] }}</span>
                    <span class="status--visible"                                          					@click="sortColumn('Name', $event)"              data-sortorder="NONE">{{ store.state.settings.notes.headerlbls[1] }}</span>
                    <span :class="['status', {'status--visible' : getFrameClass().indexOf('RM') !== -1}]"	@click="sortColumn('durationForCaller', $event)" data-sortorder="NONE">{{ store.state.settings.notes.headerlbls[2] }}</span>
                    <span :class="['status', {'status--visible' : getFrameClass().indexOf('RM') !== -1}]" 	@click="sortColumn('Agent', $event)"             data-sortorder="NONE">{{ store.state.settings.notes.headerlbls[3] }}</span>
                </div>
                <VirtualListViewer class="notes__list-body"
                    :data      = "orderedList"
                    rowheight  = 37
                    rowClasses = ""
                >
                    <template v-slot="{ row }" >
                        <div :class="['notes__list-body-row', 'row--js', {'notes__list-body-row--small' : getFrameClass().indexOf('RM') === -1}]" :data-id="row.Id" :ref="'row' + row.rawCodeIndex"  @click="handleNote('listisclicked', row.Id)">
                            <span class="status--visible">{{ row.screenDate }}</span>
                            <span class="status--visible">{{ row.Name }}</span>
                            <span :class="['status', {'status--visible' : getFrameClass().indexOf('RM') !== -1}]">{{ row.durationForCaller }}</span>
                            <span :class="['status', {'status--visible' : getFrameClass().indexOf('RM') !== -1}]">{{ row.Agent }}</span>
                        </div>
                    </template>
                </VirtualListViewer>
            </div>
            <div class="notes-footer">
                <a v-show="totalNotes > 0" class="button-primary button-primary--export" @click="exportList()">{{ store.state.settings.notes.exportlbl }}</a>
            </div>
        </section>
    </div>
</template>

<style lang="scss" scoped>
@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions" as fn;

.notes-wrapper {
    width: 100%;
	height: 100%;
    padding : .5rem .5rem;
	&.preventclicklayer {
		pointer-events: none;
	}
    .notes-header {
		line-height: 50px;
		font-size: 1.1rem;
		font-family: 'Open Sans SemiBold', sans-serif;
		// overflow: hidden;
		min-width: 400px;
		max-width: 1280px;
		margin: 0 auto;
		color: globals.$color-gray60;
		position: relative;
    }


    .notes-header__titlebar {
		display: flex;
		align-items: center;
		border-bottom: 1px solid globals.$color-gray15;
		&__title {
			flex-grow: 1;
		}
		.notes-addbtn {
			margin-top: 0;
			color: globals.$color-gray60;
		}
    }

    .notes-header__searchbar {
      .notes__search,
      .notes__search-number {
        float: left;
      }
      .notes__search {
        width : 50%;
        padding: 8px 5px 0 0;
        max-width: 300px;
        &:before {
          content: '\F349';
          position: absolute;
          top: 60%;
          left: 3px;
          transform: translateY(-50%);
          font-family: 'Material Design Icons';
          font-weight: normal;
          font-style: normal;
          font-size: 1.3rem;
          display: inline-block;
          color: globals.$color-gray20;
        }
        input {
          margin: 0;
          text-indent: 24px;
        }
      }
      .notes__search-number {
        width : 50%;
        max-width: 140px;
        padding: 8px 5px 0 5px;
      }
      .notes-openfiltersbtn {
        // background-color: globals.$color-gray5;
        color: globals.$color-gray80;
        &:after {
          padding-left: 7px;
          margin-right: -10px;
          content: '\F236';
          font-family: 'Material Design Icons';
          font-weight: normal;
          font-style: normal;
          font-size: 1.2rem;
          color: globals.$color-gray25;
          vertical-align: top;
        }
        &:hover, &--isopen {
          &:after {
            color: globals.$color-interaction;
          }
        }
      }
    }

    .notes__list-wrapper {
      position: absolute;
      top: 122px;
      bottom: 60px;
      width: calc(100% - 50px);
      left: 50%;
      max-width: 1280px;
      transform: translateX(-50%);
      background-color: globals.$color-white;
      z-index: 100;
      &--wide {
        border: 1px solid globals.$color-gray20;
      }
    }

    .notes__list-header {
      position: relative;
      display: block;
      float: left;
      width: 100%;
      span {
        color: globals.$color-gray60;
        text-align: left;
        width: auto;
        height: 40px;
        line-height: 40px;
        padding: 0 12px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        font-size: .9em;
        font-family: 'Open Sans SemiBold', sans-serif;
      }
    }

    .notes__list-body {
      position: absolute;
      top: 41px;
      left: 0;
      bottom: 0;
      width: 100%;
      overflow: hidden;
      overflow-y: overlay;
      .notes__list-body-row {
        width: 100%;
        text-align: left;
        height: 40px;
        line-height: 40px;
        font-size: .9em;
        background-color: globals.$color-white;
        cursor: pointer;
        &:nth-child(even) {
          background-color: globals.$color-gray2;
        }
        span {
          text-align: left;
          width: auto;
          height: 40px;
          line-height: 40px;
          padding: 0 12px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          pointer-events: none;
        }
      }
    }

    .notes__list-header,
    .notes__list-body-row {
      span {
        float: left;
        &:nth-child(1) {
          width: 20%;
        }
        &:nth-child(2) {
          width: 40%;
        }
        &:nth-child(3) {
          width: 20%;
        }
        &:nth-child(4) {
          width: 20%;
        }
      }
      &--small span {
        &:nth-child(1) {
          width: 35%;
        }
        &:nth-child(2) {
          width: 65%;
        }
      }
    }

    .status {
      display: none;
      &--visible {
        display: inline-block;
      }
    }

    .notes-footer {
      position: absolute;
      bottom: 20px;
      right: 25px;
      z-index: 100;
    }

    .typo-tabletitle--mod {
      margin-top: 1rem;
    }
  }

</style>