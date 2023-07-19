class NotificationLevel {
    static Ok = 0;
    static Warning = 1;
    static Error = 2;
}

class NotificationCodeType {
    static Unknown = -1;
    static Generic = 0;
    static FileNotFound = 1;
    static CompaniesNotFound = 2;
    static ServiceNumbersNotFound = 3;
    static RoutingGroupsNotFound = 4;
    static UsersNotFound = 5;
    static ScriptsNotFound = 6;
    static CannotOpenFile = 7;
    static CannotRemoveBillingRecordingInformation = 8;
    static CannotRemoveRecordingInformation = 9;
    static CannotRemoveFile = 10;
    static SystemException = 11;
    static InvalidApiId = 12;
    static InvalidProperties = 13;
    static FunctionNotAvailable = 14;
    static Nok = 15;
    static SessionNotFound = 16;
    static DeviceInUse = 17;
    static CredentialsNotOk = 18;
    static CompanyNotSet = 19;
    static DeviceNotFound = 20;
    static IllegalIdentifier = 21;
    static IncorrectUserState = 22;
    static DeviceNotSet = 23;
}

class ErrorRecoverabilityType {
    Inapplicable = 0;
    RecoverableError = 1;
    NonRecoverableError = 2;
}

class Notification {
    Code = NotificationCodeType.Nok;
    CodeNr = -1;
    NotificationLevel = NotificationLevel.Error;
    Message = "";
    NotificationCodeTypeName = "Nok";
    Recoverability = ErrorRecoverabilityType.Inapplicable;

    constructor(message, code, codeNr, notificationLevel, notificationCodeTypeName, recoverability) {
        this.Code = code || NotificationCodeType.Nok;
        this.CodeNr = codeNr || -1;
        this.NotificationLevel = notificationLevel || NotificationLevel.Error;
        this.Message = message;
        this.NotificationCodeTypeName = notificationCodeTypeName || "Nok";
        this.Recoverability = recoverability || ErrorRecoverabilityType.Inapplicable;
    }
}

export { Notification, NotificationLevel, NotificationCodeType, ErrorRecoverabilityType };