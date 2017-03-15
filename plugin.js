/**
 * Main ACL file
 */
const ACL = require('we-core-acl'),
  path = require('path');

module.exports = function loadPlugin(projectPath, Plugin) {
  const plugin = new Plugin(__dirname);

  plugin.setConfigs({
    // auth settings
    acl : { disabled: true },
    // default app permissions
    permissions: {
      'find_user': {
        'group': 'user',
        'title': 'Find users',
        'description': 'Find and find all users'
      },
      'create_user': {
        'group': 'user',
        'title': 'Create one user',
        'description': 'Create one new user'
      },
      'update_user': {
        'group': 'user',
        'title': 'Update one user',
        'description': 'Update one new user'
      },
      'delete_user': {
        'group': 'user',
        'title': 'Delete one user',
        'description': 'Delete one user record'
      },

      'manage_role': {
        'group': 'role',
        'title': 'Manage roles',
        'description': 'Change and update user roles'
      },

      'use_flag': {
        'group': 'flag',
        'title': 'Use flag API',
        'description': ''
      },
      'use_follow': {
        'group': 'follow',
        'title': 'Use follow API',
        'description': ''
      },

      'access_admin': {
        'group': 'admin',
        'title': 'Access admin page',
        'description': ''
      },

      'manage_users': {
        'group': 'admin',
        'title': 'Manage users',
        'description': ''
      },
      'manage_permissions': {
        'group': 'admin',
        'title': 'Manage permissions',
        'description': ''
      },
      'manage_theme': {
        'group': 'admin',
        'title': 'Manage theme',
        'description': ''
      },
      'setAlias': {
        'group': 'router',
        'title': 'Set url alias in form',
        'description': 'Can set model alias'
      }
    },
    // project roles
    roles: {
      administrator: {
        name: 'administrator',
        permissions: []
      },
      authenticated: {
        name: 'authenticated',
        permissions: [],
        isSystemRole: true
      },
      unAuthenticated: {
        name: 'unAuthenticated',
        permissions: [],
        isSystemRole: true
      },
      owner: {
        name: 'owner',
        permissions: [],
        isSystemRole: true
      }
    },
    autoUpdateRolesConfig: true,
    rolesConfigFile: path.resolve(projectPath + '/config/roles.js')
  });

  plugin.setRoutes({
    'get /acl/user/:userId([0-9]+)/roles': {
      'titleHandler'  : 'i18n',
      'titleI18n'     : 'admin.user.roles',
      'controller'    : 'role',
      'action'        : 'updateUserRoles',
      'model'         : 'user',
      'permission'    : 'manage_role',
      'responseType'  : 'json'
    },
    'post /acl/user/:userId([0-9]+)/roles': {
      'titleHandler'  : 'i18n',
      'titleI18n'     : 'admin.user.roles',
      'controller'    : 'role',
      'action'        : 'updateUserRoles',
      'model'         : 'user',
      'permission'    : 'manage_role',
      'responseType'  : 'json'
    },
    'get /acl/permission': {
      'titleHandler'  : 'i18n',
      'titleI18n'     : 'permission_manage',
      'name'          : 'permission_manage',
      'controller'    : 'permission',
      'action'        : 'manage',
      'permission'    : 'manage_permissions'
    },
    'post /acl/role/:roleName/permissions/:permissionName': {
      'controller'    : 'role',
      'action'        : 'addPermissionToRole',
      'permission'    : 'manage_permissions'
    },
    'delete /acl/role/:roleName/permissions/:permissionName': {
      'controller'    : 'role',
      'action'        : 'removePermissionFromRole',
      'permission'    : 'manage_permissions'
    },
    'get /acl/role': {
      'name'          : 'admin.role.find',
      'controller'    : 'role',
      'action'        : 'find',
      'permission'    : 'manage_permissions',
      'responseType'  : 'json'
    },
    'post /acl/role': {
      'controller'    : 'role',
      'action'        : 'find',
      'permission'    : 'manage_permissions',
      'responseType'  : 'json'
    }
  });

  plugin.events.on('we:after:load:plugins', (we)=> {
    // access controll list
    we.acl = new ACL();
    // override default write config to use the we.js setConfig
    we.acl.writeRolesToConfigFile = function writeRolesToConfigFile (done) {
      const roles = this.exportRoles();

      we.setConfig('roles', roles, done);
    };
  });

  plugin.extendUserModel = function extendUserModel(we, done) {

    we.db.modelsConfigs.user.definition.roles = {
      type: we.db.Sequelize.TEXT,
      formFieldType: null,
      skipSanitizer: true,
      get()  {
        if (this.getDataValue('roles'))
          return JSON.parse( this.getDataValue('roles') );
        return [];
      },
      set(object) {
        if (typeof object == 'object') {
          this.setDataValue('roles', JSON.stringify(object));
        } else {
          throw new Error('invalid error in user roles value: ', object);
        }
      }
    };

    we.db.modelsConfigs.user.options.instanceMethods.getRoles = function getRoles() {
      return new we.db.Sequelize
      .Promise( (resolve)=> { resolve(this.roles); });
    };

    we.db.modelsConfigs.user.options.instanceMethods.setRoles = function setRoles(rolesToSave) {
      var self = this;
      return new we.db.Sequelize
      .Promise(function setRolesPromisse(resolve, reject){
        self.roles = rolesToSave;
        self.save().then(resolve).catch(reject);
      });
    };

    we.db.modelsConfigs.user.options.instanceMethods.addRole = function addRole(role) {
      if (typeof role == 'object') {
        role = role.name;
      }

      const self = this;

      return new we.db.Sequelize
      .Promise(function setRolesPromisse(resolve, reject){

        const roles = self.roles;
        // if this user already have the role, do nothing
        if (roles.indexOf(role) > -1) return resolve(self);
        // else add the role and save the user
        roles.push(role);

        self.roles = roles;

        self.save().then(resolve).catch(reject);
      });
    };

    we.db.modelsConfigs.user.options.instanceMethods.removeRole = function removeRole(role) {
      if (typeof role == 'object') {
        role = role.name;
      }

      const self = this;

      return new we.db.Sequelize
      .Promise(function removeRolesPromisse(resolve, reject){

        const roles = self.roles;

        let i = roles.indexOf(role);
        // skip if this user dont have the role
        if (i == -1) { return resolve(); }
        // remove the role
        roles.splice(i, 1);
        // update the array
        self.roles = roles;
        // save
        self.save().then(resolve).catch(reject);
      });
    };

    done();
  };

  plugin.initACL = function initACL(we) {
    we.log.verbose('initACL step');
    we.acl.init(we, function afterInitAcl(){
      we.acl.setModelDateFieldPermissions(we);
    });
  };

  plugin.addACLMiddleware = function addACLMiddleware(data) {
    // bind acl middleware
    data.middlewares.push(data.we.acl.canMiddleware.bind({ config: data.config }));
  };

  plugin.crudPermissioPrefix = ['find', 'create', 'update', 'delete'];

  plugin.hooks.on('we:models:before:instance', plugin.extendUserModel);
  plugin.events.on('we:after:load:plugins', plugin.initACL);
  plugin.events.on('router:add:acl:middleware', plugin.addACLMiddleware);
  plugin.events.on('we-core:before:bind:one:resource:route', (data)=> {
    // set crud permissions
    plugin.crudPermissioPrefix.forEach( (ai)=> {
      if (!data.we.config.permissions[ai+'_'+data.configuration.model]) {
        data.we.config.permissions[ai+'_'+data.configuration.model] = {
          'title': ai+'_'+data.configuration.model
        };
      }
    });
  });

  return plugin;
};