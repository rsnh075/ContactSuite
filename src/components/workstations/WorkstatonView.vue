<template>
  <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : visibility}]" data-e2e="work-station-view">
    <div v-if="workstationData != null" class="detailscreen" ref="detailscreen">
      <!-- <a :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a> -->
      <div class="grid-row">
        <div class="grid-unit--gamma--double detailscreen-wrapper__title">
          <span class="detailscreen__title">{{ header }}</span>
        </div>
        <div class="grid-unit--gamma">
            <span class="detailscreen__title detailscreen__title--right detailscreen__title--small">#{{ workstationData.Id }}</span>
          </div>
      </div>
      <form @valid="saveWorkstation()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">
        <div class="grid-row">
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--bground">
              <input type="text" name="workstationName" id="workstationName" v-model="workstationData.Name" :placeholder="$store.state.settings.workstations.nameplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.workstations.validatename">
              <label for="detailName" class="form-label form-label--hidden">{{ $store.state.settings.workstations.namelbl }}</label>
            </div>
          </div>
          <!--
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--bground">
              <input type="text" name="formdescription" id="formdescription" v-model="workstationData.description" :placeholder="$store.state.settings.workstations.descriptionplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.workstations.validatedescription">
              <label for="formdescription" class="form-label form-label--hidden">{{ $store.state.settings.workstations.descriptionlbl }}</label>
            </div>
          </div>
        </div>
        <div class="grid-row">
          -->
          <div class="grid-unit--beta">
            <div class="form-selectfield form-selectfield--no-margin">
              <label for="numberlabel" class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.workstations.numberlbl }}</label>
              <select id="numberlabel" name="numberlabel" v-model="workstationData.number">
                <option value="">{{ $store.state.settings.workstations.defaultsnumberlbl }}</option>
                <option v-for="number in numberList" :key="number.Address" :value="number.Address">{{ number.Address }}</option>
              </select>
            </div>
          </div>
        </div>
      </form>
      <!-- BUTTONS -->
      <div class="detailscreen-footer detailscreen-footer--inside">
        <div class="grid-unit--alpha">
          <span>
            <a class="button-primary button-primary--delete" @click="deleteWorkstation()">{{ $store.state.settings.workstations.deletelbl }}</a>
          </span>
          <span class="grid--push">
            <a class="button-primary button-primary--gray" @click="closeWorkstation()">{{ $store.state.settings.workstations.cancellbl }}</a>
            <a class="button-primary js-submitbtn" :disabled="readonly">{{ $store.state.settings.workstations.savelbl }}</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import { ValidateDir }  from './../../directives/validate';
  import { dynamicSort }  from './../../use/sortFunctions';
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';

  export default {
    name: 'WorkstationView',
    props: {
      visibility : {
        type : Boolean,
        default : false
      },
      data : {
        type : Object,
        default : null
      },
      customerid : {
        type : Number,
        default : -1
      }
    },
    directives: {
      Validate : ValidateDir
    },
    data() {
      return {
        numberList      : [],
        workstationData : this.data,
        header          : '',
        // showHelp        : false,
        readonly        : true,
      }
    },
    inject: ['showLoader'],
    watch: {
      '$route' (to, from) {
        this.showLoader(false);
      },
      visibility: function(newStatus, oldStatus) {
        if(oldStatus !== newStatus && newStatus) {
          this.workstationData = {...this.data};
          this.header          = this.workstationData.Id !== -1 ? this.$store.state.settings.workstations.headeredit : this.$store.state.settings.workstations.headernew;
          this.getNumbers();
        }
      }
    },
    methods: {
    //   displayHelp() {
    //     this.showHelp = !this.showHelp;
    //   },
      shakeIt() {
        let _elm = this.$refs.detailscreen;
        _elm.classList.add('detailscreen--shake');
        setTimeout(() => {
          _elm.classList.remove('detailscreen--shake');
        }, 1000);
      },
      getNumbers() {
        this.showLoader(true);
        IPCCCConfigurator.Request(this.customerid, 'UserAvailablePhones', 'list', null, -1)
            .then(response => {
          this.numberList = [...response];
          if(this.workstationData.number.length > 0)
            this.numberList = [...this.numberList, {Address: this.workstationData.number, Type : 1}];
          this.numberList.sort(dynamicSort('Address'));
          this.showLoader(false);
        }).catch(error => {
          this.showLoader(false);
          console.error('Error: ' + error);
        });
      },
      saveWorkstation() {
        this.$emit('save', this.workstationData);
      },
      deleteWorkstation() {
        this.$emit('delete', this.workstationData.Id);
      },
      closeWorkstation() {
        this.$emit('cancel');
      },
    },
    mounted() {
      this.showLoader(false);
    }
  }
</script>
