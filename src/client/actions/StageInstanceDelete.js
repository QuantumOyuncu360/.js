'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class StageInstanceDeleteAction extends Action {
  handle(data) {
    let stageInstance;

    const client = this.client;
    const channel = this.getChannel(data);

    if (channel) {
      stageInstance = this.getStageInstance(data, channel);
      if (stageInstance) {
        channel.guild.stageInstances.cache.delete(stageInstance.id);
        stageInstance.deleted = true;

        /**
         * Emitted whenever a stage instance is deleted.
         * @event Client#stageInstanceDelete
         * @param {StageInstance} stageInstance The deleted stage instance
         */
        client.emit(Events.STAGE_INSTANCE_DELETE, stageInstance);
      }
    }

    return { stageInstance };
  }
}

module.exports = StageInstanceDeleteAction;
