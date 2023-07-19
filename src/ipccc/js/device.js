import { IPCCC } from './ipccc.js';
import { IPCCCManager, IPCCCMessageTypes } from './manager.js';
import { EventDispatcher } from '../lib/eventdispatcher.js';
import { IPCCCDashboard } from './dashboard.js';
import { HttpClient } from '../lib/httpclient.js';

class IPCCCDevice {
    static SERVICEURL = "http://127.0.0.1:8080/device/";

    ConfigReceived = new EventDispatcher(null, false);
    Update = new EventDispatcher();

    CompanyCode = "";
    DeviceAddress = "";

    constructor(companycode, deviceAddress) { 
        if(!deviceAddress || deviceAddress === "") {
            deviceAddress = IPCCCDevice.getDeviceAddress();
        }

        this.CompanyCode = companycode;
        this.DeviceAddress = deviceAddress;
    }

    Start = () => {
        IPCCC.DeviceLogin(this.CompanyCode, this.DeviceAddress)
            .then(loginSession => {
                var subscription = loginSession.Details.Services[0];

                IPCCCDashboard.Subscribe(subscription,
                    data => this.Update.invoke(data))
                    .then(config => {
                        if (config) {
                            this.ConfigReceived.invoke(config);
                        }
                    }).catch(err => console.log("Failed to start devicedashboard", err));

                this.registerListeners();

            }).then(() => { IPCCCDevice.reload("Failed to login"); });
    }

    registerListeners = () => {
        IPCCCManager.MessageReceived.addHandler(message => {
            if (message === IPCCCMessageTypes.DeviceCommandReceived) {
                this.processDeviceCommand(request);
            }
        });

        //Also perform other tasks within the framework, so we attach to the events on IPCCC
        IPCCC.Disconnected.addHandler(reason => IPCCCDevice.reload(reason));
        IPCCC.SessionDisconnected.addHandler(() => IPCCCDevice.reload("SessionDisconnected"));
    }

    processDeviceCommand = request => {
        switch (request.Command.toLowerCase()) {
            case "identify":
                IPCCCDevice.Identify();
                break;
            case "reload":
            case "reloadpage":
                IPCCCDevice.reload("", 1);
                break;
            case "reboot":
                Reboot();
                break;
            case "execute":
                Execute(request.Parameters);
                break;
            default:
                console.error("Unsupported command received!");
        }
    }

    static getDeviceAddress = () => {
        var pathParts = window.location.pathname.split("/");

        if (pathParts[1].toLocaleLowerCase() === "device") return pathParts[2];
        else return pathParts[1];
    }

    static Identify = () => {
        var div = document.createElement("div");
        div.innerHTML = '<div style="position:absolute; bottom:10px; right:10px; width: 100px; height:100px; background-color:grey; text-align:center;z-index:999999"><h1 style="font-size: 250%; color: white;">*</h1></div>';

        div = div.firstChild;

        document.body.appendChild(div);

        setTimeout(() => {
            if (div) {
                document.body.removeChild(div);
            }
        }, 60000);
    }

    static reload = (reason, timeout) => {
        setTimeout(function () {
            window.location.reload();
        }, timeout || 60 * 1000);
    }

    static reboot = () => {
        IPCCCDevice.callService("reboot");
    }

    static execute = cmd => {
        var request = {
            Command: cmd
        }

        return IPCCCDevice.callService("execute", JSON.stringify(request));
    }

    static callService = (path, data) => {
        var httpClient = new HttpClient();

        return httpClient.Call(`${IPCCCDevice.SERVICEURL}${path}`, data, data ? "POST" : "GET", false, 200, "application/json;charset=UTF-8");
    }
}

export { IPCCCDevice }