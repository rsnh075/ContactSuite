import { reactive, ref, watch } from 'vue';
import { useStore } from 'vuex';
import BoxProps, { ModalType } from '../types/BoxProps';
import { init,
        webHidPairing,
        RequestedBrowserTransport,
        SignalType,
        CallControlFactory, } from '@gnaudio/jabra-js';

export function useJabraWebHID() {
    const store: object | any = useStore(),
        stateCC = reactive({
            hasCallLock: false,
            callActive: false,
            muted: false,
            ringing: false,
            lineBusy: false,
            online: false,
        });

    let activeCallControl,
        ignoreSignals = false;

    /**
     * Helpers
     */
    function log(message, level = null, selectorId = 'logs') {
        // console.log('LOG: ', selectorId, ': ', JSON.stringify({ message, level }));
    }

    // watch(stateCC, (newState, oldState) => {
    //     console.log('WATCH STATECALLCONTROLE', stateCC);
    // });

    store.watch(store.getters.getWebRtcIsRinging, status => {
        // console.log('activeCallControl', activeCallControl);
        if(activeCallControl && stateCC.hasCallLock) {
            if (status) {
                ringerStart();
            } else {
                ringerStop();
            }
        }
    });

    async function callLock() {
        if (stateCC.hasCallLock) {
            // activeCallControl.releaseCallLock();
            // state.hasCallLock = false;
            return;
        }

        try {
            let gotLock = await activeCallControl.takeCallLock();

            if (gotLock) {
                stateCC.hasCallLock = true;
                // console.log('takeCallLock success', stateCC);
                return;
            }
            throw new Error("Lock is already taken");
        } catch (err) {
            alert(err);
        }
    }

    function callStart() {
        stateCC.callActive = true;
        // activeCallControl.offHook(stateCC.callActive);
    }

    function callStop() {
        stateCC.callActive = false;
        // activeCallControl.offHook(stateCC.callActive);
    }

    function ringerStart() {
      stateCC.ringing = true;
      activeCallControl.ring(stateCC.ringing);
    }

    function ringerStop() {
      stateCC.ringing = false;
      activeCallControl.ring(stateCC.ringing);
    }

    function handleIncomingSignals(signal, device) {
        // console.log('handleIncomingSignals signal.value', signal.value);
        try {
            const successCallback = (logMessage) => {

                log(logMessage, "success");
            };

            const warnCallback = (logMessage) => {
                log(logMessage, "warn");
            };

            if (ignoreSignals) {
                ignoreSignals = false;
                warnCallback(`Ignore incoming signal: ${SignalType[signal.type]}`);
                return;
            }

            if (signal.type === SignalType.HOOK_SWITCH) {
                if (signal.value && store.getters.getWebRtcIsRinging()) {
                    store.commit('PICKUP_ACTIVE_CALL', true);
                }

                // console.log('store.getters.getCommandsCallOut', store.getters.getCommandsHangup());

                if (!signal.value && store.getters.getCommandsHangup()) {
                    store.commit('HANGUP_ACTIVE_CALL', true);
                }

                stateCC.callActive = signal.value;

                /**
                 * Acknowledge the incoming signal by calling the equivalent command with
                 * our updated state value
                 */
                activeCallControl.offHook(stateCC.callActive);

                /**
                 * Stop the ringer if it is running
                 */
                stateCC.ringing = false;
                activeCallControl.ring(stateCC.ringing);

                successCallback(
                `Acknowledge incoming signal: ${SignalType[signal.type]}`
                );

                return;
            }

            /**
             * SignalType.LINE_BUSY is a read-only value that signals if the device is in an active call
             */
            if (signal.type === SignalType.LINE_BUSY) {
                stateCC.lineBusy = signal.value;

                successCallback(
                `Acknowledge incoming signal: ${SignalType[signal.type]}`
                );

                return;
            }

            /**
             * SignalType.ONLINE is a read-only value that signals if a wireless adapter (Bluetooth or DECT) is transmitting
             * audio to a connected device
             */
            if (signal.type === SignalType.ONLINE) {
                stateCC.online = signal.value;

                successCallback(
                `Acknowledge incoming signal: ${SignalType[signal.type]}`
                );

                return;
            }

            warnCallback(`Ignore incoming signal: ${SignalType[signal.type]}`);
        } catch (err) {
            console.log(err.message);
        }
    }

    //start CallControle

    function startCallControle(callControl) {
        // console.log('startCallControle', callControl);
        if (activeCallControl) {
            console.warn("Device reconnected unexpectedly");
            return;
        }
        Object.keys(stateCC).forEach(key => stateCC[key] = false);
        activeCallControl = callControl;
        const { device } = activeCallControl;

        store.commit('SET_HID_HAS_CALLCONTROLE', device.name.length > 0);

        callControl.deviceSignals.subscribe(handleIncomingSignals);

        callControl.onDisconnect.subscribe(() => {
            console.log('disconnecting');
            activeCallControl = null;
            stateCC.hasCallLock = false;
        })
    }

    //init JabraWebHID

    const initJabraWebHID = async () => {
        try {
            const jabra = await init({
                transport: RequestedBrowserTransport.WEB_HID,
                partnerKey: '9b3f-8543b798-1a37-4c0d-963b-364625c37938',
                appId: 'ContactSuite',
                appName: 'ContactSuite',
            }).catch((err) => {
                console.log(err);
            });

            if (!jabra) {
                console.log(
                    new Error(
                        "The Jabra SDK failed to initialize. See error above for more details."
                    )
                );
                return;
            }

            const ccFactory = new CallControlFactory(jabra);

            /**
             * Subscribe to device attach/detach events
             */
            jabra.deviceList.subscribe({
                next: (devices) => {
                    if (devices.length >= 1) {
                        // Find the first available device which supports call control
                        let indexToUse = 0;
                        while (
                            indexToUse < devices.length &&
                            !ccFactory.supportsCallControl(devices[indexToUse])
                        ) {
                            indexToUse++;
                        }

                        ccFactory
                            .createCallControl(devices[indexToUse])
                            .then((callControl) => startCallControle(callControl))
                            .catch((err) => console.log(err));

                        // Hide consent button
                        if (devices[indexToUse].name.includes('Jabra')) {
                            document.getElementById("jabra-webhid-consent-button").style.display = "none";
                        }
                    }

                    // Show a warning if page has consent to more than 1 device
                    if (devices.length >= 2) {
                        //TODO messagebox
                    }

                    // console.log('jabraDevices: ', devices);
                },
                error: (err) => {
                    console.log(err);
                },
            });

            // Click handler for webhid consent button
            document
            .getElementById("jabra-webhid-consent-button")
            .addEventListener("click", async () => {
                await webHidPairing();
            });

        } catch (err) {
            throw new Error(err.message);
        }
    }


	return { initJabraWebHID, callLock };
}