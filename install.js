module.exports = {
  /**
   * Install function run in we.js install.
   *
   * @param  {Object}   we    we.js object
   * @param  {Function} done  callback
   */
  install: function install(we, done) {
    we.utils.async.series([
      function createRolesCol(done) {
        // ensures that user.roles column is created
        we.db.defaultConnection.queryInterface
        .addColumn('users', 'roles', {
          type: we.db.Sequelize.TEXT,
          allowNull: false
        })
        .then(function () {
          done();
        })
        .catch(function (err) {
          we.log.warn('On add user roles:', err);
          done();
        })
      },
      function exportDefaultRoles (done) {
        we.setConfig('roles', we.acl.exportRoles(), done)
      }
    ], done)
  }
};
