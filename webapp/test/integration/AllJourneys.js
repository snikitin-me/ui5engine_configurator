jQuery.sap.require('sap.ui.qunit.qunit-css')
jQuery.sap.require('sap.ui.thirdparty.qunit')
jQuery.sap.require('sap.ui.qunit.qunit-junit')
QUnit.config.autostart = false

sap.ui.require(
  [
    'sap/ui/test/Opa5',
    'engine/users/test/integration/pages/Common',
    'sap/ui/test/opaQunit',
    'engine/users/test/integration/pages/Worklist',
    'engine/users/test/integration/pages/Object',
    'engine/users/test/integration/pages/NotFound',
    'engine/users/test/integration/pages/Browser',
    'engine/users/test/integration/pages/App'
  ],
  function(Opa5, Common) {
    'use strict'
    Opa5.extendConfig({
      arrangements: new Common(),
      viewNamespace: 'engine.users.view.'
    })

    sap.ui.require(
      [
        'engine/users/test/integration/WorklistJourney',
        'engine/users/test/integration/ObjectJourney',
        'engine/users/test/integration/NavigationJourney',
        'engine/users/test/integration/NotFoundJourney'
      ],
      function() {
        QUnit.start()
      }
    )
  }
)
