/**
 * Created by stain on 1/3/2016.
 */
var db_driver = function () {
    var sqlite3 = require('sqlite3').verbose();

    this.connect = function () {
        this.db = new sqlite3.Database('chat.db');
    };
    this.close = function () {
        this.db.close(function (err) {
            if (err)
                console.Error("database close error: ", err)
        });
    };

    this.new_message = function (msg, callback) {
        this.connect();
        var query = "INSERT INTO `messages` (name, message, ts) VALUES($name, $content, $ts)";
        this.db.run(query, {
            $name: msg.name,
            $content: msg.message,
            $ts: msg.ts
        }, function (err) {
            if (err)
                console.log("Error: ", err);
            callback(err, this.lastID);
        });
        this.close()
    };

    this.get_message = function (number, callback) {
        this.connect();
        var query = "SELECT * FROM `messages` ORDER BY id DESC LIMIT ?";
        this.db.all(query, number, function (err, rows) {
            if (err)
                console.log("Get talk error: ", err);
            callback(err, rows)
        });
        this.close();
    };

    return this;
};

module.exports = db_driver;

