export type Results = {
    categories: any;
    category_scores: any;
};

export type ModerationResponse = {
    id: String;
    model: String;
    results: Array<Results>;
};