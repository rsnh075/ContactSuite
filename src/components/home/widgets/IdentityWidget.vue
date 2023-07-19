<template>
  <div class="widget widget--settings widget__identity form-selectfield" data-e2e="widget-identity">
    <label>{{ store.state.settings.settingsPannel.identitylabel }}</label>
    <select v-model="identityId" @change="setIdentity($event)" data-e2e="widget-identity-select">
      <option v-for="identity in store.state.loginSession.Details.OutboundIdentities" :value="identity.Id">{{ identity.Name }}</option>
    </select>
  </div>
</template>

<script lang="ts">

  import { computed, defineComponent }  from 'vue';
  import { useStore }                   from 'vuex';
  import { IPCCCCallControl }           from '../../../ipccc/js/callcontrol';

  export default defineComponent({
    name: 'IdentityWidget',
    setup() {
      const store:object | any       = useStore(),
            identityId               = computed(() => store.state.currentIdentityId);

      const setIdentity = (evt:{target: Element}) => {
        let currentIdentityId = parseInt(evt.target.value);

        IPCCCCallControl.SetOutboundIdentity(currentIdentityId)
        .then(_ => {
          store.commit('SET_CURRENT_IDENTITY', currentIdentityId);
        })
        .catch(error => console.log(error));
      };

      return {
        store,
        setIdentity,
        identityId
      }
    }
  });

</script>

<style lang="scss" scoped>
  @use "@/scss/includes/globals";

  .widget {
    position: relative;
    width: 100%;

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
  }

</style>
