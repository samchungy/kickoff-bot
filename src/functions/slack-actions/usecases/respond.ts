import {post} from 'infrastructure/http-gateway';

const respond = async (responseUrl: string, text: string) => await post(responseUrl, {
  text,
  response_type: 'ephemeral',
  replace_original: false,
});

export {respond};
