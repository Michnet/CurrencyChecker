var defaultSettings = {
	periodDelay: 1000,
	kantoAliorBankServerUrl: "https://kantor.aliorbank.pl/forex/json/current",
	alarmName: "periodAlarm"
};

var currencyDataExchanger = (function($) {

	var self = {};

	function setBadgeValue(value) {
		chrome.browserAction.setBadgeText({
			text: value
		});
	}

	function gotDataFromServer(reponseFromServer) {
		var valueForSell = getCurrentValueForEuro(reponseFromServer.currencies);
		setBadgeValue(valueForSell);
	};

	function onErrorAjaxHanlder() {
		setBadgeValue("error");
	};

	function getCurrentValueForEuro(currencies) {
		for (var i = 0; i < currencies.length; i++) {
			if (currencies[i].currency1 === "PLN" &&
				currencies[i].currency2 === "EUR") {
				return currencies[i].sell;
			}
		};
	};

	function periodicEventHandler(alarm) {
		self.getCurrencies();
		self.repeat();
	};

	function createDelayedAction(settings) {
		chrome.alarms.create(defaultSettings.alarmName, {
			when: Date.now() + defaultSettings.periodDelay
		})
	}


	self.getCurrencies = function() {
		$.ajax({
			url: this.settings.kantoAliorBankServerUrl,
			dataType: "json",
			method: "GET",
			success: gotDataFromServer,
			error: onErrorAjaxHanlder
		});
	};
	self.repeat = function() {
		createDelayedAction(this.settings);
	};

	self.init = function(defaultSettings) {
		this.settings = defaultSettings;

		chrome.alarms.onAlarm.addListener(periodicEventHandler);

		createDelayedAction(defaultSettings);
	};


	return self;
})($);

currencyDataExchanger.init(defaultSettings);
