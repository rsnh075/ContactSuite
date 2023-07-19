<template>
  <div class="assetdetailcode-pannel" data-e2e="add-asset-detail-code">
    <header class="assetdetailcode-header">{{ $store.state.settings.assets.addassetdetailcodeheader }}</header>
      <article class="assetdetailcode-body">
        <form @valid="saveAssetDetailCode()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">
          <input type="hidden" data-revalidate="" data-reset="" ref="validationcontrol">
          <div class="form-textfield form-textfield--bground">
            <input type="text" name="assetdetailcodename" v-model="codeName" :placeholder="$store.state.settings.assets.addassetdetailcodenamelbl" :maxlength="maxCharsCode" :data-validate="codeRule" :data-message="$store.state.settings.assets.validateintcodeempty" @keyup="checkExistingCode($event)">
            <label for="assetdetailcodename" class="form-label form-label--hidden">{{ $store.state.settings.assets.addassetdetailcodenamelbl }}</label>
          </div>
        </form>
        <div class="assetdetailcode-predefined">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <label>{{ $store.state.settings.assets.codelistheader }}</label>
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.assets.searchtxt" @keyup="filterList()">
          </div>
          <ol class="codelist">
            <li v-for="code in codeList" :key="code.AssetDetailId"><span>{{ code.Code }}</span><span>({{ getAsset(code.AssetId) }})</span></li>
          </ol>
        </div>
      </article>
      <footer class="assetdetailcode-footer">
        <button class="assetdetailcode-footer__button" @click="cancel">{{ $store.state.settings.assets.btncancellabel }}</button>
        <button class="assetdetailcode-footer__button assetdetailcode-footer__button--primary js-submitbtn">{{ $store.state.settings.assets.btnsavelabel }}</button>
      </footer>
  </div>
</template>

<script>

  import { ValidateDir }     from './../../directives/validate';
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';
  import BoxProps, { ModalType } from '../../types/BoxProps';

  export default {
    name: 'AddAssetDetailCode',
    props: ['payload'],
    data: () => {
      return {
        codeName      : '',
        codeRule      : 'isNotEmptyNoWhiteSpaces',
        searchStr     : '',
        codeList      : [],
        maxCharsCode  : 50
      }
    },
    inject: ["showLoader", 'showModalDialog'],
    directives: {
      Validate        : ValidateDir
    },
    watch: {
      '$route' (to, from) {
        this.showLoader(false);
      }
    },
    methods: {
      cancel() {
        this.codeName  = '';
        this.searchStr = '';
        this.resetValidationOnForm();
        this.$emit('close');
      },
      saveAssetDetailCode() {
        if(this.codeName == '' || this.payload.customerId !== 1) {
          return;
        } else {
          let _saveObj = {
            Code          : this.codeName,
            Name          : this.codeName,
            Description   : this.codeName
          }
          IPCCCConfigurator.Request(this.payload.customerId, 'assetdetail', 'save', _saveObj, -1).then(success => {
            this.codeName  = '';
            this.searchStr = '';
            this.$emit('close');
          }).catch(error => {
            console.error(error);
            this.showModalDialog(new BoxProps(ModalType.Alert, settings.dialogalertheader, settings.statusmenu.notchangedmsg));
          });
        }
      },
      checkExistingCode(evt) {
        let _val = evt.target.value;
        if(this.payload.assetDetailCodes.findIndex(code => code.Code == _val) !== -1) {
          //isEmail is used to initiate false validation, so false is intended because code already exists
          this.codeRule = 'isEmail';
        } else {
          this.codeRule = 'isNotEmptyNoWhiteSpaces';
        }
      },
      resetValidationOnForm() {
        let _event = new Event('reset');
        this.$refs.validationcontrol.dispatchEvent(_event);
      },
      //=========================================================== START DISPLAY LIST METHODS
      getAsset(assetid) {
        return assetid > -1 ? this.payload.assetList.filter(el => el.AssetId == assetid)[0].Name : '-';
      },
      filterList() {
        this.codeList    = this.filterListOnString(this.payload.assetDetailCodes, this.searchStr.toLowerCase());
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list],
              _keys;
          return _rawList.filter(item => {
            _keys = item['Code'].toLowerCase().indexOf(str) != -1
            return _keys;
          });
        } else {
          return [...list];
        }
      },
      shakeIt() {
        let _elm = document.querySelector(".assetdetailcode-pannel");
        _elm.classList.add('detailscreen--shake');
        setTimeout(() => {
          _elm.classList.remove('detailscreen--shake');
        }, 1000);
      },
    },
    mounted() {
      this.filterList();
      this.showLoader(false);
    }
  }
</script>

<style lang="scss" scoped>

  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals";

  .assetdetailcode-pannel {
    position: relative;
    width: 520px;
    padding: 30px;
  }

  .assetdetailcode-header {
    position: relative;
    display: block;
    height: 36px;
    line-height: 36px;
    padding: 0;
    border-radius: 3px 3px 0 0;
    color: globals.$color-gray60;
    font-size: 1.25em;
    border-bottom: 1px solid globals.$color-gray20;
  }

  .assetdetailcode-body {
    position: relative;
    display: block;
    color: globals.$color-gray80;
    padding: 25px 0;
    .codelist {
      width: 100%;
      height: 20vh;
      overflow: auto;
      font-size: 0.9rem;
      li {
        display: block;
        // color: $color-help;
        height: 35px;
        line-height: 35px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        cursor: pointer;
        &:before {
          content: '- ';
        }
        span:last-of-type {
            padding: 0 0 0 .5rem;
            color: globals.$color-gray20;
        }
      }
    }
  }

  .assetdetailcode-footer {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding: 0;
    height: 40px;
    line-height: 40px;
  }

  .assetdetailcode-footer__button {
    position: relative;
    padding: 5px 20px;
    background-color: globals.$color-gray5;
    color: globals.$color-gray40;
    box-shadow: none;
    border-radius: 3px;
    box-shadow: 0 1px 1px 0 rgba(0,0,0,.2);
    cursor: pointer;
    user-select: none;
    text-decoration: none;
    transition: box-shadow .2s;
    min-width: 100px;
    margin-left: 10px;
    font-size: 16px;
    &--primary {
      background-color: globals.$color-green;
      color: globals.$color-white;
      &:hover {
        box-shadow: 0 2px 5px 0 rgba(0,0,0,.2);
        background-color: functions.tint(globals.$color-green, 5%);
      }
    }

  }

  .assetdetailcode-predefined {
    margin-top: 20px;
    label {
      width: 100%;
      display: block;
      color: globals.$color-gray35;
      font-family: 'Open Sans SemiBold', sans-serif;
      font-size: .7em;
      padding-bottom: 10px;
    }
    .form-textfield--search {
      padding: 0;
      margin-bottom: 20px;
      &:before {
        top: 75%;
      }
    }
  }

</style>