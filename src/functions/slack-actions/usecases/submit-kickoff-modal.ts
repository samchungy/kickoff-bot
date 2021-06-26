import {PostKickoffEvent} from 'domain/events';
import {KickoffBlockId, KickoffMetadata, KickoffValues} from 'domain/kickoff-modal';
import {SlackViewValues} from 'domain/slack';
import {invokeAsync} from 'infrastructure/lambdaInterface';
import {logger} from 'lib';

const urlPattern = new RegExp('^(https?:\\/\\/)?' // Protocol
+ '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // Domain name
+ '((\\d{1,3}\\.){3}\\d{1,3}))' // OR ip (v4) address
+ '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // Port and path
+ '(\\?[;&a-z\\d%_.~+=-]*)?' // Query string
+ '(\\#[-a-z\\d_]*)?$', 'i'); // Fragment locator

const extractMetadata = (metadata: string): KickoffMetadata => JSON.parse(metadata) as KickoffMetadata;

const extractValues = (values: SlackViewValues<KickoffBlockId, KickoffBlockId>) => Object.values(values).reduce((extractedValues, action) => {
  // There is only one anyway
  Object.entries(action).forEach(([actionId, blockValue]) => {
    switch (actionId as KickoffBlockId) {
      case 'channelId': {
        extractedValues[actionId as KickoffBlockId] = blockValue.selected_conversation as string;
        break;
      }

      case 'date': {
        extractedValues[actionId as KickoffBlockId] = blockValue.selected_date as string;
        break;
      }

      case 'time': {
        extractedValues[actionId as KickoffBlockId] = blockValue.selected_time as string;
        break;
      }

      case 'zoom':
      case 'description': {
        extractedValues[actionId as KickoffBlockId] = blockValue.value as string;
        break;
      }

      default: {
        logger.warn(actionId, 'Unexpected view value');
        break;
      }
    }
  });
  return extractedValues;
}, {} as KickoffValues);

const verifyValues = (values: KickoffValues) => Object.entries(values).reduce((errors, [key, value]) => {
  switch (key as KickoffBlockId) {
    case 'zoom': {
      if (!urlPattern.test(value)) {
        errors[key as KickoffBlockId] = 'Please enter a valid URL';
      }

      break;
    }

    default: {
      break;
    }
  }

  return errors;
}, {} as KickoffValues);

const submitKickoffModal = async (values: SlackViewValues<KickoffBlockId, KickoffBlockId>, teamId: string, viewId: string, userId: string, metadata: string) => {
  const extractedMetadata = extractMetadata(metadata);
  const extractedValues = extractValues(values);
  const errors = verifyValues(extractedValues);
  if (Object.keys(errors).length > 0) {
    return JSON.stringify({
      response_action: 'errors',
      errors,
    });
  }

  const payload: PostKickoffEvent = {
    ...extractedValues,
    ...extractedMetadata,
    teamId,
    viewId,
    userId,
  };

  await invokeAsync('post-kickoff', {...payload});
};

export {
  submitKickoffModal,
};
