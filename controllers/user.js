/*jslint node: true */
"use strict";

const horoscope = require('horoscope');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const Match = require('../models/Match');
const Message = require('../models/Message');
const Rating = require('../models/Rating');
const _ = require('lodash');


/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('account/login', {
        title: 'Login'
    });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({remove_dots: false});

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/login');
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('errors', info);
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', {msg: 'Success! You are logged in.'});
            res.redirect(req.session.returnTo || '/');
        });
    })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('account/signup', {
        title: 'Create Account'
    });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.sanitize('email').normalizeEmail({remove_dots: false});

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/signup');
    }

    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    User.findOne({email: req.body.email}, (err, existingUser) => {
        if (err) {
            return next(err);
        }
        if (existingUser) {
            req.flash('errors', {msg: 'Account with that email address already exists.'});
            return res.redirect('/signup');
        }
        user.save((err) => {
            if (err) {
                return next(err);
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
    res.render('account/profile', {
        title: 'Account Management'
    });
};


/**
 * Gets the astrological sign for a given user's birthday
 * @param date
 * @returns {string}
 */
function getAstrologicalSign(date){
    var sign = '';

    // Get the birthday from the user's profile
    var birthday = new Date(date);
    if (_.isDate(birthday)){
        // Set the user's astrological sign based on the horoscope
        sign = horoscope.getSign({month: birthday.getMonth(),
            day: birthday.getDay()});
    }

    return sign;
}

/**
 * Gets the age of the user from a given user's birthday
 * @param date
 * @returns {string}
 */
function getAgeFromBirthday(date){
    var age = '';

    // Get the birthday from the user's profile
    var birthday = new Date(date);

    if (_.isDate(birthday)){
        // Set the user's astrological sign based on the horoscope
        var currentTime = new Date(_.now());

        console.log('currentTime' + currentTime);
        console.log('currentTime.year' + currentTime.getYear());

        console.log('current year=' + currentTime.getYear() + ' birthday year=' + birthday.getYear());
        age = currentTime.getYear() - birthday.getYear();
    }

    return age;
}

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
    req.check('email', 'Please enter a valid email address.').isEmail();
    req.check('zipcode', 'Please enter a valid ZIP code').len(4,5).isInt();
    req.sanitize('email').normalizeEmail({remove_dots: false});
    req.sanitizeBody('name');
    req.sanitizeBody('birthday').toDate();
    req.sanitizeBody('gender');
    req.sanitizeBody('picture');
    req.sanitizeBody('summary');
    req.sanitizeBody('astrologicalSign');
    req.sanitizeBody('eyeColor');
    req.sanitizeBody('hairColor');
    req.sanitizeBody('heightInches').toInt();
    req.sanitizeBody('weightPounds').toInt();
    req.sanitizeBody('fitnessLevel').toInt();
    req.sanitizeBody('ethnicity');
    req.sanitizeBody('language');
    req.sanitizeBody('religion');
    req.sanitizeBody('education');
    req.sanitizeBody('diet');
    req.sanitizeBody('caffeine').toBoolean();
    req.sanitizeBody('alcohol').toBoolean();
    req.sanitizeBody('tobacco').toBoolean();
    req.sanitizeBody('weed').toBoolean();
    req.sanitizeBody('otherDrugs').toBoolean();
    req.sanitizeBody('cats').toBoolean();
    req.sanitizeBody('dogs').toBoolean();
    req.sanitizeBody('reptiles').toBoolean();
    req.sanitizeBody('birds').toBoolean();
    req.sanitizeBody('otherPets').toBoolean();
    req.sanitizeBody('currentKids').toInt();
    req.sanitizeBody('wantMoreKids').toBoolean();
    req.sanitizeBody('messageMeIf');
    req.sanitizeBody('doNotMessageIf');
    req.sanitizeBody('genderInterests');
    req.check({
        'minAge': {
            isInt: {
                options: {
                    min: '18',
                    max: req.body.maxAge
                },
                errorMessage: 'Minimum age must be between 18 and the maximum age you entered.'
            }
        }
    });
    req.sanitizeBody('minAge').toInt();
    req.check({
        'maxAge': {
            isInt: {
                options: {
                    min: req.body.minAge,
                    max: '99'
                },
                errorMessage: 'Maximum age must be between the minimum age you entered and 99 (sorry old people, props for getting here though)'
            }
        }
    });

    req.sanitizeBody('maxAge').toInt();
    req.sanitizeBody('relationshipTypes');
    req.sanitizeBody('minDistanceMiles').toInt();
    req.sanitizeBody('maxDistanceMiles').toInt();
    req.sanitizeBody('minMatchPercent').toInt();
    req.sanitizeBody('maxMatchPercent').toInt();

    //TODO: we should have schemas for each one which maps to an enum or something
    // religion enum - 1: christian, 2: jewish, etc.

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/account');
    }

    User.findById(req.user.id, (err, user) => {
        if (err) {
            return next(err);
        }
        //TODO: need to upload/manage profile pictures here too, maybe we could move it elsewhere

        // General information
        user.email = req.body.email || req.user.email || '';
        user.profile.name = req.body.name || req.user.name || '';
        user.profile.birthday = req.body.birthday || req.user.birthday || '';
        user.profile.age = req.user.age || getAgeFromBirthday(user.profile.birthday) || '';
        user.profile.gender = req.body.gender || req.user.gender || '';

        //TODO: we might need zipcodes to get the locations, might be easier to do here rather than from the client side
        //TODO: not sure what to do with the locations pulled from linkedin, facebook, etc.
        user.profile.zipcode = req.body.zipcode || req.user.zipcode || '';
        user.profile.summary = req.body.summary || req.user.summary || '';
        user.profile.astrologicalSign = req.user.astrologicalSign || getAstrologicalSign(user.profile.birthday) || '';

        // Physical appearance
        user.profile.eyeColor = req.body.eyeColor || req.user.eyeColor || '';
        user.profile.hairColor = req.body.hairColor || req.user.hairColor || '';
        user.profile.heightInches = req.body.heightInches || req.user.heightInches || '';
        user.profile.weightPounds = req.body.weightPounds || req.user.weightPounds || '';
        user.profile.fitnessLevel = req.body.fitnessLevel || req.user.fitnessLevel || '';

        // Culture
        user.profile.ethnicity = req.body.ethnicity || req.user.ethnicity || '';
        user.profile.language = req.body.language || req.user.language || '';
        user.profile.religion = req.body.religion || req.user.religion || '';
        user.profile.education = req.body.education || req.user.education || '';

        // Dating Purpose
        user.profile.messageMeIf = req.body.messageMeIf || req.user.messageMeIf || '';
        user.profile.doNotMessageIf = req.body.doNotMessageIf || req.user.doNotMessageIf || '';
        user.profile.genderInterests = req.body.genderInterests || req.user.genderInterests || '';

        // Lifestyle
        user.profile.diet = req.body.diet || req.user.diet || '';
        user.profile.caffeine = req.body.caffeine || req.user.caffeine || '';
        user.profile.alcohol = req.body.alcohol || req.user.alcohol || '';
        user.profile.tobacco = req.body.tobacco || req.user.tobacco || '';
        user.profile.weed = req.body.weed || req.user.weed || '';
        user.profile.otherDrugs = req.body.otherDrugs || req.user.otherDrugs || '';

        // Pets
        user.profile.cats = req.body.cats || req.user.cats || '';
        user.profile.dogs = req.body.dogs || req.user.dogs || '';
        user.profile.reptiles = req.body.reptiles || req.user.reptiles || '';
        user.profile.birds = req.body.birds || req.user.birds || '';
        user.profile.otherPets = req.body.otherPets || req.user.otherPets || '';

        // Kids
        user.profile.currentKids = req.body.currentKids || req.user.currentKids || '';
        user.profile.wantMoreKids = req.body.wantMoreKids || req.user.wantMoreKids || '';

        // Logistics
        user.profile.minAge = req.body.minAge || req.user.minAge || '';
        user.profile.maxAge = req.body.maxAge || req.user.maxAge || '';
        user.profile.relationshipTypes = req.body.relationshipTypes || req.user.relationshipTypes || '';
        user.profile.minDistanceMiles = req.body.minDistanceMiles || req.user.minDistanceMiles || '';
        user.profile.maxDistanceMiles = req.body.maxDistanceMiles || req.user.maxDistanceMiles || '';
        user.profile.minMatchPercent = req.body.minMatchPercent || req.user.minMatchPercent || '';
        user.profile.maxMatchPercent = req.body.maxMatchPercent || req.user.maxMatchPercent || '';

        user.save((err) => {
            if (err) {
                if (err.code === 11000) {
                    req.flash('errors', {msg: 'The email address you have entered is already associated with an account.'});
                    return res.redirect('/account');
                }
                return next(err);
            }
            req.flash('success', {msg: 'Profile information has been updated.'});
            res.redirect('/account');
        });
    });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/account');
    }

    User.findById(req.user.id, (err, user) => {
        if (err) {
            return next(err);
        }
        user.password = req.body.password;
        user.save((err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', {msg: 'Password has been changed.'});
            res.redirect('/account');
        });
    });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
    User.remove({_id: req.user.id}, (err) => {
        if (err) {
            return next(err);
        }
        req.logout();
        req.flash('info', {msg: 'Your account has been deleted.'});
        res.redirect('/');
    });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
    const provider = req.params.provider;
    User.findById(req.user.id, (err, user) => {
        if (err) {
            return next(err);
        }
        user[provider] = undefined;
        user.tokens = user.tokens.filter(token => token.kind !== provider);
        user.save((err) => {
            if (err) {
                return next(err);
            }
            req.flash('info', {msg: `${provider} account has been unlinked.`});
            res.redirect('/account');
        });
    });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    User
        .findOne({passwordResetToken: req.params.token})
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.flash('errors', {msg: 'Password reset token is invalid or has expired.'});
                return res.redirect('/forgot');
            }
            res.render('account/reset', {
                title: 'Password Reset'
            });
        });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
    req.assert('password', 'Password must be at least 4 characters long.').len(4);
    req.assert('confirm', 'Passwords must match.').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('back');
    }

    async.waterfall([
        function resetPassword(done) {
            User
                .findOne({passwordResetToken: req.params.token})
                .where('passwordResetExpires').gt(Date.now())
                .exec((err, user) => {
                    if (err) {
                        return next(err);
                    }
                    if (!user) {
                        req.flash('errors', {msg: 'Password reset token is invalid or has expired.'});
                        return res.redirect('back');
                    }
                    user.password = req.body.password;
                    user.passwordResetToken = undefined;
                    user.passwordResetExpires = undefined;
                    user.save((err) => {
                        if (err) {
                            return next(err);
                        }
                        req.logIn(user, (err) => {
                            done(err, user);
                        });
                    });
                });
        },
        function sendResetPasswordEmail(user, done) {
            const transporter = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USER,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
            const mailOptions = {
                to: user.email,
                from: 'hackathon@starter.com',
                subject: 'Your Hackathon Starter password has been changed',
                text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
            };
            transporter.sendMail(mailOptions, (err) => {
                req.flash('success', {msg: 'Success! Your password has been changed.'});
                done(err);
            });
        }
    ], (err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('account/forgot', {
        title: 'Forgot Password'
    });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    req.sanitize('email').normalizeEmail({remove_dots: false});

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/forgot');
    }

    async.waterfall([
        function createRandomToken(done) {
            crypto.randomBytes(16, (err, buf) => {
                const token = buf.toString('hex');
                done(err, token);
            });
        },
        function setRandomToken(token, done) {
            User.findOne({email: req.body.email}, (err, user) => {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    req.flash('errors', {msg: 'Account with that email address does not exist.'});
                    return res.redirect('/forgot');
                }
                user.passwordResetToken = token;
                user.passwordResetExpires = Date.now() + 3600000; // 1 hour
                user.save((err) => {
                    done(err, token, user);
                });
            });
        },
        function sendForgotPasswordEmail(token, user, done) {
            const transporter = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USER,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
            const mailOptions = {
                to: user.email,
                from: 'support@fourthmouse.com',
                subject: 'Reset your Fourth Mouse account password',
                text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };
            transporter.sendMail(mailOptions, (err) => {
                req.flash('info', {msg: `An e-mail has been sent to ${user.email} with further instructions.`});
                done(err);
            });
        }
    ], (err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/forgot');
    });
};



