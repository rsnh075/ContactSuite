<script setup>

const btnList = [
    {
        btnLabel: 'CCM',
        btnUrl: '/tools/ccm/'
    },{
        btnLabel: 'Import services',
        btnUrl: '/tools/importservices/'
    }
];

function openInNewTab(url) {
    let _url = window.siteroot + url;
    window.open(_url, 'blank');
}

</script>

<template>

    <div class="external-tools-wrapper">
        <div class="grid-row">
          <div class="grid-unit--alpha">
            <div class="grid-row grid-row--bottom-padding external-tool-visual"></div>
          </div>
        </div>
        <div class="grid-unit--alpha">
          <div class="grid-row grid-row--bottom-padding">
            <div class="grid-unit--alpha">
              <div class="typo--paragraph-header typo--centered">
                  <span class="detailscreen__title">{{ $store.state.settings.externaltooling.header }}</span>
              </div>
            </div>
          </div>
          <div class="grid-row grid-row--bottom-padding">
            <div class="grid-unit--alpha">
              <div class="typo--paragraph--large typo--centered">
                <button v-for="(btn, index) in btnList" class="externalTool" :key="index" :class="btn.btnClassName" @click="openInNewTab(btn.btnUrl)" v-html="btn.btnLabel"></button>
              </div>
            </div>
          </div>
          <br />
        </div>
    </div>


</template>

<style lang="scss" scoped>

@use "@/scss/includes/font";
@use "@/scss/includes/functions";
@use "@/scss/includes/globals";

.external-tool-visual {
    margin: 2rem 0 0 0;
	height: 300px;
    background: url('/assets/images/externaltooling.png') no-repeat center center;
    background-size: contain;

}

.externalTool {
	background-color: functions.tint(globals.$color-green, 5%);
    border: none;
    border-radius: 2rem;
    box-shadow: 0 1px 1px 0 rgba(0,0,0,.2);
    color: white;
    padding: 15px 32px;
    margin: 0.2rem;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 1rem;
    cursor: pointer;
    transition: all .2s ease-in-out;
    &:hover {
        font-size: 1.05rem;
        background-color: globals.$color-green;
    }
    &:before {
        @include font.font-icon();
        font-size: 1.4rem;
        margin-right: 7px;
        vertical-align: -3px;
        color: white;
    }
}

</style>