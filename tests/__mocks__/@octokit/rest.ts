// Mock for @octokit/rest
export class Octokit {
  constructor(options?: any) {
    // Mock constructor
  }

  actions = {
    getRepoPublicKey: jest.fn(() => Promise.resolve({
      data: {
        key: 'mock-public-key',
        key_id: 'mock-key-id'
      }
    })),
    createOrUpdateRepoSecret: jest.fn(() => Promise.resolve()),
    listRepoSecrets: jest.fn(() => Promise.resolve({
      data: {
        secrets: []
      }
    })),
    deleteRepoSecret: jest.fn(() => Promise.resolve())
  };

  repos = {
    get: jest.fn(() => Promise.resolve({
      data: {
        name: 'mock-repo',
        full_name: 'mock-owner/mock-repo'
      }
    })),
    createForAuthenticatedUser: jest.fn(() => Promise.resolve({
      data: {
        name: 'mock-repo',
        full_name: 'mock-owner/mock-repo'
      }
    }))
  };
}

export default { Octokit };
