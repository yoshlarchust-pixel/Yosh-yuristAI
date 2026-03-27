import { AnalyticsEvent } from "../types";

class AnalyticsService {
  private events: AnalyticsEvent[] = [];

  constructor() {
    const saved = localStorage.getItem('adolat_analytics');
    if (saved) {
      try {
        this.events = JSON.parse(saved);
      } catch (e) {
        this.events = [];
      }
    }
  }

  track(feature: AnalyticsEvent['feature'], action: string, metadata?: any) {
    const event: AnalyticsEvent = {
      feature,
      action,
      timestamp: Date.now(),
      metadata,
    };
    this.events.push(event);
    this.save();
    
    // In a real app, this would send to Google Analytics or a backend
    console.log(`[Analytics] ${feature}:${action}`, metadata);
    
    // Example: if window.gtag exists
    if ((window as any).gtag) {
      (window as any).gtag('event', `${feature}_${action}`, metadata);
    }
  }

  getStats() {
    const stats = {
      totalRequests: this.events.length,
      byFeature: {
        chat: this.events.filter(e => e.feature === 'chat').length,
        analysis: this.events.filter(e => e.feature === 'analysis').length,
        generation: this.events.filter(e => e.feature === 'generation').length,
        voice: this.events.filter(e => e.feature === 'voice').length,
      },
      activeUsers: 1, // Simplified for this demo
    };
    return stats;
  }

  private save() {
    localStorage.setItem('adolat_analytics', JSON.stringify(this.events.slice(-1000))); // Keep last 1000
  }
}

export const analyticsService = new AnalyticsService();
