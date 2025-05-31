# 📘 ScholarFlow - Scholarship Timeline Tracker

A beautiful, modern web application to help you track scholarship and university applications with a clean, scrollable timeline interface inspired by Linear's project timeline.

![ScholarFlow Preview](preview.png)

## ✨ Features

### 🎯 Core Features

- **Smart Application Form**: Add scholarship or admission applications with all essential details
- **Beautiful Timeline View**: Visual timeline showing applications sorted by deadline
- **Intelligent Filtering**: Filter by stage, country, and application type
- **Time Tracking**: Shows days/weeks remaining until deadlines with color-coded urgency
- **Weekend Detection**: Highlights when deadlines fall on weekends
- **Past Deadline Handling**: Grays out applications past their deadline
- **Persistent Storage**: All data saved to browser localStorage

### 📝 Application Types

#### Scholarship Applications
- Scholarship Name
- Granted by (University/Government/Both)
- Country
- Application Link
- Application Open Date
- Deadline
- Stage (To Apply, In Progress, Submitted, Done)
- Notes

#### Admission Applications
- Program Name
- School/University
- Country
- Program Link
- Requirements Link
- Application Open Date
- Deadline
- Stage (To Apply, In Progress, Submitted, Done)
- Notes

### 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Responsive Layout**: Works perfectly on desktop and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Color-coded Stages**: Visual badges for application status
- **Urgency Indicators**: Special highlighting for urgent deadlines
- **Today Marker**: Clear indication of current date on timeline

### 🔧 Advanced Features

- **CSV Import/Export**: Bulk import applications and export data
- **Filter & Sort**: Multiple filtering options and sorting by deadline/name
- **Edit & Delete**: Full CRUD operations for all applications
- **Link Management**: Direct links to application pages and requirements
- **Notes System**: Rich text notes for each application

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd scholarflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
# or
yarn build
```

## 📊 CSV Import Format

Create a CSV file with the following columns for bulk import:

```csv
type,name,organization,country,link,applicationOpen,deadline,stage,notes
scholarship,Merit Scholarship,University,USA,https://example.com,2024-01-01,2024-03-15,To Apply,Great opportunity
admission,Computer Science MS,MIT,USA,https://mit.edu,2024-02-01,2024-04-01,In Progress,Top choice
```

### CSV Column Descriptions

- **type**: `scholarship` or `admission`
- **name**: Scholarship name or Program name
- **organization**: Granted by (for scholarships) or School (for admissions)
- **country**: Country where the opportunity is located
- **link**: Application URL or Program URL
- **applicationOpen**: Date when applications open (YYYY-MM-DD)
- **deadline**: Application deadline (YYYY-MM-DD)
- **stage**: `To Apply`, `In Progress`, `Submitted`, or `Done`
- **notes**: Additional information or notes

## 🎨 Customization

### Color Scheme

The application uses a custom color palette defined in `tailwind.config.js`:

- **Primary**: Blue tones for main actions and branding
- **Success**: Green for completed applications
- **Warning**: Orange/yellow for in-progress items
- **Danger**: Red for urgent deadlines and deletions

### Themes

You can easily customize the appearance by modifying the Tailwind configuration and CSS variables in `src/index.css`.

## 🗂️ Project Structure

```
scholarflow/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Layout.tsx      # Main layout with navigation
│   │   └── FormPage.tsx    # Add/Edit application form
│   │   └── TimelinePage.tsx # Main timeline view
│   │   └── store/          # State management
│   │       └── useApplicationStore.ts # Zustand store
│   │   └── types.ts        # TypeScript type definitions
│   │   └── App.tsx         # Main app component
│   │   └── main.tsx        # Application entry point
│   │   └── index.css       # Global styles
│   ├── public/             # Static assets
│   ├── package.json        # Dependencies and scripts
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   ├── tsconfig.json       # TypeScript configuration
│   └── vite.config.ts      # Vite build configuration
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Date Utilities**: date-fns
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Storage**: Browser localStorage

## 📱 Usage Guide

### Adding Your First Application

1. Click "Add Application" in the top navigation
2. Select between "Scholarship" or "Admission"
3. Fill in all required fields (marked with *)
4. Add optional links and notes
5. Click "Save Application"

### Managing Your Timeline

- **View All**: See all applications in chronological order
- **Filter**: Use the Filters button to narrow down by stage, country, or type
- **Edit**: Click the edit icon on any application card
- **Delete**: Click the trash icon to remove an application
- **Track Time**: Color-coded time remaining shows urgency levels

### Understanding Time Indicators

- 🔴 **Red**: Due today or tomorrow (urgent)
- 🟠 **Orange**: Due within a week (urgent)
- 🟡 **Yellow**: Due within 2-4 weeks
- 🔵 **Blue**: Due in over a month
- ⚫ **Gray**: Past deadline

### Using Filters

- **Stage Filter**: Show only applications in specific stages
- **Country Filter**: Focus on opportunities in particular countries
- **Type Filter**: View only scholarships or only admissions
- **Clear All**: Reset all filters

## 🔮 Future Enhancements

- **Email Notifications**: Automated alerts for upcoming deadlines
- **Calendar Integration**: Sync with Google Calendar or Outlook
- **Document Management**: Attach required documents to applications
- **Progress Tracking**: Detailed application progress with checklists
- **Analytics Dashboard**: Statistics and insights about your applications
- **Collaboration**: Share timelines with mentors or advisors
- **Mobile App**: Native iOS and Android applications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Tips & Best Practices

1. **Regular Updates**: Keep your application statuses updated for accurate tracking
2. **Detailed Notes**: Use the notes field to track requirements, contacts, and progress
3. **Early Planning**: Add applications well before deadlines to avoid last-minute stress
4. **Backup Data**: Regularly export your data as CSV for backup
5. **Filter Usage**: Use filters to focus on immediate priorities

## 🐛 Troubleshooting

### Common Issues

**Q: My data disappeared after closing the browser**
A: ScholarFlow uses localStorage which persists across sessions. Check if you're using incognito/private browsing mode.

**Q: CSV import isn't working**
A: Ensure your CSV follows the exact format specified in the documentation and uses UTF-8 encoding.

**Q: Dates are showing incorrectly**
A: Make sure dates are in YYYY-MM-DD format and in your local timezone.

### Getting Help

- Check the [Issues](https://github.com/your-repo/scholarflow/issues) page
- Create a new issue with detailed description and steps to reproduce
- Include browser version and operating system information

---

**Built with ❤️ for students pursuing their academic dreams** 