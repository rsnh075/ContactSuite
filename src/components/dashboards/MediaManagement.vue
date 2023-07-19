<template>
    <div>
        <div class="detailscreen-wrapper detailscreen-wrapper--visable">
            <div class="detailscreen" id="detailscreen">
                <div class="grid-row tiles-2x3">
                    <div class="tiles-2x3__item">
                        <div class="tiles-2x3__item-value">{{ dashboardData.TotalCalls }}</div>
                        <div class="tiles-2x3__item-label">Totaal aantal aangeboden</div>
                    </div>
                    <div class="tiles-2x3__item">
                        <div class="tiles-2x3__item-value">{{ dashboardData.TotalCallcentreCalls }}</div>
                        <div class="tiles-2x3__item-label">Callcenter totaal beantwoord</div>
                    </div>
                    <div class="tiles-2x3__item">
                        <div class="tiles-2x3__item-value">{{ dashboardData.CurrentIncomingCalls }}</div>
                        <div class="tiles-2x3__item-label">Actief</div>
                    </div>
                    <div class="tiles-2x3__item">
                        <div class="tiles-2x3__item-value">{{ dashboardData.CurrentCallcentreCalls }}</div>
                        <div class="tiles-2x3__item-label">Callcenter actief</div>
                    </div>
                    <div class="tiles-2x3__item">
                        <div class="tiles-2x3__item-value">{{ dashboardData.TotalCallbackCalls }}</div>
                        <div class="tiles-2x3__item-label">Terug bellen</div>
                    </div>
                    <div class="tiles-2x3__item">
                        <div class="tiles-2x3__item-value">{{ dashboardData.Caps }}</div>
                        <div class="tiles-2x3__item-label">CAPS</div>
                    </div>
                </div>
                <div v-if="canManage" class="detailscreen-footer detailscreen-footer--inside">
                    <div class="detailscreen-footer__pannel">
                        <div class="form-range-field">
                            <div class="form-range-field__track"></div>
                            <div class="form-range-field__track--opaque" ref="currentIncommingOpaque" :data-value="dashboardData.CurrentCallcentreCalls"></div>
                            <div class="form-range-field__track--active" ref="currentIncomming" :data-value="dashboardData.CurrentCallcentreCalls"></div>
                            <label class="form-range-field__output" ref="output">Aantal callcenter medewerkers: <output name="outputCallCentreSeats" id="outputCallCentreSeats">{{ data.CallcentreSeats }}</output></label>
                            <span class="form-range-field__inline-values--start">{{ minSeats }}</span>
                            <input type="range" name="callCentreSeats" id="callCentreSeats"
                                :min="minSeats"
                                :max="maxSeats"
                                step="1"
                                :value="data.CallcentreSeats"
                                oninput="outputCallCentreSeats.value = callCentreSeats.value"
                                @change="setCallcentreSeats"
                            >
                            <span class="form-range-field__inline-values--end">{{ maxSeats }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import { IPCCCConfigurator } from "../../ipccc/js/configurator";
import { IPCCCDashboard }  from './../../ipccc/js/dashboard.js';

export default {
    name: 'MediaManagement',
    data: () => {
        return {
            customerId: -1,
            data: {},
            dashboardSubscribe: null,
            dashboardData: {},
            minSeats: 0,
            maxSeats: 500,
        }
    },
    computed: {
        canManage() {
            return this.$store.getters.getPermission('MediaBeheer');
        }
    },
    inject: ['showLoader'],
    methods: {
        setCallcentreSeats(evt) {
            this.showLoader(true);
            let _newValue = evt.target.value;
            this.data.CallcentreSeats = _newValue;
            IPCCCConfigurator.Request(this.customerId, 'mediasettings', 'save', this.data, -1)
            .then(result => {
                this.drawCurrentrCallsBar(this.dashboardData.CurrentCallcentreCalls);
                this.showLoader(false);
            })
            .catch(error => {
                console.error(error);
                this.showLoader(false);
            });
        },
        handleData(result) {
            this.dashboardData = result.value;
            this.drawCurrentrCallsBar(this.dashboardData.CurrentCallcentreCalls);
        },
        drawCurrentrCallsBar(currentCalls) {
            let _currentSeats     = this.data.CallcentreSeats,
                _perc             = (_currentSeats > 0) ? (currentCalls/_currentSeats) : 1,
                _bar              = this.$refs.currentIncomming,
                _barOpaque        = this.$refs.currentIncommingOpaque,
                _compStyle        = window.getComputedStyle(document.getElementById('callCentreSeats')),
                _maxWidth         = parseInt(_compStyle.getPropertyValue('width')),
                _availebleWidth   = (this.data.CallcentreSeats / this.maxSeats) * _maxWidth,
                _barWidth         = _perc * _availebleWidth;

            _bar.style.width           = _barOpaque.style.width = _barWidth + 'px';
            _bar.style.backgroundColor = "rgba(212, 83, 83, " + _perc + ")";
        }
    },
    beforeMount() {

    },
    mounted() {
        this.showLoader(true);
        this.customerId = this.$store.getters.getCustomerInfo().customerId;
        IPCCCConfigurator.Request(this.customerId, 'mediasettings', 'readall', null, -1)
        .then((result) => {
            this.data = result[0];
            IPCCCDashboard.Subscribe('MediaStatistics', this.handleData);
            this.showLoader(false);
        }).catch(error => {
            console.error(error);
            this.showLoader(false);
        });
    },
    beforeUnmount() {
        IPCCCDashboard.Desubscribe('MediaStatistics', this.handleData);
        this.data = null;
    }
}

</script>