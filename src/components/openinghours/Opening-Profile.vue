<template>
  <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : visible}]" data-e2e="opening-profile">
    <div id="detailscreen" class="detailscreen detailscreen--fit">
      <a v-show="false" :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a>
      <div class="grid-row">
        <div class="grid-unit--beta detailscreen-wrapper__title">
          <span class="detailscreen__title detailscreen__title--paddingright">{{ showTitle }}</span>
        </div>
        <div class="grid-unit--beta detailscreen-wrapper__title">
          <span class="detailscreen__title">{{ $store.state.settings.openingprofile.profileexceptionslabel }}</span>
        </div>
      </div>
      <form @valid="mutateOpeningProfile('save')" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">
        <input type="hidden" data-reset="" ref="validationcontrol">
        <div class="grid-row">
          <div class="grid-unit--beta grid-unit--beta-less-v-padding separator-v__right_v2">
            <div class="grid-row">
              <div class="form-textfield">
                <input type="text" name="profileTitle" id="profileTitle" v-model="openingHoursTitle" @keyup="testTitleIsValid()" :data-validate="tileIsValid" :data-message="$store.state.settings.openingprofile.validatetitle" :placeholder="$store.state.settings.openingprofile.newprofilenameplaceholder">
              </div>
              <table class="tables-openings" id="tableopenings">
                <tr>
                  <th>{{ $store.state.settings.openingprofile.openinghourheader[0] }}</th>
                  <th>{{ $store.state.settings.openingprofile.openinghourheader[1] }}</th>
                  <th>{{ $store.state.settings.openingprofile.openinghourheader[2] }}</th>
                </tr>
                <tr v-for="(day, index) in openingHourWeek" :key="index">
                  <td :class="{'tables-openings__cell--disabled' : !day.active}">
                    <div class="form-checkbox form-checkbox--inline-smaller">
                      <input type="checkbox" :name="['day_' + index]" :id="['day_' + index]" @change="setDayStatus($event)" :data-daynr="getShiftedIndex(index)" v-model="day.active">
                      <label :for="['day_' + index]" :data-label="$store.state.settings.openingprofile.daysoftheweek[index]"></label>
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
                    <a href="javascript:;" @click="toggleSecondTimeSlot($event, false, index)" class="button__close status--hidden" :data-daynr="getShiftedIndex(index)">&#xF5AD</a>
                  </td>  
                </tr>
              </table>  
            </div>
          </div>
          
          <div class="grid-unit--beta grid-unit--beta-less-v-padding">
            <div class="grid-row">
              <div class="panel-flat--gray5">
                <div class="pannel__lock"></div>
                <div class="grid-unit--beta grid-unit--beta-form">
                  <div class="form-textfield form-textfield--bground form-textfield--mask-readonly">
                    <input type="text" id="datepicker" :placeholder="$store.state.settings.openingprofile.addcalenderdate" v-model.sync="newCalenderDate" @change="isCalendarItemValid" readonly>
                    <label for="c-adddata" class="form-label">&nbsp;</label>
                  </div>
                </div>
                <div class="grid-unit--beta grid-unit--beta-form">
                  <div class="form-checkbox form-checkbox--inline-small position--mtop12">
                    <input type="checkbox" name="alldayclosed" id="alldayclosed" @change="blockTimeSlots($event)">
                    <label for="alldayclosed" :data-label="$store.state.settings.openingprofile.closedlabel"></label>
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
                        <span class="button__add--secondary-label">{{ $store.state.settings.openingprofile.addlabel }}</span>
                      </a>
                    </div>
                  </div>  
                </div>  
              </div>
            </div>
            <div class="grid-row">
              <table class="tables-openings tables-openings--added tables-openings--added-head"> 
                <tr>
                  <th>{{ $store.state.settings.openingprofile.calendarheader[0] }}</th>
                  <th>{{ $store.state.settings.openingprofile.calendarheader[1] }}</th>
                  <th>{{ $store.state.settings.openingprofile.calendarheader[2] }}</th>
                  <th>&nbsp;</th>
                </tr>
              </table>
              <div class="list-items-wrapper list-items-wrapper--calendar">
                <table class="tables-openings tables-openings--added">
                  <tr v-for="(date, index) in calendarDates">
                    <td>{{ date.Date }}</td>
                    <td v-html="niceTimeSlot(date.FromTime1, date.ToTime1, 1, getNrOfSlots(date))"></td>
                    <td v-html="niceTimeSlot(date.FromTime2, date.ToTime2, 2, getNrOfSlots(date))"></td>
                    <td>
                      <a class="button__icon button__icon--delete" @click="deleteCalendarItem($event)" :data-index="index">&#xF1C0;</a>
                    </td>
                  </tr>
                </table>
              </div>
            </div>  
          </div>
        </div>
          
      </form>
      <!-- BUTTONS -->
      <div class="detailscreen-footer detailscreen-footer--inside">
        <span>
          <a class="button-primary button-primary--delete" @click="mutateOpeningProfile('delete')">{{ $store.state.settings.openingprofile.deletebtnlbl }}</a>
        </span>
        <span class="grid--push">
          <a class="button-primary button-primary--gray" @click="closeOpeningProfile(null, null)">{{ $store.state.settings.openingprofile.closeprofile }}</a>
          <a :class="['button-primary', 'js-submitbtn', {'button-primary--disabled' : saveIsDisabled}]">{{ $store.state.settings.openingprofile.savelbl }}</a>
        </span>
      </div>
    
    </div>
  </div>
</template>

<script>

import { ValidateDir }     from './../../directives/validate';
import * as Mask           from './../../use/mask'; 
import PikaDay             from 'pikaday';
import { dynamicSort }     from './../../use/sortFunctions';
import { dateToLocal,
         pikaDayToDDMMYYYY }     from './../../use/dateFunctions';
import {IPCCCConfigurator} from "../../ipccc/js/configurator";

export default {
  name: 'OpeningProfile',
  props: ['visible', 'custId', 'openingProfiles', 'openingProfileId', 'openingProfileTitle', 'profiletitles'],
  data: () => {
    return {
      ifSelectOpeningProfiles : false,
      showHelp           : false,
      openingPfiles      : [],
      selectedProfileId  : -1,
      openingHoursTitle  : '',
      openingHourDay: {
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
      openingHourWeek: [],

      newCalenderDate    : '',
      calendarItemValid  : false,
      calendarDates      : [],
      diasabledDates     : [],
      openingProfileToSave : {},
      daysSlot2ToEnable  : [],
      savedTitle         : '',
      tileIsValid        : 'isNotEmpty',
    }
  },
  inject: ['showLoader'],
  directives: {
    Validate : ValidateDir
  },
  watch: {
    visible() {
      if(this.visible) {
        this.showLoader(true);
        this.selectedProfileId = this.openingProfileId;
        this.openingHoursTitle = this.openingProfileTitle;
        this.openingPfiles     = Object.assign([], this.openingProfiles);
        this.getOpeningProfiles();
      }
    },
  },
  computed: {
    validationStatus() {
      return 'form';
    },
    showTitle() {
      return this.openingHoursTitle.length > 0 ? this.openingHoursTitle : this.$store.state.settings.openingprofile.profilenameempty;
    },
    saveIsDisabled() {
      return this.calendarDates.length == 0 && !this.openingHourWeek.some(e => e.active == true)
    }
  },
  methods: {
    getOpeningProfiles() {
      //ADD NEW
      this.openingPfiles.unshift({
        CustomerId: this.custId,
        Details: [
          // {Date: null, DayNumber: 0, DefinitionId: -1, DetailId: -1, FromTime1: '00:00', ToTime1: '00:00', FromTime2: '00:00', ToTime2: '00:00', active: false},
          {Date: null, DayNumber: 1, DefinitionId: -1, DetailId: -1, FromTime: '00:00', ToTime: '23:59'},
          {Date: null, DayNumber: 2, DefinitionId: -1, DetailId: -1, FromTime: '00:00', ToTime: '23:59'},
          {Date: null, DayNumber: 3, DefinitionId: -1, DetailId: -1, FromTime: '00:00', ToTime: '23:59'},
          {Date: null, DayNumber: 4, DefinitionId: -1, DetailId: -1, FromTime: '00:00', ToTime: '23:59'},
          {Date: null, DayNumber: 5, DefinitionId: -1, DetailId: -1, FromTime: '00:00', ToTime: '23:59'},
          {Date: null, DayNumber: 6, DefinitionId: -1, DetailId: -1, FromTime: '00:00', ToTime: '23:59'},
          {Date: null, DayNumber: 7, DefinitionId: -1, DetailId: -1, FromTime: '00:00', ToTime: '23:59'}
        ],
        Id: -1,
        Title: this.$store.state.settings.openingprofile.newselectopeninghours
      });
      this.loadProfile();
    },
    loadProfile() {
      if(this.selectedProfileId == -1) {
        //CLEAR AND NEW
        this.savedTitle        = '';
        this.setNewProfile();
      } else {
        //LOAD PROFILE
        this.clearOpeningTable();
        let _profile = this.getOpeningHours();
        this.fillOpeningHours(_profile.openings);
        this.fillCalendar(_profile.calendars);
        this.removeDisabled();
        this.openingHoursTitle = _profile.title;
        this.savedTitle        = _profile.title;
      }
      this.showLoader(false);
    },
    setNewProfile() {
      //CLEAR AND NEW
      this.clearOpeningTable();
      this.selectedProfileId = -1;
      let _profile = this.getOpeningHours();
      this.fillOpeningHours(_profile.openings);
      this.fillCalendar(_profile.calendars);
    },
    newOpeningHoursTitleInput(e, status) {
      let _targetWrapper = e.currentTarget.parentElement,
        _input = _targetWrapper.querySelector('input');
      if (status) {
        _targetWrapper.classList.add('form-input-button--active');
        _input.value = '';
        _input.focus();
      } else {
        _targetWrapper.classList.remove('form-input-button--active');
        _input.value = '';
        _input.blur();
      }
    },
    getOpeningHours() {
      let _selOpeningHours = [],
        _selCalendarItems = [],
        _name = '',
        _id = -1;

      this.openingPfiles.map(profile => {
        if(profile.Id == this.selectedProfileId) {
          _name = profile.Title;
          _id = profile.Id;
          profile.Details.map(slot => {
            if (slot.DayNumber == 0) _selCalendarItems.push(slot);
            else _selOpeningHours.push(slot);
          });
        }
      });

      return {
        openings: _selOpeningHours,
        calendars: _selCalendarItems,
        title: _name,
        id: _id
      };
    },
    fillOpeningHours(openings) {
      let _rawOpenings    = JSON.parse(JSON.stringify(openings));      
      this.daysSlot2ToEnable = [];       
      _rawOpenings.forEach(day => {
        this.openingHourWeek.forEach((weekday, index) => {
          if(weekday.DayNumber == day.DayNumber) {
            if(weekday.active == false) {
              weekday.Date = null;
              weekday.DayNumber = day.DayNumber;
              weekday.DefinitionId = day.DefinitionId;
              weekday.DetailId = day.DetailId;
              weekday.FromTime1 = day.FromTime;
              weekday.FromTime2 = '00:00';
              weekday.ToTime1 = day.ToTime;
              weekday.ToTime2 = '00:00';
              weekday.active = true;
            } else {
              weekday.FromTime2 = day.FromTime;
              weekday.ToTime2 = day.ToTime;
              this.daysSlot2ToEnable.push('#slot_' + index + '_2_start');
            }
          }
        });
      });      
    },
    removeDisabled() {
      setTimeout(() => {
        this.daysSlot2ToEnable.forEach(id => {
          document.querySelector(id).parentElement.classList.remove('form-timeslot--disabled');
        });
      }, 0);
    },
    fillCalendar(calendarDays) {
      let _rawCalendarDays = JSON.parse(JSON.stringify(calendarDays));
      this.diasabledDates = [];
      _rawCalendarDays.map(day => {
        let _index = -1,
          _dayFound = this.calendarDates.filter((_d, index) => {
            if (_d.Date == day.Date) {
              _index = index;
              return _d;
            }
          });

        if (_dayFound.length == 0) {
          this.calendarDates.push({
            Date: day.Date,
            DayNumber: 0,
            DefinitionId: day.DefinitionId,
            DetailId: day.DetailId,
            FromTime1: day.FromTime,
            FromTime2: '00:00',
            ToTime1: day.ToTime,
            ToTime2: '00:00',
            active: true
          });
          this.diasabledDates.push(day.Date);
        } else {
          this.calendarDates[_index].FromTime2 = day.FromTime;
          this.calendarDates[_index].ToTime2 = day.ToTime;
        }
      });
      this.sortCalendarDates();
    },
    clearOpeningTable() {
      this.openingHourWeek        = [];
      this.openingHourWeek.length = 0;
      this.openingHoursTitle      = '';
      this.tileIsValid            = 'isNotEmpty';
      this.resetValidationOnForm();
      Mask.clearAllTimeMask();
      for (let i = 0; i < 7; i++) {
        this.openingHourWeek.push(
          JSON.parse(JSON.stringify(this.openingHourDay))
        );
        this.openingHourWeek[i].DayNumber = this.getShiftedIndex(i);
      }

      let _tableRows = document.querySelectorAll(
        '#tableopenings tr:not(:first-child)'
      );
      _tableRows.forEach(tr => {
        let __timeSlots = tr.querySelectorAll("[id^='slot_']");
        __timeSlots.forEach(i => {
          i.readOnly = false;
          i.style.color = '';
        });
        tr.querySelector("input[type='checkbox']").checked = false;
        let __secondSlot = tr.querySelectorAll('.form-timeslot')[1];
        __secondSlot.classList.add('form-timeslot--disabled');
        __secondSlot.setAttribute('data-status', 'disabled');
        __secondSlot.parentElement
          .querySelector('a')
          .classList.add('status--hidden');
      });

      this.calendarDates = [];
      this.newCalenderDate = '';
      this.resetAddCalendar();
    },
    setDayStatus(e) {
      let _chk = e.target,
        _dayline = _chk.parentElement.parentElement.parentElement,
        _inputs = _dayline.querySelectorAll("[id^='slot_']"),
        _dayNr = _chk.getAttribute('data-daynr'),
        _modelItem = this.openingHourWeek.filter(
          item => item.DayNumber == _dayNr
        );

      
      _modelItem[0].FromTime1 = '00:00';
      _modelItem[0].FromTime2 = '00:00';
      _modelItem[0].ToTime1 = '00:00';
      _modelItem[0].ToTime2 = '00:00';
      if (_chk.checked) {
        _inputs.forEach(input => {
          input.readOnly = false;
          _modelItem[0].ToTime1 = '23:59';
          Mask.clearTimeMask(input.id);
        });
      } else {
        _inputs.forEach(input => (input.readOnly = true));
        let _secondSlot = _dayline.querySelectorAll('.form-timeslot')[1];
        _secondSlot
          .querySelectorAll('input')
          .forEach(el => (el.value = '00:00'));
        _secondSlot.classList.add('form-timeslot--disabled');
        _secondSlot.setAttribute('data-status', 'disabled');
        _secondSlot.parentElement
          .querySelector('a')
          .classList.add('status--hidden');
      }      
    },
    toggleSecondTimeSlot(e, status, daynrindex = -1) {
      let _target = e.currentTarget,
        _dnr = _target.getAttribute('data-daynr');
      if (!_target.classList.contains('form-timeslot--disabled-full')) {
        if (status) {
          _target.value = '';
          _target.classList.remove('form-timeslot--disabled');
          _target.setAttribute('data-status', 'active');
          _target.parentElement
            .querySelector('a')
            .classList.remove('status--hidden');
        } else {
          let _slot = _target.parentElement.querySelector('.form-timeslot');
          this.disableSlot(_slot);
          if(daynrindex != -1) {
            let _dayNr     = this.getShiftedIndex(daynrindex),
                _modelItem = this.openingHourWeek.filter(item => item.DayNumber == _dayNr);
            _modelItem[0].FromTime2 = '00:00';
            _modelItem[0].ToTime2 = '00:00';
          }
          _target.classList.add('status--hidden');
        }
      }
    },
    blockTimeSlots(e) {
      let _target = e.target,
        _s1 = document.getElementById('firstaddtimeslot'),
        _s2 = document.getElementById('secondaddtimeslot');

      if (_target.checked) {
        this.disableSlot(_s1);
        this.disableSlot(_s2);
        _s1.classList.add('form-timeslot--disabled-full');
        _s2.classList.add('form-timeslot--disabled-full');
      } else {
        this.enableSlot(_s1);
        _s1.classList.remove('form-timeslot--disabled-full');
        _s2.classList.remove('form-timeslot--disabled-full');
      }
      document
        .querySelector('#secondaddtimeslot')
        .parentElement.querySelector('a')
        .classList.add('status--hidden');
      this.isCalendarItemValid();
    },
    disableSlot(slot) {
      slot.querySelectorAll('input').forEach(el => {
        el.value = '00:00';
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
    addCalendarItem(e) {
      let _calendarRow = {};
      if (this.calendarItemValid) {
        _calendarRow = {
          Date: this.newCalenderDate,
          DayNumber: 0,
          DefinitionId: -1,
          DetailId: -1,
          FromTime1: document.getElementById('slot_add_1_start').value,
          ToTime1: document.getElementById('slot_add_1_stop').value,
          FromTime2: document.getElementById('slot_add_2_start').value,
          ToTime2: document.getElementById('slot_add_2_stop').value,
          active: true
        };
        this.calendarDates.push(_calendarRow);
        this.diasabledDates.push(this.newCalenderDate);
        this.sortCalendarDates();
        this.resetAddCalendar();
      }
    },
    sortCalendarDates() {
      this.calendarDates.forEach(date => {
        let _dateReversed = date.Date.split('-').reverse().join('-'),
            _realDate     = new Date(_dateReversed),
            _realDateToMs = _realDate.getTime();
        date.sortTime = _realDateToMs;
      });
      this.calendarDates.sort(dynamicSort('-sortTime'));
      this.calendarDates.forEach(date => { delete date.sortTime });
    },
    nextField(tindex) {
      let _currentField = document
          .querySelector('#tableopenings')
          .querySelector('[tabindex="' + tindex + '"]'),
        _nextField = document
          .querySelector('#tableopenings')
          .querySelector('[tabindex="' + tindex++ + '"]');

      if (_nextField != null) {
        if (_currentField.parentElement.parentElement.classList.contains('tables-openings__cell--disabled') == false &&
          _currentField.parentElement.classList.contains('form-timeslot--disabled') == false) {
          _currentField.select();
        } else {
          this.nextField(tindex++);
        }
      } else {
        this.nextField(1);
      }
    },
    nextFieldAdd(tindex) {
      let _currentField = document
          .querySelector('#tables-openings-add')
          .querySelector('[tabindex="' + tindex + '"]'),
        _nextField = document
          .querySelector('#tables-openings-add')
          .querySelector('[tabindex="' + tindex++ + '"]');

      if (_nextField != null) {
        if (
          _currentField.parentElement.classList.contains(
            'form-timeslot--disabled'
          ) == false
        ) {
          _currentField.select();
        } else {
          this.nextFieldAdd(tindex++);
        }
      } else {
        this.nextFieldAdd(1001);
      }
    },
    checkTime(e, prop) {
      let _target = e.target,
        _dnr = _target.getAttribute('data-daynr'),
        _tabindex = _target.getAttribute('tabindex').value,
        _modelItem;

      if (
        _target.parentElement.parentElement.classList.contains(
          'tables-openings__cell--disabled'
        ) == false
      ) {
        Mask.isTimeMask(e);
        if (_target.id.indexOf('add') == -1) {
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
        let _val = parseInt(target.value.replace(':', '')),
          _fromVal = parseInt(
            target.parentElement.parentElement.parentElement
              .querySelector("[id*='" + compare + "']")
              .value.replace(':', '')
          );
        target.style.color = _val <= _fromVal ? '#C00' : '';
      };

      if (prop.indexOf('ToTime') != -1) _validate(_target, '_start');

      if (prop.indexOf('FromTime2') != -1) _validate(_target, '_stop');
    },
    isCalendarItemValid() {
      this.$nextTick(() => {
        this.calendarItemValid =
          this.newCalenderDate != '' &&
          (document.getElementById('alldayclosed').checked ||
            document.getElementById('slot_add_1_start').value != '00:00' ||
            document.getElementById('slot_add_1_stop').value != '00:00');
      });
    },
    resetAddCalendar() {
      this.newCalenderDate = '';
      this.calendarItemValid = false;
      document.getElementById('alldayclosed').checked = false;
      document.getElementById('slot_add_1_start').value = '00:00';
      document.getElementById('slot_add_1_stop').value = '00:00';
      document.getElementById('slot_add_2_start').value = '00:00';
      document.getElementById('slot_add_2_stop').value = '00:00';
      document
        .getElementById('firstaddtimeslot')
        .classList.remove('form-timeslot--disabled', 'form-timeslot--disabled-full');
      document
        .getElementById('secondaddtimeslot')
        .classList.add('form-timeslot--disabled');
      document
        .getElementById('secondaddtimeslot')
        .classList.remove('form-timeslot--disabled-full');
    },
    deleteCalendarItem(e) {
      let _target = e.target,
        _index = _target.getAttribute('data-index');
      this.calendarDates.splice(_index, 1);
      this.diasabledDates.splice(_index, 1);
    },
    niceTimeSlot(start, stop, slotnr, nrslots) {
      let _slot =
        '<b>' + this.$store.state.settings.portal.forms.closedlabel + '</b>';

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
    getShiftedIndex(index, shift = 2, length = 7) {
      return Math.abs(index + shift <= length ? index + shift : index - length);
    },
    closeOpeningProfile(data, dataOp) {
      this.clearOpeningTable();
      this.$emit('closeOpeningProfile', data, dataOp);
    },
    mutateOpeningProfile(dataOp) {
      if(this.saveIsDisabled) return;
      this.showLoader(true);
      //SET OPENINGHOURS
      let _openingProfileToSave        = {};
      _openingProfileToSave.CustomerId = this.custId;
      _openingProfileToSave.Details    = this.openingsStripForSave();
      _openingProfileToSave.Id         = this.selectedProfileId;
      _openingProfileToSave.Title      = this.openingHoursTitle;

        IPCCCConfigurator.Request(this.custId, 'openinghours', dataOp , _openingProfileToSave, _openingProfileToSave.Id).then(
        succes => {
          this.closeOpeningProfile(succes, dataOp);
        }).catch(
        error => {
          this.showLoader(false);
          console.log('Error: ' + error);
      });
    },
    openingsStripForSave() {
      let _rawOpenings = JSON.parse(JSON.stringify(this.openingHourWeek)),
        _rawCalendarDays = JSON.parse(JSON.stringify(this.calendarDates)),
        _stripedOpenings = [];

      _rawOpenings.map(weekday => {
        if (weekday.active == true) {
          if (weekday.FromTime1 !== '00:00' || weekday.ToTime1 !== '00:00') {
            _stripedOpenings.push({
              Date: null,
              DayNumber: weekday.DayNumber,
              DefinitionId: weekday.DefinitionId,
              DetailId: weekday.DetailId,
              FromTime: weekday.FromTime1,
              ToTime: weekday.ToTime1
            });
          }
          if (weekday.FromTime2 !== '00:00' || weekday.ToTime2 !== '00:00') {
            _stripedOpenings.push({
              Date: null,
              DayNumber: weekday.DayNumber,
              DefinitionId: weekday.DefinitionId,
              DetailId: weekday.DetailId,
              FromTime: weekday.FromTime2,
              ToTime: weekday.ToTime2
            });
          }
        }
      });

      _rawCalendarDays.map(caledaritem => {
        _stripedOpenings.push({
          Date: caledaritem.Date,
          DayNumber: 0,
          DefinitionId: caledaritem.DefinitionId,
          DetailId: caledaritem.DetailId,
          FromTime: caledaritem.FromTime1,
          ToTime: caledaritem.ToTime1
        });
        if (
          caledaritem.FromTime2 !== '00:00' ||
          caledaritem.ToTime2 !== '00:00'
        ) {
          _stripedOpenings.push({
            Date: caledaritem.Date,
            DayNumber: 0,
            DefinitionId: caledaritem.DefinitionId,
            DetailId: caledaritem.DetailId,
            FromTime: caledaritem.FromTime2,
            ToTime: caledaritem.ToTime2
          });
        }
      });

      return _stripedOpenings;
    },
    testTitleIsValid() {
      if(this.openingHoursTitle.length > 0 && (this.profiletitles.some(profiletitle => profiletitle == this.openingHoursTitle) == false || this.savedTitle == this.openingHoursTitle)) {
        this.tileIsValid = 'isNotEmpty';
      } else {
        this.tileIsValid = 'isEmail'; //force validation to fail.
      } 
    },
    resetValidationOnForm() {
      let _event = new Event('reset');
      this.$refs.validationcontrol.dispatchEvent(_event);
    },
    displayHelp() {
      this.showHelp = !this.showHelp;
    },
    shakeIt() {
      let _elm = document.querySelector("#detailscreen");
      _elm.classList.add('detailscreen--shake');
      setTimeout(() => {
        _elm.classList.remove('detailscreen--shake');
      }, 1000);
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
            
            this.newCalenderDate = pikaDayToDDMMYYYY(this.datePicker.getDate());
          } else {
            //WORK AROUND KEYBOARD SELECTABLE DISABLED DATE
            this.newCalenderDate = ''; //WORK AROUND KEYBOARD SELECTABLE DISABLED DATE
          } //WORK AROUND KEYBOARD SELECTABLE DISABLED DATE
        }
      });
    },
  },
  mounted() {
    this.setDatePicker();
  }
}

</script>
