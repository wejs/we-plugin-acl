module.exports = function aclUserRoleRm (program, helpers) {
  let we;

  program
  .command('acl:user:role:rm <userId> <roleName>')
  .description('Remove one role in user')
  .action(function run (userId, roleName) {
    we = helpers.getWe();

    we.bootstrap(function (err) {
      if (err) return doneAll(err);
      // get all configs, old configs in configuration.json file is included here
      var roles = we.acl.exportRoles();

      if (!roles[roleName]) {
        console.log(roleName + ' dont exists');
        return doneAll();
      }

      if (! Number(userId) ) return doneAll('Invalid Uid');

      we.db.models.user.findOne({
        where: { id: userId }
      })
      .then( function (user) {
        user.removeRole(roleName)
        .then(function() {

          we.log.info('DONE role '+roleName+' removed from user ' +user.username);
          return doneAll();

        })
        .catch(doneAll);
      });

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
