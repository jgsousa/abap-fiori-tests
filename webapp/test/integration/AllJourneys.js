/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 TransferOrders in the list

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
		"CTT/Reabastecimento/test/integration/MasterJourney",
		"CTT/Reabastecimento/test/integration/NavigationJourney",
		"CTT/Reabastecimento/test/integration/NotFoundJourney",
		"CTT/Reabastecimento/test/integration/BusyJourney",
		"CTT/Reabastecimento/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});