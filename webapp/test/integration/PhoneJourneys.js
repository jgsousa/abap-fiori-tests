/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"CTT/Reabastecimento/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"CTT/Reabastecimento/test/integration/pages/App",
	"CTT/Reabastecimento/test/integration/pages/Browser",
	"CTT/Reabastecimento/test/integration/pages/Master",
	"CTT/Reabastecimento/test/integration/pages/Detail",
	"CTT/Reabastecimento/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "CTT.Reabastecimento.view."
	});

	sap.ui.require([
		"CTT/Reabastecimento/test/integration/NavigationJourneyPhone",
		"CTT/Reabastecimento/test/integration/NotFoundJourneyPhone",
		"CTT/Reabastecimento/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});