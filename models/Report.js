/*jslint node: true */
"use strict";

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: {type: Date, default: Date.now},
    reason: String,
}, {timestamps: true});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
