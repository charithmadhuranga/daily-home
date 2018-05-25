// A factory function to update status only when there is no pending request
let pending = 0;
var taskup = function() {
    pending++;
};

function done(jsObj) {
    if (--pending === 0) {
        if (jsObj) {
            for (var key in jsObj) {
                document.getElementById(key).checked = jsObj[key];
            }
        }
    }
};

// Get the server address
function getServer() {
    var server = "";
    if (serverAddr != "") {
        server = serverAddr;
    } else {
        var protocol = location.protocol;
        var slashes = protocol.concat("//");
        server = slashes.concat(window.location.hostname);
    }
    server = server.concat("/function/diot-gateway");
    return server;
};

		
function checkval(event) {
            var url = getServer();
            var xmlHttp = new XMLHttpRequest();

            var reqData = {};
            reqData["method"] = "state";
            reqData["device"] = deviceName;
            data = JSON.stringify(reqData);

            xmlHttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status != 200) {
                    alert("Failed to get state from : " + url);
                    return;
                }
                if (this.readyState == 4 && this.status == 200) {
                    var jsObj = JSON.parse(this.responseText);
                    let data = JSON.stringify(jsObj[deviceName], null, 4);
                    alert(data);
                }
            };
            xmlHttp.open("POST", url, true);
            xmlHttp.setRequestHeader('token', apiToken);
            xmlHttp.setRequestHeader('accept', "application/json");
            xmlHttp.setRequestHeader("Content-Type", "application/json");
            xmlHttp.send(data);
};


// Check state of switches as a json string
document.getElementById("logout").addEventListener("click", function(event) {
    document.cookie = "diottoken=invalid";
    document.location.reload();
});

// Check if any switch state has changed
document.getElementsByName("switch").forEach(function(elem) {
    elem.addEventListener("click", function(event) {
        switchId = elem.getAttribute("id");
        taskup();

        var initialVal = !elem.checked;
        var value = elem.checked ? 'enable' : 'disable';
        var url = getServer();

        var reqData = {};
        reqData["socket"] = switchId;
        reqData["method"] = value;
        reqData["device"] = deviceName;
        let data = JSON.stringify(reqData);

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status != 200) {
                    done();
                    document.getElementById(switchId).checked = initialVal;
                    console.log("Failed to change switch state from : " + (initialVal ? "enable" : "disable"));
                } else {
                    var myObj = JSON.parse(this.responseText);
                    done(myObj);
                }
            }
        };
        xmlHttp.open("POST", url, true);
        xmlHttp.setRequestHeader('token', apiToken);
        xmlHttp.setRequestHeader('accept', "application/json");
        xmlHttp.setRequestHeader("Content-Type", "application/json");
        xmlHttp.send(data);
    });
});

function addhandler() {
	if (document.getElementById("checkval")) {
		// Check state of switches and alert as a json string
		document.getElementById("checkval").addEventListener("click", checkval);
	}
};

// Update switch state autometically in every 2 sec
setInterval(function() {
    var url = getServer();
    var xmlHttp = new XMLHttpRequest();
    var reqData = {};
    reqData["method"] = "state";
    let data = JSON.stringify(reqData);

    xmlHttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myObj = JSON.parse(this.responseText);
            var jsObj = myObj[deviceName];
            // Update only when no pending task
            if (pending === 0) {
                for (var key in jsObj) {
                    document.getElementById(key).checked = jsObj[key];
                }
            }
        } else if (this.readyState == 4 && this.status != 200) {
            console.log("Failed to get state from : " + url);
        } else {}
    };
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader('token', apiToken);
    xmlHttp.setRequestHeader('accept', "application/json");
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(data);
}, 2000);

addhandler();
