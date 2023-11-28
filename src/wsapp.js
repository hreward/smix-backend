const WebSocket = require('ws');
const uaParser = require("ua-parser-js");
const { Auth } = require('./models/auth.model');
const { isNotEmpty } = require('./helper');
const { Business } = require('./models/business.model');

// Define an event for new notifications
const NOTIFICATION_EVENT = 'new-notification';
const socketClients = new Map(); // Map to store WebSocket connections

// Create a WebSocket server
const createWebSocketServer = (server) => {
    const wss = new WebSocket.Server({ server });

    // Handle new WebSocket connections
    wss.on('connection', async (ws, request) => {
        try {            
            // getting token from url
            const url = new URL(request.url, `ws://${request.headers.host}`);
            const params = new URLSearchParams(url.search);
            const token = params.get('t');
            if(!isNotEmpty(token)){
                ws.close();
                return;
            }

            //confirm login
            var uap = uaParser(request.headers['business-agent']);
            const tokenData = {};
            tokenData.device_signature = uap.ua;
            tokenData.device_name = `${uap.os.name}-${uap.os.version}`;
            tokenData.browser = `${uap.browser.name}`;
            tokenData.token = token;
        
            /**
             * @type {Business}
             */
            const thisbusiness = await Auth.authenticateTokenAccess(tokenData);
            ws.businessId = thisbusiness.id;
            // Store the WebSocket connection in the clients map
            socketClients.set(ws.businessId, ws);
        } catch (error) {
            ws.close();
            console.log(error);
            return;
        }

        ws.on('message', (data)=>{
            try {
                let parsedData;
                try {
                    parsedData = JSON.parse(data);
                } catch (error) {
                    // console.error('Failed to parse message:', error);
                    return;
                }
            } catch (error) {
                // console.log(error);
                return;
            }
        });

        // Handle disconnections
        ws.on('close', () => {
            socketClients.delete(ws.businessId); // Remove the WebSocket connection from the clients map
        });
    });

    return wss;
};

// Function to send a WebSocket message to a specific business
const sendWebSocketMessageToBusiness = (businessId, data) => {
    const ws = socketClients.get(businessId);
    if (ws) {
        ws.send(JSON.stringify(data));
    }
};

module.exports = {socketClients, createWebSocketServer, sendWebSocketMessageToBusiness};