<template>
  <div  data-e2e="dynamiq-treshold">
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.dynamiq.formsecunit}">
          <input :readonly="isreadonly" type="text" name="callTime" :placeholder="$store.state.settings.dynamiq.formcalltime" v-model="queuedetail.NormalCallTime" :data-validate="setValidation('isNotEmptyNr')" :data-message="$store.state.settings.dynamiq.validatecalltime" @keydown="checkIsNumber($event, 'NormalCallTime')">
          <label for="callTime" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formcalltime }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextcalltime }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.dynamiq.formsecunit}">
          <input :readonly="isreadonly" type="text" name="slaseconds" :placeholder="$store.state.settings.dynamiq.formslaseconds" v-model="queuedetail.SLASeconds" :data-validate="setValidation('isNotEmptyNr')" :data-message="$store.state.settings.dynamiq.validateslaseconds" @keydown="checkIsNumber($event, 'SLASeconds')">
          <label for="slaseconds" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formslaseconds }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextslaseconds }}</div>
        </div>
      </div>
    </div>
    <div class="grid-row">
      <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.dynamiq.waittimetxt }}</h2>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.dynamiq.formsecunit}">
          <input :readonly="isreadonly" type="text" name="waitTimeAvg" :placeholder="$store.state.settings.dynamiq.formwaittimeavg" v-model="queuedetail.AvgWaitingTime" :data-validate="setValidation('isNotEmptyNr')" :data-message="$store.state.settings.dynamiq.validatewaittimeavg" @keydown="checkIsNumber($event, 'AvgWaitingTime')">
          <label for="waitTimeAvg" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formwaittimeavg }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextwaittimeavg }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground">
          <input :readonly="isreadonly" type="text" name="waitCountAvg" :placeholder="$store.state.settings.dynamiq.formwaitcountavg" v-model="queuedetail.AvgWaitingCount" :data-validate="setValidation('isNotEmptyNr')" :data-message="$store.state.settings.dynamiq.validateaitcountavg" @keydown="checkIsNumber($event, 'AvgWaitingCount')">
          <label for="waitCountAvg" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formwaitcountavg }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextwaitcountavg }}</div>
        </div>
      </div>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.dynamiq.formsecunit}">
          <input :readonly="isreadonly" type="text" name="waitTimePressure" :placeholder="$store.state.settings.dynamiq.formwaittimepressure" v-model="queuedetail.BusyWaitTime" :data-validate="setValidation('isNotEmptyNr')" :data-message="$store.state.settings.dynamiq.validatewaittimepressure" @keydown="checkIsNumber($event, 'BusyWaitTime')">
          <label for="waitTimePressure" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formwaittimepressure }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextwaittimepressure }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground">
          <input :readonly="isreadonly" type="text" name="waitCountPressure" :placeholder="$store.state.settings.dynamiq.formwaitcountpressure" v-model="queuedetail.BusyWaitCount" :data-validate="setValidation('isNotEmptyNr')" :data-message="$store.state.settings.dynamiq.validatewaitcountpressure" @keydown="checkIsNumber($event, 'BusyWaitCount')">
          <label for="waitCountPressure" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formwaitcountpressure }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helpwaitcountpressure }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import * as Mask         from './../../utils/cm_mask';
  import { UnitsLabel }    from './../../directives/unitslabel';

  export default {
    name: 'DynamiqThreshold',
    props: ['showhelp', 'queuedetail', 'isreadonly', 'isactive'],
    data: () => {
      return {

      }
    },
    directives: {
      unitslabel : UnitsLabel,
    },
    computed: {
      setValidation() {
        return type => {
           return this.isactive ? type : type + '_skip';
        }
      }
    },
    methods: {
      checkIsNumber(evt, prop) {
        if(evt.target.readOnly == false)
          this.queuedetail[prop] = Mask.isNumberMask(evt);
      }
    },
    mounted() {
    }
  }

</script>
