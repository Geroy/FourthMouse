/*jslint node: true */
"use strict";

/**
 * GET /
 * Matches page.
 */
exports.getMatches = (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
     res.render('matches', {
        title: 'Matches'
    });
};

/**
 * POST /
 * Matches Page.
 */
exports.postMatches = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/login');
    }

    // Update the match with the changed information
};