interface Config {
	slack: {
		token: string,
    secret: string
	},
}

const config: Config = {
	slack: {
		token: process.env.SLACK_TOKEN || '',
		secret: process.env.SLACK_SIGNING_SECRET || '',
	},
};

export {
	config,
	Config,
};
