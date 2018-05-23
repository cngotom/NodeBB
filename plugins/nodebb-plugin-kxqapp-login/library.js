var	passport = module.parent.require('passport')
var	winston = module.parent.require('winston'),
	passportLocal = module.parent.require('passport-local').Strategy,
  db = module.parent.require('../src/database'),
  user = module.parent.require('./user'),
  axios = require('axios'),
	plugin = {};

var passportCustom = module.parent.require('passport-custom'),
    CustomStrategy = passportCustom.Strategy;

plugin.AuthHost = "http://api.firewinggames.com"

plugin.getStrategy = function(strategies,callback) {
	winston.info('[login] Registering kxqlogin');


  passport.use('strategy-kxq', new CustomStrategy(
    function(req, callback) {
      // Do your custom user finding logic here, or set to false based on req object
      console.log("token is ",req.query.token)
      console.log("appid is ",req.query.appid)
      axios.get(`${plugin.AuthHost}/auth/decodetoken/${req.query.appid}/${req.query.token}/`)
      .then(response => {
        let username = response.data.username
        let nickname  = response.data.nickname
        console.log("username ",username, " nickname ",nickname)
        plugin.login(username,nickname ,function(err,uid){
          if(err){
            callback(err)
          }else{
            callback(null, uid);
          }
        })
      }).catch( error => {
        console.log(error)
        callback(error)
      });

      //validate
      /*
      plugin.login(req.query.kxqid,req.query.nickname ,function(err,uid){
        if(err){
          callback(err)
        }else{
          callback(null, uid);
        }
      })
      */

    }
  ));



  strategies.push({
    name: 'strategy-kxq',
    url: '/auth/kxq',
    callbackURL: '/auth/kxq/callback',
    icon: 'fa-kxq',
  })


  callback(null,strategies);
};

plugin.login = function(kxqid, handle, callback) {
  plugin.getUidByKxqId(kxqid, function(err, uid) {
    if (err) {
      return callback(err);
    }

    if (uid !== null) {
      // Existing User
      callback(null, {
        uid: uid
      });
    } else {
      // New User
      user.create({
        username: handle
      }, function(err, uid) {
        if (err) {
          return callback(err);
        }
        // Save wechat-specific information to the user
        user.setUserField(uid, 'kxqid', kxqid);
        db.setObjectField('kxqid:uid', kxqid, uid);
        callback(null, {
          uid: uid
        });
      });
    }
  });
};

plugin.getUidByKxqId = function(kxquid, callback) {
  db.getObjectField('kxqid:uid', kxquid, function(err, uid) {
    if (err) {
      return callback(err);
    }
    callback(null, uid);
  });
}

module.exports = plugin;
