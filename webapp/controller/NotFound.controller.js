sap.ui.define(['engine/configurator/controller/BaseController'], function(
  BaseController
) {
  'use strict'

  return BaseController.extend('engine.configurator.controller.NotFound', {
    /**
     * Navigates to the configurator when the link is pressed
     * @public
     */
    onLinkPressed: function() {
      this.getRouter().navTo('configurator')
    }
  })
})
