var clickerEnabled = true;
var buyerEnabled = true;
var buyBuildings = true;
var buyUpgrades = true;
var stopClicker = false;
var stopBuyer = false;

var reUpgradeDataFunction = /Game\.crate\(Game\.UpgradesById\[\d+\],\'store\',undefined,undefined,\d\)\(\);/;
var reWrathCookie = /wrathCookie\.png/

var jq = document.createElement('script');
jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js";
document.getElementsByTagName('head')[0].appendChild(jq);

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message) {
	var output = '-----------\n';
	output += message;
	console.warn(output);
}

var autoClicker = async function() {
	if (stopClicker) {
		return;
	}

	if(clickerEnabled){
		$("#bigCookie").click();
		var shimmers = $("#shimmers").children().each(function() {
		    var wrathCookie = reWrathCookie.exec($(this).attr("style"));
            if (wrathCookie === null) {
                $(this).click()
            }
		});

		await sleep(1);
	}
  
	return autoClicker();
};

var openSpecialMenu = async function() {
    menuClosed = true;
    while (menuClosed) {
        if (Game.specialTabs.length !== 0) {
            Game.specialTab = Game.specialTabs[0];
            menuClosed = false;
        }
        await sleep(10);
    }
}

var autoBuyer = async function() {
	if (stopBuyer) {
		return;
	}

	if(buyerEnabled){
		
		await sleep(100);

		BuyUpgrades();

        if (MultipleBuffsAreActive) {
            buyBuildings = false;
        }

		if (buyBuildings) {
		    BuyBuilding();
		    ShouldBuyUpgrade();
		}
	}
	
	return autoBuyer(index);
};

function BuyUpgrades() {
    if (buyUpgrades) {
        var toggleUpgrade = $("#toggleUpgrades").find("#upgrade0.enabled")
        if (toggleUpgrade !== 0) {
            toggleUpgrade.click();
        }

        $("a.option.framed.large.title").click();

        $("#techUpgrades").find(".crate.upgrade.enabled").click();
        var upgrades = $("#upgrades").find(".crate.upgrade.enabled");
        if (upgrades.length !== 0) {
            upgrades.click();
            buyBuildings = true;
            if (MultipleBuffsAreActive) {
                buyBuildings = false;
            }
        }

        if ($("#prompt").is(":visible")) {
            $("#promptOption0").click();
        }
    }
}

function BuyBuilding() {

    var availableShopIndex = -1;
    var previousAvailableShopRatio = 0;

    var availableShops = $(".product.unloced.enabled");
    for (var i = 0; i < availableShops.length; i++) {
        var availableShopPriceText = $(availableShops[i]).find(".price").text();
        var availableShopPrice = GetAmount(availableShopPriceText);

        var cookiesPerSecondText = $(Game.ObjectsById[i].tooltip()).find(".data b").first().text();
        var cookiesPerSecond = GetAmount(cookiesPerSecondText);

        var availableShopRatio = cookiesPerSecond / availableShopPrice;
        if (availableShopRatio > previousAvailableShopRatio) {
            availableShopIndex = i;
        }
    }

    var index = -1;
    var previousRatio = 0;

    var shops = $(".product.unlocked");
    for(var i = 0; i < shops.length; i++) {

        var buildingPriceText = $(shops[i]).find(".price").text();
        var buildingPrice = GetAmount(buildingPriceText);
        var timeToBuyBuilding = GetRemainingTimeToBuyUpdate(buildingPrice);

        var profitText =  $(Game.ObjectsById[i].tooltip()).find(".data b").first().text();
        var profit = GetAmount(profitText);
		
        if (isNaN(profit)) {

            if (timeToBuyBuilding <= 60) {
                index = i;
                break;
            }

            continue;
        }

        var haveEnoughtMoney = $(shops[i]).hasClass("enabled");
        if (!haveEnoughtMoney && timeToBuyBuilding <= 60 || haveEnoughtMoney){
            var ratio = profit / buildingPrice;
            if (ratio > previousRatio) {
                previousRatio = ratio;
                index = i;
                continue;
            }
        }
    }

    if (index !== -1){
        $("#product" + index).click();
    }
}

function MultipleBuffsAreActive() {
    if ($("#buffs").length >= 2) {
        return true;
    }

    return false;
}

function ShouldBuyUpgrade() {
    if (buyUpgrades && $(".product.unlocked.enabled").length === 0 && $(".product.unlocked").length !== 0) {

        var upgradePrice = GetUpgradePrice();
        var timeToBuyUpgrade = GetRemainingTimeToBuyUpdate(upgradePrice);

        if (timeToBuyUpgrade <= 60) {
            buyBuildings = false;
        }

        if (buyBuildings && timeToBuyUpgrade <= 300) {
            var shops = $(".product.unlocked");
            buyBuildings = false;
            for (var i = 0; i < shops.length; i++){
                var buildingPriceText = $(shops[i]).find(".price").text();
                var buildingPrice = GetAmount(buildingPriceText);
                var timeToBuyBuilding = GetRemainingTimeToBuyUpdate(buildingPrice);
																				
                if (timeToBuyBuilding < 180) {
                    buyBuildings = true;
                }
            }
        }
    }
}

var wrinklerKiller = async function() {
	while(true){
		await sleep(100);
		var wrinklers = Game.wrinklers;
		for(var i = 0; i < wrinklers.length; i++){
			wrinklers[i].hp = 0;
		}
	}
}

function GetAmount(text) {
	var amountText = text.toString().split(" ");
	var amountMultiplier = 1;
	if (amountText[1] === "million") {
		amountMultiplier = Math.pow(10, 6);
	} else if (amountText[1] === "billion"){
		amountMultiplier = Math.pow(10, 9);
	} else if (amountText[1] === "trillion"){
		amountMultiplier = Math.pow(10, 12);
	} else if (amountText[1] === "quadrillion"){
		amountMultiplier = Math.pow(10, 15);
	} else if (amountText[1] === "quintillion"){
		amountMultiplier = Math.pow(10, 18);
	} else if (amountText[1] === "sextillion"){
		amountMultiplier = Math.pow(10, 21);
	} else if (amountText[1] === "septillion"){
		amountMultiplier = Math.pow(10, 24);
	} else if (amountText[1] === "octillion"){
		amountMultiplier = Math.pow(10, 27);
	} else if (amountText[1] === "nonillion"){
		amountMultiplier = Math.pow(10, 30);
	} else if (amountText[1] === "decillion"){
		amountMultiplier = Math.pow(10, 33);
	} else if (amountText[1] === "undecillion"){
		amountMultiplier = Math.pow(10, 36);
	} else if (amountText[1] === "duodecillion"){
		amountMultiplier = Math.pow(10, 39);
	} else if (amountText[1] === "tredecillion"){
		amountMultiplier = Math.pow(10, 42);
	} else if (amountText[1] === "quattuordecillion"){
		amountMultiplier = Math.pow(10, 45);
	} else if (amountText[1] === "quindecillion"){
		amountMultiplier = Math.pow(10, 48);
	}

	var amount = parseFloat(amountText[0].replace(",", "")) * amountMultiplier;

	return amount;
}

function GetRemainingTimeToBuyUpdate(upgradeCost) {
	var cookies = $("#cookies").text().split("cookiesper second : ");
	var currentCookies = GetAmount(cookies[0]);
	var cookiesPerSecond = GetAmount(cookies[1]);
	var timeToUpdate = (upgradeCost - currentCookies) / cookiesPerSecond;

	return timeToUpdate;
}

function GetUpgradePrice() {
    var cheapestUpgrade = $("#upgrades").find(".crate.upgrade").first().attr("onmouseover");
    var upgradeDataFunction = reUpgradeDataFunction.exec(cheapestUpgrade);
    var upgradeData = eval(upgradeDataFunction[0]);
    var upgradePriceText = $(upgradeData).find(".price").first().text();
    var upgradePrice = GetAmount(upgradePriceText);

    return upgradePrice;
}

function StartClicker() {
	log("Starting clicker!");
	stopClicker = false;
	autoClicker();
}

function StartBuyer() {
	log("Starting buyer!");
	stopBuyer = false;
	autoBuyer();
}

function StopClicker(reason) {
	if (reason === undefined) {
		log("Stopping clicker...");
	} else {
		log("Stopping clicker... Reason:" + reason);
	}
	stopClicker = true;
}

function StopBuyer(reason) {
	if (reason === undefined) {
		log("Stopping buyer...");
	} else {
		log("Stopping buyer... Reason:" + reason);
	}
	stopBuyer = true;
}

function BlastOff() {
	wrinklerKiller();
	StartClicker();
	StartBuyer();
    openSpecialMenu();
}