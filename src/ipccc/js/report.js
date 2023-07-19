import { IPCCC } from './ipccc.js';
import { LoadScript, RemoveScript } from '../lib/scriptsloader.js';
import { HttpClient } from '../lib/httpclient.js';
import { IPCCCUserSettings } from './usersettings.js';

class IPCCCReport {
    static ic3reporting = null;
    static loaded = false;
    static role = null;
    static customerId = null;
    static userId = null;

    static Load = (role, customerId, userId) => {
        return new Promise(
            (resolve, reject) => {
                IPCCCReport.ChangeProfile(role, customerId, userId)
                    .then(() => {
                        IPCCCReport.LoadICCube()
                            .then(ic3reporting => resolve(ic3reporting));
                    });
            });       
    }

    static ChangeProfile = (role, customerId, userId) => {
        if (!role) { role = ""; }
        if (!customerId) { customerId = -1; }
        if (!userId) { userId = -1; }

        return new Promise(
            (resolve, reject) => {
                //Change when role, customerId or userId has been changed
                if (IPCCCReport.role === null ||
                    role !== IPCCCReport.role ||
                    customerId !== IPCCCReport.customerId ||
                    userId !== IPCCCReport.userId) {

                    IPCCCReport.Logout().then(() => {
                        IPCCCReport.Authorize(role, customerId, userId).then(() => {
                            //Save new UserProfile, after the logout has been successfull
                            IPCCCReport.role = role;
                            IPCCCReport.customerId = customerId;
                            IPCCCReport.userId = userId;

                            resolve();
                        });
                    });
                }
                else { resolve(); }
            });   
    }

    static OpenIDE = (container) => {
        //Creating a clone from the container to place on top so we don't mess-up the container and reports can be showed after closing, 
        //this will fail on some point when not set absolutely but we will deal with that later if needed!
        var idecontainer = container.cloneNode(false);
        idecontainer.style.zIndex = 9999;
        idecontainer.style.display = "block";
        idecontainer.id = "reportidecontainer";
        container.parentElement.appendChild(idecontainer);

        IPCCCReport.ChangeProfile("administrator", -1, -1)
            .then(() => {
                var parser = document.createElement('a');
                parser.href = IPCCCSettings.ReportURL;

                var consoleURL = parser.protocol + "//" + parser.hostname;
                if ((parser.protocol === "http:" && parser.port !== 80) || (parser.protocol === "https:" && parser.port !== 443)) {
                    //not a default port
                    consoleURL += ":" + parser.port;
                }

                //add console path, seems to be fixed!
                consoleURL += "/icCube/console";

                var ideframe = document.createElement("iframe");
                ideframe.src = consoleURL;

                ideframe.style = "position: relative; width: 100%; height: 100%; border: 0px;";

                idecontainer.appendChild(ideframe);
            });
    }

    static CloseIDE = () => {
        var idecontainer = document.getElementById("reportidecontainer");

        if (idecontainer) {
            idecontainer.remove();
        }
    }

    static Logout = () => {
        return new Promise(
            (resolve, reject) => {
                IPCCCReport.LoadScript("Logout").then(
                    () => {
                        //Remove the current UserProfile
                        IPCCCReport.role = null;
                        IPCCCReport.customerId = null;
                        IPCCCReport.userId = null;

                        IPCCCReport.RemoveScript();

                        resolve();
                    });
            });
    }

    static Authorize = (role, customerId, userId) => {
        return new Promise((resolve, reject) => {
            IPCCC.User().then(user => {
                IPCCCReport.CallProxy("Authorize", {
                    AccessToken: user.access_token,
                    Role: role,
                    CustomerId: customerId,
                    UserId: userId,
                    SessionId: IPCCC.SessionId
                }).then(url => {
                    IPCCCReport.LoadScript(url).then(() => resolve());
                });
            });
        });
    }

    static CallProxy = (relativeUrl, data) => {
        var client = new HttpClient();

        return client.Call(IPCCCReport.CompleteUrl(relativeUrl), JSON.stringify(data), null, true, 202);
    }

    static LoadScript = (relativeUrl) => {
        IPCCCReport.RemoveScript();

        return LoadScript(IPCCCReport.CompleteUrl(relativeUrl), true, false, "IPCCCReportScript");  
    }

    static RemoveScript = () => {
        RemoveScript("IPCCCReportScript");        
    }

    static CompleteUrl = (url) => {
        if (!url) {
            url = "";
        }

        var absoluteUrl = url.toLowerCase().startsWith("http");

        return `${absoluteUrl ? "" : IPCCC.Settings.ReportURL}${url}`;
    }

    static LoadICCube = () => {
        return new Promise((resolve, reject) => {
            if (!IPCCCReport.loaded) {
                IPCCCReport.LoadScript("doc/ic3-report/app/reporting/js/loader/ic3bootstrap.js")
                    .then(() => {
                        IPCCCReport.Setup()
                            .then(ic3reporting => {
                                IPCCCReport.ic3reporting = ic3reporting;
                                resolve(ic3reporting);
                            });
                        });

                IPCCCReport.loaded = true;
            }
            else {
                resolve(IPCCCReport.ic3reporting);
            }
        });
    }

    static FixStylingIssues = () => {
        var GetStyleSheet = (filename) => {
            var repstylesheets = document.querySelectorAll("link[rel='stylesheet'][type='text/css'][href^='" + IPCCCReport.CompleteUrl() + "']");

            for (var idx = 0; idx < repstylesheets.length; idx++) {
                var stylesheet = repstylesheets[idx];

                if (stylesheet.href.indexOf(filename) > 0) {
                    return stylesheet;
                }
            }

            return null;
        }

        var stylesheet = GetStyleSheet("/bootstrap.min.css");

        if (stylesheet) { stylesheet.disabled = true; }
    }

    static Setup = () => {
        return new Promise((resolve, reject) => {
            ic3ready({
                root: IPCCCReport.CompleteUrl("doc/ic3-report/app/"),
                rootLocal: IPCCCReport.CompleteUrl("doc/ic3-report/app-local/"),
                server: {
                    crossOriginAllowed: true,
                },
                callback: _ => {
                    IPCCCReport.FixStylingIssues();
                    resolve(IPCCCReport.CreateReporting());
                }
            });
        });        
    }

    static CreateReporting = () => {  
        return new ic3.Reporting({
                dsSettings: {
                    url: IPCCCReport.CompleteUrl("gvi")
                },
                customizationUrl: IPCCCReport.CompleteUrl("doc/ic3-report/app-local/defaults.json")
            });
    }

    static OpenReport = (container, customerId, reportName, obj, userId) => {

        let _reportName = reportName.split('/');

        window.ICC_APPID        = 'BI_Dashboards_' + _reportName[2];
        window.ICC_REPORTNAME   = _reportName[2];

        //Dirty hack for icCube local-report.js (23160)
        window.preload = {
            show : () => {},
            hide : () => {}
        };

        window.IPCCCManager = {
            GetUserSettings : (appId = window.ICC_APPID, success, error) => {
                IPCCCUserSettings.Get(appId)
                .then(result => {
                    success(result);
                })
                .catch(error => console.error(error));
            },
            DeleteUserSetting : (appId = window.ICC_APPID, name = window.ICC_SELECTEDPRESETNAME, success, error) => {
                IPCCCUserSettings.Delete(appId, name)
                .then(result => {
                    success(result);
                })
                .catch(error => console.error(error));
            },
            SaveUserSetting : (appId = window.ICC_APPID, name = window.ICC_SELECTEDPRESETNAME, data = window.ICC_CURRENTFILTERCONFIG, success, error) => {
                IPCCCUserSettings.Save(appId, name, data)
                .then(result => {
                    success(result);
                })
                .catch(error => console.error(error));
            }
        }

        IPCCCReport.CloseIDE();

        //If no customerId/userId has been given we take the ones already used
        if (!customerId) {
            customerId = IPCCCReport.customerId;
            userId = IPCCCReport.userId;
        } else if (!userId) {
            userId = -1;
        }

        return new Promise((resolve, reject) => {
            IPCCCReport.Load("", customerId, userId)
                .then(ic3reporting => {
                    window.ICC_IC3REPORTING = IPCCCReport.ic3reporting;
                    ic3reporting.setupGVIConfiguration(
                        () => {
                            ic3reporting.setupApplication({
                            container: container
                        });

                    ic3reporting.openReport({
                        report: {
                            name: reportName,
                            params: obj ? JSON.stringify(obj) : null
                        }
                    }, _ => {
                        resolve();
                    });
                });
            });
        });
    }
}

export { IPCCCReport }