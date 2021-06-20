import {APIGatewayEvent} from 'aws-lambda';

interface SlashCommand extends Record<string, unknown> {
  token: string;
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
  user_id: string;
  user_name: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  api_app_id: string;
  enterprise_id?: string;
  enterprise_name?: string;
  // Exists for enterprise installs
  is_enterprise_install?: string; // This should be a boolean, but payload for commands gives string 'true'
}

interface SlashCommandAPIGatewayEvent extends Omit<APIGatewayEvent, 'body'> {
  body: SlashCommand
}

export {
	SlashCommandAPIGatewayEvent,
	SlashCommand,
};
