<template>
    <div v-if="visible" :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : visible}]" id="calldivider" data-e2e="call-divider-detail">
        <div id="detailscreen" class="detailscreen">
            <a :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a>
            <a class="button__icon button__icon--top-right-corner" @click="toggleEdit()">&#xF3EB;</a>
            <div class="grid-row">
                <div class="grid-unit--alpha detailscreen-wrapper__title">
                    <span class="detailscreen__title">{{ showTitle }}</span>
                </div>
            </div>
            <form @valid="saveDetail()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">

                <div class="grid-row">
                    <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground">
                            <input type="text" name="formname" id="formname" v-model="screenData.Name" :disabled="dataOperation == 'readone'" @keyup="checkName($event.target.value)" :placeholder="$store.state.settings.calldivider.nameplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.calldivider.validatename">
                            <label for="formname" class="form-label form-label--hidden">{{ $store.state.settings.calldivider.formname }}</label>
                            <div class="hidden-validation">
                                <input type="hidden" :value="screenData.Name" :data-validate="isExistingNameReg" :data-message="$store.state.settings.calldivider.validateexistingname">
                            </div>
                        </div>
                    </div>
                    <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground">
                            <input type="text" name="formdescription" id="formdescription" v-model="screenData.Description" :placeholder="$store.state.settings.calldivider.descriptionplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.calldivider.validatedescription">
                            <label for="formdescription" class="form-label form-label--hidden">{{ $store.state.settings.calldivider.formdescription }}</label>
                        </div>
                    </div>
                </div>

                <div class="grid-unit--alpha">
                    <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && visible)}]">{{ $store.state.settings.calldivider.helptextnamedescription }}</div>
                </div>

                <div class="grid-row">
                    <div class="grid-unit--alpha dataset__row--calldivider">
                        <div class="dataset__cell" v-for="(dataCell, index) in selectedDataCells" :key="'caldividerrow_' + index">
                            <div class="dataset__cell-bodywrapper">
                                <input type="text" class="dataset__cell-label" v-model="dataCell.ExitLabel" :disabled="!editMode" :placeholder="$store.state.settings.calldivider.labelplaceholder">
                                <input type="number" class="dataset__cell-percentage" v-model="dataCell.Percentage" @keydown="removeUnwantedChars($event)" :placeholder="$store.state.settings.calldivider.percentageplaceholder">
                                <span class="dataset__cell-percentagelabel">%</span>
                            </div>
                            <span v-show="editMode" class="dataset__cell-button" @click="removeDataCell(index)">&#xF156;</span>
                        </div>
                        <div v-show="editMode" class="dataset__cell dataset__cell--add" v-if="selectedDataCells.length < maxDataCells">
                            <div class="dataset__cell-bodywrapper">
                                <input type="text" class="dataset__cell-label" disabled :placeholder="$store.state.settings.calldivider.labelplaceholder">
                                <input type="number" class="dataset__cell-percentage" disabled :placeholder="$store.state.settings.calldivider.percentageplaceholder">
                            </div>
                            <span class="dataset__cell-button" @click="addDataCell()">&#xF419;</span>
                        </div>
                        <div v-show="editMode && index != 0" class="dataset__cell dataset__cell--available" v-for="(availableDataCell, index) in availableDataCells">
                            <div class="dataset__cell-bodywrapper">
                                <input type="text" class="dataset__cell-label" disabled :placeholder="$store.state.settings.calldivider.labelplaceholder">
                                <input type="number" class="dataset__cell-percentage" disabled :placeholder="$store.state.settings.calldivider.percentageplaceholder">
                            </div>
                            <span class="dataset__cell-button">&#xF419;</span>
                        </div>
                        <div class="hidden-validation">
                            <input type="hidden" v-model="maxPercentage" data-validate="isNotOverAHundred" :data-message="$store.state.settings.calldivider.validatemaxpercentages">
                        </div>
                    </div>
                </div>

                <div class="grid-unit--alpha">
                    <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && visible)}]">{{ $store.state.settings.calldivider.helptextdatacells }}</div>
                </div>

            </form>
            <!-- BUTTONS -->
            <div class="detailscreen-footer detailscreen-footer--inside">
                <span>
                    <a class="button-primary button-primary--delete" @click="deleteDetail()">{{ $store.state.settings.calldivider.deletebtnlbl }}</a>
                </span>
                <span class="grid--push">
                    <a class="button-primary button-primary--gray" @click="closeDetail()">{{ $store.state.settings.calldivider.closebtnlbl }}</a>
                    <a class="button-primary js-submitbtn">{{ $store.state.settings.calldivider.savebtnlbl }}</a>
                </span>
            </div>

        </div>
    </div>
</template>

<script>

  import { ValidateDir } from './../../directives/validate';
  import * as Mask       from './../../use/mask';

  export default {
    name: 'CallDividerDetail',
    props: ['visible', 'data', 'existingNamesList', 'dataOperation'],
    data: () => {
      return {
        showHelp           : false,
        editMode           : false,
        maxDataCells       : 4,
        screenData         : {
          Name             : '',
          Description      : '',
          ExitPercentages  : []
        },
        selectedDataCells  : [],
        isExistingName     : false,
      }
    },
    inject: ['showLoader'],
    directives: {
      Validate : ValidateDir
    },
    watch: {
      visible: function(newVal, oldVal) {
        if(newVal && this.data !== null) {
          this.screenData = {...this.data};
          this.selectedDataCells = [...this.data.ExitPercentages];
        }
      }
    },
    computed: {
      showTitle() {
        return this.screenData.Name.length > 0 ? this.screenData.Name : this.$store.state.settings.calldivider.newnameplaceholder;
      },
      availableDataCells() {
        let _availableDataCells = [];
        for (let i = 0; i < (this.maxDataCells - this.selectedDataCells.length); i++) {
          _availableDataCells.push('availableDataCell')
        }
        return _availableDataCells;
      },
      maxPercentage() {
        return this.selectedDataCells.reduce((acc, el) => {
          return acc + parseInt(el.Percentage);
        }, 0);
      },
      isExistingNameReg() {
        return this.isExistingName ? 'isNumber' : 'isAll';
      }
    },
    methods: {
      saveDetail() {
        this.screenData.ExitPercentages = [];
        this.screenData.ExitPercentages = this.selectedDataCells; //GAt dit goed?
        this.screenData.ExitPercentages.forEach((el, index) => {
          el.Percentage = parseInt(el.Percentage);
          el.ExitId = index;
        });
        this.$emit('save', this.screenData);
        this.resetScreen();
      },
      deleteDetail() {
        this.$emit('delete', this.screenData);
        this.resetScreen();
      },
      closeDetail() {
        this.$emit('close');
        this.resetScreen();
      },
      removeDataCell(indx) {
        this.selectedDataCells.splice(indx, 1);
      },
      addDataCell() {
        const _newDataCell = {
          CallCount        : 0,
          ExitId           : -1,
          ExitLabel        : '',
          Percentage       : '',
        };
        this.selectedDataCells.push(_newDataCell);
      },
      //==========================================HELPER FUNCTIONS
      checkName(name) {
        if(this.dataOperation !== 'readone') {
          const _name = name.toLowerCase();
          this.isExistingName = this.existingNamesList.indexOf(_name) !== -1;
        }
      },
      removeUnwantedChars(e) {
        return e.keyCode !== 69;
      },
      resetScreen() {
        this.editMode = false;
      },
      toggleEdit() {
        this.editMode = !this.editMode;
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
      }
    },
    mounted() {
    }
  }

</script>

<style lang="scss">

  @use "@/scss/includes/globals";

  #calldivider {
    .dataset__row--calldivider {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      grid-gap: 10px;
      align-items: start;
      .dataset__cell {
        padding: 16px 10px 16px 10px;
        border-radius: 3px;
        box-shadow: 1px 1px 2px 0 rgba(0, 0, 0, .2);
        &--add {
          color: globals.$color-gray60;
          box-shadow: none;
          border: dashed 2px globals.$color-gray20;
          .dataset__cell-button {
            font-size: 1.45rem;
            color: globals.$color-secondary;
          }
        }
        &--available {
          color: globals.$color-gray20;
          box-shadow: none;
          border: dashed 2px globals.$color-gray10;
          .dataset__cell-button {
            font-size: 1.45rem;
            cursor: default;
          }
        }
      }
      .dataset__cell-bodywrapper {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        width: calc(100% - 50px);
        input {
          width: 100%;
          font-family: 'Open Sans Regular', sans-serif;
          height: 1.25rem;
          line-height: 1.25rem;
          border: none;
          border-bottom: 1px solid globals.$color-gray35;
          background-color: transparent;
          padding-left: 3px;
          resize: none;
          color: globals.$color-gray60;
          font-size: 1rem;
          &.dataset__cell-percentage {
            margin-top: 5px;
          }
          &.dataset__cell-label:disabled {
            color: globals.$color-gray35;
            font-size: .7rem;
            font-family: 'Open Sans SemiBold', sans-serif;
          }
          &:disabled {
            border-bottom: none;
          }
        }
      }
      .dataset__cell-label,
      .dataset__cell-percentage {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .dataset__cell-percentagelabel {
        position: absolute;
        margin-top: 5px;
      }
      .dataset__cell-button {
        display: inline-block;
        vertical-align: middle;
        border-radius: 50%;
        font-size: 0.8rem;
        font-family: 'Material Design Icons';
        font-weight: normal;
        font-style: normal;
        width: 40px;
        text-align: right;
        cursor: pointer;
      }
    }
  }

</style>
