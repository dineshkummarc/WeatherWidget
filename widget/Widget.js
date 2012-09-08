/*
 *  Copyright 2012 Choorp Studios
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

enyo.kind({
	name: "WeatherWidgetDash",
	kind: "VFlexBox",
	className: "dashboard",
	style: "color: #FFF;",
	published: {
		
	},
	components: [
		{kind: "HFlexBox", flex: 1, align: "center", pack:"middle", components: [
			{kind: "VFlexBox", flex: 1, components: [
				{kind: "HFlexBox", style: "margin-bottom: 3px;", components: [
					{name: "statusIcon", kind: "Image", src: "images/icons/clear-day.png", style: "height: 52px; width: 52px;"},
					{name: "wTemperature", className: "dashTemp", allowHtml: true},
					{kind: "VFlexBox", className: "dashContainer", align: "center", pack: "middle", style: "padding-top: 4px;", components: [
						{name: "wHigh", className: "dashContent highlow", allowHtml: true},
						{name: "wLow", className: "dashContent highlow", allowHtml: true}
					]}
				]},
				{name: "wCity", className: "dashContent"},
				{name: "wConditions", className: "dashContent"}
			]},
			{kind: "VFlexBox", flex: 1, pack: "middle", align: "right", className: "dashContainer", components: [
				{kind: "HFlexBox", pack: "end", className: "text-row", components: [
					{name: "wSunrise", className: "dashContent iconText"},
					{kind: "Image", src: "images/icon-sun.png", style: "height: 18px; width: 18px;"}
				]},
				{kind: "HFlexBox", pack: "end", className: "text-row", components: [
					{name: "wSunset", className: "dashContent iconText"},
					{kind: "Image", src: "images/icon-moon.png", style: "height: 18px; width: 18px;"}
				]},
				{kind: "HFlexBox", pack: "end", className: "text-row", components: [
					{name: "wWind", className: "dashContent iconText"},
					{kind: "Image", src: "images/icon-wind.png", style: "height: 18px; width: 18px;"}
				]},
				{kind: "HFlexBox", pack: "end", className: "text-row", components: [
					{name: "wHumidity", className: "dashContent iconText"},
					{kind: "Image", src: "images/icon-steam.png", style: "height: 18px; width: 18px;"}
				]}
			]}
		]},
		{style: "height: 52px;"},
		{kind: "ApplicationEvents", onWindowActivated: "dashOpened", onWindowDeactivated: "dashClosed", onWindowParamsChange: "handleWindowParams", onUnload: "dashExited"},
		{name: "screenState", kind: "enyo.PalmService", service: "palm://com.palm.display/control", method: "status", subscribe: true, onSuccess: "displayUpdate"},
		{name: "gpsService", kind: "PalmService", service: "palm://com.palm.location/", method: "getCurrentPosition", onResponse: "gotGPS"},
		{name: "getWOEID", kind: "WebService", url: "", onResponse: "gotWOEID"},
		{name: "getWeather", kind: "WebService", url: "", onResponse: "gotWeather"}
	],
	create: function () {
		this.inherited(arguments);
		this.$.screenState.call();
	},
	getLocation: function() {
		this.$.gpsService.call();
	},
	gotGPS: function(inSender, inResponse) {
		enyo.log("gotGPS: " + enyo.json.stringify(inResponse));
		var urlLocation = "http://where.yahooapis.com/geocode?location=" + inResponse.latitude + "+" + inResponse.longitude + "&gflags=R&appid=XXIlad62";
		this.$.getWOEID.setUrl(urlLocation);
		this.$.getWOEID.call();
	},
	gotWOEID: function(inSender, inResponse) {
		var data = (new DOMParser()).parseFromString(inResponse, "text/xml");
		var locCity = data.getElementsByTagName("city")[0].childNodes[0].nodeValue;
		var locWOEID = data.getElementsByTagName("woeid")[0].childNodes[0].nodeValue;
		var locCountry = data.getElementsByTagName("countrycode")[0].childNodes[0].nodeValue;
		enyo.log("gotWOEID: " + locCountry + " " + locCity + " " + locWOEID);

		var units = "c";
		if (locCountry == "US")
			units = "f";

		this.$.getWeather.setUrl("http://weather.yahooapis.com/forecastrss?w="+locWOEID+"&u="+units);
		this.$.getWeather.call();
	},
	gotWeather: function(inSender, inResponse) {
		var data = (new DOMParser()).parseFromString(inResponse, "text/xml");
		var objectTemp = data.getElementsByTagName("condition")[0].getAttribute("temp");
		var objectStatusCode = data.getElementsByTagName("condition")[0].getAttribute("code");
		var objectStatusText = data.getElementsByTagName("condition")[0].getAttribute("text");
		var objectTempUnits = data.getElementsByTagName("units")[0].getAttribute("temperature");
		var objectSpeedUnits = data.getElementsByTagName("units")[0].getAttribute("speed");
		var objectLow = data.getElementsByTagName("forecast")[0].getAttribute("low");
		var objectHigh = data.getElementsByTagName("forecast")[0].getAttribute("high");
		var objectCity = data.getElementsByTagName("location")[0].getAttribute("city");
		//var objectWindChill = data.getElementsByTagName("wind")[0].getAttribute("chill");
		var objectWindDirection = data.getElementsByTagName("wind")[0].getAttribute("direction");
		var objectWindSpeed = data.getElementsByTagName("wind")[0].getAttribute("speed");
		var objectSunrise = data.getElementsByTagName("astronomy")[0].getAttribute("sunrise");
		var objectSunset = data.getElementsByTagName("astronomy")[0].getAttribute("sunset");
		var objectHumidity = data.getElementsByTagName("atmosphere")[0].getAttribute("humidity");

		objectWindDirection = parseInt(objectWindDirection);
		if(objectWindDirection == 0)
			windDirection = "Var";
		else if (objectWindDirection >= 338 || objectWindDirection <= 22)
			windDirection = "N";
		else if (objectWindDirection >= 23 && objectWindDirection <= 67)
			windDirection = "NE";
		else if (objectWindDirection >= 68 && objectWindDirection <= 112)
			windDirection = "E";
		else if (objectWindDirection >= 113 && objectWindDirection <= 157)
			windDirection = "SE";
		else if (objectWindDirection >= 158 && objectWindDirection <= 202)
			windDirection = "S";
		else if (objectWindDirection >= 203 && objectWindDirection <= 247)
			windDirection = "SW";
		else if (objectWindDirection >= 248 && objectWindDirection <= 292)
			windDirection = "W";
		else if (objectWindDirection >= 293 && objectWindDirection <= 337)
			windDirection = "NW";
		else
			windDirection = "?";

		this.$.wTemperature.setContent(objectTemp + "&deg;" + objectTempUnits);
		this.$.wHigh.setContent(objectHigh + "&deg;");
		this.$.wLow.setContent(objectLow + "&deg;");
		this.$.wCity.setContent(objectCity);
		this.$.wConditions.setContent(objectStatusText);

		this.$.wSunrise.setContent(objectSunrise);
		this.$.wSunset.setContent(objectSunset);
		this.$.wWind.setContent(windDirection + " at " + objectWindSpeed + " " + objectSpeedUnits);
		this.$.wHumidity.setContent(objectHumidity + "%");

		var iconFile = this.findIcon(objectStatusCode);
		this.$.statusIcon.setSrc("images/icons/"+iconFile);


	},
	findIcon: function(status) {
		var iconName = "unavailable";
		if(status==0) {
			iconName = 'thunderstorms';
			}
		else if(status==1) {
			iconName = 'rain-heavy';
			}
		else if(status==2) {
			iconName = 'rain-heavy';
			}
		else if(status==3) {
			iconName = 'thunderstorms';
			}
		else if(status==4) {
			iconName = 'thunderstorms';
			}
		else if(status==5) {
			iconName = 'snow-mix';
			}
		else if(status==6) {
			iconName = 'snow-mix';
			}
		else if(status==7) {
			iconName = 'snow-mix';
			}
		else if(status==8) {
			iconName = 'freezing-rain';
			}
		else if(status==9) {
			iconName = 'rain-lite';
			}
		else if(status==10) {
			iconName = 'freezing-rain';
			}
		else if(status==11) {
			iconName = 'rain-lite';
			}
		else if(status==12) {
			iconName = 'rain-lite';
			}
		else if(status==13) {
			iconName = 'snow-lite';
			}
		else if(status==14) {
			iconName = 'snow-medium';
			}
		else if(status==15) {
			iconName = 'snow-medium';
			}
		else if(status==16) {
			iconName = 'snow-medium';
			}
		else if(status==17) {
			iconName = 'hail';
			}
		else if(status==18) {
			iconName = 'freezing-rain';
			}
		else if(status==19) {
			iconName = 'fog';
			}
		else if(status==20) {
			iconName = 'fog';
			}
		else if(status==21) {
			iconName = 'fog';
			}
		else if(status==22) {
			iconName = 'fog';
			}
		else if(status==23) {
			iconName = 'windy';
			}
		else if(status==24) {
			iconName = 'windy';
			}
		else if(status==25) {
			iconName = 'cold';
			}
		else if(status==26) {
			iconName = 'cloudy';
			}
		else if(status==27) {
			iconName = 'm-cloudy-night';
			}
		else if(status==28) {
			iconName = 'm-cloudy-day';
			}
		else if(status==29) {
			iconName = 'p-cloudy-night';
			}
		else if(status==30) {
			iconName = 'p-cloudy-day';
			}
		else if(status==31) {
			iconName = 'clear-night';
			}
		else if(status==32) {
			iconName = 'clear-day';
			}
		else if(status==33) {
			iconName = 'l-cloudy-night';
			}
		else if(status==34) {
			iconName = 'l-cloudy-day';
			}
		else if(status==35) {
			iconName = 'freezing-rain';
			}
		else if(status==36) {
			iconName = 'hot';
			}
		else if(status==37) {
			iconName = 'thunderstorms';
			}
		else if(status==38) {
			iconName = 'thunderstorms';
			}
		else if(status==39) {
			iconName = 'thunderstorms';
			}
		else if(status==40) {
			iconName = 'rain-lite';
			}
		else if(status==41) {
			iconName = 'snow-heavy';
			}
		else if(status==42) {
			iconName = 'snow-medium';
			}
		else if(status==43) {
			iconName = 'snow-heavy';
			}
		else if(status==44) {
			iconName = 'p-cloudy-day';
			}
		else if(status==45) {
			iconName = 'thunderstorms';
			}
		else if(status==46) {
			iconName = 'snow-mix';
			}
		else if(status==47) {
			iconName = 'thunderstorms';
			}
		else if(status==3200) {
			iconName = 'unavailable';
			}
		else {
			iconName = 'unavailable';
		}

		iconName = iconName + ".png";
		return iconName;
	},
	dashOpened: function() {
		//this.$.batteryService.call();
		this.$.gpsService.call();
	},
	dashClosed: function() {
		this.dashStatus = "closed";
	},
	dashExited: function() {
		this.$.screenState.destroy();
	},
	displayUpdate: function(inSender, inResponse) {
		if(inResponse.event === "displayOn") {
			this.$.gpsService.call();
		}
	}
});