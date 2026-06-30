import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockEventRepo: any;
  let mockRegRepo: any;
  let mockWaitlistRepo: any;
  let mockUserRepo: any;

  const today = new Date();
  const futureDate = new Date(today.getTime() + 86400000); // tomorrow
  const pastDate = new Date(today.getTime() - 86400000); // yesterday

  const mockEvents = [
    {
      id: 1,
      title: 'Active Future Event',
      status: 'active',
      date: futureDate,
      location: 'Madrid',
      registrations: [
        { status: 'confirmed' },
        { status: 'confirmed' },
        { status: 'cancelled' },
      ],
    },
    {
      id: 2,
      title: 'Draft Event',
      status: 'draft',
      date: futureDate,
      location: 'Barcelona',
      registrations: [{ status: 'confirmed' }],
    },
  ];

  const mockRegistrations = [
    {
      id: 1,
      status: 'confirmed',
      event: { id: 1, title: 'Future Event', date: futureDate },
    },
    {
      id: 2,
      status: 'confirmed',
      event: { id: 2, title: 'Past Event', date: pastDate },
    },
  ];

  beforeEach(() => {
    mockEventRepo = { find: jest.fn() };
    mockRegRepo = { find: jest.fn(), count: jest.fn() };
    mockWaitlistRepo = { count: jest.fn() };
    mockUserRepo = {};

    service = new DashboardService(
      mockEventRepo,
      mockRegRepo,
      mockWaitlistRepo,
      mockUserRepo,
    );
  });

  describe('getStats', () => {
    it('should return aggregated dashboard stats', async () => {
      mockEventRepo.find.mockResolvedValue(mockEvents);
      mockRegRepo.find.mockResolvedValue(mockRegistrations);
      mockWaitlistRepo.count.mockResolvedValue(0);

      const result = await service.getStats(1);

      // My events stats
      expect(result.myEvents.total).toBe(2);
      expect(result.myEvents.active).toBe(1);
      expect(result.myEvents.draft).toBe(1);
      expect(result.myEvents.totalRegistrations).toBe(3); // 2 confirmed + 1 confirmed (cancelled excluded)
      expect(result.myEvents.upcoming).toHaveLength(1);
      expect(result.myEvents.upcoming[0].title).toBe('Active Future Event');

      // My registrations stats
      expect(result.myRegistrations.total).toBe(2);
      expect(result.myRegistrations.upcoming).toBe(1);
      expect(result.myRegistrations.past).toBe(1);
      expect(result.myRegistrations.waitlisted).toBe(0);
    });

    it('should return empty stats when user has no events', async () => {
      mockEventRepo.find.mockResolvedValue([]);
      mockRegRepo.find.mockResolvedValue([]);
      mockWaitlistRepo.count.mockResolvedValue(0);

      const result = await service.getStats(999);

      expect(result.myEvents.total).toBe(0);
      expect(result.myEvents.active).toBe(0);
      expect(result.myRegistrations.total).toBe(0);
      expect(result.myRegistrations.upcoming).toBe(0);
    });
  });
});
