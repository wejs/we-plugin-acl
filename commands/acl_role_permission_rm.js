module.exports = function aclRolePermissionRmCommand (program, helpers) {

  var we

  program
  .command('acl:role:permission:rm <roleName> <permission>')
  .alias('arpr')
  .description('Remove one permission in role')
  .action(function run (roleName, permission) {
    we = helpers.getWe()

    we.bootstrap(function (err) {
      if (err) return doneAll(err)
      // get all configs, old configs in configuration.json file is included here
      var roles = we.acl.exportRoles()

      if (!roles[roleName]) {
        console.log(roleName + ' dont exists')
        return doneAll()
      }

      if (!roles[roleName].permissions) {
        roles[roleName].permissions = []
      }

      var i = roles[roleName].permissions.indexOf(permission)
      if (i > -1) {
        roles[roleName].permissions.splice(i, 1);
      }

      // write in configuration.json file
      we.setConfig('roles', roles, doneAll)
    })

    function doneAll (err) {
      if ( err ) {
        we.log.error('Error in we.js CLI:', err)
      }

      we.exit(function () {
        // end / exit
        process.exit()
      })
    }
  })
}

