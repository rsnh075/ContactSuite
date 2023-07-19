<template>
  <div data-e2e="manuals">
    <div class="list-wrapper">
      <ol class="tiles-document-wrapper">
        <li v-for="manual in listManuals" class="tiles-item tiles-item--download">
          <!-- <a :href="siteRoot + manual.loc" target="_blank" class="tiles-item__link tiles-item__link--opaque"> -->
          <a :href="manual.loc" target="_blank" class="tiles-item__link tiles-item__link--opaque">
            <span class="tiles-item__link-filename">{{ manual.name }}</span>
            <span class="tiles-item__link-filetype" :class="'tiles-item__link-filetype--' + manual.icon">{{ manual.type }}</span>
            <div class="tiles-item__link-download">{{ $store.state.settings.portal.download }}</div>
          </a>
        </li>
      </ol>
    </div>
  </div>
</template>

<script>

  import Axios                      from 'axios';

  export default {
    name: 'Manuals',  
    data() {
      return {
        listManuals     : [],
        browserLanguage : 'nl'
      }
    },
    inject: ['showLoader'],
    updated() {
      this.browserLanguage    = this.$store.getters.getLang();
    },
    mounted() {

      this.browserLanguage  = this.$store.getters.getLang();
      let _url              = window.siteroot + 'assets/manuals/manuals_' + this.browserLanguage + '.json?ver=' + Math.random();

      if(this.browserLanguage == 'en')
        _url = window.siteroot + 'assets/manuals/manuals_' + this.browserLanguage + '.json?ver=' + Math.random();

      Axios.get(_url).then(response => {
        this.listManuals = response.data.manuals;
        this.listManuals.map(manual => manual.loc = window.siteroot + manual.loc);
        this.showLoader(false);
      }).catch(error => {
        console.error(error);
      });

    },

  }
</script>
