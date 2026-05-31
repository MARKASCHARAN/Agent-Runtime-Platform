import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  const guard = new AuthGuard();
  const originalApiKeys = process.env.API_KEYS;

  beforeEach(() => {
    process.env.API_KEYS = 'key-1';
  });

  afterAll(() => {
    process.env.API_KEYS = originalApiKeys;
  });

  it('accepts valid x-api-key and scoped headers', () => {
    const req: Record<string, unknown> = {
      headers: {
        'x-api-key': 'key-1',
        'x-project-id': 'project-1',
        'x-user-role': 'approver',
      },
    };

    const context = {
      switchToHttp: () => ({ getRequest: () => req }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
    expect((req.auth as { projectId: string }).projectId).toBe('project-1');
  });

  it('rejects missing project scope header', () => {
    const req: Record<string, unknown> = {
      headers: {
        'x-api-key': 'key-1',
      },
    };

    const context = {
      switchToHttp: () => ({ getRequest: () => req }),
    } as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(
      'x-project-id header is required',
    );
  });
});
