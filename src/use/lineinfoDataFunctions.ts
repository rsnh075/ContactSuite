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

import { IPCCCDataSubscriber }	from '../ipccc/js/datasubscriber.js';
import { IPCCCData }			from '../ipccc/js/data';
import { currentLocalDateTimeISO } from '../use/dateFunctions';
import { useStore }      		from 'vuex';
import { nextTick }             from '@vue/runtime-core';
import { ref,
         onMounted,
         provide
       }                 		from 'vue';
import {
		timeToClockHHMMSS
       }                 		from './dateFunctions';

import { Note }                 from './../types/Notes';
import { LineInfo }             from './../types/LineInfo';

export function useLineinfoData() {
	const store:object | any       = useStore(),
          lineinfoList             = ref([]),
          requiredNote             = ref<Note>(new Note()),
          addCall                  = ref(true),
          addingSecondCall         = ref(false),
          isCallingVoicemail       = ref(false),
          lineActive               = ref(false),
          timerId                  = ref(-1),
          lineStatus               = ref([false, false]),
          supervisor               = ref(false),
          supervisorIdle           = ref(false),
          supervisorListens        = ref(false),
          supervisorCoaching       = ref(false),
          supervisorJoined         = ref(false),
          supervisorLbl            = ref(0),
		  lastInboundLineInfo		= ref<LineInfo>(new LineInfo()),
		  lastInboundCaseId			= ref(-1);

	function setIsCallingVoicemail(iscallingvoicemail) {
		isCallingVoicemail.value = iscallingvoicemail;
	};

	provide('setIsCallingVoicemail', setIsCallingVoicemail);

	function switchCallDtmf(linelength) {
		if(isCallingVoicemail.value) {
			addCall.value              = false;
			addingSecondCall.value     = false;
		} else {
			switch(linelength) {
				case 0:
					addCall.value          = true;
					addingSecondCall.value = false;
					break;
				case 1:
					addCall.value          = addingSecondCall.value ? true : false;
					break;
				case 2:
					addCall.value          = false;
					addingSecondCall.value = false;
					break;
			}
		}
	}

	function setSecondCallActive() {
		addingSecondCall.value = true;
	}

	provide('setSecondCallActive', setSecondCallActive);

    //23688 when user closes nvp data then userResetLastInboundLineInfo
	function userResetLastInboundLineInfo() {
        if (lineActive.value)
        return;

        store.commit('USER_RESET_INBOUNDLINE_INFO', true);
	}

	provide('userResetLastInboundLineInfo', userResetLastInboundLineInfo);

	function handleNewLineinfo(linedetails) {
        procesLineinfo(linedetails);
    }

	function procesLineinfo(linedetails) {
		lineActive.value = linedetails.length > 0;
        if (linedetails[0]?.HideInfoPanel) lineActive.value = false; //case: 25952
		store.commit('SET_LINE_ACTIVE', lineActive.value);
		switchCallDtmf(linedetails.length);

		if(timerId.value != -1) {
			clearTimeout(timerId.value);
			timerId.value = -1;
		}

		lineStatus.value            = [false, false];
		supervisor.value            = false;
		supervisorIdle.value        = false;
		supervisorListens.value     = false;
		supervisorCoaching.value    = false;
		supervisorJoined.value      = false;

		for(let i=0; i<2; i++) {
			if(typeof linedetails[i] !== 'undefined') {
				let _time           = '00:00:00',
					_msStartTime    = new Date(linedetails[i].Time).getTime(),
					_msNow          = new Date().getTime(),
					_msDiff         = _msNow - _msStartTime,
					_isAnswered     = !linedetails[i].Time.split('T')[1].startsWith('00:00:00');

				if(_isAnswered && _msDiff > 0) {
					_time             = timeToClockHHMMSS(_msDiff);
				} else {
					_time             = '00:00:00';
				}

				lineStatus.value[i] = linedetails[i].IsConnected;

				let _x = String(linedetails[i].Name).indexOf("@");
				if(_x > -1)
					linedetails[i].Name = String(linedetails[i].Name).substring(0, _x);

				_x = String(linedetails[i].DNIS).indexOf("@");
				if(_x > -1)
					linedetails[i].DNIS = String(linedetails[i].DNIS).substring(0, _x);

				_x = String(linedetails[i].Number).indexOf("@");
				if(_x > -1)
					linedetails[i].Number = String(linedetails[i].Number).substring(0, _x);

				lineinfoList.value.splice(i, 1, {
					index						: i,
					time						: _time,
					isAnswered					: _isAnswered,
					name						: linedetails[i].Name, //Name can be CallerName or RGName
					dnis						: linedetails[i].DNIS,
					number						: linedetails[i].Number,
					caseId						: linedetails[i].CaseId,
					hideInfoPanel   			: linedetails[i].HideInfoPanel,
					isConnected					: linedetails[i].IsConnected,
					isRinging					: linedetails[i].IsRinging,
					isPBX						: linedetails[i].IsPBX,
					isOutbound					: linedetails[i].IsOutbound,
					showConversationNote		: linedetails[i].ShowConversationNote,
					conversationNoteTemplate	: linedetails[i].ConversationNoteTemplate,
					nvpData						: linedetails[i].NVPData.length > 0 ? reorderTuples(linedetails[i].NVPData) : [],
					useCDC						: linedetails[i].UseCDC,
					pushUrl                     : linedetails[i].IsOutbound === false ? store.getters.getPushUrl() : 'about:blank',
				});

				supervisor.value = (linedetails[i].SupervisorStatus && linedetails[i].SupervisorStatus != -1);

				switch(linedetails[i].SupervisorStatus) {
					case -1:
						supervisor.value         = false;
						supervisorLbl.value      = 0;
						break;
					case 1:
						supervisorListens.value  = true;
						supervisorLbl.value      = 1;
						break;
					case 2:
						supervisorCoaching.value = true;
						supervisorLbl.value      = 2;
						break;
					case 3:
						supervisorJoined.value   = true;
						supervisorLbl.value      = 3;
						break;
					default:
						supervisorIdle.value     = true;
						supervisorLbl.value      = 3;
				}

				//requiredNote
				if(linedetails[i].ShowConversationNote && _isAnswered && (requiredNote.value.caseId !== linedetails[i].CaseId)) {
					requiredNote.value.number                   = linedetails[i].Number;
					requiredNote.value.caseId                   = linedetails[i].CaseId;
					requiredNote.value.conversationNoteTemplate = linedetails[i].ConversationNoteTemplate;
				}

				//lastInboundLineInfo
				if( linedetails[i].IsOutbound === false &&
					linedetails[i].CaseId !== lastInboundCaseId.value &&
					linedetails[i].Number !== store.state.loginSession.PhoneNumber.split('@')[0]
				) {
                    if(i == 0) { //Dirty hack for IsOutbound is momentarily false when having a SN call and the agent calls out
                        lastInboundCaseId.value = linedetails[i].CaseId;
                        lastInboundLineInfo.value = lineinfoList.value[i];
                        if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] lastInboundLineInfo is changed: ', lastInboundLineInfo.value);
                    }
				} else if(
                    linedetails[i].IsOutbound === false &&
					linedetails[i].CaseId == lastInboundCaseId.value &&
					linedetails[i].Number !== store.state.loginSession.PhoneNumber.split('@')[0] &&
					hasChangedInfoValues(lineinfoList.value[i], lastInboundLineInfo.value)
				) {
                    if(i == 0) { //Dirty hack for IsOutbound is momentarily false when having a SN call and the agent calls out
                        lastInboundLineInfo.value = lineinfoList.value[i];
                        if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] lastInboundLineInfo is changed: ', lastInboundLineInfo.value);
                    }
				}

			} else {
				lineinfoList.value.splice(i, 1) //empty calldata
				// store.commit('CLEAN_CALL_DATA', i);
			}
		}

		if((typeof linedetails[0] !== 'undefined' || typeof linedetails[1] !== 'undefined') && timerId.value == -1) {
			timerId.value = setTimeout(() => { procesLineinfo(linedetails); }, 1000); //Loop for timer update
		}
	}

	//-------------Helpers------------//

	const hasChangedInfoValues = (newval, oldval) => {
		//time is excluded, only change lastInboundLineInfo when the following properties change
		if(
			newval.useCDC !== oldval.useCDC ||
			newval.pushUrl !== oldval.pushUrl ||
			newval.showConversationNote !== oldval.showConversationNote ||
            newval.nvpData.length !== oldval.nvpData.length
		) {
			return true;
		} else {
			return false;
		}
	}

	const reorderTuples = (nvpArr) => {
        return nvpArr.sort((a, b) => {
			if( a.Index < b.Index ) {
				return -1;
			}
			if( a.Index > b.Index ) {
				return 1;
			}
			return 0;
        });
    }

	onMounted(() => {
		IPCCCDataSubscriber.Subscribe("LINEINFO", handleNewLineinfo);

		//fix for agent in call then does F5. Request in stead of listening for LINEINFO via subscription because WFM doesn't know when agent is subscribed.
		IPCCCData.RequestData('LINEINFO', null)
		.then(result => {
			let _result = JSON.parse(result);
			if(_result.length > 0) {
				handleNewLineinfo(_result)
			}
		})
		.catch(error => {}); //Catch comes back when there is no call so not an error
		// .catch(error => console.log('no standing call')); //Catch comes back when there is no call so not an error

		store.watch(store.getters.getCommandsHangup, status => {
			if(!status && !lineActive.value && !isCallingVoicemail.value) {
				addCall.value = true;
			} else if(!status && !lineActive.value && isCallingVoicemail.value) {
				addCall.value = true;
				isCallingVoicemail.value = false;
			} else {
				addCall.value = false;
			}
			//fix 23081 - dont show status alert when supervisor invokes IPCCCSupervisor.Listen but supervisor didnt pick up.
			if(!status && store.getters.getSupervisorIsListening()) {
				store.commit('SET_SUPERVISOR_ISLISTENING', false);
			}
		});
		//catch the reset when call is not accepted in time or declined by user
		store.watch(store.getters.getResetInboundLineInfo, bool => {
			if(bool) {
				if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] reset inbound line info');

				lastInboundLineInfo.value = new LineInfo();

				//reset the boolean, for the decline to again have an effect on the lastInboundLineInfo.
				store.commit('RESET_INBOUNDLINE_INFO', false);
				//TODO: reset can be to early, and lineinfo overwrites the lastInboundLineInfo
			}
		});
        //user resets inboundlineinfo
		store.watch(store.getters.getUserResetInboundLineInfo, bool => {
			if (bool) {
                if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] user reset inbound line info');
                lastInboundLineInfo.value = new LineInfo();
				//reset the boolean, for the decline to again have an effect on the lastInboundLineInfo.
				nextTick(() => {
                    store.commit('USER_RESET_INBOUNDLINE_INFO', false);
                });
			}
		});
	});

	return {
		timerId,
		lineinfoList, requiredNote,
		lastInboundLineInfo,
        userResetLastInboundLineInfo,
		isCallingVoicemail,
		addingSecondCall, addCall, lineActive, lineStatus,
		supervisor, supervisorIdle, supervisorListens, supervisorCoaching, supervisorJoined, supervisorLbl
	}
}