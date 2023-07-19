<script lang="ts">

import { defineComponent }        from 'vue';
import VirtualListViewer		  from './../uielements/VirtualListViewer.vue';
import { IPCCCConfigurator }      from '../../ipccc/js/configurator';
import PikaDay                    from 'pikaday';
import { VALIDATE }               from './validateObj';
import EditUploadPromptDialog     from './EditUploadPromptDialog.vue';
import * as Mask                  from '../../use/mask';
import { dynamicSortMultiple }    from '../../use/sortFunctions';
import { validateValue }          from '../../helpers/validationRegex';
import { dateToLocal }            from '../../use/dateFunctions';
import { LanguageCode }           from '../../helpers/languageLib';

export default defineComponent({
    name: 'ServiceNumbers',
    data() {
		return {
			companyName                    : '',
			isReseller                     : false,
			portalCustomerData             : null,
			rawListData                    : [],
			listData                       : [],
			totalItems                     : 0,
			totalLabel                     : '',
			searchStr                      : '',
			prevSearchStr                  : '',
			selectedNumberId               : -1,
			selectedNumber                 : '',
			selectedNumberTitle            : '',
			selectedCustomerId             : '',
			showDialog                     : false,
			showConfirm                    : false,
			currentAction                  : '',
			dialogIsAlert                  : false,
			dialogIsConfirm                : false,
			dialogBodyText                 : '',
			dialogOkText                   : '',
			dialogPrevText                 : '',
			dialogCancelText               : '',
			dialogHeaderText               : '',
			sortSetting                    : {},
			currentPlanParts               : [],
			activeTab                      : 0,
			serviceNumberScript            : {},
			destinationNumbers             : [[], []],
			countString                    : '',
			customerId                     : -1,
			currentPlanPartLabels          : [],
			openingProfiles                : [],
			selectedProfileId              : -2,
			openingProfileNameFromSave     : '',
			openingProfileIdFromSave       : -1,
			openingHoursTitle              : '',
			openingHoursEditable           : false,
			openingHourDay                 : {
			Date           : null,
			DayNumber      : 0,
			DefinitionId   : -1,
			DetailId       : -1,
			FromTime1      : '00:00',
			ToTime1        : '00:00',
			FromTime2      : '00:00',
			ToTime2        : '00:00',
			active         : false
			},
			openingHourWeek                : [],
			newCalenderDate                : '',
			calendarItemValid              : false,
			calendarDates                  : [],
			portalPrompt                   : [],
			errormessages                  : [],
			errortabs                      : [-1, -1, -1, -1],
			validateObj                    : VALIDATE,
			newServiceNumberDialogVisible  : false,
			phoneSearchLength              : 3,
			helpText                       : [],
			sessionId                      : -1,
			newPrompt                      : {
			Url              : '',
			Description      : '',
			Id               : -1,
			IsDefault        : false,
			Title            : ''
			},
			promptNames                    : [],
			promptPlayer                   : null,
			audioIsPlaying                 : false,
			currentPromptTitle             : '',
			playerIcon                     : {
			play  : '&#xF40A',
			load  : '&#xF771',
			stop  : '&#xf4DB'
			},
			startsearchtext                : '',
			notfoundsearchtext             : '',
			tariffPer                      : '',
			setupTariff                    : '',
			diasabledDates                 : [],
			confirmError                   : false,
			confirmText                    : '',
			numberObjectToDelete           : null,
			openingHLChecked               : false,
			promptWatch                    : null,
			storeWatch                     : null
		};
    },
    inject: ['showLoader'],
	components: {
		VirtualListViewer,
      'edit-upload-prompt-dialog'  : EditUploadPromptDialog,
    },
    computed: {
		hasAddNumberRights() {
			return this.$store.getters.getPermission('NummerToewijzen');
		},
		removeNonPlayablePrompts() {
			this.portalPrompt.sort(dynamicSortMultiple('Title'));
			return this.portalPrompt.filter(prompt => prompt.Languages.length > 0);
		}
    },
	watch: {
		'serviceNumberScript.WelcomePrompt'(val) {
			let _selectedPrompt = this.portalPrompt.filter(prompt => prompt.Title == val);
			if (_selectedPrompt.length > 0) {
				this.serviceNumberScript.WelcomePrompt = _selectedPrompt[0].Title;
			}
		},
		'serviceNumberScript.ClosedPrompt'(val) {
			let _selectedPrompt = this.portalPrompt.filter(prompt => prompt.Title == val);
			if (_selectedPrompt.length > 0) {
				this.serviceNumberScript.ClosedPrompt = _selectedPrompt[0].Title;
			}
		},
		'serviceNumberScript.VoicemailPrompt'(val) {
			let _selectedPrompt = this.portalPrompt.filter(prompt => prompt.Title == val);
			if (_selectedPrompt.length > 0) {
				this.serviceNumberScript.VoicemailPrompt = _selectedPrompt[0].Title;
			}
		},
		'newPrompt.Title'(val) {
			this.uploadBtnState = this.fileInput.length != 0 && val.length != 0;
		}
    },
    methods: {
		fileInput(val) {
			this.uploadBtnState = this.newPrompt.Title.length != 0 && val.length != 0;
		},
		fillIfEmpty(value) {
			if(!value) 
			return '-';
			value = value.toString();
			return value.charAt(0).toUpperCase() + value.slice(1);
		},
		fillIfServiceNr(value) {
			if (value != '') return 'tiles-item__link--icon';
		},
		niceDate(value) {
			return value; 
		},
		perLabel(perCall, lbl) {
			return perCall ? lbl[0] : lbl[1];
		},
		placeSetup(isSetup, setuptariff) {
			return isSetup ? setuptariff : '';
		},
		toEuro(cents) {
			let _cents = cents.toString(),
			_nrOfDigets = _cents.length,
			_euros = '0,00';

			switch (_nrOfDigets) {
			case 1:
				_euros = '0,0' + _cents;
				break;
			case 2:
				_euros = '0,' + _cents;
				break;
			default:
				_euros =
				_cents.substring(0, _nrOfDigets - 2) +
				',' +
				_cents.substring(_nrOfDigets - 2, _nrOfDigets);
				break;
			}

			return _euros;
		},

		toggleHelp(evt) {
			evt.target.classList.toggle('dialog__window-help--active');
			document.querySelectorAll('.js__help').forEach(el => el.classList.toggle('balloon-dialog--help-visible'));
		},
		getPortalCustomers(succes, error) {
			if(this.portalCustomerData == null) {
			IPCCCConfigurator.Request(this.customerId, 'portalcustomers', 'readall', null, -1)
			.then(result => {
				if(typeof succes === 'function') 
				succes(result);   
			})
			.catch(error => {
				if(typeof error === 'function') 
				error();
			});
			}
		},
		checkReseller(ready) {
			let _isReseller = [];
			this.getPortalCustomers(response => {
			this.portalCustomerData = response;
			_isReseller = this.portalCustomerData.filter(cust => cust.IPCCCCustomerId == this.customerId);
			if(typeof ready === 'function') 
				ready(_isReseller.length > 0 ? _isReseller[0].IsReseller : false);
			}, err => {
			console.error('resellerCheck error');
			});
		},
		getdata(selId, dataItem, dataOperation) {
			this.listData = this.rawListData = [];
			this.totalItems = this.listData.length;
			IPCCCConfigurator.Request(selId, dataItem, dataOperation, null, -1)
			.then(result => {
				this.listData   = this.rawListData = result;
				this.totalItems = this.listData.length;
				//GET OPENINGHOURS
				IPCCCConfigurator.Request(selId, 'openinghours', 'readnew', null, -1)
				.then(result => {
					this.openingHoursNew = result[0];
					this.getOpeningHoursList(selId, _ => {
						//GET PROMPTS
						IPCCCConfigurator.Request(selId, 'portalprompt', 'readall', null, -1)
						.then(result => {
							this.portalPrompt = result;
							this.$nextTick(() => {
								this.showLoader(false);
							});
						})
						.catch(error => {
							this.showLoader(false);
							console.log('Error' + error );
						});
					});
					if(this.$store.getters.getDashboardSrcStr() != '') {
						this.searchStr = this.$store.getters.getDashboardSrcStr();
						this.$store.commit('SET_DASHBOARD_SRCSTR', '');
						this.filterList();
					} else {
						this.searchStr = '';
					}
				})
				.catch(error => {
					this.showLoader(false);
					console.log('Error' + error );
				});
			})
			.catch(error => {
				this.showLoader(false);
				console.log('Error: ' + error);
			});
		},
		getOpeningHoursList(selId, isDone) {
			IPCCCConfigurator.Request(selId, 'openinghours', 'readall', null, -1)
			.then(result => {
			this.openingProfiles = result;
			this.openingHLChecked = true;
			this.openingProfiles.unshift({
				CustomerId: this.selectedCustomerId,
				Details: {
				Date: null,
				DayNumber: 0,
				DefinitionId: -1,
				DetailId: -1,
				FromTime1: '00:00',
				ToTime1: '00:00',
				FromTime2: '00:00',
				ToTime2: '00:00',
				active: false
				},
				Id: -2,
				Title: this.$store.state.settings.portal.newselectopeninghours
			});
			if (typeof isDone === 'function') isDone();
			})
			.catch(error => {
			console.log('Error' + error );
			});
		},
		getScriptData() {
			//get data
			return new Promise((resolve, reject) => {
				IPCCCConfigurator.Request(this.selectedCustomerId, 'portalscript', 'readone', null, this.selectedNumberId)
				.then(result => {
					//CLEANUP AND SET
					this.clearOpeningTable();
					this.serviceNumberScript = [];
					this.serviceNumberScript = JSON.parse(JSON.stringify(result));
					this.selectedProfileId   = this.serviceNumberScript.OpeningHours.Id;
					this.destinationNumbers[0] = this.serviceNumberScript.CallGroup1;
					this.destinationNumbers[1] = this.serviceNumberScript.CallGroup2;

					this.loadProfile(null);
					resolve(result);
				})
				.catch(error => {
					reject(error);
				});
			});
		},
		filterList() {
			let _filterdata = JSON.parse(JSON.stringify(this.rawListData));
			this.listData = _filterdata.filter(
			nr =>
				nr.Title.toLowerCase().indexOf(this.searchStr.toLowerCase()) !=
				-1 || nr.Number.indexOf(this.searchStr.replace('-', '')) != -1
			);
			this.totalItems = this.listData.length;
		},
		filterListOnString(list, str) {
			if (str != '') {
				let _rawList = [...list];
				return _rawList.filter(item => {
					return (
						item.Name.toLowerCase().startsWith(str) ||
						item.Code.toLowerCase().startsWith(str) ||
						item.EmailAddress.toLowerCase().startsWith(str)
					);
				});
			} else {
				return [...list];
			}
		},
		dialogOpen(e, action, type, headerTxt) {
			let _target = this.isReseller ? e.target.parentElement.parentElement.parentElement.parentElement : e.currentTarget.parentElement.parentElement.parentElement;

			document.getElementById('js-help-btn').classList.remove('dialog__window-help--active');
			document.querySelectorAll('.js__help').forEach(el => el.classList.remove('balloon-dialog--help-visible'));

			this.showLoader(false);

			let _id = -1;
			if (e !== null) {
				this.selectedNumberId    = parseInt(_target.getAttribute('data-id'));
				this.selectedNumber      = _target.getAttribute('data-nr');
				this.selectedNumberTitle = _target.getAttribute('data-title');
			}

			//dialogHeader is not declared and not filled.
			this.dialogHeader    = headerTxt;
			this.dialogIsAlert   = type == 'alert';
			this.dialogIsConfirm = false;
			this.currentAction   = action;
			this.activeTab       = 0;

			switch (action) {
				case 'edit-new':
					this.dialogOkText     = this.$store.state.settings.portal.dialogNextText;
					this.dialogPrevText   = this.$store.state.settings.portal.dialogPrevText;
					this.dialogCancelText = this.$store.state.settings.portal.dialogCancelText;
					this.getScriptData()
					.then(() => {
						//FILL TITLE FROM
						this.serviceNumberScript.ServiceNumberTitle = this.selectedNumberTitle;
						//SHOW DIALOG
						this.getCallPlanPart(this.activeTab)
						.then(() => {
							this.showDialog = true;
							this.showLoader(false);
						})
						.catch(error => {
							this.showLoader(false);
							console.log('Error' + error );
						});
					})
					.catch(error => {
						this.showLoader(false);
						console.log('Error' + error );
					});
					break;
			}
		},
		confirmDeleteNumber(e) {
			let _target = e.target.parentElement.parentElement.parentElement.parentElement;

			this.selectedNumber       = _target.getAttribute('data-nr');
			this.numberObjectToDelete = this.rawListData.filter(nrObj => nrObj.Number == this.selectedNumber);
			this.showConfirm          = true;
		},
		deleteNumber() {
			if(this.numberObjectToDelete[0] != null) {
			IPCCCConfigurator.Request(this.selectedCustomerId, 'portalservicenumber', 'delete', this.numberObjectToDelete[0], -1)
			.then(result => {
				this.removeNumberOutOfList(result);
			})
			.catch(error => {
				this.confirmError = true;
				this.confirmText  = error;
				//this.hideConfirm();
			});
			} else {
			console.error('NOK: Number not found in list');
			}
		},
		hideConfirm() {
			this.selectedNumberId    = '';
			this.selectedNumber      = '';
			this.selectedNumberTitle = '';
			this.confirmError        = false;
			this.confirmText         = ''
			this.showConfirm         = false;
		},
		dialogClose() {
			this.showDialog = false;
			this.stopAndResetAudio();
			this.cleanUpFieldValidation();
			this.clearOpeningTable();
			setTimeout(() => {
			this.dialogHeader = '';
			this.dialogIsAlert = false;
			}, 500);
			this.errormessages = [];
			this.errortabs = [];
		},
		removeNumberOutOfList(numberObj) {
			let _index = -1;
			this.rawListData.map((number, index) => {
			if(number.Number == numberObj.Number) _index = index;
			});
			
			if(_index != -1)
			this.rawListData.splice(_index, 1);

			this.listData   = JSON.parse(JSON.stringify(this.rawListData));
			this.totalItems = this.listData.length;
			this.hideConfirm();
		},
		cleanUpFieldValidation() {
			let _fields = document.querySelectorAll('span[data-name]');
			_fields.forEach((el:HTMLElement) => {
				el.style.display = 'none';
			});
		},
		setDatePicker() {
			this.datePicker = new PikaDay({
			field: document.getElementById('datepicker'),
			format: 'DD-MM-YYYY',
			minDate: new Date(),
			i18n: this.$store.state.settings.datepicker,
			disableDayFn: date => {
				let _formatedDate = dateToLocal(date);
				if (this.diasabledDates.indexOf(_formatedDate) !== -1) {
				return date;
				}
			},
			onSelect: () => {
				if (this.diasabledDates.indexOf(this.datePicker.toString()) === -1) {
				//WORK AROUND KEYBOARD SELECTABLE DISABLED DATE
				this.newCalenderDate = this.datePicker.toString();
				} else {
				//WORK AROUND KEYBOARD SELECTABLE DISABLED DATE
				this.newCalenderDate = ''; //WORK AROUND KEYBOARD SELECTABLE DISABLED DATE
				} //WORK AROUND KEYBOARD SELECTABLE DISABLED DATE
			}
			});
		},
		getShiftedIndex(index, shift = 2, length = 7) {
			return Math.abs(index + shift <= length ? index + shift : index - length);
		},
		//================================ NEW SERVICENUMBER DIALOG ================================//
		openNewServicenumberListDialog() {
			this.$store.commit('SET_NUMBERDIALOG', true);
		},
		//================================ SAVE AND PARTS ================================//
		getCallPlanPart(tabindex) {
			return new Promise((resolve, reject) => {
				let _result = false;
				switch (parseInt(tabindex)) {
					case 2:
						this.destinationNumbers[0] = this.serviceNumberScript.CallGroup1;
						this.destinationNumbers[1] = this.serviceNumberScript.CallGroup2;
						//In case Servicenumber is not yet set
						this.serviceNumberScript.Servicenumber = this.selectedNumber;
						_result = true;
						break;
					default:
						_result = true;
						break;
				}
				_result ? resolve(_result) : reject();
			});
		},
		nextTab() {
			if (this.activeTab < this.currentPlanPartLabels.length - 1) {
			this.stopAndResetAudio();
			this.activeTab++;
			this.getCallPlanPart(this.activeTab)
			.then(() => {
				this.showLoader(false);
			})
			.catch(_ => {});
			}
		},
		prevTab() {
			if (this.activeTab >= 1) {
			this.stopAndResetAudio();
			this.activeTab--;
			this.getCallPlanPart(this.activeTab)
			.then(() => {
				this.showLoader(false);
			})
			.catch(_ => {});
			}
		},
		switchTab(e) {
			let _index = e.target.getAttribute('data-tabindex');
			this.showLoader(true);
			this.getCallPlanPart(_index)
			.then(() => {
			this.showLoader(false);
			this.activeTab = _index;
			this.stopAndResetAudio();
			})
			.catch(_ => {});
		},
		//================================ DESTINATIONS / CALL FORWARD================================//
		reorderNumbers({ oldIndex, newIndex }, index) {
			const movedItem = this.destinationNumbers[index].splice(oldIndex, 1)[0];
			this.destinationNumbers[index].splice(newIndex, 0, movedItem);

			setTimeout(() => {
			this.destinationNumbers[index].map((el, index) => {
				el.Priority = index;
			});
			}, 500);
		},
		addDestination(index) {
			let _priority = this.destinationNumbers[index].length;
			this.destinationNumbers[index].push({
			Address: '',
			Connections: '1'
			});

			document.querySelectorAll('.list-number-wrapper input[type=text]').forEach((el:HTMLButtonElement) => {
				let _icon = el.parentElement.querySelector('.button__icon--edit');
				_icon.classList.remove('button__icon--active');
				el.disabled = true;
				//sortables[0].options.disabled = false;
			});

			setTimeout(() => {
				let _list = document.querySelector('#list-number-wrapper--' + index);
				_list
					.querySelector('li:last-child')
					.querySelectorAll('input[type=text]')
					.forEach((el:HTMLButtonElement, index) => {
					el.disabled = !el.disabled;
					if (index == 0) el.focus();
					let _icon = el.parentElement.querySelector('.button__icon--edit');
					_icon.classList.add('button__icon--active');
					//sortables[0].options.disabled = true;
					});
				_list.scrollTop = _list.scrollHeight;
			}, 250);
		},
		setDestinationEditable(e) {
			let _target = e.target,
			_parent = _target.parentElement.parentElement,
			_list = _parent.parentElement;

			//sortables[0].options.disabled = true;

			_list.querySelectorAll('input[type=text]').forEach(el => {
			let _icon = el.parentElement.querySelector('.button__icon--edit');
			if (
				el.getAttribute('data-index') != _target.getAttribute('data-index')
			) {
				el.disabled = true;
				_icon.classList.remove('button__icon--active');
			} else {
				_icon.classList.add('button__icon--active');
			}
			});

			_parent.querySelectorAll('input[type=text]').forEach(el => {
			el.disabled = !el.disabled;
			if (el.classList.contains('list-number-number') && el.disabled) {
				_target.classList.remove('button__icon--active');
				//sortables[0].options.disabled = false;
			}
			});
		},
		deleteDestination(e, index) {
			let _index = e.target.getAttribute('data-index');
			this.destinationNumbers[index].splice(_index, 1);
		},
		checkCount(evt, prop, propIndex, index) {
			this.destinationNumbers[propIndex][index][prop] = Mask.isMaxNumberMask(evt, 999);
		},
		checkAndSetDefault(evt, prop, propIndex, index) {
			let _val = parseInt(evt.target.value);
			if (isNaN(_val) || _val == 0)
			this.destinationNumbers[propIndex][index][prop] = 1;
		},
		checkPhoneNumber(evt, prop, propIndex, index) {
			this.destinationNumbers[propIndex][index][prop] = Mask.isPhoneNumberMask(evt);
		},
		nextFieldDestination(tindex, index) {
			// let _currentField = document.querySelector('#list-number-wrapper--' + index).querySelector('[tabindex="' + tindex + '"]'),
			//     _nextField    = document.querySelector('#list-number-wrapper--' + index).querySelector('[tabindex="' + (tindex+1) + '"]');
			// console.log(_currentField, _nextField);
			// if(_nextField != null)
			//   if(_currentField.disabled)
			//     _currentField.select();
			//   else
			//     this.nextFieldDestination((tindex+1), index);
			// else
			//   this.nextFieldDestination((tindex-1), index);
		},
		//================================ OPENING HOURS ================================//
		checkTime(e, prop) {
			let _target   = e.target,
				_dnr      = _target.getAttribute('data-daynr'),
				_tabindex = _target.getAttribute('tabindex').value,
				_modelItem;

			if(_target.parentElement.parentElement.classList.contains('tables-openings__cell--disabled') == false ) {
			Mask.isTimeMask(e);
			if(_target.id.indexOf('add') == -1) {
				_modelItem = this.openingHourWeek.filter(
				item => item.DayNumber == _dnr
				);
				_modelItem[0][prop] = _target.value;
			}
			} else {
			setTimeout(() => {
				_target.value = '00:00';
				_target.blur();
			}, 0);
			}

			const _validate = (target, compare) => {
			let _val               = parseInt(target.value.replace(':', '')),
				_fromVal           = parseInt(target.parentElement.parentElement.parentElement.querySelector("[id*='" + compare + "']").value.replace(':', ''));
				target.style.color = _val <= _fromVal ? '#C00' : '';
			};

			if(prop.indexOf('ToTime') != -1) 
			_validate(_target, '_start');

			if(prop.indexOf('FromTime2') != -1) 
			_validate(_target, '_stop');
		},
		nextField(tindex) {
			let _currentField = document.querySelector('#tableopenings').querySelector('[tabindex="' + tindex + '"]') as HTMLInputElement,
				_nextField    = document.querySelector('#tableopenings').querySelector('[tabindex="' + tindex++ + '"]');

			if(_nextField != null) {
			if(_currentField.parentElement.parentElement.classList.contains('tables-openings__cell--disabled') == false && _currentField.parentElement.classList.contains('form-timeslot--disabled') == false) {
				_currentField.select();
			} else {
				this.nextField(tindex++);
			}
			} else {
			this.nextField(1);
			}
		},
		nextFieldAdd(tindex) {
			let _currentField = document.querySelector('#tables-openings-add').querySelector('[tabindex="' + tindex + '"]') as HTMLInputElement,
				_nextField    = document.querySelector('#tables-openings-add').querySelector('[tabindex="' + tindex++ + '"]');

			if(_nextField != null) {
			if(_currentField.parentElement.classList.contains('form-timeslot--disabled') == false) {
				_currentField.select();
			} else {
				this.nextFieldAdd(tindex++);
			}
			} else {
			this.nextFieldAdd(1001);
			}
		},
		setNewProfile() {
			//CLEAR AND NEW
			this.clearOpeningTable();
			this.selectedProfileId          = -2;
			this.openingHoursEditable       = true;
			this.openingProfileIdFromSave   = -1;
			this.openingProfileNameFromSave = '';
			setTimeout(() => {
			document.getElementById('profilename').classList.add('form-input-button--active');
			}, 100);
		},
		loadProfile(e) {
			if(e != null) 
			this.selectedProfileId = e.target.value;

			if(this.selectedProfileId == -2) {
			//CLEAR AND NEW
			this.setNewProfile();
			} else if(this.selectedProfileId == -1) {
			//CLEAR AND LOCK
			this.clearOpeningTable();
			this.openingHoursEditable       = false;
			this.openingProfileIdFromSave   = -1;
			this.openingProfileNameFromSave = '';
			document.getElementById('profilename').classList.remove('form-input-button--active');
			} else {
			//LOAD PROFILE
			this.clearOpeningTable();
			let _profile                    = this.getOpeningHours(this.selectedProfileId);
			this.fillOpeningHours(_profile.openings);
			this.fillCalendar(_profile.calendars);
			this.openingProfileIdFromSave   = _profile.id;
			this.openingProfileNameFromSave = this.openingHoursTitle = _profile.title;
			document.getElementById('profilename').classList.remove('form-input-button--active');
			this.openingHoursEditable       = true;
			}
		},
		getOpeningHours(selIndex) {
			let _selOpeningHours = [],
			_selCalendarItems  = [],
			_name              = '',
			_id                = -1;

			//this.openingProfiles is empty from
			if(this.openingProfiles.length == 0) {
			//get openingProfiles
			}

			this.openingProfiles.map(profile => {
			if (profile.Id == selIndex) {
				_name = profile.Title;
				_id   = profile.Id;
				profile.Details.map(slot => {
				if (slot.DayNumber == 0) 
					_selCalendarItems.push(slot);
				else 
					_selOpeningHours.push(slot);
				});
			}
			});

			return {
			openings   : _selOpeningHours,
			calendars  : _selCalendarItems,
			title      : _name,
			id         : _id
			};
		},
		fillOpeningHours(openings) {
			let _rawOpenings = JSON.parse(JSON.stringify(openings));
			_rawOpenings.map(day => {
			this.openingHourWeek.filter((weekday, index) => {
				if(weekday.DayNumber == day.DayNumber) {
				if(weekday.active == false) {
					weekday.Date         = null;
					weekday.DayNumber    = day.DayNumber;
					weekday.DefinitionId = day.DefinitionId;
					weekday.DetailId     = day.DetailId;
					weekday.FromTime1    = day.FromTime;
					weekday.FromTime2    = '00:00';
					weekday.ToTime1      = day.ToTime;
					weekday.ToTime2      = '00:00';
					weekday.active       = true;
				} else {
					weekday.FromTime2    = day.FromTime;
					weekday.ToTime2      = day.ToTime;
					document.querySelector('#slot_' + index + '_2_start').parentElement.classList.remove('form-timeslot--disabled');
				}
				}
			});
			});
		},
		fillCalendar(calendarDays) {
			let _rawCalendarDays = JSON.parse(JSON.stringify(calendarDays));
			this.diasabledDates  = [];
			_rawCalendarDays.map(day => {
			let _index = -1,
				_dayFound = this.calendarDates.filter((_d, index) => {
				if(_d.Date == day.Date) {
					_index = index;
					return _d;
				}
				});

			if(_dayFound.length == 0) {
				this.calendarDates.push({
				Date          : day.Date,
				DayNumber     : 0,
				DefinitionId  : day.DefinitionId,
				DetailId      : day.DetailId,
				FromTime1     : day.FromTime,
				FromTime2     : '00:00',
				ToTime1       : day.ToTime,
				ToTime2       : '00:00',
				active        : true
				});
				this.diasabledDates.push(day.Date);
			} else {
				this.calendarDates[_index].FromTime2 = day.FromTime;
				this.calendarDates[_index].ToTime2   = day.ToTime;
			}
			});
		},
		openingsStripForSave() {
			let _rawOpenings     = JSON.parse(JSON.stringify(this.openingHourWeek)),
				_rawCalendarDays = JSON.parse(JSON.stringify(this.calendarDates)),
				_stripedOpenings = [];

			_rawOpenings.map(weekday => {
			if(weekday.active == true) {
				if(weekday.FromTime1 !== '00:00' || weekday.ToTime1 !== '00:00') {
				_stripedOpenings.push({
					Date         : null,
					DayNumber    : weekday.DayNumber,
					DefinitionId : weekday.DefinitionId,
					DetailId     : weekday.DetailId,
					FromTime     : weekday.FromTime1,
					ToTime       : weekday.ToTime1
				});
				}
				if (weekday.FromTime2 !== '00:00' || weekday.ToTime2 !== '00:00') {
				_stripedOpenings.push({
					Date         : null,
					DayNumber    : weekday.DayNumber,
					DefinitionId : weekday.DefinitionId,
					DetailId     : weekday.DetailId,
					FromTime     : weekday.FromTime2,
					ToTime       : weekday.ToTime2
				});
				}
			}
			});

			_rawCalendarDays.map(caledaritem => {
			_stripedOpenings.push({
				Date             : caledaritem.Date,
				DayNumber        : 0,
				DefinitionId     : caledaritem.DefinitionId,
				DetailId         : caledaritem.DetailId,
				FromTime         : caledaritem.FromTime1,
				ToTime           : caledaritem.ToTime1
			});
			if (caledaritem.FromTime2 !== '00:00' || caledaritem.ToTime2 !== '00:00') {
				_stripedOpenings.push({
				Date           : caledaritem.Date,
				DayNumber      : 0,
				DefinitionId   : caledaritem.DefinitionId,
				DetailId       : caledaritem.DetailId,
				FromTime       : caledaritem.FromTime2,
				ToTime         : caledaritem.ToTime2
				});
			}
			});

			return _stripedOpenings;
		},
		newOpeningHoursTitleInput(e, status) {
			let _targetWrapper = e.currentTarget.parentElement,
				_input         = _targetWrapper.querySelector('input');
			if(status) {
			_targetWrapper.classList.add('form-input-button--active');
			_input.value = '';
			_input.focus();
			} else {
			_targetWrapper.classList.remove('form-input-button--active');
			_input.value = '';
			_input.blur();
			}
		},
		clearOpeningTable() {
			this.openingHourWeek        = [];
			this.openingHourWeek.length = 0;
			this.openingHoursTitle      = '';
			Mask.clearAllTimeMask();
			for(let i = 0; i < 7; i++) {
			this.openingHourWeek.push(
				JSON.parse(JSON.stringify(this.openingHourDay))
			);
			this.openingHourWeek[i].DayNumber, this.getShiftedIndex(i);
			}

			let _tableRows = document.querySelectorAll('#tableopenings tr:not(:first-child)');
			_tableRows.forEach(tr => {
				let __timeSlots = tr.querySelectorAll("[id^='slot_']");
				__timeSlots.forEach((i:HTMLInputElement) => {
					i.readOnly    = false;
					i.style.color = '';
				});
				tr.querySelector<HTMLInputElement>("input[type='checkbox']").checked = false;

				let __secondSlot = tr.querySelectorAll('.form-timeslot')[1];
				__secondSlot.classList.add('form-timeslot--disabled');
				__secondSlot.setAttribute('data-status', 'disabled');
				__secondSlot.parentElement.querySelector('a').classList.add('status--hidden');
			});

			this.calendarDates   = [];
			this.newCalenderDate = '';
			this.resetAddCalendar();
		},
		updateProfileName(e) {
			let _target = e.target,
				_name   = _target.value;

			if(this.openingProfileNameFromSave != _name) {
			this.serviceNumberScript.OpeningHours.Id    = -1;
			this.serviceNumberScript.OpeningHours.Title = this.openingHoursTitle = this.openingProfileNameFromSave = _name;
			_target.style.color                         = '';
			} else {
			this.serviceNumberScript.OpeningHours.Id    = this.openingProfileIdFromSave;
			this.serviceNumberScript.OpeningHours.Title = this.openingProfileNameFromSave;
			_target.style.color                         = '#C00';
			}
		},
		setDayStatus(e) {
			let _chk       = e.target,
				_dayline   = _chk.parentElement.parentElement.parentElement,
				_inputs    = _dayline.querySelectorAll("[id^='slot_']"),
				_dayNr     = _chk.getAttribute('data-daynr'),
				_modelItem = this.openingHourWeek.filter(item => item.DayNumber == _dayNr);

			if(this.openingHoursEditable) {
			_modelItem[0].FromTime1 = '00:00';
			_modelItem[0].FromTime2 = '00:00';
			_modelItem[0].ToTime1   = '00:00';
			_modelItem[0].ToTime2   = '00:00';

			if(_chk.checked) {
				_inputs.forEach(input => {
				input.readOnly = false;
				_modelItem[0].ToTime1 = '23:59';
				Mask.clearTimeMask(input.id);
				});
			} else {
				_inputs.forEach(input => (input.readOnly = true));
				let _secondSlot = _dayline.querySelectorAll('.form-timeslot')[1];
				_secondSlot.querySelectorAll('input').forEach(el => (el.value = '00:00'));
				_secondSlot.classList.add('form-timeslot--disabled');
				_secondSlot.setAttribute('data-status', 'disabled');
				_secondSlot.parentElement.querySelector('a').classList.add('status--hidden');
			}
			} else {
			_chk.checked = false;
			}
		},
		toggleSecondTimeSlot(e, status) {
			let _target = e.currentTarget,
				_dnr    = _target.getAttribute('data-daynr');

			if(!_target.classList.contains('form-timeslot--disabled-full')) {
			if(status) {
				_target.value = '';
				_target.classList.remove('form-timeslot--disabled');
				_target.setAttribute('data-status', 'active');
				_target.parentElement.querySelector('a').classList.remove('status--hidden');
			} else {
				let _slot = _target.parentElement.querySelector('.form-timeslot');
				this.disableSlot(_slot);
				_target.classList.add('status--hidden');
			}
			}
		},
		blockTimeSlots(e) {
			let _target = e.target,
				_s1     = document.getElementById('firstaddtimeslot'),
				_s2     = document.getElementById('secondaddtimeslot');

			if(_target.checked) {
			this.disableSlot(_s1);
			this.disableSlot(_s2);
			_s1.classList.add('form-timeslot--disabled-full');
			_s2.classList.add('form-timeslot--disabled-full');
			} else {
			this.enableSlot(_s1);
			_s1.classList.remove('form-timeslot--disabled-full');
			_s2.classList.remove('form-timeslot--disabled-full');
			}
			document.querySelector('#secondaddtimeslot').parentElement.querySelector('a').classList.add('status--hidden');
			this.isCalendarItemValid();
		},
		addCalendarItem(e) {
			let _calendarRow = {};
			if (this.calendarItemValid) {
			_calendarRow = {
				Date           : this.newCalenderDate,
				DayNumber      : 0,
				DefinitionId   : -1,
				DetailId       : -1,
				FromTime1      : document.getElementById('slot_add_1_start').value,
				ToTime1        : document.getElementById('slot_add_1_stop').value,
				FromTime2      : document.getElementById('slot_add_2_start').value,
				ToTime2        : document.getElementById('slot_add_2_stop').value,
				active         : true
			};
			this.calendarDates.push(_calendarRow);
			this.diasabledDates.push(this.newCalenderDate);
			this.resetAddCalendar();
			}
		},
		isCalendarItemValid() {
			this.$nextTick(() => {
			this.calendarItemValid = this.newCalenderDate != '' && (document.getElementById('alldayclosed').checked || document.getElementById('slot_add_1_start').value != '00:00' || document.getElementById('slot_add_1_stop').value != '00:00');
			});
		},
		resetAddCalendar() {
			this.newCalenderDate                               = '';
			this.calendarItemValid                             = false;
			document.getElementById('alldayclosed').checked    = false;
			document.getElementById('slot_add_1_start').value  = '00:00';
			document.getElementById('slot_add_1_stop').value   = '00:00';
			document.getElementById('slot_add_2_start').value  = '00:00';
			document.getElementById('slot_add_2_stop').value   = '00:00';
			document.getElementById('firstaddtimeslot').classList.remove('form-timeslot--disabled');
			document.getElementById('secondaddtimeslot').classList.add('form-timeslot--disabled');
		},
		deleteDalenderItem(e) {
			let _target = e.target,
				_index  = _target.getAttribute('data-index');
			this.calendarDates.splice(_index, 1);
			this.diasabledDates.splice(_index, 1);
		},
		niceTimeSlot(start, stop, slotnr, nrslots) {
			let _slot = '<b>' + this.$store.state.settings.portal.forms.closedlabel + '</b>';
			if ((slotnr == 1 && nrslots == 1) || (slotnr == 1 && nrslots == 2)) {
			if (start != '00:00' || stop != '00:00') _slot = start + ' - ' + stop;
			}
			if (slotnr == 2) {
			if (start != '00:00' || stop != '00:00') _slot = start + ' - ' + stop;
			else _slot = '';
			}
			return _slot;
		},
		getNrOfSlots(date) {
			let _nr = 1;
			if (date.FromTime2 != '00:00' && date.ToTime2 != '00:00') _nr = 2;
			return _nr;
		},
		validateData(ready) {
			//EMPTY ERRORMESSAGES AND ERRORTABS
			let validObj;
			this.errormessages = [];
			this.errortabs     = [-1, -1, -1, -1];

			//CHECK VALID FORM ITEMS
			validObj = this.validateObj.map(obj => {
			let _propsval,
				_props = obj.propertyname.split('.');

			switch(_props.length) {
				case 1:
				_propsval = this.serviceNumberScript[_props[0]];
				break;
				case 2:
				_propsval = this.serviceNumberScript[_props[0]][_props[1]];
				break;
				default:
				_propsval = this.serviceNumberScript[_props[0]];
			}

			//VALIDATE AND SET ERRORMESSAGES AND ERRORTABS
			//Als er geen bestemming is gekozen, dan is de combinatie van de voicemail melding + email-adres verplicht
			if(_props[0] == 'CallGroup1') {
				if(!this.serviceNumberScript.UseVoicemail || this.serviceNumberScript.VoicemailPrompt == '') {
				if(!validateValue(_propsval, obj.validationvalue)) {
					this.setError(obj.errormessage, obj.errortab);
				}
				}
			} else if(_props[0] == 'OpeningHours' && this.selectedProfileId == -2) {
				if (!validateValue(_propsval, obj.validationvalue)) {
				this.setError(obj.errormessage, obj.errortab);
				}
			} else if(_props[0] == 'ClosePrompt' && (this.selectedProfileId > 0 && this.serviceNumberScript.ClosedPrompt === '')) {
				if (!validateValue(this.serviceNumberScript.ClosedPrompt, obj.validationvalue)) {
				this.setError(obj.errormessage, obj.errortab);
				}
			} else if(_props[0] == 'ClosePrompt' && (this.selectedProfileId == -2 && this.serviceNumberScript.ClosedPrompt === '')) {
				if (!validateValue(this.serviceNumberScript.ClosedPrompt, obj.validationvalue)) {
				this.setError(obj.errormessage, obj.errortab);
				}
			} else if(_props[0] == 'VoicemailEmailAddress' && this.serviceNumberScript.UseVoicemail) {
				if(!validateValue(_propsval, obj.validationvalue)) {
				this.setError(obj.errormessage, obj.errortab);
				}
			} else if(_props[0] != 'CallGroup1' && _props[0] != 'OpeningHours' && _props[0] != 'VoicemailEmailAddress') {
				if(!validateValue(_propsval, obj.validationvalue)) {
				this.setError(obj.errormessage, obj.errortab);
				}
			}
			});
			//SET ACTIVE TAB TO FIRST ERROR
			if (this.errormessages.length != 0)
			this.activeTab = this.errortabs.indexOf(true);

			//CALLBACK
			if (typeof ready === 'function') {
			ready();
			}
		},
		setError(errormessage, errortab) {
			if (this.errormessages.indexOf(errormessage) == -1) {
			this.errormessages.push(errormessage);
			}
			if (this.errortabs.indexOf(errortab) == -1) {
			this.errortabs.splice(errortab, 1, true);
			}
		},
		savePlan() {
			this.showLoader(true);
			//SET OPENINGHOURS
			this.serviceNumberScript.OpeningHours.Details    = [];
			this.serviceNumberScript.OpeningHours.Details    = this.openingsStripForSave();
			this.serviceNumberScript.OpeningHours.Id         = this.openingProfileIdFromSave;
			this.serviceNumberScript.OpeningHours.Title      = this.openingProfileNameFromSave;
			this.serviceNumberScript.OpeningHours.CustomerId = this.selectedCustomerId;

			//VALIDATE FORM ITEMS
			this.validateData(() => {
			if (this.errormessages.length == 0) {
				//SAVE SCRIPT
				IPCCCConfigurator.Request(this.selectedCustomerId, 'portalscript', 'save', this.serviceNumberScript, this.selectedNumberId)
				.then(result => {
				//UPDATE LIST
				let _index = -1,
					_id    = -1;
				this.rawListData.map((serviceNumber, index) => {
					if(serviceNumber.Number == this.serviceNumberScript.Servicenumber) { //werd vergeleken met result.Servicenumber
					this.selectedNumberTitle = this.serviceNumberScript.ServiceNumberTitle = result.ServiceNumberTitle;
					_id                      = result.ServicenumberId;
					_index                   = index;
					}
				});
				this.updateList(_index, _id);
				this.clearOpeningTable();
				this.getOpeningHoursList(this.selectedCustomerId);
				this.showLoader(false);
				})
				.catch(error => {
				this.showLoader(false);
				console.error('Error: ' + error);
				});
			} else {
				this.showLoader(false);
			}
			});
		},
		disableSlot(slot) {
			slot.querySelectorAll('input').forEach(el => {
			el.value       = '00:00';
			el.style.color = '';
			});
			slot.classList.add('form-timeslot--disabled');
			slot.setAttribute('data-status', 'disabled');
		},
		enableSlot(slot) {
			slot.querySelectorAll('input').forEach(el => (el.value = '00:00'));
			slot.classList.remove('form-timeslot--disabled');
			slot.setAttribute('data-status', 'active');
		},
		updateList(index, id) {
			this.rawListData[index].Title, this.selectedNumberTitle;
			this.rawListData[index].Id, id;
			this.listData = JSON.parse(JSON.stringify(this.rawListData));
			this.filterList();
			this.dialogClose();
		},
		//================================ VOICEMAIL ================================//
		toggleEmailStatus(e) {
			let _chk         = e.target,
				_inputParent = _chk.parentElement.parentElement.parentElement,
				_input       = _inputParent.querySelector("[id='voicemailEmail']");

			if (_chk.checked) {
			_input.readOnly = false;
			} else {
			_input.readOnly = true;
			}
		},
		//================================ PROMPTS ================================//
		playPrompt(evt, promptTitle, isPrompt) {
			let _targetBtn = evt.target,
				_prompt    = this.getPromptByTitle(promptTitle);

			const _playPrompt = id => {
				//LANGUAGECODE IS VOOR NU ALLEEN NEDERLANDS
				IPCCCConfigurator.Request(this.customerId, 'prompts', 'playprompt', LanguageCode.Nederlands, _prompt.Id)
				.then(soundUrl => {
					this.promptPlayer.addEventListener('loadeddata', _ => {
						this.setAudioPlayerStatus(_targetBtn, 'playing', isPrompt);
						this.promptPlayer.play();
						this.currentPromptTitle = promptTitle;
					});
					this.promptPlayer.addEventListener('error', evt => {
						this.setAudioPlayerStatus(_targetBtn, 'stopped', isPrompt);
						console.log('Error: ', evt);
					});
					this.promptPlayer.addEventListener('ended', _ => {
						this.setAudioPlayerStatus(_targetBtn, 'stopped', isPrompt);
					});
					this.promptPlayer.src = soundUrl;
				}, error => {
					this.setAudioPlayerStatus(_targetBtn, 'stopped', isPrompt);
					console.log('Error: ', error);
				});
			};
			if (_prompt && _prompt.Languages.length > 0) {
				if (!this.audioIsPlaying) {
					this.setAudioPlayerStatus(_targetBtn, 'loading', isPrompt);
					_playPrompt(_prompt.Id);
				} else {
					this.promptPlayer.pause();
					this.setAudioPlayerStatus(_targetBtn, 'stopped', isPrompt);
					if (promptTitle != this.currentPromptTitle) _playPrompt(_prompt.Id);
				}
			}
		},
		checkStandardPrompt(selectedPrompt, refName) {
			let _target         = document.getElementById(refName),
				_selectedPrompt = this.getPromptByTitle(this.serviceNumberScript[selectedPrompt]),
				_isEditable     = true;

			if(_selectedPrompt) {
			if(_selectedPrompt.IsDefault || this.serviceNumberScript[selectedPrompt] == '') {
				_isEditable = true;
			} else {
				_isEditable = false;
			}
			} else {
			_isEditable = true;
			}
			return _isEditable;
		},
		setAudioPlayerStatus(target, status, isPrompt) {
			let _target, _editBtn, _prompt;

			if(target.type === 'change') {
				_target   = target.target.parentElement.parentElement.querySelector('.button__icon-play--small > SPAN');
				_editBtn  = target.target.parentElement.parentElement.querySelector('.button__icon-edit--small');
				_prompt   = this.getPromptByTitle(target.target.value);

				if(_prompt) {
					if(_prompt.IsDefault || this.serviceNumberScript[isPrompt] == '') {
					_editBtn.classList.add('button__icon--disabled');
					} else {
					_editBtn.classList.remove('button__icon--disabled');
					}
				} else {
					_editBtn.classList.add('button__icon--disabled');
				}
				this.promptPlayer.pause();
			} else {
				_target = target;
			}

			switch(status) {
				case 'stopped':
					_target.innerHTML   = this.playerIcon.play;
					_target.classList.remove('status--loading');
					this.audioIsPlaying = false;
					break;
				case 'loading':
					_target.innerHTML   = this.playerIcon.load;
					_target.classList.add('status--loading');
					this.audioIsPlaying = true;
					break;
				case 'playing':
					_target.innerHTML   = this.playerIcon.stop;
					_target.classList.remove('status--loading');
					this.audioIsPlaying = true;
					break;
			}
		},
		stopAndResetAudio() {
			this.promptPlayer.pause();
			this.audioIsPlaying = false;
			document.querySelectorAll('.button__icon-play--small > SPAN').forEach(btn => (btn.innerHTML = this.playerIcon.play));
		},
		getPromptByTitle(title) {
			let _filtered = this.portalPrompt.filter(p => p.Title == title);
			return _filtered.length > 0 ? _filtered[0] : false;
		},
		//================================ EDIT ROMPTS ================================//
		editPrompt(action, type, promptTitle) {
			let _promptToEdit = JSON.parse(JSON.stringify(this.getPromptByTitle(promptTitle)));
			
			this.promptNames  = [];
			this.removeNonPlayablePrompts.map(p => this.promptNames.push(p.Title));

			this.$store.commit('SET_APP_PROMPT_DATA', {}); //DEEP COPY HACK
			this.$store.commit('SET_APP_PROMPT_DATA', {
				action      : action,
				type        : type,
				prompt      : _promptToEdit,
				promptNames : this.promptNames
			});
			this.$store.commit('SET_PROMPTDIALOG', true);
		},
		//================================ UPLAOD ROMPTS ================================//
		addPrompt(action, type) {
			this.promptNames = [];
			this.removeNonPlayablePrompts.map(p => this.promptNames.push(p.Title));

			this.$store.commit('SET_APP_PROMPT_DATA', {}); //DEEP COPY HACK
			this.$store.commit('SET_APP_PROMPT_DATA', {
				action      : 'new',
				type        : type,
				prompt: {
					Id           : -1,
					Title        : '',
					Description  : '',
					IsDefault    : false,
					Url          : '',
					Languages    : [1]
				},
				promptNames  : this.promptNames
			});
			this.$store.commit('SET_PROMPTDIALOG', true);
		},
		destroyDatePicker() {
			if(this.datePicker) {
			this.datePicker.destroy();
			}
		},
    },
    mounted() {
		this.countString             = this.$store.state.settings.portal.customerscount;
		this.customerId              = this.$store.state.loginSession.Details.CustomerId;
		this.currentPlanPartLabels   = this.$store.state.settings.portal.callPlanPartLabels;
		this.helpText                = this.$store.state.settings.portal.helptexttabs;
		this.sessionId               = this.$store.state.loginSession.SessionId;
		this.startsearchtext         = this.$store.state.settings.portal.startsearchtext;
		this.notfoundsearchtext      = this.$store.state.settings.portal.notfoundsearchtext;
		this.tariffPer               = this.$store.state.settings.portal.tarifflabel;
		this.setupTariff             = this.$store.state.settings.portal.setuptariff;

		this.clearOpeningTable();
		this.promptPlayer  = new Audio();
		this.countString   = this.$store.state.settings.portal.itemcount;
		this.companyName   = this.$store.getters.getCustomerInfo().selectedCustomerName;
		
		this.checkReseller(isR => this.isReseller = isR);
	
		this.selectedCustomerId = this.$store.getters.getCustomerInfo().selectedCustomerId;
		
		if(this.selectedCustomerId !== -1) {
			this.showLoader(true);
			this.getdata(this.selectedCustomerId, 'portalservicenumber', 'readall');
		}

		this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
			if(this.selectedCustomerId !== -1) {
				this.showLoader(true);
				this.companyName        = cObj.selectedCustomerName;
				this.checkReseller(isR => this.isReseller = isR);
				this.selectedCustomerId = cObj.selectedCustomerId;
				this.getdata(cObj.selectedCustomerId, 'portalservicenumber', 'readall');
			} else {
				this.showLoader(true);
				this.companyName        = cObj.selectedCustomerName;
				this.selectedCustomerId = cObj.selectedCustomerId;
				this.getdata(cObj.selectedCustomerId, 'portalservicenumber', 'readall');
			}
		});

		document.getElementById('search').focus();

		this.$store.watch(this.$store.getters.updateNumberList, status => {
			if (status) {
			IPCCCConfigurator.Request(this.$store.getters.getCustomerInfo().selectedCustomerId, 'portalservicenumber', 'readall', null, -1)
			.then(result => {
				this.listData   = this.rawListData = result;
				this.totalItems = this.listData.length;
				this.$store.commit('SET_UPDATE_NUMBER_LIST', false);
				this.$store.commit('SET_NUMBERDIALOG', false);
			});
			}
		});

		this.promptWatch = this.$store.watch(this.$store.getters.promptDialogStatus, status => {
			let _promptData = this.$store.getters.promptData();

			if(!status && typeof _promptData.action !== 'undefined') {

				if(_promptData.action == 'edit') {
					this.removeNonPlayablePrompts.map(p => {
					if(p.Id == _promptData.prompt.Id)
						p.Title = _promptData.prompt.Title;
					});
				}

				if(_promptData.action == 'new') {
					this.portalPrompt.push(_promptData.prompt);
				}

				this.serviceNumberScript[_promptData.type] = _promptData.prompt.Title;

				this.serviceNumberScript[_promptData.type] == _promptData.prompt.Title; // ??
				
				//SAVE ONLY IF SCRIPT IS ALREADY SAVED
				if(this.serviceNumberScript.ServicenumberId != -1) {
					IPCCCConfigurator.Request(this.$store.getters.getCustomerInfo().selectedCustomerId, 'portalscript', 'save', this.serviceNumberScript, this.selectedNumberId)
					.then(result => {
					//UPDATE LIST
					let _index = -1,
						_id    = -1;
					this.rawListData.map((serviceNumber, index) => {
						if(serviceNumber.Number == result.Servicenumber) {
						this.selectedNumberTitle = this.serviceNumberScript.ServiceNumberTitle = result.ServiceNumberTitle;
						_id                      = result.ServicenumberId;
						_index                   = index;
						}
					});
					this.showLoader(false);
					})
					.catch(error => {
					this.showLoader(false);
					console.error(error);
					});
				} else {
					this.showLoader(false);
				}
			}
		});

		const externalCall = (nrObj) => {
			document.getElementById('js-help-btn').classList.remove('dialog__window-help--active');
			document.querySelectorAll('.js__help').forEach(el => el.classList.remove('balloon-dialog--help-visible'));

			this.selectedNumberId    = nrObj.selectedNumberId;
			this.selectedNumber      = nrObj.selectedNumber;
			this.selectedNumberTitle = nrObj.selectedNumberTitle;
			this.dialogHeader        = '';
			this.dialogIsAlert       = false;
			this.dialogIsConfirm     = false;
			this.currentAction       = 'edit-new';
			this.activeTab           = 0;
			this.dialogOkText        = this.$store.state.settings.portal.dialogNextText;
			this.dialogPrevText      = this.$store.state.settings.portal.dialogPrevText;
			this.dialogCancelText    = this.$store.state.settings.portal.dialogCancelText;
			
			this.getScriptData()
			.then(() => {
			//FILL TITLE FROM
			this.serviceNumberScript.ServiceNumberTitle = this.selectedNumberTitle;
			//SHOW DIALOG
			this.getCallPlanPart(this.activeTab)
			.then(() => {
				this.showDialog = true;
				//RESET
				this.$store.commit('SET_SERVICENR_OBJ', {});
				this.showLoader(false);
			})
			.catch(_ => {
				this.showLoader(false);
			});
			})
			.catch(error => {
			console.log('Error' + error );
			this.showLoader(false);
			});
		};

		let _nrObj = this.$store.getters.getServiceNumberObj();
		
		const externalOHLTest = () => {
			if(this.openingHLChecked) {
			this.openingHLChecked = false;
			externalCall(_nrObj);
			} else {
			setTimeout(_ => {
				externalOHLTest();
			}, 200);
			}
		};

		if(Object.entries(_nrObj).length !== 0 && _nrObj.constructor === Object) {
			externalOHLTest();
		}

		this.setDatePicker();
    },
    beforeUnmount() {
		this.storeWatch();
		this.promptWatch();
		this.stopAndResetAudio();
		this.destroyDatePicker();
		this.$store.commit('SET_NUMBERDIALOG', false);
		this.$store.commit('SET_PROMPTDIALOG', false);
		let _dropA = document.querySelector('.dropbox__drop-area');
		if (_dropA) _dropA.parentNode.removeChild(_dropA);
    }
})
</script>

<template>
	<div data-e2e="service-numbers">
		<!-- CONFIRM DIALOG ------------------------------------------------------------------------------------------>
		<div :class="['dialog__modal', {'dialog__modal--open' : showConfirm}]">
			<div :class="['dialog__window', 'dialog__window--w500', {'dialog__window--open' : showConfirm}]" id="dialog-window">
				<div class="dialog__window-header dialog__window-header--important dialog__window-header--transparent">
					<span>{{ $store.state.settings.portal.reclaimnumberheader }}</span>
				</div>
				<div class="dialog__window-body">
					<div class="grid-row">
						<p v-if="!confirmError" v-html="$store.state.settings.portal.reclaimnumbertext + '<strong>' +  selectedNumber + '</strong>'"></p>
						<p v-else>{{ confirmText }}</p>
					</div>  
				</div>
				<div class="grid-unit--alpha dialog__window-footer dialog__window-footer--confirm">
					<a v-if="!confirmError" class="button-primary, button-primary--important, dialog__window-ok" @click="deleteNumber">{{ $store.state.settings.portal.reclaimnumberlabel }}</a>
					<a v-else class="button-primary, button-primary--important, dialog__window-ok" @click="hideConfirm">OK</a>
					<a class="button-primary dialog__window-cancel" @click="hideConfirm">{{ $store.state.settings.portal.cancellabel }}</a> 
				</div>
			</div>
		</div>
		<!-- LIST ------------------------------------------------------------------------------------------>
		<div class="list-wrapper list-wrapper--has-header">
			<div class="list-topbar">
				<div class="list-topbar__header">
					<span class="typo-tilestitle">{{ companyName }}</span>
				</div>
				<div class="list-topbar__content">
					<div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
						<input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.portal.searchlabel" @keyup="filterList()">
					</div>
					<div class="typo-tabletitle">{{ totalItems + " " + countString }}</div>
					<!-- <div v-if="hasAddNumberRights" class="grid--push">
						<div class="form-button__secondary form-button__secondary--add grid--push">
						<button @click="openNewServicenumberListDialog()">{{ $store.state.settings.portal.addnumberlabel }}</button>
						</div>
					</div> -->
				</div>
			</div>
		<!-- SURVICENUMBER LIST ------------------------------------------------------------------------------------------>
		<div class="list-content-wrapper list-content-wrapper--tiles">
			<div class="list-content--is-empthy" v-if="listData.length == 0">{{ $store.state.settings.portal.nonumbersfound }}</div>
				<VirtualListViewer class="list-content list-content--transparent"
					:data      = "listData"
					rowClasses = ""
					>
					<template v-slot="{ row }">
						<div :class="['tiles-item', {'tiles-item--flipper' : isReseller}]" :data-id="row.Id" :data-nr="row.Number" :data-title="row.Title">
							<div class="tiles-item__inner">
								<div class="tiles-item__front">
									<a href="javascript:;" class="tiles-item__link" :class="fillIfServiceNr(row.Title)" @click="dialogOpen($event, 'edit-new', 'window', '')">
										<span class="tiles-item__link-nr">{{ row.Number }}</span>
										<span class="tiles-item__link-lbl">{{ fillIfEmpty(row.Title) }}</span>
										<span :class="['tiles-item__link-price', {'tiles-item__link-price--hidden' : row.NoTariff }]">&euro;&nbsp;{{ toEuro(row.TariffInCents) }}&nbsp;{{ perLabel(row.TariffIsPerCall, $store.state.settings.portal.tarifflabel) }}&nbsp;{{ placeSetup(row.TariffSetup, $store.state.settings.portal.setuptariff) }}</span>
									</a>
								</div>
								<div class="tiles-item__back">
									<span class="tiles-item__link-nr">{{ row.Number }}</span>
									<div class="tiles-item__button-block">
										<button class="tiles-item__button tiles-item__button--edit"   @click="dialogOpen($event, 'edit-new', 'window', '')">{{ $store.state.settings.portal.editlabel }}</button>
										<button class="tiles-item__button tiles-item__button--delete" @click="confirmDeleteNumber($event)">{{ $store.state.settings.portal.deletelabel }}</button>
									</div>
								</div>
							</div>
						</div>
					</template>
				</VirtualListViewer>
			</div>
		</div>
		<!-- START DIALOG ------------------------------------------------------------------------------------------>
		<div :class="['dialog__modal', 'dialog__model--fixed-window-large', {'dialog__modal--open' : showDialog}]">
			<div :class="['dialog__window', {'dialog__window--open' : showDialog}, {'dialog__window-alert' : dialogIsAlert}]">
				<div class="dialog__window-header">
					<span class="dialog__window-title">{{ dialogHeaderText }}</span>
					<a v-show="helpText[activeTab] != ''" class="dialog__window-help" id="js-help-btn" @click="toggleHelp($event)">&#xF2D7;</a>
					<a class="dialog__window-close" @click="dialogClose">
						<span></span>
						<span></span>
					</a>
				</div>
				<div class="dialog__window-body">
					<div class="tabs-wrapper">
						<div class="tabs-header">
							<a v-for="(tab, index) in currentPlanPartLabels" :key="index" href="javascript:;" class="tabs-header__tab" :class="{'tabs-header__tab--active' : activeTab == index}" :data-tabindex="index" :data-taberror="errortabs[index]" @click="switchTab($event)">{{ tab }}</a>
						</div>
						<div class="grid-row">
						<div class="tabs-content-wrapper">
							<div class="grid-unit--alpha">
								<div class="tabs-validation">
									<p class="tabs-validation-content" v-for="(n, index) in errormessages" :key="index">{{ n }}</p>
								</div>
							</div>
						</div>
						<!-- TITLE ------------------------------------------------------------------------------------------>
						<div class="tabs-content" :class="{'tabs-content--active' : activeTab == 0}">
							<div v-if="helpText[0] != ''" class="balloon-dialog--help status--minimized js__help">
								<span class="typo__note--pale" v-html="helpText[0]"></span>
							</div>
							<div class="grid-row">
								<div class="grid-unit--beta grid-unit--beta-less-v-padding">
									<div class="form-textfield form-textfield--bground">
									<input type="text" id="ServiceNumberTitle" v-model="serviceNumberScript.ServiceNumberTitle">
									<label for="ServiceNumberTitle" class="form-label form-label--hidden">{{ $store.state.settings.portal.serviceNumberTitleLabel }}</label>
									</div>
								</div>
								<div class="grid-unit--beta grid-unit--beta-less-v-padding">
									<div class="form-selectfield form-selectfield--no-margin form-selectfield--margin-bottom form-selectfield--has-buttonbar-three">
										<label for="promptWelcome" class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.portal.promptslabel[0] }}</label>
										<select id="promptWelcome" name="promptWelcome" v-model="serviceNumberScript.WelcomePrompt" @change="setAudioPlayerStatus($event, 'stopped', 'WelcomePrompt')">
											<option value="" selected>{{ $store.state.settings.portal.defaultselectprompts[0] }}</option>
											<option v-for="prompt in removeNonPlayablePrompts" :key="prompt.Id" :value="prompt.Title" :class="{'hightlight' : prompt.IsDefault}">{{ prompt.Title }}<span v-if="prompt.IsDefault">*</span></option>
										</select>
									</div>
									<div class="form__audio-bar form__audio-bar--three">
										<a class="button__icon button__icon-play--small" :class="{'button__icon--disabled' : serviceNumberScript.WelcomePrompt == ''}" @click="playPrompt($event, serviceNumberScript.WelcomePrompt, 'WelcomePrompt')"><span v-html="playerIcon.play"></span></a>
										<a class="button__icon button__icon-edit--small" :class="{'button__icon--disabled' : checkStandardPrompt('WelcomePrompt', 'wPrompt')}" id="wPrompt" @click="editPrompt('edit', 'WelcomePrompt', serviceNumberScript.WelcomePrompt)">&#xF3EB;</a>
										<a class="button__icon button__icon-upload--small" @click="addPrompt('new', 'WelcomePrompt')">&#xF419;</a>
									</div>
								</div>
							</div>
						</div>
						<!-- OPENING HOURS ------------------------------------------------------------------------------------------>
						<div class="tabs-content" :class="{'tabs-content--active' : activeTab == 1}">
							<div v-if="helpText[1] != ''" class="balloon-dialog--help status--minimized js__help">
								<span class="typo__note--pale" v-html="helpText[1]"></span>
							</div>
							<div class="grid-row">
								<!-- COL 1 -->
								<div class="grid-unit--beta grid-unit--beta-less-v-padding separator-v__right">
									<div class="grid-inner-row">
										<div class="grid-inner-gamma--double fixed-dim--300-40">
											<div :class="['form-selectfield', 'form-selectfield--no-margin', {'form-selectfield--first-check' : selectedProfileId == -1}]">
												<select @change="loadProfile($event)" v-model="selectedProfileId">
													<option value="-1" selected>{{ $store.state.settings.portal.defaultselectopeninghours }}</option>
													<option v-for="profile in openingProfiles" :key="profile.Id" :value="profile.Id">{{ profile.Title }}</option>
												</select>
											</div>
										</div>    
										<div class="grid-inner-gamma fixed-dim--40-40 grid-inner--push">
											<a href="javascript:;" class="button__add--secondary spacer__top--10 spacer__left--10" @click="setNewProfile()">
												<span class="button__add--secondary-icon">&#xF419;</span>
												<span class="button__add--secondary-label">{{ $store.state.settings.portal.addnewprofilelabel }}</span>
											</a>
										</div>
									</div>
									<div class="grid-row">
										<table class="tables-openings" :class="{'tables-openings--disabled' : !openingHoursEditable}" id="tableopenings">
											<tr>
											<th>{{ $store.state.settings.portal.openinghourheader[0] }}</th>
											<th>{{ $store.state.settings.portal.openinghourheader[1] }}</th>
											<th>{{ $store.state.settings.portal.openinghourheader[2] }}</th>
											</tr>
											<tr v-for="(day, index) in openingHourWeek" :key="index">
											<td :class="{'tables-openings__cell--disabled' : !day.active}">
												<div class="form-checkbox form-checkbox--inline-smaller">
												<input type="checkbox" :name="['day_' + index]" :id="['day_' + index]" @change="setDayStatus($event)" :data-daynr="getShiftedIndex(index)" v-model="day.active" :disabled="!openingHoursEditable">
												<label :for="['day_' + index]" :data-label="$store.state.settings.portal.daysoftheweek[index]"></label>
												</div>
											</td>
											<td :class="{'tables-openings__cell--disabled' : !day.active}">  
												<div class="form-timeslot">
												<input :id="['slot_' + index + '_1_start']" :readonly="!day.active" :data-daynr="getShiftedIndex(index)" placeholder="00:00" v-model="day.FromTime1" @keydown="checkTime($event, 'FromTime1')" :tabindex="[1 + (index * 4)]" @focus="nextField(1 + (index * 4))">
												<span>&minus;</span>
												<input :id="['slot_' + index + '_1_stop']" :readonly="!day.active" :data-daynr="getShiftedIndex(index)" placeholder="00:00" v-model="day.ToTime1" @keydown="checkTime($event, 'ToTime1')" :tabindex="[2 + (index * 4)]" @focus="nextField(2 + (index * 4))">
												</div>
											</td>
											<td :class="{'tables-openings__cell--disabled' : !day.active}">  
												<div class="form-timeslot form-timeslot--disabled" @click="toggleSecondTimeSlot($event, true)" data-status="disabled">
												<input :id="['slot_' + index + '_2_start']" :readonly="!day.active" :data-daynr="getShiftedIndex(index)" placeholder="00:00" v-model="day.FromTime2" @keydown="checkTime($event, 'FromTime2')" :tabindex="[3 + (index * 4)]" @focus="nextField(3 + (index * 4))">
												<span>&minus;</span>
												<input :id="['slot_' + index + '_2_stop']" :readonly="!day.active" :data-daynr="getShiftedIndex(index)" placeholder="00:00" v-model="day.ToTime2" @keydown="checkTime($event, 'ToTime2')" :tabindex="[4 + (index * 4)]" @focus="nextField(4 + (index * 4))">
												</div>
												<a href="javascript:;" @click="toggleSecondTimeSlot($event, false)" class="button__close status--hidden" :data-daynr="getShiftedIndex(index)">&#xF5AD;</a>
											</td>  
											</tr>
										</table>  
									</div>  
									<div class="grid-row">
										<div class="form-input-button" id="profilename" :class="{'form-input-button--disabled' : !openingHoursEditable}">
											<input type="text" v-model="openingHoursTitle" :placeholder="$store.state.settings.portal.newprofilenameplaceholder" @change="updateProfileName($event)" ref="profilename">
											<a href="javascript:;" v-if="selectedProfileId != -2" @click="newOpeningHoursTitleInput($event, false)" class="button__close">&#xF5AD;</a>
											<label @click="newOpeningHoursTitleInput($event, true)">{{ $store.state.settings.portal.newprofilenamelabel }}</label>
										</div>
									</div>
								</div>
								<!-- COL 2 -->
								<div class="grid-unit--beta grid-unit--beta-less-v-padding">
									<div class="grid-row">
										<div class="panel-flat--gray5">
											<div class="pannel__lock" :class="{'pannel__lock--active' : !openingHoursEditable}"></div>
											<div class="grid-unit--beta grid-unit--beta-form">
											<div class="form-textfield form-textfield--bground form-textfield--mask-readonly">
												<input type="text" id="datepicker" :placeholder="$store.state.settings.portal.forms.addcalenderdate" v-model="newCalenderDate" @change="isCalendarItemValid" readonly>
												<label for="c-adddata" class="form-label">&nbsp;</label>
											</div>
											</div>
											<div class="grid-unit--beta grid-unit--beta-form">
											<div class="form-checkbox form-checkbox--inline-small position--mtop12">
												<input type="checkbox" name="alldayclosed" id="alldayclosed" @change="blockTimeSlots($event)">
												<label for="alldayclosed" :data-label="$store.state.settings.portal.forms.closedlabel"></label>
											</div>
											</div>
											<div class="grid-unit--alpha grid-unit--alpha-form">
											<div class="grid-inner-row">
												<div class="grid-inner-gamma--double fixed-dim--300-40">
												<table class="tables-openings tables-openings--add" id="tables-openings-add">
													<tr>
													<td>
														<div id="firstaddtimeslot" class="form-timeslot">
														<input id="slot_add_1_start" placeholder="00:00" @keyup="isCalendarItemValid" @keydown="checkTime($event, 'FromTime1')" tabindex="1001" @focus="nextFieldAdd(1001)">
														<span>&minus;</span>
														<input id="slot_add_1_stop" placeholder="00:00" @keyup="isCalendarItemValid" @keydown="checkTime($event, 'ToTime1')" tabindex="1002" @focus="nextFieldAdd(1002)">
														</div>
													</td>
													<td>
														<div id="secondaddtimeslot" class="form-timeslot form-timeslot--disabled" @click="toggleSecondTimeSlot($event, true)" data-status="disabled">
														<input id="slot_add_2_start" placeholder="00:00" @keydown="checkTime($event, 'FromTime2')" tabindex="1003" @focus="nextFieldAdd(1003)">
														<span>&minus;</span>
														<input id="slot_add_2_stop" placeholder="00:00" @keydown="checkTime($event, 'ToTime2')"  tabindex="1004" @focus="nextFieldAdd(1004)">
														</div>
														<a href="javascript:;" @click="toggleSecondTimeSlot($event, false)" class="button__close status--hidden">&#xF5AD;</a>
													</td>
													</tr>
												</table>
												</div>
												<div class="grid-inner-gamma fixed-dim--40-40 grid-inner--push">
												<a href="javascript:;" class="button__add--secondary" :class="{'button__add--dimmed-gray' : !calendarItemValid}" @click="addCalendarItem($event)">
													<span class="button__add--secondary-icon">&#xF419;</span>
													<span class="button__add--secondary-label">{{ $store.state.settings.portal.forms.addlabel }}</span>
												</a>
												</div>
											</div>  
											</div>  
										</div>
									</div>
									<div class="grid-row">
										<table class="tables-openings tables-openings--added tables-openings--added-head"> 
											<tr>
											<th>{{ $store.state.settings.portal.forms.calendarheader[0] }}</th>
											<th>{{ $store.state.settings.portal.forms.calendarheader[1] }}</th>
											<th>{{ $store.state.settings.portal.forms.calendarheader[2] }}</th>
											<th>&nbsp;</th>
											</tr>
										</table>
										<div class="list-items-wrapper list-items-wrapper--calendar">
											<table class="tables-openings tables-openings--added">
											<tr v-for="(date, index) in calendarDates" :key="index">
												<td>{{ niceDate(date.Date) }}</td>
												<td v-html="niceTimeSlot(date.FromTime1, date.ToTime1, 1, getNrOfSlots(date))"></td>
												<td v-html="niceTimeSlot(date.FromTime2, date.ToTime2, 2, getNrOfSlots(date))"></td>
												<td>
												<a class="button__icon button__icon--delete" @click="deleteDalenderItem($event)" :data-index="index">&#xF1C0;</a>
												</td>
											</tr>
											</table>
										</div>
									</div>
									<div class="grid-row">
										<div class="form-selectfield form-selectfield--no-margin form-selectfield--margin-bottom form-selectfield--has-buttonbar-three">
											<label for="prompt2" class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.portal.promptslabel[1] }}</label>
											<select id="prompt2" name="prompt2" v-model="serviceNumberScript.ClosedPrompt" @change="setAudioPlayerStatus($event, 'stopped', 'ClosedPrompt')">
											<option value="" selected>{{ $store.state.settings.portal.defaultselectprompts[1] }}</option>
											<option v-for="prompt in removeNonPlayablePrompts" :key="prompt.Id" :value="prompt.Title" :class="{'hightlight' : prompt.IsDefault}">{{ prompt.Title }}<span v-if="prompt.IsDefault">*</span></option>
											</select>
										</div>
										<div class="form__audio-bar form__audio-bar--three">
											<a class="button__icon button__icon-play--small" :class="{'button__icon--disabled' : serviceNumberScript.ClosedPrompt == ''}" @click="playPrompt($event, serviceNumberScript.ClosedPrompt, 'ClosedPrompt')"><span v-html="playerIcon.play"></span></a>
											<a class="button__icon button__icon-edit--small" :class="{'button__icon--disabled' : checkStandardPrompt('ClosedPrompt', 'cPrompt')}" id="cPrompt" @click="editPrompt('edit', 'ClosedPrompt', serviceNumberScript.ClosedPrompt)">&#xF3EB;</a>
											<a class="button__icon button__icon-upload--small" @click="addPrompt('new', 'ClosedPrompt')">&#xF419;</a>
										</div>
									</div>  
								</div>
							</div>  
						</div>
						<!-- DESTINATION ------------------------------------------------------------------------------------------>
						<div class="tabs-content" :class="{'tabs-content--active' : activeTab == 2}">
							<div v-if="helpText[2] != ''" class="balloon-dialog--help status--minimized js__help">
								<span class="typo__note--pale" v-html="helpText[2]"></span>
							</div>
							<div class="grid-row">
								<div class="grid-unit--alpha">
									<div class="form-button__secondary form-button__secondary--add grid--push">
									<button @click="addDestination(0)">{{ $store.state.settings.portal.adddestinationnumber }}</button>
									</div>
								</div>
								<div class="grid-unit--alpha">
									<!--<ul class="list-number-wrapper" v-sortable:options="{onEnd: reorderNumbers}">-->
									<ul class="list-number-wrapper" id="list-number-wrapper--0">
									<!--<li v-for="(number, index) in destinationNumbers[0]" :key="number.Priority" class="list-number-line list-number-line--dragable">-->
									<li v-for="(number, index) in destinationNumbers[0]" :key="number.Priority" class="list-number-line list-number-line--nohandle">
										<input type="text" :name="['u-address_' + index]" class="list-number-line__field list-number-label" v-model="number.Address" :data-index="index" disabled @keydown="checkPhoneNumber($event, 'Address', 0, index)" placeholder="+31XXXXXXXXX" :tabindex="[1 + (index * 2)]" @focus="nextFieldDestination((1 + (index * 2)), 0)">
										<input type="text" :name="['u-overflow_' + index]" class="list-number-line__field list-number-number form-width--w50px" v-model.number="number.Connections" :data-index="index" disabled @keydown="checkCount($event, 'Connections', 0, index)" @blur="checkAndSetDefault($event, 'Connections', 0, index)" :tabindex="[2 + (index * 2)]" @focus="nextFieldDestination((2 + (index * 2)), 0)">
										<span>{{ $store.state.settings.portal.connectionLabel }}</span>
										<span class="list-number--icon">
										<a class="button__icon button__icon--edit" @click="setDestinationEditable($event)" :data-index="index">&#xF3EB;</a>
										<a class="button__icon button__icon--delete" @click="deleteDestination($event, 0)" :data-index="index">&#xF1C0;</a>
										</span>
									</li>
									</ul>
								</div>
							</div>
							<!-- CALL FORWARD -->
							<div class="grid-row spacer__top--30">
								<div class="grid-unit--alpha">
									<div class="form-button__secondary form-button__secondary--add grid--push">
									<button @click="addDestination(1)">{{ $store.state.settings.portal.addforewardnumber }}</button>
									</div>
								</div>
								<div class="grid-unit--alpha">
									<!--<ul class="list-number-wrapper" v-sortable:options="{onEnd: reorderNumbers}">-->
									<ul class="list-number-wrapper" id="list-number-wrapper--1">
									<!--<li v-for="(number, index) in destinationNumbers[1]" :key="number.Priority" class="list-number-line list-number-line--dragable">-->
									<li v-for="(number, index) in destinationNumbers[1]" :key="number.Priority" class="list-number-line list-number-line--nohandle">
										<input type="text" :name="['u-address2_' + index]" class="list-number-line__field list-number-label" v-model="number.Address" :data-index="index" disabled @keydown="checkPhoneNumber($event, 'Address', 1, index)" placeholder="+31XXXXXXXXX" :tabindex="[1 + (index * 2)]" @focus="nextFieldDestination((1 + (index * 2)), 1)">
										<input type="text" :name="['u-overflow2_' + index]" class="list-number-line__field list-number-number form-width--w50px" v-model.number="number.Connections" :data-index="index" disabled @keydown="checkCount($event, 'Connections', 1, index)" @blur="checkAndSetDefault($event, 'Connections', 1, index)" :tabindex="[1 + (index * 2)]" @focus="nextFieldDestination((2 + (index * 2)), 1)">
										<span>{{ $store.state.settings.portal.connectionLabel }}</span>
										<span class="list-number--icon">
										<a class="button__icon button__icon--edit" @click="setDestinationEditable($event)" :data-index="index">&#xF3EB;</a>
										<a class="button__icon button__icon--delete" @click="deleteDestination($event, 1)" :data-index="index">&#xF1C0;</a>
										</span>
									</li>
									</ul>
								</div>
							</div>
						</div>
						<!-- VOICEMAIL ------------------------------------------------------------------------------------------>
						<div class="tabs-content" :class="{'tabs-content--active' : activeTab == 3}">
							<div v-if="helpText[3] != ''" class="balloon-dialog--help status--minimized js__help">
								<span class="typo__note--pale" v-html="helpText[3]"></span>
							</div>
							<div class="grid-row">
								<div class="grid-unit--alpha">
									<div class="form-checkbox form-checkbox--large position--mtop24">
									<input type="checkbox" name="chkemail" id="chkemail" v-model="serviceNumberScript.UseVoicemail">
									<label for="chkemail">{{ $store.state.settings.portal.forms.chkemaillabel }}</label>
									</div>
								</div>
								</div>
								<div class="grid-row">  
								<div class="grid-unit--beta">
									<div class="form-textfield form-textfield--bground">
									<input type="text" name="emailaddress" id="emailaddress" v-model="serviceNumberScript.VoicemailEmailAddress" :readonly="!serviceNumberScript.UseVoicemail" :placeholder="$store.state.settings.portal.emaillabel">
									<label for="emailaddress" class="form-label form-label--hidden">{{ $store.state.settings.portal.emaillabel }}</label>
									</div>
								</div>
								<div class="grid-unit--beta">
									<div class="form-selectfield form-selectfield--no-margin form-selectfield--margin-bottom form-selectfield--has-buttonbar-three">
									<label for="prompt3" class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.portal.promptslabel[2] }}</label>
									<select id="prompt3" name="prompt3" v-model="serviceNumberScript.VoicemailPrompt" @change="setAudioPlayerStatus($event, 'stopped', 'VoicemailPrompt')">
										<option value="" selected>{{ $store.state.settings.portal.defaultselectprompts[2] }}</option>
										<option v-for="prompt in removeNonPlayablePrompts" :key="prompt.Id" :value="prompt.Title" :class="{'hightlight' : prompt.IsDefault}">{{ prompt.Title }}<span v-if="prompt.IsDefault">*</span></option>
									</select>
									</div>
									<div class="form__audio-bar form__audio-bar--three">
									<a class="button__icon button__icon-play--small" :class="{'button__icon--disabled' : serviceNumberScript.VoicemailPrompt == ''}" @click="playPrompt($event, serviceNumberScript.VoicemailPrompt,'VoicemailPrompt')"><span v-html="playerIcon.play"></span></a>
									<a class="button__icon button__icon-edit--small" :class="{'button__icon--disabled' : checkStandardPrompt('VoicemailPrompt', 'vPrompt')}" id="vPrompt" @click="editPrompt('edit', 'VoicemailPrompt', serviceNumberScript.VoicemailPrompt)">&#xF3EB;</a>
									<a class="button__icon button__icon-upload--small" @click="addPrompt('new', 'VoicemailPrompt')">&#xF419;</a>
									</div>
								</div>
							</div>
						</div>
						</div>
					</div>  
				</div>
				<div class="grid-unit--alpha dialog__window-footer">
					<div class="grid--pull">
						<a class="button-primary dialog__window-ok dialog__window-nav" :class="{'button-primary--disabled' : activeTab == 0}" @click="prevTab()">{{ dialogPrevText }}</a>
						<a class="button-primary dialog__window-ok dialog__window-nav" :class="{'button-primary--disabled' : activeTab == currentPlanPartLabels.length-1}" @click="nextTab()">{{ dialogOkText }}</a>
					</div>
					<a class="button-primary dialog__window-cancel" @click="dialogClose">{{ $store.state.settings.portal.dialogCancelText }}</a> 
					<a class="button-primary button-primary--important" @click="savePlan()">{{ $store.state.settings.portal.dialogSaveText }}</a>
				</div>
			</div>
		</div>
	<!-- END DIALOG ------------------------------------------------------------------------------------------>

	<!-- START PROMPT EDIT/UPLOAD DIALOG --------------------------------------------------------------------->
		<edit-upload-prompt-dialog></edit-upload-prompt-dialog>
	<!-- END PROMPT EDIT/UPLOAD DIALOG ----------------------------------------------------------------------->
	</div>
</template>

<style lang="scss">
@use "@/scss/includes/globals";
@use "@/scss/includes/balloon";
@use "@/scss/includes/tiles";
@use "@/scss/includes/numberlist";

[data-e2e='service-numbers'] .contentwrapperclass > div {
	width: 100%;
	@media #{globals.$media_S} {
		width: 50%;
	}
	@media #{globals.$media_M} {
		width: 33.333%;
	}
	@media #{globals.$media_XL} {
		width: 25%;
	}
	.tiles-item {
		width: 100%;
	}
}

</style>