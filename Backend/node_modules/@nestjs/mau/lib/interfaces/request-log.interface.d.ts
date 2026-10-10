export interface RequestLog {
    type: string;
    timestamp: string;
    clientIp: string;
    processingTime: number;
    statusCode: number;
    receivedBytes: number;
    sentBytes: number;
    method: string;
    url: string;
    httpVersion: string;
}
