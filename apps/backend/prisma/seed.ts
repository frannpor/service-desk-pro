import { PrismaClient, UserRole, TicketStatus, TicketPriority, SLAStatus, AuditAction } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Clear existing data
  console.log("🧹 Cleaning existing data...")
  await prisma.auditLog.deleteMany({})
  await prisma.comment.deleteMany({})
  await prisma.ticket.deleteMany({})
  await prisma.category.deleteMany({})
  await prisma.user.deleteMany({})

  const hashedPassword = await hash("password123", 12)

  // ==================== CREATE USERS ====================
  console.log("👥 Creating users...")

  const manager = await prisma.user.create({
    data: {
      email: "admin@company.com",
      name: "Sarah Manager",
      role: UserRole.MANAGER,
      password: hashedPassword,
    },
  })

  const agent1 = await prisma.user.create({
    data: {
      email: "agent1@company.com",
      name: "John Agent",
      role: UserRole.AGENT,
      password: hashedPassword,
    },
  })

  const agent2 = await prisma.user.create({
    data: {
      email: "agent2@company.com",
      name: "Jane Smith",
      role: UserRole.AGENT,
      password: hashedPassword,
    },
  })

  const agent3 = await prisma.user.create({
    data: {
      email: "agent3@company.com",
      name: "Mike Wilson",
      role: UserRole.AGENT,
      password: hashedPassword,
    },
  })

  const requester1 = await prisma.user.create({
    data: {
      email: "user1@company.com",
      name: "Alice Johnson",
      role: UserRole.REQUESTER,
      password: hashedPassword,
    },
  })

  const requester2 = await prisma.user.create({
    data: {
      email: "user2@company.com",
      name: "Bob Williams",
      role: UserRole.REQUESTER,
      password: hashedPassword,
    },
  })

  const requester3 = await prisma.user.create({
    data: {
      email: "user3@company.com",
      name: "Carol Davis",
      role: UserRole.REQUESTER,
      password: hashedPassword,
    },
  })

  const requester4 = await prisma.user.create({
    data: {
      email: "user4@company.com",
      name: "David Brown",
      role: UserRole.REQUESTER,
      password: hashedPassword,
    },
  })

  // ==================== CREATE CATEGORIES ====================
  console.log("📁 Creating categories...")

  const hardwareCategory = await prisma.category.create({
    data: {
      name: "Hardware Issues",
      description: "Problems with physical equipment and devices",
      firstResponseSLA: 240, // 4 hours
      resolutionSLA: 1440, // 24 hours
      customFields: [
        {
          id: "device_type",
          name: "Device Type",
          type: "select",
          required: true,
          options: ["Laptop", "Desktop", "Monitor", "Printer", "Phone", "Tablet", "Other"],
        },
        {
          id: "serial_number",
          name: "Serial Number",
          type: "text",
          required: false,
        },
        {
          id: "purchase_date",
          name: "Purchase Date",
          type: "date",
          required: false,
        },
      ],
    },
  })

  const softwareCategory = await prisma.category.create({
    data: {
      name: "Software Problems",
      description: "Issues with applications, software installations, and updates",
      firstResponseSLA: 120, // 2 hours
      resolutionSLA: 480, // 8 hours
      customFields: [
        {
          id: "application",
          name: "Application Name",
          type: "text",
          required: true,
        },
        {
          id: "version",
          name: "Application Version",
          type: "text",
          required: false,
        },
        {
          id: "error_message",
          name: "Error Message",
          type: "textarea",
          required: false,
        },
        {
          id: "screenshot_url",
          name: "Screenshot URL",
          type: "text",
          required: false,
        },
      ],
    },
  })

  const accessCategory = await prisma.category.create({
    data: {
      name: "Access Requests",
      description: "Requests for system access, permissions, and credentials",
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
          options: ["Read Only", "Read/Write", "Admin", "Full Access"],
        },
        {
          id: "business_justification",
          name: "Business Justification",
          type: "textarea",
          required: true,
        },
        {
          id: "manager_approval",
          name: "Manager Email for Approval",
          type: "text",
          required: false,
        },
      ],
    },
  })

  const networkCategory = await prisma.category.create({
    data: {
      name: "Network & Connectivity",
      description: "Internet, VPN, and network connectivity issues",
      firstResponseSLA: 180, // 3 hours
      resolutionSLA: 720, // 12 hours
      customFields: [
        {
          id: "connection_type",
          name: "Connection Type",
          type: "select",
          required: true,
          options: ["WiFi", "Ethernet", "VPN", "Mobile Hotspot"],
        },
        {
          id: "location",
          name: "Physical Location",
          type: "text",
          required: false,
        },
      ],
    },
  })

  const accountCategory = await prisma.category.create({
    data: {
      name: "Account Issues",
      description: "Password resets, account lockouts, and login problems",
      firstResponseSLA: 30, // 30 minutes
      resolutionSLA: 120, // 2 hours
      customFields: [
        {
          id: "account_type",
          name: "Account Type",
          type: "select",
          required: true,
          options: ["Email", "VPN", "CRM", "ERP", "Other"],
        },
        {
          id: "last_successful_login",
          name: "Last Successful Login",
          type: "datetime",
          required: false,
        },
      ],
    },
  })

  // ==================== CREATE TICKETS ====================
  console.log("🎫 Creating tickets...")

  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Ticket 1: OPEN - Hardware issue (requester1)
  const ticket1 = await prisma.ticket.create({
    data: {
      title: "Laptop screen flickering constantly",
      description: "My laptop screen has been flickering intermittently since this morning. It happens randomly and makes it very difficult to work. Sometimes it goes black for a few seconds.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      slaStatus: SLAStatus.ON_TIME,
      customFieldValues: {
        device_type: "Laptop",
        serial_number: "LP-2023-001234",
        purchase_date: "2023-03-15",
      },
      requesterId: requester1.id,
      categoryId: hardwareCategory.id,
      firstResponseDue: new Date(oneHourAgo.getTime() + 4 * 60 * 60 * 1000),
      resolutionDue: new Date(oneHourAgo.getTime() + 24 * 60 * 60 * 1000),
      createdAt: oneHourAgo,
      updatedAt: oneHourAgo,
    },
  })

  await prisma.auditLog.create({
    data: {
      ticketId: ticket1.id,
      userId: requester1.id,
      action: AuditAction.CREATED,
      description: "Ticket created",
      createdAt: oneHourAgo,
    },
  })

  // Ticket 2: IN_PROGRESS - Software issue (requester2, assigned to agent1)
  const ticket2 = await prisma.ticket.create({
    data: {
      title: "Cannot access Outlook - Authentication error",
      description: "Getting 'Authentication failed' error when trying to open Microsoft Outlook. Tried restarting several times but issue persists.",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.CRITICAL,
      slaStatus: SLAStatus.ON_TIME,
      customFieldValues: {
        application: "Microsoft Outlook",
        version: "16.0.5",
        error_message: "Authentication failed - Error code: 0x80040115",
      },
      requesterId: requester2.id,
      agentId: agent1.id,
      categoryId: softwareCategory.id,
      firstResponseDue: new Date(sixHoursAgo.getTime() + 2 * 60 * 60 * 1000),
      resolutionDue: new Date(sixHoursAgo.getTime() + 8 * 60 * 60 * 1000),
      firstResponseAt: new Date(sixHoursAgo.getTime() + 45 * 60 * 1000),
      createdAt: sixHoursAgo,
      updatedAt: twoHoursAgo,
    },
  })

  await prisma.auditLog.createMany({
    data: [
      {
        ticketId: ticket2.id,
        userId: requester2.id,
        action: AuditAction.CREATED,
        description: "Ticket created",
        createdAt: sixHoursAgo,
      },
      {
        ticketId: ticket2.id,
        userId: agent1.id,
        action: AuditAction.ASSIGNED,
        description: "Ticket assigned to John Agent",
        oldValue: JSON.stringify(null),
        newValue: JSON.stringify(agent1.id),
        createdAt: new Date(sixHoursAgo.getTime() + 30 * 60 * 1000),
      },
      {
        ticketId: ticket2.id,
        userId: agent1.id,
        action: AuditAction.STATUS_CHANGED,
        description: "Status changed from OPEN to IN_PROGRESS",
        oldValue: JSON.stringify("OPEN"),
        newValue: JSON.stringify("IN_PROGRESS"),
        createdAt: twoHoursAgo,
      },
    ],
  })

  await prisma.comment.createMany({
    data: [
      {
        ticketId: ticket2.id,
        authorId: agent1.id,
        content: "Hi Bob, I've started looking into this issue. Can you confirm if you can access Outlook on the web version?",
        isInternal: false,
        createdAt: new Date(sixHoursAgo.getTime() + 45 * 60 * 1000),
      },
      {
        ticketId: ticket2.id,
        authorId: requester2.id,
        content: "Yes, the web version works fine. It's only the desktop app that's giving me problems.",
        isInternal: false,
        createdAt: new Date(sixHoursAgo.getTime() + 90 * 60 * 1000),
      },
      {
        ticketId: ticket2.id,
        authorId: agent1.id,
        content: "Internal note: Likely a credential cache issue. Will try clearing the credentials manager.",
        isInternal: true,
        createdAt: twoHoursAgo,
      },
    ],
  })

  // Ticket 3: RESOLVED - Access request (requester1, assigned to agent2)
  const ticket3 = await prisma.ticket.create({
    data: {
      title: "Need access to GitHub repository - Mobile App",
      description: "I need read/write access to the company's new mobile app repository on GitHub. I've been assigned to the mobile development team.",
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.MEDIUM,
      slaStatus: SLAStatus.ON_TIME,
      customFieldValues: {
        system_name: "GitHub - Mobile App Repository",
        access_level: "Read/Write",
        business_justification: "Assigned to mobile development team for Q4 project. Need to contribute code and review pull requests.",
        manager_approval: "manager@company.com",
      },
      requesterId: requester1.id,
      agentId: agent2.id,
      categoryId: accessCategory.id,
      firstResponseDue: new Date(oneDayAgo.getTime() + 1 * 60 * 60 * 1000),
      resolutionDue: new Date(oneDayAgo.getTime() + 4 * 60 * 60 * 1000),
      firstResponseAt: new Date(oneDayAgo.getTime() + 20 * 60 * 1000),
      resolvedAt: new Date(oneDayAgo.getTime() + 2 * 60 * 60 * 1000),
      createdAt: oneDayAgo,
      updatedAt: new Date(oneDayAgo.getTime() + 2 * 60 * 60 * 1000),
    },
  })

  await prisma.comment.createMany({
    data: [
      {
        ticketId: ticket3.id,
        authorId: agent2.id,
        content: "Hi Alice, I've received your request. I'll verify with your manager and set up the access.",
        isInternal: false,
        createdAt: new Date(oneDayAgo.getTime() + 20 * 60 * 1000),
      },
      {
        ticketId: ticket3.id,
        authorId: agent2.id,
        content: "Access has been granted. You should receive an invitation email shortly. Please confirm once you can access the repository.",
        isInternal: false,
        createdAt: new Date(oneDayAgo.getTime() + 100 * 60 * 1000),
      },
      {
        ticketId: ticket3.id,
        authorId: requester1.id,
        content: "Perfect! I can now access the repository. Thank you for the quick turnaround!",
        isInternal: false,
        createdAt: new Date(oneDayAgo.getTime() + 2 * 60 * 60 * 1000),
      },
    ],
  })

  // Ticket 4: WAITING_FOR_CUSTOMER - Network issue (requester3, assigned to agent3)
  const ticket4 = await prisma.ticket.create({
    data: {
      title: "VPN connection keeps dropping",
      description: "My VPN connection disconnects every 10-15 minutes. I have to reconnect manually each time.",
      status: TicketStatus.WAITING_FOR_CUSTOMER,
      priority: TicketPriority.HIGH,
      slaStatus: SLAStatus.ON_TIME,
      customFieldValues: {
        connection_type: "VPN",
        location: "Home Office - Remote",
      },
      requesterId: requester3.id,
      agentId: agent3.id,
      categoryId: networkCategory.id,
      firstResponseDue: new Date(twoDaysAgo.getTime() + 3 * 60 * 60 * 1000),
      resolutionDue: new Date(twoDaysAgo.getTime() + 12 * 60 * 60 * 1000),
      firstResponseAt: new Date(twoDaysAgo.getTime() + 1 * 60 * 60 * 1000),
      createdAt: twoDaysAgo,
      updatedAt: oneDayAgo,
    },
  })

  await prisma.comment.createMany({
    data: [
      {
        ticketId: ticket4.id,
        authorId: agent3.id,
        content: "Hi Carol, I'd like to help you with this. Can you tell me which VPN client you're using and what your internet connection speed is?",
        isInternal: false,
        createdAt: new Date(twoDaysAgo.getTime() + 1 * 60 * 60 * 1000),
      },
    ],
  })

  // Ticket 5: CLOSED - Account issue (requester4, assigned to agent1)
  const ticket5 = await prisma.ticket.create({
    data: {
      title: "Account locked out - Too many failed login attempts",
      description: "My account got locked after I mistyped my password several times. Need it unlocked urgently.",
      status: TicketStatus.CLOSED,
      priority: TicketPriority.CRITICAL,
      slaStatus: SLAStatus.ON_TIME,
      customFieldValues: {
        account_type: "Email",
        last_successful_login: "2024-09-27T08:30:00Z",
      },
      requesterId: requester4.id,
      agentId: agent1.id,
      categoryId: accountCategory.id,
      firstResponseDue: new Date(threeDaysAgo.getTime() + 30 * 60 * 1000),
      resolutionDue: new Date(threeDaysAgo.getTime() + 2 * 60 * 60 * 1000),
      firstResponseAt: new Date(threeDaysAgo.getTime() + 15 * 60 * 1000),
      resolvedAt: new Date(threeDaysAgo.getTime() + 25 * 60 * 1000),
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo,
    },
  })

  await prisma.comment.createMany({
    data: [
      {
        ticketId: ticket5.id,
        authorId: agent1.id,
        content: "Account unlocked. You should be able to log in now. Please reset your password at the next login.",
        isInternal: false,
        createdAt: new Date(threeDaysAgo.getTime() + 15 * 60 * 1000),
      },
      {
        ticketId: ticket5.id,
        authorId: requester4.id,
        content: "Works perfectly now. Thank you!",
        isInternal: false,
        createdAt: new Date(threeDaysAgo.getTime() + 20 * 60 * 1000),
      },
    ],
  })

  // More tickets for requester1 (testing pagination)
  await prisma.ticket.createMany({
    data: [
      {
        title: "Printer not responding",
        description: "Office printer on 3rd floor is not responding to print jobs.",
        status: TicketStatus.OPEN,
        priority: TicketPriority.LOW,
        slaStatus: SLAStatus.ON_TIME,
        customFieldValues: {
          device_type: "Printer",
          serial_number: "PR-2023-5678",
        },
        requesterId: requester1.id,
        categoryId: hardwareCategory.id,
        firstResponseDue: new Date(twoHoursAgo.getTime() + 4 * 60 * 60 * 1000),
        resolutionDue: new Date(twoHoursAgo.getTime() + 24 * 60 * 60 * 1000),
        createdAt: twoHoursAgo,
        updatedAt: twoHoursAgo,
      },
      {
        title: "Excel crashing when opening large files",
        description: "Excel crashes whenever I try to open files larger than 50MB.",
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        slaStatus: SLAStatus.ON_TIME,
        customFieldValues: {
          application: "Microsoft Excel",
          version: "16.0.5",
          error_message: "Application has stopped working",
        },
        requesterId: requester1.id,
        categoryId: softwareCategory.id,
        firstResponseDue: new Date(threeDaysAgo.getTime() + 2 * 60 * 60 * 1000),
        resolutionDue: new Date(threeDaysAgo.getTime() + 8 * 60 * 60 * 1000),
        createdAt: threeDaysAgo,
        updatedAt: threeDaysAgo,
      },
    ],
  })

  // More tickets for requester2
  await prisma.ticket.createMany({
    data: [
      {
        title: "Slow WiFi connection in conference room B",
        description: "WiFi is extremely slow in conference room B. Download speeds are < 1 Mbps.",
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.MEDIUM,
        slaStatus: SLAStatus.ON_TIME,
        customFieldValues: {
          connection_type: "WiFi",
          location: "Conference Room B, 2nd Floor",
        },
        requesterId: requester2.id,
        agentId: agent3.id,
        categoryId: networkCategory.id,
        firstResponseDue: new Date(oneDayAgo.getTime() + 3 * 60 * 60 * 1000),
        resolutionDue: new Date(oneDayAgo.getTime() + 12 * 60 * 60 * 1000),
        firstResponseAt: new Date(oneDayAgo.getTime() + 2 * 60 * 60 * 1000),
        createdAt: oneDayAgo,
        updatedAt: sixHoursAgo,
      },
    ],
  })

  // More tickets for requester3
  await prisma.ticket.createMany({
    data: [
      {
        title: "Need access to Salesforce",
        description: "I need admin access to Salesforce for managing customer data.",
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        slaStatus: SLAStatus.ON_TIME,
        customFieldValues: {
          system_name: "Salesforce CRM",
          access_level: "Admin",
          business_justification: "New role as Sales Operations Manager requires full CRM access",
        },
        requesterId: requester3.id,
        categoryId: accessCategory.id,
        firstResponseDue: new Date(twoHoursAgo.getTime() + 1 * 60 * 60 * 1000),
        resolutionDue: new Date(twoHoursAgo.getTime() + 4 * 60 * 60 * 1000),
        createdAt: twoHoursAgo,
        updatedAt: twoHoursAgo,
      },
      {
        title: "Password reset for ERP system",
        description: "Forgot my ERP password and need it reset urgently.",
        status: TicketStatus.RESOLVED,
        priority: TicketPriority.HIGH,
        slaStatus: SLAStatus.ON_TIME,
        customFieldValues: {
          account_type: "ERP",
        },
        requesterId: requester3.id,
        agentId: agent2.id,
        categoryId: accountCategory.id,
        firstResponseDue: new Date(oneWeekAgo.getTime() + 30 * 60 * 1000),
        resolutionDue: new Date(oneWeekAgo.getTime() + 2 * 60 * 60 * 1000),
        firstResponseAt: new Date(oneWeekAgo.getTime() + 10 * 60 * 1000),
        resolvedAt: new Date(oneWeekAgo.getTime() + 15 * 60 * 1000),
        createdAt: oneWeekAgo,
        updatedAt: oneWeekAgo,
      },
    ],
  })

  // More tickets for requester4
  await prisma.ticket.createMany({
    data: [
      {
        title: "Monitor display issues - colors distorted",
        description: "My monitor is showing distorted colors, especially reds and greens.",
        status: TicketStatus.WAITING_FOR_AGENT,
        priority: TicketPriority.MEDIUM,
        slaStatus: SLAStatus.ON_TIME,
        customFieldValues: {
          device_type: "Monitor",
          serial_number: "MON-2023-9012",
        },
        requesterId: requester4.id,
        agentId: agent1.id,
        categoryId: hardwareCategory.id,
        firstResponseDue: new Date(oneDayAgo.getTime() + 4 * 60 * 60 * 1000),
        resolutionDue: new Date(oneDayAgo.getTime() + 24 * 60 * 60 * 1000),
        firstResponseAt: new Date(oneDayAgo.getTime() + 3 * 60 * 60 * 1000),
        createdAt: oneDayAgo,
        updatedAt: sixHoursAgo,
      },
    ],
  })

  console.log("✅ Database seeded successfully!")
  console.log("\n" + "=".repeat(60))
  console.log("📧 TEST ACCOUNTS")
  console.log("=".repeat(60))
  console.log("\n👔 MANAGER:")
  console.log("   Email: admin@company.com")
  console.log("   Password: password123")
  console.log("   Name: Sarah Manager")
  console.log("\n🛠️  AGENTS:")
  console.log("   1. agent1@company.com / password123 (John Agent)")
  console.log("   2. agent2@company.com / password123 (Jane Smith)")
  console.log("   3. agent3@company.com / password123 (Mike Wilson)")
  console.log("\n👥 REQUESTERS:")
  console.log("   1. user1@company.com / password123 (Alice Johnson)")
  console.log("   2. user2@company.com / password123 (Bob Williams)")
  console.log("   3. user3@company.com / password123 (Carol Davis)")
  console.log("   4. user4@company.com / password123 (David Brown)")
  console.log("\n" + "=".repeat(60))
  console.log("📊 STATISTICS")
  console.log("=".repeat(60))
  console.log(`\n✓ ${await prisma.user.count()} users created`)
  console.log(`✓ ${await prisma.category.count()} categories created`)
  console.log(`✓ ${await prisma.ticket.count()} tickets created`)
  console.log(`✓ ${await prisma.comment.count()} comments created`)
  console.log(`✓ ${await prisma.auditLog.count()} audit logs created`)
  
  console.log("\n📈 TICKET STATUS BREAKDOWN:")
  const statusCount = await prisma.ticket.groupBy({
    by: ["status"],
    _count: true,
  })
  statusCount.forEach((s) => {
    console.log(`   ${s.status}: ${s._count}`)
  })

  console.log("\n" + "=".repeat(60))
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })