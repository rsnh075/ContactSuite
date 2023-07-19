class HttpClient {
    GetJson = (url, data, useCache, expectedHttpStatus) => {
        if (data) {
            data = JSON.stringify(data);
        }

        return new Promise(
            (resolve, reject) => {
                this.Call(url, data, null, useCache, expectedHttpStatus)
                    .then(data => {
                            try {
                                var obj = JSON.parse(data);

                                resolve(obj);
                            } catch (err) {
                                reject(err);
                            }
                    }).catch(err => reject(err));
            });
    }

    Get = (url, useCache, expectedHttpStatus) => {
        return this.HttpCall(url, null, useCache, expectedHttpStatus);
    }

    Post = (url, data, useCache, expectedHttpStatus) => {
        return this.HttpCall(url, data, useCache, expectedHttpStatus);
    }

    Call = (url, data, method, useCache, expectedHttpStatus, contentType) => {
        if (typeof useCache === "undefined") {
            useCache = false;
        }

        if (!expectedHttpStatus) {
            expectedHttpStatus = 200;
        }

        if (!useCache) {
            url += "?_=" + new Date().getTime();
        }

        if (!method) {
            method = !data ? "GET" : "POST";
        }

        if (!data) {
            data = null;
        }

        return new Promise((resolve, reject) => {     
            var http = new XMLHttpRequest();
            if (contentType) {
                http.setRequestHeader("Content-Type", contentType);
            }
            http.open(method, url, true);       
            http.onreadystatechange = () => {
                if (http.readyState === 4) {
                    if (http.status === expectedHttpStatus) {
                        resolve(http.responseText);
                    } else {
                        reject(http.status, http.statusText, http.responseText);
                    }
                }
            }

            http.send(data);
        });
    }
}

export { HttpClient }