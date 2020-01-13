module.exports = function exportRolesCommand (program, helpers) {
  let we;

  program
  .command('acl:role:export')
  .option('-c, --console', 'Print roles in console and dont save in file')
  .description('Export all project roles to file or log')
  .action(function run(opts) {
    we = helpers.getWe();

    we.bootstrap(function (err) {
      if (err) return doneAll(err);
      // get all configs, old configs in configuration.json file is included here
      var roles = we.acl.exportRoles();

      if (opts.console) {
        // log to console flag
        console.log(roles);
        return doneAll();
      }

      // write in configuration.json file
      we.setConfig('roles', roles, doneAll);
    });

    function doneAll(err) {
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
