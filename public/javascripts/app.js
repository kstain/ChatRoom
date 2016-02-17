/**
 * Created by stain on 1/3/2016.
 */
;(function(){

    var socket = io.connect('');
    var chatters = document.getElementById('chatters');
    var chatters_body = document.getElementById('chatters-body');
    var chat_input = document.getElementById('chat-input');
    var chat_console = document.getElementById('chat-console');
    var name;

    function getTS() {
        function checkTime(i) {
            return (i < 10) ? "0" + i : i;
        }
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        var s = today.getSeconds();
        m = checkTime(m);
        s = checkTime(s);
        return h + ":" + m + ":" + s;
    }

    function toBottom() {
        $("#chat-console").animate({ scrollTop: $("#chat-console").prop("scrollHeight") }, "fast");
    }

    function removeChatter(name) {
        var current_chatters = document.querySelectorAll('[data-name]');
        for (var i = 0; i < current_chatters.length; i += 1) {
            if (name === current_chatters[i].getAttribute('data-name')) {
                current_chatters[i].parentNode.removeChild(current_chatters[i]);
                break;
            };
        };
        insertNotification({message:name+' has left the chat room', ts: getTS()});
    };

    function insertChatter(name) {
        var new_chatter = document.createElement('tr');
        new_chatter.setAttribute('data-name', name);
        new_chatter.setAttribute('class', 'connected');
        new_chatter.innerHTML = '<th>'+name+'</th>';
        chatters_body.appendChild(new_chatter);
        insertNotification({message: name+' has joint the chat room', ts: getTS()});
    };

    function addChatter(name) {
        var new_chatter = document.createElement('tr');
        new_chatter.setAttribute('data-name', name);
        new_chatter.setAttribute('class', 'connected');
        new_chatter.innerHTML = '<th>'+name+'</th>';
        chatters_body.appendChild(new_chatter);
    };

    function insertNotification(message) {
        var new_notification = document.createElement('li');
        new_notification.setAttribute('class', 'notification list-group-item list-group-item-info');
        var content = document.createElement('span');
        content.setAttribute('class', 'message-content');
        content.innerHTML = message.message;
        var ts = document.createElement('span');
        ts.setAttribute('class', 'ts');
        ts.innerHTML = message.ts;
        new_notification.appendChild(content);
        new_notification.appendChild(ts);
        chat_console.appendChild(new_notification);
        toBottom();
    }

    function insertMessage(message) {
        var new_message = document.createElement('li');
        new_message.setAttribute('data-name', message.name);
        new_message.setAttribute('class', 'message list-group-item list-group-item-success');
        var name = document.createElement('span');
        name.setAttribute('class','sender');
        name.innerHTML = message.name+': ';
        var content = document.createElement('span');
        content.setAttribute('class', 'message-content');
        content.innerHTML = message.message;
        var ts = document.createElement('span');
        ts.setAttribute('class', 'ts');
        ts.innerHTML = message.ts;
        new_message.appendChild(name);
        new_message.appendChild(content);
        new_message.appendChild(ts);
        chat_console.appendChild(new_message);
    };

    document.getElementById('chat-form').onsubmit = function(e) {
        e.preventDefault();
        socket.emit('messages', chat_input.value);
        insertMessage({name: name, message: chat_input.value, ts: getTS()});
        chat_input.value = null;
        toBottom();
    };

    socket.on('messages', function(data) {
        insertMessage(data);
        toBottom();
    });

    socket.on('historical', function(msgs) {
        msgs.forEach(function(msg) {
            insertMessage(msg);
        });
        setTimeout(function(){ $("#chat-console").scrollTop($("#chat-console").prop("scrollHeight")); }, 1000);
        insertChatter(name);
    });

    socket.on('user_list', function(users) {
        users.forEach(function(new_name) {
            addChatter(new_name);
        });
    });

    socket.on('connect', function(data) {
        name = prompt('what is your name?');
        socket.emit('join', name);
    });

    socket.on('new_join', insertChatter);
    socket.on('new_leave', removeChatter);

}());
