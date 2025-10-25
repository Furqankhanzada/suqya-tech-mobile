const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withSimdjson = (config) => {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfile = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile',
      );
      let contents = fs.readFileSync(podfile, 'utf-8');

      if (!contents.includes(`pod 'simdjson'`)) {
        contents = contents.replace(
          /use_expo_modules!/,
          `pod 'simdjson', path: '../node_modules/@nozbe/simdjson', modular_headers: true\n  use_expo_modules!`,
        );
        fs.writeFileSync(podfile, contents);
      }

      return config;
    },
  ]);
};

module.exports = withSimdjson;
