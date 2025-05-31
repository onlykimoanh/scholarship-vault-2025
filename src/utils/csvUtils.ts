import { Application, CSVRow } from '../types';

export const parseCSV = (csvText: string): CSVRow[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const rows: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row as CSVRow);
  }
  
  return rows;
};

export const csvToApplications = (csvRows: CSVRow[]): Application[] => {
  return csvRows.map(row => {
    const baseApplication = {
      id: crypto.randomUUID(),
      type: row.type as 'scholarship' | 'admission',
      country: row.country,
      region: row.region || 'Europe', // Default to Europe if not specified
      applicationOpen: row.applicationOpen,
      deadline: row.deadline,
      stage: row.stage as any,
      timelineStatus: (row.timelineStatus || 'EST') as 'EST' | 'CON', // Default to EST
      notes: row.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (row.type === 'scholarship') {
      return {
        ...baseApplication,
        scholarshipName: row.name,
        grantedBy: row.organization as 'University' | 'Government' | 'Both',
        link: row.link || '',
      } as Application;
    } else {
      return {
        ...baseApplication,
        programName: row.name,
        school: row.organization,
        programLink: row.link || '',
        requirementLink: '', // Not in CSV format
      } as Application;
    }
  });
};

export const applicationsToCSV = (applications: Application[]): string => {
  const headers = ['type', 'name', 'organization', 'country', 'region', 'link', 'applicationOpen', 'deadline', 'stage', 'timelineStatus', 'notes'];
  
  const rows = applications.map(app => {
    return [
      app.type,
      app.type === 'scholarship' ? app.scholarshipName : app.programName,
      app.type === 'scholarship' ? app.grantedBy : app.school,
      app.country,
      app.region,
      app.type === 'scholarship' ? app.link : app.programLink,
      app.applicationOpen.split('T')[0], // Extract date part only
      app.deadline.split('T')[0],
      app.stage,
      app.timelineStatus,
      app.notes.replace(/,/g, ';'), // Replace commas to avoid CSV issues
    ].map(value => `"${value}"`).join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
};

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}; 