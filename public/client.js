var divRoomSelection = document.getElementById('roomSelection');
var divMeetingRoom = document.getElementById('meetingRoom');
var inputRoom = document.getElementById('room');
var inputName = document.getElementById('name');
var btnRegister = document.getElementById('register');


var roomName;
var userName;
var participants = {};


var socket = io();

btnRegister.onclick = function () {
    roomName = inputRoom.value;
    userName = inputName.value;

    if (roomName === '' || userName === '') {
        alert('Room and Name are required!');
    } else {
        var message = {
            event: 'joinRoom',
            userName: userName,
            roomName: roomName
        }
        sendMessage(message);
        divRoomSelection.style = "display: none";
        divMeetingRoom.style = "display: block";
    }
}

// messages handlers
socket.on('message', message => {
    console.log('Message received: ' + message.event);

    switch (message.event) {
        case 'newParticipantArrived':
            receiveVideo(message.userid, message.username);
            console.log("newParticipantArrived    //////")
            break;
        case 'existingParticipants':
            onExistingParticipants(message.userid, message.existingUsers);
            break;
        case 'receiveVideoAnswer':
            onReceiveVideoAnswer(message.senderid, message.sdpAnswer);
            console.log("receiveVideoAnswer    //////")
            break;
        case 'candidate':
            addIceCandidate(message.userid, message.candidate);
            break;
    }
});


function receiveVideo(userid, username) {
    var video = document.createElement('video');
    var div = document.createElement('div');
    div.className = "videoContainer";
    var name = document.createElement('div');
    video.id = userid;
    video.autoplay = true;
    name.appendChild(document.createTextNode(username));
    div.appendChild(video);
    div.appendChild(name);
    divMeetingRoom.appendChild(div);

    /*
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(function(localStream) {
                video.srcObject = localStream;
                video.play();
            })
            .catch(function(error) {
                console.error('Error accessing local video:', error);
            });*/

    var user = {
        id: userid,
        username: username,
        video: video,
        rtcPeer: null
    }

    participants[user.id] = user;

    var options = {
        remoteVideo: video,
        onicecandidate: onIceCandidate
    }

    user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
        function (err) {
            if (err) {
                return console.error(err);
            }
            this.generateOffer(onOffer);
        }
    );

    var onOffer = function (err, offer, wp) {
        console.log('sending offer');
        var message = {
            event: 'receiveVideoFrom',
            userid: user.id,
            roomName: roomName,
            sdpOffer: offer
        }
        sendMessage(message);
        console.log("generated video offer //////")
    }

    function onIceCandidate(candidate, wp) {
        console.log('sending ice candidates');
        var message = {
            event: 'candidate',
            userid: user.id,
            roomName: roomName,
            candidate: candidate
        }
        sendMessage(message);
    }

    setTimeout(function () {
                if (video.srcObject) {
                    console.log('Video source exists.');

                    var remoteVideoStream = video.srcObject;
                    if (remoteVideoStream) {

                        var videoTracks = remoteVideoStream.getVideoTracks();
                        if (videoTracks.length > 0) {
                            console.log('Video track capabilities:', videoTracks[0].getSettings());
                        }

                        if (videoTracks.length > 0 && videoTracks[0].readyState === 'live') {
                            console.log('Video track is live.');
                            video.play();

                            console.log('Video srcObject:', video.srcObject);
                            console.log('Video currentSrc:', video.currentSrc);


                        } else {
                            console.log('Video track is not live.');
                        }
                    }
                } else {
                    console.log('Video source is not set.');
                }
        }, 5000); // Adjust the delay as needed
}

function onExistingParticipants(userid, existingUsers) {
    var video = document.createElement('video');
    var div = document.createElement('div');
    div.className = "videoContainer";
    var name = document.createElement('div');
    video.id = userid;
    video.autoplay = true;
    name.appendChild(document.createTextNode(userName));
    div.appendChild(video);
    div.appendChild(name);
    divMeetingRoom.appendChild(div);

    var user = {
        id: userid,
        username: userName,
        video: video,
        rtcPeer: null
    }

    participants[user.id] = user;

    var constraints = {
        audio: true,
        video : {
			mandatory : {
				maxWidth : 320,
				maxFrameRate : 15,
				minFrameRate : 15
			}
		}
    };

    var options = {
        localVideo: video,
        mediaConstraints: constraints,
        onicecandidate: onIceCandidate
    }

    user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
        function (err) {
            if (err) {
                return console.error(err);
            }
            this.generateOffer(onOffer)
        }
    );

    existingUsers.forEach(function (element) {
        receiveVideo(element.id, element.name);
    });

    var onOffer = function (err, offer, wp) {
        console.log('sending offer');
        var message = {
            event: 'receiveVideoFrom',
            userid: user.id,
            roomName: roomName,
            sdpOffer: offer
        }
        sendMessage(message);
    }

    function onIceCandidate(candidate, wp) {
        console.log('sending ice candidates');
        var message = {
            event: 'candidate',
            userid: user.id,
            roomName: roomName,
            candidate: candidate
        }
        sendMessage(message);
    }
}

function onReceiveVideoAnswer(senderid, sdpAnswer) {
    console.log(`Received video answer from sender ${senderid}`);
    console.log('SDP Answer:', sdpAnswer);
    participants[senderid].rtcPeer.processAnswer(sdpAnswer);
    console.log(`Video feed from sender ${senderid} has been successfully received`);

}

function addIceCandidate(userid, candidate) {
    participants[userid].rtcPeer.addIceCandidate(candidate);
}


function sendMessage(message) {
    console.log('sending ' + message.event + ' message to server');
    socket.emit('message', message);
}
