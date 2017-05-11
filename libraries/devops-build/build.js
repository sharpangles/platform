let ConfigurationTrackerFactory = require('./__artifacts/local/src/configuration/configuration_tracker_factory').ConfigurationTrackerFactory;

let factory = new ConfigurationTrackerFactory({configName: '../../sharpangles.config.json' });
factory.createTrackersAsync().then(() => factory.start());
