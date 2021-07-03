import {logger} from 'lib';
import {SlashCommand} from 'domain/slack';
import {fetchUserInfo, sendMessage} from 'infrastructure/slack-interface';
import {add, roundToNearestMinutes} from 'date-fns';
import {format} from 'date-fns-tz';

import {config} from '../config';
import {KickoffMetadata} from 'domain/kickoff-modal';
import {openEmptyKickoffModal, updateKickoffModal} from 'lib/kickoff/modal';

interface TimezoneInfo {
  tz: string,
  label: string
}

const fetchUserTimezone = async (userId: string): Promise<TimezoneInfo> => {
  const user = await fetchUserInfo(userId);
  return {
    tz: user.user?.tz as string,
    label: user.user?.tz_label as string,
  };
};

const getNextAvailableTime = () => {
  const currentDate = new Date();
  const minimumDate = add(currentDate, {minutes: config.minimumNotifyMinutesBeforeKickoff});
  // Get the nearest time block
  const nextAvailableTime = roundToNearestMinutes(minimumDate, {
    nearestTo: config.roundToNearestMinutes,
  });

  if (nextAvailableTime > minimumDate) {
    return nextAvailableTime;
  }

  // Makes sure that the next time slot is used if the rounded time
  return roundToNearestMinutes(add(nextAvailableTime, {minutes: config.roundToNearestMinutes}), {
    nearestTo: config.roundToNearestMinutes,
  });
};

const createNewKickoff = async (viewId: string, timezone: TimezoneInfo) => {
  const initialDateTime = getNextAvailableTime();
  const initialDate = format(initialDateTime, 'yyyy-MM-dd', {timeZone: timezone.tz});
  const initialTime = format(initialDateTime, 'HH:mm', {timeZone: timezone.tz});
  const timezoneString = `(UTC ${format(initialDateTime, 'xxx', {timeZone: timezone.tz})}) ${timezone.tz}`;

  const metadata: KickoffMetadata = {
    timezone: timezone.tz,
  };

  await updateKickoffModal({
    viewId,
    timezone: timezoneString,
    initialDate,
    initialTime,
    metadata,
  });
};

const openKickoffModal = async (command: SlashCommand) => {
  const {trigger_id: triggerId, user_id: userId} = command;

  try {
    const [viewId, timezoneInfo] = await Promise.all([
      // We need to open an empty one because the trigger id needs to be responded to within 5 seconds.
      openEmptyKickoffModal(triggerId),
      fetchUserTimezone(userId),
    ]);
    await createNewKickoff(viewId, timezoneInfo);
  } catch (error) {
    logger.error(error, 'Failed to open a kickoff modal');
    return sendMessage(userId, ':white_frowning_face: Something went wrong! Please try again');
  }
};

export {
  openKickoffModal,
};
