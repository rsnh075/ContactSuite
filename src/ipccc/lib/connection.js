import { Logging, LogLevelFilter } from './logging.js';
import { EventDispatcher } from './eventdispatcher.js';

Logging.AddLevelFilter(new LogLevelFilter("\[[[0-9\-:TZ.]{1,}\] Debug:"));

class Connection {
    Connected = new EventDispatcher(null, false);
    Received = new EventDispatcher(null, false);
    Disconnected = new EventDispatcher(null, false);
    ConnectionError = new EventDispatcher(null, false);
    StatusChanged = new EventDispatcher(null, false);

    autoReconnect = null;
    server = null;
    port = null;

    constructor(autoReconnect, server, port) {
        this.autoReconnect = autoReconnect;
        this.server = server;
        this.port = port;
    }

    loadSignalR = callback => {
        import(/* @vite-ignore */`${this.getServerAddress()}/client/js/signalrloader.js`).then(() => { signalrloader(callback); });
    }

    getServerAddress = () => {
        return `https://${this.server}:${this.port}`;
    }

    _connection = null;
    _connected = false;
    _connectionIsUp = false

    Connect = async () => {
        this.loadSignalR(() => {
            this._connection = this.createConnection();
            this._connection.on("NewConnection",
                () => {
                    console.log('CS: NewConnection');
                    // Bugfix: always assume connected on new connection (don't check because of timinge issue)
                    this._connected = true;
                    this._connectionIsUp = true;
                    this.Connected.invoke(this);
                });

            this._connection.on("Reconnected",
                () => {
                    console.log('CS: Reconnected');
                    if (this._connected) {
                        this._connectionIsUp = true;

                        this.StatusChanged.invoke(this._connectionIsUp);
                    }
                });

            this._connection.on("ServerResponse",
                message => {
                    try {
                        this.Received.invoke(message);
                    }
                    catch (err) {
                        console.warn("CS: Failed to process message from the server!", message, err);
                    }
                });

            this._connection.onreconnecting(error => {
                console.log('CS: onreconnecting');
                if (this._connected) {
                    this._connectionIsUp = false;

                    this.StatusChanged.invoke(this._connectionIsUp, error);
                }
            });

            this._connection.onreconnected(connectionId => {
                console.log('CS: onreconnected');
                if (this._connected && !this._connectionIsUp) {
                    this._connectionIsUp = true;
                }
            });

            this._connection.onclose(error => {
                if (this._connected) {
                    this._connectionIsUp = false;

                    //We need this because when the connection is closed through the server and/or management page the automatic reconnect stuff isn't triggered!
                    this._connection.start();

                    this.Disconnected.invoke(error);
                }

            });

            this._connection.Connect();
        });
    };

    createConnection = () => {
        return new signalrconnection({
            url: this.getServerAddress() + "/guiserver",
            connected: () => {
                this._connected = true;
                this._connectionIsUp = true;
            },
            debuglevel: signalR.LogLevel.Debug,
            msgpack: false, //getParam("msgpack") ? true : false,
            connectionerror: (error, retryCount) => {
                if (!retryCount) {
                    retryCount = 0;
                }

                var seconds = -1;

                switch (retryCount) {
                    case 0:
                        seconds = 1;
                        break;
                    case 1:
                        seconds = 1.5;
                        break;
                    default:
                        seconds = retryCount * 1.5;
                        break;
                }

                if (retryCount < 4) {
                    console.log("CS: Waiting to retry connect: " + seconds);
                    setTimeout(() => this.connection.Connect(retryCount + 1), seconds * 1000);
                }
                else {
                    this.ConnectionError.invoke();
                }
            },
            autoreconnect: !this.autoReconnect ? false : {
                nextRetryDelayInMilliseconds: retryContext => {
                    var seconds = -1;

                    switch (retryContext.previousRetryCount) {
                        case 0:
                            seconds = 1;
                            break;
                        case 1:
                            seconds = 1.5;
                            break;
                        default:
                            seconds = retryContext.previousRetryCount * 1.5;
                            break;
                    }

                    return seconds > -1 ? seconds * 1000 : null;
                }
            },
            serverTimeoutInMilliseconds: 10 * 1000
        });
    };

    send = (message) => {
        this._connection.invoke("ClientRequest", message);
    };

    close = () => {
        this._connected = false;
        this._connectionIsUp = false;
        this._connection.stop();
    };
}

export { Connection };