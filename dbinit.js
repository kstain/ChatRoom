/**
 * Created by stain on 1/3/2016.
 */
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('chat.db');

db.serialize(function() {

    db.exec("DROP TABLE IF EXISTS messages;")

    db.exec("CREATE TABLE messages(id integer primary key AutoIncrement, name varchar(20), message TEXT, ts TEXT);");

});

db.close();