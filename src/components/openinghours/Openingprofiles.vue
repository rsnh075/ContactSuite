<template>
  <div data-e2e="opening-profiles">
    <!-- OH LIST SCREEN -->
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.openingprofiles.searchtxt" @keyup="filterList()">
          </div>
          <div class="typo-tabletitle">
            {{totalOpeningProfiles + " " + $store.state.settings.openingprofiles.countlabel}}
          </div>
          <div class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button type="button" @click="addOpeningProfile()">{{ $store.state.settings.openingprofiles.addopeningprofile }}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="list-content-wrapper">
        <div class="list-content--back">
          <div class="list-content--header">
            <ExportListToXLSX
            :data="openingProfiles"
            :customBtnStyles="exportListBtnStyles"
            :customWrapperStyles="exportListWrapperStyles"
            />
            <div class="list-content__row--header">
              <span class="list-content__row-cell list-content__row-cell--30" @click="sortColumn('Title', $event)" data-sortorder="NONE" v-html="$store.state.settings.openingprofiles.collheads[0]"></span>
              <span class="list-content__row-cell list-content__row-cell--40" v-html="$store.state.settings.openingprofiles.collheads[1]"></span>
              <span class="list-content__row-cell list-content__row-cell--30" v-html="$store.state.settings.openingprofiles.collheads[2]"></span>
            </div>
          </div>
          <div class="list-content">
            <ol>
              <li v-for="openingProfile in openingProfiles" :key="openingProfile.Id" class="list-content__row list-content__row--clickable" @click="showOpeningProfile(openingProfile.Title, openingProfile.Id)" :data-openingProfileId="openingProfile.Id" :data-openingProfileTitle="openingProfile.Title">
                <span class="list-content__row-cell list-content__row-cell--30">{{ openingProfile.Title }}</span>
                <span class="list-content__row-cell list-content__row-cell--40" v-html="getOpenDays(openingProfile.Details)"></span>
                <span class="list-content__row-cell list-content__row-cell--30">{{ getClosedDays(openingProfile.Details) }}</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- OPENINGHOURS POPUP -->
    <opening-profile
      :visible="detailStatus"
      :custId="selectedCustomerId"
      :openingProfiles="rawList"
      :openingProfileId="selectedOpeningProfileId"
      :openingProfileTitle="selectedOpeningProfileTitle"
      :profiletitles="profileTitles"
      @closeOpeningProfile="closeOpeningProfile"
    />

  </div>
</template>

<script>

import OpeningProfile      from './Opening-Profile.vue';
import { dynamicSort }     from './../../use/sortFunctions';
import { toISODate }       from './../../use/dateFunctions';
import { scrollTo }        from './../../use/helperFunctions';
import {IPCCCConfigurator} from "../../ipccc/js/configurator";
import ExportListToXLSX    from '../uielements/ExportListToXLSX.vue';

export default {
  name: 'openingprofiles',
  data: () => {
    return {
      selectedCustomerId          : -1,
      searchStr                   : '',
      sortSetting                 : {},
      rawList                     : [],
      openingProfiles             : [],
      totalOpeningProfiles        : null,
      detailStatus                : false,
      selectedOpeningProfileId    : -1,
      selectedOpeningProfileTitle : '',
      storeWatch                  : null,
      profileTitles               : [],
      exportListBtnStyles  : {
        top: '9px',
        right: '8px',
        zIndex: 1
      },
      exportListWrapperStyles : {
        top: '9px',
        right: '8px',
      },
    }
  },
  inject: ['showLoader'],
  components: {
    OpeningProfile,
    ExportListToXLSX
  },
  computed: {
  },
  methods: {
    getOpeningProfiles(custId) {
        IPCCCConfigurator.Request(custId, 'openinghours', 'readall', null, -1).then(result => {
        this.rawList              = result;
        this.openingProfiles      = this.rawList;
        this.profileTitles        = this.rawList.map(profile => profile.Title);
        this.totalOpeningProfiles = this.openingProfiles.length;
        this.defaultSortOrder();
        this.showLoader(false);
      }).catch(error => {
        console.error('Error: ' + error);
        this.showLoader(false);
      });
    },
    addOpeningProfile() {
      this.selectedOpeningProfileId    = -1;
      this.selectedOpeningProfileTitle = this.$store.state.settings.openingprofile.newselectopeninghours;
      this.detailStatus                = true;
    },
    showOpeningProfile(pTitle, pId) {
      this.selectedOpeningProfileId    = pId;
      this.selectedOpeningProfileTitle = pTitle;
      this.detailStatus = true;
    },
    closeOpeningProfile(data, dataOp) {
      if(data != null)
        this.updateList(data, dataOp);

      this.selectedOpeningProfileId    = -1;
      this.selectedOpeningProfileTitle = '';
      this.detailStatus                = false;
      this.showLoader(false);
    },
    getOpenDays(details) {
      let _opendays    = [],
          _week        = this.$store.state.settings.openingprofiles.daysoftheweek,
          _strOpenDays = '';

      _opendays = details.reduce((acc, detail) => {
        if(detail.DayNumber > 0 && acc.indexOf(detail.DayNumber) == -1) {
          let _dayName = _week[(detail.DayNumber - 2)];
          if(detail.DayNumber == 1)
            _dayName = _week[6];
          acc.push({
            'dayNumber' : detail.DayNumber - 2,
            'dayName' : _dayName
          });
        }
        return acc;
      }, []);
      _week.forEach(day => {
        //check if weekday is an openday
        if(_opendays.findIndex(_day => _day.dayName == day) != -1)
          _strOpenDays += '<span class="list-content__row-cell__highlighttxt">';
        else
          _strOpenDays += '<span class="list-content__row-cell__lowlighttxt">';
        _strOpenDays += day;
        _strOpenDays += '</span>';
      });
      return _strOpenDays;
    },
    getClosedDays(details) {
      let _opendays = [],
          _strClosedDays = '';

      _opendays = details.reduce((acc, detail) => {
        if(detail.Date != null && new Date(toISODate(detail.Date)).getTime() >= new Date().getTime() )
          acc.push(detail.Date);
        return acc;
      }, []);
      if(_opendays.length > 0) {
        _opendays.forEach((day, idx) => {
          _strClosedDays += day
            if(idx == _opendays.length - 1)
              _strClosedDays += '.'
            else
              _strClosedDays += ', '
        });
      }
      return _strClosedDays;
    },
    updateList(data, dataOp) {
      let _profileToDeleteIndex = -1;
      this.totalOpeningProfiles = 0;
      this.rawList.map((profile, index) => {
        if(profile.Id == data.Id) {
          _profileToDeleteIndex = index;
        }
      });
      if(_profileToDeleteIndex != -1) {
        if(dataOp == 'save') {
          this.rawList[_profileToDeleteIndex] = data;
        } else {
          this.rawList.splice(_profileToDeleteIndex, 1);
        }
      } else {
        this.rawList.push(data);
      }

      this.openingProfiles = [...this.rawList];
      this.profileTitles   = this.rawList.map(profile => profile.Title);
      this.filterList();

      if(this.openingProfiles.findIndex(detail => detail.Id === data.Id) != -1) {
        setTimeout(() => {
          this.setHighlightedRow(data.Id);
        }, 500);
      }
      this.showLoader(false);
    },
    //=========================================================== START DISPLAY LIST METHODS
    filterList() {
      this.openingProfiles      = this.filterListOnString(this.rawList, this.searchStr.toLowerCase());
      this.totalOpeningProfiles = this.openingProfiles.length;
      this.sortColumn();
    },
    filterListOnString(list, str) {
      if(str != '') {
        let _rawList = [...list],
            _keys;
        return _rawList.filter(item => {
          _keys = item['Title'].toLowerCase().indexOf(str) != -1
          return _keys;
        });
      } else {
        return [...list];
      }
    },
    defaultSortOrder() {
      this.sortSetting.order = 'NONE';
      this.sortSetting.key = 'Title';
      this.sortColumn();
    },
    sortColumn(key, e = null) {
      let _order,
          _t;

      if(e != null) {
        _t     = e.target;
        _order = _t.getAttribute('data-sortOrder');
        document.querySelectorAll('.list-content__row--header > span').forEach( a => a.setAttribute('data-sortorder', 'NONE'));
        this.sortSetting = {
          'key': key,
          'order' : _order
        }
        this.setHighlightedRow(-2);
      } else {
        _order = this.sortSetting.order;
        key    = this.sortSetting.key;
      }

      switch(_order) {
        case 'NONE':
          this.openingProfiles.sort(dynamicSort(key));
          if(e != null)
            _t.setAttribute('data-sortOrder', 'ASC');
          break;
        case 'ASC':
          this.openingProfiles.sort(dynamicSort('-' + key));
          if(e != null)
            _t.setAttribute('data-sortOrder', 'DES');
          break;
        case 'DES':
          this.openingProfiles = this.filterListOnString(this.rawList, this.searchStr.toLowerCase());
          this.totalOpeningProfiles = this.openingProfiles.length;
          if(e != null)
            _t.setAttribute('data-sortOrder', 'NONE');
          break;
      }
    },
    setHighlightedRow(id) {
      let _wrapper = null;
      document.querySelectorAll('[data-openingProfileId]').forEach(el => {
        _wrapper = el.parentElement.parentElement;
        if (el.getAttribute('data-openingProfileId') == id) {
          el.classList.add('list-content__row--mutated');
          scrollTo(_wrapper, (el.offsetTop - el.offsetHeight), 300);
        } else
          el.classList.remove('list-content__row--mutated');
      });
      if(id == -2 && _wrapper !== null)
        scrollTo(_wrapper, 0, 200);
    },
  },
  mounted() {
    this.showLoader(true);
    this.selectedCustomerId = this.$store.getters.getCustomerInfo().selectedCustomerId;

    if(this.selectedCustomerId !== -1)
      this.getOpeningProfiles(this.$store.getters.getCustomerInfo().selectedCustomerId);

    this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
      if(cObj.selectedCustomerId != -1) {
        this.showLoader(true);
        this.selectedCustomerId = cObj.selectedCustomerId;
        this.closeOpeningProfile();
        this.getOpeningProfiles(cObj.selectedCustomerId);
      }
    });
  },
  beforeUnmount() {
    this.storeWatch();
  }
}
</script>
