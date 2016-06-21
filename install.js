module.exports = {
  /**
   * Install function run in we.js install.
   *
   * @param  {Object}   we    we.js object
   * @param  {Function} done  callback
   */
  install: function install(we, done) {
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
      // if already exists will throw error and skip it
      // console.log(err)
      done();
    })
  }
};

