export class FilterDataOptions {
    public CustomerId:number = -1;
    public Destinations:object[] = [];
    public MinRecordingLength:number = -1;
    public MaxRecordingLength:number = -1;
    public Routinggroups:object[] = [];
    public Scripts:object[] = [];
    public Senders:object[] = [];
    public Users:object[] = [];
    public NoteColors:object[] = [];
    public Categories:object[] = [];
    public Subcategories:object[] = [];
    public Reasons:object[] = [];
}

export class FilterDataRequestValues {
    public From:string = "";
	public Till:string = "";
    public Type:number = 2;
    public CustomerId:number = -1;
}

export class FilterDataValues {
    public Routinggroups:object[] = [];
    public Destinations:object[] = [];
    public Scripts:object[] = [];
    public Senders:object[] = [];
    public Users:object[] = [];
    public MinLength:number = -1;
    public MaxLength:number = -1;
    public NoteColors:object[] = [];
    public RecordingId:string = "";
    public CaseId:number = -1;
    public Categories:object[] = [];
    public Subcategories:object[] = [];
    public Reasons:object[] = [];
}

export class EnumFilterDataValues {
    static Routinggroups = 'Callgroup';
    static Destinations = 'Destination';
    static Scripts = 'Script';
    static Senders = 'Sender';
    static Users = 'UserName';
    static NoteColors = 'Color';
    static RecordingId = 'Id';
    static Categories = 'Category';
    static Subcategories = 'Subcategory';
    static Reasons = 'Reason';
}

export class EnumNoteColors {
    static Blue = '#037CAF';
    static Brown = '#825E5C';
    static Yellow = '#FFFC7F';
    static LightGreen = '#D2EE82';
    static Gray = '#BDC3C7';
    static Green = '#6ABC45';
    static Orange = '#F39200';
    static Purple = '#662483';
    static Red = '#D91E18';
    static Violet = '#CF2F74';
    static LightBrown = '#B28879';
    static Black = '#000000';
}

export class EnumPRRequestType {
    static Filters = 1;
    static Search = 2;
    static SetProperties = 3;
    static SetFragmentProperties = 4;
    static GetFragments = 5;
}

export class RecordingFragment {
    public Color = '';
    // public Customer = '';
    public CustomerId = -1;
    public Delete = false;
    public End = -1;
    public Id = '';
    public Note = '';
    public PartId = -1;
    public Start = -1;
    public Type = EnumPRRequestType.SetFragmentProperties;
    // public User = '';
    // public UserId = -1;
}

export class MultiRangeScale {
    static Scale = [
        {
            From : 0,
            To : 20,
            Step : 2,
            Itterations : 10,
            Percentage : 10
        },
        {
            From : 20,
            To : 100,
            Step : 5,
            Itterations : 15,
            Percentage : 25
        },
        {
            from : 100,
            To : 200,
            Step : 10,
            Itterations : 10,
            Percentage : 35
        },
        {
            from : 200,
            To : 500,
            Step : 50,
            Itterations : 15,
            Percentage : 50
        },
        {
            from : 500,
            To : 1000,
            Step : 50,
            Itterations : 10,
            Percentage : 60
        },
        {
            from : 1000,
            To : 2000,
            Step : 100,
            Itterations : 10,
            Percentage : 70
        },
        {
            from : 2000,
            To : 5000,
            Step : 200,
            Itterations : 15,
            Percentage : 85
        },
        {
            from : 5000,
            To : 12500,
            Step : 500,
            Itterations : 15,
            Percentage : 100
        }
    ]
}

export class EnumRecordingType {
    static NotSet = -1;
     /// Automatische opname door systeem
    static Automatic = 1;
    // Opname door agent/PBX gestart
    static PBX = 2;
    static Voicemail = 3;
    static GroupVoicemail = 4;
    static Gorilla = 5;
    // Vergaderopname
    static Meeting = 6;
    // Persoonlijke welkomstboodschap
    static PersonalWelcome = 7;
    static KTOanswer = 8;
    // Quality Monitoring
    static QM = 9;
    static Fax = 10;
    // SIPchat conversaties
    static Chat = 11;
    // Consulenten advertentie t.b.v. carrousel
    static ConsultantAdvertisement = 13;
}