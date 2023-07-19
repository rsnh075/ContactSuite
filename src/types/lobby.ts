import { timeToClockHHMMSS } from '../use/dateFunctions';

export class LobbyCase
    {
        public ANI:string = "";
        public Note:string = "";
        public UserName:string = "";
        public RoutinggroupId:number = -1;
        public RoutinggroupName:string = "";
        public LobbyEntryTime = "";
        public LobbyWaitingTime = "";
        public WFMcaseId:number = -1;
        public CustomerId:number = -1;

        // For GUI testing
        // constructor() {
        //     this.ANI = "199";
        //     this.Note = "Note tekst";
        //     this.UserName = "Erik Rosenhart"
        //     this.RoutinggroupId = 235;
        //     this.RoutinggroupName = "ErikRG A";
        //     this.LobbyEntryTime = new Date().toISOString();
        //     this.WFMcaseId = 293359;
        //     this.CustomerId = 1;
        //     LobbyCase.CalcLobbyWaitingTime(this);
        // }

        static CalcLobbyWaitingTime =
            (lobbycase:LobbyCase) => {
                let _time       = '00:00:00',
                _msStartTime    = new Date(lobbycase.LobbyEntryTime).getTime(),
                _msNow          = new Date().getTime(),
                _msDiff         = _msNow - _msStartTime;

                if(_msDiff > 0) {
                    _time             = timeToClockHHMMSS(_msDiff);
                } else {
                    _time             = '00:00:00';
                }
                lobbycase.LobbyWaitingTime = _time;
                return lobbycase;
            }
    }

    export class PutInLobbyData
    {
        public Note:string = "";

        constructor(note:string) {
            this.Note = note;
        }
    }