module.exports = function aclRoleAdd (program, helpers) {
  let we;

  program
  .command('acl:role:add <roleName>')
  .option('-p, --permissions [permissionsList]', 'Permissions list separated with comma')
  .description('Add one role if not exists')
  .action(function run (roleName, opts) {
    we = helpers.getWe();

    we.bootstrap(function (err) {
      if (err) return doneAll(err);
      // get all configs, old configs in configuration.json file is included here
      const roles = we.acl.exportRoles();

      if (roles[roleName]) {
        console.log(roleName + ' already exists, skipping');
        return doneAll();
      }

      roles[roleName] = { name: roleName };

      if (opts.permissions) {
        roles[roleName].permissions = opts.permissions.split(',');
      } else {
        roles[roleName].permissions = [];
      }

      // write in configuration.json file
      we.setConfig('roles', roles, doneAll);
    });

    function doneAll (err) {
      if ( err ) {
        we.log.error('Error in we.js CLI:', err);
      }

      we.exit(function () {
        // end / exit
        process.exit();
      });
    }
  });
};
