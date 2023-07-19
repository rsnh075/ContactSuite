<template>
  <div data-e2e="license">
    <!-- DIALOG CONFIRM -->
    <div :class="['dialog__modal', {'dialog__modal--open' : showDialog}]">
      <div :class="['dialog__window', 'dialog__window--w500', {'dialog__window--open' : showDialog}]" id="dialog-window">
        <div class="dialog__window-header dialog__window-header--important dialog__window-header--transparent">
          <span>{{ $store.state.settings.license.deletelicenseconformationheader }}</span>
        </div>
        <div class="dialog__window-body">
          <div class="grid-row" v-if="licenceIndexToToggle != -1">
            <div v-if="roleList.length > 0">
              <p v-html="$store.state.settings.license.deletelicensewithroles01 + '&nbsp;' + licenseList[licenceIndexToToggle].Name  + '&nbsp;' + $store.state.settings.license.deletelicensewithroles02"></p>
              <ul class="dialog__window-body-list">
                <li v-for="role in roleList">{{ role.Name }}</li>
              </ul>
            </div>
            <div v-else>
              <p v-html="$store.state.settings.license.deletelicensewithnoroles01 + '&nbsp;' + licenseList[licenceIndexToToggle].Name  + '&nbsp;' + $store.state.settings.license.deletelicensewithnoroles02"></p>
            </div>
          </div>  
        </div>
        <div class="grid-unit--alpha dialog__window-footer dialog__window-footer--confirm">
          <a class="button-primary dialog__window-cancel" @click="cancelDeactivation">{{ $store.state.settings.license.deletecancellabel }}</a> 
          <a class="button-primary button-primary--important dialog__window-ok" @click="saveLicenseActivation(licenceIdToToggle)">{{ $store.state.settings.license.turnofflicenselabel }}</a>
        </div>   
      </div>
    </div>
    <!-- LICENSE LIST SCREEN -->
    <div class="detailscreen-wrapper detailscreen-wrapper--visable detailscreen-wrapper--hasnolistview">
      <div id="detailscreen" class="detailscreen detailscreen--paddingtopbottom">
        <ol class="list-wrapper__license">
          <li class="list-item__license" v-for="(license, index) in licenseList" :data-index="index">
            <div class="license__icon">
              <div :class="license.Theme"></div>
            </div>
            <div class="license__content">
              <h3 class="license__name">{{ license.Name }}<span class="license__price" v-html="composePrice(license.PriceInfo.Currency, license.PriceInfo.Price, license.PriceInfo.Unit)"></span></h3>
              <div class="license__shortdescription">{{ license.ShortDescription }}</div>
              <div class="license__longdescription">
                <div>{{ license.LongDescription}}</div>
                <ol>
                  <li v-for="asset in validAssets(license)" :key="asset.AssetId" class="license__longdescription-line">
                    <span :class="'dot-' + license.Theme"></span>
                    <span>{{ asset.Name }}</span>
                    <span>{{ asset.Description }}</span>
                  </li>
                </ol>
              </div>
              <div class="license__readmore">
                <a @click="accordeonStatus($event)" class="trigger--js">{{ readmoreLabel }}</a>
              </div>
            </div>
            <div class="license__toggle">
              <div class="form-togglefield">
                <input type="checkbox" :disabled="license.ArticleCode.trim() == 'CS-BASIS' && $store.getters.getCustomerInfo().customerId != 1" :name="'toggle_' + index" :id="'toggle_' + index" v-model="license.isActive" @change="toggleLicenseState(license.LicenseId, license.isActive)">
                <label :for="'toggle_' + index"></label>
              </div>
            </div>
          </li>
        </ol>
      </div>  
    </div>  
  </div>
</template>

<script>
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';

  export default {
    name: 'License',
    data: () => {
      return {
        customerId           : -1,
        licenseList          : [],
        roleList             : [],
        activeLicenseList    : [],
        readmoreLabel        : '',
        readlessLabel        : '',
        showDialog           : false,
        licenceIdToToggle    : -1,
        licenceIndexToToggle : -1,
        unitList             : ["None", "PerMonth", "PerDay", "PerMinute", "PerCall"],
        storeWatch           : null
      }
    },
    inject: ["showLoader"],
    methods: {
      composePrice(cur, price, unit) {
        let _price     = '',
            _untiIndex = this.unitList.indexOf(unit);
        switch(cur) {
          case 'EUR':
            _price += '&euro;&nbsp;';
            _price += (Math.round(price * 100)/100).toString().replace('.', ',');
            _price += '&nbsp;' + this.$store.state.settings.currencyunit[_untiIndex]; 
            break;
          case 'XEU':
            _price += 'Invalid articlecode!';
            break;  
          default:
            _price += '&euro;&nbsp;';
            _price += (Math.round(price * 100)/100).toString().replace('.', ',');
            _price += '&nbsp;' + this.$store.state.settings.currencyunit[_untiIndex];
            break;
        }
        return _price;
      },
      mesureHeight(o) {
          o.style.position  = "absolute";
          o.style.width     = "558px";
          o.style.left      = "-10000px";
          o.style.maxHeight = "6000px";
          let _h            = o.scrollHeight;
          o.style.position  = "";
          o.style.left      = "";
          o.style.width     = "";
          return _h;
      },
      accordeonStatus(evt) {
        let _target   = evt.target;
        if(_target.tagName.toLowerCase() === 'a') {
          let _isOpen   = _target.parentElement.parentElement.querySelector('.license__longdescription').classList.contains('license__longdescription--open'),
          _descopen     = document.querySelectorAll('.license__longdescription--open'),
          _nrof         = _descopen.length;

          _descopen.forEach(desc => {
            desc.removeAttribute("style");
            desc.classList.remove('license__longdescription--open');
            desc.parentElement.parentElement.querySelector('.trigger--js').innerHTML = this.readmoreLabel;
          });

          if(!_isOpen) {
            let _desc = _target.parentElement.parentElement.querySelector('.license__longdescription');
            _desc.classList.add('license__longdescription--open');
            _desc.style.maxHeight = this.mesureHeight(_desc) + 20 + "px";
            _target.innerHTML     = this.readlessLabel;
          }
        }
      },
      validAssets(license) {
        return license.Assets.filter(a => a.LicenseId !== -1);
      },
      toggleLicenseState(lid, active) {
        this.showLoader(true);
        this.licenceIdToToggle = lid;
        this.licenseList.map((license, index) => {
          if(license.LicenseId == lid) this.licenceIndexToToggle = index;
        });

        if(!active) {
          IPCCCConfigurator.Request(this.$store.getters.getCustomerInfo().selectedCustomerId, 'role', 'list', null, lid).then(response => {
            this.roleList = [...response];
            this.showLoader(false);
            this.showConfirm();
          }).catch(error => {
            console.error(error);
            this.showLoader(false);
          });
        } else {
          this.saveLicenseActivation(lid);
        }
      },
      cancelDeactivation() {
        this.licenseList[this.licenceIndexToToggle].isActive = true;
        this.hideConfirm();  
      },
      showConfirm() {
        this.showDialog = true;
      },
      hideConfirm() {
        this.showDialog = false;
      },
      saveLicenseActivation(lid) {
        this.showLoader(true);
        let _pos = this.activeLicenseList.indexOf(lid);

        if(_pos != -1)
          this.activeLicenseList.splice(_pos, 1);
        else {
          this.activeLicenseList.push(lid);
        }

        IPCCCConfigurator.Request(this.$store.getters.getCustomerInfo().selectedCustomerId, 'customerlicense', 'save', this.activeLicenseList, -1).then(response => {
          this.hideConfirm();
          this.showLoader(false);
        }).catch(error => {
          console.error(error);
          this.showLoader(false);
        });
      },
      resetDisplay() {
        this.licenseList           = [];
        this.roleList              = [];
        this.activeLicenseList     = [];
        this.showDialog            = false;
        this.licenceIdToToggle     = -1;
        this.licenceIndexToToggle  = -1;
      },
      getCusLicense(cusId) {
        const addActiveProp = (licenseList, activeList) => {
          licenseList.map(license => {
            license.isActive = (activeList.indexOf(license.LicenseId) != -1) ? true : false;
          });
          this.licenseList       = [...licenseList];
          this.showLoader(false);
        }

        const getLicenseList = () => {
          IPCCCConfigurator.Request(cusId, 'license', 'readall', null, -1).then(response => {
            addActiveProp(response, this.activeLicenseList);
          }).catch(error => {
            console.error(error);
            this.showLoader(false);
          });
        }

        IPCCCConfigurator.Request(cusId, 'customerlicense', 'readall', null, -1).then(response => {
          this.activeLicenseList = response;
          getLicenseList();
        }).catch(error => {
          console.error(error);
          this.showLoader(false);
        });
      },
    },
    mounted() {
      this.showLoader(true);
      this.customerId     = this.$store.getters.getCustomerInfo().selectedCustomerId;
      this.readmoreLabel  = this.$store.state.settings.license.readmore;
      this.readlessLabel  = this.$store.state.settings.license.readless;

      if(this.customerId !== -1)
        this.getCusLicense(this.customerId);


      this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
        this.showLoader(true);
        if(this.customerId !== -1) {
          this.resetDisplay();
        }
        this.customerId = cObj.selectedCustomerId;
        this.getCusLicense(cObj.selectedCustomerId);
      });
    },
    beforeUnmount() {
      this.storeWatch();
    }
  }
</script>
