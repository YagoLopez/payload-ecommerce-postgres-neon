import { describe, it, expect } from 'vitest';
import { Rating } from '../../../src/domain/Rating';

describe('Rating', () => {
  it('should create a valid rating', () => {
    const rating = new Rating(5, 'Excellent', new Date());
    expect(rating.value).toBe(5);
    expect(rating.comment).toBe('Excellent');
  });

  it('should throw an error for a rating value greater than 5', () => {
    expect(() => new Rating(6, 'Too high', new Date())).toThrow(
      'Rating value must be between 1 and 5.'
    );
  });

  it('should throw an error for a rating value less than 1', () => {
    expect(() => new Rating(0, 'Too low', new Date())).toThrow(
      'Rating value must be between 1 and 5.'
    );
  });
});
