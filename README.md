# Bug Hunting Record & Analysis Frontend

A Vue.js frontend application for recording HTTP requests, managing notes, attachments, programs, and endpoints for bug hunting analysis.

## Features

- **Programs Management**: Create, view, edit, and delete bug hunting programs
- **Endpoints Management**: Track and organize API endpoints for testing
- **Requests Analysis**: View and analyze HTTP requests with advanced filtering
- **Notes System**: Add notes to programs, endpoints, and requests
- **Attachments**: Upload and manage files linked to any resource
- **HAR Import**: Import HTTP Archive files to analyze request data
- **Jobs Monitoring**: Track import job progress with auto-refresh

## Tech Stack

- **Framework**: Vue 3 with Options API
- **State Management**: Vuex
- **Routing**: Vue Router
- **Styling**: Bootstrap 5
- **HTTP Client**: Fetch API
- **Build Tool**: Vite

## Prerequisites

- Node.js 16+ and npm
- Backend API server running on `http://localhost:8081`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Authentication

The application uses session-based authentication via cookies. To authenticate:

1. Access the backend's `/start_session` endpoint with your secret parameter:
   ```
   http://localhost:8081/start_session?secret=your_secret_key
   ```

2. Once authenticated, the frontend will automatically include the session cookie in all requests.

## Key Features

### Requests Listing (Most Critical)
- Advanced filtering by program, endpoint, job, and custom SQL
- Search through request data
- Sort by various fields (method, content type, size, latency, URL, sequence)
- Links to related programs and endpoints
- Display of search results from request content

### Programs Management
- Full CRUD operations
- Link to related endpoints and requests
- Notes and attachments support
- Scope and domain management

### Endpoints Management
- HTTP method and URI tracking
- Program association
- Type classification (web/api)
- Notes and attachments support

### Notes System
- Create notes from any resource detail page
- Filter by type and search content
- Edit and delete functionality
- Reference linking back to original resource

### HAR Import
- File validation and size checking
- Background job processing
- Progress monitoring
- Recent imports display

### Jobs Monitoring
- Real-time progress tracking
- Auto-refresh capability
- Job statistics and status indicators
- Import job history

## Project Structure

```
src/
├── components/           # Reusable Vue components
├── config/
│   └── api.js           # API configuration and helpers
├── router/
│   └── index.js         # Vue Router configuration
├── store/
│   └── index.js         # Vuex store
├── views/               # Page components
│   ├── programs/        # Program-related pages
│   ├── endpoints/       # Endpoint-related pages
│   ├── requests/        # Request-related pages
│   ├── notes/           # Note-related pages
│   ├── jobs/            # Job-related pages
│   ├── Home.vue         # Dashboard
│   ├── HARImport.vue    # HAR import page
│   └── Unauthenticated.vue
├── App.vue              # Root component
└── main.js              # Application entry point
```

## API Integration

The frontend integrates with the Bug Hunting Record & Analysis API:

- **Base URL**: `http://localhost:8081`
- **Authentication**: Session-based with HttpOnly cookies
- **Error Handling**: Plain text error messages displayed to users
- **Loading States**: Global loading indicator for all API calls

## UI/UX Guidelines

- **Design**: Minimal, clean, and simple
- **Tables**: Clear and readable with hover effects
- **Forms**: Full-width inputs with proper validation
- **Buttons**: Primary actions on the right-hand side
- **Search**: Full-width search bars
- **Dropdowns**: Filterable suggestions
- **Loading**: Loading states for all API calls
- **Errors**: Clear error message display
- **Confirmations**: Modal confirmations for delete actions

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Guidelines

- Keep JavaScript simple and readable
- Avoid over-engineering
- Modular and maintainable components
- Follow DRY principles
- Use constants for API URLs
- Include comments for API integration

## Browser Support

- Modern browsers supporting ES6+
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Follow the existing code style and structure
2. Test all CRUD operations thoroughly
3. Ensure responsive design works on mobile devices
4. Verify error handling and loading states
5. Update documentation for any new features

## License

This project is part of the Bug Hunting Record & Analysis system.
