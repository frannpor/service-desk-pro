# ServiceDesk Pro - Database Schema

## Entity Relationship Diagram

\`\`\`mermaid
erDiagram
    User {
        string id PK
        string email UK
        string name
        UserRole role
        datetime created_at
        datetime updated_at
    }
    
    Category {
        string id PK
        string name UK
        string description
        boolean is_active
        int first_response_sla
        int resolution_sla
        json custom_fields
        datetime created_at
        datetime updated_at
    }
    
    Ticket {
        string id PK
        string title
        string description
        TicketStatus status
        TicketPriority priority
        json custom_field_values
        SLAStatus sla_status
        datetime first_response_due
        datetime resolution_due
        datetime first_response_at
        datetime resolved_at
        datetime created_at
        datetime updated_at
        string requester_id FK
        string agent_id FK
        string category_id FK
    }
    
    Comment {
        string id PK
        string content
        boolean is_internal
        datetime created_at
        datetime updated_at
        string ticket_id FK
        string author_id FK
    }
    
    AuditLog {
        string id PK
        AuditAction action
        string description
        json old_value
        json new_value
        datetime created_at
        string ticket_id FK
        string user_id FK
    }
    
    User ||--o{ Ticket : "creates (requester)"
    User ||--o{ Ticket : "assigned to (agent)"
    User ||--o{ Comment : "authors"
    User ||--o{ AuditLog : "performs action"
    
    Category ||--o{ Ticket : "categorizes"
    
    Ticket ||--o{ Comment : "has comments"
    Ticket ||--o{ AuditLog : "has audit trail"
\`\`\`

## Enums

### UserRole
- `REQUESTER`: Regular employees who create tickets
- `AGENT`: Support team members who resolve tickets  
- `MANAGER`: Supervisors with full system access

### TicketStatus
- `OPEN`: Newly created, awaiting agent assignment
- `IN_PROGRESS`: Agent actively working on ticket
- `WAITING_FOR_CUSTOMER`: Pending requester response
- `WAITING_FOR_AGENT`: Pending agent response
- `RESOLVED`: Solution provided, awaiting confirmation
- `CLOSED`: Ticket completed and closed

### TicketPriority
- `LOW`: Non-urgent issues
- `MEDIUM`: Standard priority (default)
- `HIGH`: Important issues requiring faster response
- `CRITICAL`: System-down or blocking issues

### SLAStatus
- `ON_TIME`: More than 25% of SLA time remaining
- `AT_RISK`: Less than 25% of SLA time remaining
- `BREACHED`: Past the SLA deadline

### AuditAction
- `CREATED`: Ticket creation
- `UPDATED`: Field modifications
- `STATUS_CHANGED`: Status transitions
- `ASSIGNED`: Agent assignment changes
- `COMMENTED`: Comment additions
- `RESOLVED`: Ticket resolution
- `CLOSED`: Ticket closure

## Key Design Decisions

### 1. Custom Fields Storage
- **Approach**: JSON columns for flexibility
- **Rationale**: Allows dynamic field definitions without schema changes
- **Trade-offs**: Less queryable but more flexible than EAV pattern

### 2. SLA Tracking
- **Approach**: Store calculated due dates in ticket table
- **Rationale**: Fast queries, consistent performance
- **Alternative**: Calculate on-demand (slower but always accurate)

### 3. Audit Trail
- **Approach**: Separate audit_logs table with JSON old/new values
- **Rationale**: Complete change history without bloating main tables
- **Benefits**: Supports compliance and debugging

### 4. Comment System
- **Approach**: Single comments table with is_internal flag
- **Rationale**: Simpler than separate internal/external tables
- **Security**: Role-based filtering in application layer

## Indexes for Performance

\`\`\`sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Ticket queries (most important)
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_requester ON tickets(requester_id);
CREATE INDEX idx_tickets_agent ON tickets(agent_id);
CREATE INDEX idx_tickets_category ON tickets(category_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);

-- SLA monitoring
CREATE INDEX idx_tickets_sla_status ON tickets(sla_status);
CREATE INDEX idx_tickets_first_response_due ON tickets(first_response_due);
CREATE INDEX idx_tickets_resolution_due ON tickets(resolution_due);

-- Dashboard queries
CREATE INDEX idx_tickets_status_created ON tickets(status, created_at);
CREATE INDEX idx_tickets_agent_status ON tickets(agent_id, status);

-- Comment queries
CREATE INDEX idx_comments_ticket ON comments(ticket_id);
CREATE INDEX idx_comments_author ON comments(author_id);

-- Audit queries
CREATE INDEX idx_audit_logs_ticket ON audit_logs(ticket_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
\`\`\`

## Data Integrity Rules

### Constraints
1. **Email Uniqueness**: Users must have unique email addresses
2. **Category Names**: Category names must be unique
3. **Required Relationships**: Tickets must have requester and category
4. **Status Transitions**: Enforced in application layer
5. **SLA Dates**: first_response_due and resolution_due must be future dates

### Cascading Rules
- **User Deletion**: Soft delete (set inactive) to preserve audit trail
- **Category Deletion**: Soft delete (set inactive) to preserve ticket history
- **Ticket Deletion**: Cascade delete comments and audit logs
- **Comment Deletion**: Preserve in audit log

## Seed Data Structure

### Default Categories
1. **Hardware Issues** (4h response, 24h resolution)
2. **Software Problems** (2h response, 8h resolution)  
3. **Access Requests** (1h response, 4h resolution)
4. **General Inquiry** (8h response, 48h resolution)

### Test Users
- **Manager**: admin@company.com
- **Agents**: agent1@company.com, agent2@company.com
- **Requesters**: user1@company.com, user2@company.com, user3@company.com

### Sample Tickets
- Mix of statuses and priorities
- Various categories and custom field values
- Comments and audit trail entries
- SLA compliance examples (on-time, at-risk, breached)
