type KickoffCallbackId = 'kickoff';

type KickoffBlockId = 'channelId' | 'description' | 'date' | 'time' | 'zoom'

type KickoffValues = Record<KickoffBlockId, string>

interface KickoffMetadata {
  timezone: string
}

export {
  KickoffCallbackId,
  KickoffBlockId,
  KickoffMetadata,
  KickoffValues,
};
