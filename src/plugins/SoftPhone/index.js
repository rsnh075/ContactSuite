import * as Janus from 'janus-gateway-js';
import { KeepAlive } from 'vue';
import { IPCCC } from '../../ipccc/js/ipccc';
import { Logging } from '../../ipccc/lib/logging.js';
import { currentLocalDateTimeISO }  from '../../use/dateFunctions';

export default {
    install: (app, options) => {

        const _registeredCallbacks = {
            'registered'          : null,
            'unregistered'        : null,
            'registered_failed'   : null,
            'unregistered_failed' : null,
        };

        // let _dtmfSender;
        let _audioConstrains = {
            deviceId: "default"
        };

        let _currentJsep = null;

        let lastRegisterMessage = null;

        window.testCallOutTransactionId = '';

        const _handleLog = (str) => {
            console.log(`[${currentLocalDateTimeISO()}] WebPhone says: ${str}`);
        }

        const _handleErrorLog = (str) => {
            console.log(`[${currentLocalDateTimeISO()}] WebPhone says: ${str}`);
        }

        let iceServerConfig = [];

        const _deRegisterCallBacks = (...callBacks) => {
            callBacks.forEach(callBack => {
                _registeredCallbacks[callBack] = null;
            })
        }

        const theirAudio         = document.createElement('audio');
        const ringer             = document.createElement('audio');
        const extraRinger        = document.createElement('audio');
        let __msg                = null;
        let _micVolume           = 1;

        theirAudio.controls      = 'controls';
        theirAudio.type          = 'audio/mpeg';
        theirAudio.volume        = 0.5;
        theirAudio.setAttribute('autoplay', 'autoplay');

        ringer.controls          = 'controls';
        ringer.loop              = 'loop';
        ringer.type              = 'audio/mpeg';
        ringer.volume            = 0.5;
        ringer.src               = window.siteroot + '/assets/sounds/ringtone04.mp3';

        extraRinger.controls     = 'controls';
        extraRinger.loop         = 'loop';
        extraRinger.type         = 'audio/mpeg';
        extraRinger.volume       = 0.5;
        extraRinger.src          = window.siteroot + '/assets/sounds/ringtone04.mp3';
        if (typeof extraRinger.setSinkId == "function") {
            extraRinger.setSinkId('')
            .then(() => {})
            .catch((err) => console.error(err));
        } else {
            console.error('Type error, setSinkId is not a function');
        }

        const _playRingTone = () => {
            ringer.play();
            if(extraRinger.sinkId != '')
                extraRinger.play();
        }

        const _stopRingTone = () => {
            ringer.pause();
            ringer.currentTime = 0;
            if(extraRinger.sinkId != '') {
                extraRinger.pause();
                extraRinger.currentTime = 0;
            }
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////
        const showPcLog = pc => {
            let _date = new Date();
            console.log('---------------------------------- ' + _date.toLocaleTimeString("nl-NL"));
            for(const prop in pc) {
                if(typeof pc[prop] !== 'function' && pc[prop] !== null) {
                    if(String(pc[prop]).indexOf('[object') !== -1) {
                        //console.log('- ', pc[prop])
                        for(const subprop in pc[prop]) {
                        if(typeof pc[prop][subprop] !== 'function' && pc[prop][subprop] !== null) {
                            console.log(`- ${subprop}: ${pc[prop][subprop].split('\n').join(' ')}`)
                        }
                        }
                    } else {
                        console.log(`${prop}: ${pc[prop]}`);
                    }
                }
            }
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////

        const _handleAccepted = (self, msg) => {
            let _jsep    = msg.get('jsep');

            if(_jsep !== null && _jsep !== undefined) {
                self.setRemoteSDP(_jsep);
            }

            _handleLog("Going to add their stream...");

            self._pc.onaddstream = evt => {
                theirAudio.srcObject = evt.stream;
                _handleLog("Their stream added");
            }
        };

        const _handleProgress = (self, msg) => {
            let _jsep    = msg.get('jsep');

            if(_jsep !== null && _jsep !== undefined) {
                self.setRemoteSDP(_jsep);
            }

            _handleLog("Going to add their stream...");

            self._pc.onaddstream = evt => {
                theirAudio.srcObject = evt.stream;
                _handleLog("Their stream added");
            }
        };

        const _customizeSdp = jsep => {
            if(jsep && jsep.sdp) {

                const _sdpList        = jsep.sdp = jsep.sdp.split('\n');
                const _opusIndex      = _sdpList.findIndex(row => row.indexOf('opus') !== -1);
                const _rtpmapNr       = _sdpList[_opusIndex].match(/a=rtpmap:(\d+)\s(([\w-]+)(\/\d+)+)/)[1];
                const _mAudioIndex    = _sdpList.findIndex(row => row.indexOf('m=audio') !== -1);
                const _mAudioString   = _sdpList[_mAudioIndex].match(/^(m=audio \d+)\s([A-Z/]+)\s([\d\s]+)+/);
                const _mAudioPrio     = _mAudioString[3];
                const _newmAudioPrio  = _mAudioPrio.split(' ');
                const _currIndex      = _newmAudioPrio.indexOf(_rtpmapNr);
                _newmAudioPrio.splice(_currIndex, 1);
                _newmAudioPrio.splice(0, 0, _rtpmapNr);
                _mAudioString.pop();
                _mAudioString.shift();

                const _newmAudioString = _mAudioString.join(' ') + ' ' + _newmAudioPrio.join(' ');

                _sdpList[_mAudioIndex] = _newmAudioString

                jsep.sdp = _sdpList.join('\n');

                return jsep;
            }
        }

        const _handleIncomming = (self, msg) => {
            _handleLog("Incomming call from: " + msg._plainMessage?.plugindata.data.result.displayname);
            _handleLog("Incomming call at: "   + msg._plainMessage?.plugindata.data.result.username.split('@')[0].split(':')[1]);

            self.getUserMedia({ audio : _audioConstrains, video : false })
            .then(stream => {
                _handleLog("Success! We have a stream");
                self.createPeerConnection({
                    config : {
                        iceServers   : iceServerConfig
                    }
                });

                _handleLog("We have a Peerconnection");

                stream.getTracks().forEach(track => {
                    self.addTrack(track, stream);
                })

                _handleLog("Add local stream");

                self._pc.onaddstream = evt => {
                    _handleLog("Local stream added");
                    theirAudio.srcObject = evt.stream;
                }

                _handleLog("Added listener for incomming stream");

            })
            .then(() => {
                _handleLog("Create answer");
                return self.createAnswer(msg.get('jsep'));
            })
            .then(jsep => {
                _currentJsep = _customizeSdp(jsep);
                return self.handleIncommingCall(true);
            })
            .catch((e) => {console.error(e)})
        };

        function cmWebRTC() {
            let _this = this;

            Janus.MediaPlugin.apply(this, arguments);

            this.on('message', message => {
                // if(this._pc) {
                //     showPcLog(this._pc);
                // }

                let _data = message.getPluginData();
                if (_data?.result) {
                    switch(_data.result.event) {
                        case 'registering':
                            _handleLog('Registering');
                            break;
                        case 'registered':
                            _handleLog('Registered', _registeredCallbacks);
                            if(typeof _registeredCallbacks.registered == 'function') {
                                _registeredCallbacks.registered('-> Registered');
                            }
                            _deRegisterCallBacks('registered', 'registered_failed');
                            break;
                        case 'registration_failed':
                            _handleLog('Registration failed');
                            if (typeof _registeredCallbacks.registered_failed == 'function') {
                                _registeredCallbacks.registered_failed('-> Register Failed');
                            }
                            _deRegisterCallBacks('unregistered', 'unregistered_failed', 'registered', 'registered_failed');
                            break;
                        case 'unregistered':
                            _handleLog('Unregistered');
                            if (typeof _registeredCallbacks.unregistered == 'function') {
                                _registeredCallbacks.unregistered('-> Unregistered');
                            }
                            _deRegisterCallBacks('unregistered', 'unregistered_failed');
                            break;
                        case 'calling':
                            _handleLog('Calling');
                            break;
                        case 'incomingcall':
                            _handleLog('incomingcall');
                            if (_data?.result?.displayname.indexOf(IPCCC.LoginSession.Details.FullName) > -1) {
                                _handleIncomming(_this, message);
                            } else {
                                __msg = message;
                                _playRingTone();
                            }
                            let __sessionid = _this._session.getId();
                            Logging.WriteAlways(`[${currentLocalDateTimeISO()}] incomingcall from: ${_data?.result?.displayname}, login name: ${IPCCC.LoginSession.Details.FullName}, sessionid: ${__sessionid}`);
                            break;
                        case 'accepted':
                            _handleLog('Accepted');
                            _handleAccepted(_this, message);
                            break;
                        case 'progress':
                            _handleLog('Progress');
                            _handleProgress(_this, message);
                            break;
                        case 'proceeding':
                            _handleLog('Proceeding');
                            break;
                        case 'hangup':
                            _handleLog('Hangup');
                            _stopRingTone();
                            if (window.testCallOutTransactionId == message._plainMessage.transaction) {
                                _handleLog('Unblocking webRTCCall');
                                Logging.WriteAlways(`[${currentLocalDateTimeISO()}] Unblocking webRTCCall`);
                                window.testCallOutTransactionId = '';
                            }
                            // _this.hangup();
                            _this.closePeerConnection();
                            _currentJsep            = null;
                            // _dtmfSender             = null;
                            break;
                        // case 'reclaim':
                        //     //registerSip
                        //     if (_this.lastRegisterMessage !== null) {
                        //         _handleLog('Reclaim: Going to reregister');
                        //         _this.send(_this.lastRegisterMessage);
                        //     }
                        //     break;
                        default:
                            console.log('Unknown event:', _data.result.event);
                            _handleLog('Unknown event:', _data.result.event);
                            break;
                    }
                }
            });

            //detect JanusError messages
            this.on('error', error => {
                let _errorJanusMessage = error?.janusMessage,
                    _errorData = _errorJanusMessage?._plainMessage?.plugindata?.data,
                    _sessionid = _this._session.getId();

                console.error(`JanusError: ${_sessionid ? '[sessionid:' + _sessionid + ']' : ''} ${_errorData.error_code ? _errorData.error_code : error}  ${_errorData.error ? _errorData.error : ''}`);
                if (_errorData?.error_code) {
                    switch(_errorData.error_code) {
                        case 445:
                        case 447:
                            _handleErrorLog(`${_errorData.error_code ? _errorData.error_code : error}  ${_errorData.error ? _errorData.error : ''}`);
                            if (typeof _registeredCallbacks.unregistered_failed == 'function') {
                                _registeredCallbacks.unregistered_failed('-> unRegister Failed');
                                _deRegisterCallBacks('unregistered', 'unregistered_failed');
                            }
                            break;
                        default:
                            _handleErrorLog(`Unexpected error: ${_errorData.error_code ? _errorData.error_code : ''}  ${_errorData.error ? _errorData.error : ''}`);
                            break;
                    }
                }
            });

            _this.dtmfSender = null;

            _this.registerSip = (proxy, username, authuser, display_name, secret, resolve, reject) => {
                if(typeof resolve === 'function') {
                    _registeredCallbacks.registered = resolve;
                }

                if(typeof reject === 'function') {
                    _registeredCallbacks.registered_failed = reject;
                }

                _this.lastRegisterMessage = {
                    body : {
                        request      : "register",
                        proxy        : proxy,
                        username     : username,
                        authuser     : authuser,
                        display_name : display_name,
                        secret       : secret,
                    },
                    janus          : "message"
                };

                _this.send(_this.lastRegisterMessage);
                Logging.WriteAlways(`[${currentLocalDateTimeISO()}] register send, sessionId: ${_this._session._id ? _this._session._id : ''}`);
            };

            _this.unregisterSip = (proxy, username, authuser, display_name, secret, resolve, reject) => {

                if(typeof resolve === 'function')
                    _registeredCallbacks.unregistered = resolve;

                if(typeof reject === 'function')
                    _registeredCallbacks.unregistered_failed = reject;

                _this.send({
                    body : {
                        request      : "unregister",
                        proxy        : proxy,
                        username     : username,
                        authuser     : authuser,
                        display_name : display_name,
                        secret       : secret,
                    },
                    janus          : "message"
                });
                Logging.WriteAlways(`[${currentLocalDateTimeISO()}] unregister send, sessionId: ${_this._session._id ? _this._session._id : ''}`);
            }

            _this.pickUpIncommingCall = () => {

                _this.getUserMedia({ audio : _audioConstrains, video : false })
                .then(stream => {
                    _handleLog("Success! We have a stream");
                    if (!iceServerConfig || iceServerConfig.length === 0) console.error('iceServerConfig is undefined');
                    _this.createPeerConnection({
                        config : {
                            iceServers   : iceServerConfig
                        }
                    });

                    _handleLog("We have a Peerconnection");
                    stream.getTracks().forEach(track => {
                        _this.addTrack(track, stream);
                    })

                    _handleLog("Add local stream");

                    _this._pc.onaddstream = evt => {
                        _handleLog("Local stream added");
                        theirAudio.srcObject = evt.stream;
                        // console.log('Local audio stream added', evt); //Inboundcall
                    }

                    _handleLog("Added listener for incomming stream");

                })
                .then(() => {
                    _handleLog("Create answer");
                    return _this.createAnswer(__msg.get('jsep'));
                })
                .then(jsep => {
                    _currentJsep = _customizeSdp(jsep);
                    return _this.handleIncommingCall(true);
                })
                .catch((e) => {console.error(e)})

            }

            _this.handleIncommingCall = action => {
                if (action) {
                    _handleLog("Send accept and stopRingTone");
                    _stopRingTone();
                    let _message = {
                        body : {
                            audio   : _audioConstrains,
                            request : "accept"
                        },
                            jsep  : _currentJsep,
                            janus : "message"
                    }
                    return _this.sendWithTransaction(_message);
                } else {
                    _handleLog("Hangup is send to WFM, RingTone is stopped)");
                    _stopRingTone();
                    // azure - 21312
                    // let _message = {
                    //   body : {
                    //     request : "decline"
                    //   },
                    //   jsep  : _currentJsep,
                    //   janus : "message"
                    // }
                    // return _this.send(_message);
                    return true;
                }
            }

            _this.callOut = (uri) => {

                _this.getUserMedia({
                audio : _audioConstrains,
                video : false
                })
                .then(stream => {
                    _handleLog("Success! We have a stream");
                    _this.createPeerConnection({
                        config : {
                            iceServers   : iceServerConfig
                        }
                    });

                    _handleLog("Success! Peerconnection");

                    stream.getTracks().forEach(track => {
                        _this.addTrack(track, stream);
                    })
                })
                .then(() => {
                    _handleLog("Create offer")
                    return _this.createOffer();
                })
                .then(jsep => {
                    _handleLog('We have a jsep.');
                    let _message = {
                        "body"    : {
                        "audio"        : _audioConstrains,
                        "request"      : "call",
                        "uri"          : uri,
                        },
                        "jsep"    : jsep,
                        "janus"   : "message",
                    };
                    return _this.send(_message);
                })
                .catch(error => {
                    _handleLog('Error: ', error)
                });

            }

            _this.testCallOut = (uri) => {
                _handleLog("WebRTCTestCall initialisation");
                _this.getUserMedia({
                    audio : _audioConstrains,
                    video : false
                })
                .then(stream => {
                    _handleLog("Success! We have a stream");
                    _this.createPeerConnection({
                        config : {
                            iceServers   : iceServerConfig
                        }
                    });

                    _handleLog("Success! Peerconnection");

                    stream.getTracks().forEach(track => {
                        _this.addTrack(track, stream);
                    })
                })
                .then(() => {
                    _handleLog("Create offer")
                    return _this.createOffer();
                })
                .then(jsep => {
                    _handleLog('We have a jsep.');
                    let _message = {
                        "body"    : {
                        "audio"        : _audioConstrains,
                        "request"      : "call",
                        "uri"          : "sip:"+uri,
                        },
                        "jsep"    : jsep,
                        "janus"   : "message",
                    };
                    return _this.sendWithTransaction(_message);
                })
                .then(sendmessage => {
                    window.testCallOutTransactionId = sendmessage._plainMessage.transaction;
                })
                .catch(error => {
                    _handleLog('Error: ', error);
                    console.error(`'On WebRTC TestCallOut: testCallOut failed' ${error.message ? error.message : error}`);
                    window.testCallOutTransactionId = '';
                });
            }

            _this.sendDtmf = (key) => {
                let _message = {
                    "body"    : {
                        "audio"        : _audioConstrains,
                        "request"      : "dtmf_info",
                        "digit"        : key,
                    },
                    "jsep"    : _currentJsep,
                    "janus"   : "message",
                };
                return _this.send(_message);
            }

            _this.setOutputVolume = (val) => {
                theirAudio.volume     = val / 100;
                ringer.volume         = val / 100;
                extraRinger.volume    = val / 100;
            }

            _this.setInputVolume         = val => {
                _micVolume = Math.round(val / 100) * 2;
            }

            _this.setVoiceInput = (deviceId) => {
                _audioConstrains = {
                    deviceId: deviceId
                }
            }

            _this.setExtraRingtoneOutput = (deviceId) => {
                _stopRingTone();
                if (typeof extraRinger.setSinkId == "function") {
                    extraRinger.setSinkId(deviceId)
                    .then(() => {})
                    .catch((err) => console.error(err));
                } else {
                    console.error('Type error, setSinkId is not a function');
                }
            }

            _this.setVoiceOutput = (deviceId) => {
                _stopRingTone();
                if (typeof ringer.setSinkId == "function") {
                    ringer.setSinkId(deviceId)
                    .then(() => {
                        theirAudio.pause();
                        theirAudio.srcObject = null;
                        theirAudio.setSinkId(deviceId)
                        .then(() => {})
                        .catch((err) => console.error(err));
                    })
                    .catch((err) => console.error(err));
                } else {
                    console.error('Type error, setSinkId is not a function');
                    theirAudio.pause();
                    theirAudio.srcObject = null;
                }
            }

            _this.setRingtone = (soundFile) => {
                ringer.src      = window.siteroot + '/assets/sounds/' + soundFile;
                extraRinger.src = window.siteroot + '/assets/sounds/' + soundFile;
            }

            _this.destroyWebPhoneSession = () => {
                return new Promise((resolve, reject) => {
                    _this._session.destroy()
                    .then(() => {
                        resolve()
                    })
                    .catch((e) => {
                        reject(e)
                    })
                });
            }

        }


        app.config.globalProperties.$initSoftPhone = (websocketUrls, config) => {
            iceServerConfig = config;

            return new Promise((resolve, reject) => {
                cmWebRTC.NAME                  = 'janus.plugin.sip';
                cmWebRTC.prototype             = Object.create(Janus.MediaPlugin.prototype);
                cmWebRTC.prototype.constructor = cmWebRTC;

                Janus.Plugin.register(cmWebRTC.NAME, cmWebRTC);

                let janus = null,
                    jsession = null,
                    jconnection = null,
                    jplugin = null,
                    jsessionid = null,
                    jkeepalivetimer = null,
                    jkeepaliveinterval = 5000,
                    jretrycount = null,
                    jreconnecting = false,
                    count = 0,
                    l = websocketUrls.length;

                const jreconnect = () => {


                    if (!jretrycount) {
                        jretrycount = 1;
                    }

                    let seconds = -1;

                    switch (jretrycount) {
                        case 0:
                            seconds = 1;
                            break;
                        case 1:
                            seconds = 1;
                            break;
                        default:
                            seconds = jretrycount;
                            break;
                    }

                    if (jretrycount < 300) {
                        Logging.WriteAlways(`[${currentLocalDateTimeISO()}] Janus: Reconnecting attempt in: ${JSON.stringify(seconds)} seconds`);
                        setTimeout(() => createJanus(count % l), seconds * 1000);
                    }
                    else {
                        // Todo show connection error with reclaim button
                        jreconnecting = false;
                        Logging.WriteAlways('Failed to connect to Janus...')
                        jretrycount = 0;
                        count = 0;
                    }
                };

                const createJanus = (c) => {

                    janus = new Janus.Client(websocketUrls[c], {
                        keepalive      : jkeepaliveinterval,
                    });

                    janus.createConnection('client')
                    .then(function(connection) {
                        jconnection = connection;
                        jconnection.on('message', (msg) => {
                            clearTimeout(jkeepalivetimer);
                            jkeepalivetimer = setTimeout(() => {
                                jreconnecting = true;
                                jconnection.close()
                                .then(() => {
                                    jreconnect();
                                });
                            }, jkeepaliveinterval * 2);
                        });
                        jconnection.on('error', (error) => {
                            if (error.code && error.code == 458) {
                                clearTimeout(jkeepalivetimer);
                                jreconnecting = false;
                                jretrycount = 0;
                                count = 0;
                                console.log('Close jconnection');
                                jconnection.close()
                                .then(() => {
                                    window.resetBrowserPhone();
                                });
                            }
                            Logging.WriteAlways(`[${currentLocalDateTimeISO()}] Janus Connection Error code: ${error.code ? error.code : ''} message: ${error.message ? error.message : ''} reason: ${error.reason ? error.reason : ''}`);
                        });
                        return jconnection.createSession();
                    })
                    .then(function(session) {
                        if (!jreconnecting) {
                            jsession = session;
                            jsessionid = session.getId();
                            Logging.WriteAlways(`[${currentLocalDateTimeISO()}] Session created: ${session._id}`);
                            return session.attachPlugin(cmWebRTC.NAME);
                        } else {
                            //Reclaim (may not be necessary) //Then destroy //Then unregister //Then register (in need for review and refactoring to class, sorry, but this seems to be a solid sollution for connection loss)
                            let _sessionToDestroy = session._id;
                            session._id = jsessionid;
                            session.addPlugin(jplugin);
                            jconnection._id = jsessionid;
                            jconnection.addSession(session);
                            jplugin._session = session;
                            let _message = {
                                "janus": "claim",
                                "session_id": session._id,
                            };
                            session.send(_message);
                            Logging.WriteAlways(`[${currentLocalDateTimeISO()}] Claim, sessionId: ${session._id}`);
                            jsession = session;
                            jsessionid = session._id;
                            session.send({
                                "janus" : "destroy",
                                "session_id" : _sessionToDestroy
                            });
                            return jplugin;
                        }
                    })
                    .then(plugin => {
                        count = 0;
                        jretrycount = 0;
                        jplugin = plugin;
                        jreconnecting = false;
                        console.log(`[${currentLocalDateTimeISO()}] WebPhone says: New janus:connection/session/attachedPlugin created`);
                        resolve(plugin);
                    })
                    .catch(error => {
                        console.error(`[${currentLocalDateTimeISO()}] WebPhone says: New janus:connection/session/attachedPlugin error`);
                        if(count < l) {
                            count++;
                            createJanus(count % l);
                        } else {
                            if (jreconnecting) {
                                count = 0; //reset for retry
                                jretrycount++;
                                jreconnect();
                            } else {
                                reject(error);
                            }
                        }
                    });
                }

                createJanus(count);
            });
        }
        app.provide('initSoftPhone', app.config.globalProperties.$initSoftPhone);
    }
}