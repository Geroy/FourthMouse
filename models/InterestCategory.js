/*jslint node: true */
"use strict";

const mongoose = require('mongoose');

const interestCategorySchema = new mongoose.Schema({
    name: String,
    description: String,
    imageUrl: String,
}, {timestamps: true});

const InterestCategory = mongoose.model('InterestCategory', interestCategorySchema);

module.exports = InterestCategory;