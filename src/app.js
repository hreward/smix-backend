const express = require('express');
const cors = require("cors");
const {saveSession} = require("./helper")
const session = require("express-session");
var FileStore = require('session-file-store')(session);
require('dotenv').config();

const {router: AuthRouter} = require("./routes/auth.router");
const {router: UserRouter} = require("./routes/user.router");
const {router: CoopRouter} = require("./routes/business.router");
const {router: ChatRouter} = require("./routes/chat.router");
const {router: WalletRouter} = require("./routes/wallet.router");
const {router: AdminRouter} = require("./routes/admin.router");

const mapp = express();

const corsOptions = {
	origin: true,
	// origin: ['http://localhost:4200', 'http://localhost'],
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
};
mapp.use(cors(corsOptions));
mapp.use(express.json());

mapp.use(session({
    store: new FileStore(),
	secret: "ypooc-aa",
	resave: false,
	saveUninitialized: false,
	name: "scoop"
}));


mapp.use((request, response, next)=>{
	// saveSession(request.session);
	next();
});


mapp.use("/auth", AuthRouter);
mapp.use("/user", UserRouter);
mapp.use("/coop", CoopRouter);
mapp.use("/chat", ChatRouter);
mapp.use("/wallet", WalletRouter);


module.exports = {mapp};