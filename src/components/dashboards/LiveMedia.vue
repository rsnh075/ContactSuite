<template>
    <div>
        <div class="detailscreen-wrapper detailscreen-wrapper--visable">
            <div class="detailscreen detailscreen--nopadding">
                <div class="grid-row tiles-1x4">
                    <div class="tiles-1x4__item">
                        <div class="tiles-1x4__item-value">{{ dashboardData.TotalCalls }}</div>
                        <div class="tiles-1x4__item-label">Gesprekken</div>
                    </div>
                    <div class="tiles-1x4__item">
                        <div class="tiles-1x4__item-value">{{ dashboardData.TotalCallcentreCalls }}</div>
                        <div class="tiles-1x4__item-label">Beantwoord callcenter</div>
                    </div>
                    <div class="tiles-1x4__item">
                        <div class="tiles-1x4__item-value">{{ dashboardData.CurrentIncomingCalls }}<span class="typo--black">&nbsp;/&nbsp;</span>{{ dashboardData.CurrentCallcentreCalls }}</div>
                        <div class="tiles-1x4__item-label">Actief Inbound</div>
                    </div>
                    <div class="tiles-1x4__item">
                        <div class="tiles-1x4__item-value">{{ dashboardData.Caps }}</div>
                        <div class="tiles-1x4__item-label">CAPS</div>
                    </div>
                </div>
                <div class="detailscreen-footer detailscreen-footer--inside">
                    <div class="detailscreen detailscreen--footer" style="font-size: 11px;">
                        <canvas ref="dataChart" class="media__chart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import { IPCCCConfigurator } from "../../ipccc/js/configurator";
import { IPCCCDashboard }  from './../../ipccc/js/dashboard.js';

// import { Chart, registerables } from 'chart.js';

import Chart from 'chart.js/auto';

// import { Chart, ChartConfiguration, LineController, LineElement, PointElement, LinearScale, Title} from 'chart.js'


const createChart = (target, data, labels) => {
    let chartObject = new Chart(target, {
        type: 'bar',
        data: {
            datasets: data,
            labels: labels
        },
        options: {
            layout: {
                padding: {
                    left: 10,
                    right: 40,
                    top: 20,
                    bottom: 20,
                },
            },
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    fontColor: '#666',
                    fontSize: 9,
                    fontFamily: 'font-family: "Open Sans", sans-serif;',
                },
            },
        },
    });

    return chartObject;
};

const updateChart = (target, nwdata, labels) => {
    target.data.labels   = [];
    target.data.datasets  = [];

    target.data.datasets  = nwdata;
    target.data.labels    = labels;

    target.update(0);
}

export default {
    name: 'LiveMedia',
    data: () => {
        return {
            customerId: -1,
            data: {},
            dashboardSubscribe: null,
            dashboardData: {},
            dashboardDataBuffer: [],
            maxBufferSize: 60,
            chartObject: null,
            timeLabels: [],
            lastTimeLabel: null,
            labelCounter: 0,
            maxCapsInPastMin: 0,
        }
    },
    inject: ['showLoader'],
    methods: {
        getCurrentTime(dt) {
            return dt.toTimeString().substring(0, 5);
        },
        handleData(result) {
            this.dashboardData             = result.value;

            if(this.dashboardDataBuffer.length == 0) {
                this.dashboardDataBuffer.push({
                    label                  : 'Inbound',
                    borderColor            : '#7AD522',
                    backgroundColor        : 'rgba(0, 0, 0, 0)',
                    pointRadius            : 2,
                    pointBackgroundColor   : '#7AD522',
                    cubicInterpolationMode : 'monotone',
                    lineTension            : 0,
                    data                   : [this.dashboardData.CurrentIncomingCalls],
                    type                   : 'line'
                });
                this.dashboardDataBuffer.push({
                    label                  : 'Outbound',
                    borderColor            : '#D30AA4',
                    backgroundColor        : 'rgba(0, 0, 0, 0)',
                    pointRadius            : 2,
                    pointBackgroundColor   : '#D30AA4',
                    cubicInterpolationMode : 'monotone',
                    lineTension            : 0,
                    data                   : [this.dashboardData.CurrentCallcentreCalls],
                    type                   : 'line'
                });
                this.dashboardDataBuffer.push({
                    label                  : 'CAPS (/10)',
                    backgroundColor        : '#E0B123',
                    borderColor            : 'rgba(0, 0, 0, 0)',
                    data                   : [this.dashboardData.Caps * 10]
                });

                this.lastTimeLabel  = new Date();
                this.timeLabels.push( this.getCurrentTime(new Date()) );
                this.labelCounter++;
                this.chartObject    = createChart(this.dataChart, this.dashboardDataBuffer, this.timeLabels);
            } else {

                let _dif = -( this.lastTimeLabel.getTime() - new Date().getTime() );
                this.lastTimeLabel  = new Date();

                console.log('_dif', _dif);

                if(_dif >= (this.maxBufferSize*1000) || _dif < 0) {
                    this.dashboardDataBuffer[0].data.push(this.dashboardData.CurrentIncomingCalls);
                    this.dashboardDataBuffer[1].data.push(this.dashboardData.CurrentCallcentreCalls);
                    this.dashboardDataBuffer[2].data.push(this.maxCapsInPastMin * 10);

                    if(this.labelCounter % 5 == 0) {
                        this.timeLabels.push( this.getCurrentTime() );
                    } else {
                        this.timeLabels.push( '' );
                    }
                    this.labelCounter++;
                    this.maxCapsInPastMin = 0;

                    console.table('updateChart this.chartObject', this.chartObject);

                    updateChart(this.chartObject, this.dashboardDataBuffer, this.timeLabels);

                } else {
                    if(this.maxCapsInPastMin < this.dashboardData.Caps)
                        this.maxCapsInPastMin = this.dashboardData.Caps;
                }

            }

            if(this.dashboardDataBuffer[0].data.length == this.maxBufferSize) {
                this.dashboardDataBuffer[0].data.shift();
                this.dashboardDataBuffer[1].data.shift();
                this.dashboardDataBuffer[2].data.shift();
                this.timeLabels.shift();
            }
            this.showLoader(false);
        }
    },
    mounted() {
        this.showLoader(true);
        this.customerId = this.$store.getters.getCustomerInfo().customerId;
        this.dataChart      = this.$refs.dataChart;

        IPCCCConfigurator.Request(this.customerId, 'mediasettings', 'readall', null, -1)
        .then((result) => {
            this.data = result[0];
            IPCCCDashboard.Subscribe('MediaStatistics', this.handleData);
        }).catch(error => {
            console.error(error);
            this.showLoader(false);
        });

        this.showLoader(false);
    },
    beforeDestroy() {
        IPCCCDashboard.Desubscribe('MediaStatistics', this.handleData);
        this.data = null;
    },
};

</script>
