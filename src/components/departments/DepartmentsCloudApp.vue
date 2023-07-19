<template>
  <div data-e2e="departments-cloud-app">
    <div class="grid-row">
      <div class="grid-unit--alpha">
        <label class="typo-input-label typo-input-label--h20">{{ $store.state.settings.departments.cloudapplbl }}</label>
        <div class="form-radio-small form-radio-small--inline">
          <input type="radio" id="cloudapp_radio_one" v-model="datadetail.ShowCloudApp" value="false">
          <label for="cloudapp_radio_one">{{ $store.state.settings.departments.cloudappOff }}</label>
        </div>
        <div class="form-radio-small form-radio-small--inline">
          <input type="radio" id="cloudapp_radio_two" v-model="datadetail.ShowCloudApp" value="true">
          <label for="cloudapp_radio_two">{{ $store.state.settings.departments.cloudappOn }}</label>
        </div>
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.departments.helptextcloudapp }}</div>
      </div>
    </div>  
    <div class="grid-row">
      <div class="grid-unit--alpha">
        <label class="typo-input-label typo-input-label--h30">{{ $store.state.settings.departments.previewurlplusparameterslbl }}</label>
        <span class="previewCloudAppUrl">{{ datadetail.CloudAppUrl }}{{ hasQuestionMark }}{{ datadetail.CloudAppParameters }}</span>
      </div>
      <div class="grid-unit--alpha">
        <div class="form-textfield form-textfield--bground">
          <!-- <input type="text" name="cloudappurl" id="cloudappurl" v-model="datadetail.CloudAppUrl" :placeholder="$store.state.settings.departments.cloudappurlplaceholder" :data-validate="setValidation('isNotEmpty')" :data-message="$store.state.settings.departments.validatecloudappurl"> -->
          <input type="text" name="cloudappurl" id="cloudappurl" v-model="datadetail.CloudAppUrl" :placeholder="$store.state.settings.departments.cloudappurlplaceholder">
          <label for="cloudappurl" class="form-label form-label--hidden">{{ $store.state.settings.departments.cloudappurllbl }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.departments.helptextcloudappurl }}</div>
        </div>
      </div>
      <div class="grid-unit--alpha">
        <ol class="urllist-wrapper__header">
          <li class="urllist-line">
            <span>{{ $store.state.settings.departments.parameterlbl }}</span>
            <span>{{ $store.state.settings.departments.getnamelbl }}</span>
          </li>
        </ol>
        <ol :class="['urllist-wrapper', {'urllist-wrapper--disabled' : !datadetail.ShowCloudApp}]">
          <li v-for="(line, index) in parameterlist" class="urllist-line" :key="index">
            <span>
              <input type="text" v-model="line.paraname" @keyup="setCloudAppParameters()" :data-index="index"/>
            </span>
            <span>{{ line.valuename }}</span>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'DepartmentsCloudApp',
    props: {
      visibility : {
        type : Boolean,
        default : false
      },
      datadetail : {
        type : Object,
        default : {}
      },
      showhelp  : {
        type    : Boolean,
        default : false
      },
      parameterlist : {
        type : Array,
        default : []
      },
      isactive : {
        type : Boolean,
        default : false
      }
    },
    data() {
      return {
      }
    },
    computed: {
      hasQuestionMark() {
        return this.datadetail.CloudAppParameters.length > 0 ? '?' : '';
      },
      setValidation() {
        return type => {
          return this.isactive ? type : type + '_skip';
        }
      }
    },
    methods: {
      setCloudAppParameters() {
        let _parameterliststr = this.parameterlist;
         _parameterliststr = this.parameterlist.reduce((qStr, element) => {
          if(element.paraname !== '') {
            qStr.push(`${element.paraname}=%${element.valuename}%`)
          }
          return qStr;
        }, []);
        this.datadetail.CloudAppParameters = _parameterliststr.join('&');
      },
    }
  }
</script>

<style lang="scss" scoped>
  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals";

  .urllist-wrapper {
    position: relative;
    width: 100%;
    height: 165px;
    border: 1px solid transparent;
    border-color: globals.$color-gray30 transparent;
    overflow: hidden;
    // overflow-y: scroll;
    &__header {
      overflow: hidden;
      width: calc(100% - 17px);
      height: 35px;
      color: globals.$color-gray35;
      font-family: 'Open Sans SemiBold', sans-serif;
      font-size: .7rem;
      span {
        height: 35px;
        line-height: 35px;
        padding: 0 3px;
      }
    }
  }

  .urllist-line {
    position: relative;
    width: 100%;
    height: 40px;
    span {
      float: left;
      display: block;
      width: 50%;
      height: 40px;
      line-height:  40px;
      font-size: .9rem;
      color: globals.$color-gray50;
      padding: 0 3px;
    }
    &:nth-child(even) {
      background-color: globals.$color-gray2;
    }
    input {
      width: 90%;
      height: 36px;
      line-height: 36px;
      border: none;
      border-bottom: 1px solid globals.$color-gray35;
      background-color: transparent;
      padding-left: 3px;
      padding-top: 10px;
      resize:none;
      color: globals.$color-gray60;
      font-size: 1rem;
    }
  }

  .urllist-wrapper--disabled {
    opacity: .6;
    user-select: none;
    pointer-events: none;
    input {
      pointer-events: none;
      user-select: none;
    }
  }

  .previewCloudAppUrl {
    padding-left: 3px;
    color: globals.$color-home;
    font-size: .9rem;
    word-wrap: break-word;
    overflow: hidden;
  }
</style>
