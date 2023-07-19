<template>
  <div data-e2e=real-time-adherence-mapping”>
    <div class="rtamapping__wrapper">
      <div class="rtamapping__col--delta">
        <h2>{{ $store.state.settings.rta.activitylisthead }}</h2>
        <div class="panel panel-white">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" v-model="searchStrA" :placeholder="$store.state.settings.addressbook.searchtxt" @keyup="filterListA()">
          </div>
          <ul class="rta-itemlist-wrapper">
            <li v-for="(activity, index) in activityList" class="rta-itemlist-line rta-itemlist-line--activity" :key="index">
              <a href="javascript:;" @click="addActivity(index)">{{ activity.Name }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="rtamapping__col--beta" :data-message="$store.state.settings.rta.nocategoriesfound">
        <div class="form-button__secondary form-button__secondary--add grid--push">
          <button v-if="activityList.length > 0 && statusList.length > 0" @click="addNewCategory()">{{ $store.state.settings.rta.addcategory }}</button>
        </div>
        <div v-if="categoryList.length > 0" class="panel panel-white">
          <div class="rtamapping__edit-btns-wrapper">
            <a @click="editCategoryName()" class="rtamapping__edit-btns" id="categoryEditBtn">&#xF3EB</a>
            <a @click="confirm.show($store.state.settings.rta.deleteconfirmtitle, $store.state.settings.rta.deleteconfirmmessage, $store.state.settings.rta.deleteconfirmiconclass, () => deleteCategory())" class="rtamapping__edit-btns rtamapping__edit-btns--delete">&#xF1C0</a>
          </div>
          <div class="form-textfield">
            <input type="text" id="categoryName" v-model="currentCategoryName" :placeholder="$store.state.settings.rta.newcategorynameplaceholder" readonly @keyup="removeNotValid">
          </div>
          <ul class="rta-itemlist-wrapper rta-itemlist-wrapper--half">
            <li  v-for="(activity, index) in categoryList[currentCategoryIndex].Activities" class="rta-itemlist-line rta-itemlist-line--selected" :key="index">
              <div class="form-radio-small">
                <input type="radio" :id="['activity_' + currentCategoryIndex + '_' + index]" :name="categoryList[currentCategoryIndex].Name" @change="setDefaultActivity(activity.Id)" :checked="activity.IsDefault">
                <label :for="['activity_' + currentCategoryIndex + '_' + index]">{{ activity.Name }}</label>
              </div>
              <a href="javascript:;" @click="removeActivity(index)"></a>
            </li>
          </ul>
          <ul class="rta-itemlist-wrapper rta-itemlist-wrapper--half">
            <li v-for="(status, index) in categoryList[currentCategoryIndex].Statuses" class="rta-itemlist-line rta-itemlist-line--selected" :key="index">
              <div class="rta-itemlist-line__label">{{ status.Name }}</div>
              <a href="javascript:;" @click="removeStatus(index)"></a>
            </li>
          </ul>
        </div>
      </div>
      <div class="rtamapping__col--delta">
        <h2>{{ $store.state.settings.rta.statuslisthead }}</h2>
        <div class="panel panel-white">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" v-model="searchStrS" :placeholder="$store.state.settings.addressbook.searchtxt" @keyup="filterListS()">
          </div>
          <ul class="rta-itemlist-wrapper">
            <li v-for="(status, index) in statusList" class="rta-itemlist-line rta-itemlist-line--status" :key="index">
              <a href="javascript:;" @click="addStatus(index)">{{ status.Label }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="rtamapping__footer">
        <a v-if="currentCategoryIndex > 0" class="rtamapping__nav-prev" @click="switchCategory(-1)">{{ categoryList[currentCategoryIndex-1].Name }}</a>
        <div class="rtamapping__nav-dots">
          <a v-for="(category, index) in categoryList" :class="['rtamapping__nav-dots-dot', {'rtamapping__nav-dots-dot--active' : index == currentCategoryIndex}]" @click="gotoCategory(index)">
            <span></span>
          </a>
        </div>
        <a v-if="currentCategoryIndex < categoryList.length-1" class="rtamapping__nav-next" @click="switchCategory(1)">{{ categoryList[currentCategoryIndex+1].Name }}</a>
      </div>
      <div class="rtamapping__cta">
        <a :class="['button-primary', 'grid--push', {'button-primary--dimmed-gray' : !isChanged}]" @click="saveMapping()">{{ $store.state.settings.rta.saveText }}</a>
      </div>
    </div>
  </div>
</template>

<script>

import { cm_alert }            from './old/cm_alert';
import { dynamicSortMultipleProps } from './../../use/sortFunctions';
import {IPCCCConfigurator} from "../../ipccc/js/configurator";
import {IPCCCStatus} from '../../ipccc/js/status';

export default {
  name: 'real-time-adherence-mapping',
  data: () => {
    return {
      fullStatusList : [],
      rawStatusList : [],
      statusList : [],
      fullActivityList : [],
      rawActivityList : [],
      activityList : [],
      categoryList : [],
      searchStrA : '',
      searchStrS : '',
      currentCategoryIndex : 0,
      currentCategoryName : '',
      isChanged : false,
      customerId : -1,
      confirm : null,
    }
  },
  inject: ['showLoader'],
  methods: {
    setDefaultActivity(id) {
      this.isChanged  = true;
      this.categoryList[this.currentCategoryIndex].Activities.map(activity => {
        activity.IsDefault = false;
        if(activity.Id == id)
          activity.IsDefault = true;
      });
    },
    filterListA() {
      let _listToFilter = this.removeUsedActivity(this.categoryList, [...this.fullActivityList]);
      if(this.searchStrA != '')
        this.activityList = _listToFilter.filter(item => item.Name.toLowerCase().indexOf(this.searchStrA.toLowerCase()) != -1);
      else
        this.activityList = _listToFilter;

      this.activityList.sort( dynamicSortMultipleProps('Name') );
    },
    filterListS() {
      let _listToFilter = this.removeUsedStatus(this.categoryList, [...this.fullStatusList]);
      if(this.searchStrS != '')
        this.statusList = _listToFilter.filter(item => item.Label.toLowerCase().indexOf(this.searchStrS.toLowerCase()) != -1);
      else
        this.statusList = _listToFilter;

      this.statusList.sort( dynamicSortMultipleProps('Label') );
    },
    switchCategory(step) {
      this.checkValidCategoryName().then(changed => {
        if(changed) this.editCategoryName();
        this.currentCategoryIndex += step;
        this.currentCategoryName   = this.categoryList[this.currentCategoryIndex].Name;
      });
    },
    gotoCategory(index) {
      this.checkValidCategoryName().then(isChanged => {
        if(isChanged) this.editCategoryName();
        this.currentCategoryIndex = index;
        this.currentCategoryName  = this.categoryList[this.currentCategoryIndex].Name;
      });
    },
    addNewCategory() {
      let _nameInput = document.getElementById('categoryName'),
          _empthyCategory = {
            'Id'         : -1,
            'Name'       : '',
            'Activities' : [],
            'Statuses'   : []
          };

      if(_nameInput !== null) {
        if(!_nameInput.readOnly && _nameInput.value != '')
          this.editCategoryName();
        else if(_nameInput.value == '') {
          this.addNotValid(_nameInput);
          setTimeout( _ => {
            this.removeNotValid();
          }, 800);
          return false;
        }
      }

      this.categoryList.push(_empthyCategory);
      this.currentCategoryIndex = this.categoryList.length - 1;
      this.currentCategoryName  = this.categoryList[this.currentCategoryIndex].Name;
      setTimeout( _ => {
        this.editCategoryName();
      },100);
    },
    checkValidCategoryName() {
      return new Promise(resolve => {
        let _input = document.getElementById('categoryName');
        if(_input.value == '') {
          this.addNotValid(_input);
          setTimeout( _ => {
            this.removeNotValid();
          }, 800);
        } else {
          resolve(!_input.readOnly);
        }
      });
    },
    addNotValid(field) {
      field.classList.add('notValid');
    },
    removeNotValid() {
      document.querySelectorAll('.notValid').forEach(el => el.classList.remove('notValid'));
    },
    editCategoryName() {
      let _input = document.getElementById('categoryName'),
          _btn   = document.getElementById('categoryEditBtn');

      this.isChanged = true;

      if(_input.readOnly) {
        _btn.innerHTML   = '&#xF193';
        _btn.classList.add('rtamapping__edit-btns--save');
        _input.readOnly  = false;
        _input.focus();
      } else {
        if(_input.value != '') {
          this.categoryList[this.currentCategoryIndex].Name = _input.value;
          _input.blur();
          _btn.innerHTML   = '&#xF3EB';
          _btn.classList.remove('rtamapping__edit-btns--save');
          _input.readOnly  = true;
        } else {
          this.checkValidCategoryName().then();
        }
      }
    },
    deleteCategory() {
      this.confirm.hide();
      this.showLoader(true);
        IPCCCConfigurator.Request(this.customerId, 'rtaactivitymap', 'delete', null, this.categoryList[this.currentCategoryIndex].Id).then(succes => {
        this.retrieveStatusses(this.categoryList[this.currentCategoryIndex].Statuses).then(() => {
          this.isChanged = true;
          this.categoryList[this.currentCategoryIndex].Statuses = [];

          this.retriveActivities(this.categoryList[this.currentCategoryIndex].Activities).then(() => {
            this.categoryList[this.currentCategoryIndex].Activities = [];

            this.categoryList.splice(this.currentCategoryIndex, 1);

            if(this.currentCategoryIndex > 0) {
              this.currentCategoryIndex--;
              this.currentCategoryName  = this.categoryList[this.currentCategoryIndex].Name;
            } else if(this.currentCategoryIndex == 0 && this.currentCategoryIndex < this.categoryList.length) {
              this.currentCategoryIndex++;
              this.currentCategoryName  = this.categoryList[this.currentCategoryIndex].Name;
            } else {
              this.currentCategoryIndex = 0;
              this.currentCategoryName  = '';
            }
            this.isChanged = false;
            this.showLoader(false);
          })
        });
      }).catch(error => {
        console.log('Error:', error);
      });
    },
    retrieveStatusses(objectToClean) {
      return new Promise(resolve => {
        objectToClean.map((item, index) => {
          this.statusList.push({
            'StatusId' : item.Id,
            'Label'    : item.Name
          });
        });
        this.statusList.sort( dynamicSortMultipleProps('Label') );
        resolve();
      });
    },
    retriveActivities(objectToClean) {
      return new Promise(resolve => {
        objectToClean.map((item, index) => {
          this.activityList.push(item);
        });
        this.activityList.sort( dynamicSortMultipleProps('Name') );
        resolve();
      });
    },
    addActivity(index) {
      this.isChanged = true;
      this.activityList[index].IsDefault = (this.categoryList[this.currentCategoryIndex].Activities.length == 0);
      this.categoryList[this.currentCategoryIndex].Activities.push(this.activityList[index]);
      this.activityList.splice(index, 1);
    },
    removeActivity(index) {
      this.isChanged  = true;
      this.categoryList[this.currentCategoryIndex].Activities[index].IsDefault = false;
      this.activityList.push(this.categoryList[this.currentCategoryIndex].Activities[index]);
      this.categoryList[this.currentCategoryIndex].Activities.splice(index, 1);
      this.activityList.sort( dynamicSortMultipleProps('Name') );
      let _hasDefault  = this.categoryList[this.currentCategoryIndex].Activities.filter( act => act.IsDefault == true );
      if(_hasDefault.length == 0 && this.categoryList[this.currentCategoryIndex].Activities.length > 0)
        this.categoryList[this.currentCategoryIndex].Activities[0].IsDefault = true;
    },
    addStatus(index) {
      this.isChanged = true;
      this.categoryList[this.currentCategoryIndex].Statuses.push({
        'Id'   : this.statusList[index].StatusId,
        'Name' : this.statusList[index].Label
      });
      this.statusList.splice(index, 1);
      this.categoryList[this.currentCategoryIndex].Statuses.sort( dynamicSortMultipleProps('Name') );
    },
    removeStatus(index) {
      this.isChanged = true;
      this.statusList.push({
        'StatusId' : this.categoryList[this.currentCategoryIndex].Statuses[index].ID,
        'Label'    : this.categoryList[this.currentCategoryIndex].Statuses[index].Name
      })
      this.categoryList[this.currentCategoryIndex].Statuses.splice(index, 1);
      this.statusList.sort( dynamicSortMultipleProps('Label') );
    },
    removeUsedStatus(srcList, distList) {
      let _resultList = [...distList];
      if(srcList.length > 0) {
        srcList.map(item => {
          if(item.Statuses.length > 0) {
            item.Statuses.map(_status => {
              let _index;
              _resultList.filter((_s, _i) => {
                if(_s.StatusId == _status.Id)
                  return _index = _i;
              });
              _resultList.splice(_index, 1);
            });
          }
        });
        return _resultList;
      }
    },
    removeUsedActivity(srcList, distList) {
      let _resultList = [...distList];
      if(srcList.length > 0) {
        srcList.map(item => {
          if(item.Activities.length > 0) {
            item.Activities.map(_activity => {
              let _index;
              _resultList.filter((_a, _i) => {
                if(_a.Id == _activity.Id)
                  return _index = _i;
              });
              _resultList.splice(_index, 1);
            });
          }
        });
        return _resultList;
      }
    },
    saveMapping() {
      let _isValid          = true,
          _notValidMessage  = '',
          _index            = 0;

      for(let cat of this.categoryList) {
        if(cat.Activities.length == 0 && cat.Statuses.length != 0) {
          _isValid         = false;
          _notValidMessage = this.$store.state.settings.rta.categoryactivitiesempthy;
          break;
        }

        if(cat.Activities.length != 0 && cat.Statuses.length == 0) {
          _isValid         = false;
          _notValidMessage = this.$store.state.settings.rta.categorystatusesempthy;
          break;
        }

        if(cat.Activities.length == 0 && cat.Statuses.length == 0) {
          _isValid         = false;
          _notValidMessage = this.$store.state.settings.rta.categoryempthy;
          break;
        }
        _index++;
      };

      if(_isValid) {
        this.checkValidCategoryName().then(changed => {
          this.showLoader(true);
          if(changed) this.editCategoryName();
          if(this.isChanged) {
              IPCCCConfigurator.Request(this.customerId, 'rtaactivitymap', 'save', this.categoryList, -1).then(succes => {
              this.categoryList          = [];
              this.categoryList          = succes;
              this.currentCategoryName   = this.categoryList[this.currentCategoryIndex].Name;
              this.rawStatusList         = this.removeUsedStatus(this.categoryList, [...this.fullStatusList]);
              this.statusList            = [...this.rawStatusList];
              this.statusList.sort( dynamicSortMultipleProps('Label') );
              this.rawActivityList       = this.removeUsedActivity(this.categoryList, [...this.fullActivityList]);
              this.activityList          = [...this.rawActivityList];
              this.activityList.sort( dynamicSortMultipleProps('Name') );
              this.isChanged             = false;
              this.showLoader(false);
            }).catch(error => {
              console.log('Error:', error);
            });
          }
        });
      } else {
        this.confirm.show(this.$store.state.settings.rta.categoryempthytitle, _notValidMessage, this.$store.state.settings.rta.categoryempthyicon, null);
        this.gotoCategory(_index);
      }
    },
  },
  mounted() {

    this.confirm = new cm_alert({
      type        : 'alert',
      position    : 'CC',
      onConfirm   : _ => this.deleteCategory(),
      hasCancel   : true,
      width       : 320,
      confirmLbl  : this.$store.state.settings.rta.deleteconfirmok,
      confirmCol  : '#EEEEEE',
      cancelLbl   : this.$store.state.settings.rta.deleteconfirmcancel,
      iconClass   : this.$store.state.settings.rta.deleteconfirmiconclass,
      hasModal    : true
    });

    this.customerId    = this.$store.state.loginSession.Details.CustomerId;

      IPCCCStatus.GetCompanyStatusList().then(success => {
      this.fullStatusList        = success;
        IPCCCConfigurator.Request(this.customerId, 'rtaactivity', 'readall', null, -1).then(result => {
        this.fullActivityList      = result;
            IPCCCConfigurator.Request(this.customerId, 'rtaactivitymap', 'readall', null, -1).then(result => {
          if(result.length != 0) {
            this.categoryList          = result;
            this.currentCategoryName   = this.categoryList[this.currentCategoryIndex].Name;
          } else {
            this.addNewCategory();
          }
          this.rawStatusList         = this.removeUsedStatus(this.categoryList, [...this.fullStatusList]);
          this.statusList            = [...this.rawStatusList];
          this.statusList.sort( dynamicSortMultipleProps('Label') );
          this.rawActivityList       = this.removeUsedActivity(this.categoryList, [...this.fullActivityList]);
          this.activityList          = [...this.rawActivityList];
          this.activityList.sort( dynamicSortMultipleProps('Name') );
          this.showLoader(false);
        }).catch(error => {
          console.log('Error:', error);
        });

      }).catch(error => {
        console.log('Error: ' + error);
      });


    }).catch(error => {
      console.log('Error:', error);
    });

    //For development
    // IPCCCConfigurator.Request(this.customerId, 'functionlist', 'readall', null, -1).then(result => {
    //   Object.keys(result).forEach(key => {
    //     console.log(key, '->', result[key].DataGroup + ':' + result[key].CRUD);
    //   });
    // }).catch(error =>{
    //   console.log('Error: ' + error);
    // });

    this.showLoader(false);

  }
}
</script>
