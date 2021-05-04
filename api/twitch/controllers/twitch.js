"use strict";

/**
 * A set of functions called "actions" for `twitch`
 */

const { sanitizeEntity } = require("strapi-utils");
const _ = require("lodash");

module.exports = {
  /**
   * Retrieve a record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    const { id } = ctx.params;

    const entity = await strapi.services.srab.findOne({ id });

    if (!entity) {
      return ctx.notFound(`Twitch info for Srab ${id} not found`);
    }

    // Get the twitch auth provider for specific srab
    const twitchService = strapi.services.twitch[entity.nickname];

    // Getting channel info
    const response = await twitchService.kraken.channels.getMyChannel();
    const twitch = _.pick(response, [
      "id",
      "description",
      "followers",
      "views",
    ]);

    // Getting subs count
    const subs = await twitchService.kraken.channels.getChannelSubscriptionCount(
      twitch.id
    );

    const stream = await twitchService.helix.streams.getStreamByUserId(
      twitch.id
    );

    twitch.isLive = stream ? true : false;
    twitch.subs = subs;

    twitch.srab = _.pick(entity, ["id", "nickname"]);

    return twitch;
  },
};
