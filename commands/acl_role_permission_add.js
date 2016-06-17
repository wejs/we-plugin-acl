var fs = require('fs');
var path = require('path');

module.exports = function aclRolePermissionAddCommand (program) {

  program
  .command('acl:role:permission:add <roleName> <permission>')
  .description('Add one permission in role')
  .action(function (roleName, permission) {
    var cJSON,
      cFGpath = path.join(process.cwd(), '/config/configuration.json')
    // get old configs
    try {
      cJSON = JSON.parse(fs.readFileSync(cFGpath))
    } catch(e) {
      if (e.code == 'ENOENT') {
        fs.writeFileSync(cFGpath, '{}')
        cJSON = {}
      } else {
        throw e
      }
    }

    // set default vars
    if (!cJSON.roles) cJSON.roles = {};
    if (!cJSON.roles[roleName]) throw new Error('role '+roleName+' dont exists')

    if (!cJSON.roles[roleName].permissions) {
      cJSON.roles[roleName].permissions = []
    }

    // only add if not exits

    if (cJSON.roles[roleName].permissions.indexOf(permission) == -1) {
      cJSON.roles[roleName].permissions.push(permission)
    }

    fs.writeFile(cFGpath, JSON.stringify(cJSON, null, 2), function (err) {
      if (err) throw err
    })
  })
}



