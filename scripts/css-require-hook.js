// This file is used to handle CSS imports during type generation
require.extensions['.css'] = function (module, filename) {
  module.exports = {};
};
