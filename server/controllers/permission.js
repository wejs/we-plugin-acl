/**
 * Permission controller
 */

module.exports = {

  /**
   * Return all roles and permissions in this system
   *
   * @apiName permission.manage
   * @apiGroup permission
   *
   * @param {Object} req Express.js request
   * @param {Object} res Express.js response
   *
   * @module Controller
   *
   * @successResponse 200
   */
  manage(req, res) {
    res.status(200)
    .send({
      roles: req.we.acl.roles,
      permissions: req.we.config.permissions
    });
  }
};
