import { PrismaClient, UserRole, TicketStatus, TicketPriority } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create users
  const hashedPassword = await hash("password123", 12)

  const manager = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      email: "admin@company.com",
      name: "Admin Manager",
      role: UserRole.MANAGER,
      password: hashedPassword,
    },
  })

  const agent1 = await prisma.user.upsert({
    where: { email: "agent1@company.com" },
    update: {},
    create: {
      email: "agent1@company.com",
      name: "John Agent",
      role: UserRole.AGENT,
      password: hashedPassword,
    },
  })

  const agent2 = await prisma.user.upsert({
    where: { email: "agent2@company.com" },
    update: {},
    create: {
      email: "agent2@company.com",
      name: "Jane Agent",
      role: UserRole.AGENT,
      password: hashedPassword,
    },
  })

  const user1 = await prisma.user.upsert({
    where: { email: "user1@company.com" },
    update: {},
    create: {
      email: "user1@company.com",
      name: "Alice Requester",
      role: UserRole.REQUESTER,
      password: hashedPassword,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: "user2@company.com" },
    update: {},
    create: {
      email: "user2@company.com",
      name: "Bob Requester",
      role: UserRole.REQUESTER,
      password: hashedPassword,
    },
  })

  // Create categories
  const hardwareCategory = await prisma.category.upsert({
    where: { name: "Hardware Issues" },
    update: {},
    create: {
      name: "Hardware Issues",
      description: "Problems with physical equipment",
      firstResponseSLA: 240, // 4 hours
      resolutionSLA: 1440, // 24 hours
      customFields: [
        {
          id: "device_type",
          name: "Device Type",
          type: "select",
          required: true,
          options: ["Laptop", "Desktop", "Monitor", "Printer", "Other"],
        },
        {
          id: "serial_number",
          name: "Serial Number",
          type: "text",
          required: false,
        },
      ],
    },
  })

  const softwareCategory = await prisma.category.upsert({
    where: { name: "Software Problems" },
    update: {},
    create: {
      name: "Software Problems",
      description: "Issues with applications and software",
      firstResponseSLA: 120, // 2 hours
      resolutionSLA: 480, // 8 hours
      customFields: [
        {
          id: "application",
          name: "Application",
          type: "text",
          required: true,
        },
        {
          id: "error_message",
          name: "Error Message",
          type: "textarea",
          required: false,
        },
      ],
    },
  })

  const accessCategory = await prisma.category.upsert({
    where: { name: "Access Requests" },
    update: {},
    create: {
      name: "Access Requests",
      description: "Requests for system access and permissions",
      firstResponseSLA: 60, // 1 hour
      resolutionSLA: 240, // 4 hours
      customFields: [
        {
          id: "system_name",
          name: "System Name",
          type: "text",
          required: true,
        },
        {
          id: "access_level",
          name: "Access Level",
          type: "select",
          required: true,
          options: ["Read Only", "Read/Write", "Admin"],
        },
        {
          id: "business_justification",
          name: "Business Justification",
          type: "textarea",
          required: true,
        },
      ],
    },
  })

  // Create sample tickets
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

  await prisma.ticket.create({
    data: {
      title: "Laptop screen flickering",
      description: "My laptop screen has been flickering intermittently for the past few days.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      customFieldValues: {
        device_type: "Laptop",
        serial_number: "LP123456789",
      },
      requesterId: user1.id,
      categoryId: hardwareCategory.id,
      firstResponseDue: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      resolutionDue: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      createdAt: oneHourAgo,
    },
  })

  await prisma.ticket.create({
    data: {
      title: "Cannot access email application",
      description: "Getting authentication error when trying to open Outlook.",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      customFieldValues: {
        application: "Microsoft Outlook",
        error_message: "Authentication failed - please check credentials",
      },
      requesterId: user2.id,
      agentId: agent1.id,
      categoryId: softwareCategory.id,
      firstResponseDue: new Date(twoDaysAgo.getTime() + 2 * 60 * 60 * 1000),
      resolutionDue: new Date(twoDaysAgo.getTime() + 8 * 60 * 60 * 1000),
      firstResponseAt: new Date(twoDaysAgo.getTime() + 30 * 60 * 1000),
      createdAt: twoDaysAgo,
    },
  })

  await prisma.ticket.create({
    data: {
      title: "Need access to GitHub repository",
      description: "I need read/write access to the new project repository for the mobile app.",
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.LOW,
      customFieldValues: {
        system_name: "GitHub - Mobile App Repository",
        access_level: "Read/Write",
        business_justification: "Assigned to mobile development team for new project",
      },
      requesterId: user1.id,
      agentId: agent2.id,
      categoryId: accessCategory.id,
      firstResponseDue: new Date(twoDaysAgo.getTime() + 1 * 60 * 60 * 1000),
      resolutionDue: new Date(twoDaysAgo.getTime() + 4 * 60 * 60 * 1000),
      firstResponseAt: new Date(twoDaysAgo.getTime() + 15 * 60 * 60 * 1000),
      resolvedAt: new Date(twoDaysAgo.getTime() + 2 * 60 * 60 * 1000),
      createdAt: twoDaysAgo,
    },
  })

  console.log("✅ Database seeded successfully!")
  console.log("\n📧 Test accounts created:")
  console.log("Manager: admin@company.com / password123")
  console.log("Agent 1: agent1@company.com / password123")
  console.log("Agent 2: agent2@company.com / password123")
  console.log("User 1: user1@company.com / password123")
  console.log("User 2: user2@company.com / password123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
