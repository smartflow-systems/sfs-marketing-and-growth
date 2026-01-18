/**
 * Performance Monitoring Utility
 * Tracks Core Web Vitals and custom performance metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private reportEndpoint = '/api/analytics/performance';

  constructor() {
    if (typeof window === 'undefined') return;

    // Initialize performance observers
    this.observeWebVitals();
    this.observeResourceTiming();
    this.observeLongTasks();
  }

  /**
   * Observe Core Web Vitals (LCP, FID, CLS)
   */
  private observeWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;

          this.recordMetric({
            name: 'LCP',
            value: lastEntry.renderTime || lastEntry.loadTime,
            rating: this.rateLCP(lastEntry.renderTime || lastEntry.loadTime),
            timestamp: Date.now(),
          });
        });

        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric({
              name: 'FID',
              value: entry.processingStart - entry.startTime,
              rating: this.rateFID(entry.processingStart - entry.startTime),
              timestamp: Date.now(),
            });
          });
        });

        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }

          this.recordMetric({
            name: 'CLS',
            value: clsValue,
            rating: this.rateCLS(clsValue),
            timestamp: Date.now(),
          });
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }
    }
  }

  /**
   * Observe resource loading performance
   */
  private observeResourceTiming() {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            // Track slow resources (> 1s)
            if (entry.duration > 1000) {
              console.warn(`Slow resource: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
            }
          });
        });

        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        // Resource timing not supported
      }
    }
  }

  /**
   * Observe long tasks that block the main thread
   */
  private observeLongTasks() {
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);

            this.recordMetric({
              name: 'Long Task',
              value: entry.duration,
              rating: entry.duration > 100 ? 'poor' : 'needs-improvement',
              timestamp: Date.now(),
            });
          });
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long tasks not supported
      }
    }
  }

  /**
   * Record a custom metric
   */
  public recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
    }

    // Batch send metrics to server
    this.batchSendMetrics();
  }

  /**
   * Batch send metrics to prevent too many requests
   */
  private batchSendMetrics = this.debounce(() => {
    if (this.metrics.length === 0) return;

    // Send metrics to server (if endpoint exists)
    fetch(this.reportEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics: this.metrics }),
      keepalive: true,
    }).catch(() => {
      // Silently fail - don't break the app for analytics
    });

    this.metrics = [];
  }, 5000);

  /**
   * Rate LCP (Largest Contentful Paint)
   * Good: < 2.5s, Needs Improvement: 2.5-4s, Poor: > 4s
   */
  private rateLCP(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value < 2500) return 'good';
    if (value < 4000) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Rate FID (First Input Delay)
   * Good: < 100ms, Needs Improvement: 100-300ms, Poor: > 300ms
   */
  private rateFID(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value < 100) return 'good';
    if (value < 300) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Rate CLS (Cumulative Layout Shift)
   * Good: < 0.1, Needs Improvement: 0.1-0.25, Poor: > 0.25
   */
  private rateCLS(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value < 0.1) return 'good';
    if (value < 0.25) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Simple debounce utility
   */
  private debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Get navigation timing metrics
   */
  public getNavigationMetrics() {
    if (!window.performance || !window.performance.timing) return null;

    const timing = window.performance.timing;
    return {
      dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcpConnection: timing.connectEnd - timing.connectStart,
      serverResponse: timing.responseEnd - timing.requestStart,
      domParsing: timing.domComplete - timing.domLoading,
      pageLoad: timing.loadEventEnd - timing.navigationStart,
    };
  }

  /**
   * Track custom user interaction
   */
  public trackInteraction(name: string, duration?: number) {
    this.recordMetric({
      name: `Interaction: ${name}`,
      value: duration || 0,
      rating: duration && duration > 200 ? 'needs-improvement' : 'good',
      timestamp: Date.now(),
    });
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for tracking component render performance
 */
export function usePerformanceTracking(componentName: string) {
  if (typeof window === 'undefined') return;

  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    if (duration > 16) {
      // Longer than 1 frame (16ms)
      performanceMonitor.trackInteraction(`${componentName} render`, duration);
    }
  };
}
