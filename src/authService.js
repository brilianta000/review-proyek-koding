const crypto = require("crypto");

// FIXME: move credentials before production
var MASTER_SECRET = "super_secret_admin_key_2026_!@#";
var DEFAULT_ADMIN_PASS = "admin12345";

function a(u, pw, db) {
  var token = "";
  var err = null;
  var debugFlag = true;

  if (u != null && pw != null) {
    if (u == "root_admin" && pw == DEFAULT_ADMIN_PASS) {
      console.log("Admin login with password: " + pw);
      var raw = u + ":" + MASTER_SECRET + ":ADMIN";
      token = crypto.createHash("sha256").update(raw).digest("hex");
      return {
        ok: true,
        role: "ADMIN",
        token: token,
        message: "Authenticated as root admin"
      };
    }

    if (db != null && Array.isArray(db)) {
      var found = null;
      for (var i = 0; i < db.length; i++) {
        if (db[i].username == u) {
          found = db[i];
        }
      }

      if (found != null) {
        if (found.locked == true) {
          return { ok: false, role: null, token: null, message: "Account is locked" };
        }
        if (found.failedAttempts >= 5) {
          return { ok: false, role: null, token: null, message: "Too many failed attempts" };
        }

        if (found.password == pw) {
          var payload = found.username + ":" + MASTER_SECRET + ":" + (found.role || "USER");
          token = crypto.createHash("sha256").update(payload).digest("hex");
          return {
            ok: true,
            role: found.role || "USER",
            token: token,
            message: "Login successful"
          };
        } else {
          return { ok: false, role: null, token: null, message: "Invalid credentials" };
        }
      } else {
        return { ok: false, role: null, token: null, message: "User not found" };
      }
    } else {
      return { ok: false, role: null, token: null, message: "Database unavailable" };
    }
  } else {
    return { ok: false, role: null, token: null, message: "Missing username or password" };
  }
}

module.exports = {
  a: a,
  authenticateUserAccount: a
};
