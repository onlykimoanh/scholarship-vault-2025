import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useApplicationStore } from '../store/useApplicationStore';
import { ApplicationType, Stage, GrantedBy, TimelineStatus, Region } from '../types';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import CSVImportModal from '../components/CSVImportModal';

interface FormData {
  type: ApplicationType;
  scholarshipName?: string;
  grantedBy?: GrantedBy;
  programName?: string;
  school?: string;
  country: string;
  region: Region;
  link?: string;
  programLink?: string;
  requirementLink?: string;
  applicationOpen: string;
  deadline: string;
  stage: Stage;
  timelineStatus: TimelineStatus;
  notes: string;
}

const FormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addApplication, updateApplication, applications } = useApplicationStore();
  
  const [applicationType, setApplicationType] = useState<ApplicationType>('scholarship');
  const [showCSVImport, setShowCSVImport] = useState(false);
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      type: 'scholarship',
      stage: 'To Apply',
      timelineStatus: 'EST',
      region: 'Europe',
      applicationOpen: new Date().toISOString().split('T')[0],
      deadline: '',
      notes: '',
    }
  });

  const watchedType = watch('type');

  useEffect(() => {
    setApplicationType(watchedType);
  }, [watchedType]);

  useEffect(() => {
    if (id) {
      const application = applications.find(app => app.id === id);
      if (application) {
        const formData: FormData = {
          type: application.type,
          country: application.country,
          region: application.region,
          applicationOpen: application.applicationOpen.split('T')[0],
          deadline: application.deadline.split('T')[0],
          stage: application.stage,
          timelineStatus: application.timelineStatus,
          notes: application.notes,
        };

        if (application.type === 'scholarship') {
          formData.scholarshipName = application.scholarshipName;
          formData.grantedBy = application.grantedBy;
          formData.link = application.link;
        } else {
          formData.programName = application.programName;
          formData.school = application.school;
          formData.programLink = application.programLink;
          formData.requirementLink = application.requirementLink;
        }

        reset(formData);
        setApplicationType(application.type);
      }
    }
  }, [id, applications, reset]);

  const onSubmit = (data: FormData) => {
    const baseData = {
      type: data.type,
      country: data.country,
      region: data.region,
      applicationOpen: data.applicationOpen,
      deadline: data.deadline,
      stage: data.stage,
      timelineStatus: data.timelineStatus,
      notes: data.notes,
    };

    if (data.type === 'scholarship') {
      const scholarshipData = {
        ...baseData,
        scholarshipName: data.scholarshipName!,
        grantedBy: data.grantedBy!,
        link: data.link || '',
      };

      if (id) {
        updateApplication(id, scholarshipData);
      } else {
        addApplication(scholarshipData as any);
      }
    } else {
      const admissionData = {
        ...baseData,
        programName: data.programName!,
        school: data.school!,
        programLink: data.programLink || '',
        requirementLink: data.requirementLink || '',
      };

      if (id) {
        updateApplication(id, admissionData);
      } else {
        addApplication(admissionData as any);
      }
    }

    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-8 relative">
        <button
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors absolute left-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 flex-1 text-center">
          {id ? 'Edit Application' : 'Add New Application'}
        </h1>
        {!id && (
          <button
            onClick={() => setShowCSVImport(true)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors absolute right-0"
          >
            <Upload className="h-4 w-4" />
            <span className="text-sm">Import CSV</span>
          </button>
        )}
      </div>

      {/* CSV Import Modal */}
      <CSVImportModal 
        isOpen={showCSVImport} 
        onClose={() => setShowCSVImport(false)} 
      />

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
        {/* Application Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Application Type
          </label>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden w-fit">
            <button
              type="button"
              onClick={() => {
                reset({ ...watch(), type: 'scholarship' });
              }}
              className={`px-4 py-2 text-sm transition-colors ${
                applicationType === 'scholarship'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Scholarship
            </button>
            <button
              type="button"
              onClick={() => {
                reset({ ...watch(), type: 'admission' });
              }}
              className={`px-4 py-2 text-sm transition-colors border-l border-gray-200 ${
                applicationType === 'admission'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Admission
            </button>
          </div>
          <input type="hidden" {...register('type', { required: true })} defaultValue={applicationType} />
        </div>

        {/* Scholarship Fields */}
        {applicationType === 'scholarship' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scholarship Name *
              </label>
              <input
                type="text"
                {...register('scholarshipName', { required: applicationType === 'scholarship' })}
                className="input-field"
                placeholder="Enter scholarship name"
              />
              {errors.scholarshipName && (
                <p className="text-red-500 text-sm mt-1">Scholarship name is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Granted by *
              </label>
              <select
                {...register('grantedBy', { required: applicationType === 'scholarship' })}
                className="input-field"
              >
                <option value="">Select...</option>
                <option value="University">University</option>
                <option value="Government">Government</option>
                <option value="Both">Both</option>
              </select>
              {errors.grantedBy && (
                <p className="text-red-500 text-sm mt-1">Please select who grants this scholarship</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link
              </label>
              <input
                type="url"
                {...register('link')}
                className="input-field"
                placeholder="https://..."
              />
            </div>
          </>
        )}

        {/* Admission Fields */}
        {applicationType === 'admission' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Name *
              </label>
              <input
                type="text"
                {...register('programName', { required: applicationType === 'admission' })}
                className="input-field"
                placeholder="Enter program name"
              />
              {errors.programName && (
                <p className="text-red-500 text-sm mt-1">Program name is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School *
              </label>
              <input
                type="text"
                {...register('school', { required: applicationType === 'admission' })}
                className="input-field"
                placeholder="Enter school/university name"
              />
              {errors.school && (
                <p className="text-red-500 text-sm mt-1">School is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Link
              </label>
              <input
                type="url"
                {...register('programLink')}
                className="input-field"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirement Link
              </label>
              <input
                type="url"
                {...register('requirementLink')}
                className="input-field"
                placeholder="https://..."
              />
            </div>
          </>
        )}

        {/* Common Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <select
            {...register('country', { required: true })}
            className="input-field"
          >
            <option value="">Select country...</option>
            <option value="Many">🌍 Many</option>
            <option value="Australia">🇦🇺 Australia</option>
            <option value="Austria">🇦🇹 Austria</option>
            <option value="Belgium">🇧🇪 Belgium</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="China">🇨🇳 China</option>
            <option value="Czech Republic">🇨🇿 Czech Republic</option>
            <option value="Denmark">🇩🇰 Denmark</option>
            <option value="Estonia">🇪🇪 Estonia</option>
            <option value="Finland">🇫🇮 Finland</option>
            <option value="France">🇫🇷 France</option>
            <option value="Germany">🇩🇪 Germany</option>
            <option value="Hong Kong">🇭🇰 Hong Kong</option>
            <option value="Hungary">🇭🇺 Hungary</option>
            <option value="Iceland">🇮🇸 Iceland</option>
            <option value="Ireland">🇮🇪 Ireland</option>
            <option value="Italy">🇮🇹 Italy</option>
            <option value="Japan">🇯🇵 Japan</option>
            <option value="Latvia">🇱🇻 Latvia</option>
            <option value="Lithuania">🇱🇹 Lithuania</option>
            <option value="Luxembourg">🇱🇺 Luxembourg</option>
            <option value="Netherlands">🇳🇱 Netherlands</option>
            <option value="New Zealand">🇳🇿 New Zealand</option>
            <option value="Norway">🇳🇴 Norway</option>
            <option value="Poland">🇵🇱 Poland</option>
            <option value="Portugal">🇵🇹 Portugal</option>
            <option value="Singapore">🇸🇬 Singapore</option>
            <option value="Slovakia">🇸🇰 Slovakia</option>
            <option value="Slovenia">🇸🇮 Slovenia</option>
            <option value="South Korea">🇰🇷 South Korea</option>
            <option value="Spain">🇪🇸 Spain</option>
            <option value="Sweden">🇸🇪 Sweden</option>
            <option value="Switzerland">🇨🇭 Switzerland</option>
            <option value="Taiwan">🇹🇼 Taiwan</option>
            <option value="UK">🇬🇧 United Kingdom</option>
            <option value="USA">🇺🇸 United States</option>
          </select>
          {errors.country && (
            <p className="text-red-500 text-sm mt-1">Country is required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Region *
          </label>
          <select
            {...register('region', { required: true })}
            className="input-field"
          >
            <option value="Europe">🌍 Europe</option>
            <option value="North America">🌎 North America</option>
            <option value="Asia">🌏 Asia</option>
            <option value="Oceania">🌏 Oceania</option>
            <option value="Middle East">🌍 Middle East</option>
            <option value="Africa">🌍 Africa</option>
            <option value="South America">🌎 South America</option>
          </select>
          {errors.region && (
            <p className="text-red-500 text-sm mt-1">Region is required</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Open *
            </label>
            <input
              type="date"
              {...register('applicationOpen', { required: true })}
              className="input-field"
            />
            {errors.applicationOpen && (
              <p className="text-red-500 text-sm mt-1">Application open date is required</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline *
            </label>
            <input
              type="date"
              {...register('deadline', { required: true })}
              className="input-field"
            />
            {errors.deadline && (
              <p className="text-red-500 text-sm mt-1">Deadline is required</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeline Status *
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="EST"
                {...register('timelineStatus', { required: true })}
                className="text-yellow-500 focus:ring-yellow-500"
              />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                EST
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="CON"
                {...register('timelineStatus', { required: true })}
                className="text-green-500 focus:ring-green-500"
              />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                CON
              </span>
            </label>
          </div>
          {errors.timelineStatus && (
            <p className="text-red-500 text-sm mt-1">Timeline status is required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stage *
          </label>
          <select
            {...register('stage', { required: true })}
            className="input-field"
          >
            <option value="To Apply">To Apply</option>
            <option value="In Progress">In Progress</option>
            <option value="Submitted">Submitted</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            className="input-field resize-none"
            placeholder="Add any additional notes..."
          />
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{id ? 'Update' : 'Save'} Application</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormPage; 