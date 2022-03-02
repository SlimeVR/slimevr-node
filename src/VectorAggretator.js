module.exports = class VectorAggregator {
  /**
   * @param {number} components
   */
  constructor(components) {
    this.components = components;
    this.samples = new Array(components).fill(0);
    this.averages = new Array(components).fill(0);
    this.deviances = new Array(components).fill(0);
    this.variance = new Array(components).fill(0);

    this.latestData = new Array(components).fill(0);
  }

  /**
   * @param {number[]} raw
   */
  update(raw) {
    if (raw.length !== this.components) {
      throw new Error(`Expected ${this.components} components, got ${raw.length}`);
    }

    for (let component = 0; component < raw.length; component++) {
      const value = raw[component];

      const previousSamples = this.samples[component];
      const previousAverage = this.averages[component];
      const previousVariance = this.variance[component];

      const samples = previousSamples + 1;

      const average = (previousAverage * samples + value) / (samples + 1);
      const variance = ((samples - 1) * previousVariance + (value - average) * (value - previousAverage)) / samples;
      const deviance = Math.sqrt(variance);

      this.averages[component] = average;
      this.variance[component] = variance;
      this.deviances[component] = deviance;
      this.samples[component] = samples;
    }

    this.latestData = raw;
  }

  toString() {
    const output = [`S: ${this.samples[0].toString().padStart(8, ' ')}`];

    for (let component = 0; component < this.components; component++) {
      output.push(`${component}: ${this.averages[component].toFixed(12).padStart(18, ' ')} ${this.deviances[component].toFixed(12).padStart(18, ' ')}`);
    }

    return output.join(' | ');
  }
};
