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
	name: "WeatherWidget",
	kind: "HFlexBox",
	className: "main",
	components: [
		{className: "text", content: "You may close this card."},
		{kind: "ApplicationEvents", onLoad: "initWidget"},
		{kind: "AppMenu", components: [
			{caption: "Contact", onclick: "openContact"}
		]},
		{name: "popupContact", kind: "Popup", components: [
			{content: "Twitter: @Choorp"},
			{content: "Email: Choorp@gmail.com"},
			{kind: "Button", caption: "Close", onclick: "closeContact"}
		]}
	],
	create: function () {
		this.inherited(arguments);
	},
	initWidget: function() {
		enyo.windows.openDashboard("widget/index.html", "weatherWidgetDash", {}, {clickableWhenLocked:true, dashHeight: 120});
	},
	openContact: function() {
		this.$.popupContact.openAtCenter();
	},
	closeContact: function() {
		this.$.popupContact.close();
	}
});