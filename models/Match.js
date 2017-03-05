/*jslint node: true */
"use strict";

const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    milesAway: Number,
    matchPercent: Number,
    mutualLike: Boolean,
    wasMessaged: Boolean,
    hideFromSearch: Boolean,
    blocked: Boolean,
    rating: {type: mongoose.Schema.Types.ObjectId, ref: 'Rating'},

}, {timestamps: true});


const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
