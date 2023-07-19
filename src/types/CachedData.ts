export default class CachedData {
    asyncFunc = null;
    subMode = false;
    idField = "id";
    error = null;
    data = null;
    busy = false;
    requests = [];

    constructor(asyncFunc, subMode = false, idField = "id", error = null) {
        this.asyncFunc = asyncFunc;
        this.subMode = subMode;
        this.idField = idField;
        this.error = error;
        this.data = null;
        this.busy = false;
        this.requests = [];
    }

    async getDataObject(mainId) {
        if (!this.subMode) {
            return this.data;
        }

        let subdata = this.data.find((subObject) => subObject.id === mainId);
        if (!subdata) {
            subdata = { id: mainId, data: null };
            this.data.push(subdata);
        }

        return subdata.data;
    }

    async setDataObject(data, mainId) {
        const dataObject = { id: mainId, data };
        if (!this.subMode) {
            this.data = data;
        } else {
            const index = this.data.findIndex((subObject) => subObject.id === mainId);
            if (index >= 0) {
                this.data[index] = dataObject;
            } else {
                this.data.push(dataObject);
            }
        }
    }

    async retrieve(mainId) {
        if (this.busy) {
            this.requests.push({ mainId });
            return;
        }

        this.busy = true;
        try {
            const data = await this.asyncFunc(mainId); // make async API call
            this.setDataObject(data, mainId);
            this.requests.forEach((request) => {
                this.read(request);
            });
        } catch (err) {
            this.error && this.error(err);
            this.requests = [];
        } finally {
            this.busy = false;
        }
    }

    async read(request) {
        const data = await this.getDataObject(request.mainId);
        const foundData = data && data.find((d) => d[this.idField] === request.id);
        if (foundData) {
            request.found && request.found(foundData);
        } else {
            this.get(request.id, request.found, request.mainId, true);
        }
    }

    async get(id, found, mainId, reretrieve = false) {
        if (id === -1) {
            found(null);
            return;
        }

        const request = { id, found, mainId };
        const data = await this.getDataObject(mainId);
        const hasData = data && !!data.length;

        if (!this.busy && hasData && !reretrieve) {
            this.read(request);
        } else {
            this.requests.push(request);
            if (!this.busy) {
                this.retrieve(mainId);
            }
        }
    }
};

// const myApi = {
//     getData: async (mainId) => {
//         // Make async API call and return data
//         const data = await setTimeout((mainId) => {return 'data' + mainId},10000); // your async data retrieval code here
//         return data;
//     },
//     // getSubdata: async (subId, callback, errorCallback) => {
//         //   // Make async API call with subId and return data
//         //   const data = await ...; // your async data retrieval code here
//         //   return data;
//     // }
// };

// const myCache = new CachedData(myApi.getData);

// myCache.get(1, (data) => {
//     console.log(data); // logs the data for object with id 1
// }, 1, false);