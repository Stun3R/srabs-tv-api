const { ApiClient } = require("twitch");
const { RefreshableAuthProvider, StaticAuthProvider } = require("twitch-auth");

module.exports = (strapi) => {
  return {
    async initialize() {
      const { clientId, clientSecret } = strapi.config.get(
        "hook.settings.twitch"
      );

      // Get srabs
      const entities = await strapi.services.srab.find();

      // Prepare services twitch
      strapi.services.twitch = {};

      // Load auth provider for each srabs
      for (const entity of entities) {
        const authProvider = new RefreshableAuthProvider(
          new StaticAuthProvider(clientId, entity.accessToken, [
            "channel_read",
            "channel_subscriptions",
          ]),
          {
            clientSecret,
            refreshToken: entity.refreshToken,
            onRefresh: (token) => {
              strapi.services.srab
                .update(
                  { id: entity.id },
                  {
                    accessToken: token.accessToken,
                  }
                )
                .then((res) => {});
            },
          }
        );
        // Set auth provider for each srabs
        strapi.services.twitch[entity.nickname] = new ApiClient({
          authProvider,
        });
      }
    },
  };
};
