sap.ui.define(
  [
    'engine/configurator/controller/BaseController',
    'sap/ui/model/json/JSONModel',
    'engine/configurator/model/formatter',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
  ],
  function(BaseController, JSONModel, formatter, Filter, FilterOperator) {
    'use strict'

    return BaseController.extend('engine.configurator.controller.Worklist', {
      formatter: formatter,

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the configurator controller is instantiated.
       * @public
       */
      onInit: function() {
        var oViewModel,
          iOriginalBusyDelay,
          oTable = this.byId('table')

        // Put down configurator table's original value for busy indicator delay,
        // so it can be restored later on. Busy handling on the table is
        // taken care of by the table itself.
        iOriginalBusyDelay = oTable.getBusyIndicatorDelay()
        // keeps the search state
        this._oTableSearchState = []
        // Model used to manipulate control states
        oViewModel = new JSONModel({
          tableNoDataText: this.getResourceBundle().getText('tableNoDataText'),
          tableBusyDelay: 0,
          Objects: []
        })
        this.setModel(oViewModel, 'worklistView')
        this.getRouter()
          .getRoute('worklist')
          .attachPatternMatched(this._loadObjects, this)
        // Make sure, busy indication is showing immediately so there is no
        // break after the busy indication for loading the view's meta data is
        // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
        oTable.attachEventOnce('updateFinished', function() {
          // Restore original busy indicator delay for worklist's table
          oViewModel.setProperty('/tableBusyDelay', iOriginalBusyDelay)
        })

        // this._loadUserSet();
      },

      _loadObjects: function() {
        var objectEntitySetName = this.getOwnerComponent().getObjectEntitySetName()

        $.getJSON(
          objectEntitySetName,
          function(response) {
            // this.getOwnerComponent()
            //   .getModel()
            //   .setProperty('/ObjectSet', response.d.results)

            this.getModel().setProperty('/Objects', response.d.results)
          }.bind(this)
        )
      },

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */

      /**
       * Triggered by the table's 'updateFinished' event: after new table
       * data is available, this handler method updates the table counter.
       * This should only happen if the update was successful, which is
       * why this handler is attached to 'updateFinished' and not to the
       * table's list binding's 'dataReceived' method.
       * @param {sap.ui.base.Event} oEvent the update finished event
       * @public
       */
      onUpdateFinished: function(oEvent) {
        // update the worklist's object counter after the table update
        var sTitle,
          oTable = oEvent.getSource(),
          iTotalItems = oEvent.getParameter('total')
        // only update the counter if the length is final and
        // the table is not empty
        if (iTotalItems && oTable.getBinding('items').isLengthFinal()) {
          sTitle = this.getResourceBundle().getText('worklistTableTitleCount', [
            iTotalItems
          ])
        } else {
          sTitle = this.getResourceBundle().getText('worklistTableTitle')
        }
        this.getModel('worklistView').setProperty('/worklistTableTitle', sTitle)
      },

      /**
       * Event handler when a table item gets pressed
       * @param {sap.ui.base.Event} oEvent the table selectionChange event
       * @public
       */
      onPress: function(oEvent) {
        // The source is the list item that got pressed
        this._showObject(oEvent.getSource())
      },

      /**
       * Event handler for navigating back.
       * We navigate back in the browser historz
       * @public
       */
      onNavBack: function() {
        history.go(-1)
      },

      onSearch: function(oEvent) {
        if (oEvent.getParameters().refreshButtonPressed) {
          // Search field's 'refresh' button has been pressed.
          // This is visible if you select any master list item.
          // In this case no new search is triggered, we only
          // refresh the list binding.
          this.onRefresh()
        } else {
          var oTableSearchState = []
          var sQuery = oEvent.getParameter('query')

          if (sQuery && sQuery.length > 0) {
            oTableSearchState = [
              new Filter('ObjectName', FilterOperator.Contains, sQuery)
            ]
          }
          this._applySearch(oTableSearchState)
        }
      },

      /**
       * Event handler for refresh event. Keeps filter, sort
       * and group settings and refreshes the list binding.
       * @public
       */
      onRefresh: function() {
        var oTable = this.byId('table')
        oTable.getBinding('items').refresh()
      },

      onNewObjectPress: function() {
        this.getRouter().navTo('object', {
          objectId: 0
        })
      },

      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */

      /**
       * Shows the selected item on the object page
       * On phones a additional history entry is created
       * @param {sap.m.ObjectListItem} oItem selected Item
       * @private
       */
      _showObject: function(oItem) {
        var oObject = this.getModel().getProperty(oItem.getBindingContextPath())
        var objPropertyName = this.getOwnerComponent().getObjectPropertyName()

        this.getRouter().navTo('object', {
          objectId: oObject[objPropertyName]
        })
      },

      /**
       * Internal helper method to apply both filter and search state together on the list binding
       * @param {object} oTableSearchState an array of filters for the search
       * @private
       */
      _applySearch: function(oTableSearchState) {
        var oTable = this.byId('table'),
          oViewModel = this.getModel('worklistView')
        oTable.getBinding('items').filter(oTableSearchState, 'Application')
        // changes the noDataText of the list in case there are no filter results
        if (oTableSearchState.length !== 0) {
          oViewModel.setProperty(
            '/tableNoDataText',
            this.getResourceBundle().getText('worklistNoDataWithSearchText')
          )
        }
      }
    })
  }
)
