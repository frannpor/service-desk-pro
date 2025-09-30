# F1 - Ticket Intake and Category Management

## Business Context

### Objective
Enable requesters to create tickets by selecting predefined categories that automatically configure appropriate fields and SLA expectations.

### Actors
- **Requester**: Creates tickets by selecting categories and filling required fields
- **Manager**: Configures categories, custom fields, and SLA parameters

### User Stories

#### Primary Story
As a **Requester**, I want to create a ticket by selecting a predefined category so that the system requests appropriate information and sets correct SLA expectations.

#### Supporting Story
As a **Manager**, I want to configure categories with custom fields and SLA parameters so that tickets are properly classified and tracked.

## Technical Specification

### Data Model

#### Category Entity
\`\`\`typescript
interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  firstResponseSLA: number; // minutes
  resolutionSLA: number; // minutes
  customFields: CustomField[];
}

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'date';
  required: boolean;
  options?: string[]; // for select/multiselect
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}
\`\`\`

#### Ticket Entity
\`\`\`typescript
interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customFieldValues: Record<string, any>;
  categoryId: string;
  requesterId: string;
  // SLA fields populated from category at creation
  firstResponseDue: Date;
  resolutionDue: Date;
}
\`\`\`

### API Contracts

#### GET /api/categories
\`\`\`typescript
Response: {
  categories: Category[];
}
\`\`\`

#### POST /api/tickets
\`\`\`typescript
Request: {
  title: string;
  description: string;
  categoryId: string;
  customFieldValues: Record<string, any>;
}

Response: {
  ticket: Ticket;
}
\`\`\`

#### POST /api/categories (Manager only)
\`\`\`typescript
Request: {
  name: string;
  description?: string;
  firstResponseSLA: number;
  resolutionSLA: number;
  customFields: CustomField[];
}
\`\`\`

### UI Components

#### Ticket Creation Form
- Category selector (dropdown with descriptions)
- Dynamic field rendering based on selected category
- Real-time validation
- SLA expectation display

#### Category Management (Manager)
- Category CRUD operations
- Custom field builder with drag-and-drop
- SLA configuration with time picker
- Preview of ticket creation form

### Validation Rules

1. **Category Selection**: Required, must be active category
2. **Custom Fields**: Validate according to field configuration
3. **SLA Calculation**: Automatic based on category + creation time
4. **Business Hours**: Consider only business hours for SLA calculation

### Security Considerations

- Only managers can create/edit categories
- Requesters can only view active categories
- Input sanitization for custom field values
- Rate limiting on ticket creation

## Implementation Plan

### Phase 1: Backend Foundation
1. Set up Prisma schema for Category and Ticket entities
2. Implement Category CRUD endpoints
3. Implement Ticket creation endpoint with SLA calculation
4. Add validation middleware

### Phase 2: Frontend Core
1. Create category management interface (Manager)
2. Build dynamic ticket creation form
3. Implement real-time field validation
4. Add SLA expectation display

### Phase 3: Enhancement
1. Add custom field validation rules
2. Implement business hours calculation
3. Add category templates/presets
4. Performance optimization for large category lists

### Testing Strategy

#### Manual Test Cases
1. **Category Creation**: Manager creates category with various field types
2. **Dynamic Form**: Verify fields appear/disappear based on category selection
3. **Validation**: Test required fields, format validation, business rules
4. **SLA Calculation**: Verify correct due dates based on category SLA
5. **Permissions**: Verify role-based access to category management

#### Edge Cases
- Category deleted after ticket creation (should preserve snapshot)
- Invalid custom field values
- Concurrent category modifications
- Large number of custom fields performance

### AI Usage Plan
- Use AI for generating realistic category templates
- AI-assisted validation rule suggestions
- Automated test case generation for custom field combinations
- Code generation for repetitive CRUD operations

## Acceptance Criteria

✅ **Category Management**
- [ ] Managers can create categories with custom fields
- [ ] Categories have configurable SLA parameters
- [ ] Custom fields support multiple types (text, select, date, etc.)
- [ ] Categories can be activated/deactivated

✅ **Ticket Creation**
- [ ] Requesters see only active categories
- [ ] Form dynamically shows fields based on selected category
- [ ] All validations work correctly
- [ ] SLA dates are calculated and displayed

✅ **Data Integrity**
- [ ] Tickets preserve category snapshot at creation time
- [ ] Custom field values are properly stored and retrieved
- [ ] Audit trail for category changes

✅ **User Experience**
- [ ] Intuitive category selection with descriptions
- [ ] Clear validation error messages
- [ ] Responsive design for mobile/desktop
- [ ] Loading states and error handling
