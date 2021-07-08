const config = {
  slack: {
    token: process.env.SLACK_TOKEN || '',
    secret: process.env.SLACK_SIGNING_SECRET || '',
  },
  lambda: {
    opts: {
      endpoint: process.env.LAMBDA_ENDPOINT,
    },
    prefix: process.env.PREFIX || '',
  },
  dynamodb: {
    opts: {
      endpoint: process.env.DYNAMODB_ENDPOINT,
    },
    tableName: process.env.KICKOFF_TABLE || '',
    prefixes: {
      date: 'date-',
    },
  },
};

export {
  config,
};
