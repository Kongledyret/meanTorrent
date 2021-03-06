'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  config = require(path.resolve('./config/config')),
  mongoose = require('mongoose'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  User = mongoose.model('User'),
  Peer = mongoose.model('Peer'),
  Complete = mongoose.model('Complete'),
  Torrent = mongoose.model('Torrent'),
  async = require('async'),
  validator = require('validator'),
  tmdb = require('moviedb')(config.meanTorrentConfig.tmdbConfig.key);

const PEERSTATE_SEEDER = 'seeder';
const PEERSTATE_LEECHER = 'leecher';

var announceConfig = config.meanTorrentConfig.announce;

/**
 * list my seeding torrents
 * @param req
 * @param res
 */
exports.getMySeeding = function (req, res) {
  Peer.find({
    user: req.user._id,
    peer_status: PEERSTATE_SEEDER,
    last_announce_at: {$gt: Date.now() - announceConfig.announceInterval - announceConfig.announceIdleTime}
  }).sort('-peer_uploaded')
    .populate({
      path: 'torrent',
      populate: [
        {path: 'user', select: 'displayName profileImageURL'},
        {path: 'maker', select: 'name'}
      ]
    })
    .exec(function (err, torrents) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(torrents);
      }
    });
};

/**
 * list my downloading torrents
 * @param req
 * @param res
 */
exports.getMyDownloading = function (req, res) {
  Peer.find({
    user: req.user._id,
    peer_status: PEERSTATE_LEECHER,
    last_announce_at: {$gt: Date.now() - announceConfig.announceInterval - announceConfig.announceIdleTime}
  }).sort('-peer_downloaded')
    .populate({
      path: 'torrent',
      populate: [
        {path: 'user', select: 'displayName profileImageURL'},
        {path: 'maker', select: 'name'}
      ]
    })
    .exec(function (err, torrents) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(torrents);
      }
    });
};

/**
 * getMyWarning
 * @param req
 * @param res
 */
exports.getMyWarning = function (req, res) {
  Complete.find({
    user: req.user._id,
    hnr_warning: true
  }).populate({
    path: 'torrent',
    populate: [
      {path: 'user', select: 'displayName profileImageURL'},
      {path: 'maker', select: 'name'}
    ]
  }).exec(function (err, complets) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(complets);
    }
  });
};
