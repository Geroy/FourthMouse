/*jslint node: true */
"use strict";

const async = require('async');
const request = require('request');
const cheerio = require('cheerio');
const graph = require('fbgraph');
const stripe = require('stripe')(process.env.STRIPE_SKEY);
const paypal = require('paypal-rest-sdk');
const lob = require('lob')(process.env.LOB_KEY);
const ig = require('instagram-node').instagram();


/**
 * GET /api
 * List of API examples.
 */
exports.getApi = (req, res) => {
    res.render('api/index', {
        title: 'API Examples'
    });
};

/**
 * GET /api/facebook
 * Facebook API example.
 */
exports.getFacebook = (req, res, next) => {
    const token = req.user.tokens.find(token => token.kind === 'facebook');
    graph.setAccessToken(token.accessToken);
    graph.get(`${req.user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err, results) => {
        if (err) {
            return next(err);
        }
        res.render('api/facebook', {
            title: 'Facebook API',
            profile: results
        });
    });
};

/**
 * GET /api/scraping
 * Web scraping example using Cheerio library.
 */
exports.getScraping = (req, res, next) => {
    request.get('https://news.ycombinator.com/', (err, request, body) => {
        if (err) {
            return next(err);
        }
        const $ = cheerio.load(body);
        const links = [];
        $('.title a[href^="http"], a[href^="https"]').each((index, element) => {
            links.push($(element));
        });
        res.render('api/scraping', {
            title: 'Web Scraping',
            links
        });
    });
};

/**
 * GET /api/aviary
 * Aviary image processing example.
 */
exports.getAviary = (req, res) => {
    res.render('api/aviary', {
        title: 'Aviary API'
    });
};

/**
 * GET /api/stripe
 * Stripe API example.
 */
exports.getStripe = (req, res) => {
    res.render('api/stripe', {
        title: 'Stripe API',
        publishableKey: process.env.STRIPE_PKEY
    });
};

/**
 * POST /api/stripe
 * Make a payment.
 */
exports.postStripe = (req, res) => {
    const stripeToken = req.body.stripeToken;
    const stripeEmail = req.body.stripeEmail;
    stripe.charges.create({
        amount: 395,
        currency: 'usd',
        source: stripeToken,
        description: stripeEmail
    }, (err) => {
        if (err && err.type === 'StripeCardError') {
            req.flash('errors', {msg: 'Your card has been declined.'});
            return res.redirect('/api/stripe');
        }
        req.flash('success', {msg: 'Your card has been successfully charged.'});
        res.redirect('/api/stripe');
    });
};

/**
 * GET /api/instagram
 * Instagram API example.
 */
exports.getInstagram = (req, res, next) => {
    const token = req.user.tokens.find(token => token.kind === 'instagram');
    ig.use({client_id: process.env.INSTAGRAM_ID, client_secret: process.env.INSTAGRAM_SECRET});
    ig.use({access_token: token.accessToken});
    async.parallel({
        searchByUsername: (done) => {
            ig.user_search('richellemead', (err, users) => {
                done(err, users);
            });
        },
        searchByUserId: (done) => {
            ig.user('175948269', (err, user) => {
                done(err, user);
            });
        },
        popularImages: (done) => {
            ig.media_popular((err, medias) => {
                done(err, medias);
            });
        },
        myRecentMedia: (done) => {
            ig.user_self_media_recent((err, medias) => {
                done(err, medias);
            });
        }
    }, (err, results) => {
        if (err) {
            return next(err);
        }
        res.render('api/instagram', {
            title: 'Instagram API',
            usernames: results.searchByUsername,
            userById: results.searchByUserId,
            popularImages: results.popularImages,
            myRecentMedia: results.myRecentMedia
        });
    });
};

/**
 * GET /api/paypal
 * PayPal SDK example.
 */
exports.getPayPal = (req, res, next) => {
    paypal.configure({
        mode: 'sandbox',
        client_id: process.env.PAYPAL_ID,
        client_secret: process.env.PAYPAL_SECRET
    });

    const paymentDetails = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal'
        },
        redirect_urls: {
            return_url: process.env.PAYPAL_RETURN_URL,
            cancel_url: process.env.PAYPAL_CANCEL_URL
        },
        transactions: [{
            description: 'Hackathon Starter',
            amount: {
                currency: 'USD',
                total: '1.99'
            }
        }]
    };

    paypal.payment.create(paymentDetails, (err, payment) => {
        if (err) {
            return next(err);
        }
        req.session.paymentId = payment.id;
        const links = payment.links;
        for (let i = 0; i < links.length; i++) {
            if (links[i].rel === 'approval_url') {
                res.render('api/paypal', {
                    approvalUrl: links[i].href
                });
            }
        }
    });
};

/**
 * GET /api/paypal/success
 * PayPal SDK example.
 */
exports.getPayPalSuccess = (req, res) => {
    const paymentId = req.session.paymentId;
    const paymentDetails = {payer_id: req.query.PayerID};
    paypal.payment.execute(paymentId, paymentDetails, (err) => {
        res.render('api/paypal', {
            result: true,
            success: !err
        });
    });
};

/**
 * GET /api/paypal/cancel
 * PayPal SDK example.
 */
exports.getPayPalCancel = (req, res) => {
    req.session.paymentId = null;
    res.render('api/paypal', {
        result: true,
        canceled: true
    });
};

/**
 * GET /api/lob
 * Lob API example.
 */
exports.getLob = (req, res, next) => {
    lob.routes.list({zip_codes: ['10007']}, (err, routes) => {
        if (err) {
            return next(err);
        }
        res.render('api/lob', {
            title: 'Lob API',
            routes: routes.data[0].routes
        });
    });
};

/**
 * GET /api/upload
 * File Upload API example.
 */

exports.getFileUpload = (req, res) => {
    res.render('api/upload', {
        title: 'File Upload'
    });
};

exports.postFileUpload = (req, res) => {
    req.flash('success', {msg: 'File was uploaded successfully.'});
    res.redirect('/api/upload');
};

exports.getGoogleMaps = (req, res) => {
    res.render('api/google-maps', {
        title: 'Google Maps API'
    });
};
