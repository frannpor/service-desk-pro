# F3 - SLA Management and Dashboard

## Business Context

### Objective
Provide real-time SLA monitoring, alerting system, and executive dashboard for support operations.

### Actors
- **Manager**: Views dashboard, configures SLA rules, receives alerts
- **Agent**: Sees SLA status on tickets, receives notifications for at-risk tickets

## Technical Specification

### SLA Calculation Strategy

#### On-Write Approach (Recommended)
- Calculate SLA dates when ticket is created/updated
- Store calculated dates in database
- Use background jobs for periodic recalculation
- Pros: Fast queries, consistent performance
- Cons: More complex update logic

#### SLA Status Logic
\`\`\`typescript
enum SLAStatus {
  ON_TIME = 'ON_TIME',           // > 25% time remaining
  AT_RISK = 'AT_RISK',           // 0-25% time remaining
  BREACHED = 'BREACHED'          // Past due date
}

function calculateSLAStatus(dueDate: Date, now: Date, createdAt: Date): SLAStatus {
  const totalTime = dueDate.getTime() - createdAt.getTime();
  const remainingTime = dueDate.getTime() - now.getTime();
  
  if (remainingTime < 0) return SLAStatus.BREACHED;
  if (remainingTime / totalTime < 0.25) return SLAStatus.AT_RISK;
  return SLAStatus.ON_TIME;
}
\`\`\`

### Dashboard KPIs

#### Core Metrics
1. **Ticket Volume**: Created in last 7/30 days
2. **SLA Compliance**: % of tickets meeting first response/resolution SLA
3. **Average Response Time**: Mean time to first response
4. **Average Resolution Time**: Mean time to resolution
5. **Backlog Size**: Open tickets by age
6. **Agent Performance**: Individual SLA compliance rates

#### API Contract
\`\`\`typescript
// GET /api/dashboard/metrics
Response: {
  period: '7d' | '30d';
  metrics: {
    ticketVolume: {
      current: number;
      previous: number;
      change: number; // percentage
    };
    slaCompliance: {
      firstResponse: number; // percentage
      resolution: number; // percentage
    };
    averageTimes: {
      firstResponse: number; // minutes
      resolution: number; // minutes
    };
    backlog: {
      total: number;
      byAge: {
        '0-1d': number;
        '1-3d': number;
        '3-7d': number;
        '7d+': number;
      };
    };
  };
}
\`\`\`

### Alert System

#### Alert Triggers
1. **SLA Breach**: Immediate alert when SLA is breached
2. **At Risk**: Alert when ticket enters at-risk status
3. **High Volume**: Alert when ticket creation exceeds threshold
4. **Agent Overload**: Alert when agent has too many assigned tickets

#### Alert Delivery
- In-app notifications
- Email notifications (optional)
- Dashboard highlighting

### Real-time Updates

#### WebSocket Events
\`\`\`typescript
interface SLAUpdateEvent {
  type: 'SLA_STATUS_CHANGED';
  ticketId: string;
  oldStatus: SLAStatus;
  newStatus: SLAStatus;
  dueDate: Date;
}

interface MetricsUpdateEvent {
  type: 'METRICS_UPDATED';
  metrics: DashboardMetrics;
}
\`\`\`

## Implementation Plan

### Phase 1: SLA Engine
1. Implement SLA calculation logic
2. Create background job for SLA updates
3. Add SLA status to ticket queries
4. Build alert generation system

### Phase 2: Dashboard
1. Create metrics calculation queries
2. Build dashboard API endpoints
3. Implement dashboard UI components
4. Add real-time updates

### Phase 3: Alerting
1. Implement alert rules engine
2. Create notification system
3. Add alert management UI
4. Email notification integration

### Database Optimization

#### Indexes
\`\`\`sql
-- SLA queries
CREATE INDEX idx_tickets_sla_status ON tickets(sla_status, first_response_due);
CREATE INDEX idx_tickets_resolution_due ON tickets(resolution_due, status);

-- Dashboard queries
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_status_created ON tickets(status, created_at);
CREATE INDEX idx_tickets_agent_status ON tickets(agent_id, status);
\`\`\`

#### Materialized Views (Optional)
\`\`\`sql
CREATE MATERIALIZED VIEW daily_metrics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as tickets_created,
  AVG(EXTRACT(EPOCH FROM (first_response_at - created_at))/60) as avg_first_response_minutes,
  COUNT(CASE WHEN sla_status = 'BREACHED' THEN 1 END) as breached_count
FROM tickets
GROUP BY DATE(created_at);
\`\`\`

## Testing Strategy

### Performance Tests
1. **SLA Calculation**: Test with large datasets
2. **Dashboard Queries**: Verify sub-second response times
3. **Real-time Updates**: Test WebSocket performance
4. **Background Jobs**: Verify SLA updates don't impact performance

### Business Logic Tests
1. **SLA Accuracy**: Verify calculations match business rules
2. **Alert Triggers**: Test all alert conditions
3. **Metrics Accuracy**: Validate dashboard calculations
4. **Edge Cases**: Timezone handling, business hours

## Acceptance Criteria

✅ **SLA Management**
- [ ] SLA dates calculated correctly at ticket creation
- [ ] SLA status updated in real-time
- [ ] Business hours considered in calculations
- [ ] Historical SLA data preserved

✅ **Dashboard**
- [ ] All KPIs display accurate data
- [ ] Dashboard loads in < 2 seconds
- [ ] Real-time updates work correctly
- [ ] Responsive design for mobile/desktop

✅ **Alerting**
- [ ] Alerts triggered for all defined conditions
- [ ] Managers receive timely notifications
- [ ] Alert history is maintained
- [ ] False positive rate < 5%

✅ **Performance**
- [ ] Dashboard queries execute in < 500ms
- [ ] SLA calculations don't impact ticket operations
- [ ] System handles 1000+ concurrent users
- [ ] Background jobs complete within SLA windows
