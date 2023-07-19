/**
 *
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 1.0
 *
 * @todo
 *
 *
 */

import { IPCCCDataSubscriber }  from './../ipccc/js/datasubscriber.js';
import { IPCCCData }            from './../ipccc/js/data.js';
import { useStore }             from 'vuex';
import {
        onMounted,
        onUnmounted,
        ref,
        provide
    }                        from 'vue';
import {
        isToday,
        dayAndDateNL,
        dayAndDateUK,
        dateToTime
        }                       from '../use/dateFunctions';

export function useVoicemailData() {
    const store:object | any                = useStore(),
            rawRecordingList                  = ref([]),
            groupedByDayRecordingList         = ref([]),
            selectedRecording                 = ref({}),
            mutatedObj                        = ref<Object>({}),
            mutateAction                      = ref<String>(''),
            unreadVoicemailCounter            = ref(0);

    function updateCounter(list) {
        unreadVoicemailCounter.value = list.length > 0 ? list.reduce((acc, curr) => (!curr.IsRead) ? acc+1 : acc, 0) : 0;
    }

    function getTaskList() {
        IPCCCData.RequestData('tasklist', store.state.loginSession.Details.UserId)
        .then(succes => {
            rawRecordingList.value = JSON.parse(succes);
            groupedByDayRecordingList.value = groupByDay(rawRecordingList.value);
            updateCounter(rawRecordingList.value);
        })
        .catch(error => {
            console.error(error)
        });
    }

    function UpdateTaskList(mutatedRecording, action = '') {
        let _index = rawRecordingList.value.findIndex(rec => rec.Id == mutatedRecording.Id);

        if(_index !== -1 && action === '') {
            rawRecordingList.value.splice(_index, 1, mutatedRecording);
        } else if(_index !== -1 && action === 'setunread') {
            rawRecordingList.value[_index].IsRead = false;
        } else if(_index !== -1 && action === 'delete') {
            rawRecordingList.value.splice(_index, 1);
        } else {
            rawRecordingList.value.unshift(mutatedRecording);
        }
        groupedByDayRecordingList.value = groupByDay(rawRecordingList.value);
        updateCounter(rawRecordingList.value);
    }

    function setSelectedRecording(id:string) {
        let _selectedRec = rawRecordingList.value.find(rec => rec.Id == id);
        if(_selectedRec !== undefined) {
            selectedRecording.value    = _selectedRec;
            selectedRecording.value.fullName = stripNumber(selectedRecording.value.FullDate);
            selectedRecording.value.dateTime = formatDate(selectedRecording.value.DateTime);
        } else {
            closeSelectedRecording();
        }
    }

    provide('setSelectedRecording', setSelectedRecording);

    function closeSelectedRecording() {
        selectedRecording.value    = {};
    }

    // function updateListStatus(mObj, action) {
    //   mutateAction.value         = action;
    //   mutatedObj.value           = mObj;
    //   mutatedObj.value.IsRead    = false;
    // }

    // function updateListDeleted(mObj, action) {
    //   mutateAction.value         = action;
    //   mutatedObj.value           = mObj;
    //   selectedRecording.value    = {};
    // }

    const groupByDay = (taskList) => {
        let _dateArray = [];

        let _groupedList = taskList.reduce((listByDay, currentObj) => {
            if(!currentObj.Deleted) {
                let _currDate  = (store.getters.getLang() == 'en') ? dayAndDateUK(currentObj.DateTime) : dayAndDateNL(currentObj.DateTime);

                if (isToday(currentObj.DateTime) )
                    _currDate = store.state.settings.voicemailinbox.todaylabel;

                let _index = _dateArray.indexOf(_currDate);

                if(_index == -1) {
                    listByDay.push({
                        date : _currDate
                    });
                    listByDay.push(currentObj)
                    _dateArray.push(_currDate);
                    return listByDay;
                }
                listByDay.push(currentObj);
            }
            return listByDay;
        }, []);

        return _groupedList;
    }

    const markSelectedRecordingUnread = () => {
        if(selectedRecording.value.IsRead) {
            IPCCCData.RequestData('ResetVoicemail', { Id: selectedRecording.value.Id })
            .then(_ => {
                selectedRecording.value.IsRead = false;
                // msgTxt.value              = '';
                // updateListStatus(selectedRecording.value, 'setunread');
            })
            .catch(error => {
                console.error(error);
            });
        }
    }

    provide('markSelectedRecordingUnread', markSelectedRecordingUnread);

    const markSelectedRecordingRead = () => {
        selectedRecording.value.IsRead = true;
    }

    provide('markSelectedRecordingRead', markSelectedRecordingRead);

    const archiveSelectedRecording = () => {
        if(selectedRecording.value.IsRead) {
        IPCCCData.RequestData('DeleteVoicemail', { Id: selectedRecording.value.Id })
        .then(result => {
            // updateListDeleted(selectedRecording.value, 'delete');
        })
        .catch(error => {
            console.error(error);
        });
        }
    }

    provide('archiveSelectedRecording', archiveSelectedRecording);

    //=================== Helperfunctions

    const stripNumber = (nr) => {
        let _nr = nr;
        if(nr && nr.indexOf('@') != -1) {
        _nr = nr.split('@')[0];
        }
        return _nr;
    }

    const formatDate = (fullDate) => {
        let _time = dateToTime(new Date(fullDate)),
            _date = (store.getters.browserLanguage == 'en') ? dayAndDateUK(new Date(fullDate)) : dayAndDateNL(new Date(fullDate));

        return _time + " " + store.state.settings.voicemailinbox.dateseplabel + " " + _date;
    }

    onMounted(() => {
        getTaskList();
        IPCCCDataSubscriber.Subscribe("TASKLIST-UPDATE", UpdateTaskList)
    });

    onUnmounted(() => {
        IPCCCDataSubscriber.Desubscribe("TASKLIST-UPDATE", UpdateTaskList)
    });

    return {
        rawRecordingList, groupedByDayRecordingList,
        unreadVoicemailCounter, selectedRecording,
    }
}