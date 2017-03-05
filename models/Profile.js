/*jslint node: true */
"use strict";

const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: String,
    gender: String,
    location: String,
    website: String,
    picture: String,
    likes: {
        category: String,
        item: String,
        importance: Number,
    }
}, {timestamps: true});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;



