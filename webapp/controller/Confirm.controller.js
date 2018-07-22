sap.ui.define(["CTT/Reabastecimento/controller/BaseController", "sap/ui/model/json/JSONModel"], function (Controller,JSONModel) {
	"use strict";
	return Controller.extend("CTT.Reabastecimento.controller.Confirm", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf CTT.Reabastecimento.view.Confirm
		 */
		//	onInit: function() {
		//
		//	},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf CTT.Reabastecimento.view.Confirm
		 */
		//	onBeforeRendering: function() {
		//
		//	},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf CTT.Reabastecimento.view.Confirm
		 */
		onAfterRendering: function() {
			var getInputId = this.getView().byId("input6");
			this._setInitialFocus(getInputId);		
		},
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf CTT.Reabastecimento.view.Confirm
		 */
		//	onExit: function() {
		//
		//	}
		/**
		 *@memberOf 
		 */
		reference: this,
		resources: null,
		 _setInitialFocus: function(inputControl) {
			this.getView().addEventDelegate({
			    onAfterShow: function() {
			      setTimeout(function() {
			        inputControl.focus();
			      }.bind(this), 0);
			    }
			  }, this);
		},
		handleNavigationWithContext: function () {
			var that = this;
			var entitySet;
			var sRouteName;

			function _onBindingChange(oEvent) {
				// No data for the binding
				if (!that.getView().getBindingContext()) {
					//Need to insert default fallback route to load when requested route is not found.
					that.getOwnerComponent().getRouter().getTargets().display("");
				}
			}

			function _onRouteMatched(oEvent) {
				var oArgs, oView;
				oArgs = oEvent.getParameter("arguments");
				oView = that.getView();
				var sKeysPath = Object.keys(oArgs).map(function (key) {
					var oProp = JSON.parse(decodeURIComponent(oArgs[key]));
					return key + "=" + (oProp.type === "Edm.String" ? "'" + oProp.value + "'" : oProp.value);
				}).join(",");
			}
			if (that.getOwnerComponent().getRouter) {
				var oRouter = that.getOwnerComponent().getRouter();
				var oManifest = this.getOwnerComponent().getMetadata().getManifest();
				var content = that.getView().getContent();
				if (content) {
					var oNavigation = oManifest["sap.ui5"].routing.additionalData;
					var oContext = oNavigation[that.getView().getViewName()];
					sRouteName = oContext.routeName;
					entitySet = oContext.entitySet;
					oRouter.getRoute(sRouteName).attachMatched(_onRouteMatched, that);
				}
			}
		},
		onInit: function () {
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0
			});
			this.setModel(oViewModel, "detailView");
			this.handleNavigationWithContext();
			this.resources = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		_handleSubmit: function(){
			var view = this.getView();
			var obj = this.getView().getController().getOwnerComponent().getModel("ActiveOrder").getProperty("/Order");
			var oModel = this.getView().getModel();
			if( obj.DestinationPosition === obj.SelectedDestinationPosition){
				var oViewModel = view.getModel("detailView");
				oViewModel.setProperty("/busy", true);
				oModel.callFunction("/ConfirmOrder", {
				     method: "POST",
				     urlParameters: {
				          OrderId: obj.Id
				     },
				     success: function(oData, oResponse){
				     		var controller = view.getController();
				     		oViewModel.setProperty("/busy", false);
				     		controller.getOwnerComponent().getModel("ActiveOrder").setProperty("/Order", {});
							controller.getOwnerComponent().getModel().refresh(true);
				          	controller.getRouter().navTo("master", {}, true);
				     },
				     error: function(oError){
				     	oViewModel.setProperty("/busy", false);
						sap.m.MessageToast.show(this.getView().getController().resources.getText("posicaoErrada"), {
						    duration: 3000
						});	
				     }
				});
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
		}
	});
});