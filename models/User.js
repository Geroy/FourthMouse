/*jslint node: true */
"use strict";

const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    instagram: String,
    facebook: String,
    google: String,
    linkedin: String,
    steam: String,
    tokens: Array,

    profile: {
        // Was the profile auto populated from social media sites? -- not sure if we really care
        autoPopulated: {type: Boolean, required: true, default: false},

        // General information
        name: String,
        birthday: Date,
        gender: String,
        location: String,
        zipcode: Number,
        picture: [String],
        summary: String,
        astrologicalSign: String,

        // Physical appearance
        eyeColor: String,
        hairColor: String,
        heightInches: Number,
        weightPounds: Number,
        fitnessLevel: Number,

        // Culture
        ethnicity: [String],
        language: [String],
        religion: [String],
        education: [String],

        // Lifestyle
        diet: String,
        caffeine: Boolean,
        alcohol: Boolean,
        tobacco: Boolean,
        weed: Boolean,
        otherDrugs: String,

        // Pets
        cats: Boolean,
        dogs: Boolean,
        reptiles: Boolean,
        birds: Boolean,
        otherPets: String,

        // Kids
        currentKids: Number,
        wantMoreKids: Boolean,

        // Dating Purpose
        messageMeIf: String,
        doNotMessageIf: String,
        genderInterests: [String],

        // Logistics
        minAge: Number,
        maxAge: Number,
        relationshipTypes: [String],
        minDistanceMiles: Number,
        maxDistanceMiles: Number,
        minMatchPercent: Number,
        maxMatchPercent: Number,
    },

    interests: [{type: mongoose.Schema.Types.ObjectId, ref: 'Interest'}],

    // message aggregation: http://stackoverflow.com/questions/26486522/mongoose-how-can-i-get-a-list-of-conversations-a-sepcific-user-has-chatted-with
    messages: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],

    ratings: [{type: mongoose.Schema.Types.ObjectId, ref: 'Rating'}],

    matches: [{type: mongoose.Schema.Types.ObjectId, ref: 'Match'}],

    reports: [{type: mongoose.Schema.Types.ObjectId, ref: 'Report'}],

}, {timestamps: true});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        cb(err, isMatch);
    });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
    if (!size) {
        size = 200;
    }
    if (!this.email) {
        return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
