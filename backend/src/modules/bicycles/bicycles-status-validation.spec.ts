import { BadRequestException } from '@nestjs/common';
import { BicyclesService } from './bicycles.service';
import { BicycleStatus } from '../../entities/bicycle.entity';

describe('BicyclesService - Status Transition Validation', () => {
  let service: BicyclesService;
  let mockBicycleModel: any;
  let mockUserModel: any;

  beforeEach(() => {
    mockBicycleModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    mockUserModel = {
      findByIdAndUpdate: jest.fn(),
      findById: jest.fn(),
    };

    service = new BicyclesService(
      mockBicycleModel as any,
      mockUserModel as any,
    );
  });

  describe('validateStatusTransition', () => {
    describe('INVALID transitions (should throw)', () => {
      it('should prevent SOLD -> ACTIVE transition (fraud prevention)', () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.SOLD,
            BicycleStatus.ACTIVE,
          );
        }).toThrow(BadRequestException);
      });

      it('should prevent SOLD -> RESERVED transition', () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.SOLD,
            BicycleStatus.RESERVED,
          );
        }).toThrow(BadRequestException);
      });

      it('should prevent HIDDEN -> ACTIVE transition', () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.HIDDEN,
            BicycleStatus.ACTIVE,
          );
        }).toThrow(BadRequestException);
      });

      it('should prevent REJECTED -> ACTIVE transition', () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.REJECTED,
            BicycleStatus.ACTIVE,
          );
        }).toThrow(BadRequestException);
      });
    });

    describe('VALID transitions (should NOT throw)', () => {
      it('should allow DRAFT -> ACTIVE (seller submission)', () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.DRAFT,
            BicycleStatus.ACTIVE,
          );
        }).not.toThrow();
      });

      it('should allow DRAFT -> PENDING_REVIEW (submission for approval)', () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.DRAFT,
            BicycleStatus.PENDING_REVIEW,
          );
        }).not.toThrow();
      });

      it('should allow ACTIVE -> RESERVED (purchase initiated)', () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.ACTIVE,
            BicycleStatus.RESERVED,
          );
        }).not.toThrow();
      });

      it('should allow RESERVED -> SOLD (purchase confirmed)', () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.RESERVED,
            BicycleStatus.SOLD,
          );
        }).not.toThrow();
      });

      it('should allow ACTIVE -> HIDDEN (seller delists)', () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.ACTIVE,
            BicycleStatus.HIDDEN,
          );
        }).not.toThrow();
      });

      it('should allow SOLD -> DRAFT (return received, needs reinspection)', () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.SOLD,
            BicycleStatus.DRAFT,
          );
        }).not.toThrow();
      });

      it('should allow RESERVED -> ACTIVE (transaction cancelled)', () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.RESERVED,
            BicycleStatus.ACTIVE,
          );
        }).not.toThrow();
      });

      it('should allow PENDING_REVIEW -> ACTIVE (admin approval)', () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.PENDING_REVIEW,
            BicycleStatus.ACTIVE,
          );
        }).not.toThrow();
      });

      it('should allow PENDING_REVIEW -> REJECTED (admin rejection)', () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.PENDING_REVIEW,
            BicycleStatus.REJECTED,
          );
        }).not.toThrow();
      });
    });
  });

  describe('updateStatusSafely', () => {
    it('should successfully update status with valid transition', async () => {
      const bicycleId = 'bike-123';
      const mockBicycle = {
        _id: bicycleId,
        status: BicycleStatus.DRAFT,
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      mockBicycleModel.findById.mockResolvedValue(mockBicycle);

      const result = await service.updateStatusSafely(
        bicycleId,
        BicycleStatus.ACTIVE,
      );

      expect(mockBicycle.status).toBe(BicycleStatus.ACTIVE);
      expect(mockBicycle.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error with invalid transition', async () => {
      const bicycleId = 'bike-123';
      const mockBicycle = {
        _id: bicycleId,
        status: BicycleStatus.SOLD,
        save: jest.fn(),
      };

      mockBicycleModel.findById.mockResolvedValue(mockBicycle);

      await expect(
        service.updateStatusSafely(bicycleId, BicycleStatus.ACTIVE),
      ).rejects.toThrow(BadRequestException);

      expect(mockBicycle.save).not.toHaveBeenCalled();
    });

    it('should throw error if bicycle not found', async () => {
      const bicycleId = 'bike-123';
      mockBicycleModel.findById.mockResolvedValue(null);

      await expect(
        service.updateStatusSafely(bicycleId, BicycleStatus.ACTIVE),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update the updatedAt timestamp', async () => {
      const bicycleId = 'bike-123';
      const beforeTime = new Date();
      const mockBicycle = {
        _id: bicycleId,
        status: BicycleStatus.DRAFT,
        updatedAt: new Date('2026-01-01'),
        save: jest.fn().mockResolvedValue(true),
      };

      mockBicycleModel.findById.mockResolvedValue(mockBicycle);

      await service.updateStatusSafely(bicycleId, BicycleStatus.ACTIVE);

      expect(mockBicycle.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
    });
  });

  describe('Real-world scenarios', () => {
    describe('Scenario 1: Normal purchase flow', () => {
      it('should allow ACTIVE -> RESERVED -> SOLD', async () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.ACTIVE,
            BicycleStatus.RESERVED,
          );
        }).not.toThrow();

        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.RESERVED,
            BicycleStatus.SOLD,
          );
        }).not.toThrow();
      });
    });

    describe('Scenario 2: Purchase cancellation', () => {
      it('should allow ACTIVE -> RESERVED -> ACTIVE (buyer cancels)', async () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.ACTIVE,
            BicycleStatus.RESERVED,
          );
        }).not.toThrow();

        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.RESERVED,
            BicycleStatus.ACTIVE,
          );
        }).not.toThrow();
      });
    });

    describe('Scenario 3: Dispute with return (BUG FIX)', () => {
      it('should allow ACTIVE -> RESERVED -> SOLD -> DRAFT -> ACTIVE', async () => {
        // Step 1: Initial listing
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.DRAFT,
            BicycleStatus.ACTIVE,
          );
        }).not.toThrow();

        // Step 2: Purchase
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.ACTIVE,
            BicycleStatus.RESERVED,
          );
        }).not.toThrow();

        // Step 3: Confirm purchase
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.RESERVED,
            BicycleStatus.SOLD,
          );
        }).not.toThrow();

        // Step 4: Dispute with return (FIXED BEHAVIOR)
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.SOLD,
            BicycleStatus.DRAFT,
          );
        }).not.toThrow();

        // Step 5: Seller reinspects and re-lists
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.DRAFT,
            BicycleStatus.ACTIVE,
          );
        }).not.toThrow();

        // Step 6: New purchase
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.ACTIVE,
            BicycleStatus.RESERVED,
          );
        }).not.toThrow();

        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.RESERVED,
            BicycleStatus.SOLD,
          );
        }).not.toThrow();
      });

      it('should PREVENT immediate direct re-listing after return', async () => {
        // This is the bug that was fixed:
        // After dispute return, bicycle should NOT go directly to ACTIVE

        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.SOLD,
            BicycleStatus.ACTIVE,
          );
        }).toThrow(); // This would be caught by validation
      });
    });

    describe('Scenario 4: Admin-initiated moderation', () => {
      it('should allow ACTIVE -> HIDDEN (seller delistings)', async () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.ACTIVE,
            BicycleStatus.HIDDEN,
          );
        }).not.toThrow();
      });

      it('should allow PENDING_REVIEW -> REJECTED (failed inspection)', async () => {
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.PENDING_REVIEW,
            BicycleStatus.REJECTED,
          );
        }).not.toThrow();
      });

      it('should allow ACTIVE -> PENDING_REVIEW (re-inspection)', async () => {
        // Not in invalid list, so should not throw
        expect(() => {
          service.validateStatusTransition(
            BicycleStatus.ACTIVE,
            BicycleStatus.PENDING_REVIEW,
          );
        }).not.toThrow();
      });
    });
  });
});
