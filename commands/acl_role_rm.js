var fs = require('fs');
var path = require('path');

module.exports = function aclRoleAdd (program) {

  program
  .command('acl:role:rm <roleName>')
  .description('Remove one role, this dont remove system roles')
  .action(function run (roleName) {
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

    // only remove if exists
    if (cJSON.roles[roleName].permissions) {
      delete cJSON.roles[roleName]
    }
    // save the file
    fs.writeFile(cFGpath, JSON.stringify(cJSON, null, 2), function (err) {
      if (err) throw err
    })
  })
}

