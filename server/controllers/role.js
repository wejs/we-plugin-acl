/**
 * RolesController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

module.exports = {
  create(req, res) {
    const name = req.body.name,
      description = req.body.description;

    if (req.method == 'POST') {
      req.we.acl.createRole({
        name: name, description: description
      }, (err, role)=> {
        if (err) {
          req.we.log.error('role:create: error on create role', err);
          res.serverError();
        } else {
          if (res.locals.redirectTo) {
            return res.goTo(res.locals.redirectTo);
          }

          res.ok(role);
        }
      });
    } else {
      res.ok();
    }
  },

  find(req, res, next) {
    res.locals.data =  {};

    res.locals.redirectTo = req.we.utils.getRedirectUrl(req, res);

    for (let name in req.we.acl.roles) {
      if (!req.we.acl.roles[name].isSystemRole)
        res.locals.data[name] = req.we.acl.roles[name];
    }

    if (req.method == 'POST' && req.body.action == 'create') {
      return req.we.controllers.role.create(req, res, next);
    } else if (req.method == 'POST' && req.body.action == 'delete') {
      return req.we.controllers.role.delete(req, res, next);
    }

    res.ok();
  },

  updateUserRoles(req, res, next) {
    const we = req.we;

    we.db.models.user
    .findOne({
      where: { id: req.params.userId }
    })
    .nodeify( (err, u)=> {
      if (err) return res.queryError(err);

      if (!u) {
        next();
        return null;
      }

      res.locals.data = u;

      if (req.method == 'POST') {
        const rolesToSave = [];
        let rn;

        // get role object related to id and skip invalid ids
        if (we.utils._.isArray(req.body.userRoles)) {
          // multiple roles
          for (rn in we.acl.roles) {
            if (req.body.userRoles.indexOf( we.acl.roles[rn].name ) > -1) {
              rolesToSave.push(rn);
            }
          }
        } else {
          // single role
          for (rn in we.acl.roles) {
            if (req.body.userRoles == we.acl.roles[rn].name) {
              rolesToSave.push(rn);
              break;
            }
          }
        }

        res.locals.rolesTable = buildUserRolesVar(res, u, we);

        u.setRoles(rolesToSave)
        .nodeify( (err)=> {
          if (err) return res.queryError(err);

          res.addMessage('success', 'role.updateUserRoles.success');
          res.status(200).send();
        });
      } else {
        res.locals.roles = we.acl.roles;
        res.locals.rolesTable = buildUserRolesVar(res, u, we);
        res.ok();
      }
    });
  },

  /**
   * Add one permission to role action
   */
  addPermissionToRole(req, res, next) {
    const we = req.we;

    if (
      !we.acl.roles[req.params.roleName] ||
      !we.acl.permissions[req.params.permissionName]
    ) return next();

    we.acl.addPermissionToRole(req.params.roleName, req.params.permissionName, (err)=> {
      if (err) return res.serverError(err);
      res.ok(we.acl.roles[req.params.roleName]);
    });
  },
  /**
   * remove permission from role action
   */
  removePermissionFromRole(req, res, next) {
    const we = req.we;

    if (!we.acl.roles[req.params.roleName]) {
      we.log.warn('Role not found: ',req.params.roleName);
      return next();
    }

    if (!we.acl.permissions[req.params.permissionName]) {
      we.log.warn('Permission not found: ',req.params.permissionName);
      return next();
    }

    we.acl.removePermissionFromRole(req.params.roleName, req.params.permissionName, (err)=> {
      if (err) return res.serverError(err);
      res.deleted();
    });
  },

  delete(req, res) {
    req.we.acl.deleteRole(req.body.name, (err)=> {
      if (err) {
        req.we.log.error('role:delete: error on delete role', err);
        return res.serverError();
      }

      if (res.locals.redirectTo)
        return res.goTo(res.locals.redirectTo);

      return res.ok();
    });
  }
};

function buildUserRolesVar(res, u, we) {
  let checked, rolesTable = [];

  for (let roleName in we.acl.roles) {
    checked = false;
    for (let i = 0; i < u.roles.length; i++) {
      if (u.roles[i] === roleName) {
        checked = true;
        break;
      }
    }

    rolesTable.push({
      name: roleName,
      checked: checked,
      role: we.acl.roles[roleName]
    });
  }

  return rolesTable;
}