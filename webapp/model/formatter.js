sap.ui.define([
	], function () {
		"use strict";

		return {
			/**
			 * Rounds the currency value to 2 digits
			 *
			 * @public
			 * @param {string} sValue value to be formatted
			 * @returns {string} formatted currency value with 2 digits
			 */
			currencyValue : function (sValue) {
				if (!sValue) {
					return "";
				}

				return parseFloat(sValue).toFixed(2);
			},
			removeLeadingZeros: function(str) {
				var num = parseInt(str, 10);
				if (num === 0 || isNaN(num)) {
					return str;
				} else {
					return num.toString();
				}
			}
		};

	}
);