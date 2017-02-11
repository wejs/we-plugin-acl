/**
 * PermissionController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

module.exports = {
  manage(req, res) {
    res.status(200)
    .send({
      roles: req.we.acl.roles,
      permissions: req.we.config.permissions
    });
  }
};
