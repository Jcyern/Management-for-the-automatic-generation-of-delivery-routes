var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable } from "@nestjs/common";
import { OBSERVE_OPTIONS } from "../observe.constants.js";
let TraceSamplerService = class TraceSamplerService {
    options;
    constructor(options) {
        this.options = options;
    }
    shouldCapture(protocol, attributes) {
        if (!this.options.tracesSampleRate) {
            return true; // Always capture if sample rate is not set
        }
        if (typeof this.options.tracesSampleRate === "number") {
            if (this.options.tracesSampleRate >= 1) {
                return true; // Capture all traces if sample rate is 100%
            }
            return Math.random() < this.options.tracesSampleRate; // Randomly capture traces based on sample rate
        }
        return this.options.tracesSampleRate(protocol, attributes);
    }
};
TraceSamplerService = __decorate([
    Injectable(),
    __param(0, Inject(OBSERVE_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], TraceSamplerService);
export { TraceSamplerService };
