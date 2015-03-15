function BeamConnection(websocket, id, myId, authKey) {
    var $this = this;

    this.websocket = websocket;
    this.id = id;
    this.myId = myId;
    this.authKey = authKey;

    websocket.on('open', function() {
        $this.open.apply($this, arguments);
    });
    websocket.on('message', function() {
        $this.message.apply($this, arguments);
    });
    websocket.on('close', function() {
        $this.close.apply($this, arguments);
    });
}

BeamConnection.prototype.open = function () {
    this.send({
        type: 'method',
        method: 'auth',
        arguments: [
            this.id,
            this.myId,
            this.authKey
        ],
        id: 1
    });
};

BeamConnection.prototype.message = function (message) {
    console.log(message);
    message = JSON.parse(message);
};

BeamConnection.prototype.send = function (data) {
    console.log('Sent ' + JSON.stringify(data));
    this.websocket.send(JSON.stringify(data));
};

BeamConnection.prototype.close = function () {
    console.log('Disconnected.');
};

module.exports = BeamConnection;
