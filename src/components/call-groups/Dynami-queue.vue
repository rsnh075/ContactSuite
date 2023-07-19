<template>
  <div data-e2e="dynamiq-queue">
    
    <div class="grid-row">
      <div class="grid-unit--alpha">
        <div class="list-number-header list-number-header--comp-scrollbar">
          <span class="list-number-header__field list-number-header__field--25width">{{ $store.state.settings.dynamiq.queuecollheads[0] }}</span>
          <span class="list-number-header__field list-number-header__field--20width">{{ $store.state.settings.dynamiq.queuecollheads[1] }}</span>
          <span class="list-number-header__field list-number-header__field--33width">{{ $store.state.settings.dynamiq.queuecollheads[2] }}</span>
          <button type="button" :disabled="isreadonly && maxSupportgroups" @click="addSupportGroup()" class="list-number-header__button--add">{{ $store.state.settings.dynamiq.addsupportgroup }}</button>
        </div>
        <ul class="list-number-wrapper">
          <li v-for="(supportgroup, index) in queuedetail.SupportGroups" class="list-number-line list-number-line--nohandle" :key="index">
            <select class="list-number-line__select list-number-line__select--25width" v-model="supportgroup.OverflowGroupId" @change="changeSupportGroup(index, supportgroup.OverflowGroupId)" disabled>
              <option value="-1" selected disabled>{{ $store.state.settings.dynamiq.formselectsupgroupdefault }}</option>
              <option v-for="routinggroup in rgrouplist" :key="routinggroup.Id" :value="routinggroup.Id" :disabled="isSupGroup(routinggroup.Id)">{{ routinggroup.Titel }}</option>
            </select>
            <input type="text" class="list-number-line__field list-number-line__field--20width" v-model="supportgroup.OverflowTimeout" disabled>
            <input type="text" class="list-number-line__field list-number-line__field--33width" :value="supportgroup.OverflowThreshold" readonly disabled>
            <span class="list-number--icon">
              <a :class="['button__icon', 'button__icon--edit', {'button__icon--disabled' : isreadonly}]" @click="editSupportGroup($event)">&#xF3EB;</a>
              <a v-if="rightToCRUDSupportGroup" :class="['button__icon', 'button__icon--delete', {'button__icon--disabled' : isreadonly}]" @click="deleteSupportGroup(index)">&#xF1C0;</a>
            </span>
          </li>
        </ul>
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextsupportgroups }}</div>
      </div>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.dynamiq.formprioownqueueunit}">
          <input :readonly="isreadonly" type="text" name="queuePrioOwnQueue" id="queuePrioOwnQueue" v-model="queuedetail.OverFlowThreshold" :data-validate="setValidation('isNumber')" :data-message="$store.state.settings.dynamiq.validateprioownqueue" @keydown="checkIsNumber($event, 'OverFlowThreshold')">
          <label for="queuePrioOwnQueue" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formprioownqueue }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextprioownqueue }}</div>
        </div>
      </div>
      <div class="grid-unit--beta"></div>
    </div>

  </div>
</template>


<script>
  import * as Mask         from './../../utils/cm_mask';
  import { UnitsLabel }    from './../../directives/unitslabel';

  export default {
    name: 'DynamiQueue',
    props: ['showhelp', 'queuedetail', 'isreadonly', 'isactive', 'rgrouplist', 'rightToCRUDSupportGroup'],
    data: () => {
      return {
        currentEditableLine      : null,
      }
    },
    directives: {
      unitslabel : UnitsLabel,
    },
    computed: {
      maxSupportgroups() {
        return this.queuedetail.SupportGroups.length >= 5;
      },
      setValidation() {
        return type => {
           return this.isactive ? type : type + '_skip';
        }
      }
    },
    methods: {
      addSupportGroup() {
        let _newSupportGroup = {
          OverflowGroupId          : -1,
          OverflowGroupTitle       : '',
          OverflowOffered          : false,
          OverflowThreshold        : 0,
          OverflowThresholdSeconds : 0,
          RoutinggroupId           : this.queuedetail.Id
        };
        this.queuedetail.SupportGroups.push(_newSupportGroup);
      },
      changeSupportGroup(index, selectedID) {
        let _rgTitle     = this.rgrouplist.filter(el => el.Id == selectedID)[0].Titel,
            _rgThreshold = this.rgrouplist.filter(el => el.Id == selectedID)[0].OverflowThresholdSeconds;

        this.queuedetail.SupportGroups[index].OverflowGroupTitle       = _rgTitle;
        this.queuedetail.SupportGroups[index].OverflowThreshold        = _rgThreshold;
        this.queuedetail.SupportGroups[index].OverflowThresholdSeconds = _rgThreshold;
      },
      deleteSupportGroup(index) {
        this.queuedetail.SupportGroups.splice(index, 1);
      },
      editSupportGroup(evt) {
        let _target       = evt.target,
            _parent       = _target.parentElement.parentElement,
            _parentActive = _parent.classList.contains('list-number-line--status-edit'),
            _list         = _parent.parentElement;

        //sortables[0].options.disabled = true;

        if( this.currentEditableLine != null) {
          this.currentEditableLine.classList.remove('list-number-line--status-edit');
          this.currentEditableLine.querySelector('SELECT').disabled = true;
          this.currentEditableLine.querySelectorAll('INPUT').forEach((_input) => {
            _input.disabled = true;
          });
          this.currentEditableLine.querySelector('SELECT').disabled = true;
        }

        if(this.currentEditableLine == _parent && _parentActive) {
          //sortables[0].options.disabled = false;
        } else {
          _parent.classList.add('list-number-line--status-edit');
          _parent.querySelector('SELECT').disabled = false;
          _parent.querySelectorAll('INPUT').forEach((_input) => {
            _input.disabled = false;
          });
        }
 
        this.currentEditableLine = _parent;
      },
      isSupGroup(id) {
        if(this.queuedetail.SupportGroups.filter(el => el.OverflowGroupId == id).length > 0)
          return true;
        else
          return false;
      },
      checkIsNumber(evt, prop) {
        if(evt.target.readOnly == false)
          this.queuedetail[prop] = Mask.isNumberMask(evt);
      }
    },
    mounted() {
    }
  }
</script>
