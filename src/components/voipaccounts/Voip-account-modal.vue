<template>
  <div class="detailscreen-modal" @click.stop="close()" data-e2e="voip-account-modal">
    <div class="detailscreen__window" @click.stop="">        
      <div class="list-wrapper list-wrapper--has-close">
        <div class="list-close">
          <a @click.stop="close()"><span></span> <span></span></a>
        </div>
        <div class="list-topbar">
          <div class="list-topbar__content">
            <div class="typo--modalheader">
              {{ $store.state.settings.voipaccounts.modalheadertxt }}
            </div>
            <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
              <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.voipaccounts.searchtxt" @keyup="filterList()">
            </div>
            <div class="typo-tabletitle">
              {{ totalPhoneTypes + " " + $store.state.settings.voipaccounts.devicecountlabel }}
            </div>
          </div>
        </div>
        <div class="list-content-wrapper">
          <div class="list-content--back">
            <div class="list-content" style="padding: 0 1.4rem 0 1.5rem;">
              <ol>
                <span v-for="phone in list" :key="phone.InternalNumber">
                  <div v-if="phone.Header" class="grid-row">
                    <h2 class="detailscreen__fieldsetheader" style="margin: 5px 0;">{{ phone.Header }}</h2>
                  </div>
                  <li v-else style="display: inline-block; width: 25%;"><span class="typo--paragraph--large">{{ phone.Type }}</span></li>
                </span>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'VoipAccountModal',
    props: ['rawlist'],
    data: () => {
      return {
        searchStr              : '',
        totalPhoneTypes        : 0,
        list                   : [],
      }
    },
    methods: {
      close() {
        this.$emit('togglemodal');
      },

      //=========================================================== START DISPLAY LIST METHODS
      filterList() {
        this.list            = this.filterListOnString(this.rawlist, this.searchStr.toLowerCase());
        this.totalPhoneTypes = this.list.length - this.rawlist.filter(item => item.hasOwnProperty('Header')).length;
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list],
              _keys;
          return _rawList.filter(item => {
            _keys = item['Type'].toLowerCase().indexOf(str) != -1 || item.hasOwnProperty('Header');
            return _keys;
          });
        } else {
          return [...list];
        }
      },
    },
    mounted() {
      this.filterList();
    }
  }

</script>
