export enum Level {
	basic = "basic",
	medium = "medium",
	expert = "expert",
}

export enum VoteType {
	positive = "positive",
	negative = "negative",
}

export type QuestionVotes = {
	positive: number;
	negative: number;
};

