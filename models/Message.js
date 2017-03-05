/*jslint node: true */
"use strict";

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: String,
    dateSent: Date,
}, {timestamps: true});


const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
