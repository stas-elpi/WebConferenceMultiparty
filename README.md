# Web Conference

## Members: Dimitris Tzovanis, Elpida Stasinou

Our project is a web-based conferencing application that allows users to 
conduct real-time video and audio meetings directly in their browsers. 
We used the webrtc library to create a peer to peer connection, as well as ready-made stun ice servers to handle the initial communication.
In addition we created a data stream to transfer the chat messages in real time, and to distinguish whether the user is remote or local

### Features
- Real-time Video and Audio Calls: High-quality, low-latency video and audio calls.
- Chat Functionality: Send and receive messages in real-time during the conference.
- Cross-Platform: Works on all major browsers and is responsive to fit any device.

### Dependencies

- Download Node 
- From cmd go to the project folder directory execute the following
  - npm init -y
  - npm install -S express@4.15.4 socket.io@2.0.3
- Run the command: node server.js (in cmd)
- Open in chrome: http://localhost:3000/ in up to 2 windows
