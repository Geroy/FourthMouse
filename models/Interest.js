/*jslint node: true */
"use strict";

const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'InterestCategory'},
    name: String,
    description: String,
    importance: Number,
    imageUrl: String,
}, {timestamps: true});

const Interest = mongoose.model('Interest', interestSchema);

module.exports = Interest;
