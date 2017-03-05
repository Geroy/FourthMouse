/*jslint node: true */
"use strict";

const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: Number,
    dateRated: Date,
}, {timestamps: true});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
