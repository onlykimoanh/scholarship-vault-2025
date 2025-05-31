export type ApplicationType = 'scholarship' | 'admission';

export type Stage = 'To Apply' | 'In Progress' | 'Submitted' | 'Done';

export type GrantedBy = 'University' | 'Government' | 'Both';

export type TimelineStatus = 'EST' | 'CON';

export type Region = 'Europe' | 'North America' | 'Asia' | 'Oceania' | 'Middle East' | 'Africa' | 'South America';

export interface BaseApplication {
  id: string;
  type: ApplicationType;
  country: string;
  region: Region;
  applicationOpen: string;
  deadline: string;
  stage: Stage;
  timelineStatus: TimelineStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScholarshipApplication extends BaseApplication {
  type: 'scholarship';
  scholarshipName: string;
  grantedBy: GrantedBy;
  link: string;
}

export interface AdmissionApplication extends BaseApplication {
  type: 'admission';
  programName: string;
  school: string;
  programLink: string;
  requirementLink: string;
}

export type Application = ScholarshipApplication | AdmissionApplication;

export interface FilterOptions {
  stage?: Stage[];
  country?: string[];
  type?: ApplicationType[];
}

export interface SortOptions {
  field: 'deadline' | 'createdAt' | 'name';
  direction: 'asc' | 'desc';
}

export interface EmailAlert {
  id: string;
  applicationId: string;
  alertType: 'month' | 'twoWeeks' | 'week' | 'day';
  scheduledDate: string;
  sent: boolean;
}

export interface CSVRow {
  type: string;
  name: string;
  organization: string;
  country: string;
  region?: string;
  link: string;
  applicationOpen: string;
  deadline: string;
  stage: string;
  timelineStatus?: string;
  notes: string;
} 