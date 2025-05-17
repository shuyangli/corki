import type { WineRecommendationRequest, WineRecommendationStreamCallback } from './types';
import log from 'loglevel';
import axios, { type AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class WineRecommendationAPI {
    private static async createFormData(request: WineRecommendationRequest): Promise<FormData> {
        const formData = new FormData();
        formData.append('prompt', request.prompt);

        if (request.images) {
            request.images.forEach((image) => {
                formData.append('images', image);
            });
        }

        return formData;
    }

    public static async getRecommendation(
        request: WineRecommendationRequest,
        onChunk: WineRecommendationStreamCallback
    ): Promise<void> {
        const formData = await this.createFormData(request);

        log.info(`[${new Date().toISOString()}] Issuing requests`);
        const response: AxiosResponse<ReadableStream> = await axios.post(`${API_BASE_URL}/api/recommend`, formData, {
            responseType: 'stream',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            adapter: 'fetch',
        });

        if (response.status !== 200) {
            log.error(`HTTP error! status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        if (!response.data) {
            log.error('No data received');
            throw new Error('No data received');
        }

        const reader = response.data.getReader();
        if (!reader) {
            log.error('No reader available');
            throw new Error('No reader available');
        }

        const decoder = new TextDecoder("utf-8");

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const decodedValue = decoder.decode(value);
            onChunk({ content: decodedValue, done: false });
        }
        log.info(`[${new Date().toISOString()}] Done`);
    }
}