export default class InputSelectProps {
    options = [];
    currentvalue = '';
    searchoptionsalsoby = null;
    inputtolowercase = false;

    /**
     * @options: object[]
     * @currentvalue: string
     * @searchoptionsalsoby: string
     * @inputtolowercase: boolean
     */
    constructor(options: object[] = [], currentvalue: string = '', searchoptionsalsoby: string = null, inputtolowercase: boolean = false) {
        this.options = options;
        this.currentvalue = currentvalue;
        this.searchoptionsalsoby = searchoptionsalsoby;
        this.inputtolowercase = inputtolowercase;
    }
}
