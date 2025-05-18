export interface WineRecommendationRequest {
    prompt: string;
    images: File[];
}

export interface WineRecommendationResponse {
    content: string;
    done: boolean;
}

export type WineRecommendationStreamCallback = (response: WineRecommendationResponse) => void;
