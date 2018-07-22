/*global location */
sap.ui.define([
	"CTT/Reabastecimento/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"CTT/Reabastecimento/model/formatter"
], function (BaseController, JSONModel, formatter) {
	"use strict";
	return BaseController.extend("CTT.Reabastecimento.controller.Detail", {
		formatter: formatter,
		resources: null,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0
			});
			var oActiveModel = new JSONModel({
				busy: false,
				delay: 0
			});
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(oViewModel, "detailView");
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			this.getOwnerComponent().setModel(oActiveModel, "ActiveOrder");
			this.resources = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		onAfterRendering: function(){
			var getInputId = this.getView().byId("input2");
			this._setInitialFocus(getInputId);
		},
		 _setInitialFocus: function(inputControl) {
			this.getView().addEventDelegate({
			    onAfterShow: function() {
			      setTimeout(function() {
			        inputControl.focus();
			      }.bind(this), 0);
			    }
			  }, this);
		},
		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */
		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("TransferOrders", {
					Id: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},
		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");
			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						
					}
				}
			});
		},
		_onBindingChange: function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();
			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}
			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.Id,
				sObjectName = oObject.UC,
				oViewModel = this.getModel("detailView");
			this.getOwnerComponent().getModel("ActiveOrder").setProperty("/Order", oObject);
			oViewModel.setProperty("/busy", false);
			this.getOwnerComponent().oListSelector.selectAListItem(sPath);
			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject", oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage", oResourceBundle.getText("shareSendEmailObjectMessage", [
				sObjectName,
				sObjectId,
				location.href
			]));
		},
		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");
			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},
		/**
		 *@memberOf CTT.Reabastecimento.controller.Detail
		 */
		action: function (oEvent) {
			var that = this;
			var actionParameters = JSON.parse(oEvent.getSource().data("wiring").replace(/'/g, "\""));
			var eventType = oEvent.getId();
			var aTargets = actionParameters[eventType].targets || [];
			aTargets.forEach(function (oTarget) {
				var oControl = that.byId(oTarget.id);
				if (oControl) {
					var oParams = {};
					for (var prop in oTarget.parameters) {
						oParams[prop] = oEvent.getParameter(oTarget.parameters[prop]);
					}
					oControl[oTarget.action](oParams);
				}
			});
			var oNavigation = actionParameters[eventType].navigation;
			if (oNavigation) {
				var oParams = {};
				(oNavigation.keys || []).forEach(function (prop) {
					oParams[prop.name] = encodeURIComponent(JSON.stringify({
						value: oEvent.getSource().getBindingContext(oNavigation.model).getProperty(prop.name),
						type: prop.type
					}));
				});
				if (Object.getOwnPropertyNames(oParams).length !== 0) {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName, oParams);
				} else {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName);
				}
			}
		},
		_handleSubmit: function(){
			var router = this.getView().getController().getRouter();
			var parameters = {};
			var obj = this.getView().getController().getOwnerComponent().getModel("ActiveOrder").getProperty("/Order");
			if( obj.OriginPosition === obj.SelectedOriginPosition && 
				obj.UC === obj.SelectedUC ){
				parameters["Id"] = encodeURIComponent(JSON.stringify({
						value: obj.Id,
						type: "Edm.String"
				}));
				router.navTo("Confirm_binded", parameters);
			}
			else {
				sap.m.MessageToast.show(this.getView().getController().resources.getText("posicaoErrada"), {
				    duration: 3000
				});
			}				
		},
		onConfirm: function() {
			this.getView().getController()._handleSubmit();	
		},
		onSubmit: function(){
			this.getView().getController()._handleSubmit();	
		},
		onUCConfirmed : function(){
			var obj = this.getView().getController().getOwnerComponent().getModel("ActiveOrder").getProperty("/Order");
			if(obj && obj.UC === obj.SelectedUC){
				var getInputId = this.getView().byId("input6");
				getInputId.focus();
			}
			else{
				sap.m.MessageToast.show(this.getView().getController().resources.getText("ucErrada"), {
				    duration: 3000
				});				
			}
		}
	});
});