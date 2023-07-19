export default class Contact {
    Id                : number;
    FirstName         : string;
    InFix             : string;
    LastName          : string;
    Department        : string;
    CompanyName       : string;
    Description       : string;
    UserId            : number;
    SessionId         : string;
    StatusId          : number;
    StatusDate        : string;
    ActiveNumber      : string;
    DisplayNumber     : string;
    StatusText        : string;
    Addresses         : object[];
    IsMe              : boolean;
    Status            : {
        StatusId      : number;
        Label         : string;
        Color         : string;
    }
    IsColleague       : number;
    IsContact         : number;
    IsOnline          : number;
    InMyDepartment    : number;

    constructor(contact:string = 'user') {
        this.Id             = -1;
        this.FirstName      = "";
        this.InFix          = "";
        this.LastName       = "";
        this.Department     = "";
        this.CompanyName    = "";
        this.Description    = "";
        this.UserId         = -1;
        this.SessionId      = "";
        this.StatusId       = -1;
        this.StatusDate     = new Date().toISOString();
        this.ActiveNumber   = "";
        this.DisplayNumber  = "";
        this.StatusText     = "";
        this.Addresses      = [];
        this.IsMe           = false;
        this.Status         = {
            StatusId : -1,
            Label : "",
            Color : ""
        };
        this.IsColleague    = 0;
        this.IsContact      = contact == 'user' ? 0 : 1;
        this.IsOnline       = 0;
        this.InMyDepartment = 0;
    }
}
