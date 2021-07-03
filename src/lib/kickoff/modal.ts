import {KickoffBlockId, KickoffMetadata} from 'domain/kickoff-modal';
import {SlackView} from 'domain/slack';
import {openModal, updateModal} from 'infrastructure/slack-interface';

const openEmptyKickoffModal = async (triggerId: string): Promise<string> => {
  const view: SlackView<undefined, undefined> = {
    callback_id: 'kickoff',
    title: {
      type: 'plain_text',
      text: 'Create a Kickoff',
    },
    type: 'modal',
    close: {
      type: 'plain_text',
      text: 'Cancel',
    },
    blocks: [{
      type: 'section',
      text: {
        type: 'plain_text',
        text: 'Loading...',
      },
    }],
  };

  const response = await openModal(triggerId, view);
  return response.view?.id as string;
};

const updateKickoffModal = async (values: {
  viewId: string
  metadata: KickoffMetadata
  timezone: string
  initialDate: string
  initialTime: string
  initialChannel?: string
  initialDescription?: string
  initialZoom?: string
}) => {
  const view: SlackView<KickoffBlockId, KickoffBlockId> = {
    callback_id: 'kickoff',
    private_metadata: JSON.stringify(values.metadata),
    title: {
      type: 'plain_text',
      text: 'Create a Kickoff',
    },
    type: 'modal',
    submit: {
      type: 'plain_text',
      text: 'Submit',
    },
    close: {
      type: 'plain_text',
      text: 'Cancel',
    },
    blocks: [
      {
        block_id: 'channelId',
        type: 'input',
        label: {
          type: 'plain_text',
          text: 'Channel',
        },
        element: {
          type: 'conversations_select',
          default_to_current_conversation: true,
          initial_conversation: values.initialChannel,
          filter: {
            include: [
              'private', 'public',
            ],
          },
          placeholder: {
            type: 'plain_text',
            text: 'Select a channel',
            emoji: true,
          },
          action_id: 'channelId',
        },
      },
      {
        block_id: 'description',
        type: 'input',
        label: {
          type: 'plain_text',
          text: 'What are we kicking off?',
        },
        element: {
          type: 'plain_text_input',
          multiline: true,
          action_id: 'description',
          initial_value: values.initialDescription,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `All dates and times are set according to the timezone listed in your Slack profile.\n*Your timezone*: ${values.timezone}`,
          },
        ],
      },
      {
        block_id: 'date',
        type: 'input',
        label: {
          type: 'plain_text',
          text: 'Date',
        },
        element: {
          type: 'datepicker',
          initial_date: values.initialDate,
          placeholder: {
            type: 'plain_text',
            text: 'Select a date',
          },
          action_id: 'date',
        },
      },
      {
        block_id: 'time',
        type: 'input',
        label: {
          type: 'plain_text',
          text: 'Time',
        },
        element: {
          type: 'timepicker',
          initial_time: values.initialTime,
          placeholder: {
            type: 'plain_text',
            text: 'Select time',
          },
          action_id: 'time',
        },
      },
      {
        block_id: 'zoom',
        type: 'input',
        label: {
          type: 'plain_text',
          text: 'Zoom Link',
        },
        element: {
          type: 'plain_text_input',
          action_id: 'zoom',
          initial_value: values.initialZoom,
        },
      },
    ],
  };
  await updateModal(values.viewId, view);
};

export {
  openEmptyKickoffModal,
  updateKickoffModal,
};
