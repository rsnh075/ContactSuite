import { inject } from 'vue';
import { Device } from '../types/Device';
import { IPCCCPush } from '../ipccc/serviceworker/push';
import { currentLocalDateTimeISO } from '../use/dateFunctions';
import { useStore } from 'vuex';
import { Logging } from '../ipccc/lib/logging';

export function useDeviceRequirements() {
    const store = useStore();
	const showWebRtcConstraintsBox:Function = inject('showWebRtcConstraintsBox');

	let isEnabled = false;

	const validateDevice = async (seldevice:Device) => {

        if(!store.getters.getEnvIsTest() && seldevice.MACAddress.toUpperCase().startsWith("WEBRTC")) { //added getEnvIsTest so tester doesn't need to validate webrtc fake-device
            //Enable serviceworker pushnotifications
            await IPCCCPush.Enable()
            .catch(() => {});

            let mic = false,
                push = IPCCCPush.Enabled;

            await navigator.mediaDevices.getUserMedia({audio: true})
            .then(() => mic = true)
            .catch(() => {});

            Logging.WriteAlways(`[${currentLocalDateTimeISO()}] WEBRTC: ${seldevice?.Address} mic: ${mic} push: ${push}`);

            if (!mic || !push) {
                showWebRtcConstraintsBox(true);
            }

            isEnabled = mic; // && push; not required for webRTC;

		} else {
            if (store.getters.getEnvIsTest()) console.warn(`[${currentLocalDateTimeISO()}] no validation requirements (mic and push) for device: ${seldevice?.Address}`);
			isEnabled = true;
		}
		return isEnabled;
	}

	return { validateDevice, isEnabled };
}