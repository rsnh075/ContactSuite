<template> 
  <div data-e2e="report-filter">
    <!-- DIALOG MESSAGE -->
    <div :class="wrapperClass">
      <a class="report-filters__header" @click="toggleFWrapper">
        <p class="report-filters__header-content">{{ headerfilterscontent }}</p>
        <i class="report-filters__header-icon">&#xF142;</i>
      </a>
      <div class="grid-row grid-row--report-filters">
        <div class="form-button__secondary form-button__secondary--add form-button__secondary--lowered">
          <button type="button" class="report-filters__presetbtn" @click="showMessage">{{ $store.state.settings.reporting.btnaddpreset }}</button>
        </div>
      </div>
      <div class="report-filters__body"></div>
    </div>
    <message-box
      :status         = "showDialog"
      :header-content = "headerContent"
      :body-content   = "messageBody" 
      :accept-label   = "acceptLabel" 
      :cancel-label   = "cancelLabel"
      @accepted       = "setNewOption"
      @canceled       = "hideDialog" 
    />
  </div>
</template>

<script>
  import MessageBox from './../dialogs/Message-box.vue';

  export default {
    name: 'ReportFilter',
    props: ['headerfilterscontent'],
    data: () => {
      return {
        isMinimized      : false,
        showDialog       : false,
        headerContent    : '',
        messageBody      : '',
        acceptLabel      : '',
        cancelLabel      : '',
      }
    },
    components: {
      MessageBox
    },
    computed: {
      wrapperClass() {
        return (this.isMinimized) ? 'report-filters-wrapper report-filters-wrapper--minimized' : 'report-filters-wrapper';
      }
    },
    watch: {

    },
    methods: {
      toggleFWrapper() {
        this.isMinimized = !this.isMinimized;
        if(this.isMinimized) {
          this.$store.commit('SET_FILTERS_MINIMIZED', true);
        } else {
          this.$store.commit('SET_FILTERS_MINIMIZED', false);
        }
      },
      showMessage() {
        this.headerContent = this.$store.state.settings.reporting.headinputname;
        this.messageBody = `<div class="grid-unit--alpha">
                              <div class="form-textfield form-textfield--bground">
                                <input type="text" name="inputPresetName" id="inputPresetName">
                                <label for="inputPresetName" class="form-label form-label--hidden">${this.$store.state.settings.reporting.labelinputname}</label>
                              </div>
                            </div>`;
        this.acceptLabel = this.$store.state.settings.reporting.btnacceptlabel;
        this.cancelLabel = this.$store.state.settings.reporting.btncancellabel;
        this.showDialog = true;
      },
      setNewOption() {
        const _checktext = e => e.text.toLowerCase() === _newFilterPresetName.toLowerCase();
        let _newFilterPresetName = document.getElementById('inputPresetName').value,
            _selectbox           = document.querySelector(".report-presets-select"),
            _hasPreset           = Array.apply(null, document.querySelector(".report-presets-select").options).some(_checktext);

        if(_newFilterPresetName != '' && !_hasPreset) {
          let    _csoption          = document.createElement("option");

          _csoption.text = _newFilterPresetName;
          _selectbox.add(_csoption);
          _selectbox.value = _newFilterPresetName;
          document.querySelector(".report-presets-wrapper .button__icon-save--small").classList.remove("button__icon--disabled");
          document.querySelector(".report-presets-wrapper .button__icon-delete--small").classList.remove("button__icon--disabled");
          document.querySelector('.button__icon.button__icon-save--small').disabled = false;
          document.querySelector('.button__icon.button__icon-delete--small').disabled = false;
          this.showDialog = false;
          window.ICC_SELECTEDPRESETNAME = _newFilterPresetName;
          window.ICC_SAVEPRESET();
        }
      },
      hideDialog() {
        this.showDialog = false;
      }
    },
    mounted() {
      this.isMinimized = this.$store.getters.getReportFiltersMinimized();
    }
  }

</script>