import axios from 'axios';

const client = axios.create({timeout: 1000});

const post = async (url: string, data: Record<string, unknown>) => await client.post(url, data);

export {post};
