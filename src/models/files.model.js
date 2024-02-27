const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { tokenTypes } = require('../config/tokens');

const fileSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: "true"
    },
    
    media: {
      type: String,
      default:""
    },
    status: {
      type: String,
      default:"uploading"
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
fileSchema.plugin(toJSON);

/**
 * @typedef Token
 */
const File = mongoose.model('File', fileSchema);

module.exports = File;
