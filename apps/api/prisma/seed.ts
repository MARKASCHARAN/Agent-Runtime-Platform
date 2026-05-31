import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.agentRecord.deleteMany();
  await prisma.agentRole.deleteMany();
  await prisma.agentIdentity.deleteMany();
  await prisma.policySet.deleteMany();

  await prisma.policySet.create({
    data: {
      id: '33a1847a-311f-4c72-9c3b-a9f0066db4d5',
      name: 'Default Financial Policy',
      projectId: 'proj_123',
      rules: {
        combine: 'first-match',
        defaultOutcome: 'ALLOW',
        rules: [
          {
            id: 'rule-1',
            name: 'Block Large Transfers',
            actionIntent: 'transfer_funds',
            effect: 'REQUIRE_APPROVAL',
            conditions: [
              { field: 'amount', operator: 'gt', value: 10000 },
            ],
          },
        ],
      },
    },
  });

  const supportRole = await prisma.agentRole.create({
    data: {
      name: 'Support Agent',
      allowedIntents: 'read_ticket,reply_ticket',
      projectId: 'proj_123',
    },
  });

  const financeRole = await prisma.agentRole.create({
    data: {
      name: 'Financial Agent',
      allowedIntents: 'transfer_funds,read_balance',
      projectId: 'proj_123',
    },
  });

  const identity1 = await prisma.agentIdentity.create({
    data: {
      clientId: 'agent_finance_01',
      hashedSecret: 'dummy_hash',
      scopes: '*',
      projectId: 'proj_123',
    },
  });

  const identity2 = await prisma.agentIdentity.create({
    data: {
      clientId: 'agent_support_02',
      hashedSecret: 'dummy_hash',
      scopes: '*',
      projectId: 'proj_123',
    },
  });

  await prisma.agentRecord.create({
    data: {
      name: 'AutoFinance-v1',
      description: 'Handles autonomous wire transfers',
      roleId: financeRole.id,
      agentIdentityId: identity1.id,
      projectId: 'proj_123',
    },
  });

  await prisma.agentRecord.create({
    data: {
      name: 'Zendesk-ReplyBot',
      description: 'Drafts responses to customer tickets',
      roleId: supportRole.id,
      agentIdentityId: identity2.id,
      projectId: 'proj_123',
    },
  });

  await prisma.mcpRegistry.deleteMany();

  await prisma.mcpRegistry.create({
    data: {
      name: 'transfer_funds',
      publisher: 'Enterprise Core Banking',
      schemaHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // Sha256 mock
      projectId: 'proj_123',
    },
  });

  await prisma.mcpRegistry.create({
    data: {
      name: 'read_balance',
      publisher: 'Enterprise Core Banking',
      schemaHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // Sha256 mock
      projectId: 'proj_123',
    },
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
