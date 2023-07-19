export class LineInfo {
    index						= -1;
    time						= '00:00:00';
    isAnswered					= false;
    name						= '-';
    dnis						= '-';
    number						= -1;
    caseId						= -1;
    isConnected					= false;
    isRinging					= false;
    isPBX						= false;
    isOutbound					= false;
    showConversationNote		= false;
    conversationNoteTemplate	= {};
    nvpData						= [];
    useCDC                      = false;
    pushUrl                     = 'about:blank';
}