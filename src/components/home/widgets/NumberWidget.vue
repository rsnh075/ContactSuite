<template>
    <div class="widget widget--number" data-e2e="number-widget">
      <h2 class="widget-header">{{ $store.state.settings.widgets.numbertitle }} ({{ totalItems }})</h2>
      <div class="widget-content" ref="wrapper">
        <div class="list-content--is-empthy" v-if="totalItems == 0">{{ $store.state.settings.portal.nonumbersfound }}</div>
        <ol class="list-content">
          <li v-for="(row, _key) in listData"
              class="list-content__row list-content__row--clickable"
              :class="fillIfServiceNr(row.Title)"
              :data-id="row.Id"
              :data-nr="row.Number"
              :data-title="row.Title"
              :key="_key"
              @click="goToServiveNumbers($event)">
            <span class="list-content__row-cell title">{{ titleOrNumber(row) }}</span>
            <span class="list-content__row-cell tarif" :class="priceClass(row.NoTariff)">
              &euro;&nbsp;{{ toEuro(row.TariffInCents) }}&nbsp;
              {{ perLabel(row.TariffIsPerCall, $store.state.settings.portal.tarifflabel) }}
              &nbsp;{{ placeSetup(row.TariffSetup) }}
            </span>
          </li>
        </ol>
      </div>
    </div>
</template>

<script>

  import { IPCCCConfigurator }    from './../../../ipccc/js/configurator.js';

  export default {
    name: 'NumberWidget',
    props: [],
    data: () => {
      return {
        wrapper       : null,
        rawListData   : [],
        listData      : [],
        totalItems    : 0,
      }
    },
    inject: ['showLoader'],
    computed: {
      priceClass() {
        return function(tarif) {
          return (tarif) ? " list-content__row-cell--empthy" : "";
        }
      },
    },
    methods: {
      fillIfEmpty(value) {
        if(!value) return '-';
        value = value.toString();
        return value.charAt(0).toUpperCase() + value.slice(1);
      },
      titleOrNumber(row) {
        if (!row.Title || row.Title === '-') {
          return row.Number;
        }
        return this.fillIfEmpty(row.Title);
      },
      fillIfServiceNr(value) {
        if (value != '') return 'tiles-item__link--before-icon';
      },
      perLabel(perCall, lbl) {
        return perCall ? lbl[0] : lbl[1];
      },
      placeSetup(isSetup) {
        return ''; isSetup ? this.$store.state.settings.portal.setuptariff : '';
      },
      toEuro(cents) {
      let _cents = cents.toString(),
        _nrOfDigets = _cents.length,
        _euros = '0,00';

      switch (_nrOfDigets) {
        case 1:
          _euros = '0,0' + _cents;
          break;
        case 2:
          _euros = '0,' + _cents;
          break;
        default:
          _euros = _cents.substring(0, _nrOfDigets - 2) + ',' + _cents.substring(_nrOfDigets - 2, _nrOfDigets);
          break;
        }
        return _euros;
      },
      getdata(selId, dataItem, dataOperation) {
        this.listData   = this.rawListData = [];
        this.totalItems = this.listData.length;

        IPCCCConfigurator.Request(selId, dataItem, dataOperation, null, -1)
        .then(result => {
          this.listData   = this.rawListData = result;
          this.totalItems = this.listData.length;
        })
        .catch(error => {
          this.showLoader(false);
          console.error('Error: ' + error);
        });
      },
      goToServiveNumbers(evt) {
        let _target               = evt.currentTarget;
        this.$store.commit('SET_SERVICENR_OBJ', {
          selectedNumberId     : parseInt(_target.getAttribute('data-id')),
          selectedNumber       : _target.getAttribute('data-nr'),
          selectedNumberTitle  : _target.getAttribute('data-title'),
        });
        // this.$store.commit('SET_SIDEMENU_STATUS', 0);
        this.$store.state.navigation.requestNavigation = '/availability/servicenumbers/';
      },
    },
    mounted() {
      this.wrapper       = this.$refs.wrapper;

      if(this.$store.getters.getCustomerInfo().customerId != -1)
        this.getdata(this.$store.getters.getCustomerInfo().customerId, 'portalservicenumber', 'readall');

      this.$store.watch(this.$store.getters.getCustomerInfo, obj => {
        if(this.$store.getters.getCustomerInfo().customerId != -1)
          this.getdata(this.$store.getters.getCustomerInfo().customerId, 'portalservicenumber', 'readall');
      });
    }
  }
</script>

<style lang="scss" scoped>
  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";
  @use "@/scss/includes/widget";

  .widget {
    width: 100%;
    box-shadow: none;
    height: 404px;
    min-height: 404px;

    label {
      width: 100%;
      padding-left: 3px;
      font-size: .85em;
      color: globals.$color-gray40;
    }
    select {
      width: 100%;
      margin-top: 0;
      border: none;
    }
    &:before {
      top: calc(50% + 12px);
      left: calc(100% - 34px);
    }
    .title {
      width: 65%;
      min-width: 65%;
      padding-left: 30px;
    }
    .tarif {
      width: 35%;
      min-width: 35%;
    }
    .list-content {
      border: 0;
    }
  }

</style>
