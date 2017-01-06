var getStat = function (index) {
    var numberParts = $($("#menu .listing")[index]).text().split(":")[1].trim().split(',').join("").split("(")[0].split(" ");
    
    return numberParts[0].replace(",", "") + "♥" + numberParts[1];
}

var prepareRequest = function () {
    var statsOpened = $("#menu").find(".section").text() === "Statistics";
    if (!statsOpened) {
        $("#statsButton").click();
    }

    var request = {
        CookiesBaked: getStat(1),
        CookiesInBank: getStat(0),
        Cps: getStat(5)
    };

    if (!statsOpened) {
        $("#statsButton").click();
    }

    return request;
}

var address = "http://we0457/ClickOff/api/Results?name=";
var sendData = function (name) {
    $.ajax({
        url: address + name,
        method: 'POST',
        async: true,
        data: prepareRequest()

    });
}

var report = true;
var reportData = function (name, timeout) {
    sendData(name);
    if (!report) {
        return;
    }

    setTimeout(reportData, timeout, name, timeout);
}