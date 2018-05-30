/*global location*/
sap.ui.define(
  [
    'engine/configurator/controller/BaseController',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/routing/History',
    'engine/configurator/model/formatter',
    'sap/m/MessageToast'
  ],
  function(BaseController, JSONModel, History, formatter, MessageToast) {
    'use strict'

    return BaseController.extend('engine.configurator.controller.Object', {
      formatter: formatter,

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the configurator controller is instantiated.
       * @public
       *
       * TODO: add extend points to sections as frgments
       */
      onInit: function() {
        // Model used to manipulate control states. The chosen values make sure,
        // detail page is busy indication immediately so there is no break in
        // between the busy indication for loading the view's meta data
        var iOriginalBusyDelay,
          oViewModel = new JSONModel({
            busy: true,
            delay: 0,
            isNew: null
          })
        this.getRouter()
          .getRoute('object')
          .attachPatternMatched(this._onObjectMatched, this)

        // Store original busy indicator delay, so it can be restored later on
        iOriginalBusyDelay = this.getView().getBusyIndicatorDelay()
        this.setModel(oViewModel, 'objectView')

        // set data model
        this.setModel(new JSONModel());
      },

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */

      /**
       * Event handler  for navigating back.
       * It there is a history entry we go one step back in the browser history
       * If not, it will replace the current entry of the browser history with the configurator route.
       * @public
       */
      onNavBack: function() {
        var sPreviousHash = History.getInstance().getPreviousHash()

        if (sPreviousHash !== undefined) {
          history.go(-1)
        } else {
          this.getRouter().navTo('configurator', {}, true)
        }
      },

      handleEditPress: function() {
        //Clone the data
        this._oSupplier = jQuery.extend(
          {},
          this.getView()
            .getModel()
            .getData().SupplierCollection[0]
        )
        this._toggleButtonsAndView(true)
      },

      handleCancelPress: function() {
        //Restore the data
        var oModel = this.getView().getModel()
        var oData = oModel.getData()

        oData.SupplierCollection[0] = this._oSupplier

        oModel.setData(oData)
        this._toggleButtonsAndView(false)
      },

      onSavePress: function() {
        this._save()

        // TODO
        //this._toggleButtonsAndView(false);
      },

      onDeletePress: function() {
        this._deleteObject()
      },

      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */

      _formFragments: {},

      _toggleButtonsAndView: function(bEdit) {
        var oView = this.getView()
        // Show the appropriate action buttons
        oView.byId('edit').setVisible(!bEdit)
        oView.byId('save').setVisible(bEdit)
        oView.byId('cancel').setVisible(bEdit)

        // Set the right form type
        this._showFormFragment(bEdit ? 'Change' : 'Display')
      },

      _getFormFragment: function(sFragmentName) {
        var oFormFragment = this._formFragments[sFragmentName]

        if (oFormFragment) {
          return oFormFragment
        }

        oFormFragment = sap.ui.xmlfragment(
          this.getView().getId(),
          this.getOwnerComponent().getLibraryName() + '.view.object.' + sFragmentName
        );

        this._formFragments[sFragmentName] = oFormFragment
        return this._formFragments[sFragmentName]
      },

      _showFormFragment: function(sFragmentName) {
        var oPage = this.getView().byId('page')

        oPage.removeAllContent()
        oPage.insertContent(this._getFormFragment(sFragmentName))
      },

      /**
       * Binds the view to the object path.
       * @function
       * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
       * @private
       */
      _onObjectMatched: function(oEvent) {
        var sObjectId = oEvent.getParameter('arguments').objectId
        var isNew = false

        this._loadObject(sObjectId);

        this.getModel('objectView').setProperty('/isNew', false)
      },

      _save: function() {
        var oData = $.extend({}, this.getModel().getProperty('/'))

        var objectEntitySetName = this.getOwnerComponent().getObjectEntitySetName()

        $.get(objectEntitySetName + "/install/" + oData['ID'])
          .done(
            function(data) {
              MessageToast.show(
                this.getResourceBundle().getText('objectIsUpdated')
              )

              if (this.getModel('objectView').getProperty('/isNew')) {
                var objectPropertyName = this.getOwnerComponent().getObjectPropertyName()
                this.getRouter().navTo(
                  'object',
                  {
                    objectId: data.d.results[objectPropertyName]
                  },
                  true
                )
              }
            }.bind(this)
          )
          .fail(
            function(jqXHR, text) {
              this.getOwnerComponent()
                .getErrorHandler()
                .showServiceError(jqXHR.responseText)
            }.bind(this)
          )
      },

      _deleteObject: function() {
        var objectEntitySetName = this.getOwnerComponent().getObjectEntitySetName()
        var objectPropertyName = this.getOwnerComponent().getObjectPropertyName()
        
        var url =
          objectEntitySetName +
          '/' +
          this.getModel().getProperty('/' + objectPropertyName)

        $.ajax(url, {
          method: 'DELETE',
          dataType: 'json',
          success: function(res) {
            MessageToast.show(
              this.getResourceBundle().getText('objectIsDeleted')
            )
            this.onNavBack()
          }.bind(this)
        })
      },

      _loadObject: function(id) {
        var objectEntitySetName = this.getOwnerComponent().getObjectEntitySetName()

        $.getJSON(
          objectEntitySetName + '/' + id,
          function(response) {
            this.getModel().setProperty('/', response.d.results[0])
            this.getView().bindElement({ path: '/' })
            this._onBindingChange()
          }.bind(this)
        )
      },

      _onBindingChange: function() {
        var oView = this.getView(),
          oViewModel = this.getModel('objectView'),
          oElementBinding = oView.getElementBinding()

        // No data for the binding
        if (!oElementBinding.getBoundContext()) {
          this.getRouter()
            .getTargets()
            .display('objectNotFound')
          return
        }

        // Everything went fine.
        oViewModel.setProperty('/busy', false)

        // Set the initial form to be the display one
        //this._showFormFragment("Display"); // TODO:
        this._showFormFragment('Change')
      },

      onExit: function() {
        for (var sPropertyName in this._formFragments) {
          if (!this._formFragments.hasOwnProperty(sPropertyName)) {
            return
          }

          this._formFragments[sPropertyName].destroy()
          this._formFragments[sPropertyName] = null
        }
      }
    })
  }
)
